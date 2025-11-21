"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../context/AuthContext"

type UserItem = {
  _id: string
  name: string
  surname: string
  email: string
  picture?: string
  age: number
  role?: string
  point?: number
}

export default function UsersListPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()

  const [items, setItems] = useState<UserItem[]>([])
  const [listLoading, setListLoading] = useState<boolean>(true)
  const [err, setErr] = useState<string>("")

  const [search, setSearch] = useState<string>("")
  const [searching, setSearching] = useState<boolean>(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push("/login")
      return
    }
    if (user.role !== "admin") {
      router.push("/")
    }
  }, [loading, user, router])

  useEffect(() => {
    if (loading) return
    if (!user || user.role !== "admin") return

    const fetchAll = async () => {
      setListLoading(true)
      setErr("")

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        })

        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.message || "โหลดข้อมูลผู้ใช้ไม่สำเร็จ")
        }

        const data: UserItem[] = await res.json()
        setItems(data)
      } catch (e: any) {
        setErr(e.message || "เกิดข้อผิดพลาด")
      } finally {
        setListLoading(false)
      }
    }

    fetchAll()
  }, [loading, user, token])

  const onSearch = async (e: FormEvent) => {
    e.preventDefault()
    setErr("")

    if (!search.trim()) {
      setSearching(false)
      setListLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        })

        if (!res.ok) throw new Error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ")
        const data: UserItem[] = await res.json()
        setItems(data)
      } catch (e: any) {
        setErr(e.message || "เกิดข้อผิดพลาด")
      } finally {
        setListLoading(false)
      }
      return
    }

    setSearching(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/findname?name=${encodeURIComponent(search.trim())}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || "ค้นหาผู้ใช้ไม่สำเร็จ")
      }

      const data: UserItem[] = await res.json()
      setItems(data)
    } catch (e: any) {
      setErr(e.message || "เกิดข้อผิดพลาด")
    } finally {
      setSearching(false)
    }
  }

  const onDelete = async (id: string) => {
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อน")
      return
    }
    if (!confirm("ต้องการลบผู้ใช้คนนี้จริง ๆ หรือไม่?")) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || "ลบไม่สำเร็จ")
      }

      setItems((prev) => prev.filter((u) => u._id !== id))
    } catch (e: any) {
      alert(e.message || "เกิดข้อผิดพลาดขณะลบ")
    }
  }

  const goUpdate = (id: string) => {
    router.push(`/profileuser/${id}`)
  }

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <p className="text-amber-900 text-lg font-bold animate-pulse">🏴 กำลังตรวจสอบสิทธิ์...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-10 pt-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1
            className="text-5xl font-black text-amber-950 mb-2"
            style={{
              textShadow: "3px 3px 6px rgba(0,0,0,0.2)",
              letterSpacing: "2px",
            }}
          >
            👥 PIRATE CREW MEMBERS
          </h1>
          <p className="text-amber-800 font-bold text-lg">รายชื่อลูกเรือโจรสลัด</p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={onSearch} className="flex w-full max-w-md gap-2 items-center">
            <input
              type="text"
              placeholder="ค้นหาตามชื่อ…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-yellow-600 text-sm bg-white text-amber-900 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-amber-600"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-sm text-white font-black border-2 border-yellow-500 disabled:opacity-60 transform hover:scale-105 transition-all duration-200 shadow-lg"
              disabled={searching}
            >
              {searching ? "🔍" : "🔍"}
            </button>
          </form>
        </div>

        {err && (
          <div className="mb-4 text-sm text-white bg-red-700/90 border-2 border-red-900 px-4 py-3 rounded-lg font-semibold flex items-center gap-2">
            <span>💀</span>
            {err}
          </div>
        )}

        {listLoading ? (
          <div className="text-center py-12">
            <p className="text-amber-900 text-lg font-bold animate-pulse">🏴 กำลังโหลดข้อมูล...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-amber-900/30 rounded-2xl border-4 border-yellow-600">
            <p className="text-amber-900 text-lg font-bold">💀 ยังไม่มีผู้ใช้ในระบบ</p>
          </div>
        ) : (
          <div
            className="overflow-x-auto bg-white shadow-2xl rounded-2xl border-4 border-yellow-600"
            style={{
              boxShadow: "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-amber-800 to-amber-900 text-yellow-300 border-b-4 border-yellow-600">
                <tr>
                  <th className="px-4 py-3 text-left font-black">ผู้ใช้</th>
                  <th className="px-4 py-3 text-left font-black">อีเมล</th>
                  <th className="px-4 py-3 text-left font-black">อายุ</th>
                  <th className="px-4 py-3 text-left font-black">สิทธิ์ (Role)</th>
                  <th className="px-4 py-3 text-left font-black">คะแนน (Point)</th>
                  <th className="px-4 py-3 text-right font-black">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-yellow-300/50">
                {items.map((u) => (
                  <tr key={u._id} className="hover:bg-amber-50 transition-colors text-amber-900">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.picture ? (
                          <img
                            src={u.picture || "/placeholder.svg"}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-yellow-600 shadow-md"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-amber-200 border-2 border-yellow-600 flex items-center justify-center text-xs text-amber-900 font-bold">
                            ?
                          </div>
                        )}
                        <div>
                          <div className="font-black text-amber-950">
                            {u.name} {u.surname}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-amber-800 font-semibold">{u.email}</td>
                    <td className="px-4 py-3 text-amber-800 font-semibold">{u.age}</td>
                    <td className="px-4 py-3 text-amber-800 font-semibold">{u.role ?? "-"}</td>
                    <td className="px-4 py-3 text-amber-800 font-semibold">{u.point ?? 0}</td>

                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => goUpdate(u._id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border-2 border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black transition-all duration-200 transform hover:scale-110 shadow-md"
                      >
                        👁️ Check
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(u._id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border-2 border-red-600 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-black transition-all duration-200 transform hover:scale-110 shadow-md"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
