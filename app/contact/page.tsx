"use client";

import type React from "react";
import { useState } from "react";
import Navbar from "../components/nav";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setStatus("idle"), 3000);
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-10 pt-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8 text-center">
            <h1
              className="text-5xl font-black text-amber-950 mb-2"
              style={{
                textShadow: "3px 3px 6px rgba(0,0,0,0.2)",
                letterSpacing: "2px",
              }}
            >
              📞 CONTACT US
            </h1>
            <p className="text-amber-800 font-bold text-lg">
              ติดต่อเราเพื่อเริ่มการผจญภัย
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div
              className="bg-white rounded-2xl border-4 border-yellow-600 p-8 shadow-2xl"
              style={{
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <h2 className="text-3xl font-black text-amber-950 mb-6 flex items-center gap-3">
                <span>✉️</span>
                <span>ส่งข้อความถึงเรา</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-amber-950 font-bold mb-2">
                    👤 ชื่อของคุณ
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-3 border-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-amber-50 text-amber-950 font-semibold"
                    placeholder="กรอกชื่อของคุณ"
                  />
                </div>

                <div>
                  <label className="block text-amber-950 font-bold mb-2">
                    📧 อีเมล
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-3 border-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-amber-50 text-amber-950 font-semibold"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-amber-950 font-bold mb-2">
                    📱 เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-3 border-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-amber-50 text-amber-950 font-semibold"
                    placeholder="0XX-XXX-XXXX"
                  />
                </div>

                <div>
                  <label className="block text-amber-950 font-bold mb-2">
                    💬 ข้อความ
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border-3 border-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-amber-50 text-amber-950 font-semibold resize-none"
                    placeholder="เขียนข้อความของคุณที่นี่..."
                  />
                </div>

                {status === "success" && (
                  <div className="bg-green-100 border-2 border-green-600 rounded-lg p-4 text-green-800 font-bold text-center">
                    ส่งข้อความสำเร็จ! เราจะติดต่อกลับเร็วๆ นี้
                  </div>
                )}

                {status === "error" && (
                  <div className="bg-red-100 border-2 border-red-600 rounded-lg p-4 text-red-800 font-bold text-center">
                    เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 disabled:from-gray-400 disabled:to-gray-600 text-white font-black text-lg border-4 border-yellow-400 transform hover:scale-105 disabled:scale-100 transition-all duration-200 shadow-2xl"
                >
                  {status === "sending" ? "กำลังส่ง..." : "📮 ส่งข้อความ"}
                </button>
              </form>
            </div>

            <div className="space-y-6">
              <div
                className="bg-white rounded-2xl border-4 border-yellow-600 p-6 shadow-2xl"
                style={{
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <h3 className="text-2xl font-black text-amber-950 mb-4 flex items-center gap-2">
                  <span>📍</span>
                  <span>ที่อยู่</span>
                </h3>
                <p className="text-amber-900 font-semibold leading-relaxed">
                  123 ถนนโจรสลัด แขวงผจญภัย
                  <br />
                  เขตสมุทรทอง กรุงเทพฯ 10100
                  <br />
                  ใกล้ BTS/MRT สถานีผจญภัย
                </p>
              </div>

              <div
                className="bg-white rounded-2xl border-4 border-yellow-600 p-6 shadow-2xl"
                style={{
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <h3 className="text-2xl font-black text-amber-950 mb-4 flex items-center gap-2">
                  <span>🕐</span>
                  <span>เวลาทำการ</span>
                </h3>
                <div className="text-amber-900 font-semibold space-y-2">
                  <p>จันทร์ - ศุกร์: 14:00 - 00:00</p>
                  <p>เสาร์ - อาทิตย์: 12:00 - 02:00</p>
                  <p className="text-sm text-amber-700 mt-3">
                    * รับจองล่วงหน้า 7 วัน
                  </p>
                </div>
              </div>

              <div
                className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-2xl border-4 border-yellow-600 p-6 shadow-2xl"
                style={{
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                }}
              >
                <h3 className="text-2xl font-black text-yellow-300 mb-4 flex items-center gap-2">
                  <span>📞</span>
                  <span>ติดต่อด่วน</span>
                </h3>
                <div className="space-y-3 text-yellow-100 font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">☎️</span>
                    <span>02-XXX-XXXX</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📱</span>
                    <span>098-XXX-XXXX</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">✉️</span>
                    <span>contact@pirateshaven.com</span>
                  </div>
                </div>
              </div>

              <div
                className="bg-white rounded-2xl border-4 border-yellow-600 p-6 shadow-2xl"
                style={{
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <h3 className="text-2xl font-black text-amber-950 mb-4 flex items-center gap-2">
                  <span>🌐</span>
                  <span>โซเชียลมีเดีย</span>
                </h3>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-bold border-2 border-blue-900 transform hover:scale-105 transition-all duration-200"
                  >
                    Facebook
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-pink-800 hover:from-pink-500 hover:to-pink-700 text-white font-bold border-2 border-pink-900 transform hover:scale-105 transition-all duration-200"
                  >
                    Instagram
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white font-bold border-2 border-green-900 transform hover:scale-105 transition-all duration-200"
                  >
                    Line
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="mt-8 bg-white rounded-2xl border-4 border-yellow-600 p-6 shadow-2xl"
            style={{
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <h3 className="text-2xl font-black text-amber-950 mb-4 flex items-center gap-2">
              <span>🗺️</span>
              <span>แผนที่</span>
            </h3>
            <div className="w-full h-96 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center border-2 border-yellow-600">
              <p className="text-amber-800 font-bold text-lg">
                Google Maps Integration
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
