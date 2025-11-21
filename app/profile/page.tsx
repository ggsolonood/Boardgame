"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../app/context/AuthContext";
import MyPaymentsPage from "../components/payment";
import Navbar from "../components/nav";

const DEFAULT_AVATAR_URL =
  "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg";

type UserProfile = {
  _id: string;
  name: string;
  surname: string;
  email: string;
  picture?: string;
  age: number;
  role?: string;
  point?: number;
  createdAt?: string;
};

type BoardGame = {
  _id: string;
  name: string;
  price_per_hour: number;
  image?: string;
};

type Room = {
  _id: string;
  name: string;
  price: number;
  capacity: number;
  image?: string;
};

type Table = {
  _id: string;
  number: string;
  capacity: number;
  image?: string;
};

type PaymentInfo = {
  _id: string;
  amount: number;
  method?: string;
  status: string;
  paid_at?: string;
  createdAt?: string;
};

type Booking = {
  _id: string;
  user: string | UserProfile;
  board_game_id: string | BoardGame;
  room_id: string | Room;
  table_id: string | Table;
  start_time: string;
  end_time: string;
  status: string;
  duration: number;
  total_price: number;
  amount_player: number;
  payment?: PaymentInfo;
  createdAt?: string;
};

function formatDateTime(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("th-TH", { dateStyle: "medium" });
}

export default function ProfilePage() {
  const { logout } = useAuth();
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardGames, setBoardGames] = useState<Record<string, BoardGame>>({});

  useEffect(() => {
    if (loading) return;

    if (!user || !token) {
      router.push("/login");
      return;
    }

    const currentUserId =
      (user as any)._id || (user as any).id || (user as any).userId;

    if (!currentUserId) {
      setError("ไม่พบรหัสผู้ใช้ (user id) จากข้อมูลการล็อกอิน");
      setLoadingData(false);
      return;
    }

    const fetchData = async () => {
      setLoadingData(true);
      setError(null);

      try {
        try {
          const profileRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${currentUserId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (profileRes.ok) {
            const profileJson = await profileRes.json().catch(() => null);
            setProfile(profileJson?.data ?? profileJson ?? null);
          } else {
            const profileJson = await profileRes.json().catch(() => null);
            throw new Error(
              profileJson?.message || "โหลดข้อมูลโปรไฟล์ไม่สำเร็จ"
            );
          }
        } catch (err) {
          console.error("โหลด /users/:id มีปัญหา", err);
        }

        try {
          const bookingRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/booking-boardgame/user/${currentUserId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (bookingRes.ok) {
            const bookingJson = await bookingRes.json().catch(() => null);
            const raw = (bookingJson?.data ?? bookingJson ?? []) as any;
            const list: Booking[] = Array.isArray(raw) ? raw : [];
            setBookings(list);
          } else if (bookingRes.status === 404) {
            setBookings([]);
          } else {
            const bookingJson = await bookingRes.json().catch(() => null);
            throw new Error(
              bookingJson?.message || "โหลดประวัติการจองไม่สำเร็จ"
            );
          }
        } catch (err) {
          console.error("โหลด /booking-boardgame/user/:id มีปัญหา", err);
          setBookings([]);
        }
      } catch (err: any) {
        console.error("PROFILE FETCH ERROR:", err);
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [loading, user, token, router]);

  useEffect(() => {
    if (!token) return;
    if (!bookings.length) return;

    const missingIds = bookings
      .map((bk) =>
        typeof bk.board_game_id === "string" ? bk.board_game_id : null
      )
      .filter((id): id is string => !!id && !boardGames[id]);

    if (missingIds.length === 0) return;

    const fetchBoardGames = async () => {
      const newMap: Record<string, BoardGame> = {};

      for (const id of missingIds) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/boardgame/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!res.ok) continue;

          const json = await res.json().catch(() => null);
          const game = (json?.data ?? json) as BoardGame;

          if (game && game._id) {
            newMap[game._id] = game;
          }
        } catch (err) {
          console.error("โหลด boardgame ไม่สำเร็จ:", err);
        }
      }

      if (Object.keys(newMap).length > 0) {
        setBoardGames((prev) => ({ ...prev, ...newMap }));
      }
    };

    fetchBoardGames();
  }, [bookings, token, boardGames]);

  if (loading || (!user && !profile)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-700 to-orange-600 flex items-center justify-center">
        <p className="text-yellow-100 text-lg">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!user || !token) {
    return null;
  }

  const mergedProfile: UserProfile = {
    _id: (profile?._id ?? (user as any)._id ?? (user as any).id) || "",
    name: profile?.name ?? (user as any).name ?? "",
    surname: profile?.surname ?? (user as any).surname ?? "",
    email: profile?.email ?? (user as any).email ?? "",
    picture: (() => {
      const p1 = profile?.picture;
      const p2 = (user as any).picture;

      if (typeof p1 === "string" && p1.trim() !== "") return p1;
      if (typeof p2 === "string" && p2.trim() !== "") return p2;

      return DEFAULT_AVATAR_URL;
    })(),
    age: profile?.age ?? (user as any).age ?? 0,
    role: profile?.role ?? (user as any).role ?? "User",
    point: profile?.point ?? (user as any).point ?? 0,
    createdAt: profile?.createdAt,
  };

  const avatarSrc =
    mergedProfile.picture && mergedProfile.picture.trim() !== ""
      ? mergedProfile.picture
      : DEFAULT_AVATAR_URL;

  const handleGoToPayment = (bk: Booking) => {
    const userPoint = mergedProfile.point ?? 0;

    if (userPoint < bk.total_price) {
      setError(
        `แต้มของคุณไม่เพียงพอสำหรับการจองนี้ (ต้องใช้ ${bk.total_price.toFixed(
          2
        )} แต้ม, คุณมี ${userPoint} แต้ม)`
      );
      return;
    }

    router.push(`/payment?bookingId=${bk._id}`);
  };

  const handleTopup = () => {
    router.push("/topup");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-8">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <h1
            className="text-4xl font-bold mb-2 text-amber-900 text-center"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
          >
            ⚓ โปรไฟล์ของฉัน 🏴‍☠️
          </h1>

          {error && (
            <div className="rounded-lg border-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
              ⚠️ {error}
            </div>
          )}

          <section className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl shadow-2xl border-4 border-yellow-600 p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
            <div className="flex items-start gap-4 flex-1">
              <img
                src={avatarSrc || "/placeholder.svg"}
                alt={mergedProfile.name || "avatar"}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-yellow-600 shadow-lg"
              />
              <div className="space-y-1 text-sm flex-1">
                <p className="text-xl font-bold text-amber-900">
                  👑 {mergedProfile.name} {mergedProfile.surname}
                </p>
                <p className="text-amber-800">📧 {mergedProfile.email}</p>
                <p className="text-amber-800">
                  🎂 อายุ:{" "}
                  <span className="font-medium">{mergedProfile.age}</span> ปี
                </p>
                <p className="text-amber-800">
                  🎭 บทบาท:{" "}
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-xs font-bold text-amber-900 border-2 border-yellow-600 shadow-md">
                    {mergedProfile.role}
                  </span>
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <p className="text-amber-800 text-base">
                    💰 คะแนนสะสม:{" "}
                    <span className="font-bold text-yellow-600 text-lg">
                      {mergedProfile.point}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={handleTopup}
                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 px-4 py-2 text-sm font-bold text-amber-900 border-2 border-yellow-600 shadow-lg hover:scale-105 hover:shadow-xl transition-all"
                  >
                    💎 เติมเงิน / เติมแต้ม
                  </button>
                </div>

                {mergedProfile.createdAt && (
                  <p className="text-amber-700 text-xs">
                    📜 เป็นสมาชิกตั้งแต่: {formatDate(mergedProfile.createdAt)}
                  </p>
                )}
              </div>
              <button
              onClick={logout}
              className="px-6 py-3 rounded-lg border border-gray-300 shadow-sm
                   text-lg font-medium hover:bg-gray-100"
            >
              Logout
            </button>
            </div>
            
          </section>

          <section className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl shadow-2xl border-4 border-yellow-600 p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-2xl font-bold text-amber-900">
                🎮 ประวัติการจองบอร์ดเกม
              </h2>
              {loadingData && (
                <span className="text-xs text-amber-700">กำลังโหลด...</span>
              )}
            </div>

            {bookings.length === 0 && !loadingData && (
              <p className="text-sm text-amber-700">
                ยังไม่มีประวัติการจองบอร์ดเกม
              </p>
            )}

            <div className="space-y-3">
              {bookings.map((bk) => {
                let bg: BoardGame | null = null;
                if (typeof bk.board_game_id === "string") {
                  bg = boardGames[bk.board_game_id] ?? null;
                } else {
                  bg = bk.board_game_id as BoardGame;
                }

                const room =
                  typeof bk.room_id === "string" ? null : (bk.room_id as Room);
                const table =
                  typeof bk.table_id === "string"
                    ? null
                    : (bk.table_id as Table);
                const pay = bk.payment;

                const isPaidOrDone =
                  bk.status === "done" ||
                  bk.status === "confirmed" ||
                  pay?.status === "paid";

                return (
                  <div
                    key={bk._id}
                    className="border-4 border-yellow-500 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:items-stretch shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex-shrink-0 flex gap-3">
                      {bg?.image && bg.image.trim() !== "" && (
                        <img
                          src={bg.image || "/placeholder.svg"}
                          alt={bg.name}
                          className="w-20 h-20 rounded-md object-cover border-2 border-yellow-600"
                        />
                      )}
                      <div className="space-y-1 text-sm">
                        <p className="font-bold text-amber-900">
                          🎲 เกม: {bg?.name ?? "ไม่พบข้อมูลเกม"}
                        </p>
                        {room && (
                          <p className="text-amber-800">
                            🏠 ห้อง: {room.name} (ราคา {room.price} บาท)
                          </p>
                        )}
                        {table && (
                          <p className="text-amber-800">
                            🪑 โต๊ะ: {table.number} (รองรับ {table.capacity} คน)
                          </p>
                        )}
                        <p className="text-amber-800">
                          👥 ผู้เล่น: {bk.amount_player} คน
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mt-2 sm:mt-0">
                      <div className="space-y-1">
                        <p className="text-amber-800">
                          ⏰ เวลาเริ่ม:{" "}
                          <span className="font-medium">
                            {formatDateTime(bk.start_time)}
                          </span>
                        </p>
                        <p className="text-amber-800">
                          ⏰ เวลาสิ้นสุด:{" "}
                          <span className="font-medium">
                            {formatDateTime(bk.end_time)}
                          </span>
                        </p>
                        <p className="text-amber-800">
                          ⌛ ระยะเวลาเล่น:{" "}
                          <span className="font-medium">
                            {bk.duration} ชั่วโมง
                          </span>
                        </p>
                        <p className="text-amber-800">
                          📊 สถานะการจอง:{" "}
                          <span
                            className={
                              bk.status === "confirmed" || bk.status === "done"
                                ? "font-semibold text-green-600"
                                : bk.status === "cancelled"
                                ? "font-semibold text-red-600"
                                : "font-semibold text-orange-600"
                            }
                          >
                            {bk.status}
                          </span>
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-amber-800">
                          💵 ราคารวม:{" "}
                          <span className="font-semibold text-green-700">
                            {bk.total_price.toFixed(2)} บาท
                          </span>
                        </p>

                        {pay ? (
                          <>
                            <p className="text-amber-800">
                              💳 การชำระเงิน:{" "}
                              <span
                                className={
                                  pay.status === "paid"
                                    ? "text-green-600 font-semibold"
                                    : pay.status === "failed"
                                    ? "text-red-600 font-semibold"
                                    : "text-orange-600 font-semibold"
                                }
                              >
                                {pay.status}
                              </span>
                            </p>
                            <p className="text-amber-800">
                              จำนวนที่ชำระ:{" "}
                              <span className="font-medium">
                                {pay.amount.toFixed(2)} บาท
                              </span>
                            </p>
                            {pay.method && (
                              <p className="text-amber-700">
                                วิธีชำระเงิน: {pay.method}
                              </p>
                            )}
                            {pay.paid_at && (
                              <p className="text-amber-600 text-xs">
                                ชำระเมื่อ: {formatDateTime(pay.paid_at)}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="space-y-2">
                            {isPaidOrDone ? (
                              <button
                                type="button"
                                disabled
                                className="inline-flex items-center rounded-md bg-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 cursor-default"
                              >
                                ✅ ชำระเสร็จสิ้น
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleGoToPayment(bk)}
                                className="inline-flex items-center rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 px-3 py-2 text-xs font-bold text-amber-900 border-2 border-yellow-600 shadow-lg hover:scale-105 hover:shadow-xl transition-all"
                              >
                                💰 ชำระเงินสำหรับการจองนี้
                              </button>
                            )}
                          </div>
                        )}

                        {bk.createdAt && (
                          <p className="text-amber-600 text-xs">
                            📅 สร้างคำสั่งจอง: {formatDateTime(bk.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
      <MyPaymentsPage />
    </>
  );
}
