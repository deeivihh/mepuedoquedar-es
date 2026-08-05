import config from "./weights.json";

interface BooleanRule {
    label: string;
    field: string;
    type: "boolean";
    points: number;
}

interface LinearRule {
    label: string;
    field: string;
    type: "linear";
    multiplier: number;
    max: number;
}

interface RangeRule {
    label: string;
    field: string;
    type: "range";
    ranges: { min: number; max: number; points: number }[];
}

interface FixedRule {
    label: string;
    field: string;
    type: "fixed";
    values: Record<string, number>;
}

type Rule = BooleanRule | LinearRule | RangeRule | FixedRule;

interface DepartmentConfig {
    weight: number;
    rules: Rule[];
}

export interface Indicator {
    label: string;
    value: unknown;
    score: number;
    max: number;
}

export interface DepartmentScore {
    score: number;
    maxScore: number;
    indicators: Indicator[];
}

export interface ScoreResult {
    global: number;
    departments: Record<string, DepartmentScore>;
}

type RuleEvaluator = (rule: Rule, value: unknown) => { score: number; max: number };

const evaluators: Record<string, RuleEvaluator> = {
    boolean(rule, value) {
        const r = rule as BooleanRule;
        const num = toNumber(value);
        return {
            score: num > 0 ? r.points : 0,
            max: r.points,
        };
    },

    linear(rule, value) {
        const r = rule as LinearRule;
        const num = toNumber(value);
        return {
            score: Math.min(num * r.multiplier, r.max),
            max: r.max,
        };
    },

    range(rule, value) {
        const r = rule as RangeRule;
        const num = toNumber(value);
        const maxPoints = Math.max(...r.ranges.map((rng) => rng.points));
        const matched = r.ranges.find((rng) => num >= rng.min && num <= rng.max);
        return {
            score: matched ? matched.points : 0,
            max: maxPoints,
        };
    },

    fixed(rule, value) {
        const r = rule as FixedRule;
        const key = String(value ?? "");
        const maxPoints = Math.max(...Object.values(r.values), 0);
        return {
            score: r.values[key] ?? 0,
            max: maxPoints,
        };
    },
};

function toNumber(value: unknown): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
}
function resolve(obj: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce<unknown>((current, key) => {
        if (current !== null && typeof current === "object") {
            return (current as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
}
function evaluateRule(rule: Rule, departmentData: Record<string, unknown>): Indicator {
    const value = resolve(departmentData, rule.field);
    const evaluator = evaluators[rule.type];

    if (!evaluator) {
        return { label: rule.label, value, score: 0, max: 0 };
    }

    const { score, max } = evaluator(rule, value);

    return {
        label: rule.label,
        value: value ?? 0,
        score: Math.round(score),
        max: Math.round(max),
    };
}

export function calculateScores(municipio: Record<string, unknown>): ScoreResult {
    const departments: Record<string, DepartmentScore> = {};
    const typedConfig = config as Record<string, DepartmentConfig>;

    let weightedSum = 0;
    let totalWeight = 0;

    for (const [departmentKey, departmentConfig] of Object.entries(typedConfig)) {
        const departmentData = (municipio[departmentKey] ?? {}) as Record<string, unknown>;

        const indicators = departmentConfig.rules.map((rule) =>
            evaluateRule(rule, departmentData)
        );

        const score = indicators.reduce((sum, ind) => sum + ind.score, 0);
        const maxScore = indicators.reduce((sum, ind) => sum + ind.max, 0);

        departments[departmentKey] = { score, maxScore, indicators };

        const normalised = maxScore > 0 ? score / maxScore : 0;
        weightedSum += normalised * departmentConfig.weight;
        totalWeight += departmentConfig.weight;
    }

    const global = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;

    return { global, departments };
}
