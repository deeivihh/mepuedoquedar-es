"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "@/hooks/useLocation";
import { Map } from "pigeon-maps";
import { IoPeopleSharp } from "react-icons/io5";
import { FaCarSide } from "react-icons/fa";
import { MdArrowBack, MdArrowOutward } from "react-icons/md";
import { calculateScores, ScoreResult } from "@/lib/scores/calculateScores";
import GeneralScore from "@/components/municipio/GeneralScore";
import { usePreferences } from "@/contexts/PreferencesContext";
import { computeWeightMultipliers } from "@/lib/scores/userPreferences";
import WikipediaSection, { getMunicipioWikipedia } from "./WikipediaSection";
import { WikipediaData } from "@/actions/wikipedia";
import DatosSection from "./DatosSection";
import AlquilerSection from "./AlquilerSection";
import CoberturaSection from "./CoberturaSection";
import PrensaSection from "./PrensaSection";
import GobiernoSection from "./GobiernoSection";
import Source from "./Source";
import MunicipioIndex from "./MunicipioIndex";
import MunicipiosSimilares from "./MunicipiosSimilares";
import { fetchAllTables } from "@/lib/datos/ine";
import { TABLES } from "@/lib/config/tables";
import dynamic from "next/dynamic";
import { SiGooglemaps } from "react-icons/si";
import Link from "next/link";

const DownloadReport = dynamic(() => import("./DownloadReport"), { ssr: false });

const capitalize = (v: string) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();

const loadingMsgs = [
    "Consultando registros del municipio...",
    "Buscando en Wikipedia y recopilando imágenes...",
    "Recibiendo estadísticas del INE...",
    "Consultando el Ministerio de vivienda...",
    "Analizando servicios, sanidad y educación...",
    "Calculando tu puntuación personalizada...",
    "Preparando el informe final...",
];

function MunicipioHero({ data, scores, ineData, preferences, isDefault, wikiData }: { data: any, scores: ScoreResult | null, ineData: any, preferences: any, isDefault: boolean, wikiData: any }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapSize, setMapSize] = useState({ w: 400, h: 200 });

    useEffect(() => {
        const el = mapRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) setMapSize({ w: Math.round(width), h: Math.round(height) });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const locationLabel = data.provincia && data.provincia !== data.municipio
        ? `${capitalize(data.provincia)}, España`
        : "Castilla y León, España";

    return (
        <section className="relative isolate flex min-h-0 flex-col overflow-hidden min-md:h-[50svh]">
            <div className="relative max-md:p-6 p-16 flex flex-col justify-between w-full h-full gap-2 z-999 max-w-xl">
                <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-title/55 px-1">{locationLabel}</p>
                    <h1 className="title-font text-6xl font-bold text-pretty max-md:text-5xl">{data.municipio}</h1>
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
                <div className="flex items-end justify-start h-full mt-6 gap-2 z-999">
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${data.latitud},${data.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center max-md:justify-center gap-2 bg-text-2 hover:opacity-90 text-text-3 font-semibold h-10 px-4 min-md:w-fit w-full"
                    >
                        Cómo llegar <SiGooglemaps aria-hidden="true" />
                    </a>
                    {data.web && (
                        <a
                            href={data.web}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center max-md:justify-center bg-white/10 backdrop-blur-sm gap-2 border border-title/30 hover:border-title/50 font-medium h-10 px-4 min-md:w-fit w-full group relative hover:pr-8"
                        >
                            Página web
                            <span className="absolute transition duration-150 opacity-0 group-hover:opacity-100 blur-xs group-hover:blur-none right-2"><MdArrowOutward aria-hidden="true" /></span>
                        </a>
                    )}
                </div>
                {scores && <DownloadReport data={data} scores={scores} ineData={ineData} preferences={preferences} isDefault={isDefault} wikiData={wikiData} />}
            </div>

            <div ref={mapRef} className="image-fade relative order-3 h-[260px] w-full cursor-move overflow-hidden bg-title/10 md:absolute md:inset-y-0 md:right-0 md:order-none md:h-full md:w-4/5">
                <Map center={[data.latitud, data.longitud - 0.008]} zoom={14} minZoom={5} height={mapSize.h} width={mapSize.w} attribution={false} />
            </div>
        </section>
    );
}

export default function MunicipioDetail({ cod, initialName }: { cod: string; initialName?: string | null }) {
    const { locationParams, ready } = useLocation(false);
    const { preferences, isDefault } = usePreferences();

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scores, setScores] = useState<ScoreResult | null>(null);
    const [wikiData, setWikiData] = useState<WikipediaData | null>(null);
    const [ineData, setIneData] = useState<Record<string, any[]> | null>(null);
    const [msgIdx, setMsgIdx] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setMsgIdx((p) => (p + 1) % loadingMsgs.length), 1400);
        return () => clearInterval(interval);
    }, []);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/db/${cod}${locationParams}`);
            if (!res.ok) {
                if (res.status === 404) { setData(null); return; }
                throw new Error("No se pudo cargar la información del municipio");
            }
            const dbData: any = await res.json();
            if (!dbData) { setData(null); return; }

            const [wiki, ine] = await Promise.all([
                getMunicipioWikipedia(dbData.latitud, dbData.longitud, dbData.municipio, dbData.provincia).catch(() => null),
                dbData.cod_int ? fetchAllTables(TABLES, dbData.cod_int).catch(() => ({})) : null,
            ]);

            setData(dbData);
            setWikiData(wiki);
            setIneData(ine);
        } catch (e: any) {
            setError(e.message || "Error desconocido");
        } finally {
            setIsLoading(false);
        }
    }, [cod, locationParams]);

    useEffect(() => {
        if (ready) fetchAllData();
    }, [ready, fetchAllData]);

    useEffect(() => {
        if (!data) return;
        const mult = isDefault ? undefined : computeWeightMultipliers(preferences);
        setScores(calculateScores(data, mult, ineData));
    }, [data, preferences, isDefault, ineData]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 w-full min-h-[50svh] px-4">
                <h1 className="sr-only">{initialName ? `¿Me puedo quedar en ${initialName}?` : "¿Me puedo quedar?"}</h1>
                <p className="text-sm md:text-base font-medium text-black/70 animate-pulse text-center">{loadingMsgs[msgIdx]}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center w-full min-h-[20svh] px-4 py-8">
                <div className="p-8 md:p-10 max-w-md w-full flex flex-col items-center text-center gap-5">
                    <h1 className="text-xl font-bold text-title">Error al consultar el municipio</h1>
                    <p className="text-sm text-black/70 text-balance">{error}</p>
                    <button onClick={fetchAllData} className="px-5 py-2.5 font-medium text-sm text-white bg-text-2 hover:opacity-90">Reintentar</button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8 md:p-10 w-full flex flex-col items-center justify-center text-center gap-5">

                <div className="flex max-w-md flex-col gap-2">
                    <h1 className="text-3xl font-bold text-title">Página no encontrada</h1>
                    <p className="text-sm text-black/70 leading-relaxed text-balance">
                        El municipio o la sección que buscas no existe o no se encuentra disponible.
                    </p>
                </div>

                <div className="pt-2">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 font-medium text-sm text-white bg-text-2 hover:opacity-90 active:scale-[0.96] transition-[background-color,color,opacity,box-shadow,transform] duration-200"
                    >
                        <MdArrowBack size={18} />
                        Volver al buscador
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <article className="w-full text-title card border border-title/30 relative">
            <MunicipioIndex similares={data?.similares} />
            <div className="flex flex-col min-h-[75svh] max-md:py-4">
                <MunicipioHero data={data} scores={scores} ineData={ineData} preferences={preferences} isDefault={isDefault} wikiData={wikiData} />
                <section className="border-y border-title/30 shadow-xs">
                    <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
                        <GeneralScore number={scores?.global ?? 0} scoresDepartments={scores?.departments ?? {}} />
                    </div>
                </section>
            </div>

            <div className="min-md:px-14 p-6 py-8 flex flex-col gap-16">
                {wikiData && (
                    <section id="conoce-el-lugar">
                        <div className="mb-4">
                            <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">Conoce el lugar</h2>
                        </div>
                        <div className="overflow-hidden">
                            <WikipediaSection data={wikiData} />
                        </div>
                    </section>
                )}

                <GobiernoSection data={data} />

                <AlquilerSection data={data} />

                <CoberturaSection data={data} />

                {data.cod_int && ineData && (
                    <section id="lo-que-cuentan-los-datos" className="relative">
                        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">Lo que cuentan los datos</h2>
                        </div>
                        <div className="overflow-hidden border border-title/20 bg-white/30">
                            <DatosSection ineData={ineData} />
                        </div>
                        <Source href="https://www.ine.es/">
                            Instituto Nacional de Estadística
                        </Source>
                    </section>
                )}

                <PrensaSection data={data} />
            </div>

            <div className="xl:hidden px-6 pb-8">
                <MunicipiosSimilares items={data?.similares} />
            </div>
        </article>
    );
}
