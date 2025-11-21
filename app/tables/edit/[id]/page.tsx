"use client"

import { type FormEvent, useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "../../../context/AuthContext"

type TableItem = {
  _id: string
  number: string
  capacity: number
  image?: string
}

type TableForm = {
  number: string
  capacity: number
  image: string
}

export default function EditTablePage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const params = useParams<{ id: string }>()

  const [form, setForm] = useState<TableForm>({
    number: "",
    capacity: 1,
    image: "",
  })

  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string>("")
  const [ok, setOk] = useState<string>("")

  const tableId = typeof params?.id === "string" ? params.id : ""

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/login")
      return
    }

    if (user.role?.toLowerCase() !== "admin") {
      router.push("/")
      return
    }
  }, [loading, user, router])

  useEffect(() => {
    if (loading) return
    if (!user || user.role?.toLowerCase() !== "admin") return
    if (!tableId) return

    const fetchOne = async () => {
      setFetching(true)
      setErr("")
      setOk("")

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/table/${tableId}`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        })

        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.message || "โหลดข้อมูลโต๊ะไม่สำเร็จ")
        }

        const json = await res.json().catch(() => null)
        const item = (json?.data ?? json) as TableItem

        if (!item || !item._id) {
          throw new Error("ไม่พบข้อมูลโต๊ะ")
        }

        setForm({
          number: item.number ?? "",
          capacity: item.capacity ?? 1,
          image: item.image ?? "",
        })
      } catch (e: any) {
        setErr(e.message || "เกิดข้อผิดพลาด")
      } finally {
        setFetching(false)
      }
    }

    fetchOne()
  }, [loading, user, token, tableId])

  const updateField = <K extends keyof TableForm>(key: K, value: TableForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) {
      setErr("กรุณาเข้าสู่ระบบก่อน")
      return
    }
    if (!tableId) {
      setErr("ไม่พบ ID โต๊ะ")
      return
    }

    setSaving(true)
    setErr("")
    setOk("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/table/${tableId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          number: form.number.trim(),
          capacity: form.capacity,
          image: form.image.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || "อัปเดตโต๊ะไม่สำเร็จ")
      }

      setOk("อัปเดตโต๊ะสำเร็จ")
      router.push("/admin/home")
    } catch (e: any) {
      setErr(e.message || "เกิดข้อผิดพลาดขณะอัปเดต")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user || user.role?.toLowerCase() !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 flex items-center justify-center">
        <p className="text-yellow-400 text-lg font-bold animate-pulse">🏴 กำลังตรวจสอบสิทธิ์...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-10 pt-24">
      <div className="w-full max-w-lg mx-auto px-4 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl shadow-yellow-900/50 rounded-2xl p-6 sm:p-8 border-4 border-yellow-600">
        <div className="mb-8 text-center">
          <h1
            className="text-4xl font-black text-yellow-400 mb-2"
            style={{
              textShadow: "3px 3px 0px rgba(0,0,0,0.8), 0 0 30px rgba(250, 204, 21, 0.4)",
            }}
          >
            ✏️ แก้ไขโต๊ะเกม
          </h1>
          <p className="text-yellow-300 text-sm font-semibold">อัปเดตข้อมูลโต๊ะในท่าเรือ</p>
        </div>

        {err && (
          <div className="mb-4 text-sm text-yellow-100 bg-red-900/80 border-2 border-red-600 px-4 py-3 rounded-lg font-semibold flex items-center gap-2">
            <span>💀</span>
            {err}
          </div>
        )}
        {ok && (
          <div className="mb-4 text-sm text-yellow-100 bg-green-900/80 border-2 border-green-600 px-4 py-3 rounded-lg font-semibold flex items-center gap-2">
            <span>✅</span>
            {ok}
          </div>
        )}

        {fetching ? (
          <p className="text-yellow-400 font-bold animate-pulse">🏴 กำลังโหลดข้อมูลโต๊ะ...</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">🏷️ หมายเลขโต๊ะ</label>
              <input
                type="text"
                value={form.number}
                onChange={(e) => updateField("number", e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500"
                placeholder="เช่น T1, A01, VIP-2"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">👥 จำนวนที่นั่ง</label>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => updateField("capacity", Number(e.target.value) || 1)}
                required
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">🖼️ รูปโต๊ะ (Image URL)</label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => updateField("image", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500"
                placeholder="เช่น https://example.com/table.jpg"
              />
              <p className="text-xs text-yellow-400 mt-1">💡 ตอนนี้เก็บเป็นลิงก์รูป (URL)</p>
              {form.image && (
                <div className="mt-3">
                  <p className="text-xs text-yellow-300 font-bold mb-1">ตัวอย่างรูป:</p>
                  <img
                    src={form.image || "/placeholder.svg"}
                    alt="ตัวอย่างรูปโต๊ะ"
                    className="w-24 h-24 object-cover rounded-md border-2 border-yellow-600 shadow-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t-2 border-yellow-600">
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
        )}
      </div>
    </div>
  )
}
