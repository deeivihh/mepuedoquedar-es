"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as m from "motion/react-m";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { Site } from "@/types";
import { useLocation } from "@/hooks/useLocation";
import { usePreferences } from "@/contexts/PreferencesContext";
import { PREFERENCES_SCHEMA } from "@/lib/scores/preferencesSchema";
import { FaArrowLeft, FaRoute, FaSearch } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const ageLabel = (age: number) =>
    age < 30 ? "Joven" : age < 45 ? "Adulto/a joven" : age < 60 ? "Adulto/a" : "Mayor";

function PreferencesPanel({ preferences, onChange }: { preferences: any; onChange: (p: any) => void }) {
    const update = (id: string, val: any) => onChange({ ...preferences, [id]: val });

    return (
        <div className="w-full flex flex-col gap-6 pt-6">
            {PREFERENCES_SCHEMA.map((cfg) => {
                if (cfg.type === "boolean") {
                    const checked = Boolean(preferences[cfg.id]);
                    return (
                        <div key={cfg.id} className="flex items-center justify-between gap-6 text-left border-b-2 border-title/20 pb-4">
                            <div>
                                <label htmlFor={`pref-${cfg.id}`} className="text-sm text-title font-semibold uppercase cursor-pointer">{cfg.label}</label>
                                <p className="text-xs font-bold text-title/85 mt-1 uppercase">{cfg.description}</p>
                            </div>
                            <button
                                id={`pref-${cfg.id}`}
                                role="switch"
                                aria-checked={checked}
                                aria-label={cfg.label}
                                onClick={() => update(cfg.id, !checked)}
                                className={`font-bold text-sm uppercase border-2 border-title px-3 py-1 min-w-[3.5rem] transition-colors ${checked ? "bg-title text-bg-card" : "bg-transparent text-title"}`}
                            >
                                {checked ? "SÍ" : "NO"}
                            </button>
                        </div>
                    );
                }
                const val = Number(preferences[cfg.id] ?? cfg.defaultValue);
                return (
                    <div key={cfg.id} className="flex flex-col gap-2 w-full mt-2">
                        <label htmlFor="pref-age" className="text-sm text-title font-semibold uppercase cursor-pointer">{cfg.label}</label>
                        <span className="text-xs font-bold text-title uppercase">{val} AÑOS <span className="opacity-80">· {ageLabel(val)}</span></span>
                        <input
                            id="pref-age"
                            type="range"
                            min={cfg.min}
                            max={cfg.max}
                            value={val}
                            aria-label={cfg.label}
                            onChange={(e) => update(cfg.id, Number(e.target.value))}
                            className="w-full h-2 bg-title rounded-none appearance-none cursor-pointer accent-bg-card mt-2 border-2 border-title"
                        />
                        <div className="flex justify-between text-xs font-bold text-title w-full mt-1">
                            <span>{cfg.min}</span>
                            <span>{cfg.max}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function SearchResults({ results, isLoading, query, isHome }: { results: Site[]; isLoading: boolean; query: string; isHome: boolean }) {
    if (isLoading) {
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

    if (results.length > 0) {
        return (
            <>
                {results.map((r) => (
                    <Link
                        key={r.cod_ine}
                        href={`/municipio/${r.cod_ine}`}
                        className={`flex justify-between w-full items-center gap-4 ${isHome ? "px-3 py-2 border border-title/50 hover:bg-bg-card/50 active:bg-bg-card" : "p-2 border border-title/30 hover:bg-white/50 active:bg-white"}`}
                    >
                        <p className="font-semibold text-title">{r.municipio}</p>
                        {r.distance != null && (
                            <div className="flex items-center justify-center gap-1.5 shrink-0 text-title/80">
                                <span className="font-medium text-sm" title="Distancia desde tu ubicación actual"><FaRoute /></span>
                                <span className="text-sm font-medium tabular-nums">{r.distance >= 1000 ? `${(r.distance / 1000).toFixed(1)} km` : `${r.distance} m`}</span>
                            </div>
                        )}
                    </Link>
                ))}
            </>
        );
    }

    if (query.trim().length >= 3) {
        return <div className="flex items-center justify-center h-48 text-sm text-title/60 font-medium">No se encontraron municipios</div>;
    }

    return null;
}

export default function SearchBar() {
    const { locationParams, ready } = useLocation(true);
    const pathname = usePathname();
    const isHome = pathname === "/";
    const { preferences, setPreferences } = usePreferences();

    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<Site[]>([]);
    const abortRef = useRef<AbortController | null>(null);

    const isSearching = query.trim().length > 0;

    const doSearch = useCallback(async (q: string) => {
        abortRef.current?.abort();
        if (q.trim().length < 3) {
            setResults([]);
            return;
        }
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/jcyl/municipios?search=${encodeURIComponent(q)}&limit=10${locationParams}`, { signal: ctrl.signal });
            if (res.ok) {
                const data: any = await res.json();
                if (abortRef.current === ctrl) setResults(data.results || []);
            }
        } catch (e: any) {
            if (e.name !== "AbortError") setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [locationParams]);

    useEffect(() => {
        if (!ready) return;
        const timer = setTimeout(() => doSearch(query), 300);
        return () => clearTimeout(timer);
    }, [query, ready, doSearch]);

    return (
        <div className="relative flex flex-col w-full" style={{ zIndex: 100 }}>
            <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-center items-center divide-x divide-title/30 border border-title/30 h-12 overflow-hidden">
                    {!isHome && (
                        <Link href="/" title="Volver" className="justify-center items-center flex p-4 px-4.5 opacity-80 hover:opacity-100 text-title hover:bg-bg-card">
                            <FaArrowLeft size={20} />
                        </Link>
                    )}
                    <div className={`w-full flex gap-4 justify-center items-center h-full pl-4 pr-3 focus-within:bg-bg-card ${isHome ? "bg-bg-card" : "hover:bg-bg-card/80"} active:bg-bg-card`}>
                        <FaSearch size={20} className="opacity-80 text-title shrink-0" />
                        <input
                            id="search-municipios"
                            aria-label="Buscar municipio"
                            placeholder="Busca tu municipio..."
                            autoFocus={isHome}
                            value={query}
                            onChange={(e) => { setResults([]); setQuery(e.target.value); }}
                            className="w-full flex-1 min-w-0 h-full outline-none text-title font-medium bg-transparent"
                        />
                        {isLoading && <AiOutlineLoading3Quarters size={15} className="text-title shrink-0 mr-2.5 animate-spin" />}
                        {query.length > 0 && !isLoading && (
                            <button type="button" aria-label="Limpiar búsqueda" onClick={() => { setQuery(""); setResults([]); }} className="text-title hover:opacity-70 shrink-0 w-8 h-8 flex items-center justify-center">
                                <IoMdClose size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isHome ? (
                <div className="grid grid-cols-1 grid-rows-1 h-full w-full mt-2 items-start">
                    <div className="col-start-1 row-start-1 h-full w-full transition-opacity duration-150" style={{ opacity: isSearching ? 0 : 1, pointerEvents: isSearching ? "none" : "auto" }}>
                        <PreferencesPanel preferences={preferences} onChange={setPreferences} />
                    </div>
                    {isSearching && (
                        <m.div className="col-start-1 row-start-1 w-full flex flex-col gap-4 min-md:max-h-[40rem] overflow-y-auto z-10 self-start">
                            <SearchResults results={results} isLoading={isLoading} query={query} isHome={true} />
                        </m.div>
                    )}
                </div>
            ) : (
                isSearching && (
                    <div className="bg-bg-card h-[15rem] overflow-y-auto my-2 border border-title/30">
                        <m.div className="w-full min-h-full flex flex-col gap-2 p-4">
                            <SearchResults results={results} isLoading={isLoading} query={query} isHome={false} />
                        </m.div>
                    </div>
                )
            )}
        </div>
    );
}
