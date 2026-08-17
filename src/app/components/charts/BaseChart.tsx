"use client";

import { useMemo } from "react";
import { defineChart, lineY, barY, areaY, dot } from "@tanstack/charts";
import { scalePoint } from "@tanstack/charts/scales/point";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { polar, pie, radialArc } from "@tanstack/charts/polar";
import { Chart } from "@tanstack/charts/react/tooltip";
import { tooltip } from "@tanstack/charts/tooltip";

interface BaseChartProps {
    type?: "line" | "bar" | "area" | "pie" | "donut";
    data: any;
    title?: string;
    height?: number;
}

const BRAND_PALETTE = ["#C46A4A", "#1F3A2E", "#6B7F4D", "#D48B6E", "#3A5C4C"];

export function formatSeriesName(name?: string): string {
    if (!name) return "";
    const parts = name
        .split(".")
        .map((p) => p.trim())
        .filter(Boolean);

    if (parts.length <= 1) return name.trim();

    const segments = parts.slice(1).filter((p) => {
        const lower = p.toLowerCase();
        return (
            lower !== "dato base" &&
            lower !== "personas" &&
            lower !== "todas las edades"
        );
    });

    if (segments.length === 0) {
        return parts[1] || parts[0] || name;
    }

    if (segments.length > 1) {
        const nonTotal = segments.filter((p) => p.toLowerCase() !== "total");
        if (nonTotal.length > 0) {
            return nonTotal.join(" - ");
        }
    }

    return segments.join(" - ");
}

export default function BaseChart({ type = "line", data, title, height = 260 }: BaseChartProps) {
    const isSeriesArray = Array.isArray(data) && data.length > 0 && Array.isArray(data[0]?.Data);
    const isPolar = type === "pie" || type === "donut";

    const flatData = useMemo(() => {
        if (isSeriesArray) {
            return data.flatMap((s: any) =>
                [...(s.Data || [])].reverse().map((d: any) => ({
                    period: String(d.Anyo ?? d.T3_Periodo ?? d.Fecha ?? ""),
                    value: typeof d.Valor === "number" ? d.Valor : Number(d.Valor) || 0,
                    series: formatSeriesName(s.Nombre) || "Dato",
                }))
            );
        }
        if (Array.isArray(data)) {
            return [...data].reverse().map((d: any) => ({
                period: String(d.Anyo ?? d.T3_Periodo ?? d.Fecha ?? ""),
                value: typeof d.Valor === "number" ? d.Valor : Number(d.Valor) || 0,
                series: title || "Valor",
            }));
        }
        return [];
    }, [data, isSeriesArray, title]);

    const pieData = useMemo(() => {
        if (!isPolar) return [];
        if (isSeriesArray) {
            return data.map((s: any) => {
                const latest = s.Data?.[0];
                const val = typeof latest?.Valor === "number" ? latest.Valor : Number(latest?.Valor) || 0;
                return {
                    label: formatSeriesName(s.Nombre) || "Dato",
                    value: val,
                };
            }).filter((d: any) => typeof d.value === "number" && !isNaN(d.value));
        }
        if (Array.isArray(data)) {
            return data.map((d: any) => ({
                label: formatSeriesName(String(d.Anyo ?? d.T3_Periodo ?? d.Fecha ?? d.Nombre ?? "Dato")),
                value: typeof d.Valor === "number" ? d.Valor : Number(d.Valor) || 0,
            }));
        }
        return [];
    }, [isPolar, isSeriesArray, data]);

    const definition = useMemo(() => {
        if (type === "pie" || type === "donut") {
            if (!pieData.length) return null;
            const slices = pie(pieData, {
                value: (d: any) => d.value,
            });

            return defineChart({
                marks: [
                    polar({
                        inset: 8,
                        radiusRatio: 0.85,
                        marks: [
                            radialArc(slices, {
                                innerRadius: type === "donut" ? ({ radius }) => radius * 0.58 : 0,
                                cornerRadius: 4,
                                color: (d: any) => d.label,
                                key: (d: any) => d.label,
                            }),
                        ],
                    }),
                ],
                color: {
                    range: BRAND_PALETTE,
                },
                tooltip: {
                    use: tooltip,
                    anchor: "pointer",
                },
            });
        }

        if (!flatData.length) return null;

        const isSingleSeries = !isSeriesArray || data.length === 1;
        const mainColor = "#C46A4A";

        const marks: any[] = [];
        if (type === "line") {
            marks.push(
                lineY(flatData, {
                    x: (d: any) => d.period,
                    y: (d: any) => d.value,
                    z: (d: any) => d.series,
                    stroke: isSingleSeries ? mainColor : undefined,
                    color: isSingleSeries ? undefined : (d: any) => d.series,
                    strokeWidth: 2.5,
                }),
                dot(flatData, {
                    x: (d: any) => d.period,
                    y: (d: any) => d.value,
                    z: (d: any) => d.series,
                    fill: isSingleSeries ? mainColor : undefined,
                    color: isSingleSeries ? undefined : (d: any) => d.series,
                    stroke: "#f4ebe2",
                    strokeWidth: 1.5,
                    r: 4,
                })
            );
        } else if (type === "bar") {
            marks.push(
                barY(flatData, {
                    x: (d: any) => d.period,
                    y: (d: any) => d.value,
                    z: (d: any) => d.series,
                    fill: isSingleSeries ? mainColor : undefined,
                    color: isSingleSeries ? undefined : (d: any) => d.series,
                })
            );
        } else if (type === "area") {
            marks.push(
                areaY(flatData, {
                    x: (d: any) => d.period,
                    y: (d: any) => d.value,
                    z: (d: any) => d.series,
                    fill: isSingleSeries ? mainColor : undefined,
                    color: isSingleSeries ? undefined : (d: any) => d.series,
                    fillOpacity: 0.25,
                }),
                lineY(flatData, {
                    x: (d: any) => d.period,
                    y: (d: any) => d.value,
                    z: (d: any) => d.series,
                    stroke: isSingleSeries ? mainColor : undefined,
                    color: isSingleSeries ? undefined : (d: any) => d.series,
                    strokeWidth: 2,
                })
            );
        }

        return defineChart({
            marks,
            x: {
                scale: type === "bar" ? scaleBand : scalePoint,
                grid: false,
            },
            y: {
                scale: scaleLinear,
                grid: true,
                nice: true,
            },
            color: {
                range: BRAND_PALETTE,
            },
            tooltip: {
                use: tooltip,
                anchor: "pointer",
            },
        });
    }, [flatData, pieData, type, data, isSeriesArray]);

    const latestYear = useMemo(() => {
        if (isSeriesArray && data[0]?.Data?.length) {
            const item = data[0].Data[0];
            return item.Anyo ?? item.T3_Periodo ?? item.Periodo ?? item.Fecha ?? "";
        }
        if (Array.isArray(data) && data.length > 0) {
            const item = data[0]?.Data ? data[0].Data[0] : data[0];
            return item?.Anyo ?? item?.T3_Periodo ?? item?.Periodo ?? item?.Fecha ?? item?.period ?? "";
        }
        return "";
    }, [data, isSeriesArray]);

    if (!definition) return null;

    return (
        <div className="flex flex-col gap-4 w-full text-title relative">
            <div className="flex justify-between w-full items-center">
                {title && <h3 className="font-semibold text-title">{title}</h3>}
                {latestYear && (
                    <h4 className="mb-1 font-semibold text-title/80 text-sm px-2 bg-white/20 shadow-sm rounded-full border border-title/20">
                        {latestYear}
                    </h4>
                )}
            </div>
            <div className="w-full relative">
                <Chart
                    ariaLabel={title || "Gráfico"}
                    definition={definition}
                    height={height}
                    className="w-full"
                    renderTooltipBody={({ points }) => {
                        if (!points || !points.length) return null;

                        if (isPolar) {
                            return (
                                <div className="flex flex-col gap-1 text-xs">
                                    {points.map((p, idx) => {
                                        const datum = p.datum as any;
                                        const label = datum?.label ?? datum?.data?.label ?? datum?.key ?? "";
                                        const val =
                                            typeof datum?.value === "number"
                                                ? datum.value
                                                : typeof datum?.data?.value === "number"
                                                    ? datum.data.value
                                                    : typeof p.yValue === "number"
                                                        ? p.yValue
                                                        : 0;
                                        const fraction =
                                            typeof datum?.fraction === "number"
                                                ? datum.fraction
                                                : typeof datum?.data?.fraction === "number"
                                                    ? datum.data.fraction
                                                    : undefined;

                                        return (
                                            <div key={idx} className="flex items-center gap-2">
                                                {label && <span className="text-title/80 font-medium">{label}:</span>}
                                                <span className="font-bold text-title tabular-nums">
                                                    {val.toLocaleString("es-ES")}
                                                </span>
                                                {fraction !== undefined && (
                                                    <span className="text-title/60 tabular-nums">
                                                        ({(fraction * 100).toLocaleString("es-ES", {
                                                            minimumFractionDigits: 1,
                                                            maximumFractionDigits: 1,
                                                        })}%)
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        }

                        const first = points[0];
                        return (
                            <div className="flex items-center gap-1.5 text-xs">
                                {first.xValue !== undefined && <span className="text-title/80">{String(first.xValue)}:</span>}
                                {points.map((p, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-3">
                                        <span className="font-bold text-title tabular-nums">
                                            {typeof p.yValue === "number"
                                                ? p.yValue.toLocaleString("es-ES")
                                                : typeof (p.datum as any)?.value === "number"
                                                    ? (p.datum as any).value.toLocaleString("es-ES")
                                                    : p.yValue instanceof Date
                                                        ? p.yValue.toLocaleDateString("es-ES")
                                                        : String(p.yValue ?? "")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        );
                    }}
                />
            </div>
            {isPolar && pieData.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-1 text-xs">
                    {pieData.map((d: any, idx: number) => {
                        const color = BRAND_PALETTE[idx % BRAND_PALETTE.length];
                        return (
                            <div key={idx} className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                <span className="font-medium text-title/90">{d.label}</span>
                                <span className="text-title/60 tabular-nums">({d.value.toLocaleString("es-ES")})</span>
                            </div>
                        );
                    })}
                </div>
            )}
            {!isPolar && isSeriesArray && data.length > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-1 text-xs">
                    {data.map((s: any, idx: number) => {
                        const color = BRAND_PALETTE[idx % BRAND_PALETTE.length];
                        const name = formatSeriesName(s.Nombre) || `Serie ${idx + 1}`;
                        return (
                            <div key={idx} className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                <span className="font-medium text-title/90">{name}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
