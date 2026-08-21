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
} from "react-icons/fa";
import { IconType } from "react-icons";
import { MdLocalHospital, MdOutlineSportsMartialArts, MdOutlineTravelExplore, MdPublic } from "react-icons/md";
import { GiBowlingPin } from "react-icons/gi";
import { FaPeopleGroup, FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { useMemo } from "react";

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

    return (
        <div className="flex flex-col items-center justify-center gap-5 w-full h-full text-title">
            <div className="flex max-[73rem]:flex-col gap-4 w-full h-full justify-between items-start sm:items-end border-b border-title/20 pb-4">
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest text-black/50">
                        Afinidad con tu perfil
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-6xl max-md:text-5xl font-bold title-font text-title">
                            {number}
                        </span>
                        <span className="text-2xl text-color-2 font-semibold font-mono">
                            %
                        </span>
                    </div>
                </div>
                <span
                    className="text-4xl max-[51rem]:text-3xl max-md:text-center font-semibold text-title title-font"
                >
                    {labelText()}
                </span>
            </div>

            <div className="w-full flex flex-col gap-1.5">
                <div className="w-full h-3 bg-title/10 overflow-hidden border border-title/30 p-0.5">
                    <div
                        className="h-full bg-text-2 transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, number))}%` }}
                    />
                </div>
            </div>

            <div className="w-full pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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
        <div className="flex flex-col gap-2.5 p-4 bg-bg-card border border-title/30 text-title">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-title/20 pb-2">
                <div className="flex items-center gap-2">
                    <Icon className="text-title text-lg shrink-0" />
                    <span className="text-title text-base font-semibold capitalize">
                        {name}
                    </span>
                    {priority.level === "high" && (
                        <span
                            title={priority.reason ?? "Mayor peso en tu perfil"}
                            className="flex items-center text-color-2 cursor-help"
                        >
                            <FaArrowTrendUp size={13} />
                        </span>
                    )}
                    {priority.level === "low" && (
                        <span
                            title={priority.reason ?? "Menor peso en tu perfil"}
                            className="flex items-center text-black/40 cursor-help"
                        >
                            <FaArrowTrendDown size={13} />
                        </span>
                    )}
                </div>
                <div className="flex items-baseline gap-0.5">
                    <span className="text-base font-bold font-mono text-color-2">
                        {itemPercentage}
                    </span>
                    <span className="text-xs font-mono text-title/60 font-semibold">
                        %
                    </span>
                </div>
            </div>

            {number.noData ? (
                <p className="text-xs text-black/50 italic">
                    Sin registros oficiales suficientes en el término municipal
                </p>
            ) : (
                <div className="flex flex-col gap-1.5 pt-0.5">
                    {number.indicators.map((ind, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-1 border-b border-title/10 last:border-0"
                        >
                            <span className="text-black/80 font-medium">
                                {ind.label}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-black/60 font-mono text-[11px]">
                                    {formatIndicatorValue(ind)}
                                </span>
                                <span
                                    className={`text-[11px] border border-title/10 font-semibold font-mono px-1 py-0.5 ${ind.score > 0
                                        ? "bg-gray-500/10 text-title/80"
                                        : "bg-gray-500/20 text-title/30"
                                        }`}
                                >
                                    +{ind.score}/{ind.max}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
