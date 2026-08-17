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

    const { data: municipios, error } = await getSupabase()
      .from("municipios")
      .select("codigo")
      .is("cod_int", null);

    if (error) throw error;
    if (!municipios?.length) {
      return NextResponse.json(
        { ok: true, updated: 0, message: "Todos los municipios ya tienen cod_int" },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    let updated = 0;
    for (const m of municipios) {
      const codInt = ineCodes.get(m.codigo);
      if (codInt === undefined) continue;

      const { error } = await getSupabase()
        .from("municipios")
        .update({ cod_int: codInt })
        .eq("codigo", m.codigo);

      if (error) throw error;
      updated++;
    }

    return NextResponse.json(
      { ok: true, updated, total: municipios.length },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
