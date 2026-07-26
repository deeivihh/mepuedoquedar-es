"use client"
import { Site } from "@/app/utils/types";
import { useState, useEffect } from "react";
import { useLocation } from "@/app/utils/getLocation";

export default function MunicipioDetail({ cod }: { cod: string }) {
    const locationParams = useLocation();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        <div>
            {
                JSON.stringify(data, null, 2).split("\n").map((line, index) => (
                    <div key={index}>{line}</div>
                ))
            }
        </div>
    );
}   