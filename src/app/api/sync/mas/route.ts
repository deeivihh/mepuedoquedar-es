import { getSupabase } from "@/lib/supabase/client";
import { createLog } from "@/lib/logger";
import { isAuthorized } from "@/app/utils/isAuthorized";
import { MAS_SOURCES } from "@/lib/extra";
import { NextResponse } from "next/server";

const BATCH_SIZE = 400;

export async function POST(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json(
            { ok: false, error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } }
        );
    }

    const startedAt = performance.now();
    const log = createLog("sync/mas");

    try {
        const merged = new Map<string, Record<string, any>>();
        const sourceResults: Record<string, { ok: boolean; municipios?: number; error?: string }> = {};

        for (const source of MAS_SOURCES) {
            try {
                log.info(`Ejecutando fuente "${source.name}"...`);
                const data = await source.run();
                const count = Object.keys(data).length;

                for (const [codigo, partial] of Object.entries(data)) {
                    const current = merged.get(codigo) ?? {};
                    merged.set(codigo, { ...current, ...partial });
                }

                sourceResults[source.name] = { ok: true, municipios: count };
                log.info(`Fuente "${source.name}": ${count} municipios`);
            } catch (error) {
                const msg = (error as Error).message;
                sourceResults[source.name] = { ok: false, error: msg };
                log.error(`Fuente "${source.name}" falló: ${msg}`);
            }
        }

        const rows = [...merged.entries()].map(([codigo, mas]) => ({ codigo, mas }));

        let total = 0;

        if (process.env.NODE_ENV !== "development") {
            const supabase = getSupabase();
            for (let i = 0; i < rows.length; i += BATCH_SIZE) {
                const batch = rows.slice(i, i + BATCH_SIZE);
                const { error } = await supabase.rpc("upsert_mas", { rows: batch });
                if (error) throw error;
                total += batch.length;
            }
            log.info(`Guardados ${total} municipios en Supabase`);
        } else {
            total = rows.length;
            log.info("Modo de desarrollo activado, no se guardaron los datos");
        }

        const seconds = ((performance.now() - startedAt) / 1000).toFixed(2);
        log.info(`sync/mas completado en ${seconds}s`);

        const anyOk = Object.values(sourceResults).some((r) => r.ok);
        await log.save({
            status: anyOk ? "completed" : "error",
            totalMunicipalities: total,
            ...(!anyOk && { error: "Todas las fuentes fallaron" }),
        });

        return NextResponse.json(
            {
                ok: anyOk,
                time: `${seconds}s`,
                municipios: total,
                fuentes: sourceResults,
            },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        const msg = (error as Error).message;
        log.error(msg);

        await log.save({ status: "error", error: msg });

        return NextResponse.json(
            { ok: false, error: msg },
            { status: 500, headers: { "Cache-Control": "no-store" } }
        );
    }
}
