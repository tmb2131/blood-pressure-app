import { NextResponse } from "next/server";
import { readAll, updateWithRetry } from "@/lib/store";
import { newId, type Reading } from "@/lib/readings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await readAll();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, sys, dia, pulse } = body ?? {};
    if (
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(sys) ||
      !Number.isFinite(dia) ||
      !Number.isFinite(pulse)
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const reading: Reading = {
      id: newId(date),
      date,
      sys: Math.round(sys),
      dia: Math.round(dia),
      pulse: Math.round(pulse),
    };
    const next = await updateWithRetry(
      (f) => ({ ...f, readings: [...f.readings, reading] }),
      `Add reading ${date} ${reading.sys}/${reading.dia} pulse ${reading.pulse}`,
    );
    return NextResponse.json({ reading, count: next.readings.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
