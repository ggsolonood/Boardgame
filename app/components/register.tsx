"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Cake,
  Image as ImageIcon,
} from "lucide-react";

type UserInfo = {
  id?: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  picture?: string;
  age: number;
};
type Form = UserInfo & { confirmPassword: string };

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState<Form>({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    picture: "",
    age: 18,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const update = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "กรอกชื่อ";
    if (!form.surname.trim()) e.surname = "กรอกนามสกุล";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "อีเมลไม่ถูกต้อง";
    if (form.password.length < 6) e.password = "รหัสผ่านอย่างน้อย 6 ตัว";
    if (form.confirmPassword !== form.password)
      e.confirmPassword = "ยืนยันรหัสผ่านไม่ตรงกัน";
    if (!Number.isFinite(form.age) || form.age <= 0)
      e.age = "กรอกอายุให้ถูกต้อง";
    return e;
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null);
    const eobj = validate();
    setErrors(eobj);
    if (Object.keys(eobj).length) return;

    setLoading(true);
    try {
      const { confirmPassword: _, ...payload } = form;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          role: "user",
          point: 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);

      setOk("สมัครสมาชิกสำเร็จ ⚓");
      setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
      setErrors({});
      router.push("/");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "สมัครไม่สำเร็จ";
      setErrors((prev) => ({ ...prev, server: errorMessage }));
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border-2 border-yellow-500 " +
    "bg-amber-50 " +
    "text-gray-900 font-semibold " +
    "placeholder:text-gray-500 " +
    "px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all";

  const labelCls =
    "block mb-2 text-sm font-bold text-yellow-300 flex items-center gap-2";
  const helpErr =
    "text-xs mt-1.5 text-yellow-100 font-semibold bg-red-900/80 px-3 py-1 rounded inline-block";

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-950 via-yellow-900 to-amber-950 p-4"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 50%, rgba(217, 119, 6, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(180, 83, 9, 0.2) 0%, transparent 50%)",
      }}
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl bg-gradient-to-br from-amber-900 to-amber-950 rounded-2xl shadow-2xl shadow-yellow-900/50 p-8 space-y-6 border-4 border-yellow-600"
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🏴‍☠️</div>
          <h1
            className="text-4xl font-black text-yellow-300 mb-2"
            style={{
              textShadow:
                "3px 3px 0px rgba(0,0,0,0.8), 0 0 30px rgba(255,215,0,0.3)",
            }}
          >
            สมัครสมาชิก
          </h1>
          <p className="text-yellow-200 font-semibold">
            เข้าร่วมพิราทสเลิดโจรสลัด ⚓
          </p>
        </div>

        {errors.server && (
          <div className="rounded-lg bg-red-900/80 border-2 border-red-600 text-yellow-100 p-4 flex items-start gap-3 font-semibold">
            <div className="text-2xl">💀</div>
            <div>{errors.server}</div>
          </div>
        )}
        {ok && (
          <div className="rounded-lg bg-green-900/80 border-2 border-green-600 text-yellow-100 p-4 flex items-start gap-3 font-semibold">
            <div className="text-2xl">✅</div>
            <div>{ok}</div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>
              <User className="w-4 h-4" />
              ชื่อ
            </label>
            <input
              className={inputCls}
              placeholder="เช่น สมชาย"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            {errors.name && <p className={helpErr}>{errors.name}</p>}
          </div>
          <div>
            <label className={labelCls}>
              <User className="w-4 h-4" />
              นามสกุล
            </label>
            <input
              className={inputCls}
              placeholder="เช่น ประสิทธิ์"
              value={form.surname}
              onChange={(e) => update("surname", e.target.value)}
            />
            {errors.surname && <p className={helpErr}>{errors.surname}</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>
            <Mail className="w-4 h-4" />
            อีเมล
          </label>
          <input
            type="email"
            className={inputCls}
            placeholder="example@email.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
          {errors.email && <p className={helpErr}>{errors.email}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>
              <Lock className="w-4 h-4" />
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={inputCls}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-yellow-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && <p className={helpErr}>{errors.password}</p>}
          </div>
          <div>
            <label className={labelCls}>
              <Lock className="w-4 h-4" />
              ยืนยันรหัสผ่าน
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className={inputCls}
                placeholder="ยืนยันรหัสผ่าน"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-yellow-300 transition-colors"
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className={helpErr}>{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div>
          <label className={labelCls}>
            <Cake className="w-4 h-4" />
            อายุ
          </label>
          <input
            type="number"
            className={inputCls}
            value={form.age}
            onChange={(e) => update("age", Number(e.target.value))}
          />
          {errors.age && <p className={helpErr}>{errors.age}</p>}
        </div>

        <div>
          <label className={labelCls}>
            <ImageIcon className="w-4 h-4" />
            รูปโปรไฟล์ (URL)
          </label>
          <input
            className={inputCls}
            placeholder="https://example.com/photo.jpg"
            value={form.picture ?? ""}
            onChange={(e) => update("picture", e.target.value)}
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 disabled:opacity-60 disabled:cursor-not-allowed
                     text-white py-3 font-black text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-yellow-400 transform hover:scale-105"
        >
          {loading ? "⏳ กำลังสมัคร..." : "⚓ สมัครเข้าสลัด"}
        </button>

        <p className="text-center text-yellow-200 text-sm font-semibold">
          มีบัญชีอยู่แล้ว?{" "}
          <a
            href="/login"
            className="text-yellow-300 hover:text-yellow-100 underline font-bold"
          >
            เข้าสู่ระบบ
          </a>
        </p>
      </form>
    </div>
  );
}
