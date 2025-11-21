"use client";

export default function Test01() {
  return (
    <div>
      <p>{process.env.NEXT_PUBLIC_API_URL}</p>
    </div>
  );
}