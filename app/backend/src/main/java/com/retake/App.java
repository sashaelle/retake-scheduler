package com.retake;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;

import static spark.Spark.*;

public class App {

  private static final Path STORE_PATH = Paths.get("..", "data", "store.json").normalize();
  private static final ObjectMapper mapper = new ObjectMapper();

  private static Map<String, Object> readStore() {
    try {
      if (!Files.exists(STORE_PATH)) {
        return newStore();
      }
      String raw = Files.readString(STORE_PATH);
      if (raw == null || raw.isBlank()) return newStore();
      return mapper.readValue(raw, new TypeReference<Map<String, Object>>() {});
    } catch (Exception e) {
      return newStore();
    }
  }

  private static void writeStore(Map<String, Object> store) throws IOException {
    Files.createDirectories(STORE_PATH.getParent());
    String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(store);
    Files.writeString(STORE_PATH, json, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
  }

  private static Map<String, Object> newStore() {
    Map<String, Object> store = new HashMap<>();
    store.put("departments", new HashMap<String, Object>());
    return store;
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> getDepartments(Map<String, Object> store) {
    Object depts = store.get("departments");
    if (depts instanceof Map) return (Map<String, Object>) depts;
    Map<String, Object> fresh = new HashMap<>();
    store.put("departments", fresh);
    return fresh;
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> getDeptData(Map<String, Object> store, String dept) {
    Map<String, Object> departments = getDepartments(store);
    Object deptObj = departments.get(dept);
    if (deptObj instanceof Map) return (Map<String, Object>) deptObj;

    Map<String, Object> deptData = new HashMap<>();
    deptData.put("sessions", new ArrayList<Map<String, Object>>());
    deptData.put("bookings", new ArrayList<Map<String, Object>>());
    departments.put(dept, deptData);
    return deptData;
  }

  @SuppressWarnings("unchecked")
  private static List<Map<String, Object>> getSessions(Map<String, Object> deptData) {
    Object sessions = deptData.get("sessions");
    if (sessions instanceof List) return (List<Map<String, Object>>) sessions;

    List<Map<String, Object>> fresh = new ArrayList<>();
    deptData.put("sessions", fresh);
    return fresh;
  }

  @SuppressWarnings("unchecked")
  private static List<Map<String, Object>> getBookings(Map<String, Object> deptData) {
    Object bookings = deptData.get("bookings");
    if (bookings instanceof List) return (List<Map<String, Object>>) bookings;

    List<Map<String, Object>> fresh = new ArrayList<>();
    deptData.put("bookings", fresh);
    return fresh;
  }

  @SuppressWarnings("unchecked")
  private static void ensureSlotIds(List<Map<String, Object>> sessions) {
    for (Map<String, Object> session : sessions) {
      String sessionId = String.valueOf(session.getOrDefault("id", ""));
      Object slotsObj = session.get("slots");
      if (!(slotsObj instanceof List)) continue;

      List<Map<String, Object>> slots = (List<Map<String, Object>>) slotsObj;
      for (Map<String, Object> slot : slots) {
        Object slotId = slot.get("id");
        Object time = slot.get("time");
        if ((slotId == null || String.valueOf(slotId).isBlank()) && time != null && !sessionId.isBlank()) {
          slot.put("id", sessionId + ":" + time);
        }
      }
    }
  }

  private static String cleanLower(String s) {
    if (s == null) return "";
    return s.trim().toLowerCase();
  }

  private static String clean(String s) {
    if (s == null) return "";
    return s.trim();
  }

  public static void main(String[] args) {
    port(8081);

    before((req, res) -> {
      res.header("Access-Control-Allow-Origin", "http://localhost:3000");
      res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type");
    });

    options("/*", (req, res) -> {
      res.status(200);
      return "";
    });

    get("/health", (req, res) -> {
      res.type("application/json");
      return "{\"ok\":true}";
    });

    get("/data", (req, res) -> {
      res.type("application/json");
      String dept = cleanLower(req.queryParams("dept"));

      if (dept.isBlank()) {
        res.status(400);
        return mapper.writeValueAsString(Map.of("error", "Missing ?dept=..."));
      }

      Map<String, Object> store = readStore();
      Map<String, Object> deptData = getDeptData(store, dept);
      List<Map<String, Object>> sessions = getSessions(deptData);
      ensureSlotIds(sessions);

      return mapper.writeValueAsString(Map.of("dept", dept, "sessions", sessions));
    });

    post("/data", (req, res) -> {
      res.type("application/json");

      Map<String, Object> body;
      try {
        body = mapper.readValue(req.body(), new TypeReference<Map<String, Object>>() {});
      } catch (Exception e) {
        res.status(400);
        return mapper.writeValueAsString(Map.of("error", "Invalid JSON body"));
      }

      String dept = cleanLower((String) body.get("dept"));
      String sessionName = clean((String) body.get("sessionName"));
      String date = clean((String) body.get("date"));
      String startTime = clean((String) body.get("startTime"));
      String endTime = clean((String) body.get("endTime"));

      int capacity = 0;
      Object capObj = body.get("capacity");
      if (capObj instanceof Number) capacity = ((Number) capObj).intValue();
      else if (capObj instanceof String) {
        try { capacity = Integer.parseInt(((String) capObj).trim()); } catch (Exception ignored) {}
      }

      Object timesObj = body.get("times");
      List<String> times = new ArrayList<>();
      if (timesObj instanceof List) {
        for (Object t : (List<?>) timesObj) {
          if (t != null && !t.toString().trim().isBlank()) times.add(t.toString().trim());
        }
      }

      if (dept.isBlank() || sessionName.isBlank() || date.isBlank() || capacity < 1 || times.isEmpty()) {
        res.status(400);
        return mapper.writeValueAsString(Map.of(
            "error", "Required: dept, sessionName, date, capacity>=1, times[]"
        ));
      }

      Map<String, Object> store = readStore();
      Map<String, Object> deptData = getDeptData(store, dept);
      List<Map<String, Object>> sessions = getSessions(deptData);

      String sessionId = UUID.randomUUID().toString();

      List<Map<String, Object>> slots = new ArrayList<>();
      for (String t : times) {
        Map<String, Object> slot = new HashMap<>();
        slot.put("id", sessionId + ":" + t);
        slot.put("time", t);
        slot.put("remaining", capacity);
        slots.add(slot);
      }

      Map<String, Object> newSession = new HashMap<>();
      newSession.put("id", sessionId);
      newSession.put("sessionName", sessionName);
      newSession.put("date", date);
      newSession.put("capacity", capacity);
      newSession.put("startTime", startTime);
      newSession.put("endTime", endTime);
      newSession.put("slots", slots);

      sessions.add(0, newSession);

      try {
        writeStore(store);
      } catch (IOException e) {
        res.status(500);
        return mapper.writeValueAsString(Map.of("error", "Failed to write store.json"));
      }

      return mapper.writeValueAsString(Map.of("ok", true, "created", newSession));
    });

    post("/bookings", (req, res) -> {
      res.type("application/json");

      Map<String, Object> body;
      try {
        body = mapper.readValue(req.body(), new TypeReference<Map<String, Object>>() {});
      } catch (Exception e) {
        res.status(400);
        return mapper.writeValueAsString(Map.of("error", "Invalid JSON body"));
      }

      String dept = cleanLower((String) body.getOrDefault("departmentSlug", body.get("dept")));
      String slotId = clean((String) body.get("slotId"));
      String name = clean((String) body.get("name"));
      String email = clean((String) body.get("email"));

      if (dept.isBlank() || slotId.isBlank()) {
        res.status(400);
        return mapper.writeValueAsString(Map.of("error", "Missing dept/slotId"));
      }
      if (name.isBlank() || email.isBlank()) {
        res.status(400);
        return mapper.writeValueAsString(Map.of("error", "Missing name/email"));
      }

      Map<String, Object> store = readStore();
      Map<String, Object> deptData = getDeptData(store, dept);
      List<Map<String, Object>> sessions = getSessions(deptData);
      ensureSlotIds(sessions);

      Map<String, Object> foundSession = null;
      Map<String, Object> foundSlot = null;

      for (Map<String, Object> session : sessions) {
        Object slotsObj = session.get("slots");
        if (!(slotsObj instanceof List)) continue;

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> slots = (List<Map<String, Object>>) slotsObj;
        for (Map<String, Object> slot : slots) {
          String sid = String.valueOf(slot.getOrDefault("id", ""));
          if (sid.equals(slotId)) {
            foundSession = session;
            foundSlot = slot;
            break;
          }
        }
        if (foundSlot != null) break;
      }

      if (foundSlot == null) {
        res.status(404);
        return mapper.writeValueAsString(Map.of("error", "Slot not found"));
      }

      int remaining = 0;
      Object remObj = foundSlot.get("remaining");
      if (remObj instanceof Number) remaining = ((Number) remObj).intValue();
      else {
        try { remaining = Integer.parseInt(String.valueOf(remObj)); } catch (Exception ignored) {}
      }

      if (remaining <= 0) {
        res.status(409);
        return mapper.writeValueAsString(Map.of("error", "Slot is full"));
      }

      foundSlot.put("remaining", remaining - 1);

      List<Map<String, Object>> bookings = getBookings(deptData);

      Map<String, Object> booking = new LinkedHashMap<>();
      booking.put("id", UUID.randomUUID().toString());
      booking.put("createdAt", Instant.now().toString());
      booking.put("dept", dept);
      booking.put("slotId", slotId);
      booking.put("sessionId", foundSession != null ? String.valueOf(foundSession.get("id")) : "");
      booking.put("sessionName", foundSession != null ? String.valueOf(foundSession.get("sessionName")) : "");
      booking.put("date", foundSession != null ? String.valueOf(foundSession.get("date")) : "");
      booking.put("time", String.valueOf(foundSlot.get("time")));
      booking.put("name", name);
      booking.put("email", email);

      booking.put("studentId", clean((String) body.get("studentId")));
      booking.put("courseCode", clean((String) body.get("courseCode")));
      booking.put("instructor", clean((String) body.get("instructor")));
      booking.put("notes", clean((String) body.get("notes")));

      bookings.add(0, booking);

      try {
        writeStore(store);
      } catch (IOException e) {
        res.status(500);
        return mapper.writeValueAsString(Map.of("error", "Failed to write store.json"));
      }

      return mapper.writeValueAsString(Map.of("ok", true));
    });

    System.out.println("Java backend running on http://localhost:8081");
    System.out.println("Using store file: " + STORE_PATH.toAbsolutePath());
  }
}