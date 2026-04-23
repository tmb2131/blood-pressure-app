"use client";

import { useState } from "react";
import { todayISO } from "@/lib/readings";

type Input = { date: string; sys: number; dia: number; pulse: number };

export default function ReadingForm({
  onSubmit,
}: {
  onSubmit: (r: Input) => Promise<void>;
}) {
  const [date, setDate] = useState(todayISO());
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [pulse, setPulse] = useState("");
  const [saving, setSaving] = useState(false);

  const nSys = Number(sys);
  const nDia = Number(dia);
  const nPulse = Number(pulse);
  const valid =
    Number.isFinite(nSys) &&
    nSys > 0 &&
    Number.isFinite(nDia) &&
    nDia > 0 &&
    Number.isFinite(nPulse) &&
    nPulse > 0;
  const disabled = !valid || saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setSaving(true);
    try {
      await onSubmit({ date, sys: nSys, dia: nDia, pulse: nPulse });
      setSys("");
      setDia("");
      setPulse("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm space-y-3"
    >
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-neutral-500">
          Date
        </span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={todayISO()}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base"
        />
      </label>
      <div className="grid grid-cols-3 gap-2">
        <NumField label="SYS" value={sys} onChange={setSys} />
        <NumField label="DIA" value={dia} onChange={setDia} />
        <NumField label="Pulse" value={pulse} onChange={setPulse} />
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-lg bg-slate-900 py-3 text-base font-medium text-white transition active:scale-[0.99] disabled:opacity-40"
      >
        {saving ? "Saving…" : "Save reading"}
      </button>
    </form>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-500">
        {label}
      </span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-center text-xl font-semibold tabular-nums"
      />
    </label>
  );
}
