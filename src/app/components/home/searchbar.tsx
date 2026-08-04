"use client"

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { BsFillSignTurnRightFill } from "react-icons/bs";
import { Site } from "@/app/utils/types";
import { useLocation } from "@/app/utils/useLocation";
import { useTypewriter } from "@/app/utils/useTypewriter";

export default function SearchBar() {
    const { locationParams, ready } = useLocation(true);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<Site[]>([]);

    const [randomSites, setRandomSites] = useState<Site[]>([]);
    const municipioNames = useMemo(() => randomSites.map((s) => s.municipio), [randomSites]);
    const typed = useTypewriter(municipioNames, 70, 35, 4000);

    const abortRef = useRef<AbortController | null>(null);

    async function search(query: string) {
        abortRef.current?.abort();
        if (query.trim() === "" || query.length < 3) return;
        const controller = new AbortController();
        abortRef.current = controller;
        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/jcyl/municipios?search=${encodeURIComponent(query)}&limit=10${locationParams}`,
                { signal: controller.signal }
            );
            if (!response.ok) throw new Error("Error al buscar");
            const data: { results: Site[] } = await response.json();
            setResults(data.results);
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return;
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    }

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
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!ready) return;
        if (query.trim() !== "" || query.length >= 3) {
            search(query);
        } else {
            setResults([]);
        }
    }, [query, ready]);

    useEffect(() => {
        getRandom();
    }, []);

    return (
        <div className="flex flex-col justify-center items-center h-[75svh]">
            <h1 className="text-4xl max-md:text-3xl text-center mb-8 font-semibold tracking-tight">
                ¿Me puedo quedar en{" "}
                <span className="max-md:block">
                    <span className="text-color-2">{typed || ""}</span>
                    <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        className="inline-block w-[2px] h-[1em] bg-current mx-[2px] align-middle translate-y-[-4px] text-color-2"
                    />?
                </span>
            </h1>
            <div className="flex flex-col gap-2 w-full max-w-xl mx-auto relative">
                <div className={`card border shadow-xl border-title/30 rounded-full transition-all duration-300 overflow-hidden flex gap-4 items-center px-4 h-12`}>
                    <input placeholder="Busca tu municipio..." autoFocus onChange={(e) => { if (e.target.value.length < 3) setResults([]); setQuery(e.target.value); }} value={query} className={`w-full h-full outline-none text-title font-medium`} />
                    {query.length > 0 && <button onClick={() => { setQuery(''); setResults([]); }} className="bg-white/20 rounded-full p-1 border border-title/20 shadow-inner hover:bg-white/30">
                        <IoMdClose size={15} />
                    </button>}
                </div>
                {results.length > 0 &&
                    <div className="mt-5 absolute top-full left-0 right-0 max-h-80 overflow-y-auto">
                        <div className="flex flex-col gap-4 px-4 pt-0">
                            {results.map((result) => (
                                <Link href={`/municipio/${result.cod_ine}`} key={result.cod_ine} className="rounded-sm hover:bg-bg-card/80 border border-title/30 flex max-md:flex-col gap-2 py-2 px-4 justify-between items-center">
                                    <p className="font-semibold text-title text-balance">{result.municipio}</p>
                                    {result.distance != null && (
                                        <span className="text-sm text-title opacity-70 flex items-center gap-1">
                                            <BsFillSignTurnRightFill />
                                            {result.distance >= 1000
                                                ? `${(result.distance / 1000).toFixed(1)} km`
                                                : `${result.distance} m`}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>}
            </div>
        </div>
    );
}