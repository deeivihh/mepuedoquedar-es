"use server";

const INE_API = "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA";

const INE_HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    Accept: "application/json",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function safeFetch(url: string, headers?: HeadersInit) {
    const response = await fetch(url, headers ? { headers } : undefined);
    if (!response.ok) {
        const text = await response.text();
        console.warn(url, response.status, text);
        return [];
    }
    return response.json();
}

export async function fetchINE(table: string, cod_int: number | string, nult: number | string = 15) {
    if (!table || !cod_int) {
        throw new Error("Table and cod_int are required");
    }
    const url = `${INE_API}/${table}?nult=${nult}&tv=19:${cod_int}`;
    return safeFetch(url, INE_HEADERS);
}