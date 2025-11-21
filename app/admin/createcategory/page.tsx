"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext"; 

type CreateCategory = {
  name: string;
  description: string;
  topics: string;
};

export default function CreateCategoryPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<CreateCategory>({
    name: "",
    description: "",
    topics: "",
  });

  const [error, setError] = useState<string>("");
  const [ok, setOk] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "admin") {
      router.push("/");
    }
  }, [loading, user, router]);

  const update =
    (field: keyof CreateCategory) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (!token) {
      setError("คุณยังไม่ได้เข้าสู่ระบบ");
      return;
    }

    if (!form.name.trim() || !form.description.trim() || !form.topics.trim()) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "สร้างหมวดหมู่ไม่สำเร็จ");
      }

      setOk("สร้างหมวดหมู่สำเร็จแล้ว");
      setForm({ name: "", description: "", topics: "" });


    } catch (err:any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center py-10">
      <div className="w-full max-w-xl mx-4 bg-white shadow-md rounded-lg p-6 sm:p-8">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">
          สร้างหมวดหมู่ (Category)
        </h1>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อหมวดหมู่ (Name)
            </label>
            <input
              type="text"
              value={form.name}
              onChange={update("name")}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="เช่น การผจญภัย, ปาร์ตี้, กลยุทธ์"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คำอธิบาย (Description)
            </label>
            <textarea
              value={form.description}
              onChange={update("description")}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
              placeholder="อธิบายลักษณะของหมวดหมู่นี้"
            />
          </div>

          {/* Topics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หัวข้อ / topics
            </label>
            <input
              type="text"
              value={form.topics}
              onChange={update("topics")}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="เช่น family, beginner-friendly, 2-4 players"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {error}
            </p>
          )}

          {ok && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded">
              {ok}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-md bg-blue-600 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "กำลังบันทึก..." : "บันทึกหมวดหมู่"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
