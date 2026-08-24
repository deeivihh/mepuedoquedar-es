import { getSupabase } from "@/lib/supabase/client";
import type { MasSourceResult } from "./types";

const EXPORT_URL = "https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/guia-de-medios-de-comunicacion/exports/json";

function normalize(s: string) {
    return s.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

interface MedioRecord {
    nombre_del_organismo?: string | null;
    localidad?: string | null;
    directorio_superior?: string | null;
    paginas_de_internet?: string | null;
}

async function run(): Promise<MasSourceResult> {
    const [res, municipiosRes] = await Promise.all([
        fetch(EXPORT_URL, { signal: AbortSignal.timeout(30000) }),
        getSupabase().from("municipios").select("codigo, municipio"),
    ]);

    if (!res.ok) throw new Error(`El export de medios devolvió ${res.status}`);
    if (municipiosRes.error) throw municipiosRes.error;

    const byName = new Map<string, string>();
    for (const m of municipiosRes.data ?? []) {
        byName.set(normalize(m.municipio), m.codigo);
    }

    const records: MedioRecord[] = await res.json();
    const result: MasSourceResult = {};

    for (const r of records) {
        const codigo = byName.get(normalize(r.localidad ?? ""));
        if (!codigo) continue;

        const nombre = r.nombre_del_organismo?.trim();
        if (!nombre) continue;

        const entry = (result[codigo] ??= { medios: [] as unknown[] }) as {
            medios: { nombre: string; directorio_superior: string | null; paginas_de_internet: string | null }[];
        };

        entry.medios.push({
            nombre,
            directorio_superior: r.directorio_superior?.trim() || null,
            paginas_de_internet: r.paginas_de_internet?.trim() || null,
        });
    }

    return result;
}

export default {
    name: "medios",
    run,
} satisfies import("./types").MasSource;
