// src/app/boardgame/edit/[id]/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

type Boardgame = {
  _id?: string;
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

export default function EditBoardgamePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string | undefined;

  const { user, token } = useAuth();

  const [form, setForm] = useState<Boardgame>({
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const update = <K extends keyof Boardgame>(key: K, value: Boardgame[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!id) {
      setErr("ไม่พบรหัสบอร์ดเกม (id)");
      setLoading(false);
      return;
    }

    const fetchBoardgame = async () => {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boardgame/${id}`);
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(json?.message || "โหลดข้อมูลบอร์ดเกมไม่สำเร็จ");
        }

        const raw = json?.data ?? json;
        setForm({
          _id: raw._id,
          name: raw.name ?? "",
          description: raw.description ?? "",
          price: Number(raw.price ?? 0),
          players_min: Number(raw.players_min ?? 1),
          players_max: Number(raw.players_max ?? 4),
          duration: Number(raw.duration ?? 60),
          category: raw.category ?? "",
          publisher: raw.publisher ?? "",
          thumbnail: raw.thumbnail ?? "",
        });
      } catch (e: any) {
        console.error("FETCH BOARDGAME ERROR:", e);
        setErr(e.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลบอร์ดเกม");
      } finally {
        setLoading(false);
      }
    };

    fetchBoardgame();
  }, [id]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!token) {
      setErr("กรุณาเข้าสู่ระบบก่อน");
      return;
    }

    setSaving(true);
    setErr(null);
    setSuccess(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boardgame/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: form.price,
          players_min: form.players_min,
          players_max: form.players_max,
          duration: form.duration,
          category: form.category,
          publisher: form.publisher,
          thumbnail: form.thumbnail,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "อัปเดตบอร์ดเกมไม่สำเร็จ");
      }

      setSuccess("บันทึกข้อมูลบอร์ดเกมเรียบร้อยแล้ว");
      router.push("/admin/boardgame");
    } catch (e: any) {
      console.error("UPDATE BOARDGAME ERROR:", e);
      setErr(e.message || "เกิดข้อผิดพลาดขณะบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">กำลังโหลดข้อมูลบอร์ดเกม...</p>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">ไม่พบรหัสบอร์ดเกม</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">
            แก้ไขบอร์ดเกม
          </h1>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
          >
            กลับ
          </button>
        </div>

        {err && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {err}
          </p>
        )}

        {success && (
          <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
            {success}
          </p>
        )}

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-lg shadow-md border px-4 py-6 sm:px-6 space-y-4"
        >
          {/* ชื่อ & หมวดหมู่ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อเกม
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมวดหมู่
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียดเกม
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* ราคา / เวลาเล่น / ผู้เล่น */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ราคา (บาท)
              </label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => update("price", Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ผู้เล่นขั้นต่ำ
              </label>
              <input
                type="number"
                min={1}
                value={form.players_min}
                onChange={(e) =>
                  update("players_min", Number(e.target.value) || 1)
                }
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ผู้เล่นสูงสุด
              </label>
              <input
                type="number"
                min={1}
                value={form.players_max}
                onChange={(e) =>
                  update("players_max", Number(e.target.value) || 1)
                }
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* เวลาเล่น & ผู้จัดทำ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เวลาเล่นโดยเฉลี่ย (นาที)
              </label>
              <input
                type="number"
                min={0}
                value={form.duration}
                onChange={(e) =>
                  update("duration", Number(e.target.value) || 0)
                }
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ผู้จัดทำ / Publisher
              </label>
              <input
                type="text"
                value={form.publisher}
                onChange={(e) => update("publisher", e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Thumbnail URL + Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รูปภาพ (URL)
            </label>
            <input
              type="text"
              value={form.thumbnail}
              onChange={(e) => update("thumbnail", e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {form.thumbnail && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">ตัวอย่างรูป:</p>
                <img
                  src={form.thumbnail}
                  alt="preview"
                  className="w-32 h-32 object-cover rounded-md border"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-blue-600 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
