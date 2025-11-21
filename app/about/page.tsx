"use client";

import Navbar from "../components/nav";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-10 pt-24">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1
              className="text-5xl font-black text-amber-950 mb-2"
              style={{
                textShadow: "3px 3px 6px rgba(0,0,0,0.2)",
                letterSpacing: "2px",
              }}
            >
              🏴‍☠️ ABOUT PIRATE'S HAVEN
            </h1>
            <p className="text-amber-800 font-bold text-lg">
              เกี่ยวกับคาเฟ่โจรสลัดของเรา
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Story Section */}
            <div
              className="bg-white rounded-2xl border-4 border-yellow-600 p-8 shadow-2xl"
              style={{
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <h2 className="text-3xl font-black text-amber-950 mb-4 flex items-center gap-3">
                <span>📜</span>
                <span>เรื่องราวของเรา</span>
              </h2>
              <div className="text-amber-900 space-y-4 leading-relaxed">
                <p className="font-semibold">
                  ยินดีต้อนรับสู่ Pirate's Haven
                  คาเฟ่และร้านบอร์ดเกมที่จะพาคุณล่องสมุทรสู่โลกแห่งการผจญภัย!
                </p>
                <p>
                  เราเป็นมากกว่าแค่ร้านคาเฟ่ธรรมดา
                  เราคือจุดนัดพบของลูกเรือโจรสลัดที่รักความสนุกและการผจญภัยในโลกของบอร์ดเกม
                  ที่นี่คุณจะได้พบกับบรรยากาศแบบโจรสลัดแท้ๆ
                  พร้อมเกมมากมายที่รอให้คุณมาพิชิต
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Board Games */}
              <div
                className="bg-white rounded-2xl border-4 border-yellow-600 p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
                style={{
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <h3 className="text-2xl font-black text-amber-950 mb-3 flex items-center gap-2">
                  <span>🎲</span>
                  <span>บอร์ดเกมมากมาย</span>
                </h3>
                <p className="text-amber-900 leading-relaxed">
                  เรามีบอร์ดเกมให้เลือกเล่นหลากหลายแนว ตั้งแต่เกมกลยุทธ์
                  เกมแฟนตาซี ไปจนถึงเกมปาร์ตี้สุดสนุก
                  พร้อมทีมงานที่พร้อมแนะนำและสอนวิธีเล่น
                </p>
              </div>

              {/* Atmosphere */}
              <div
                className="bg-white rounded-2xl border-4 border-yellow-600 p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
                style={{
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <h3 className="text-2xl font-black text-amber-950 mb-3 flex items-center gap-2">
                  <span>⚓</span>
                  <span>บรรยากาศสุดเจ๋ง</span>
                </h3>
                <p className="text-amber-900 leading-relaxed">
                  ตกแต่งสไตล์โจรสลัดแท้ๆ
                  ทำให้คุณรู้สึกเหมือนอยู่บนเรือโจรสลัดจริงๆ
                  พร้อมโต๊ะและห้องส่วนตัวสำหรับการเล่นเกมอย่างสบาย
                </p>
              </div>

              {/* Food & Drinks */}
              <div
                className="bg-white rounded-2xl border-4 border-yellow-600 p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
                style={{
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <h3 className="text-2xl font-black text-amber-950 mb-3 flex items-center gap-2">
                  <span>🍹</span>
                  <span>เครื่องดื่มและอาหาร</span>
                </h3>
                <p className="text-amber-900 leading-relaxed">
                  เสิร์ฟเครื่องดื่มและอาหารว่างแสนอร่อย เหมาะกับการเล่นเกมยาวๆ
                  ทุกเมนูออกแบบมาเพื่อให้คุณเพลิดเพลินไปกับเกมได้อย่างเต็มที่
                </p>
              </div>

              {/* Community */}
              <div
                className="bg-white rounded-2xl border-4 border-yellow-600 p-6 shadow-2xl hover:scale-105 transition-transform duration-300"
                style={{
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <h3 className="text-2xl font-black text-amber-950 mb-3 flex items-center gap-2">
                  <span>👥</span>
                  <span>ชุมชนนักเล่นเกม</span>
                </h3>
                <p className="text-amber-900 leading-relaxed">
                  เข้าร่วมกับชุมชนนักเล่นบอร์ดเกมที่อบอุ่น
                  มีกิจกรรมและทัวร์นาเมนต์จัดเป็นประจำ
                  เหมาะสำหรับทั้งมือใหม่และมืออาชีพ
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div
              className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-2xl border-4 border-yellow-600 p-8 shadow-2xl"
              style={{
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              }}
            >
              <h2 className="text-3xl font-black text-yellow-300 mb-6 flex items-center gap-3">
                <span>📍</span>
                <span>ติดต่อเรา</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-yellow-100">
                <div>
                  <h3 className="font-black text-lg mb-2 text-yellow-300">
                    ที่อยู่
                  </h3>
                  <p className="leading-relaxed">
                    123 ถนนโจรสลัด แขวงผจญภัย
                    <br />
                    เขตสมุทรทอง กรุงเทพฯ 10100
                  </p>
                </div>
                <div>
                  <h3 className="font-black text-lg mb-2 text-yellow-300">
                    เวลาทำการ
                  </h3>
                  <p className="leading-relaxed">
                    จันทร์ - ศุกร์: 14:00 - 00:00
                    <br />
                    เสาร์ - อาทิตย์: 12:00 - 02:00
                  </p>
                </div>
                <div>
                  <h3 className="font-black text-lg mb-2 text-yellow-300">
                    โทรศัพท์
                  </h3>
                  <p className="leading-relaxed">02-XXX-XXXX</p>
                </div>
                <div>
                  <h3 className="font-black text-lg mb-2 text-yellow-300">
                    อีเมล
                  </h3>
                  <p className="leading-relaxed">contact@pirateshaven.com</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <p className="text-2xl font-black text-amber-950 mb-4">
                พร้อมเริ่มการผจญภัยแล้วหรือยัง?
              </p>
              <button
                type="button"
                onClick={() => (window.location.href = "/booking")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-white font-black text-lg border-4 border-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-2xl"
              >
                🎯 จองโต๊ะเลย!
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
