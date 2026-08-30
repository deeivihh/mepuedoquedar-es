"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "@/hooks/useLocation";
import { Map } from "pigeon-maps";
import { IoPeopleSharp } from "react-icons/io5";
import { FaCarSide } from "react-icons/fa";
import { MdArrowOutward } from "react-icons/md";
import { calculateScores, ScoreResult } from "@/lib/scores/calculateScores";
import GeneralScore from "@/components/municipio/GeneralScore";
import { usePreferences } from "@/contexts/PreferencesContext";
import { computeWeightMultipliers } from "@/lib/scores/userPreferences";
import WikipediaSection, { getMunicipioWikipedia } from "./WikipediaSection";
import { WikipediaData } from "@/actions/wikipedia";
import DatosSection from "./DatosSection";
import AlquilerSection from "./AlquilerSection";
import PrensaSection from "./PrensaSection";
import { fetchAllTables } from "@/lib/datos/ine";
import { TABLES } from "@/lib/config/tables";
import dynamic from "next/dynamic";
import { SiGooglemaps } from "react-icons/si";
const DownloadReport = dynamic(() => import("./DownloadReport"), { ssr: false });

const BaseChart = dynamic(() => import("@/components/charts/BaseChart"), { ssr: false });

function capitalize(value: string) {
    const firstLetter = value.charAt(0);
    const rest = value.slice(1).toLowerCase();
    return firstLetter + rest;
}

const loadingMessages = [
    "Consultando registros del municipio...",
    "Buscando en Wikipedia y recopilando imágenes...",
    "Recibiendo estadísticas del INE...",
    "Consultando el Ministerio de vivienda...",
    "Analizando servicios, sanidad y educación...",
    "Calculando tu puntuación personalizada...",
    "Preparando el informe final...",
];

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
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-medium text-sm text-white bg-text-2 hover:opacity-90 transition-opacity"
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
            <div className="flex flex-col min-h-[75svh]">
                <section className="relative isolate flex min-h-0 flex-col overflow-hidden border border-title/20 bg-bg-card min-md:h-[50svh]">
                    <div className="relative max-md:p-6 p-16 flex flex-col justify-between items-between w-full h-full gap-2 z-999 max-w-xl h-full">
                        <div className="flex flex-col gap-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-title/55 px-1">
                                {data.provincia && data.provincia !== data.municipio ? `${capitalize(data.provincia)}, España` : "Castilla y León, España"}
                            </p>
                            <h1 className="title-font text-6xl font-bold text-pretty max-md:text-5xl">
                                {data.municipio}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-title/75 mt-2 px-1">
                                {data.poblacion > 0 && (
                                    <span className="inline-flex items-center gap-2">
                                        <IoPeopleSharp className="text-text-2" aria-hidden="true" />
                                        {data.poblacion.toLocaleString("es-ES")} habitantes
                                    </span>
                                )}
                                {data.distance > 0 && (
                                    <span className="inline-flex items-center gap-2">
                                        <FaCarSide className="text-text-2" aria-hidden="true" />
                                        {data.distance >= 1000 ? `${(data.distance / 1000).toFixed(0)} km` : `${data.distance} m`} desde tu ubicación
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-end justify-start h-full mt-6 gap-4 z-999">
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${data.latitud},${data.longitud}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-text-2 hover:opacity-90 text-text-3 font-semibold h-10 px-4 w-fit"
                            >
                                Cómo llegar <SiGooglemaps aria-hidden="true" />
                            </a>
                            {data.web && (
                                <a
                                    href={data.web}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center bg-white/10 backdrop-blur-sm gap-2 border border-title/30 hover:border-title/50 font-medium h-10 px-4 w-fit group relative hover:pr-8"
                                >
                                    Pagina web
                                    <span className="absolute transition duration-150 opacity-0 group-hover:opacity-100 blur-xs group-hover:blur-none right-2"><MdArrowOutward aria-hidden="true" /></span>
                                </a>
                            )}
                        </div>
                    </div>

                    <div ref={mapContainerRef} className="image-fade relative order-3 h-[260px] w-full cursor-move overflow-hidden bg-title/10 lg:absolute lg:inset-y-0 lg:right-0 lg:order-none lg:h-full lg:w-4/5">
                        <Map
                            center={[data.latitud, data.longitud - 0.008]}
                            zoom={14}
                            minZoom={5}
                            height={mapHeight}
                            width={mapWidth}
                            attribution={false}
                        />
                    </div>
                </section>

                <section className="border border-title/20 bg-bg-card">
                    <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
                        <GeneralScore number={scores?.global ?? 0} scoresDepartments={scores?.departments ?? {}} />
                    </div>
                </section>
                <AlquilerSection data={data} />
            </div>
            {data.cod_int && ineData && (
                <section className="py-14 sm:py-12 relative">
                    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">Lo que cuentan los datos</h2>
                        </div>
                    </div>
                    <div className="overflow-hidden border-y border-title/20 bg-bg-card">
                        <DatosSection ineData={ineData} />
                    </div>
                    <p className="mt-3 px-0.5 gap-1 flex items-center text-[10px] text-title/50 group relative w-fit">
                        <span>Fuente:</span>
                        <a target="_blank" rel="noopener noreferrer" className="group-hover:text-text-2 transition-colors duration-150" href="https://www.ine.es/">Instituto Nacional de Estadística</a>
                    </p>
                </section>
            )}

            {wikiData && (
                <section className="py-14 sm:py-12">
                    <div className="mb-8">
                        <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">Conoce el lugar</h2>
                    </div>
                    <div className="overflow-hidden border-y border-title/20 bg-bg-card">
                        <WikipediaSection data={wikiData} />
                    </div>
                </section>
            )}

            <PrensaSection data={data} />
            {scores && <DownloadReport data={data} scores={scores} ineData={ineData} preferences={preferences} isDefault={isDefault} />}
        </article>
    );
}
