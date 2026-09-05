"use client";

import { useMemo } from "react";
import { TABLES, getTableKey, filterData, type TableConfig } from "@/lib/config/tables";
import BaseChart from "@/components/charts/BaseChart";

function hasSeriesData(filtered: any[]) {
    if (!filtered || !Array.isArray(filtered) || !filtered.length) return false;
    return filtered.some((s: any) => s.Data !== undefined) ? filtered.some((s: any) => Array.isArray(s.Data) && s.Data.length > 0) : true;
}

function Tabla({ table, data }: { table: TableConfig; data: any[] }) {
    const filtered = useMemo(() => filterData(data, table.filter), [data, table.filter]);
    if (!hasSeriesData(filtered)) return null;

    return (
        <div className="p-4 md:p-6 md:col-span-1 md:odd:last:col-span-2 md:odd:border-r md:odd:last:border-r-0 md:border-b md:last:border-b-0 md:[&:nth-last-child(2):nth-child(odd)]:border-b-0 border-title/20">
            <BaseChart type={table.type} data={filtered} title={table.title} formatName={table.formatName} />
        </div>
    );
}

export default function DatosSection({ ineData, tables = TABLES }: { ineData: Record<string, any[]>; tables?: TableConfig[] }) {
    const hasAnyData = useMemo(
        () => tables.some((t) => hasSeriesData(filterData(ineData?.[getTableKey(t)] ?? [], t.filter))),
        [ineData, tables]
    );

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
