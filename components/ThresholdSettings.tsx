"use client";

import { useEffect, useState } from "react";
import type { Thresholds } from "@/lib/readings";

export default function ThresholdSettings({
  thresholds,
  onSave,
}: {
  thresholds: Thresholds;
  onSave: (t: Thresholds) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [eSys, setESys] = useState(String(thresholds.elevated.sys));
  const [eDia, setEDia] = useState(String(thresholds.elevated.dia));
  const [aSys, setASys] = useState(String(thresholds.alarming.sys));
  const [aDia, setADia] = useState(String(thresholds.alarming.dia));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setESys(String(thresholds.elevated.sys));
    setEDia(String(thresholds.elevated.dia));
    setASys(String(thresholds.alarming.sys));
    setADia(String(thresholds.alarming.dia));
  }, [thresholds]);

  const nums = { eSys: +eSys, eDia: +eDia, aSys: +aSys, aDia: +aDia };
  const valid = Object.values(nums).every((n) => Number.isFinite(n) && n > 0);
  const dirty =
    nums.eSys !== thresholds.elevated.sys ||
    nums.eDia !== thresholds.elevated.dia ||
    nums.aSys !== thresholds.alarming.sys ||
    nums.aDia !== thresholds.alarming.dia;

  async function handleSave() {
    if (!valid || !dirty) return;
    setSaving(true);
    setErr(null);
    try {
      await onSave({
        elevated: { sys: nums.eSys, dia: nums.eDia },
        alarming: { sys: nums.aSys, dia: nums.aDia },
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <div>
          <div className="text-sm font-medium text-neutral-700">Thresholds</div>
          <div className="mt-0.5 text-xs text-neutral-500 tabular-nums">
            <span className="text-amber-600">
              {thresholds.elevated.sys}/{thresholds.elevated.dia}
            </span>
            {" elevated · "}
            <span className="text-red-600">
              {thresholds.alarming.sys}/{thresholds.alarming.dia}
            </span>
            {" alarming"}
          </div>
        </div>
        <span
          className={`text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open ? (
        <div className="border-t border-neutral-100 px-4 py-3 space-y-3">
          <div>
            <div className="mb-1 text-xs font-medium text-amber-600">
              Elevated (amber)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumField label="SYS" value={eSys} onChange={setESys} />
              <NumField label="DIA" value={eDia} onChange={setEDia} />
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-red-600">
              Alarming (red)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumField label="SYS" value={aSys} onChange={setASys} />
              <NumField label="DIA" value={aDia} onChange={setADia} />
            </div>
          </div>
          {err ? <div className="text-xs text-red-600">{err}</div> : null}
          <button
            type="button"
            onClick={handleSave}
            disabled={!valid || !dirty || saving}
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {saving ? "Saving…" : dirty ? "Save thresholds" : "No changes"}
          </button>
        </div>
      ) : null}
    </div>
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
      <span className="mb-1 block text-[11px] font-medium text-neutral-500">
        {label}
      </span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-center text-base font-semibold tabular-nums"
      />
    </label>
  );
}
