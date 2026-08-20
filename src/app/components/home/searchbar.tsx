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
}: {
    id: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <button
            id={id}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none ${checked ? "bg-title border-title" : "bg-title/20 border-title/20"}`}
        >
            <span
                className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-bg-card shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0.5"}`}
            />
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
        <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-title">¿Cuántos años tienes?</span>
                <span className="text-sm font-semibold text-title/70">
                    {value} años · <span className="text-text-color-2">{ageLabel(value)}</span>
                </span>
            </div>
            <input
                id="pref-age"
                type="range"
                min={16}
                max={90}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-title"
                style={{
                    background: `linear-gradient(to right, var(--title-color) 0%, var(--title-color) ${((value - 16) / 74) * 100}%, color-mix(in srgb, var(--title-color) 20%, transparent) ${((value - 16) / 74) * 100}%, color-mix(in srgb, var(--title-color) 20%, transparent) 100%)`
                }}
            />
            <div className="flex justify-between text-xs text-title/50">
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
        <div className="p-4 flex flex-col gap-5 w-full card border border-title/20">
            {PREFERENCES_SCHEMA.map((config) => {
                if (config.type === "boolean") {
                    return (
                        <div key={config.id} className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-title">{config.label}</p>
                                <p className="text-xs text-title/50">{config.description}</p>
                            </div>
                            <Toggle
                                id={`pref-${config.id}`}
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
    );
}

function SearchSkeleton() {
    return (
        <div className="flex flex-col gap-2 w-full animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center w-full h-12 p-2.5 px-4 card border border-title/10 bg-title/5 shrink-0">
                    <div className="h-4 bg-title/15 rounded w-1/3" />
                    <div className="h-3 bg-title/10 rounded w-16" />
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
        <div className={`relative flex flex-col w-full mx-auto ${isHome ? "max-w-lg" : ""}`} style={{ zIndex: 100 }}>
            <div className="flex flex-col gap-1 w-full mx-auto">
                <div className="flex gap-2">
                    {!isHome && (
                        <Link
                            href="/"
                            title="Volver"
                            className="inline-flex items-center gap-2 text-sm text-title/80 hover:text-title transition-colors w-fit px-4 bg-bg-card hover:bg-white border border-title/30"
                        >
                            <FaArrowLeft size={15} />
                        </Link>
                    )}
                    <div className={`w-full card border border-title/30 transition-all duration-300 overflow-hidden flex gap-2 items-center h-12 px-4`}>
                        <input
                            placeholder="Busca tu municipio..."
                            {...(isHome && { autoFocus: true })}
                            onChange={(e) => { setResults([]); setQuery(e.target.value); }}
                            value={query}
                            className="w-full h-full outline-none text-title font-medium bg-transparent"
                        />
                        {isLoading && (
                            <div className="w-3.5 h-3.5 border-2 border-title/30 border-t-title rounded-full animate-spin shrink-0" />
                        )}
                        {query.length > 0 && !isLoading && (
                            <button
                                type="button"
                                onClick={() => { setQuery(''); setResults([]); }}
                                className="bg-white/0 p-1.5 border border-title/20 hover:bg-white/90 transition-all duration-150 shrink-0"
                            >
                                <IoMdClose size={15} strokeWidth="10" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isHome ? (
                <div className="grid grid-cols-1 grid-rows-1 w-full mt-2 items-start">
                    <div
                        className="col-start-1 row-start-1 w-full transition-opacity duration-150"
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
                            className="col-start-1 row-start-1 w-full flex flex-col gap-2 max-h-[390px] overflow-y-auto z-10 self-start"
                        >
                            {isLoading ? (
                                <SearchSkeleton />
                            ) : results.length > 0 ? (
                                results.map((result) => (
                                    <Link
                                        href={`/municipio/${result.cod_ine}`}
                                        key={result.cod_ine}
                                        className="flex justify-between gap-4 items-center w-full h-12 hover:bg-white/30 border border-title/20 p-2.5 px-4 card shrink-0"
                                    >
                                        <p className="font-semibold text-title text-balance">{result.municipio}</p>
                                        {result.distance != null && (
                                            <span className="text-sm text-title opacity-70 flex items-center justify-end gap-1 shrink-0 whitespace-nowrap min-w-[5rem]">
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
                        className="w-full mt-2 flex flex-col gap-2 h-[14.5rem] overflow-y-auto p-2 bg-bg-card card border border-title/20 shadow-sm"
                    >
                        {isLoading ? (
                            <SearchSkeleton />
                        ) : results.length > 0 ? (
                            results.map((result) => (
                                <Link
                                    href={`/municipio/${result.cod_ine}`}
                                    key={result.cod_ine}
                                    className="flex justify-between gap-4 items-center w-full h-12 hover:bg-white/40 border border-title/15 p-2.5 px-4 card shrink-0"
                                >
                                    <p className="font-semibold text-title text-balance">{result.municipio}</p>
                                    {result.distance != null && (
                                        <span className="text-sm text-title opacity-70 flex items-center justify-end gap-1 shrink-0 whitespace-nowrap min-w-[5rem]">
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
