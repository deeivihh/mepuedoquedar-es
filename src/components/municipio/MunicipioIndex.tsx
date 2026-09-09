"use client";

import { useState, useEffect, useCallback } from "react";
import LocationNotice from "@/components/common/LocationNotice";
import { useLocation } from "@/hooks/useLocation";
import MunicipiosSimilares, { MunicipioSimilar } from "./MunicipiosSimilares";

const SECTION_LABELS: Record<string, string> = {
    "conoce-el-lugar": "Conoce el lugar",
    "equipo-de-gobierno": "Equipo de gobierno",
    "vivir-aqui": "Vivir aquí",
    "conectividad": "Conectividad",
    "lo-que-cuentan-los-datos": "Lo que cuentan los datos",
    "prensa-local": "Prensa local",
};

function normalizeSectionId(id: string): string {
    if (SECTION_LABELS[id]) return SECTION_LABELS[id];
    const words = id.split("-").filter(Boolean);
    if (!words.length) return id;
    const str = words.join(" ");
    return str.charAt(0).toUpperCase() + str.slice(1);
}

interface SectionItem {
    id: string;
    label: string;
}

export default function MunicipioIndex({ similares }: { similares?: MunicipioSimilar[] }) {
    const { permissionDenied } = useLocation();
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    const updateSections = useCallback(() => {
        const elements = document.querySelectorAll("article section[id]");
        const found: SectionItem[] = [];
        elements.forEach((el) => {
            const id = el.getAttribute("id");
            if (id) {
                found.push({ id, label: normalizeSectionId(id) });
            }
        });
        if (found.length > 0) {
            setSections(found);
        }
    }, []);

    useEffect(() => {
        updateSections();
        const timer = setTimeout(updateSections, 300);
        return () => clearTimeout(timer);
    }, [updateSections]);

    useEffect(() => {
        if (!sections.length) return;

        const handleScroll = () => {
            let currentId = "";
            const isNearBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60);

            if (isNearBottom) {
                currentId = sections[sections.length - 1].id;
            } else {
                for (const sec of sections) {
                    const el = document.getElementById(sec.id);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        if (rect.top <= 220) {
                            currentId = sec.id;
                        }
                    }
                }
            }

            setActiveId(currentId);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [sections]);

    const scrollToSection = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            const yOffset = -28;
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
            setActiveId(id);
            window.history.replaceState(null, "", `#${id}`);
        }
    };

    if (sections.length === 0 && !permissionDenied && (!similares || similares.length === 0)) return null;

    return (
        <aside className="hidden xl:block absolute left-[calc(100%+1.5rem)] h-full pointer-events-none z-30">
            <div className="sticky top-6 pointer-events-auto flex flex-col gap-3 w-50 2xl:w-50">
                {sections.length > 0 && (
                    <div className="bg-white/50 border border-title/30 shadow p-2">
                        <nav className="flex flex-col gap-1">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-title/60 px-1 py-0.5">
                                Tabla de contenidos
                            </span>
                            {sections.map((sec, idx) => {
                                const isActive = activeId === sec.id;
                                return (
                                    <button
                                        key={sec.id}
                                        onClick={(e) => scrollToSection(sec.id, e)}
                                        className={`group flex items-baseline text-left py-1.5 px-2 rounded-xs transition-colors duration-150 text-xs ${isActive
                                            ? "bg-white/60 text-title font-semibold shadow-2xs"
                                            : "text-title/70 hover:text-title hover:bg-white"
                                            }`}
                                    >
                                        <span
                                            className={`font-mono text-[11px] mr-1.5 shrink-0 ${isActive ? "text-text-2 font-bold" : "text-title/40 group-hover:text-text-2"
                                                }`}
                                        >
                                            {idx + 1}.
                                        </span>
                                        <span className="truncate leading-tight">{sec.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                )}
                <MunicipiosSimilares items={similares} />
                <LocationNotice />
            </div>
        </aside>
    );
}
