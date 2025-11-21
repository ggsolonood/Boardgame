"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

type Boardgame = {
  _id: string;
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

export default function BoardgameListPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<Boardgame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");

  const [search, setSearch] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);

  const goCreate = () => {
    router.push("/admin/createboardgame");
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setErr("");

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boardgame`);
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || "โหลดบอร์ดเกมไม่สำเร็จ");
        }
        const data: Boardgame[] = await res.json();
        setItems(data);
      } catch (e: any) {
        setErr(e.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const onSearch = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");

    if (!search.trim()) {
      setSearching(false);
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boardgame`);
        if (!res.ok) throw new Error("โหลดบอร์ดเกมไม่สำเร็จ");
        const data: Boardgame[] = await res.json();
        setItems(data);
      } catch (e: any) {
        setErr(e.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/boardgame/findname?name=${encodeURIComponent(
          search.trim()
        )}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "ค้นหาบอร์ดเกมไม่สำเร็จ");
      }
      const data: Boardgame[] = await res.json();
      setItems(data);
    } catch (e: any) {
      setErr(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setSearching(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อน");
      return;
    }
    if (!confirm("ต้องการลบบอร์ดเกมนี้จริง ๆ หรือไม่?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boardgame/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "ลบไม่สำเร็จ");
      }

      setItems((prev) => prev.filter((b) => b._id !== id));
    } catch (e: any) {
      alert(e.message || "เกิดข้อผิดพลาดขณะลบ");
    }
  };

  const goUpdate = (id: string) => {
    router.push(`/boardgame/edit/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-10 pt-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black text-amber-950 mb-2" style={{
            textShadow: "3px 3px 6px rgba(0,0,0,0.2)",
            letterSpacing: "2px"
          }}>
            ☠️ PIRATE'S TREASURE CHEST
          </h1>
          <p className="text-amber-800 font-bold text-lg">สมบัติเกมของท่าเรือ</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goCreate}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-sm text-white font-black border-2 border-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            ➕ เพิ่มบอร์ดเกม
          </button>

          {/* Search Form */}
          <form
            onSubmit={onSearch}
            className="flex w-full max-w-md gap-2 items-center"
          >
            <input
              type="text"
              placeholder="ค้นหาตามชื่อบอร์ดเกม…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-yellow-600 text-sm bg-white text-amber-900 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-amber-600"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-sm text-white font-black border-2 border-yellow-500 disabled:opacity-60 transform hover:scale-105 transition-all duration-200 shadow-lg"
              disabled={searching}
            >
              {searching ? "🔍" : "🔍"}
            </button>
          </form>
        </div>

        {err && (
          <div className="mb-4 text-sm text-white bg-red-700/90 border-2 border-red-900 px-4 py-3 rounded-lg font-semibold flex items-center gap-2">
            <span>💀</span>
            {err}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-amber-900 text-lg font-bold animate-pulse">🏴 กำลังโหลดสมบัติ...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-amber-900/30 rounded-2xl border-4 border-yellow-600">
            <p className="text-amber-900 text-lg font-bold">💀 ยังไม่มีบอร์ดเกมในสมบัติ</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow-2xl rounded-2xl border-4 border-yellow-600" style={{
            boxShadow: "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
          }}>
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-amber-800 to-amber-900 text-yellow-300 border-b-4 border-yellow-600">
                <tr>
                  <th className="px-4 py-3 text-left font-black">รูป</th>
                  <th className="px-4 py-3 text-left font-black">ชื่อเกม</th>
                  <th className="px-4 py-3 text-left font-black">หมวดหมู่</th>
                  <th className="px-4 py-3 text-left font-black">ผู้เล่น</th>
                  <th className="px-4 py-3 text-left font-black">ราคา</th>
                  <th className="px-4 py-3 text-left font-black">เวลาเล่น</th>
                  <th className="px-4 py-3 text-left font-black">ผู้จัดทำ</th>
                  <th className="px-4 py-3 text-right font-black">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-yellow-300/50">
                {items.map((b) => (
                  <tr key={b._id} className="hover:bg-amber-50 transition-colors text-amber-900">
                    <td className="px-4 py-3">
                      {b.thumbnail ? (
                        <img
                          src={b.thumbnail}
                          alt={b.name}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-yellow-600 shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center rounded-lg border-2 border-dashed border-yellow-600 text-2xl bg-amber-100">
                          🎲
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-black text-amber-900">
                        {b.name}
                      </div>
                      <div className="text-xs text-amber-700 line-clamp-2">
                        {b.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-amber-800 font-semibold">{b.category}</td>
                    <td className="px-4 py-3 text-amber-800">
                      {b.players_min}–{b.players_max} คน
                    </td>
                    <td className="px-4 py-3 text-amber-900 font-black">{b.price} บาท</td>
                    <td className="px-4 py-3 text-amber-800">
                      {b.duration} นาที
                    </td>
                    <td className="px-4 py-3 text-amber-800">
                      {b.publisher}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => goUpdate(b._id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border-2 border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black transition-all duration-200 transform hover:scale-110 shadow-md"
                      >
                        ✏️ แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(b._id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border-2 border-red-600 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-black transition-all duration-200 transform hover:scale-110 shadow-md"
                      >
                        🗑️ ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}