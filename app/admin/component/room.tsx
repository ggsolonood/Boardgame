// src/app/rooms/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext"; 

type RoomItem = {
  _id: string;
  name: string;
  capacity: number;
  status: string;
  tables: string[];
};

export default function RoomsListPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<RoomItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [err, setErr] = useState("");

  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role?.toLowerCase() !== "admin") {
      router.push("/");
      return;
    }
  }, [loading, user, router]);

  const fetchRooms = async (name?: string) => {
    setListLoading(true);
    setErr("");

    try {
      const url = name && name.trim()
        ? `${process.env.NEXT_PUBLIC_API_URL}/room/findname?name=${encodeURIComponent(
            name.trim()
          )}`
        : `${process.env.NEXT_PUBLIC_API_URL}/room`;

      const res = await fetch(url, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message ||
            (name ? "ค้นหาห้องไม่สำเร็จ" : "โหลดข้อมูลห้องไม่สำเร็จ")
        );
      }

      const json = await res.json().catch(() => null);
      const list = (json?.data ?? json ?? []) as RoomItem[];
      setItems(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setErr(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setListLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user || user.role?.toLowerCase() !== "admin") return;
    fetchRooms();
  }, [loading, user, token]);

  const onSearch = async (e: FormEvent) => {
    e.preventDefault();
    setSearching(true);
    await fetchRooms(search);
  };

  const onDelete = async (id: string) => {
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อน");
      return;
    }
    if (!confirm("ต้องการลบห้องนี้จริง ๆ หรือไม่?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "ลบไม่สำเร็จ");
      }

      setItems((prev) => prev.filter((r) => r._id !== id));
    } catch (e: any) {
      alert(e.message || "เกิดข้อผิดพลาดขณะลบ");
    }
  };

  const goUpdate = (id: string) => {
    router.push(`/rooms/edit/${id}`);
  };

  if (loading || !user || user.role?.toLowerCase() !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <p className="text-amber-900 text-lg font-bold animate-pulse">🏴 กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  const renderStatus = (status: string) => {
    const s = status.toLowerCase();
    let cls = "bg-gray-200 text-gray-800 border-gray-400";
    let icon = "⚓";
    
    if (s === "available") {
      cls = "bg-green-100 text-green-800 border-green-600";
      icon = "⛵";
    } else if (s === "in_use" || s === "inuse") {
      cls = "bg-yellow-100 text-yellow-800 border-yellow-600";
      icon = "🏴‍☠️";
    } else if (s === "maintenance") {
      cls = "bg-red-100 text-red-800 border-red-600";
      icon = "🔧";
    }

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black border-2 ${cls}`}>
        <span>{icon}</span>
        {status}
      </span>
    );
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
            🏴‍☠️ PIRATE'S HARBOR ROOMS
          </h1>
          <p className="text-amber-800 font-bold text-lg">ห้องต่อสู้ของโจรสลัด</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin/createroom")}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-sm text-white font-black border-2 border-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            ➕ เพิ่มห้อง
          </button>

          {/* Search Form */}
          <form
            onSubmit={onSearch}
            className="flex w-full max-w-md gap-2 items-center"
          >
            <input
              type="text"
              placeholder="ค้นหาตามชื่อห้อง…"
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

        {listLoading ? (
          <div className="text-center py-12">
            <p className="text-amber-900 text-lg font-bold animate-pulse">🏴 กำลังโหลดห้อง...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-amber-900/30 rounded-2xl border-4 border-yellow-600">
            <p className="text-amber-900 text-lg font-bold">💀 ยังไม่มีห้องในท่าเรือ</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow-2xl rounded-2xl border-4 border-yellow-600" style={{
            boxShadow: "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
          }}>
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-amber-800 to-amber-900 text-yellow-300 border-b-4 border-yellow-600">
                <tr>
                  <th className="px-4 py-3 text-left font-black">ชื่อห้อง</th>
                  <th className="px-4 py-3 text-left font-black">ความจุ</th>
                  <th className="px-4 py-3 text-left font-black">สถานะ</th>
                  <th className="px-4 py-3 text-left font-black">จำนวนโต๊ะ</th>
                  <th className="px-4 py-3 text-right font-black">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-yellow-300/50">
                {items.map((r) => (
                  <tr key={r._id} className="hover:bg-amber-50 transition-colors text-amber-900">
                    <td className="px-4 py-3 font-black text-amber-950">
                      {r.name}
                    </td>
                    <td className="px-4 py-3 text-amber-800 font-semibold">
                      {r.capacity} คน
                    </td>
                    <td className="px-4 py-3">
                      {renderStatus(r.status)}
                    </td>
                    <td className="px-4 py-3 text-amber-800 font-semibold">
                      {r.tables?.length ?? 0} โต๊ะ
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => goUpdate(r._id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border-2 border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black transition-all duration-200 transform hover:scale-110 shadow-md"
                      >
                        ✏️ แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(r._id)}
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