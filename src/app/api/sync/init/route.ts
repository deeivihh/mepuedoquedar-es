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

    const rows = Array.from(ineCodes, ([codigo, cod_int]) => ({ codigo, cod_int }));

    const { error } = await getSupabase().rpc("init_cod_int", { rows });

    if (error) throw error;

    return NextResponse.json(
      { ok: true, updated: rows.length },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
