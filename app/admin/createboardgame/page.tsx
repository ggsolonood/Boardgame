// app/boardgame/create/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext"; 

type CreateBoardgame = {
  name: string;
  description: string;
  price: number;
  players_min: number;
  players_max: number;
  duration: number;
  category: string;
  publisher: string;
  thumbnail: string;
};

export default function CreateBoardgamePage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<CreateBoardgame>({
    name: "",
    description: "",
    price: 0,
    players_min: 1,
    players_max: 4,
    duration: 60,
    category: "",
    publisher: "",
    thumbnail: "",
  });

  const [error, setError] = useState<string>("");
  const [ok, setOk] = useState<string>("");
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
    (field: keyof CreateBoardgame) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value as any }));
    };

  const updateNumber =
    (field: keyof CreateBoardgame) =>
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

    if (!form.name.trim() || !form.description.trim()) {
      setError("กรุณากรอกชื่อและคำอธิบายให้ครบ");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boardgame`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "สร้างบอร์ดเกมไม่สำเร็จ");
      }

      setOk("สร้างบอร์ดเกมสำเร็จแล้ว");
      setForm({
        name: "",
        description: "",
        price: 0,
        players_min: 1,
        players_max: 4,
        duration: 60,
        category: "",
        publisher: "",
        thumbnail: "",
      });
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
      <div className="w-full max-w-3xl mx-auto px-4 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl shadow-yellow-900/50 rounded-2xl p-6 sm:p-8 border-4 border-yellow-600">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-yellow-400 mb-2" style={{
            textShadow: "3px 3px 0px rgba(0,0,0,0.8), 0 0 30px rgba(250, 204, 21, 0.4)"
          }}>
            👑 สร้างสมบัติเกม
          </h1>
          <p className="text-yellow-300 text-sm font-semibold">เพิ่มบอร์ดเกมใหม่เข้าสู่ท่าเรือ</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Name + Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">
                🎮 ชื่อบอร์ดเกม
              </label>
              <input
                type="text"
                value={form.name}
                onChange={updateText("name")}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500"
                placeholder="เช่น Catan, Azul, Dixit"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">
                💰 ราคา (บาท)
              </label>
              <input
                type="number"
                value={form.price}
                onChange={updateNumber("price")}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                min={0}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-yellow-300 mb-2">
              📖 คำอธิบาย
            </label>
            <textarea
              value={form.description}
              onChange={updateText("description")}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500 resize-none"
              placeholder="อธิบายเกมแบบคร่าว ๆ ว่าเล่นยังไง / ฟีลลิ่งประมาณไหน"
            />
          </div>

          {/* Players + Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">
                👥 ผู้เล่นขั้นต่ำ
              </label>
              <input
                type="number"
                value={form.players_min}
                onChange={updateNumber("players_min")}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                min={1}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">
                👥 ผู้เล่นสูงสุด
              </label>
              <input
                type="number"
                value={form.players_max}
                onChange={updateNumber("players_max")}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                min={1}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">
                ⏱️ ระยะเวลา (นาที)
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={updateNumber("duration")}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                min={0}
              />
            </div>
          </div>

          {/* Category + Publisher */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">
                🏷️ หมวดหมู่
              </label>
              <input
                type="text"
                value={form.category}
                onChange={updateText("category")}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500"
                placeholder="เช่น Party, Strategy, Family"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">
                🏢 ผู้จัดทำ
              </label>
              <input
                type="text"
                value={form.publisher}
                onChange={updateText("publisher")}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500"
                placeholder="เช่น Kosmos, CMON, Repos"
              />
            </div>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-bold text-yellow-300 mb-2">
              🖼️ URL รูปปก
            </label>
            <input
              type="text"
              value={form.thumbnail}
              onChange={updateText("thumbnail")}
              className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500"
              placeholder="เช่น https://.../image.jpg"
            />
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
              {submitting ? "⏳ กำลังบันทึก..." : "💎 บันทึกสมบัติ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}