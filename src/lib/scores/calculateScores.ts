import config from "./weights.json";
import { TABLES, getTableKey } from "@/lib/config/tables";

interface ThresholdRule {
    label: string;
    field: string;
    type: "threshold";
    min: number;
    points: number;
}

interface InterpolatedRule {
    label: string;
    field: string;
    type: "interpolated";
    points: { at: number; score: number }[];
    per_capita?: { per: number };
}

interface LogScaleRule {
    label: string;
    field: string;
    type: "log_scale";
    base: number;
    max: number;
    per_capita?: { per: number };
}

type Rule = ThresholdRule | InterpolatedRule | LogScaleRule;

interface DepartmentConfig {
    weight: number;
    rules: Rule[];
}

export interface Indicator {
    label: string;
    value: unknown;
    score: number;
    max: number;
    ratio?: number;
}

export interface DepartmentScore {
    score: number;
    maxScore: number;
    indicators: Indicator[];
    noData?: boolean;
}

export interface ScoreResult {
    global: number;
    departments: Record<string, DepartmentScore>;
}

type Evaluation = {
    score: number;
    max: number;
    ratio?: number;
};

type RuleEvaluator = (
    rule: Rule,
    value: unknown,
    poblacion: number
) => Evaluation;

const evaluators: Record<string, RuleEvaluator> = {
    threshold(rule, value) {
        const r = rule as ThresholdRule;
        const n = toNumber(value);

        return {
            score: n >= r.min ? r.points : 0,
            max: r.points
        };
    },

    interpolated(rule, value, poblacion) {
        const r = rule as InterpolatedRule;
        let n = toNumber(value);

        const anchors = [...r.points].sort((a, b) => a.at - b.at);
        const maxScore = Math.max(...anchors.map((p) => p.score));

        if (r.per_capita) {
            if (poblacion <= 0) {
                return { score: 0, max: maxScore, ratio: 0 };
            }
            n = (n / poblacion) * r.per_capita.per;
        }

        if (anchors.length === 0) {
            return { score: 0, max: 0 };
        }

        if (n <= anchors[0].at) {
            return {
                score: anchors[0].score,
                max: maxScore,
                ...(r.per_capita ? { ratio: round(n, 3) } : {})
            };
        }

        if (n >= anchors[anchors.length - 1].at) {
            return {
                score: anchors[anchors.length - 1].score,
                max: maxScore,
                ...(r.per_capita ? { ratio: round(n, 3) } : {})
            };
        }

        for (let i = 0; i < anchors.length - 1; i++) {
            if (n >= anchors[i].at && n <= anchors[i + 1].at) {
                const t =
                    (n - anchors[i].at) /
                    (anchors[i + 1].at - anchors[i].at);

                const score =
                    anchors[i].score +
                    t * (anchors[i + 1].score - anchors[i].score);

                return {
                    score,
                    max: maxScore,
                    ...(r.per_capita
                        ? { ratio: round(n, 3) }
                        : {})
                };
            }
        }

        return {
            score: 0,
            max: maxScore,
            ...(r.per_capita ? { ratio: round(n, 3) } : {})
        };
    },

    log_scale(rule, value, poblacion) {
        const r = rule as LogScaleRule;
        let n = toNumber(value);

        if (r.per_capita) {
            if (poblacion <= 0) {
                return { score: 0, max: r.max, ratio: 0 };
            }
            n = (n / poblacion) * r.per_capita.per;
        }

        if (n <= 0) {
            return {
                score: 0,
                max: r.max,
                ...(r.per_capita ? { ratio: 0 } : {})
            };
        }

        const score = Math.min(
            r.max,
            r.max * (Math.log(1 + n) / Math.log(1 + r.base))
        );

        return {
            score,
            max: r.max,
            ...(r.per_capita ? { ratio: round(n, 3) } : {})
        };
    }
};

function toNumber(value: unknown): number {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
}

function round(value: number, decimals: number): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
}

function resolve(
    object: Record<string, unknown>,
    path: string
): unknown {
    return path.split(".").reduce<unknown>((current, key) => {
        if (current !== null && typeof current === "object") {
            return (current as Record<string, unknown>)[key];
        }

        return undefined;
    }, object);
}

function evaluateRule(
    rule: Rule,
    departmentData: Record<string, unknown>,
    poblacion: number
): Indicator {
    const value = resolve(departmentData, rule.field);
    const evaluator = evaluators[rule.type];

    if (!evaluator) {
        return {
            label: rule.label,
            value: value ?? 0,
            score: 0,
            max: 0
        };
    }

    const result = evaluator(rule, value, poblacion);

    return {
        label: rule.label,
        value: value ?? 0,
        score: Math.round(result.score),
        max: Math.round(result.max),
        ...(result.ratio !== undefined
            ? { ratio: result.ratio }
            : {})
    };
}

function missingWeightFactor(poblacion: number): number {
    const tiers = [
        { pop: 100, factor: 0.1 },
        { pop: 500, factor: 0.4 },
        { pop: 2000, factor: 0.8 },
        { pop: 5000, factor: 1.0 },
    ];

    if (poblacion <= tiers[0].pop) return tiers[0].factor;
    if (poblacion >= tiers[tiers.length - 1].pop) return tiers[tiers.length - 1].factor;

    for (let i = 0; i < tiers.length - 1; i++) {
        if (poblacion <= tiers[i + 1].pop) {
            const t =
                (poblacion - tiers[i].pop) /
                (tiers[i + 1].pop - tiers[i].pop);
            return tiers[i].factor + t * (tiers[i + 1].factor - tiers[i].factor);
        }
    }
    return 1.0;
}

function getIneIndicators(ineData?: Record<string, any[]> | null): Indicator[] {
    if (!ineData) return [];
    const res: Indicator[] = [];

    const getSeries = (predicate: (t: typeof TABLES[number]) => boolean) => {
        const cfg = TABLES.find(predicate);
        if (!cfg) return null;
        const key = getTableKey(cfg);
        const data = ineData[key];
        return Array.isArray(data) && data.length > 0 ? data : null;
    };

    const popData = getSeries((t) => t.table === "29005");
    if (popData && popData[0]?.Data?.length >= 2) {
        const series = popData[0].Data;
        const vAct = toNumber(series[0]?.Valor);
        const idxPrev = Math.min(5, series.length - 1);
        const vPrev = toNumber(series[idxPrev]?.Valor);
        if (vPrev > 0 && vAct > 0) {
            const diffPct = round(((vAct - vPrev) / vPrev) * 100, 1);
            const sign = diffPct >= 0 ? "+" : "";
            const score = diffPct > 0 ? Math.min(20, Math.max(0, Math.round((diffPct / 5) * 20))) : 0;
            res.push({
                label: "Evolución demográfica",
                value: `${sign}${diffPct}% (${idxPrev} años)`,
                score,
                max: 20
            });
        }
    }

    const empData = getSeries((t) => t.table === "4721" && t.title === "Empresas activas");
    if (empData && empData[0]?.Data?.length >= 2) {
        const series = empData[0].Data;
        const vAct = toNumber(series[0]?.Valor);
        const idxPrev = Math.min(4, series.length - 1);
        const vPrev = toNumber(series[idxPrev]?.Valor);
        if (vPrev > 0 && vAct > 0) {
            const diffPct = round(((vAct - vPrev) / vPrev) * 100, 1);
            const sign = diffPct >= 0 ? "+" : "";
            const score = diffPct > 0 ? Math.min(20, Math.max(0, Math.round((diffPct / 10) * 20))) : 0;
            res.push({
                label: "Tendencia empresarial",
                value: `${sign}${diffPct}% (${idxPrev} años)`,
                score,
                max: 20
            });
        }
    }

    const labData = getSeries((t) => t.table === "69993");
    if (labData && labData.length > 0) {
        let fijos = 0;
        let total = 0;
        for (const s of labData) {
            const n = (s.Nombre || "").toLowerCase();
            const val = toNumber(s.Data?.[0]?.Valor ?? s.Valor);
            total += val;
            if (n.includes("fijo") || n.includes("indefinido") || n.includes("empresario")) {
                fijos += val;
            }
        }
        if (total > 0) {
            const pct = round((fijos / total) * 100, 0);
            const score = Math.min(20, Math.max(0, Math.round((pct / 80) * 20)));
            res.push({
                label: "Estabilidad laboral",
                value: `${pct}% fijos o autónomos`,
                score,
                max: 20
            });
        }
    }

    const eduData = getSeries((t) => t.table === "66622");
    if (eduData && eduData.length > 0) {
        let sup = 0;
        let total = 0;
        for (const s of eduData) {
            const n = (s.Nombre || "").toLowerCase();
            const val = toNumber(s.Data?.[0]?.Valor ?? s.Valor);
            total += val;
            if (n.includes("formación profesional") || n.includes("grado") || n.includes("licenciado") || n.includes("doctorado") || n.includes("diplomado")) {
                sup += val;
            }
        }
        if (total > 0) {
            const pct = round((sup / total) * 100, 0);
            const score = Math.min(20, Math.max(0, Math.round((pct / 35) * 20)));
            res.push({
                label: "Nivel de estudios",
                value: `${pct}% FP o Universidad`,
                score,
                max: 20
            });
        }
    }

    return res;
}

export function calculateScores(
    municipio: Record<string, unknown>,
    weightMultipliers?: Record<string, number>,
    ineData?: Record<string, any[]> | null
): ScoreResult {
    const departments: Record<string, DepartmentScore> = {};

    const typedConfig =
        config as unknown as Record<string, DepartmentConfig>;

    const poblacion = Math.max(0, toNumber(municipio.poblacion));

    const datos = (municipio.datos ?? municipio) as Record<
        string,
        unknown
    >;

    let weightedSum = 0;
    let totalWeight = 0;

    const penaltyFactor = missingWeightFactor(poblacion);

    for (const [departmentKey, departmentConfig] of Object.entries(
        typedConfig
    )) {
        const departmentData = (datos[departmentKey] ?? {}) as Record<
            string,
            unknown
        >;

        const indicators = departmentConfig.rules.map((rule) =>
            evaluateRule(rule, departmentData, poblacion)
        );

        const score = indicators.reduce(
            (sum, indicator) => sum + indicator.score,
            0
        );

        const maxScore = indicators.reduce(
            (sum, indicator) => sum + indicator.max,
            0
        );

        const hasData = indicators.some(
            (ind) => toNumber(ind.value) > 0
        );

        departments[departmentKey] = {
            score,
            maxScore,
            indicators,
            ...(hasData ? {} : { noData: true })
        };

        const baseWeight =
            departmentConfig.weight * (weightMultipliers?.[departmentKey] ?? 1.0);

        const finalWeight = hasData ? baseWeight : baseWeight * penaltyFactor;
        const normalized = hasData && maxScore > 0 ? score / maxScore : 0;

        weightedSum += normalized * finalWeight;
        totalWeight += finalWeight;
    }

    const ineList = getIneIndicators(ineData);
    if (ineList.length > 0) {
        const ineScore = ineList.reduce((sum, ind) => sum + ind.score, 0);
        const ineMax = ineList.reduce((sum, ind) => sum + ind.max, 0);
        departments.ine = {
            score: ineScore,
            maxScore: ineMax,
            indicators: ineList
        };
    }

    const global =
        totalWeight > 0
            ? Math.round((weightedSum / totalWeight) * 100)
            : 0;

    return {
        global,
        departments
    };
}