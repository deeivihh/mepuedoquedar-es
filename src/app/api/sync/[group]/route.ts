import { processDatasets } from "@/lib/datos/processor";
import { getGroupByName, MUNICIPALITIES_CONFIG } from "@/lib/datos/groups";
import { createLog } from "@/lib/logger";
import { saveGroup } from "@/lib/supabase/municipalities";
import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth/isAuthorized";

export async function POST(req: Request, { params }: { params: Promise<{ group: string }> }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const { group: groupName } = await params;
  const groupConfig = getGroupByName(groupName);

  if (!groupConfig) {
    return NextResponse.json({ ok: false, error: `Grupo desconocido: ${groupName}` }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const startedAt = performance.now();
  const log = createLog(`sync/${groupName}`);

  try {
    log.info(`Procesando grupo: ${groupName}`);

    const data = await processDatasets({
      municipalities: MUNICIPALITIES_CONFIG,
      groups: [groupConfig],
      includeEmpty: true,
    });

    const totalDatasets = Object.keys(groupConfig.datasets).length;
    log.info(`Procesados ${data.length} municipios para grupo "${groupName}" (${totalDatasets} datasets)`);

    const total = process.env.NODE_ENV !== "development" ? await saveGroup(data) : data.length;
    const seconds = ((performance.now() - startedAt) / 1000).toFixed(2);
    log.info(`Grupo "${groupName}" completado en ${seconds}s`);

    await log.save({ status: "completed", totalMunicipalities: total, totalDatasets });

    return NextResponse.json(
      {
        ok: true,
        group: groupName,
        time: `${seconds}s`,
        municipios: total,
        datasets: totalDatasets,
        ...(process.env.NODE_ENV === "development" && {
          preview: data.filter((m: any) => String(m.municipio).toUpperCase() === "MEDINA DEL CAMPO"),
        }),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    const msg = error.message;
    log.error(msg);
    await log.save({ status: "error", error: msg });
    return NextResponse.json({ ok: false, group: groupName, error: msg }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
