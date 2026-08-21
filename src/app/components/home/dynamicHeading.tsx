"use client";

import { useTypewriter } from "@/app/utils/useTypewriter";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Site } from "@/app/utils/types";

export default function DynamicHeading() {
    const [randomSites, setRandomSites] = useState<Site[]>([]);
    const municipioNames = useMemo(() => randomSites.map((s) => s.municipio), [randomSites]);
    const typed = useTypewriter(municipioNames, 70, 35, 4000);

    async function getRandom() {
        try {
            const response = await fetch(
                `/api/jcyl/municipios?limit=10&random=true`
            );
            if (!response.ok) throw new Error("Error al buscar");
            const data: { results: Site[] } = await response.json();
            setRandomSites(data.results);
        } catch (error) {
            console.error("Error:", error);
        }
    }
    useEffect(() => {
        getRandom();
    }, []);

    return (
        <h1 className="text-4xl max-md:text-3xl text-center font-semibold tracking-tight flex flex-col justify-center items-center">
            <span className="block">¿Me puedo quedar en</span>
            <span className="block max-w-2xl text-balance">
                <span className="text-color-2">{typed || "\u00A0"}</span>
                <span className="inline-block whitespace-nowrap">
                    <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        className="inline-block w-[2px] h-[1em] bg-current mx-[2px] align-middle translate-y-[-4px] text-color-2"
                    />?
                </span>
            </span>
        </h1>
    );
}