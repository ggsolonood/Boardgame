// src/app/my-payments/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

type PaymentItem = {
  _id: string;
  amount: number;
  method?: string;
  status: "paid" | "pending" | "failed" | string;
  paid_at?: string;
  createdAt?: string;
  booking?:
    | {
        _id: string;
        total_price?: number;
        start_time?: string;
        end_time?: string;
      }
    | string;
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function MyPaymentsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!user || !token) {
      router.push("/login");
      return;
    }

    const fetchPayments = async () => {
      setLoadingData(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/payment/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        let json: any = null;
        try {
          json = await res.json();
        } catch {
          json = null;
        }

        if (res.status === 401) {
          setError(json?.message || "หมดเวลาเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error(json?.message || "โหลดประวัติการจ่ายเงินไม่สำเร็จ");
        }

        const raw = (json?.data ?? json ?? []) as any;
        setPayments(Array.isArray(raw) ? raw : []);
      } catch (err: any) {
        console.error("PAYMENTS FETCH ERROR:", err);
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลการจ่ายเงิน");
      } finally {
        setLoadingData(false);
      }
    };

    fetchPayments();
  }, [loading, user, token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">กำลังโหลด...</p>
      </div>
    );
  }

  if (!user || !token) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-2">ประวัติการจ่ายเงินของฉัน</h1>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">รายการชำระเงิน</h2>
          {loadingData && (
            <span className="text-xs text-gray-500">กำลังโหลด...</span>
          )}
        </div>

        {!loadingData && payments.length === 0 && (
          <p className="text-sm text-gray-500">ยังไม่มีประวัติการชำระเงิน</p>
        )}

        <div className="space-y-3">
          {payments.map((p) => {
            const booking =
              typeof p.booking === "string" ? null : (p.booking ?? null);

            return (
              <div
                key={p._id}
                className="border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center"
              >
                <div className="flex-1 space-y-1 text-sm">
                  <p>
                    สถานะการชำระเงิน:{" "}
                    <span
                      className={
                        p.status === "paid"
                          ? "font-semibold text-green-600"
                          : p.status === "failed"
                          ? "font-semibold text-red-600"
                          : "font-semibold text-orange-600"
                      }
                    >
                      {p.status}
                    </span>
                  </p>
                  <p>
                    จำนวนเงิน:{" "}
                    <span className="font-semibold text-emerald-700">
                      {p.amount.toFixed(2)} บาท
                    </span>
                  </p>
                  {p.method && (
                    <p className="text-gray-600">วิธีชำระเงิน: {p.method}</p>
                  )}
                  {booking && (
                    <p className="text-gray-600">
                      อ้างอิงการจอง: {booking._id}
                    </p>
                  )}
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  {p.paid_at && (
                    <p>ชำระเมื่อ: {formatDateTime(p.paid_at)}</p>
                  )}
                  {p.createdAt && (
                    <p>สร้างรายการ: {formatDateTime(p.createdAt)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
