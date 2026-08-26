"use client"
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "@/app/utils/useLocation";
import { Map } from "pigeon-maps";
import { IoPeopleSharp } from "react-icons/io5";
import { FaCarSide, FaInfo, FaMapMarkedAlt } from "react-icons/fa";
import { MdArrowOutward } from "react-icons/md";
import { calculateScores, ScoreResult } from "@/lib/scores/calculateScores";
import GeneralScore from "@/app/components/detail/scores";
import { usePreferences } from "@/app/contexts/PreferencesContext";
import { computeWeightMultipliers } from "@/lib/scores/userPreferences";
import Wikipedia, { getMunicipioWikipedia } from "./wikipedia";
import { WikipediaData } from "@/app/actions/wikipedia";
import Datos, { fetchAllTables } from "./datos";
import { TABLES } from "@/app/utils/getTables";
import dynamic from "next/dynamic";
import { SiGooglemaps } from "react-icons/si";

const BaseChart = dynamic(() => import("@/app/components/charts/BaseChart"), { ssr: false });

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
        "Consultando el Ministerio de vivienda...",
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
                                    <span className="absolute transition-all duration-150 blur group-hover:blur-none right-2"><MdArrowOutward aria-hidden="true" /></span>
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
            </div>
            {data.mas?.vivienda?.alquiler && (
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
                    <p className="mt-3 px-0.5 flex items-center text-[10px] text-title/50 hover:text-title group relative w-fit">
                        <span className="absolute pt-0.5 group-hover:-left-10 -left-5 blur group-hover:blur-none font-medium z-10 transition-all duration-150">Fuente:</span>
                        <a target="_blank" rel="noopener noreferrer" className="mt-0.5 group-hover:text-text-2 transition-all duration-150" href="https://www.mivau.gob.es/">Ministerio de Vivienda</a>
                    </p>
                </section>
            )}


            {data.cod_int && ineData && (
                <section className="py-14 sm:py-12 relative">
                    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">Lo que cuentan los datos</h2>
                        </div>
                    </div>
                    <div className="overflow-hidden border-y border-title/20 bg-bg-card">
                        <Datos ineData={ineData} />
                    </div>
                    <p className="mt-3 px-0.5 flex items-center text-[10px] text-title/50 hover:text-title group relative w-fit">
                        <span className="absolute pt-0.5 group-hover:-left-10 -left-5 blur group-hover:blur-none font-medium z-10 transition-all duration-150">Fuente:</span>
                        <a target="_blank" rel="noopener noreferrer" className="mt-0.5 group-hover:text-text-2 transition-all duration-150" href="https://www.ine.es/">Instituto Nacional de Estadística</a>
                    </p>
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

            {data.mas?.medios?.length > 0 && (
                <section className="py-14 sm:py-12">
                    <div className="mb-8">
                        <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">Prensa local</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-px border-y border-title/20 bg-title/20 md:grid-cols-2">
                        {data.mas.medios.map((medio: { nombre: string; directorio_superior: string | null; paginas_de_internet: string | null }, i: number) => (
                            <div key={i} className={`flex flex-col gap-1.5 bg-bg-card p-5 transition-colors hover:bg-white/40 ${data.mas.medios.length % 2 === 1 && i === data.mas.medios.length - 1 ? "md:col-span-2" : ""}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="title-font text-lg font-semibold leading-snug text-title">{medio.nombre}</h3>
                                    {medio.paginas_de_internet && (
                                        <a
                                            href={medio.paginas_de_internet}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={`Abrir ${medio.nombre}`}
                                            className="shrink-0 text-title/40 transition-colors hover:text-text-2"
                                        >
                                            <MdArrowOutward aria-hidden="true" />
                                        </a>
                                    )}
                                </div>
                                {medio.directorio_superior && (
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-title/50">
                                        {medio.directorio_superior}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 px-0.5 flex items-center text-[10px] text-title/50 hover:text-title group relative w-fit">
                        <span className="absolute pt-0.5 group-hover:-left-10 -left-5 blur group-hover:blur-none font-medium z-10 transition-all duration-150">Fuente:</span>
                        <a target="_blank" rel="noopener noreferrer" className="mt-0.5 group-hover:text-text-2 transition-all duration-150" href="https://analisis.datosabiertos.jcyl.es/explore/dataset/guia-de-medios-de-comunicacion/information">Guía de medios de comunicación de la Junta de Castilla y León</a>
                    </p>
                </section>
            )}
        </article>
    );
}
