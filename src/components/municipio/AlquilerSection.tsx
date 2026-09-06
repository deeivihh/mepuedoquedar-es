"use client";

import dynamic from "next/dynamic";
import Source from "./Source";

const BaseChart = dynamic(() => import("@/components/charts/BaseChart"), { ssr: false });

export default function AlquilerSection({ data }: { data: any }) {
    if (!data.mas?.vivienda?.alquiler) return null;
    return (
        <section className="py-14 sm:py-12 relative">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">Vivir aquí</h2>
                </div>
            </div>
            <div className="border-y border-title/20 bg-bg-card">
                <div className="flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:justify-between lg:gap-12 lg:p-10">
                    <div className="flex flex-col justify-between gap-4 lg:w-64">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-title/55">
                                Alquiler · precio de referencia
                            </p>
                            <div className="mt-5 flex items-baseline gap-1.5">
                                <span className="title-font text-6xl font-semibold leading-none text-title sm:text-7xl">
                                    {data.mas.vivienda.alquiler.precio}
                                </span>
                                <span className="font-mono text-lg font-semibold text-text-2">€/mes</span>
                            </div>
                        </div>
                        <p className="text-xs leading-5 text-title/55 mb-2">
                            Mediana del alquiler declarado en {data.mas.vivienda.tipo === "casa" ? "casas" : "pisos"} (IRPF), no precios de anuncio.
                        </p>
                    </div>
                    <div className="min-w-0 flex-1">
                        <BaseChart
                            type="line"
                            height={220}
                            title="Evolución del precio (€/mes)"
                            data={[...data.mas.vivienda.alquiler.serie]
                                .reverse()
                                .map((s: { anio: number; precio: number }) => ({
                                    Periodo: String(s.anio),
                                    Valor: s.precio,
                                }))}
                        />
                    </div>
                </div>
            </div>
            <Source href="https://www.mivau.gob.es/">
                Ministerio de Vivienda
            </Source>
        </section>
    );
}
