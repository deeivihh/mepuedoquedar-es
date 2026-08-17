import { fetchIneCodes } from "@/lib/datos/ine";
import { getSupabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";
import { isAuthorized } from "@/app/utils/isAuthorized";

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const ineCodes = await fetchIneCodes();

    const updates = Array.from(ineCodes, ([codigo, cod_int]) => ({ codigo, cod_int }));

    const { error } = await getSupabase()
      .from("municipios")
      .upsert(updates, { onConflict: "codigo", ignoreDuplicates: false });

    if (error) throw error;

    return NextResponse.json(
      { ok: true, updated: updates.length },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
