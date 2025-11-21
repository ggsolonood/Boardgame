"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 border-t-4 border-yellow-600 text-yellow-100 shadow-2xl shadow-yellow-900/50">
      <div className="absolute -top-1 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-4xl">☠️</span>
              <div>
                <h3 className="text-xl font-black text-yellow-300" style={{
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)"
                }}>
                  BOARDGAME HAVEN
                </h3>
                <p className="text-xs text-yellow-200">เกมเดสก์ท็อปสุดมัน</p>
              </div>
            </div>
            <p className="text-sm text-yellow-100 opacity-75 leading-relaxed">
              ยินดีต้อนรับสู่ท่าเรือของโจรสลัด บอร์ดเกมสุดเอกซ์โคลสีฟทั้งหมด
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-bold text-yellow-300 mb-4 flex items-center gap-2" style={{
              textShadow: "1px 1px 3px rgba(0,0,0,0.8)"
            }}>
              🗺️ NAVIGATION
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-yellow-100 hover:text-yellow-300 transition-colors font-semibold text-sm hover:translate-x-1 inline-block">
                  → หน้าแรก
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-yellow-100 hover:text-yellow-300 transition-colors font-semibold text-sm hover:translate-x-1 inline-block">
                  → เกี่ยวกับเรา
                </Link>
              </li>
              <li>
                <Link href="/service" className="text-yellow-100 hover:text-yellow-300 transition-colors font-semibold text-sm hover:translate-x-1 inline-block">
                  → รายชื่อเกม
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-yellow-100 hover:text-yellow-300 transition-colors font-semibold text-sm hover:translate-x-1 inline-block">
                  → ติดต่อเรา
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="text-lg font-bold text-yellow-300 mb-4 flex items-center gap-2" style={{
              textShadow: "1px 1px 3px rgba(0,0,0,0.8)"
            }}>
              ⚓ SERVICES
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-yellow-100 font-semibold text-sm flex items-center gap-2">
                  🎮 จองบอร์ดเกม
                </span>
              </li>
              <li>
                <span className="text-yellow-100 font-semibold text-sm flex items-center gap-2">
                  👥 เล่นกับเพื่อน
                </span>
              </li>
              <li>
                <span className="text-yellow-100 font-semibold text-sm flex items-center gap-2">
                  🏆 ลิ่วแข่งขัน
                </span>
              </li>
              <li>
                <span className="text-yellow-100 font-semibold text-sm flex items-center gap-2">
                  📦 ส่งบ้านได้
                </span>
              </li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="text-lg font-bold text-yellow-300 mb-4 flex items-center gap-2" style={{
              textShadow: "1px 1px 3px rgba(0,0,0,0.8)"
            }}>
              📮 CONTACT
            </h4>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-semibold text-yellow-300">📍 ที่อยู่</p>
                <p className="text-yellow-100 opacity-75">ท่าเรือใหญ่ กรุงเทพ</p>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-yellow-300">📞 โทร</p>
                <p className="text-yellow-100 opacity-75">099-XXXX-XXXX</p>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-yellow-300">✉️ Email</p>
                <p className="text-yellow-100 opacity-75">hello@pirate.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-yellow-600 pt-6 mb-6">
          <h4 className="text-center text-yellow-300 font-bold mb-4 flex items-center justify-center gap-2">
            🏴 FOLLOW US
          </h4>
          <div className="flex justify-center gap-4">
            {[
              { icon: "📘", label: "Facebook", href: "#" },
              { icon: "🐦", label: "Twitter", href: "#" },
              { icon: "📷", label: "Instagram", href: "#" },
              { icon: "🎮", label: "Discord", href: "#" }
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 border-2 border-yellow-400 text-xl transform hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-yellow-500/50"
                title={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t-2 border-yellow-600 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center md:text-left">
              <p className="text-xs font-bold text-yellow-300 mb-2">💳 ช่องทางการชำระเงิน</p>
              <div className="flex justify-center md:justify-start gap-2">
                {["💰", "🏦", "📱"].map((method, i) => (
                  <span key={i} className="text-xl bg-amber-800/50 px-2 py-1 rounded border border-yellow-500">
                    {method}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex gap-6 px-4 py-2 rounded-lg bg-amber-900/50 border border-yellow-500">
                <div>
                  <p className="text-yellow-300 font-bold text-lg">1K+</p>
                  <p className="text-xs text-yellow-100">สมาชิก</p>
                </div>
                <div className="border-l border-yellow-500"></div>
                <div>
                  <p className="text-yellow-300 font-bold text-lg">500+</p>
                  <p className="text-xs text-yellow-100">เกม</p>
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-xs font-bold text-yellow-300 mb-2">✅ ยืนยันแล้ว</p>
              <div className="flex justify-center md:justify-end gap-2">
                {["🛡️", "⭐", "🏅"].map((cert, i) => (
                  <span key={i} className="text-xl bg-amber-800/50 px-2 py-1 rounded border border-yellow-500">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-yellow-600/50">
            <p className="text-xs text-yellow-200 font-semibold">
              © {currentYear} <span className="text-yellow-300">BOARDGAME HAVEN</span> | เกมเดสก์ท็อปโจรสลัด
            </p>
            <p className="text-xs text-yellow-100 opacity-60 mt-2">
              ⚓ ยิหวา คณ.อีกนึ่ง | อัณฑะบ้านบอร์ดเกม 🏴‍☠️
            </p>
            <div className="mt-3 flex justify-center gap-4 text-xs">
              <Link href="#" className="text-yellow-200 hover:text-yellow-300 transition-colors">
                นโยบายความเป็นส่วนตัว
              </Link>
              <span className="text-yellow-600">|</span>
              <Link href="#" className="text-yellow-200 hover:text-yellow-300 transition-colors">
                เงื่อนไขการใช้งาน
              </Link>
              <span className="text-yellow-600">|</span>
              <Link href="#" className="text-yellow-200 hover:text-yellow-300 transition-colors">
                ติดต่อสนับสนุน
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
    </footer>
  );
}