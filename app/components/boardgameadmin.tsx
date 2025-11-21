"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

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

  const [boardgames, setBoardgames] = useState<Boardgame[]>([]);
  const [selected, setSelected] = useState<Boardgame | null>(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boardgame`);
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || "โหลดบอร์ดเกมไม่สำเร็จ");
        }
        const data: Boardgame[] = await res.json();
        setBoardgames(data);
        setSelected(data[0] ?? null); 
      } catch (e: any) {
        setError(e.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const onSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!search.trim()) {
      setSearching(false);
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boardgames`);
        if (!res.ok) throw new Error("โหลดบอร์ดเกมไม่สำเร็จ");
        const data: Boardgame[] = await res.json();
        setBoardgames(data);
        setSelected(data[0] ?? null);
      } catch (e: any) {
        setError(e.message || "เกิดข้อผิดพลาด");
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
      setBoardgames(data);
      setSelected(data[0] ?? null);
    } catch (e: any) {
      setError(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setSearching(false);
    }
  };

  const handleBook = (game: Boardgame) => {
    if (!user || !token) {
      router.push("/login");
      return;
    }

    router.push(`/booking-boardgame?boardgameId=${game._id}`);
  };

  const handleSelect = (game: Boardgame) => {
    setSelected(game);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-yellow-900 to-amber-950 pt-20 pb-10" style={{
      backgroundImage: "radial-gradient(circle at 20% 50%, rgba(217, 119, 6, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(180, 83, 9, 0.2) 0%, transparent 50%)"
    }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black text-yellow-300 mb-1" style={{
              textShadow: "3px 3px 0px rgba(0,0,0,0.8), 0 0 30px rgba(255,215,0,0.3)"
            }}>
              🏴‍☠️ PIRATE'S TREASURE CHEST
            </h1>
            <p className="text-yellow-200 text-sm">ค้นหาเกมสุดมันในคลังสมบัติของเรา</p>
          </div>

          <form
            onSubmit={onSearch}
            className="flex w-full max-w-md gap-2 items-center"
          >
            <input
              type="text"
              placeholder="ค้นหาบอร์ดเกม…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-yellow-600 text-sm bg-amber-50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-sm text-white font-bold border-2 border-yellow-400 disabled:opacity-60 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              {searching ? "🔍" : "🔍"}
            </button>
          </form>
        </div>

        {error && (
          <p className="mb-4 text-sm text-yellow-100 bg-red-900/80 border-2 border-red-600 px-4 py-3 rounded-lg font-semibold">
            ⚠️ {error}
          </p>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-yellow-300 text-lg font-bold animate-pulse">🏴 กำลังโหลดสมบัติ...</p>
          </div>
        ) : boardgames.length === 0 ? (
          <div className="text-center py-12 bg-amber-900/50 rounded-xl border-2 border-yellow-600">
            <p className="text-yellow-300 text-lg font-bold">💀 ยังไม่มีเกมในสมบัติ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {boardgames.map((game) => (
                  <div
                    key={game._id}
                    onClick={() => handleSelect(game)}
                    className="flex flex-col bg-gradient-to-br from-amber-900 to-amber-950 rounded-xl shadow-xl hover:shadow-2xl cursor-pointer overflow-hidden border-2 border-yellow-600 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105 hover:-rotate-1"
                  >
                    <div className="relative">
                      {game.thumbnail ? (
                        <img
                          src={game.thumbnail}
                          alt={game.name}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 flex items-center justify-center bg-amber-800 text-2xl">
                          🎲
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-red-700 text-yellow-300 font-bold px-2 py-1 rounded text-xs border border-yellow-400">
                        💰 {game.price}฿
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col p-3">
                      <h2 className="font-bold text-yellow-300 text-sm mb-1 line-clamp-2" style={{
                        textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
                      }}>
                        {game.name}
                      </h2>
                      <p className="text-xs text-yellow-100 mb-2 line-clamp-2 opacity-75">
                        {game.description}
                      </p>

                      <div className="mt-auto space-y-1 text-xs text-yellow-200 font-semibold">
                        <div>👥 {game.players_min}–{game.players_max} คน</div>
                        <div>⏱️ {game.duration} นาที</div>
                      </div>
                    </div>

                    <div className="px-3 pb-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBook(game);
                        }}
                        className="w-full mt-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-xs font-bold text-white border-2 border-yellow-300 transform hover:scale-110 transition-all duration-200 shadow-lg"
                      >
                        ⚓ จองเกมนี้
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-amber-900 to-amber-950 rounded-xl shadow-2xl border-2 border-yellow-600 p-5 h-full" style={{
                boxShadow: "0 0 30px rgba(217, 119, 6, 0.5), inset 0 0 20px rgba(255, 215, 0, 0.1)"
              }}>
                {selected ? (
                  <>
                    <div className="relative mb-4">
                      {selected.thumbnail ? (
                        <img
                          src={selected.thumbnail}
                          alt={selected.name}
                          className="w-full h-48 object-cover rounded-lg border-2 border-yellow-500"
                        />
                      ) : (
                        <div className="w-full h-48 bg-amber-800 rounded-lg border-2 border-yellow-500 flex items-center justify-center text-6xl">
                          🎲
                        </div>
                      )}
                      <div className="absolute -top-3 -left-3 bg-red-700 text-yellow-300 font-bold px-3 py-1 rounded-lg text-sm border-2 border-yellow-400" style={{
                        textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
                      }}>
                        💎 {selected.price} บาท
                      </div>
                    </div>

                    <h2 className="text-xl font-black text-yellow-300 mb-2" style={{
                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)"
                    }}>
                      {selected.name}
                    </h2>
                    <p className="text-xs text-yellow-200 mb-3 font-bold px-2 py-1 bg-amber-800 rounded inline-block">
                      🏷️ {selected.category}
                    </p>

                    <p className="text-sm text-yellow-100 mb-4 whitespace-pre-line opacity-90">
                      {selected.description}
                    </p>

                    <div className="space-y-2 text-sm text-yellow-200 mb-5 font-semibold">
                      <div className="flex items-center gap-2 bg-amber-800/50 p-2 rounded">
                        <span>👥</span>
                        <span>{selected.players_min}–{selected.players_max} คน</span>
                      </div>
                      <div className="flex items-center gap-2 bg-amber-800/50 p-2 rounded">
                        <span>⏱️</span>
                        <span>{selected.duration} นาที</span>
                      </div>
                      <div className="flex items-center gap-2 bg-amber-800/50 p-2 rounded">
                        <span>🏴</span>
                        <span>{selected.publisher}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBook(selected)}
                      className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-sm font-black text-white border-2 border-yellow-400 transform hover:scale-110 transition-all duration-200 shadow-lg"
                    >
                      ⚓ จองเกมนี้
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-yellow-300 text-base font-bold">🗺️</p>
                    <p className="text-yellow-200 text-sm mt-2">เลือกบอร์ดเกมเพื่อดูรายละเอียด</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}