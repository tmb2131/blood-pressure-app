"use client";

import { useEffect, useRef, useState } from "react";
import { todayISO } from "@/lib/readings";

type Input = { date: string; sys: number; dia: number; pulse: number };

export default function ReadingForm({
  onSubmit,
}: {
  onSubmit: (r: Input) => Promise<void>;
}) {
  const [today, setToday] = useState("");
  const [date, setDate] = useState("");
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [pulse, setPulse] = useState("");
  const [saving, setSaving] = useState(false);
  const diaRef = useRef<HTMLInputElement>(null);
  const pulseRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = todayISO();
    setToday(t);
    setDate(t);
  }, []);

  const nSys = Number(sys);
  const nDia = Number(dia);
  const nPulse = Number(pulse);
  const valid =
    date !== "" &&
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
          max={today}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base"
        />
      </label>
      <div className="grid grid-cols-3 gap-2">
        <NumField
          label="SYS"
          value={sys}
          onChange={setSys}
          onComplete={() => diaRef.current?.focus()}
        />
        <NumField
          label="DIA"
          value={dia}
          onChange={setDia}
          inputRef={diaRef}
          onComplete={() => pulseRef.current?.focus()}
        />
        <NumField
          label="Pulse"
          value={pulse}
          onChange={setPulse}
          inputRef={pulseRef}
        />
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

// A reading is complete at 3 digits, or at 2 digits when it can't be the start
// of a 3-digit value (first digit 3-9, e.g. DIA 80 or pulse 72, not SYS 12x).
function isComplete(v: string) {
  return v.length >= 3 || (v.length === 2 && Number(v[0]) >= 3);
}

function NumField({
  label,
  value,
  onChange,
  onComplete,
  inputRef,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onComplete?: () => void;
  inputRef?: React.Ref<HTMLInputElement>;
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
        ref={inputRef}
        value={value}
        onChange={(e) => {
          const next = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
          onChange(next);
          // Only advance when typing forward, so backspacing doesn't jump away.
          if (next.length > value.length && isComplete(next)) onComplete?.();
        }}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-center text-xl font-semibold tabular-nums"
      />
    </label>
  );
}
