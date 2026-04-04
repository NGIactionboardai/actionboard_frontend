"use client";

import { useEffect } from "react";

export default function TestClient() {
  console.log("🧪 TestClient RENDER");

  useEffect(() => {
    console.log("🔥 TestClient useEffect RUNNING");
  }, []);

  return <div>Test Client Component</div>;
}