// src/app/profile/page.tsx
"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <p>กำลังตรวจสอบสิทธิ์...</p>;
  }

  return (
    <div>
      <h1 className="text-xl mb-2">โปรไฟล์</h1>
      <p>Email: {user.email}</p>
      <p>User ID: {user.userId}</p>
      <button
        onClick={logout}
        className="border px-4 py-2 mt-4"
      >
        Logout
      </button>
    </div>
  );
}
