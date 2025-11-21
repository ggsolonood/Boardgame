"use client";

import {
  useEffect,
  useMemo,
  useState,
  FormEvent,
  ChangeEvent,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

type BoardGame = {
  _id: string;
  name: string;
  price_per_hour?: number;
  price?: number;
  min_player?: number;
  max_player?: number;
  image?: string;
  description?: string;
};

type Room = {
  _id: string;
  name: string;
  capacity: number;
  status: string;
  price: number;
  image?: string;
  tables?: string[];
};

type Table = {
  _id: string;
  number: string;
  capacity: number;
  image?: string;
};

export default function BookingBoardgamePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const boardgameIdFromQuery = searchParams.get("boardgameId");

  const { user, token } = useAuth();

  const [loadingInit, setLoadingInit] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [boardgames, setBoardgames] = useState<BoardGame[]>([]);
  const [selectedBoardgameId, setSelectedBoardgameId] = useState<string | null>(
    boardgameIdFromQuery
  );

  const [rooms, setRooms] = useState<Room[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedTableId, setSelectedTableId] = useState<string>("");

  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [amountPlayer, setAmountPlayer] = useState<number>(2);

  const [duration, setDuration] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const selectedBoardgame = useMemo(
    () => boardgames.find((b) => b._id === selectedBoardgameId) || null,
    [boardgames, selectedBoardgameId]
  );

  const selectedRoom = useMemo(
    () => rooms.find((r) => r._id === selectedRoomId) || null,
    [rooms, selectedRoomId]
  );

  const selectedTable = useMemo(
    () => tables.find((t) => t._id === selectedTableId) || null,
    [tables, selectedTableId]
  );

  const filteredTables = useMemo(() => {
    if (!selectedRoom || !selectedRoom.tables || selectedRoom.tables.length === 0)
      return [];
    const tableIdSet = new Set(selectedRoom.tables);
    return tables.filter((t) => tableIdSet.has(t._id));
  }, [tables, selectedRoom]);

  const getBoardgameRate = (bg: BoardGame | null) => {
    if (!bg) return 0;
    return bg.price_per_hour ?? bg.price ?? 0;
  };

  useEffect(() => {
    if (selectedRoom && amountPlayer > selectedRoom.capacity) {
      setAmountPlayer(selectedRoom.capacity);
    }
  }, [selectedRoom, amountPlayer]);

  useEffect(() => {
    const parseJsonOrThrow = async (res: Response, label: string) => {
      const text = await res.text();
      console.log(label, "raw response:", text);

      let data: any = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`${label}: ตอบกลับไม่ใช่ JSON -> ${text}`);
        }
      }

      if (!res.ok) {
        throw new Error(
          `${label} error (${res.status}): ${
            data?.message || text || "ไม่ทราบสาเหตุ"
          }`
        );
      }

      return data;
    };

    const fetchAll = async () => {
      try {
        setLoadingInit(true);
        setError(null);

        const [bgRes, roomRes, tableRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/boardgame`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/room`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/table`),
        ]);

        const [bgJson, roomJson, tableJson] = await Promise.all([
          parseJsonOrThrow(bgRes, "โหลดบอร์ดเกม"),
          parseJsonOrThrow(roomRes, "โหลดห้อง"),
          parseJsonOrThrow(tableRes, "โหลดโต๊ะ"),
        ]);

        setBoardgames(bgJson?.data ?? bgJson ?? []);
        setRooms(roomJson?.data ?? roomJson ?? []);
        setTables(tableJson?.data ?? tableJson ?? []);

        if (boardgameIdFromQuery) {
          setSelectedBoardgameId(boardgameIdFromQuery);
        }
      } catch (err: any) {
        console.error("FETCH ERROR:", err);
        setError(err.message || "โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoadingInit(false);
      }
    };

    fetchAll();
  }, [boardgameIdFromQuery]);

  useEffect(() => {
    if (!startTime || !endTime || !selectedBoardgame) {
      setDuration(0);
      setTotalPrice(0);
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();

    if (diffMs <= 0) {
      setDuration(0);
      setTotalPrice(0);
      return;
    }

    const hours = diffMs / (1000 * 60 * 60);
    const roundedHours = Math.round(hours * 10) / 10;

    setDuration(roundedHours);

    const bgRate = getBoardgameRate(selectedBoardgame);
    const roomRate = selectedRoom?.price ?? 0;
    const total = roundedHours * (bgRate + roomRate);

    setTotalPrice(total);
  }, [startTime, endTime, selectedBoardgame, selectedRoom]);

  const handleChangeBoardgame = (id: string) => {
    setSelectedBoardgameId(id || null);
    setSuccess(null);
    setError(null);
    if (id) {
      router.push(`/booking-boardgame?boardgameId=${id}`);
    } else {
      router.push(`/booking-boardgame`);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError("กรุณาเข้าสู่ระบบก่อนทำการจอง");
      return;
    }

    const userId =
      (user as any)._id ?? (user as any).id ?? (user as any).userId;

    if (!userId) {
      setError("ไม่พบข้อมูลผู้ใช้ (user id)");
      return;
    }

    if (!selectedBoardgameId || !selectedBoardgame) {
      setError("กรุณาเลือกบอร์ดเกม");
      return;
    }
    if (!selectedRoomId || !selectedRoom) {
      setError("กรุณาเลือกห้อง");
      return;
    }
    if (!selectedTableId) {
      setError("กรุณาเลือกโต๊ะ");
      return;
    }

    if (selectedRoom.status?.toLowerCase() === "inuse") {
      setError("ห้องนี้กำลังถูกใช้งาน ไม่สามารถจองได้");
      return;
    }

    if (amountPlayer > selectedRoom.capacity) {
      setError(
        `จำนวนผู้เล่นเกินความจุของห้อง (สูงสุด ${selectedRoom.capacity} คน)`
      );
      return;
    }

    if (!startTime || !endTime || duration <= 0) {
      setError("กรุณาเลือกเวลาเริ่มและเวลาสิ้นสุดให้ถูกต้อง");
      return;
    }

    const payload = {
      user: userId,
      board_game_id: selectedBoardgameId,
      room_id: selectedRoomId,
      table_id: selectedTableId,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      status: "pending",
      duration,
      total_price: totalPrice,
      amount_player: amountPlayer,
    };

    console.log("POST /booking-boardgame payload =", payload);

    try {
      setSubmitting(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking-boardgame`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "จองไม่สำเร็จ");
      }

      setSuccess("จองบอร์ดเกมสำเร็จแล้ว!");
      router.push(`/`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาดในการจอง");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInit) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 pb-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-yellow-400 text-2xl font-bold animate-pulse">🏴 กำลังเตรียมสมบัติ...</p>
        </div>
      </div>
    );
  }

  const currentBgRate = getBoardgameRate(selectedBoardgame);
  const currentRoomRate = selectedRoom?.price ?? 0;
  const maxPlayerByRoom = selectedRoom?.capacity ?? undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 pb-10">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-400 font-bold border-2 border-yellow-500 transition-all duration-200 transform hover:scale-105"
          >
            <span>←</span>
            ย้อนกลับ
          </button>
          <div className="text-center flex-1">
            <h1 className="text-4xl font-black text-yellow-400 mb-2" style={{
              textShadow: "3px 3px 0px rgba(0,0,0,0.8), 0 0 30px rgba(250, 204, 21, 0.4)"
            }}>
              ⚓ จองสมบัติเกม
            </h1>
            <p className="text-yellow-300 text-sm font-semibold">เลือกเกม ห้อง โต๊ะ และเวลาเล่นของคุณ</p>
          </div>
          <div className="w-20"></div>
        </div>

        {error && (
          <div className="rounded-lg border-2 border-red-600 bg-red-900/70 px-4 py-3 text-sm text-yellow-100 font-semibold flex items-center gap-2">
            <span className="text-xl">💀</span>
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border-2 border-green-600 bg-green-900/70 px-4 py-3 text-sm text-yellow-100 font-semibold flex items-center gap-2">
            <span className="text-xl">✅</span>
            {success}
          </div>
        )}

        <section className="border-2 border-yellow-600 rounded-xl p-5 space-y-4 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl" style={{
          boxShadow: "0 0 30px rgba(250, 204, 21, 0.2), inset 0 0 20px rgba(30, 41, 59, 0.5)"
        }}>
          <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2" style={{
            textShadow: "1px 1px 3px rgba(0,0,0,0.8)"
          }}>
            🎮 ขั้นที่ 1: เลือกบอร์ดเกม
          </h2>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-yellow-300">เลือกเกมจากสมบัติ</label>
            <select
              className="border-2 border-yellow-500 rounded-lg px-4 py-2 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              value={selectedBoardgameId ?? ""}
              onChange={(e) => handleChangeBoardgame(e.target.value)}
            >
              <option value="">-- เลือกบอร์ดเกม --</option>
              {boardgames.map((bg) => (
                <option key={bg._id} value={bg._id}>
                  {bg.name}
                </option>
              ))}
            </select>
          </div>

          {selectedBoardgame && (
            <div className="flex flex-col sm:flex-row gap-4 items-start bg-slate-800/50 p-4 rounded-lg border border-yellow-500">
              {selectedBoardgame.image && (
                <img
                  src={selectedBoardgame.image}
                  alt={selectedBoardgame.name}
                  className="w-40 h-40 object-cover rounded-lg border-2 border-yellow-400"
                />
              )}
              <div className="space-y-2 flex-1">
                <p className="font-bold text-xl text-yellow-400">{selectedBoardgame.name}</p>
                <div className="space-y-1 text-sm text-yellow-200">
                  <p className="flex items-center gap-2">
                    <span>💰</span>
                    <span>ราคาต่อชั่วโมง: <span className="font-bold text-yellow-300">{currentBgRate} บาท</span></span>
                  </p>
                  {(selectedBoardgame.min_player || selectedBoardgame.max_player) && (
                    <p className="flex items-center gap-2">
                      <span>👥</span>
                      <span>จำนวนผู้เล่นแนะนำ: <span className="font-bold text-yellow-300">{selectedBoardgame.min_player}–{selectedBoardgame.max_player} คน</span></span>
                    </p>
                  )}
                  {selectedBoardgame.description && (
                    <p className="text-yellow-100 mt-2">{selectedBoardgame.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="border-2 border-yellow-600 rounded-xl p-5 space-y-4 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl" style={{
          boxShadow: "0 0 30px rgba(250, 204, 21, 0.2), inset 0 0 20px rgba(30, 41, 59, 0.5)"
        }}>
          <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2" style={{
            textShadow: "1px 1px 3px rgba(0,0,0,0.8)"
          }}>
            🏠 ขั้นที่ 2: เลือกห้องและโต๊ะ
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-yellow-300">เลือกห้อง</label>
              <select
                className="border-2 border-yellow-500 rounded-lg px-4 py-2 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={selectedRoomId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  setSelectedRoomId(e.target.value);
                  setSelectedTableId("");
                }}
              >
                <option value="">-- เลือกห้อง --</option>
                {rooms
                  .filter((room) => room.status?.toLowerCase() !== "inuse")
                  .map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-yellow-300">เลือกโต๊ะ</label>
              <select
                className="border-2 border-yellow-500 rounded-lg px-4 py-2 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                value={selectedTableId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setSelectedTableId(e.target.value)
                }
                disabled={!selectedRoom}
              >
                <option value="">
                  {selectedRoom ? "-- เลือกโต๊ะ --" : "กรุณาเลือกห้องก่อน"}
                </option>
                {filteredTables.map((table) => (
                  <option key={table._id} value={table._id}>
                    โต๊ะ {table.number} (รองรับ {table.capacity} คน)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedRoom && (
              <div className="border-2 border-yellow-500 rounded-lg p-4 flex gap-3 bg-slate-800/50">
                {selectedRoom.image && (
                  <img
                    src={selectedRoom.image}
                    alt={selectedRoom.name}
                    className="w-24 h-24 object-cover rounded-lg border-2 border-yellow-400"
                  />
                )}
                <div className="text-sm space-y-2 flex-1">
                  <p className="font-bold text-yellow-400 text-base">🏠 {selectedRoom.name}</p>
                  <p className="text-yellow-200 flex items-center gap-1">
                    <span>👥</span> ความจุ: {selectedRoom.capacity} คน
                  </p>
                  <p className="text-yellow-200 flex items-center gap-1">
                    <span>💳</span> ราคา: {selectedRoom.price} บาท/ชม
                  </p>
                </div>
              </div>
            )}

            {selectedTable && (
              <div className="border-2 border-yellow-500 rounded-lg p-4 flex gap-3 bg-slate-800/50">
                {selectedTable.image && (
                  <img
                    src={selectedTable.image}
                    alt={selectedTable.number}
                    className="w-24 h-24 object-cover rounded-lg border-2 border-yellow-400"
                  />
                )}
                <div className="text-sm space-y-2 flex-1">
                  <p className="font-bold text-yellow-400 text-base">🎲 โต๊ะ {selectedTable.number}</p>
                  <p className="text-yellow-200 flex items-center gap-1">
                    <span>👥</span> รองรับ {selectedTable.capacity} คน
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="border-2 border-yellow-600 rounded-xl p-5 space-y-4 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl" style={{
            boxShadow: "0 0 30px rgba(250, 204, 21, 0.2), inset 0 0 20px rgba(30, 41, 59, 0.5)"
          }}
        >
          <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2" style={{
            textShadow: "1px 1px 3px rgba(0,0,0,0.8)"
          }}>
            ⏱️ ขั้นที่ 3: เลือกเวลาและผู้เล่น
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-yellow-300">⏰ เวลาเริ่ม</label>
              <input
                type="datetime-local"
                className="border-2 border-yellow-500 rounded-lg px-4 py-2 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-yellow-300">🏁 เวลาสิ้นสุด</label>
              <input
                type="datetime-local"
                className="border-2 border-yellow-500 rounded-lg px-4 py-2 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-yellow-300">
              👥 จำนวนผู้เล่น{" "}
              {maxPlayerByRoom && (
                <span className="text-xs text-yellow-400">
                  (สูงสุด {maxPlayerByRoom} คน / ตามความจุห้อง)
                </span>
              )}
            </label>
            <input
              type="number"
              min={1}
              max={maxPlayerByRoom}
              className="border-2 border-yellow-500 rounded-lg px-4 py-2 text-sm bg-slate-800 text-yellow-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={amountPlayer}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (Number.isNaN(val) || val <= 0) {
                  setAmountPlayer(1);
                  return;
                }
                if (selectedRoom && val > selectedRoom.capacity) {
                  setAmountPlayer(selectedRoom.capacity);
                  return;
                }
                setAmountPlayer(val);
              }}
            />
          </div>

          <div className="mt-6 border-t-2 border-yellow-600 pt-5 bg-slate-800/50 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-yellow-400 text-lg flex items-center gap-2">
              💎 สรุปการจอง
            </h3>
            <div className="space-y-2 text-sm text-yellow-200">
              <div className="flex justify-between items-center">
                <span>บอร์ดเกม:</span>
                <span className="font-bold text-yellow-300">{selectedBoardgame?.name ?? "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>ราคาเกมต่อชั่วโมง:</span>
                <span className="font-bold text-yellow-300">{currentBgRate} บาท</span>
              </div>
              <div className="flex justify-between items-center">
                <span>ราคาห้องต่อชั่วโมง:</span>
                <span className="font-bold text-yellow-300">{currentRoomRate} บาท</span>
              </div>
              <div className="flex justify-between items-center border-t border-yellow-600 pt-2">
                <span>ระยะเวลาเล่น:</span>
                <span className="font-bold text-yellow-300">
                  {duration > 0 ? `${duration} ชั่วโมง` : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center text-base">
                <span>ราคารวม:</span>
                <span className="font-bold text-2xl text-yellow-300">
                  {totalPrice > 0 ? `${totalPrice.toFixed(2)} บาท` : "-"}
                </span>
              </div>
              {duration > 0 && (
                <p className="text-xs text-yellow-400 text-right">
                  ({currentBgRate} + {currentRoomRate}) × {duration} ชม.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-black text-white bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 border-2 border-yellow-400 disabled:opacity-60 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              {submitting ? "⏳ กำลังจอง..." : "⚓ ยืนยันการจอง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}