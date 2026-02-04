"use client"; 

import { useState } from "react"; 

export default function AdminForm({ dept }) {
	const [sessionName, setSessionName] = useState(""); 
	const [date, setDate] = useState("");
	const [capacity, setCapacity] = 