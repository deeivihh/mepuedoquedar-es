"use client";

import { useMemo } from "react";
import { TABLES, getTableKey, type TableConfig } from "@/app/utils/getTables";
import BaseChart from "@/app/components/charts/BaseChart";

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

    if (!res.ok) return {};
    return res.json();
}

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
                    return f.every((w) => name.includes(String(w).toLowerCase()) || cod.includes(String(w).toLowerCase()));
                }
                return name.includes(String(f).toLowerCase()) || cod.includes(String(f).toLowerCase());
            });
        });
    }
    return data;
}

function Tabla({ table, data }: { table: TableConfig; data: any[] }) {
    const filteredData = useMemo(() => filterData(data, table.filter), [data, table.filter]);

    const hasData = useMemo(() => {
        if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) return false;
        const isSeriesArray = filteredData.some((s: any) => s.Data !== undefined);
        if (isSeriesArray) {
            return filteredData.some((s: any) => Array.isArray(s.Data) && s.Data.length > 0);
        }
        return true;
    }, [filteredData]);

    if (!hasData) return null;

    return (
        <div className="p-4 md:p-6 md:col-span-1 md:odd:last:col-span-2 md:odd:border-r md:odd:last:border-r-0 md:border-b md:last:border-b-0 md:[&:nth-last-child(2):nth-child(odd)]:border-b-0 border-title/20">
            <BaseChart type={table.type} data={filteredData} title={table.title} formatName={table.formatName} />
        </div>
    );
}

export default function Datos({ ineData, tables = TABLES }: { ineData: Record<string, any[]>; tables?: TableConfig[] }) {
    const hasAnyData = useMemo(() => {
        return tables.some((t) => {
            const d = ineData?.[getTableKey(t)];
            const f = filterData(d ?? [], t.filter);
            if (!f || !Array.isArray(f) || f.length === 0) return false;
            const isSeriesArray = f.some((s: any) => s.Data !== undefined);
            if (isSeriesArray) {
                return f.some((s: any) => Array.isArray(s.Data) && s.Data.length > 0);
            }
            return true;
        });
    }, [ineData, tables]);

    if (!hasAnyData) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-black/60 text-sm">
                <p>No se encontraron series estadísticas históricas adicionales en el INE para este municipio.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 divide-title/20 w-full">
            {tables.map((t) => (
                <Tabla key={getTableKey(t)} table={t} data={ineData?.[getTableKey(t)] ?? []} />
            ))}
        </div>
    );
}