"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"

type Payment = {
  _id: string
  user_id: string
  booking_id?: string
  amount: number
  method?: string
  status: string
  paid_at?: string
  createdAt?: string
}

type Booking = {
  _id: string
  user_id: string
  board_game_id: string
  room_id: string
  table_id: string
  amount_player: number
  start_time: string
  end_time: string
  duration: number
  status: string
}

type BoardGame = {
  _id: string
  name: string
  image?: string
}

type Room = {
  _id: string
  name: string
  price: number
}

type Table = {
  _id: string
  number: string
  capacity: number
}

function formatDateTime(value?: string) {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get("bookingId")

  const { user, token, loading } = useAuth()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [boardGame, setBoardGame] = useState<BoardGame | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [table, setTable] = useState<Table | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [userPoint, setUserPoint] = useState<number | null>(null)

  const totalPrice = useMemo(() => {
    return (room?.price || 0) * (booking?.amount_player || 0)
  }, [room, booking])

  const enoughPoint = useMemo(() => {
    return userPoint !== null && userPoint >= totalPrice
  }, [userPoint, totalPrice])

  const remainingPoint = useMemo(() => {
    return userPoint !== null ? userPoint - totalPrice : 0
  }, [userPoint, totalPrice])

  useEffect(() => {
    if (!user || !token || !bookingId) return

    const fetchBookingData = async () => {
      setLoadingData(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json().catch(() => null)
          const bookingData = data?.data ?? data
          setBooking(bookingData as Booking)
        } else {
          setError("ไม่พบข้อมูลการจอง กรุณากลับไปหน้าประวัติการจอง")
        }
      } catch (err) {
        console.error("Failed to fetch booking data:", err)
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลการจอง")
      } finally {
        setLoadingData(false)
      }
    }

    fetchBookingData()
  }, [user, token, bookingId])

  useEffect(() => {
    if (!booking) return

    const fetchPaymentData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/user/${booking.user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json().catch(() => null)
          const payments = (data?.data ?? data ?? []) as Payment[]
          const paymentForBooking = payments.find((p) => p.booking_id === booking._id)
          setPayment(paymentForBooking || null)
        }
      } catch (err) {
        console.error("Failed to fetch payment data:", err)
      }
    }

    fetchPaymentData()
  }, [booking, token])

  useEffect(() => {
    if (!user) return

    const fetchUserPoint = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user._id}/points`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json().catch(() => null)
          setUserPoint(data?.points || 0)
        }
      } catch (err) {
        console.error("Failed to fetch user points:", err)
      }
    }

    fetchUserPoint()
  }, [user, token])

  const handleConfirmPayment = async () => {
    if (!user || !token || !booking || !enoughPoint) return

    setSubmitting(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user._id,
          booking_id: booking._id,
          amount: totalPrice,
          method: "points",
          status: "paid",
        }),
      })

      if (res.ok) {
        setSuccess("การชำระเงินสำเร็จ")
      } else {
        setError("เกิดข้อผิดพลาดในการชำระเงิน")
      }
    } catch (err) {
      console.error("Failed to confirm payment:", err)
      setError("เกิดข้อผิดพลาดในการชำระเงิน")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || (loadingData && !booking && !error)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-700 to-orange-600 flex items-center justify-center">
        <p className="text-white text-xl font-bold">⏳ กำลังโหลดข้อมูลการชำระเงิน...</p>
      </div>
    )
  }

  if (!user || !token) return null

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-700 to-orange-600 flex items-center justify-center">
        <p className="text-white text-xl font-bold border-4 border-red-600 bg-red-900/50 px-6 py-4 rounded-lg shadow-2xl">
          ❌ ไม่พบข้อมูลการจอง กรุณากลับไปหน้าประวัติการจอง
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-700 to-orange-600 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <h1 className="text-4xl font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] text-center mb-6">
          💰 ยืนยันการชำระเงิน 🏴‍☠️
        </h1>

        {error && (
          <div className="rounded-lg border-4 border-red-600 bg-red-900/80 px-4 py-3 text-sm text-white font-semibold shadow-2xl">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border-4 border-green-600 bg-green-900/80 px-4 py-3 text-sm text-white font-semibold shadow-2xl">
            ✅ {success}
          </div>
        )}

        <section className="bg-gradient-to-br from-amber-100 to-yellow-50 rounded-xl shadow-2xl border-4 border-yellow-600 p-4 sm:p-6 space-y-4">
          <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">📋 ข้อมูลการจอง</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            {boardGame?.image && (
              <img
                src={boardGame.image || "/placeholder.svg"}
                alt={boardGame.name}
                className="w-28 h-28 rounded-lg object-cover border-4 border-yellow-600 shadow-lg"
              />
            )}

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-gray-700">
                  🎮 เกมที่จอง: <span className="font-bold text-amber-900">{boardGame?.name ?? "ไม่พบข้อมูลเกม"}</span>
                </p>
                {room && (
                  <p className="text-gray-700">
                    🏠 ห้อง:{" "}
                    <span className="font-bold text-amber-900">
                      {room.name} (ราคา {room.price} บาท)
                    </span>
                  </p>
                )}
                {table && (
                  <p className="text-gray-700">
                    🪑 โต๊ะ:{" "}
                    <span className="font-bold text-amber-900">
                      {table.number} (รองรับ {table.capacity} คน)
                    </span>
                  </p>
                )}
                <p className="text-gray-700">
                  👥 ผู้เล่น: <span className="font-bold text-amber-900">{booking.amount_player} คน</span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-gray-700">
                  ⏰ เวลาเริ่ม: <span className="font-semibold text-amber-900">{formatDateTime(booking.start_time)}</span>
                </p>
                <p className="text-gray-700">
                  ⏱️ เวลาสิ้นสุด: <span className="font-semibold text-amber-900">{formatDateTime(booking.end_time)}</span>
                </p>
                <p className="text-gray-700">
                  ⌛ ระยะเวลาเล่น: <span className="font-semibold text-amber-900">{booking.duration} ชั่วโมง</span>
                </p>
                <p className="text-gray-700">
                  📊 สถานะการจองปัจจุบัน: <span className="font-bold text-amber-900">{booking.status}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-amber-100 to-yellow-50 rounded-xl shadow-2xl border-4 border-yellow-600 p-4 sm:p-6 space-y-4">
          <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">💳 สรุปการชำระเงิน</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2 bg-white border-4 border-amber-600 rounded-lg p-4 shadow-lg">
              <p className="text-gray-700">
                💰 ราคารวมการจอง: <span className="font-bold text-2xl text-green-700">{totalPrice.toFixed(2)} บาท</span>
              </p>
              <p className="text-gray-700">
                🪙 แต้มที่คุณมีตอนนี้: <span className="font-bold text-xl text-yellow-600">{userPoint ?? 0}</span>
              </p>
              <p className="text-gray-700">
                ⚖️ แต้มคงเหลือหลังการชำระ:{" "}
                <span className={enoughPoint ? "font-bold text-xl text-green-700" : "font-bold text-xl text-red-600"}>
                  {remainingPoint}
                </span>
              </p>
            </div>

            <div className="space-y-2 bg-white border-4 border-amber-600 rounded-lg p-4 shadow-lg">
              <p className="font-bold text-amber-900">📜 เมื่อชำระเงินสำเร็จ ระบบจะ:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>✅ หักแต้มจากบัญชีของคุณตามยอดราคารวม</li>
                <li>
                  ✅ เปลี่ยนสถานะการจองเป็น <span className="font-bold text-green-700">confirmed</span>
                </li>
                <li>
                  ✅ เปลี่ยนสถานะห้องเป็น <span className="font-bold text-orange-700">ใช้งานอยู่</span> ในช่วงเวลาที่คุณจอง
                </li>
              </ul>
            </div>
          </div>

          {payment && (
            <div className="mt-3 rounded-lg border-4 border-green-600 bg-green-900/80 px-4 py-3 text-sm text-white font-bold shadow-lg">
              ✅ การจองนี้มีข้อมูลการชำระเงินแล้ว (สถานะ: <span className="text-yellow-300">{payment.status}</span>)
            </div>
          )}

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {!enoughPoint && (
              <p className="text-sm font-bold text-red-700 bg-red-100 border-2 border-red-600 rounded-lg px-3 py-2">
                ⚠️ แต้มของคุณไม่เพียงพอสำหรับการชำระเงินครั้งนี้
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-lg border-4 border-gray-600 bg-gradient-to-br from-gray-200 to-gray-300 text-sm font-bold text-gray-800 hover:from-gray-300 hover:to-gray-400 shadow-lg transform hover:scale-105 transition-all"
              >
                ❌ ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={submitting || !enoughPoint || !!payment}
                className="px-6 py-3 rounded-lg border-4 border-yellow-600 bg-gradient-to-br from-green-600 to-emerald-700 text-sm font-bold text-white hover:from-green-700 hover:to-emerald-800 shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {payment ? "✅ ชำระเงินแล้ว" : submitting ? "⏳ กำลังชำระเงิน..." : "💰 ยืนยันการชำระเงิน"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
