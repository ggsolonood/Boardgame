"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

type CreateTable = {
  number: string;
  capacity: number;
  image: string; 
};

export default function CreateTablePage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<CreateTable>({
    number: "",
    capacity: 1,
    image: "",
  });

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "admin") {
      router.push("/");
    }
  }, [loading, user, router]);

  const updateText =
    (field: "number" | "image") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };

  const updateNumber =
    (field: "capacity") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setForm((f) => ({
        ...f,
        [field]: v === "" ? 0 : Number(v),
      }));
    };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (!token) {
      setError("คุณยังไม่ได้เข้าสู่ระบบ");
      return;
    }

    if (!form.number.trim()) {
      setError("กรุณากรอกหมายเลขโต๊ะ");
      return;
    }
    if (form.capacity <= 0) {
      setError("จำนวนที่นั่งต้องมากกว่า 0");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/table`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "สร้างโต๊ะไม่สำเร็จ");
      }

      setOk("สร้างโต๊ะสำเร็จแล้ว");
      setForm({
        number: "",
        capacity: 1,
        image: "",
      });

      router.push("/admin/home");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 flex items-center justify-center">
        <p className="text-yellow-400 text-lg font-bold animate-pulse">🏴 กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-10 pt-24">
      <div className="w-full max-w-lg mx-auto px-4 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl shadow-yellow-900/50 rounded-2xl p-6 sm:p-8 border-4 border-yellow-600">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-yellow-400 mb-2" style={{
            textShadow: "3px 3px 0px rgba(0,0,0,0.8), 0 0 30px rgba(250, 204, 21, 0.4)"
          }}>
            🎲 สร้างโต๊ะเกม
          </h1>
          <p className="text-yellow-300 text-sm font-semibold">เพิ่มโต๊ะใหม่เข้าสู่ท่าเรือ</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Table Number */}
          <div>
            <label className="block text-sm font-bold text-yellow-300 mb-2">
              🏷️ หมายเลขโต๊ะ
            </label>
            <input
              type="text"
              value={form.number}
              onChange={updateText("number")}
              className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500"
              placeholder="เช่น T1, A01, VIP-2"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-bold text-yellow-300 mb-2">
              👥 จำนวนที่นั่ง
            </label>
            <input
              type="number"
              value={form.capacity}
              onChange={updateNumber("capacity")}
              className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              min={1}
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-bold text-yellow-300 mb-2">
              🖼️ รูปโต๊ะ (Image URL)
            </label>
            <input
              type="text"
              value={form.image}
              onChange={updateText("image")}
              className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500"
              placeholder="เช่น https://example.com/table.jpg"
            />
            <p className="text-xs text-yellow-400 mt-1">
              💡 ตอนนี้เก็บเป็นลิงก์รูป (URL)
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="text-sm text-yellow-100 bg-red-900/80 border-2 border-red-600 px-4 py-3 rounded-lg font-semibold flex items-center gap-2">
              <span>💀</span>
              {error}
            </div>
          )}

          {ok && (
            <div className="text-sm text-yellow-100 bg-green-900/80 border-2 border-green-600 px-4 py-3 rounded-lg font-semibold flex items-center gap-2">
              <span>✅</span>
              {ok}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-yellow-600">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 rounded-lg border-2 border-yellow-500 bg-slate-800 hover:bg-slate-700 text-yellow-400 text-sm font-bold transition-all duration-200 transform hover:scale-105"
            >
              ← ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white text-sm font-black border-2 border-yellow-400 disabled:opacity-60 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {submitting ? "⏳ กำลังบันทึก..." : "🎲 บันทึกโต๊ะ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}