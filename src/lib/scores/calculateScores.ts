import config from "./weights.json";

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

export function calculateScores(
    municipio: Record<string, unknown>,
    weightMultipliers?: Record<string, number>
): ScoreResult {
    const departments: Record<string, DepartmentScore> = {};

    const typedConfig =
        config as unknown as Record<string, DepartmentConfig>;

    const poblacion = toNumber(municipio.poblacion);

    const datos = (municipio.datos ?? municipio) as Record<
        string,
        unknown
    >;

    let weightedSum = 0;
    let totalWeight = 0;

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

        const normalized =
            maxScore > 0 ? score / maxScore : 0;

        const effectiveWeight =
            departmentConfig.weight * (weightMultipliers?.[departmentKey] ?? 1.0);

        weightedSum += normalized * effectiveWeight;
        totalWeight += effectiveWeight;
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