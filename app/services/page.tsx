"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/nav";

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

export default function ServicesPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [boardgames, setBoardgames] = useState<Boardgame[]>([]);
  const [selected, setSelected] = useState<Boardgame | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boardgame`);
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
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/boardgame/findname?name=${encodeURIComponent(search.trim())}`
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

  const categories = [
    "all",
    ...Array.from(new Set(boardgames.map((g) => g.category))),
  ];

  const filteredGames =
    filterCategory === "all"
      ? boardgames
      : boardgames.filter((g) => g.category === filterCategory);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950 to-slate-950 pt-20 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-yellow-600 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-10 right-10 w-96 h-96 bg-orange-600 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h1
              className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 mb-3 animate-pulse"
              style={{
                textShadow: "0 0 40px rgba(251, 191, 36, 0.5)",
              }}
            >
              🏴‍☠️ TREASURE TROVE OF GAMES
            </h1>
            <p className="text-yellow-200 text-lg font-semibold">
              ค้นพบสมบัติแห่งความสนุกในคลังเกมของเรา
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
              <span className="text-2xl">⚓</span>
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
            </div>
          </div>

          <div className="mb-8 bg-gradient-to-r from-amber-900/50 to-orange-900/50 backdrop-blur-sm rounded-2xl border-2 border-yellow-600 p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <form onSubmit={onSearch} className="flex flex-1 gap-2">
                <input
                  type="text"
                  placeholder="🔍 ค้นหาเกมในคลังสมบัติ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-yellow-600 bg-slate-900 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-yellow-600"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-bold border-2 border-yellow-400 disabled:opacity-60 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  {searching ? "⏳" : "🔍 ค้นหา"}
                </button>
              </form>

              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm border-2 transition-all duration-200 transform hover:scale-105 ${
                      filterCategory === cat
                        ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-slate-900 border-yellow-400 shadow-lg"
                        : "bg-slate-800 text-yellow-300 border-yellow-600 hover:bg-slate-700"
                    }`}
                  >
                    {cat === "all" ? "🎯 ทั้งหมด" : `🏷️ ${cat}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/80 border-2 border-red-600 rounded-xl p-4 shadow-lg">
              <p className="text-yellow-100 font-bold text-center">
                ⚠️ {error}
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin text-6xl mb-4">⚓</div>
              <p className="text-yellow-300 text-2xl font-bold">
                กำลังขุดหาสมบัติ...
              </p>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-r from-amber-900/50 to-orange-900/50 rounded-2xl border-2 border-yellow-600">
              <p className="text-6xl mb-4">💀</p>
              <p className="text-yellow-300 text-2xl font-bold">
                ไม่พบสมบัติที่คุณต้องการ
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredGames.map((game) => (
                  <div
                    key={game._id}
                    onClick={() => handleSelect(game)}
                    onMouseEnter={() => setHoveredId(game._id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden border-4 cursor-pointer transition-all duration-300 ${
                      selected?._id === game._id
                        ? "border-yellow-400 shadow-2xl shadow-yellow-600/50 scale-105"
                        : "border-yellow-600 hover:border-yellow-400 hover:shadow-xl hover:shadow-yellow-600/30 hover:scale-102"
                    }`}
                    style={{
                      transform:
                        hoveredId === game._id
                          ? "translateY(-8px) rotate(1deg)"
                          : "",
                    }}
                  >
                    <div className="relative h-56 overflow-hidden">
                      {game.thumbnail ? (
                        <img
                          src={game.thumbnail || "/placeholder.svg"}
                          alt={game.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-800 to-orange-900 text-7xl">
                          🎲
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-70"></div>

                      <div className="absolute top-3 right-3 bg-gradient-to-r from-red-700 to-red-900 text-yellow-300 font-black px-4 py-2 rounded-xl text-lg border-2 border-yellow-400 shadow-lg">
                        💰 {game.price}฿
                      </div>

                      <div className="absolute top-3 left-3 bg-slate-900/90 text-yellow-300 font-bold px-3 py-1 rounded-lg text-xs border border-yellow-600">
                        🏷️ {game.category}
                      </div>
                    </div>

                    <div className="p-5">
                      <h2
                        className="font-black text-yellow-300 text-xl mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors"
                        style={{
                          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                        }}
                      >
                        {game.name}
                      </h2>
                      <p className="text-sm text-yellow-100/70 mb-4 line-clamp-2">
                        {game.description}
                      </p>

                      <div className="flex gap-4 mb-4 text-sm text-yellow-200 font-semibold">
                        <div className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-lg border border-yellow-600">
                          <span>👥</span>
                          <span>
                            {game.players_min}-{game.players_max}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-lg border border-yellow-600">
                          <span>⏱️</span>
                          <span>{game.duration}m</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBook(game);
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-white font-black border-2 border-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        ⚓ จองเกมนี้เลย!
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div
                    className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-4 border-yellow-600 p-6 shadow-2xl"
                    style={{
                      boxShadow:
                        "0 0 40px rgba(217, 119, 6, 0.5), inset 0 0 30px rgba(255, 215, 0, 0.1)",
                    }}
                  >
                    {selected ? (
                      <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden border-4 border-yellow-500 shadow-xl">
                          {selected.thumbnail ? (
                            <img
                              src={selected.thumbnail || "/placeholder.svg"}
                              alt={selected.name}
                              className="w-full h-64 object-cover"
                            />
                          ) : (
                            <div className="w-full h-64 bg-gradient-to-br from-amber-800 to-orange-900 flex items-center justify-center text-8xl">
                              🎲
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-50"></div>
                        </div>

                        {/* Title */}
                        <div>
                          <h2
                            className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2"
                            style={{
                              textShadow: "0 0 20px rgba(251, 191, 36, 0.3)",
                            }}
                          >
                            {selected.name}
                          </h2>
                          <div className="inline-block bg-gradient-to-r from-yellow-600 to-orange-600 text-slate-900 font-bold px-3 py-1 rounded-lg text-sm">
                            🏷️ {selected.category}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-yellow-100 text-sm leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-yellow-600">
                          {selected.description}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 p-3 rounded-xl border-2 border-yellow-600">
                            <div className="text-yellow-300 font-bold text-sm mb-1">
                              👥 ผู้เล่น
                            </div>
                            <div className="text-yellow-100 font-black text-xl">
                              {selected.players_min}-{selected.players_max}
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 p-3 rounded-xl border-2 border-yellow-600">
                            <div className="text-yellow-300 font-bold text-sm mb-1">
                              ⏱️ เวลา
                            </div>
                            <div className="text-yellow-100 font-black text-xl">
                              {selected.duration}m
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 p-3 rounded-xl border-2 border-yellow-600">
                            <div className="text-yellow-300 font-bold text-sm mb-1">
                              💰 ราคา
                            </div>
                            <div className="text-yellow-100 font-black text-xl">
                              {selected.price}฿
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 p-3 rounded-xl border-2 border-yellow-600">
                            <div className="text-yellow-300 font-bold text-sm mb-1">
                              🏴 สำนักพิมพ์
                            </div>
                            <div className="text-yellow-100 font-bold text-xs">
                              {selected.publisher}
                            </div>
                          </div>
                        </div>

                        {/* Book button */}
                        <button
                          type="button"
                          onClick={() => handleBook(selected)}
                          className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-white font-black text-lg border-2 border-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                          ⚓ จองเกมนี้เดี๋ยวนี้!
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-7xl mb-4 animate-bounce">🗺️</div>
                        <p className="text-yellow-300 text-xl font-bold">
                          เลือกเกมเพื่อดูรายละเอียด
                        </p>
                        <p className="text-yellow-200 text-sm mt-2">
                          คลิกที่เกมด้านซ้ายเพื่อดูข้อมูลเพิ่มเติม
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
