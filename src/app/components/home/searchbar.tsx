"use client"

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { BsFillSignTurnRightFill } from "react-icons/bs";
import { IoCloseSharp, IoSettingsSharp } from "react-icons/io5";
import { Site } from "@/app/utils/types";
import { useLocation } from "@/app/utils/useLocation";
import { useTypewriter } from "@/app/utils/useTypewriter";
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
    onClose,
}: {
    preferences: UserPreferences;
    onChange: (prefs: UserPreferences) => void;
    onClose: () => void;
}) {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            const target = e.target as Element;
            if (target.closest('#pref-button')) return;

            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [onClose]);

    function update(key: string, value: any) {
        onChange({ ...preferences, [key]: value });
    }

    return (
        <motion.div
            ref={panelRef}
            className="flex w-full mt-2 mb-4 card border border-title/20 rounded-2xl shadow-xl p-4 flex flex-col gap-5"
            style={{ zIndex: 100 }}
        >
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-title text-base">Personaliza tu búsqueda</h2>
                <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-title/10 transition-colors"
                    aria-label="Cerrar"
                >
                    <IoMdClose size={16} className="text-title" />
                </button>
            </div>

            <p className="text-xs text-title/60 -mt-3">
                Ajustamos la puntuación de cada municipio según tu situación.
            </p>

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
        </motion.div>
    );
}

export default function SearchBar() {
    const { locationParams, ready } = useLocation(true);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<Site[]>([]);
    const [showPrefs, setShowPrefs] = useState(false);
    const { preferences, setPreferences, isDefault } = usePreferences();
    const pathname = usePathname();

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

    useEffect(() => {
        if (!ready) return;
        if (query.trim() !== "" || query.length >= 3) {
            search(query);
        } else {
            setResults([]);
        }
    }, [query, ready]);


    return (
        <div className={`relative flex flex-col justify-center items-center w-full ${pathname === "/" ? "max-w-xl" : ""}`} style={{ zIndex: 100 }}>
            <div className="flex gap-1 w-full mx-auto relative">
                {pathname !== "/" && (
                    <Link
                        href="/"
                        title="Volver"
                        className="inline-flex items-center gap-2 text-sm text-title/80 hover:text-title transition-colors w-fit px-4 bg-bg-card hover:bg-white border border-title/30 rounded-full"
                    >
                        <FaArrowLeft size={15} />
                    </Link>
                )}
                <div className={`w-full card border border-title/30 rounded-[32px] transition-all duration-300 overflow-hidden flex gap-2 items-center px-4 h-12`}>
                    <input
                        placeholder="Busca tu municipio..."
                        autoFocus
                        onChange={(e) => { if (e.target.value.length < 3) setResults([]); setQuery(e.target.value); }}
                        value={query}
                        className={`w-full h-full outline-none text-title font-medium`}
                    />
                    {query.length > 0 && (
                        <button onClick={() => { setQuery(''); setResults([]); }} className="bg-white/30 rounded-full p-1.5 border border-title/20 hover:bg-white/50 transition-all duration-150 shrink-0 ">
                            <IoMdClose size={15} strokeWidth="10" />
                        </button>
                    )}
                    <button
                        id="pref-button"
                        onClick={() => setShowPrefs(v => !v)}
                        title="Personalizar búsqueda"
                        className={`rounded-full p-1.5 border border-title/20 hover:bg-white/90 ${showPrefs ? 'bg-white' : 'bg-white/50'} transition-all duration-150 shrink-0`}
                    >
                        <IoSettingsSharp size={15} />
                    </button>
                </div>
            </div>
            <div className={`w-full flex flex-col ${pathname === "/" ? "absolute top-full left-0" : ""}`}>
                <AnimatePresence>
                    {showPrefs && (
                        <PreferencesPanel
                            preferences={preferences}
                            onChange={setPreferences}
                            onClose={() => setShowPrefs(false)}
                        />
                    )}
                </AnimatePresence>
                <div className="w-full">
                    {results.length > 0 && !showPrefs && (
                        <div className="mt-2 mb-2 flex flex-col" style={{ zIndex: 100 }}>
                            <div className="card border border-title/30 rounded-2xl shadow-xl overflow-hidden">
                                <div className="flex flex-col gap-2 max-h-[21rem] overflow-y-auto">
                                    {results.map((result) => (
                                        <Link href={`/municipio/${result.cod_ine}`} key={result.cod_ine} className={`flex justify-between gap-4 items-center w-full h-full hover:bg-white/30 px-4 py-2 first:pt-3 last:pb-3`}>
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
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}