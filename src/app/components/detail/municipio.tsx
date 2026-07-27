"use client"
import { Site } from "@/app/utils/types";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "@/app/utils/getLocation";

import { Map, Marker } from "pigeon-maps";

export default function MunicipioDetail({ cod }: { cod: string }) {
    const locationParams = useLocation();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const MAP_HEIGHT = 275;
    const [mapWidth, setMapWidth] = useState(500);

    // Cambia el tamaño del mapa en base al contenedor
    useEffect(() => {
        const el = mapContainerRef.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width } = entry.contentRect;
                if (width > 0) {
                    setMapWidth(Math.round(width));
                }
            }
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, [data]);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/jcyl/municipios?eq=${cod}&eq_by=cod_ine${locationParams}`);
                if (!res.ok) throw new Error("Error al cargar el municipio");
                const data: { results: Site[] } = await res.json();
                console.log(data);
                setData(data.results[0]);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Error desconocido");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [cod, locationParams]);

    if (isLoading) return <div>Cargando municipio...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>Municipio no encontrado.</div>;

    return (
        <div className="flex flex-col justify-start items-center h-full">
            <div className="flex max-md:flex-col bg-gradient-to-r from-bg-card/60 via-bg-transparent to-bg-card/60 rounded-[32px] max-w-5xl w-full min-h-50 mt-12 relative overflow-hidden shadow-inner border-2 border-title/10">
                <div className="flex items-center justify-start px-10 py-5 w-full max-w-2xl h-full z-10 max-md:border-b-2 max-md:border-title/20">
                    <h1 className="text-6xl max-md:text-3xl min-md:max-w-[17ch] font-bold text-pretty max-md:text-center">{data.municipio}</h1>
                </div>
                <div
                    ref={mapContainerRef}
                    className="cursor-move max-md:h-[275px] min-md:absolute min-md:inset-y-0 min-md:right-0 min-md:w-1/2 min-md:-mr-3 image-fade"
                >
                    <Map
                        center={[data.latitud, data.longitud]}
                        zoom={12}
                        minZoom={5}
                        height={MAP_HEIGHT}
                        width={mapWidth}
                    >
                        <Marker
                            width={30}
                            anchor={[data.latitud, data.longitud]}
                            color="#A8B48A"
                            hover={false}
                        />
                    </Map>
                </div>
            </div>
        </div>
    );
}   