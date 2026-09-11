import { cache } from "react";
import { getSupabase } from "./client";
import { getIneCodInt } from "../datos/ine";
import weightsConfig from "../scores/weights.json";

type Municipality = Record<string, any>;

export async function saveGroup(municipalities: Municipality[]) {
    const rows = municipalities.map(toDatabase);
    const batches = [];
    for (let i = 0; i < rows.length; i += 500) {
        batches.push(rows.slice(i, i + 500));
    }
    await Promise.all(batches.map(async (batch) => {
        const { error } = await getSupabase().rpc("upsert_municipios", { rows: batch });
        if (error) throw error;
    }));
    return rows.length;
}

function toDatabase(m: Municipality) {
    const { codigo, municipio, provincia, cod_municipio, cod_provincia, poblacion, mancomunidades, latitud, longitud, ...datos } = m;
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

const fields = Object.entries(weightsConfig).flatMap(([dept, cfg]) =>
    (cfg as any).rules.map((r: any) => {
        const parts: string[] = r.field.split(".");
        return { dept, parts, alias: `${dept}_${parts.join("_")}` };
    })
);

const datosSelect = fields.map((f) => `${f.alias}:datos->${f.dept}->${f.parts.join("->")}`).join(",");

function buildDatos(data: Record<string, any>) {
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

export const getMunicipioName = cache(async (cod_ine: string): Promise<string | null> => {
    const raw = cod_ine.trim();
    const candidates = Array.from(new Set([raw, raw.padStart(5, "0"), raw.replace(/^0+/, "")]));

    const { data } = await getSupabase()
        .from("municipios")
        .select("municipio")
        .in("codigo", candidates)
        .limit(1)
        .maybeSingle();

    return data?.municipio ?? null;
});

export async function getData(cod_ine: string) {
    const raw = cod_ine.trim();
    const candidates = Array.from(new Set([raw, raw.padStart(5, "0"), raw.replace(/^0+/, "")]));

    const { data, error } = await getSupabase()
        .from("municipios")
        .select(`codigo, cod_int, municipio, poblacion, provincia, latitud, longitud, mas, web, datos, ${datosSelect}`)
        .in("codigo", candidates)
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const row = data as Record<string, any>;
    const isCity = row.poblacion >= 30000;
    const baseQuery = getSupabase()
        .from("municipios")
        .select("codigo, municipio, provincia, poblacion")
        .neq("codigo", row.codigo);

    const [codInt, { data: pool }] = await Promise.all([
        row.cod_int ?? getIneCodInt(row.codigo),
        (isCity
            ? baseQuery.gte("poblacion", 20000).order("poblacion", { ascending: false })
            : baseQuery.eq("provincia", row.provincia).gte("poblacion", Math.max(0, Math.floor(row.poblacion * 0.3)))
        ).limit(10),
    ]);

    let similarPool = pool ?? [];
    if (similarPool.length === 0) {
        const { data: fallback } = await getSupabase()
            .from("municipios")
            .select("codigo, municipio, provincia, poblacion")
            .neq("codigo", row.codigo)
            .eq("provincia", row.provincia)
            .order("poblacion", { ascending: false })
            .limit(5);
        similarPool = fallback ?? [];
    }

    const similares = similarPool
        .sort((a, b) => Math.abs(a.poblacion - row.poblacion) - Math.abs(b.poblacion - row.poblacion))
        .slice(0, 4);

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
        datos: row.datos ?? buildDatos(row),
        similares,
    };
}