import { DepartmentScore, getGlobalLabel } from "@/lib/scores/calculateScores";
import { computeWeightMultipliers } from "@/lib/scores/userPreferences";
import { getDepartmentPriority, formatIndicatorValue } from "@/lib/scores/departmentPriority";
import { usePreferences } from "@/contexts/PreferencesContext";
import {
    FaGraduationCap, FaBriefcase, FaCoins, FaStore, FaLandmark,
    FaShieldAlt, FaLayerGroup, FaChartLine, FaChevronDown, FaArrowRight
} from "react-icons/fa";
import { MdLocalHospital, MdOutlineSportsMartialArts, MdOutlineTravelExplore, MdPublic } from "react-icons/md";
import { GiBowlingPin } from "react-icons/gi";
import { FaPeopleGroup, FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { IconType } from "react-icons";
import { useMemo, useState } from "react";

const ICONS: Record<string, IconType> = {
    sanidad: MdLocalHospital, educacion: FaGraduationCap, empleo: FaBriefcase,
    economia: FaCoins, comercio: FaStore, turismo: MdOutlineTravelExplore,
    cultura: FaLandmark, ocio: GiBowlingPin, seguridad: FaShieldAlt,
    juventud: FaPeopleGroup, deporte: MdOutlineSportsMartialArts, deportes: MdOutlineSportsMartialArts,
    sociedad: MdPublic, ine: FaChartLine,
};

function ScoreItem({ name, number, multiplier, isDefault, preferences }: { name: string; number: DepartmentScore; multiplier: number; isDefault: boolean; preferences: Record<string, any> }) {
    const Icon = ICONS[name] ?? FaLayerGroup;
    const pct = number.maxScore > 0 ? Math.round((number.score / number.maxScore) * 100) : 0;
    const priority = getDepartmentPriority(name, multiplier, preferences, isDefault);

    return (
        <details className={`group bg-white/30 border border-title/20 p-4 text-title transition-[background-color,border-color] duration-150 hover:bg-white/40 ${name === "ine" ? "md:col-span-2" : ""}`}>
            <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                <div className="flex min-h-11 items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        <Icon className="shrink-0 text-lg text-title" />
                        <span className={`truncate text-base font-semibold text-title ${name === "ine" ? "uppercase" : "capitalize"}`}>{name}</span>
                        {priority.level === "high" && (
                            <span title={priority.reason ?? "Mayor peso en tu perfil"} className="flex shrink-0 cursor-help items-center text-color-2">
                                <FaArrowTrendUp size={13} />
                            </span>
                        )}
                        {priority.level === "low" && (
                            <span title={priority.reason ?? "Menor peso en tu perfil"} className="flex shrink-0 cursor-help items-center text-black/40">
                                <FaArrowTrendDown size={13} />
                            </span>
                        )}
                    </div>
                    <div className="ml-auto flex shrink-0 items-center gap-3">
                        <span className="font-mono text-base font-bold text-color-2">{pct}/100</span>
                        <FaChevronDown className="text-xs text-title/45 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </div>
                </div>
                <div className="mt-3 h-1 w-full overflow-hidden bg-title/10">
                    <div className="h-full bg-text-2 transition-[width] duration-500" style={{ width: `${pct}%` }} />
                </div>
            </summary>

            <div className="mt-4 flex flex-col gap-2 pt-1">
                {number.noData ? (
                    <p className="text-xs italic text-black/50">Sin registros oficiales suficientes en el término municipal</p>
                ) : (
                    number.indicators.map((ind) => (
                        <div key={ind.label} className="flex items-center justify-between gap-3 bg-white/30 border border-title/20 px-3 py-2.5 text-[11px]">
                            <span className="min-w-0 truncate font-medium text-black/80" title={ind.label}>{ind.label}</span>
                            <div className="flex shrink-0 items-center gap-2">
                                <span className="font-mono text-[10px] text-black/60">{formatIndicatorValue(ind)}</span>
                                <span className={`font-mono text-[10px] font-semibold ${ind.score > 0 ? "text-title/80" : "text-title/30"}`}>
                                    +{ind.score}/{ind.max}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </details>
    );
}

export default function GeneralScore({ number, scoresDepartments }: { number: number; scoresDepartments: Record<string, DepartmentScore> }) {
    const { preferences, isDefault } = usePreferences();
    const [showDepartments, setShowDepartments] = useState(false);
    const multipliers = useMemo(() => (isDefault ? {} : computeWeightMultipliers(preferences)), [preferences, isDefault]);

    return (
        <div className="flex w-full flex-col gap-7 text-title">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center sm:gap-8">
                <div className="shrink-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-title/55">¿Encaja contigo?</p>
                    <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="title-font text-6xl font-semibold leading-none text-title sm:text-7xl">{number}</span>
                        <span className="font-mono text-sm font-semibold text-title/50">/ 100</span>
                    </div>
                </div>

                <div className="hidden h-14 w-px bg-title/20 sm:block" aria-hidden="true" />

                <div className="flex flex-col gap-4 w-full items-center md:justify-end">
                    <p className="title-font text-2xl font-semibold w-full md:text-right sm:text-3xl">{getGlobalLabel(number)}</p>
                    <button
                        type="button"
                        onClick={() => setShowDepartments((v) => !v)}
                        aria-expanded={showDepartments}
                        className="inline-flex items-center gap-2 self-start text-[11px] font-bold uppercase tracking-[0.18em] text-text-2 transition-[color,transform] duration-150 active:scale-[0.96] hover:text-title sm:ml-auto sm:self-center"
                    >
                        {showDepartments ? "Ocultar puntuación" : "Ver puntuación por departamento"}
                        <FaArrowRight className={`text-[10px] transition-transform duration-150 ${showDepartments ? "rotate-90" : ""}`} aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="relative h-1.5 w-full bg-title/10">
                <div className="h-full bg-text-2 transition-[width] duration-500 ease-out" style={{ width: `${Math.min(100, Math.max(0, number))}%`, zIndex: "2" }} />
                <div className="h-full -mt-1 bg-text-2 transition-[width] duration-500 ease-out scale-102 blur-xl opacity-75" style={{ width: `${Math.min(100, Math.max(0, number))}%` }} />
            </div>


            {showDepartments && (
                <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
                    {Object.entries(scoresDepartments).map(([key, val]) => (
                        <ScoreItem key={key} name={key} number={val} multiplier={multipliers[key] ?? 1.0} isDefault={isDefault} preferences={preferences} />
                    ))}
                </div>
            )}
        </div>
    );
}
