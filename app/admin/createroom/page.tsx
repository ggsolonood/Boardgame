"use client";

import { FormEvent, useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

type CreateRoomForm = {
  name: string;
  capacity: number;
  status: string;
  selectedTables: string[];
  price: number;
  image: string;
};

type TableOption = {
  _id: string;
  number: string;
  capacity: number;
  image?: string;
};

export default function CreateRoomPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<CreateRoomForm>({
    name: "",
    capacity: 1,
    status: "available",
    selectedTables: [],
    price: 0,
    image: "",
  });

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [tables, setTables] = useState<TableOption[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tablesError, setTablesError] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role?.toLowerCase() !== "admin") {
      router.push("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role?.toLowerCase() !== "admin") return;

    const fetchTables = async () => {
      setTablesLoading(true);
      setTablesError("");

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/table`);
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || "โหลดรายการโต๊ะไม่สำเร็จ");
        }

        const data: TableOption[] = await res.json();
        setTables(data);
      } catch (err: any) {
        setTablesError(err.message || "เกิดข้อผิดพลาดในการโหลดโต๊ะ");
      } finally {
        setTablesLoading(false);
      }
    };

    fetchTables();
  }, [loading, user]);

  const updateText =
    (field: "name" | "status" | "image") =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };

  const updateNumber =
    (field: "capacity" | "price") => (e: ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setForm((f) => ({
        ...f,
        [field]: v === "" ? 0 : Number(v),
      }));
    };

  const toggleTable = (id: string) => {
    setForm((f) => {
      const exists = f.selectedTables.includes(id);
      if (exists) {
        return {
          ...f,
          selectedTables: f.selectedTables.filter((t) => t !== id),
        };
      }
      return {
        ...f,
        selectedTables: [...f.selectedTables, id],
      };
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (!token) {
      setError("คุณยังไม่ได้เข้าสู่ระบบ");
      return;
    }

    if (!form.name.trim()) {
      setError("กรุณากรอกชื่อห้อง");
      return;
    }
    if (form.capacity <= 0) {
      setError("จำนวนความจุต้องมากกว่า 0");
      return;
    }
    if (form.price < 0) {
      setError("ราคาต้องเป็นเลขศูนย์หรือมากกว่า");
      return;
    }
    if (form.selectedTables.length === 0) {
      setError("กรุณาเลือกโต๊ะอย่างน้อย 1 ตัว");
      return;
    }

    const payload = {
      name: form.name,
      capacity: form.capacity,
      status: form.status,
      tables: form.selectedTables,
      price: form.price,
      image: form.image,
    };

    setSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "สร้างห้องไม่สำเร็จ");
      }

      setOk("สร้างห้องสำเร็จแล้ว");
      setForm({
        name: "",
        capacity: 1,
        status: "available",
        selectedTables: [],
        price: 0,
        image: "",
      });
      router.push("/admin/home");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user || user.role?.toLowerCase() !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 flex items-center justify-center">
        <p className="text-yellow-400 text-lg font-bold animate-pulse">🏴 กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-10 pt-24">
      <div className="w-full max-w-2xl mx-auto px-4 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl shadow-yellow-900/50 rounded-2xl p-6 sm:p-8 border-4 border-yellow-600">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-yellow-400 mb-2" style={{
            textShadow: "3px 3px 0px rgba(0,0,0,0.8), 0 0 30px rgba(250, 204, 21, 0.4)"
          }}>
            🏰 สร้างห้องสมบัติ
          </h1>
          <p className="text-yellow-300 text-sm font-semibold">เพิ่มห้องใหม่เข้าสู่ท่าเรือ</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-yellow-300 mb-2">
              🏠 ชื่อห้อง
            </label>
            <input
              type="text"
              value={form.name}
              onChange={updateText("name")}
              className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500"
              placeholder="เช่น Room A, VIP Room"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-bold text-yellow-300 mb-2">
              👥 ความจุ (คน)
            </label>
            <input
              type="number"
              value={form.capacity}
              onChange={updateNumber("capacity")}
              className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              min={1}
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-yellow-300 mb-2">
              💰 ราคา (บาท/ชั่วโมง)
            </label>
            <input
              type="number"
              value={form.price}
              onChange={updateNumber("price")}
              className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              min={0}
            />
            <p className="text-xs text-yellow-400 mt-1">
              💡 ใส่ราคาตามหน่วยที่กำหนด (เช่น บาท/ชั่วโมง หรือ บาท/ครั้ง)
            </p>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-bold text-yellow-300 mb-2">
              🖼️ รูปภาพห้อง (Image URL)
            </label>
            <input
              type="text"
              value={form.image}
              onChange={updateText("image")}
              className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500"
              placeholder="เช่น https://..."
            />
            <p className="text-xs text-yellow-400 mt-1">
              💡 ตอนนี้เก็บเป็นลิงก์รูป (URL)
            </p>
          </div>

          {/* Select Tables */}
          <div>
            <label className="block text-sm font-bold text-yellow-300 mb-2">
              🎲 เลือกโต๊ะในห้องนี้
            </label>

            {tablesLoading && (
              <p className="text-xs text-yellow-400 animate-pulse">⏳ กำลังโหลดรายการโต๊ะ...</p>
            )}

            {tablesError && (
              <p className="text-xs text-red-400 bg-red-900/50 border border-red-600 px-3 py-2 rounded">{tablesError}</p>
            )}

            {!tablesLoading && !tablesError && tables.length === 0 && (
              <p className="text-xs text-yellow-400">
                ⚠️ ยังไม่มีโต๊ะในระบบ กรุณาไปสร้างโต๊ะก่อน
              </p>
            )}

            <div className="mt-2 max-h-72 overflow-y-auto border-2 border-yellow-500 rounded-lg p-4 space-y-3 bg-slate-800/50">
              {tables.map((t) => (
                <label
                  key={t._id}
                  className="flex items-center gap-3 text-sm text-yellow-200 p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer border border-yellow-500/30"
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-yellow-500 accent-yellow-400 cursor-pointer"
                    checked={form.selectedTables.includes(t._id)}
                    onChange={() => toggleTable(t._id)}
                  />
                  <div className="flex items-center gap-3 flex-1">
                    {t.image && (
                      <img
                        src={t.image}
                        alt={t.number}
                        className="h-14 w-14 rounded-md object-cover border-2 border-yellow-400"
                      />
                    )}
                    <div>
                      <div className="font-bold text-yellow-300">🎲 โต๊ะ {t.number}</div>
                      <div className="text-xs text-yellow-400">
                        👥 รองรับ {t.capacity} คน
                      </div>
                    </div>
                  </div>
                  <div className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                    {form.selectedTables.includes(t._id) ? "✅ เลือก" : ""}
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-yellow-400 mt-2">
              📌 เลือกแล้ว: {form.selectedTables.length} โต๊ะ
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
              {submitting ? "⏳ กำลังบันทึก..." : "🏰 บันทึกห้อง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}