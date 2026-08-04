"use client"
import { Site } from "@/app/utils/types";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "@/app/utils/useLocation";
import { Map, Marker } from "pigeon-maps";
import { IoPeopleSharp } from "react-icons/io5";
import { FaCarSide, FaMapMarkedAlt, FaRoute } from "react-icons/fa";

function capitalize(value: string) {
    const firstLetter = value.charAt(0);
    const rest = value.slice(1).toLowerCase();
    return firstLetter + rest;
}

export default function MunicipioDetail({ cod }: { cod: string }) {
    const { locationParams, ready } = useLocation(false);
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [mapWidth, setMapWidth] = useState(400);
    const [mapHeight, setMapHeight] = useState(305);

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

    if (isLoading) return <div>Cargando municipio...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>Municipio no encontrado.</div>;

    return (
        <div className="flex flex-col gap-2 justify-center items-center min-md:mx-auto w-full h-full max-w-6xl">
            <div className="flex flex-col bg-bg-card rounded-[32px] my-4 w-full h-full overflow-hidden border-3 border-title/10">
                <section className="flex flex-col justify-end items-start overflow-hidden relative w-full h-fit min-h-[30svh]">
                    <div className="flex flex-col h-full max-md:w-full gap-4 py-4 min-md:p-10 px-6 z-50">
                        <div className="flex flex-col items-start justify-center w-full max-w-2xl h-full z-10 pt-2">
                            <h1 className="text-6xl max-md:text-4xl max-md:w-full min-md:max-w-[17ch] font-bold text-pretty max-md:text-center">{data.municipio}</h1>
                        </div>
                        <div className="flex items-start justify-bottom w-full max-md:items-center max-md:justify-center">
                            <div className="flex max-md:flex-col max-md:w-full gap-2 max-md:items-center max-md:justify-center">
                                <a href={`https://www.google.com/maps/dir/?api=1&destination=${data.latitud},${data.longitud}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 max-md:py-1 max-md:justify-center rounded-full hover:bg-text-2/90 hover:shadow-md bg-text-2 shadow-sm shadow-text-2/50 font-semibold text-white min-md:px-4 max-md:w-80 max-[23.5rem]:w-90">Cómo llegar</a>
                                <div className="flex max-[23.5rem]:flex-col max-[23.5rem]:w-full max-md:justify-center max-md:items-center gap-2">
                                    {data.provincia && <span className="flex items-center gap-2 rounded-full bg-white px-2 max-[23.5rem]:w-90 max-[23.5rem]:justify-center border"><FaMapMarkedAlt /> {capitalize(data?.provincia)}</span>}
                                    {data.poblacion > 0 && <span className="flex items-center gap-2 rounded-full bg-white px-2 max-[23.5rem]:w-90 max-[23.5rem]:justify-center border"><IoPeopleSharp /> {data?.poblacion.toLocaleString('es-ES', { useGrouping: true })}</span>}
                                    {data.distance > 0 && (
                                        <span className="flex items-center gap-2 rounded-full bg-white px-2 max-[23.5rem]:w-90 max-[23.5rem]:justify-center border"><FaCarSide /> {data.distance >= 1000
                                            ? `${(data.distance / 1000).toFixed(0)}km`
                                            : `${data.distance}m`}
                                        </span>
                                    )}
                                </div>
                            </div>
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
                <section className="flex flex-col gap-2 overflow-hidden relative w-full border-t-2 border-title/20 px-8 py-4">
                </section>
            </div>
        </div>
    );
}   