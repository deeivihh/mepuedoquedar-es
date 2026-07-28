import { parse } from "csv-parse/sync";

const URL_BASE =
    "https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets";

export async function obtenerDataset<T = Record<string, unknown>>(
    idDataset: string
): Promise<T[]> {
    const url = `${URL_BASE}/${idDataset}/exports/csv`;

    const respuesta = await fetch(url, {
        cache: "no-store",
    });

    if (!respuesta.ok) {
        throw new Error(
            `Error descargando el dataset "${idDataset}": ${respuesta.status}`
        );
    }

    const csv = await respuesta.text();

    return parse(csv, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ";",
        trim: true,
    }) as T[];
}

export async function obtenerRegistros<T = Record<string, unknown>>(
    idDataset: string,
    opciones?: {
        where?: string;
        orderBy?: string;
        limit?: number;
    }
): Promise<T[]> {
    const params = new URLSearchParams();

    if (opciones?.where) params.set("where", opciones.where);
    if (opciones?.orderBy) params.set("order_by", opciones.orderBy);
    params.set("limit", String(opciones?.limit ?? 100));

    const url = `${URL_BASE}/${idDataset}/records?${params}`;
    console.log(url)


    const respuesta = await fetch(url, {
        cache: "no-store",
    });

    if (!respuesta.ok) {
        throw new Error(
            `Error descargando registros del dataset "${idDataset}": ${respuesta.status}`
        );
    }

    const json: { results: T[] } = await respuesta.json();

    return json.results;
}