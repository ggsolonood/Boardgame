"use client"

import { type FormEvent, useEffect, useState, type ChangeEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "../../../context/AuthContext"

type RoomForm = {
  name: string
  capacity: number
  status: string
  selectedTables: string[]
  price: number
  image: string
}

type TableOption = {
  _id: string
  number: string
  capacity: number
  image?: string
}

type RoomFromApi = {
  _id: string
  name: string
  capacity: number
  status: string
  tables: (string | { _id: string; number: string })[]
  price?: number
  image?: string
}

export default function EditRoomPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const roomId = params?.id

  const [form, setForm] = useState<RoomForm>({
    name: "",
    capacity: 1,
    status: "available",
    selectedTables: [],
    price: 0,
    image: "",
  })

  const [loadingRoom, setLoadingRoom] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")

  const [tables, setTables] = useState<TableOption[]>([])
  const [tablesLoading, setTablesLoading] = useState(false)
  const [tablesError, setTablesError] = useState("")

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
    if (!roomId) return

    const fetchRoom = async () => {
      setLoadingRoom(true)
      setError("")
      setOk("")

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${roomId}`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        })

        const json = await res.json().catch(() => null)

        if (!res.ok) {
          throw new Error(json?.message || "โหลดข้อมูลห้องไม่สำเร็จ")
        }

        const raw: RoomFromApi = (json?.data ?? json) as RoomFromApi

        const selectedTables = (raw.tables ?? []).map((t: any) => (typeof t === "string" ? t : t._id))

        setForm({
          name: raw.name ?? "",
          capacity: raw.capacity ?? 1,
          status: raw.status ?? "available",
          selectedTables,
          price: (raw as any).price ?? 0,
          image: (raw as any).image ?? "",
        })
      } catch (err: any) {
        console.error("FETCH ROOM ERROR:", err)
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลห้อง")
      } finally {
        setLoadingRoom(false)
      }
    }

    fetchRoom()
  }, [loading, user, token, roomId])

  useEffect(() => {
    if (loading) return
    if (!user || user.role?.toLowerCase() !== "admin") return

    const fetchTables = async () => {
      setTablesLoading(true)
      setTablesError("")

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/table`)
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.message || "โหลดรายการโต๊ะไม่สำเร็จ")
        }

        const json = await res.json().catch(() => null)
        const list = (json?.data ?? json ?? []) as TableOption[]
        setTables(Array.isArray(list) ? list : [])
      } catch (err: any) {
        console.error("FETCH TABLES ERROR:", err)
        setTablesError(err.message || "เกิดข้อผิดพลาดในการโหลดโต๊ะ")
      } finally {
        setTablesLoading(false)
      }
    }

    fetchTables()
  }, [loading, user])

  const updateText = (field: "name" | "status" | "image") => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  const updateNumber = (field: "capacity" | "price") => (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setForm((f) => ({
      ...f,
      [field]: v === "" ? 0 : Number(v),
    }))
  }

  const toggleTable = (id: string) => {
    setForm((f) => {
      const exists = f.selectedTables.includes(id)
      if (exists) {
        return {
          ...f,
          selectedTables: f.selectedTables.filter((t) => t !== id),
        }
      }
      return {
        ...f,
        selectedTables: [...f.selectedTables, id],
      }
    })
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setOk("")

    if (!token) {
      setError("คุณยังไม่ได้เข้าสู่ระบบ")
      return
    }
    if (!roomId) {
      setError("ไม่พบรหัสห้อง")
      return
    }

    if (!form.name.trim()) {
      setError("กรุณากรอกชื่อห้อง")
      return
    }
    if (form.capacity <= 0) {
      setError("จำนวนความจุต้องมากกว่า 0")
      return
    }
    if (form.price < 0) {
      setError("ราคาต้องเป็นเลขศูนย์หรือมากกว่า")
      return
    }
    if (form.selectedTables.length === 0) {
      setError("กรุณาเลือกโต๊ะอย่างน้อย 1 ตัว")
      return
    }

    const payload = {
      name: form.name,
      capacity: form.capacity,
      status: form.status,
      tables: form.selectedTables,
      price: form.price,
      image: form.image,
    }

    setSaving(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${roomId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.message || "แก้ไขห้องไม่สำเร็จ")
      }

      setOk("แก้ไขห้องสำเร็จแล้ว")
      router.push("/admin/home")
    } catch (err: any) {
      console.error("UPDATE ROOM ERROR:", err)
      setError(err.message || "เกิดข้อผิดพลาด")
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

  if (loadingRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 flex items-center justify-center">
        <p className="text-yellow-400 text-lg font-bold animate-pulse">🏴 กำลังโหลดข้อมูลห้อง...</p>
      </div>
    )
  }

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 flex items-center justify-center">
        <p className="text-red-400 text-lg font-bold">💀 ไม่พบรหัสห้องใน URL</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-10 pt-24">
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl shadow-yellow-900/50 rounded-2xl p-6 sm:p-8 border-4 border-yellow-600">
          <div className="mb-8 text-center">
            <h1
              className="text-4xl font-black text-yellow-400 mb-2"
              style={{
                textShadow: "3px 3px 0px rgba(0,0,0,0.8), 0 0 30px rgba(250, 204, 21, 0.4)",
              }}
            >
              ✏️ แก้ไขห้อง
            </h1>
            <p className="text-yellow-300 text-sm font-semibold">อัปเดตข้อมูลห้องในท่าเรือ</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">🏷️ ชื่อห้อง (Name)</label>
              <input
                type="text"
                value={form.name}
                onChange={updateText("name")}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500"
                placeholder="เช่น Room A, VIP Room"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-yellow-300 mb-2">👥 ความจุ (Capacity)</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={updateNumber("capacity")}
                  className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  min={1}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-yellow-300 mb-2">📊 สถานะ (Status)</label>
                <select
                  value={form.status}
                  onChange={updateText("status")}
                  className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="available">available</option>
                  <option value="in_use">in_use</option>
                  <option value="maintenance">maintenance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">💰 ราคา (Price)</label>
              <input
                type="number"
                value={form.price}
                onChange={updateNumber("price")}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                min={0}
              />
              <p className="text-xs text-yellow-400 mt-1">💡 ใส่ราคาตามหน่วยที่กำหนด (เช่น บาท/ชั่วโมง หรือ บาท/ครั้ง)</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">🖼️ รูปภาพห้อง (Image URL)</label>
              <input
                type="text"
                value={form.image}
                onChange={updateText("image")}
                className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500"
                placeholder="เช่น https://..."
              />
              <p className="text-xs text-yellow-400 mt-1">
                💡 ตอนนี้เก็บเป็นลิงก์รูป (URL) ถ้าอยากอัปโหลดไฟล์จริงค่อยทำ endpoint แยกอีกที
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-yellow-300 mb-2">🍽️ เลือกโต๊ะในห้องนี้ (Tables)</label>

              {tablesLoading && (
                <p className="text-xs text-yellow-400 font-bold animate-pulse">🏴 กำลังโหลดรายการโต๊ะ...</p>
              )}

              {tablesError && <p className="text-xs text-red-400 mb-2 font-semibold">💀 {tablesError}</p>}

              {!tablesLoading && !tablesError && tables.length === 0 && (
                <p className="text-xs text-yellow-400 font-semibold">⚠️ ยังไม่มีโต๊ะในระบบ กรุณาไปสร้างโต๊ะก่อน</p>
              )}

              <div className="mt-2 max-h-64 overflow-y-auto border-2 border-yellow-600 rounded-lg p-3 space-y-3 bg-slate-800/50">
                {tables.map((t) => (
                  <label
                    key={t._id}
                    className="flex items-center gap-3 text-sm text-yellow-100 font-semibold hover:bg-slate-700/50 p-2 rounded-md transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-yellow-500 text-yellow-600 focus:ring-yellow-500 bg-slate-700"
                      checked={form.selectedTables.includes(t._id)}
                      onChange={() => toggleTable(t._id)}
                    />
                    <div className="flex items-center gap-3">
                      {t.image && (
                        <img
                          src={t.image || "/placeholder.svg"}
                          alt={t.number}
                          className="h-12 w-12 rounded-md object-cover border-2 border-yellow-600 shadow-lg"
                        />
                      )}
                      <div>
                        <div className="font-bold text-yellow-300">🍽️ โต๊ะ {t.number}</div>
                        <div className="text-xs text-yellow-400">👥 รองรับ {t.capacity} คน</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-sm text-yellow-100 bg-red-900/80 border-2 border-red-600 px-4 py-3 rounded-lg font-semibold flex items-center gap-2">
                <span>💀</span>
                {error}
              </div>
            )}

            {ok && (
              <div className="text-sm text-yellow-100 bg-green-900/80 border-2 border-green-600 px-4 py-3 rounded-lg font-semibold flex items-center gap-2">
                <span>✅</span>
                {ok}
              </div>
            )}

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
        </div>
      </div>
    </div>
  )
}
