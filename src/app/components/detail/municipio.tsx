"use client"
import { useState, useEffect, useRef } from "react";
import { useLocation } from "@/app/utils/useLocation";
import { Map } from "pigeon-maps";
import { IoPeopleSharp } from "react-icons/io5";
import { FaCarSide, FaMapMarkedAlt, FaRoute } from "react-icons/fa";
import { MdArrowOutward } from "react-icons/md";
import { calculateScores, ScoreResult } from "@/lib/scores/calculateScores";
import GeneralScore, { ScoreItem } from "@/app/components/detail/scores";
import { usePreferences } from "@/app/contexts/PreferencesContext";
import { computeWeightMultipliers } from "@/lib/scores/userPreferences";

function capitalize(value: string) {
    const firstLetter = value.charAt(0);
    const rest = value.slice(1).toLowerCase();
    return firstLetter + rest;
}

export default function MunicipioDetail({ cod }: { cod: string }) {
    const { locationParams, ready } = useLocation(false);
    const { preferences, isDefault } = usePreferences();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [mapWidth, setMapWidth] = useState(400);
    const [mapHeight, setMapHeight] = useState(200);

    const [scores, setScores] = useState<ScoreResult | null>(null);

    // Cambia el tamaño del mapa en base al contenedor
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

    useEffect(() => {
        if (!ready) return;

        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/db/${cod}${locationParams}`);
                if (!res.ok) throw new Error("Error al cargar el municipio");
                const data = await res.json();
                console.log(data)
                setData(data);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Error desconocido");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [cod, locationParams, ready]);

    useEffect(() => {
        if (!data) return;

        const multipliers = isDefault ? undefined : computeWeightMultipliers(preferences);
        const scores = calculateScores(data, multipliers);
        setScores(scores);
    }, [data, preferences])

    if (isLoading) return <div>Cargando municipio...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>Municipio no encontrado.</div>;

    return (
        <div className="flex flex-col gap-2 justify-center items-center min-md:mx-auto w-full h-full">
            <div className="flex flex-col bg-bg-card rounded-[32px] pb-8 w-full min-h-[90svh] overflow-hidden border border-title/20">
                <section className="flex flex-col justify-end items-start overflow-hidden relative w-full h-fit min-h-[20svh]">
                    <div className="flex flex-col gap-4 max-md:py-6 p-8 pb-6 h-full w-full">
                        <div className="flex flex-col items-start justify-center h-full w-full max-w-2xl">
                            <h1 className="text-6xl max-md:text-4xl max-md:w-full min-md:max-w-[17ch] font-bold text-pretty max-md:text-center z-10">{data.municipio}</h1>
                        </div>
                        <div className="flex max-md:items-center max-md:justify-center z-50">
                            <div className="flex flex-col max-md:w-full gap-4 max-md:items-center max-md:justify-center px-0.5">
                                <div className="flex max-[23.5rem]:flex-col gap-2">
                                    {data.provincia && <span className="flex items-center gap-2 bg-white/70 backdrop-blur-xs px-2 max-[23.5rem]:w-90 max-[23.5rem]:justify-center rounded-full border border-title"><FaMapMarkedAlt /> {capitalize(data?.provincia)}</span>}
                                    {data.poblacion > 0 && <span className="flex items-center gap-2 bg-white/70 backdrop-blur-xs px-2 max-[23.5rem]:w-90 max-[23.5rem]:justify-center rounded-full border border-title"><IoPeopleSharp /> {data?.poblacion.toLocaleString('es-ES', { useGrouping: true })}</span>}
                                    {data.distance > 0 && (
                                        <span className="flex items-center gap-2 bg-white/70 backdrop-blur-xs px-2 max-[23.5rem]:w-90 max-[23.5rem]:justify-center rounded-full border border-title"><FaCarSide /> {data.distance >= 1000
                                            ? `${(data.distance / 1000).toFixed(0)}km`
                                            : `${data.distance}m`}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="min-md:absolute min-md:right-7 min-md:bottom-5.5 max-md:flex max-[23.5rem]:flex-col max-[23.5rem]:w-full max-md:justify-center max-md:items-center gap-2 z-50">
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${data.latitud},${data.longitud}`} target="_blank" rel="noopener noreferrer" className="w-fit flex backdrop-blur-xs items-center gap-2 py-1 max-md:justify-center rounded-full hover:shadow-inner hover:bg-text-2 bg-text-2/90 font-semibold border border-title/20 min-md:px-4 max-md:w-80 max-[23.5rem]:w-90"><span className="text-white flex gap-2 items-center">Cómo llegar <MdArrowOutward /></span></a>
                        </div>
                    </div>
                    <div
                        ref={mapContainerRef}
                        className="cursor-move w-full max-md:h-[200px] min-md:h-full min-md:absolute min-md:inset-y-0 min-md:right-0 min-md:w-3/5 image-fade"
                    >
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
                <section className="flex flex-col gap-4 overflow-hidden relative w-full border-t border-title/20">
                    <GeneralScore number={scores?.global ?? 0} />
                    <div className="min-xl:flex min-xl:justify-center min-xl:items-center w-full px-8">
                        <div className="grid min-xl:grid-cols-6 min-md:grid-cols-3 max-md:grid-cols-2 max-[25rem]:grid-cols-1 gap-12">
                            {Object.entries(scores?.departments ?? {}).map(([key, value]) => (
                                <ScoreItem key={key} name={key} number={value} />
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}   