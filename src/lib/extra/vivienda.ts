import type { MasSourceResult } from "./types";

const CSV_URL = "https://cdn.mivau.gob.es/portal-web-mivau/Datos_MIVAU/CSV/VDP001_01.csv";

// 05 Ávila, 09 Burgos, 24 León, 34 Palencia, 37 Salamanca,
// 40 Segovia, 42 Soria, 47 Valladolid, 49 Zamora
const CYL_PROVINCIAS = new Set(["05", "09", "24", "34", "37", "40", "42", "47", "49"]);

type SerieItem = { anio: number; precio: number };

type MunicipioAcc = {
    precios: Map<number, number[]>;
    superficies: Map<number, number[]>;
};

async function* csvLines(res: Response) {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) >= 0) {
            yield buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
        }
    }

    buffer += decoder.decode();
    if (buffer.trim()) yield buffer;
}

function parseRow(line: string) {
    const c = line.split(";");
    return {
        codProvincia: c[0]?.trim() ?? "",
        codPostal: c[2]?.trim() ?? "",
        elemento: c[4]?.trim() ?? "",
        medida: c[6]?.trim() ?? "",
        anio: parseInt(c[7], 10),
        valor: parseFloat(c[8]),
    };
}

function average(values: number[]) {
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function buildVivienda(acc: MunicipioAcc) {
    const anios = [...acc.precios.keys()].sort((a, b) => a - b);
    if (!anios.length) return null;

    const serie: SerieItem[] = anios.map((anio) => ({
        anio,
        precio: Math.round(average(acc.precios.get(anio)!)),
    }));

    const ultimo = anios[anios.length - 1];
    const superficies = acc.superficies.get(ultimo);
    const superficie = superficies?.length ? Math.round(average(superficies)) : null;

    return {
        actualizado: ultimo,
        alquiler: {
            precio: serie[serie.length - 1].precio,
            superficie,
            serie,
        },
    };
}

async function run(): Promise<MasSourceResult> {
    const res = await fetch(CSV_URL);
    if (!res.ok || !res.body) {
        throw new Error(`No se pudo descargar el CSV de MIVAU (${res.status})`);
    }

    const municipios = new Map<string, MunicipioAcc>();

    for await (const line of csvLines(res)) {
        const row = parseRow(line);
        if (!CYL_PROVINCIAS.has(row.codProvincia)) continue;
        if (!row.codPostal || isNaN(row.anio) || isNaN(row.valor)) continue;
        if (row.medida !== "MEDIANA") continue;

        let acc = municipios.get(row.codPostal);
        if (!acc) {
            acc = { precios: new Map(), superficies: new Map() };
            municipios.set(row.codPostal, acc);
        }

        if (row.elemento === "PRECIO") {
            const list = acc.precios.get(row.anio) ?? [];
            list.push(row.valor);
            acc.precios.set(row.anio, list);
        } else if (row.elemento === "SUPERFICIE") {
            const list = acc.superficies.get(row.anio) ?? [];
            list.push(row.valor);
            acc.superficies.set(row.anio, list);
        }
    }

    const result: MasSourceResult = {};
    for (const [codigo, acc] of municipios) {
        const vivienda = buildVivienda(acc);
        if (vivienda) result[codigo] = { vivienda };
    }

    return result;
}

export default {
    name: "vivienda",
    run,
} satisfies import("./types").MasSource;
