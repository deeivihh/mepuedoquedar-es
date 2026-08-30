import { getSupabase } from "./client";

type Municipality = Record<string, any>;

export async function saveGroup(
    municipalities: Municipality[]
) {
    const batchSize = 500;

    const rows = municipalities.map(toDatabase);

    const batches = [];
    for (let i = 0; i < rows.length; i += batchSize) {
        batches.push(rows.slice(i, i + batchSize));
    }

    await Promise.all(batches.map(async (batch) => {
        const { error } = await getSupabase().rpc(
            "upsert_municipios",
            {
                rows: batch,
            }
        );

        if (error) {
            throw error;
        }
    }));

    return rows.length;
}

function toDatabase(
    municipality: Municipality
) {
    const {
        codigo,
        municipio,
        provincia,

        cod_municipio,
        cod_provincia,

        poblacion,
        mancomunidades,

        latitud,
        longitud,

        coordenadax,
        coordenaday,
        posicion,

        presencia_de_comercio,
        entidades_locales_menores,
        comarca,

        ...datos
    } = municipality;

    return {
        codigo,

        municipio,

        provincia,

        codigo_municipio: cod_municipio,

        codigo_provincia: cod_provincia,

        poblacion: Number(poblacion) || 0,

        mancomunidades,

        latitud: Number(latitud),

        longitud: Number(longitud),

        datos,

        updated_at: new Date().toISOString(),
    };
}

import { getIneCodInt } from "../datos/ine";

export async function getData(cod_ine: string) {
    const raw = cod_ine.trim();
    const candidates = Array.from(new Set([raw, raw.padStart(5, "0"), raw.replace(/^0+/, "")]));

    const { data, error } = await getSupabase()
        .from("municipios")
        .select(`codigo, cod_int, municipio, poblacion, provincia, latitud, longitud, mas, web, ${datosSelect}`)
        .in("codigo", candidates)
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const row = data as Record<string, any>;
    const codInt = row.cod_int ?? (await getIneCodInt(row.codigo));

    return {
        codigo: row.codigo,
        cod_int: codInt,
        municipio: row.municipio,
        poblacion: row.poblacion,
        provincia: row.provincia,
        latitud: row.latitud,
        longitud: row.longitud,
        mas: row.mas ?? null,
        web: row.web ?? null,
        datos: buildDatos(row),
    };
}

import weightsConfig from "../scores/weights.json";

type FieldEntry = { dept: string; parts: string[]; alias: string };

const fields: FieldEntry[] = Object.entries(weightsConfig).flatMap(([dept, cfg]) =>
    (cfg as any).rules.map((r: any) => {
        const parts: string[] = r.field.split(".");
        return { dept, parts, alias: `${dept}_${parts.join("_")}` };
    })
);

const datosSelect = fields
    .map((f) => `${f.alias}:datos->${f.dept}->${f.parts.join("->")}`)
    .join(",");

function buildDatos(data: Record<string, any>): Record<string, any> {
    const datos: Record<string, any> = {};

    for (const { dept, parts, alias } of fields) {
        datos[dept] ??= {};
        let cur = datos[dept];

        for (let i = 0; i < parts.length - 1; i++) {
            cur[parts[i]] ??= {};
            cur = cur[parts[i]];
        }

        cur[parts.at(-1)!] = data[alias] ?? 0;
    }

    return datos;
}