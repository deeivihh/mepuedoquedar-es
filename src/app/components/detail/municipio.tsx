"use client"
import { Site } from "@/app/utils/types";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "@/app/utils/useLocation";
import { Map, Marker } from "pigeon-maps";

export default function MunicipioDetail({ cod }: { cod: string }) {
    const locationParams = useLocation();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const MAP_HEIGHT = 305;
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
        <div className="flex flex-col gap-2 justify-center items-center mx-auto w-full h-full max-w-6xl">
            <div className="flex flex-col bg-bg-card rounded-[32px] my-4 w-full h-full overflow-hidden border-3 border-title/10">
                <section className="flex flex-col gap-2 overflow-hidden relative w-full h-[30svh] max-md:h-[50svh]">
                    <div className="flex flex-col items-start justify-center min-md:gap-12 p-10 w-full max-w-2xl h-full z-10 max-md:border-b-2 max-md:border-title/20">
                        <h1 className="text-6xl max-md:text-3xl min-md:max-w-[17ch] font-bold text-pretty max-md:text-center">{data.municipio}</h1>
                    </div>
                    <div
                        ref={mapContainerRef}
                        className="cursor-move h-full min-md:absolute min-md:inset-y-0 min-md:right-0 min-md:w-3/5 min-md:-mr-5 image-fade"
                    >
                        <Map
                            center={[data.latitud, data.longitud]}
                            zoom={14}
                            minZoom={5}
                            height={MAP_HEIGHT}
                            width={mapWidth}
                        />
                    </div>
                </section>
                <section className="flex flex-col gap-2 overflow-hidden relative w-full border-t border-title px-8 py-4">
                    <div className="flex flex-col items-start justify-center p-6 w-80 h-60 bg-bg shadow-inner rounded-[32px] border-3 border-title/10">
                        <div className="flex flex-col">
                            <h2 className="text-8xl font-bold ">67</h2>
                            <p className="text-xl px-2">de 100</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}   