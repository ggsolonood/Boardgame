"use client"

import { type FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"

export default function TopupPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()

  const [amount, setAmount] = useState<number>(100)
  const [method, setMethod] = useState<string>("promptpay")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return

    if (!user || !token) {
      router.push("/login")
      return
    }
  }, [loading, user, token, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <p className="text-amber-900 font-bold text-lg">กำลังโหลด...</p>
      </div>
    )
  }

  if (!user || !token) {
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (amount <= 0 || Number.isNaN(amount)) {
      setError("กรุณากรอกจำนวนแต้มที่มากกว่า 0")
      return
    }

    try {
      setSubmitting(true)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/topup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          method,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.message || "เติมแต้มไม่สำเร็จ")
      }

      const newPoint = data?.point ?? data?.data?.point ?? null

      if (typeof newPoint === "number") {
        setSuccess(`เติมแต้มสำเร็จ! แต้มใหม่ของคุณคือ ${newPoint.toFixed(2)} แต้ม`)
      } else {
        setSuccess("เติมแต้มสำเร็จแล้ว!")
      }
    } catch (err: any) {
      console.error("TOPUP ERROR:", err)
      setError(err.message || "เกิดข้อผิดพลาดในการเติมแต้ม")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1
            className="text-5xl font-black text-amber-900 mb-3"
            style={{
              textShadow: "3px 3px 0px rgba(251, 191, 36, 0.3)",
            }}
          >
            💰 เติมสมบัติโจรสลัด
          </h1>
          <p className="text-amber-800 font-semibold text-lg">เติมแต้มเพื่อผจญภัยต่อไป!</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border-4 border-red-600 bg-red-100 px-6 py-4 text-base text-red-900 font-bold shadow-lg flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border-4 border-green-600 bg-green-100 px-6 py-4 text-base text-green-900 font-bold shadow-lg flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <span>{success}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl shadow-2xl border-4 border-yellow-600 p-8 space-y-6"
        >
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-base font-black text-amber-900">
              <span className="text-xl">🏴‍☠️</span>
              วิธีการเติมเงิน
            </label>
            <select
              className="w-full border-2 border-yellow-600 rounded-lg px-4 py-3 text-base font-semibold bg-white text-amber-900 focus:outline-none focus:ring-4 focus:ring-yellow-400 shadow-md"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="promptpay">💳 PromptPay</option>
              <option value="bank_transfer">🏦 โอนผ่านธนาคาร</option>
              <option value="cash">💵 ชำระเงินสด</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-base font-black text-amber-900">
              <span className="text-xl">💎</span>
              จำนวนแต้มที่ต้องการเติม
            </label>
            <input
              type="number"
              min={1}
              className="w-full border-2 border-yellow-600 rounded-lg px-4 py-3 text-base font-semibold bg-white text-amber-900 focus:outline-none focus:ring-4 focus:ring-yellow-400 shadow-md"
              value={amount}
              onChange={(e) => {
                const v = Number(e.target.value)
                setAmount(Number.isNaN(v) ? 0 : v)
              }}
            />
            <p className="text-sm text-amber-800 font-semibold flex items-center gap-2">
              <span>ℹ️</span>
              ตัวอย่าง: 100 แต้ม = 100 บาท
            </p>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t-2 border-yellow-600">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-lg border-2 border-yellow-600 bg-white text-amber-900 text-base font-bold hover:bg-yellow-50 transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              ← ย้อนกลับ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-base font-black border-2 border-yellow-400 hover:from-yellow-500 hover:to-orange-500 disabled:opacity-60 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {submitting ? "⏳ กำลังดำเนินการ..." : "⚓ ยืนยันการเติมแต้ม"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
