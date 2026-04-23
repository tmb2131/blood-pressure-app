import { NextResponse } from "next/server";
import { updateWithRetry } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await updateWithRetry(
      (f) => ({ ...f, readings: f.readings.filter((r) => r.id !== id) }),
      `Delete reading ${id}`,
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
