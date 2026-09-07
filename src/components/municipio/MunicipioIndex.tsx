"use client";

import { useState, useEffect, useCallback } from "react";
import { MdOutlineFormatListNumbered, MdClose } from "react-icons/md";

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

export default function MunicipioIndex() {
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");
    const [mobileOpen, setMobileOpen] = useState(false);

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
        setMobileOpen(false);
    };

    if (sections.length === 0) return null;

    return (
        <>
            <aside className="hidden xl:block absolute left-[calc(100%+1.5rem)] -top-0.5 h-full pointer-events-none z-30">
                <div className="sticky top-6 pointer-events-auto w-50 2xl:w-50 bg-white/50 border border-title/20 p-2 shadow">
                    <nav className="flex flex-col gap-1">
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
            </aside>

            <div className="xl:hidden fixed right-4 bottom-6 z-50">
                {mobileOpen && (
                    <div className="mb-2 w-56 bg-white/95 backdrop-blur-md border border-title/20 p-3 shadow-lg flex flex-col gap-1">
                        <div className="flex items-center justify-between pb-2 border-b border-title/15 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-title/60">Índice</span>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="text-title/50 hover:text-title p-0.5"
                                aria-label="Cerrar índice"
                            >
                                <MdClose size={16} />
                            </button>
                        </div>
                        {sections.map((sec, idx) => {
                            const isActive = activeId === sec.id;
                            return (
                                <button
                                    key={sec.id}
                                    onClick={(e) => scrollToSection(sec.id, e)}
                                    className={`flex items-baseline text-left py-1.5 px-2 rounded-xs text-xs ${isActive
                                        ? "bg-title/10 text-title font-semibold"
                                        : "text-title/70 hover:text-title hover:bg-black/5"
                                        }`}
                                >
                                    <span
                                        className={`font-mono text-[11px] mr-1.5 shrink-0 ${isActive ? "text-text-2 font-bold" : "text-title/40"
                                            }`}
                                    >
                                        {idx + 1}.
                                    </span>
                                    <span className="truncate">{sec.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-md border border-title/20 text-title shadow-md text-xs font-semibold hover:bg-white transition-colors"
                    aria-label="Abrir índice"
                >
                    <MdOutlineFormatListNumbered className="text-base text-text-2" />
                    <span>Índice</span>
                </button>
            </div>
        </>
    );
}
