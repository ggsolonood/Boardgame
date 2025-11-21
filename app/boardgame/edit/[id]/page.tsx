"use client"

import { type FormEvent, useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "../../../context/AuthContext"

type Boardgame = {
  _id?: string
  name: string
  description: string
  price: number
  players_min: number
  players_max: number
  duration: number
  category: string
  publisher: string
  thumbnail: string
}

export default function EditBoardgamePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id as string | undefined

  const { user, token } = useAuth()

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Boardgame>({
    name: "",
    category: "",
    description: "",
    price: 0,
    players_min: 1,
    players_max: 4,
    duration: 60,
    publisher: "",
    thumbnail: "",
  })

  const update = <K extends keyof Boardgame>(key: K, value: Boardgame[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    if (!id) {
      setErr("ไม่พบรหัสบอร์ดเกม (id)")
      setLoading(false)
      return
    }

    const fetchBoardgame = async () => {
      setLoading(true)
      setErr(null)

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boardgame/${id}`)
        const json = await res.json().catch(() => null)

        if (!res.ok) {
          throw new Error(json?.message || "โหลดข้อมูลบอร์ดเกมไม่สำเร็จ")
        }

        const raw = json?.data ?? json
        setForm({
          _id: raw._id,
          name: raw.name ?? "",
          description: raw.description ?? "",
          price: Number(raw.price ?? 0),
          players_min: Number(raw.players_min ?? 1),
          players_max: Number(raw.players_max ?? 4),
          duration: Number(raw.duration ?? 60),
          category: raw.category ?? "",
          publisher: raw.publisher ?? "",
          thumbnail: raw.thumbnail ?? "",
        })
      } catch (e: any) {
        console.error("FETCH BOARDGAME ERROR:", e)
        setErr(e.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลบอร์ดเกม")
      } finally {
        setLoading(false)
      }
    }

    fetchBoardgame()
  }, [id])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!id) return

    if (!token) {
      setErr("กรุณาเข้าสู่ระบบก่อน")
      return
    }

    setSaving(true)
    setErr(null)
    setSuccess(null)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boardgame/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: form.price,
          players_min: form.players_min,
          players_max: form.players_max,
          duration: form.duration,
          category: form.category,
          publisher: form.publisher,
          thumbnail: form.thumbnail,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.message || "อัปเดตบอร์ดเกมไม่สำเร็จ")
      }

      setSuccess("บันทึกข้อมูลบอร์ดเกมเรียบร้อยแล้ว")
    } catch (e: any) {
      console.error("UPDATE BOARDGAME ERROR:", e)
      setErr(e.message || "เกิดข้อผิดพลาดขณะบันทึกข้อมูล")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-yellow-400 text-lg font-bold animate-pulse">กำลังโหลดข้อมูลบอร์ดเกม...</p>
      </div>
    )
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-red-400 font-bold">ไม่พบรหัสบอร์ดเกม</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-10 pt-24">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6 text-center">
          <h1
            className="text-4xl font-black text-yellow-400 mb-2"
            style={{
              textShadow: "3px 3px 0px rgba(0,0,0,0.8), 0 0 30px rgba(250, 204, 21, 0.4)",
            }}
          >
            ✏️ แก้ไขบอร์ดเกม
          </h1>
          <p className="text-yellow-300 text-sm font-semibold">อัปเดตข้อมูลบอร์ดเกมในคลัง</p>
        </div>

        {err && (
          <div className="mb-4 text-sm text-yellow-100 bg-red-900/80 border-2 border-red-600 px-4 py-3 rounded-lg font-semibold flex items-center gap-2">
            <span>💀</span>
            {err}
          </div>
        )}

        {success && (
          <div className="mb-4 text-sm text-yellow-100 bg-green-900/80 border-2 border-green-600 px-4 py-3 rounded-lg font-semibold flex items-center gap-2">
            <span>✅</span>
            {success}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl shadow-2xl shadow-yellow-900/50 border-4 border-yellow-600 px-6 py-8 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">🎮 ชื่อเกม</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">📦 หมวดหมู่</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-yellow-300 mb-2">📜 รายละเอียดเกม</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">💰 ราคา (บาท)</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => update("price", Number(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">👥 ผู้เล่นขั้นต่ำ</label>
              <input
                type="number"
                min={1}
                value={form.players_min}
                onChange={(e) => update("players_min", Number(e.target.value) || 1)}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">👨‍👩‍👧‍👦 ผู้เล่นสูงสุด</label>
              <input
                type="number"
                min={1}
                value={form.players_max}
                onChange={(e) => update("players_max", Number(e.target.value) || 1)}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">⏰ เวลาเล่นโดยเฉลี่ย (นาที)</label>
              <input
                type="number"
                min={0}
                value={form.duration}
                onChange={(e) => update("duration", Number(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">🏢 ผู้จัดทำ / Publisher</label>
              <input
                type="text"
                value={form.publisher}
                onChange={(e) => update("publisher", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-yellow-300 mb-2">🖼️ รูปภาพ (URL)</label>
            <input
              type="text"
              value={form.thumbnail}
              onChange={(e) => update("thumbnail", e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500"
              placeholder="เช่น https://example.com/boardgame.jpg"
            />
            {form.thumbnail && (
              <div className="mt-3">
                <p className="text-xs text-yellow-300 font-bold mb-1">ตัวอย่างรูป:</p>
                <img
                  src={form.thumbnail || "/placeholder.svg"}
                  alt="preview"
                  className="w-32 h-32 object-cover rounded-md border-2 border-yellow-600 shadow-lg"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).style.display = "none"
                  }}
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t-2 border-yellow-600">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 rounded-lg border-2 border-yellow-500 bg-slate-800 hover:bg-slate-700 text-yellow-400 text-sm font-bold transition-all duration-200 transform hover:scale-105"
            >
              ← ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white text-sm font-black border-2 border-yellow-400 disabled:opacity-60 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {saving ? "⏳ กำลังบันทึก..." : "💾 บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
