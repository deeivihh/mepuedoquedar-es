import { getTableKey, type TableConfig } from "@/lib/config/tables";

const INE_URL = "https://servicios.ine.es/wstempus/js/ES/VALORES_GRUPOSTABLA/29005/89616?det=2";

let cachedMap: Map<string, number> | null = null;
let inflightPromise: Promise<Map<string, number>> | null = null;

export async function fetchIneCodes(): Promise<Map<string, number>> {
    if (cachedMap) return cachedMap;
    if (inflightPromise) return inflightPromise;

    inflightPromise = (async () => {
        const res = await fetch(INE_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`INE API error: ${res.status}`);
        const entries: { Id: number; Codigo: string }[] = await res.json();
        const map = new Map<string, number>();
        for (const e of entries) {
            if (!e.Codigo) continue;
            map.set(e.Codigo, e.Id);
            const unpadded = e.Codigo.replace(/^0+/, "");
            if (unpadded) map.set(unpadded, e.Id);
            map.set(e.Codigo.padStart(5, "0"), e.Id);
        }
        cachedMap = map;
        return map;
    })();

    try {
        return await inflightPromise;
    } finally {
        inflightPromise = null;
    }
}

export async function getIneCodInt(codigo: string | number): Promise<number | null> {
    const codeStr = String(codigo).trim();
    const map = await fetchIneCodes();
    return map.get(codeStr) ?? map.get(codeStr.padStart(5, "0")) ?? map.get(codeStr.replace(/^0+/, "")) ?? null;
}

export async function fetchAllTables(tables: TableConfig[], cod_int: string | number): Promise<Record<string, any[]>> {
    const queries = tables.map((t) => ({
        table: t.table,
        nult: t.nult ?? 15,
        key: getTableKey(t),
        tv: t.tv,
    }));

    const res = await fetch(`/api/ine/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queries, cod_int }),
    });

    return res.ok ? res.json() : {};
}
