"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/nav";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");

    try {
      await login(email, password);
    } catch (error) {
      setErr("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <>
      <Navbar />

      <div
        className="min-h-screen bg-gradient-to-br from-amber-950 via-yellow-900 to-amber-950 text-yellow-100 flex justify-center items-center p-4"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(217, 119, 6, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(180, 83, 9, 0.2) 0%, transparent 50%)",
        }}
      >
        <div className="max-w-screen-xl w-full shadow-2xl shadow-yellow-900/50 flex justify-center flex-1 overflow-hidden rounded-2xl border-4 border-yellow-600">
          <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 bg-gradient-to-br from-amber-900 to-amber-950">
            <div className="flex justify-center mb-4">
              <div className="text-6xl animate-bounce">☠️</div>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <h1
                className="text-4xl font-black text-yellow-300 mb-2"
                style={{
                  textShadow:
                    "3px 3px 0px rgba(0,0,0,0.8), 0 0 30px rgba(255,215,0,0.3)",
                }}
              >
                🏴 PIRATE LOGIN
              </h1>
              <p className="text-yellow-200 text-sm font-semibold">
                ยินดีต้อนรับสู่ท่าเรือ
              </p>

              <div className="w-full flex-1 mt-8">
                <form
                  onSubmit={onSubmit}
                  className="mx-auto max-w-xs space-y-4"
                >
                  <div className="relative">
                    <span className="absolute left-3 top-4 text-xl">📧</span>
                    <input
                      className="w-full pl-10 pr-4 py-3 rounded-lg font-semibold bg-amber-100 border-2 border-yellow-500 placeholder-gray-600 text-gray-900 text-sm focus:outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-4 text-xl">🔐</span>
                    <input
                      className="w-full pl-10 pr-4 py-3 rounded-lg font-semibold bg-amber-100 border-2 border-yellow-500 placeholder-gray-600 text-gray-900 text-sm focus:outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {err && (
                    <div className="mt-3 text-sm text-yellow-100 bg-red-900/80 border-2 border-red-600 px-3 py-2 rounded-lg text-center font-semibold flex items-center justify-center gap-2">
                      <span>💀</span>
                      {err}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 tracking-wide font-black bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white w-full py-3 rounded-lg border-2 border-yellow-400 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none disabled:opacity-60 transform hover:scale-105 shadow-lg"
                  >
                    <svg
                      className="w-6 h-6 -ml-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <path d="M20 8v6M23 11h-6" />
                    </svg>
                    <span className="ml-2">
                      {loading ? "⏳ กำลังเข้าท่าเรือ..." : "⚓ SET SAIL"}
                    </span>
                  </button>

                  <p className="mt-6 text-xs text-yellow-200 text-center font-semibold">
                    ยอมรับ{" "}
                    <a
                      href="#"
                      className="border-b-2 border-yellow-400 hover:text-yellow-100 transition-colors"
                    >
                      เงื่อนไขการใช้งาน
                    </a>{" "}
                    และ{" "}
                    <a
                      href="#"
                      className="border-b-2 border-yellow-400 hover:text-yellow-100 transition-colors"
                    >
                      นโยบายความเป็นส่วนตัว
                    </a>
                  </p>

                  <div className="mt-4 text-center">
                    <p className="text-xs text-yellow-200 mb-2">
                      🏴 ยังไม่มีบัญชี?
                    </p>
                    <a
                      href="/register"
                      className="inline-block px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 text-white font-bold rounded-lg border-2 border-yellow-400 transition-all duration-200 transform hover:scale-105"
                    >
                      📝 สร้างบัญชีใหม่
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="flex-1 hidden lg:flex relative overflow-hidden bg-black">
            <div
              className="w-full h-screen bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.0.3')",
                backgroundBlend: "overlay",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            />

            {/* Overlay Decorations */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-t from-black/80 via-transparent to-black/20">
              <div className="space-y-4 max-w-sm">
                <div className="text-7xl animate-pulse">🏴‍☠️</div>
                <h2
                  className="text-5xl font-black text-yellow-300"
                  style={{
                    textShadow:
                      "4px 4px 0px rgba(0,0,0,0.8), 0 0 40px rgba(255,215,0,0.4)",
                  }}
                >
                  BOARDGAME HAVEN
                </h2>
                <p className="text-xl text-yellow-200 font-bold">
                  ท่าเรือเกมเดสก์ท็อป
                </p>
                <div className="pt-6 space-y-2 text-yellow-100 font-semibold text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <span>⚓</span>
                    <span>ค้นหาเกมมันๆ</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>🎮</span>
                    <span>จองที่นั่งได้เลย</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>👥</span>
                    <span>เล่นกับเพื่อน</span>
                  </div>
                </div>

                <div className="mt-8 p-4 border-2 border-yellow-500 rounded-lg bg-amber-900/50">
                  <p className="text-yellow-300 font-bold text-lg">
                    💎 สมบัติเกม
                  </p>
                  <p className="text-yellow-100 text-xs mt-2">
                    500+ เกม • 1000+ สมาชิก • ⭐⭐⭐⭐⭐
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-amber-900 to-transparent opacity-50"></div>
          </div>
        </div>
      </div>
    </>
  );
}
