import { DepartmentScore } from "@/lib/scores/calculateScores";
import { computeWeightMultipliers } from "@/lib/scores/userPreferences";
import { getDepartmentPriority, formatIndicatorValue } from "@/lib/scores/departmentPriority";
import { usePreferences } from "@/app/contexts/PreferencesContext";
import {
    FaGraduationCap,
    FaBriefcase,
    FaCoins,
    FaStore,
    FaLandmark,
    FaShieldAlt,
    FaLayerGroup,
    FaChartLine,
} from "react-icons/fa";
import { IconType } from "react-icons";
import { MdLocalHospital, MdOutlineSportsMartialArts, MdOutlineTravelExplore, MdPublic } from "react-icons/md";
import { GiBowlingPin } from "react-icons/gi";
import { FaPeopleGroup, FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { FaChevronDown } from "react-icons/fa";
import { useMemo, useState } from "react";

const DEPARTMENT_ICONS: Record<string, IconType> = {
    sanidad: MdLocalHospital,
    educacion: FaGraduationCap,
    empleo: FaBriefcase,
    economia: FaCoins,
    comercio: FaStore,
    turismo: MdOutlineTravelExplore,
    cultura: FaLandmark,
    ocio: GiBowlingPin,
    seguridad: FaShieldAlt,
    juventud: FaPeopleGroup,
    deporte: MdOutlineSportsMartialArts,
    deportes: MdOutlineSportsMartialArts,
    sociedad: MdPublic,
    ine: FaChartLine,
};

export default function GeneralScore({
    number,
    scoresDepartments
}: {
    number: number;
    scoresDepartments: Record<string, DepartmentScore>;
}) {
    const { preferences, isDefault } = usePreferences();

    function labelText() {
        if (number >= 80) return "¡Es sin duda tu lugar ideal!";
        if (number >= 65) return "Es un lugar muy recomendable";
        if (number >= 50) return "Podría ser una buena opción";
        if (number >= 35) return "Quizás no sea para ti";
        return "No parece tu lugar ideal";
    }

    const multipliers = useMemo(() => {
        return isDefault ? {} : computeWeightMultipliers(preferences);
    }, [preferences, isDefault]);

    const [showDepartments, setShowDepartments] = useState(false);

    return (
        <div className="flex w-full flex-col items-center justify-center gap-6 text-title">
            <div className="grid w-full gap-5 pb-2 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-8">
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="title-font text-7xl font-semibold leading-none text-title sm:text-8xl">
                            {number}
                        </span>
                        <span className="font-mono text-xl font-semibold text-text-2">/ 100</span>
                    </div>
                </div>
                <span className="max-w-xl text-3xl font-semibold leading-tight text-title title-font sm:justify-self-end sm:text-right sm:text-4xl">
                    {labelText()}
                </span>
            </div>

            <div className="flex w-full flex-col gap-2">
                <div className="h-2 w-full overflow-hidden bg-title/10">
                    <div
                        className="h-full bg-text-2 transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, number))}%` }}
                    />
                </div>
            </div>

            <div className="flex w-full flex-col items-end gap-4 pt-1">
                <button
                    type="button"
                    onClick={() => setShowDepartments((v) => !v)}
                    aria-expanded={showDepartments}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-title transition-colors hover:border-text-2 hover:text-text-2"
                >
                    {showDepartments ? "Ocultar puntuación por departamento" : "Ver puntuación por departamento"}
                    <FaChevronDown
                        className={`text-xs transition-transform ${showDepartments ? "rotate-180" : ""}`}
                        aria-hidden="true"
                    />
                </button>

                {showDepartments && (
                    <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
                        {Object.entries(scoresDepartments).map(([key, value]) => (
                            <ScoreItem
                                key={key}
                                name={key}
                                number={value}
                                multiplier={multipliers[key] ?? 1.0}
                                isDefault={isDefault}
                                preferences={preferences}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export function ScoreItem({
    name,
    number,
    multiplier,
    isDefault,
    preferences
}: {
    name: string;
    number: DepartmentScore;
    multiplier: number;
    isDefault: boolean;
    preferences: Record<string, any>;
}) {
    const Icon = DEPARTMENT_ICONS[name] ?? FaLayerGroup;
    const itemPercentage = number.maxScore > 0 ? Math.round((number.score / number.maxScore) * 100) : 0;

    const priority = getDepartmentPriority(name, multiplier, preferences, isDefault);

    return (
        <details className={`group bg-bg-card p-5 text-title transition-colors hover:bg-white/30 ${name === "ine" ? "md:col-span-2" : ""}`}>
            <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                <div className="flex min-h-11 items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        <Icon className="shrink-0 text-lg text-title" />
                        <span className={`truncate text-base font-semibold text-title ${name === "ine" ? "uppercase" : "capitalize"}`}>
                            {name}
                        </span>
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
                        <span className="font-mono text-base font-bold text-color-2">{itemPercentage}/100</span>
                        <FaChevronDown className="text-xs text-title/45 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </div>
                </div>
                <div className="mt-3 h-1 w-full overflow-hidden bg-title/10">
                    <div className="h-full bg-text-2 transition-all duration-500" style={{ width: `${itemPercentage}%` }} />
                </div>
            </summary>

            <div className="mt-4 flex flex-col gap-2 pt-1">
                {number.noData ? (
                    <p className="text-xs italic text-black/50">Sin registros oficiales suficientes en el término municipal</p>
                ) : (
                    number.indicators.map((ind, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 bg-bg/60 px-3 py-2.5 text-[11px]">
                            <span className="min-w-0 truncate whitespace-nowrap font-medium text-black/80" title={ind.label}>{ind.label}</span>
                            <div className="flex shrink-0 items-center gap-2">
                                <span className="whitespace-nowrap font-mono text-[10px] text-black/60">{formatIndicatorValue(ind)}</span>
                                <span className={`whitespace-nowrap font-mono text-[10px] font-semibold ${ind.score > 0 ? "text-title/80" : "text-title/30"}`}>
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
