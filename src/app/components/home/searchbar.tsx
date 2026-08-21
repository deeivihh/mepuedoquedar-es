"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { BsFillSignTurnRightFill } from "react-icons/bs";
import { Site } from "@/app/utils/types";
import { useLocation } from "@/app/utils/useLocation";
import { usePreferences } from "@/app/contexts/PreferencesContext";
import { UserPreferences } from "@/lib/scores/userPreferences";
import { PREFERENCES_SCHEMA } from "@/lib/scores/preferencesSchema";
import { FaArrowLeft } from "react-icons/fa";
import { usePathname } from "next/navigation";

function Toggle({
    id,
    checked,
    onChange,
    ariaLabel,
}: {
    id: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    ariaLabel?: string;
}) {
    return (
        <button
            id={id}
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            onClick={() => onChange(!checked)}
            className={`font-bold text-sm uppercase border-2 border-title px-3 py-1 flex items-center justify-center transition-colors min-w-[3.5rem] ${checked ? "bg-title text-[var(--bg-color)]" : "bg-transparent text-title"}`}
        >
            {checked ? "SÍ" : "NO"}
        </button>
    );
}

function AgeSlider({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: number) => void;
}) {
    function ageLabel(age: number) {
        if (age < 30) return "Joven";
        if (age < 45) return "Adulto/a joven";
        if (age < 60) return "Adulto/a";
        return "Mayor";
    }

    return (
        <div className="flex flex-col gap-2 w-full mt-2">
            <div className="flex flex-col">
                <label htmlFor="pref-age" className="text-sm text-title font-semibold uppercase cursor-pointer">¿CUÁNTOS AÑOS TIENES?</label>
                <span className="text-xs font-bold text-title mt-0.5 uppercase">
                    {value} AÑOS <span className="opacity-80">· {ageLabel(value)}</span>
                </span>
            </div>
            <input
                id="pref-age"
                type="range"
                min={16}
                max={90}
                value={value}
                aria-label="¿Cuántos años tienes?"
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-title rounded-none appearance-none cursor-pointer accent-[var(--bg-color)] mt-2 border-2 border-title"
            />
            <div className="flex justify-between text-xs font-bold text-title w-full mt-1">
                <span>16</span>
                <span>90</span>
            </div>
        </div>
    );
}

function PreferencesPanel({
    preferences,
    onChange,
}: {
    preferences: UserPreferences;
    onChange: (prefs: UserPreferences) => void;
}) {
    function update(key: string, value: any) {
        onChange({ ...preferences, [key]: value });
    }

    return (
        <div className="w-full flex flex-col gap-6 pt-6">
            <div className="flex flex-col gap-6">
                {PREFERENCES_SCHEMA.map((config) => {
                    if (config.type === "boolean") {
                        return (
                            <div key={config.id} className="flex items-center justify-between gap-6 text-left border-b-2 border-title/20 pb-4">
                                <div>
                                    <label htmlFor={`pref-${config.id}`} className="text-sm text-title font-semibold uppercase cursor-pointer">{config.label}</label>
                                    <p className="text-xs font-bold text-title/85 mt-1 uppercase">{config.description}</p>
                                </div>
                                <Toggle
                                    id={`pref-${config.id}`}
                                    ariaLabel={config.label}
                                    checked={preferences[config.id] as boolean}
                                    onChange={(v) => update(config.id, v)}
                                />
                            </div>
                        );
                    } else if (config.type === "range" && config.id === "age") {
                        return (
                            <AgeSlider
                                key={config.id}
                                value={preferences[config.id] as number}
                                onChange={(v) => update(config.id, v)}
                            />
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
}

function SearchSkeleton() {
    return (
        <div className="flex flex-col gap-2 w-full animate-pulse mt-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center w-full h-14 border-b-2 border-title p-3 shrink-0 pointer-events-none">
                    <div className="h-4 bg-title/20 w-1/3" />
                    <div className="h-4 bg-title/10 w-16" />
                </div>
            ))}
        </div>
    );
}

export default function SearchBar() {
    const { locationParams, ready } = useLocation(true);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<Site[]>([]);
    const pathname = usePathname();
    const isHome = pathname === "/";
    const { preferences, setPreferences } = usePreferences();

    const abortRef = useRef<AbortController | null>(null);

    const isSearching = query.trim().length > 0;

    const search = useCallback(async (q: string) => {
        abortRef.current?.abort();
        if (q.trim() === "" || q.length < 3) {
            setResults([]);
            return;
        }
        const controller = new AbortController();
        abortRef.current = controller;
        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/jcyl/municipios?search=${encodeURIComponent(q)}&limit=10${locationParams}`,
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
    }, [locationParams]);

    useEffect(() => {
        if (!ready) return;
        if (query.trim().length >= 3) {
            search(query);
        } else {
            setResults([]);
        }
    }, [query, ready, search]);

    return (
        <div className={`relative flex flex-col w-full h-full`} style={{ zIndex: 100 }}>
            <div className="flex flex-col gap-1 w-full">
                <div className="flex gap-2">
                    {!isHome && (
                        <Link
                            href="/"
                            title="Volver"
                            className="inline-flex items-center justify-center gap-2 text-title hover:opacity-70 transition-opacity h-14 w-14 shrink-0"
                        >
                            <FaArrowLeft size={20} />
                        </Link>
                    )}
                    <div className="w-full flex gap-3 items-center h-14 border-b-2 border-title focus-within:shadow-[0_2px_0_0_var(--title-color)] transition-shadow px-1">
                        <svg className="w-6 h-6 text-title shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <input
                            id="search-municipios"
                            aria-label="Buscar municipio"
                            placeholder="Busca tu municipio..."
                            {...(isHome && { autoFocus: true })}
                            onChange={(e) => { setResults([]); setQuery(e.target.value); }}
                            value={query}
                            className="w-full h-full outline-none text-title font-medium"
                        />
                        {isLoading && (
                            <div className="w-5 h-5 border-2 border-title/30 border-t-title animate-spin shrink-0" />
                        )}
                        {query.length > 0 && !isLoading && (
                            <button
                                type="button"
                                aria-label="Limpiar búsqueda"
                                onClick={() => { setQuery(''); setResults([]); }}
                                className="text-title hover:opacity-70 transition-opacity shrink-0 w-10 h-10 flex items-center justify-center"
                            >
                                <IoMdClose size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isHome ? (
                <div className="grid grid-cols-1 grid-rows-1 h-full w-full mt-2 items-start">
                    <div
                        className="col-start-1 row-start-1 h-full w-full transition-opacity duration-150"
                        style={{ opacity: isSearching ? 0 : 1, pointerEvents: isSearching ? "none" : "auto" }}
                    >
                        <PreferencesPanel
                            preferences={preferences}
                            onChange={setPreferences}
                        />
                    </div>

                    {isSearching && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="col-start-1 row-start-1 w-full flex flex-col gap-4 max-h-[420px] overflow-y-auto z-10 self-start bg-bg-color pb-4 p-2"
                        >
                            {isLoading ? (
                                <SearchSkeleton />
                            ) : results.length > 0 ? (
                                results.map((result) => (
                                    <Link
                                        href={`/municipio/${result.cod_ine}`}
                                        key={result.cod_ine}
                                        className="flex justify-between gap-4 items-center w-full py-4 px-2 border-b-2 border-title hover:bg-title hover:text-[var(--bg-color)] group transition-colors"
                                    >
                                        <p className="font-bold text-lg uppercase text-balance group-hover:text-[var(--bg-color)]">{result.municipio}</p>
                                        {result.distance != null && (
                                            <span className="text-sm font-bold flex items-center justify-end gap-2 shrink-0 whitespace-nowrap min-w-[5rem] uppercase opacity-80 group-hover:text-[var(--bg-color)]">
                                                <BsFillSignTurnRightFill className="shrink-0" />
                                                {result.distance >= 1000
                                                    ? `${(result.distance / 1000).toFixed(1)} km`
                                                    : `${result.distance} m`}
                                            </span>
                                        )}
                                    </Link>
                                ))
                            ) : query.trim().length >= 3 ? (
                                <div className="flex items-center justify-center h-48 text-sm text-title/60 font-medium">
                                    No se encontraron municipios
                                </div>
                            ) : null}
                        </motion.div>
                    )}
                </div>
            ) : (
                isSearching && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="w-full mt-2 flex flex-col gap-3 max-h-[16rem] overflow-y-auto p-2"
                    >
                        {isLoading ? (
                            <SearchSkeleton />
                        ) : results.length > 0 ? (
                            results.map((result) => (
                                <Link
                                    href={`/municipio/${result.cod_ine}`}
                                    key={result.cod_ine}
                                    className="flex justify-between gap-4 items-center w-full py-4 px-2 border-b-2 border-title hover:bg-title hover:text-[var(--bg-color)] group transition-colors"
                                >
                                    <p className="font-bold text-lg uppercase text-balance group-hover:text-[var(--bg-color)]">{result.municipio}</p>
                                    {result.distance != null && (
                                        <span className="text-sm font-bold flex items-center justify-end gap-2 shrink-0 whitespace-nowrap min-w-[5rem] uppercase opacity-80 group-hover:text-[var(--bg-color)]">
                                            <BsFillSignTurnRightFill className="shrink-0" />
                                            {result.distance >= 1000
                                                ? `${(result.distance / 1000).toFixed(1)} km`
                                                : `${result.distance} m`}
                                        </span>
                                    )}
                                </Link>
                            ))
                        ) : query.trim().length >= 3 ? (
                            <div className="flex items-center justify-center h-full text-sm text-title/60 font-medium">
                                No se encontraron municipios
                            </div>
                        ) : null}
                    </motion.div>
                )
            )}
        </div>
    );
}
