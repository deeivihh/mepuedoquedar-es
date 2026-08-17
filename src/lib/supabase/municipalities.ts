import { getSupabase } from "./client";

type Municipality = Record<string, any>;

export async function saveGroup(
    municipalities: Municipality[]
) {
    const batchSize = 500;

    const rows = municipalities.map(toDatabase);

    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);

        const { error } = await getSupabase().rpc(
            "upsert_municipios",
            {
                rows: batch,
            }
        );

        if (error) {
            throw error;
        }
    }

    return rows.length;
}

function toDatabase(
    municipality: Municipality
) {
    const {
        codigo,
        cod_int,
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

        cod_int: cod_int ?? null,

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

export async function getData(cod_ine: string) {
    const { data, error } = await getSupabase()
        .from("municipios")
        .select(`codigo, municipio, poblacion, provincia, latitud, longitud, ${datosSelect}`)
        .eq("codigo", cod_ine)
        .single();
    if (error) throw error;
    const row = data as Record<string, any>;
    return {
        codigo: row.codigo,
        municipio: row.municipio,
        poblacion: row.poblacion,
        provincia: row.provincia,
        latitud: row.latitud,
        longitud: row.longitud,
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