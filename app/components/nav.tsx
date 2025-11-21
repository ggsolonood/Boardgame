"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();

  const displayName = user?.name || user?.email;

  const handleGetStarted = () => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/booking-boardgame");
    }
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  const handleAdmin = () => {
    router.push("/admin/home");
  };

  return (
    <div className="relative">
      <nav className="w-full bg-gradient-to-r from-amber-900 via-yellow-900 to-amber-900 border-b-4 border-yellow-600 shadow-lg shadow-yellow-900/50">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <span className="text-3xl">☠️</span>
            </div>
            <span className="self-center text-2xl font-bold whitespace-nowrap bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent" 
                  style={{
                    textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(255,215,0,0.3)",
                    letterSpacing: "2px"
                  }}>
              BOARDGAME HAVEN
            </span>
          </div>

          <div className="inline-flex items-center md:order-2 space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              onClick={handleGetStarted}
              className="relative text-white bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 border-2 border-yellow-400 focus:ring-4 focus:ring-red-500/50 shadow-lg font-bold leading-5 rounded-lg text-sm px-4 py-2 focus:outline-none transform hover:scale-105 transition-all duration-200 overflow-hidden"
            >
              <span className="relative z-10">⚔️ SET SAIL</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            </button>

            {displayName && (
              <button
                type="button"
                onClick={handleProfile}
                className="text-yellow-300 bg-gradient-to-br from-amber-900 to-amber-950 hover:from-amber-800 hover:to-amber-900 border-2 border-yellow-500 focus:ring-4 focus:ring-yellow-400/50 shadow-md font-bold leading-5 rounded-lg text-sm px-4 py-2 focus:outline-none transform hover:scale-105 transition-all duration-200"
              >
                🏴 {displayName}
              </button>
            )}

            {user?.role === "admin" && (
              <button
                type="button"
                onClick={handleAdmin}
                className="text-yellow-300 bg-gradient-to-r from-purple-900 to-purple-950 hover:from-purple-800 hover:to-purple-900 border-2 border-purple-400 focus:ring-4 focus:ring-purple-500/50 shadow-lg font-bold leading-5 rounded-lg text-sm px-4 py-2 focus:outline-none transform hover:scale-105 transition-all duration-200"
              >
                👑 CAPTAIN
              </button>
            )}

            <button
              data-collapse-toggle="navbar-cta"
              type="button"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm text-yellow-300 md:hidden hover:bg-amber-800 hover:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-yellow-500"
              aria-controls="navbar-cta"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-6 h-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="M5 7h14M5 12h14M5 17h14"
                />
              </svg>
            </button>
          </div>

          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-cta"
          >
            <ul className="font-bold flex flex-col p-4 mt-4 border-2 border-yellow-600 rounded-lg bg-amber-950/80 md:p-0 md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-transparent">
              <li>
                <Link
                  href="/"
                  className="block py-2 px-3 rounded-lg md:p-0 text-yellow-300 bg-gradient-to-r from-red-700 to-red-900 md:bg-transparent md:text-yellow-300 transition-colors hover:text-yellow-100 md:hover:text-yellow-100"
                  aria-current="page"
                >
                  🏠 HOME
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block py-2 px-3 rounded-lg text-yellow-300 hover:bg-amber-800 md:hover:bg-transparent md:border-0 md:hover:text-yellow-100 md:p-0 transition-colors"
                >
                  📖 ABOUT
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="block py-2 px-3 rounded-lg text-yellow-300 hover:bg-amber-800 md:hover:bg-transparent md:border-0 md:hover:text-yellow-100 md:p-0 transition-colors"
                >
                  🎮 SERVICES
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="block py-2 px-3 rounded-lg text-yellow-300 hover:bg-amber-800 md:hover:bg-transparent md:border-0 md:hover:text-yellow-100 md:p-0 transition-colors"
                >
                  📮 CONTACT
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}