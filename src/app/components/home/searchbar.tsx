"use client"

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";

export interface Site {
    municipio: string;
    cod_municipio: string;
    provincia: string;
    cod_provincia: string;
    cod_ine: number;
    poblacion: number;
    mancomunidades: string | null;
    entidades_locales_menores: string | null;
    comarca: string | null;
    longitud: number;
    latitud: number;
    coordenadax: number;
    coordenaday: number;
    posicion: {
        lon: number;
        lat: number;
    };
    presencia_de_comercio: string;
}

function useTypewriter(words: string[], typingSpeed = 80, deletingSpeed = 40, pauseMs = 5000) {
    const [displayed, setDisplayed] = useState("");
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    const currentWord = words[wordIndex] || "";

    useEffect(() => {
        if (words.length === 0) return;

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (displayed.length < currentWord.length) {
                    setDisplayed(currentWord.slice(0, displayed.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), pauseMs);
                }
            } else {
                if (displayed.length > 0) {
                    setDisplayed(currentWord.slice(0, displayed.length - 1));
                } else {
                    setIsDeleting(false);
                    setWordIndex((prev) => (prev + 1) % words.length);
                }
            }
        }, isDeleting ? deletingSpeed : typingSpeed);

        return () => clearTimeout(timeout);
    }, [displayed, isDeleting, currentWord, words, typingSpeed, deletingSpeed, pauseMs]);

    return displayed;
}

export default function SearchBar() {
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
                `/api/jcyl/municipios?search=${encodeURIComponent(query)}&limit=10`,
                { signal: controller.signal }
            );
            if (!response.ok) throw new Error("Error al buscar");
            const data: { results: Site[] } = await response.json();
            setResults(data.results);
            console.log(data);
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
        if (query.trim() !== "" || query.length >= 3) {
            search(query);
        } else {
            setResults([]);
        }
    }, [query]);

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
                <div className={`card border shadow-lg border-title/30 rounded-full transition-all duration-300 overflow-hidden flex gap-4 items-center px-4 h-12`}>
                    <input placeholder="Busca tu municipio..." autoFocus onChange={(e) => { if (e.target.value.length < 3) setResults([]); setQuery(e.target.value); }} value={query} className={`w-full h-full outline-none text-title font-medium`} />
                    {query.length > 0 && <button onClick={() => { setQuery(''); setResults([]); }} className="bg-white/20 rounded-full p-1 border border-black/20 shadow-inner hover:bg-white/30">
                        <IoMdClose size={15} />
                    </button>}
                </div>
                {results.length > 0 &&
                    <div className="mt-4 absolute top-full left-0 right-0 max-h-80 overflow-y-auto">
                        <div className="flex flex-col gap-4 p-4 pt-0">
                            {results.map((result) => (
                                <Link href={`/municipio/${result.cod_municipio}`} key={result.cod_municipio} className="bg-scroll hover:bg-scroll/80 font-medium text-color-3 py-2 px-4">
                                    <p>{result.municipio}</p>
                                </Link>
                            ))}
                        </div>
                    </div>}
            </div>
        </div>
    );
}