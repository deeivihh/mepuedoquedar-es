"use client";

import { fetchINE } from "@/app/actions/ine";
import { useData } from "@/app/utils/getData";
import { TABLES, type TableConfig } from "@/app/utils/getTables";

function filterData(data: any[], filter?: TableConfig["filter"]) {
    if (!filter || !Array.isArray(data)) return data;
    if (typeof filter === "function") return data.filter(filter);
    if (typeof filter === "string") {
        const q = filter.toLowerCase();
        return data.filter((s: any) => s.Nombre?.toLowerCase().includes(q) || s.COD?.toLowerCase().includes(q));
    }
    if (Array.isArray(filter)) {
        if (typeof filter[0] === "number") return (filter as number[]).map((i) => data[i]).filter(Boolean);
        return data.filter((s: any) => {
            const name = (s.Nombre || "").toLowerCase();
            const cod = (s.COD || "").toLowerCase();
            return (filter as any[]).some((f) => {
                if (Array.isArray(f)) {
                    return f.every((word) => name.includes(String(word).toLowerCase()) || cod.includes(String(word).toLowerCase()));
                }
                return name.includes(String(f).toLowerCase()) || cod.includes(String(f).toLowerCase());
            });
        });
    }
    return data;
}

function Tabla({ table, cod_int, nult, title, chart: Chart, filter }: TableConfig & { cod_int: string | number }) {
    const { data, loading } = useData(() => fetchINE(table, cod_int, nult), [table, cod_int, nult]);

    const filteredData = filterData(data, filter);

    if (!loading && (!filteredData || filteredData.length === 0)) return null;

    return (
        <div className="p-4 md:p-6 md:odd:border-r md:odd:last:border-r-0 md:border-b md:[&:nth-last-child(-n+2)]:border-b-0 border-title/20">
            {loading ? (
                <div className="animate-pulse text-sm py-8 text-center text-title/60">
                    Cargando {title || table}...
                </div>
            ) : (
                <Chart data={filteredData} title={title} />
            )}
        </div>
    );
}

export default function Datos({ cod_int, tables = TABLES }: { cod_int: string | number; tables?: TableConfig[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 divide-title/20 w-full">
            {tables.map((t) => (
                <Tabla key={t.table + (t.title || "")} {...t} cod_int={cod_int} />
            ))}
        </div>
    );
}