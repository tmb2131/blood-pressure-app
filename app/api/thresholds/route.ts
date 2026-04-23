import { NextResponse } from "next/server";
import { updateWithRetry } from "@/lib/store";
import type { Thresholds } from "@/lib/readings";

export const dynamic = "force-dynamic";

function validBand(b: unknown): b is { sys: number; dia: number } {
  if (!b || typeof b !== "object") return false;
  const { sys, dia } = b as { sys: unknown; dia: unknown };
  return (
    Number.isFinite(sys) &&
    Number.isFinite(dia) &&
    (sys as number) > 0 &&
    (dia as number) > 0 &&
    (sys as number) < 300 &&
    (dia as number) < 200
  );
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { elevated, alarming } = body ?? {};
    if (!validBand(elevated) || !validBand(alarming)) {
      return NextResponse.json({ error: "Invalid thresholds" }, { status: 400 });
    }
    const next: Thresholds = {
      elevated: { sys: Math.round(elevated.sys), dia: Math.round(elevated.dia) },
      alarming: { sys: Math.round(alarming.sys), dia: Math.round(alarming.dia) },
    };
    const updated = await updateWithRetry(
      (f) => ({ ...f, thresholds: next }),
      `Update thresholds ${next.elevated.sys}/${next.elevated.dia} · ${next.alarming.sys}/${next.alarming.dia}`,
    );
    return NextResponse.json({ thresholds: updated.thresholds });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
