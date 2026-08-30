"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as m from "motion/react-m";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { Site } from "@/types";
import { useLocation } from "@/hooks/useLocation";
import { usePreferences } from "@/contexts/PreferencesContext";
import { UserPreferences } from "@/lib/scores/userPreferences";
import { PREFERENCES_SCHEMA } from "@/lib/scores/preferencesSchema";
import { FaArrowLeft, FaRoute, FaSearch } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

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
            className={`font-bold text-sm uppercase border-2 border-title px-3 py-1 flex items-center justify-center transition-colors min-w-[3.5rem] ${checked ? "bg-title text-bg-card" : "bg-transparent text-title"}`}
        >
            {checked ? "SÍ" : "NO"}
        </button>
    );
}

function ageLabel(age: number) {
    if (age < 30) return "Joven";
    if (age < 45) return "Adulto/a joven";
    if (age < 60) return "Adulto/a";
    return "Mayor";
}

function AgeSlider({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: number) => void;
}) {

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
                className="w-full h-2 bg-title rounded-none appearance-none cursor-pointer accent-bg-card mt-2 border-2 border-title [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-bg-card [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-title [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:bg-bg-card [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-title [&::-moz-range-thumb]:cursor-pointer"
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
        <div className="flex flex-col gap-2 w-full animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center w-full h-10 border border-title/30 p-2 shrink-0 pointer-events-none">
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
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
            if (abortRef.current !== controller) return;
            setResults(data.results);
            setIsLoading(false);
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return;
            console.error("Error:", error);
            if (abortRef.current === controller) {
                setResults([]);
                setIsLoading(false);
            }
        }
    }, [locationParams]);

    useEffect(() => {
        if (!ready) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (query.trim().length < 3) {
            abortRef.current?.abort();
            setResults([]);
            return;
        }
        debounceRef.current = setTimeout(() => search(query), 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, ready, search]);

    return (
        <div className={`relative flex flex-col w-full`} style={{ zIndex: 100 }}>
            <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-center items-center divide-x divide-title/30 border border-title/30 h-12 overflow-hidden">
                    {!isHome && (
                        <Link
                            href="/"
                            title="Volver"
                            className={`justify-center items-center flex p-4 px-4.5 opacity-80 hover:opacity-100 text-title hover:bg-bg-card`}
                        >
                            <FaArrowLeft size={20} />
                        </Link>
                    )}
                    <div className={`w-full flex gap-4 justify-center items-center h-full pl-4 pr-3 focus-within:bg-bg-card ${isHome ? 'bg-bg-card' : 'hover:bg-bg-card/80'} active:bg-bg-card`}>
                        <FaSearch size={20} className="opacity-80 text-title shrink-0" />
                        <input
                            id="search-municipios"
                            aria-label="Buscar municipio"
                            placeholder="Busca tu municipio..."
                            {...(isHome && { autoFocus: true })}
                            onChange={(e) => { setResults([]); setQuery(e.target.value); }}
                            value={query}
                            className="w-full flex-1 min-w-0 h-full outline-none text-title font-medium bg-transparent"
                        />
                        {isLoading && (
                            <AiOutlineLoading3Quarters
                                size={15}
                                className="text-title shrink-0 mr-2.5 flex items-center justify-center animate-spin" />
                        )}
                        {query.length > 0 && !isLoading && (
                            <button
                                type="button"
                                aria-label="Limpiar búsqueda"
                                onClick={() => { setQuery(''); setResults([]); }}
                                className="text-title hover:opacity-70 transition-opacity shrink-0 w-8 h-8 flex items-center justify-center"
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
                        <m.div
                            className="col-start-1 row-start-1 w-full flex flex-col gap-4 min-md:max-h-[40rem] overflow-y-auto z-10 self-start"
                        >
                            {isLoading ? (
                                <SearchSkeleton />
                            ) : results.length > 0 ? (
                                results.map((result) => (
                                    <Link
                                        href={`/municipio/${result.cod_ine}`}
                                        key={result.cod_ine}
                                        className="flex justify-between w-full items-center gap-4 px-3 py-2 border border-title/50 hover:bg-bg-card/50 active:bg-bg-card"
                                    >
                                        <p className="font-semibold text-title">{result.municipio}</p>
                                        {result.distance != null && (
                                            <div className="flex items-center justify-center gap-1.5 shrink-0 text-title/80">
                                                <span className="font-medium text-sm text-right" title="Distancia desde tu ubicación actual"><FaRoute /></span>
                                                <span className="text-sm font-medium tabular-nums text-right">
                                                    {result.distance >= 1000
                                                        ? `${(result.distance / 1000).toFixed(1)} km`
                                                        : `${result.distance} m`}
                                                </span>
                                            </div>
                                        )}
                                    </Link>
                                ))
                            ) : query.trim().length >= 3 ? (
                                <div className="flex items-center justify-center h-48 text-sm text-title/60 font-medium">
                                    No se encontraron municipios
                                </div>
                            ) : null}
                        </m.div>
                    )}
                </div>
            ) : (
                isSearching && (
                    <div className="bg-bg-card h-[15rem] overflow-y-auto my-2 border border-title/30">
                        <m.div
                            className="w-full min-h-full flex flex-col gap-2 p-4"
                        >
                            {isLoading ? (
                                <SearchSkeleton />
                            ) : results.length > 0 ? (
                                results.map((result) => (
                                    <Link
                                        href={`/municipio/${result.cod_ine}`}
                                        key={result.cod_ine}
                                        className="flex justify-between w-full items-center gap-4 p-2 border border-title/30 hover:bg-white/50 active:bg-white"
                                    >
                                        <p className="font-semibold text-title">{result.municipio}</p>
                                        {result.distance != null && (
                                            <div className="flex items-center justify-center gap-1.5 shrink-0 text-title/80">
                                                <span className="font-medium text-sm text-right" title="Distancia desde tu ubicación actual"><FaRoute /></span>
                                                <span className="text-sm font-medium tabular-nums text-right">
                                                    {result.distance >= 1000
                                                        ? `${(result.distance / 1000).toFixed(1)} km`
                                                        : `${result.distance} m`}
                                                </span>
                                            </div>
                                        )}
                                    </Link>
                                ))
                            ) : query.trim().length >= 3 ? (
                                <div className="flex items-center justify-center h-48 text-sm text-title/60 font-medium">
                                    No se encontraron municipios
                                </div>
                            ) : null}
                        </m.div>
                    </div>
                )
            )}
        </div>
    );
}
