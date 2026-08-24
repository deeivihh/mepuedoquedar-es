import { fetchDataset } from "@/lib/datos/client";
import { normalizeText } from "@/lib/datos/normalize";
import { MUNICIPALITIES_CONFIG } from "@/lib/datos/groups";
import type { MasSourceResult } from "./types";

const EXPORT_URL = "https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/guia-de-medios-de-comunicacion/exports/json";

interface MedioRecord {
    nombre_del_organismo?: string | null;
    localidad?: string | null;
    directorio_superior?: string | null;
    paginas_de_internet?: string | null;
}

async function run(): Promise<MasSourceResult> {
    const [res, municipios] = await Promise.all([
        fetch(EXPORT_URL, { signal: AbortSignal.timeout(30000) }),
        fetchDataset<{ municipio: string; cod_ine: string }>(
            MUNICIPALITIES_CONFIG.id,
            { select: ["municipio", "cod_ine"] }
        ),
    ]);

    if (!res.ok) throw new Error(`El export de medios devolvió ${res.status}`);

    const byName = new Map<string, string>();
    for (const m of municipios) {
        byName.set(normalizeText(m.municipio), String(m.cod_ine).trim());
    }

    const records: MedioRecord[] = await res.json();
    const result: MasSourceResult = {};

    const MAX_MEDIOS = 5;

    for (const r of records) {
        const codigo = byName.get(normalizeText(r.localidad ?? ""));
        if (!codigo) continue;

        const nombre = r.nombre_del_organismo?.trim();
        if (!nombre) continue;

        const paginas = r.paginas_de_internet?.trim() || null;
        if (!paginas) continue;

        const entry = (result[codigo] ??= { medios: [] as unknown[] }) as {
            medios: { nombre: string; directorio_superior: string | null; paginas_de_internet: string | null }[];
        };

        if (entry.medios.length >= MAX_MEDIOS) continue;

        entry.medios.push({
            nombre,
            directorio_superior: r.directorio_superior?.trim() || null,
            paginas_de_internet: paginas,
        });
    }

    return result;
}

export default {
    name: "medios",
    run,
} satisfies import("./types").MasSource;
