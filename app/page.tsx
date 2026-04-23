"use client";

import useSWR from "swr";
import ReadingForm from "@/components/ReadingForm";
import ReadingsChart from "@/components/ReadingsChart";
import ReadingsList from "@/components/ReadingsList";
import ThresholdSettings from "@/components/ThresholdSettings";
import {
  getThresholds,
  type Reading,
  type ReadingsFile,
  type Thresholds,
} from "@/lib/readings";

const fetcher = async (url: string): Promise<ReadingsFile> => {
  const r = await fetch(url);
  if (!r.ok) throw new Error((await r.json()).error || "Failed to load");
  return r.json();
};

export default function Page() {
  const { data, error, mutate, isLoading } = useSWR<ReadingsFile>(
    "/api/readings",
    fetcher,
    { revalidateOnFocus: true },
  );
  const readings = data?.readings ?? [];
  const thresholds = getThresholds(data ?? { thresholds: undefined });

  async function addReading(input: Omit<Reading, "id">) {
    const tempId = `tmp_${Math.random().toString(36).slice(2)}`;
    await mutate(
      async (cur) => {
        const res = await fetch("/api/readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Save failed");
        const j = (await res.json()) as { reading: Reading };
        return {
          version: 1,
          readings: [...(cur?.readings ?? []), j.reading],
          thresholds: cur?.thresholds,
        };
      },
      {
        optimisticData: (cur) => ({
          version: 1,
          readings: [...(cur?.readings ?? []), { ...input, id: tempId }],
          thresholds: cur?.thresholds,
        }),
        rollbackOnError: true,
        revalidate: false,
      },
    );
  }

  async function saveThresholds(next: Thresholds) {
    await mutate(
      async (cur) => {
        const res = await fetch("/api/thresholds", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Save failed");
        return { version: 1, readings: cur?.readings ?? [], thresholds: next };
      },
      {
        optimisticData: (cur) => ({
          version: 1,
          readings: cur?.readings ?? [],
          thresholds: next,
        }),
        rollbackOnError: true,
        revalidate: false,
      },
    );
  }

  async function deleteReading(id: string) {
    await mutate(
      async (cur) => {
        const res = await fetch(`/api/readings/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
        return {
          version: 1,
          readings: (cur?.readings ?? []).filter((r) => r.id !== id),
          thresholds: cur?.thresholds,
        };
      },
      {
        optimisticData: (cur) => ({
          version: 1,
          readings: (cur?.readings ?? []).filter((r) => r.id !== id),
          thresholds: cur?.thresholds,
        }),
        rollbackOnError: true,
        revalidate: false,
      },
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 pt-5 pb-10 space-y-5">
      <header className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Blood pressure</h1>
        <span className="text-xs text-neutral-500">{readings.length} readings</span>
      </header>

      <ReadingForm onSubmit={addReading} />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm p-3">
          {String(error.message || error)}
        </div>
      ) : null}

      {isLoading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <>
          <ReadingsChart readings={readings} thresholds={thresholds} />
          <ThresholdSettings thresholds={thresholds} onSave={saveThresholds} />
          <ReadingsList
            readings={readings}
            thresholds={thresholds}
            onDelete={deleteReading}
          />
        </>
      )}
    </main>
  );
}
