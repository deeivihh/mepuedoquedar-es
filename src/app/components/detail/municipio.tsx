"use client"
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "@/app/utils/useLocation";
import { Map } from "pigeon-maps";
import { IoPeopleSharp } from "react-icons/io5";
import { FaCarSide, FaMapMarkedAlt } from "react-icons/fa";
import { MdArrowOutward } from "react-icons/md";
import { calculateScores, ScoreResult } from "@/lib/scores/calculateScores";
import GeneralScore from "@/app/components/detail/scores";
import { usePreferences } from "@/app/contexts/PreferencesContext";
import { computeWeightMultipliers } from "@/lib/scores/userPreferences";
import Wikipedia, { getMunicipioWikipedia } from "./wikipedia";
import { WikipediaData } from "@/app/actions/wikipedia";
import Datos, { fetchAllTables } from "./datos";
import { TABLES } from "@/app/utils/getTables";
import BaseChart from "@/app/components/charts/BaseChart";

function capitalize(value: string) {
    const firstLetter = value.charAt(0);
    const rest = value.slice(1).toLowerCase();
    return firstLetter + rest;
}

export default function MunicipioDetail({ cod }: { cod: string }) {
    const { locationParams, ready } = useLocation(false);
    const { preferences, isDefault } = usePreferences();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [mapWidth, setMapWidth] = useState(400);
    const [mapHeight, setMapHeight] = useState(200);

    const [scores, setScores] = useState<ScoreResult | null>(null);
    const [wikiData, setWikiData] = useState<WikipediaData | null>(null);
    const [ineData, setIneData] = useState<Record<string, any[]> | null>(null);

    useEffect(() => {
        const el = mapContainerRef.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0) setMapWidth(Math.round(width));
                if (height > 0) setMapHeight(Math.round(height));
            }
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, [data]);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const t0 = performance.now();
        try {
            const res = await fetch(`/api/db/${cod}${locationParams}`);
            if (!res.ok) {
                if (res.status === 404) {
                    setData(null);
                    return;
                }
                throw new Error("No se pudo cargar la información del municipio");
            }
            const dbData: any = await res.json();
            if (!dbData) {
                setData(null);
                return;
            }
            const t1 = performance.now();
            console.log(`[DB] ${(t1 - t0).toFixed(0)}ms`);

            const wikiPromise = (async () => {
                const start = performance.now();
                const res = await getMunicipioWikipedia(dbData.latitud, dbData.longitud, dbData.municipio, dbData.provincia).catch(() => null);
                console.log(`[Wiki] ${(performance.now() - start).toFixed(0)}ms`);
                return res;
            })();

            const inePromise = (async () => {
                const start = performance.now();
                const res = dbData.cod_int
                    ? await fetchAllTables(TABLES, dbData.cod_int).catch(() => ({}))
                    : null;
                console.log(`[INE] ${(performance.now() - start).toFixed(0)}ms`);
                return res;
            })();

            const [wiki, ine] = await Promise.all([wikiPromise, inePromise]);
            const t2 = performance.now();
            console.log(`[Total] ${(t2 - t0).toFixed(0)}ms`);

            setData(dbData);
            setWikiData(wiki);
            setIneData(ine);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error desconocido");
        } finally {
            setIsLoading(false);
        }
    }, [cod, locationParams]);

    useEffect(() => {
        if (!ready) return;
        fetchAllData();
    }, [ready, fetchAllData]);

    useEffect(() => {
        if (!data) return;

        const multipliers = isDefault ? undefined : computeWeightMultipliers(preferences);
        const scores = calculateScores(data, multipliers, ineData);
        setScores(scores);
    }, [data, preferences, isDefault, ineData]);

    const loadingMessages = [
        "Consultando registros del municipio...",
        "Buscando en Wikipedia y recopilando imágenes...",
        "Recibiendo estadísticas del INE...",
        "Analizando servicios, sanidad y educación...",
        "Calculando tu puntuación personalizada...",
        "Preparando el informe final...",
    ];

    const [loadingIndex, setLoadingIndex] = useState(0);

    useEffect(() => {
        if (!isLoading) return;
        const interval = setInterval(() => {
            setLoadingIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 1400);
        return () => clearInterval(interval);
    }, [isLoading, loadingMessages.length]);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center gap-3 w-full min-h-[50svh] px-4">
            <p className="text-sm md:text-base font-medium text-black/70 animate-pulse text-center">
                {loadingMessages[loadingIndex]}
            </p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col justify-center items-center w-full min-h-[20svh] px-4 py-8">
            <div className="p-8 md:p-10 max-w-md w-full flex flex-col items-center text-center gap-5">
                <div className="flex flex-col gap-1.5">
                    <h2 className="text-xl font-bold text-title">Error al consultar el municipio</h2>
                    <p className="text-sm text-black/70 text-balance">{error}</p>
                </div>
                <div className="flex gap-3 w-full justify-center pt-2">
                    <button
                        onClick={() => fetchAllData()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm text-white bg-text-2 hover:opacity-90 transition-opacity"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        </div>
    );

    if (!data) return (
        <div className="flex flex-col justify-center items-center w-full min-h-[20svh] px-4 py-8">
            <div className="p-8 md:p-10 max-w-md w-full flex flex-col items-center text-center gap-5">
                <div className="flex flex-col gap-1.5">
                    <h2 className="text-xl font-bold text-title">Municipio no encontrado</h2>
                    <p className="text-sm text-black/70 text-balance">
                        No hemos encontrado datos para el código de municipio solicitado.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <article className="w-full text-title">

            <section className="relative isolate flex min-h-0 flex-col overflow-hidden border border-title/25 bg-bg-card lg:min-h-[30svh]">
                <div className="flex flex-col h-full my-auto justify-center items-start gap-3 max-md:py-12">
                    <div className="flex z-999 w-full">
                        <div className="flex h-full w-full items-center justify-start px-12">
                            <h1 className="w-full max-w-[22ch] break-words text-left text-4xl font-bold leading-[1.05] text-balance text-title sm:text-5xl lg:max-w-3xl">{data.municipio}</h1>
                        </div>
                    </div>
                    <div className="flex flex-col z-999 px-12 gap-8 w-full">
                        <ul className="flex flex-col md:flex-row items-start md:items-center w-full text-xs lg:px-1 gap-4 list-disc list-inside md:list-none text-left">
                            {data.distance > 0 && (
                                <li className="text-title/70">
                                    <span className="inline-flex items-center gap-2">
                                        <FaCarSide className="text-text-2" aria-hidden="true" />
                                        <span>{data.distance >= 1000 ? `${(data.distance / 1000).toFixed(0)} km` : `${data.distance} m`} desde tu ubicación</span>
                                    </span>
                                </li>
                            )}
                            {data.poblacion > 0 && (
                                <li>
                                    <span className="inline-flex items-center gap-2">
                                        <IoPeopleSharp className="text-text-2" aria-hidden="true" />
                                        <span>{data.poblacion.toLocaleString("es-ES")} habitantes</span>
                                    </span>
                                </li>
                            )}
                            {data.provincia && (
                                <li>
                                    <span className="inline-flex items-center gap-2">
                                        <FaMapMarkedAlt className="text-text-2" aria-hidden="true" />
                                        <span>{capitalize(data.provincia)}</span>
                                    </span>
                                </li>
                            )}
                        </ul>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${data.latitud},${data.longitud}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center max-md:justify-center max-md:w-full gap-2 bg-text-2 w-fit px-4 py-1 text-text-3"
                        >
                            Cómo llegar <MdArrowOutward aria-hidden="true" />
                        </a>
                    </div>
                </div>
                <div ref={mapContainerRef} className="image-fade relative order-3 h-[260px] w-full cursor-move overflow-hidden bg-title/10 lg:absolute lg:inset-y-0 lg:right-0 lg:order-none lg:h-full lg:w-3/5">
                    <Map
                        center={[data.latitud, data.longitud]}
                        zoom={14}
                        minZoom={5}
                        height={mapHeight}
                        width={mapWidth}
                        attribution={false}
                    />
                </div>
            </section>

            <section className="py-14 pt-18 sm:py-12 sm:pt-22">
                <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">¿Encaja contigo?</h2>
                    </div>
                </div>
                <GeneralScore number={scores?.global ?? 0} scoresDepartments={scores?.departments ?? {}} />
            </section>

            {data.cod_int && ineData && (
                <section className="py-14 sm:py-12">
                    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">Lo que cuentan los datos</h2>
                        </div>
                    </div>
                    <div className="overflow-hidden border-y border-title/20 bg-bg-card">
                        <Datos ineData={ineData} />
                    </div>
                </section>
            )}

            {data.mas?.vivienda?.alquiler && (
                <section className="py-14 sm:py-12">
                    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">Vivir aquí</h2>
                        </div>
                    </div>
                    <div className="border-y border-title/20 bg-bg-card">
                        <div className="flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:gap-12 lg:p-10">
                            <div className="flex shrink-0 flex-col gap-4 lg:w-64">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-title/55">
                                        Alquiler · precio de referencia
                                    </p>
                                    <div className="mt-2 flex items-baseline gap-1.5">
                                        <span className="title-font text-6xl font-semibold leading-none text-title sm:text-7xl">
                                            {data.mas.vivienda.alquiler.precio}
                                        </span>
                                        <span className="font-mono text-lg font-semibold text-text-2">€/mes</span>
                                    </div>
                                </div>
                                {data.mas.vivienda.alquiler.superficie > 0 && (
                                    <p className="text-sm text-title/70">
                                        Viviendas de media <span className="font-semibold text-title">{data.mas.vivienda.alquiler.superficie} m²</span>
                                    </p>
                                )}
                                <p className="text-xs leading-5 text-title/55">
                                    Mediana calculada con datos fiscales del Ministerio de Vivienda ({data.mas.vivienda.actualizado}).
                                </p>
                            </div>
                            <div className="min-w-0 flex-1">
                                <BaseChart
                                    type="line"
                                    height={220}
                                    title="Evolución del precio (€/mes)"
                                    data={data.mas.vivienda.alquiler.serie.map((s: { anio: number; precio: number }) => ({
                                        Nombre: String(s.anio),
                                        Valor: s.precio,
                                    }))}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {wikiData && (
                <section className="py-14 sm:py-12">
                    <div className="mb-8">
                        <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">Conoce el lugar</h2>
                    </div>
                    <div className="overflow-hidden border-y border-title/20 bg-bg-card">
                        <Wikipedia data={wikiData} />
                    </div>
                </section>
            )}
        </article>
    );
}
