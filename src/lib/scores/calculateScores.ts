import config from "./weights.json";
import { TABLES, getTableKey } from "@/lib/config/tables";

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

export function getGlobalLabel(score: number): string {
    if (score >= 80) return "¡Es sin duda tu lugar ideal!";
    if (score >= 65) return "Es un lugar muy recomendable";
    if (score >= 50) return "Podría ser una buena opción";
    if (score >= 35) return "Quizás no sea para ti";
    return "No parece tu lugar ideal";
}

const num = (v: unknown): number => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
};

const round = (v: number, d = 1) => {
    const m = 10 ** d;
    return Math.round(v * m) / m;
};

const resolve = (obj: any, path: string): unknown =>
    path.split(".").reduce((acc, part) => (acc != null && typeof acc === "object" ? acc[part] : undefined), obj);

function evalRule(rule: any, val: unknown, pop: number): Indicator {
    let n = num(val);
    const hasPerCapita = !!rule.per_capita;
    if (hasPerCapita) {
        n = pop > 0 ? (n / pop) * rule.per_capita.per : 0;
    }

    let score = 0;
    let max = rule.points ?? rule.max ?? 0;

    if (rule.type === "threshold") {
        score = n >= rule.min ? rule.points : 0;
    } else if (rule.type === "interpolated") {
        const anchors = (rule.points as { at: number; score: number }[]).toSorted((a, b) => a.at - b.at);
        max = Math.max(...anchors.map((p) => p.score), 0);
        if (!anchors.length || n <= anchors[0].at) {
            score = anchors[0]?.score ?? 0;
        } else if (n >= anchors.at(-1)!.at) {
            score = anchors.at(-1)!.score;
        } else {
            for (let i = 0; i < anchors.length - 1; i++) {
                if (n >= anchors[i].at && n <= anchors[i + 1].at) {
                    const t = (n - anchors[i].at) / (anchors[i + 1].at - anchors[i].at);
                    score = anchors[i].score + t * (anchors[i + 1].score - anchors[i].score);
                    break;
                }
            }
        }
    } else if (rule.type === "log_scale") {
        max = rule.max;
        score = n <= 0 ? 0 : Math.min(max, max * (Math.log(1 + n) / Math.log(1 + rule.base)));
    }

    return {
        label: rule.label,
        value: val ?? 0,
        score: Math.round(score),
        max: Math.round(max),
        ...(hasPerCapita ? { ratio: round(n, 3) } : {}),
    };
}

function missingWeightFactor(pop: number): number {
    const tiers = [[100, 0.1], [500, 0.4], [2000, 0.8], [5000, 1.0]];
    if (pop <= tiers[0][0]) return tiers[0][1];
    if (pop >= tiers.at(-1)![0]) return tiers.at(-1)![1];
    for (let i = 0; i < tiers.length - 1; i++) {
        if (pop <= tiers[i + 1][0]) {
            const t = (pop - tiers[i][0]) / (tiers[i + 1][0] - tiers[i][0]);
            return tiers[i][1] + t * (tiers[i + 1][1] - tiers[i][1]);
        }
    }
    return 1.0;
}

function getIneIndicators(ineData?: Record<string, any[]> | null): Indicator[] {
    if (!ineData) return [];
    const res: Indicator[] = [];

    const getSeries = (pred: (t: typeof TABLES[number]) => boolean) => {
        const cfg = TABLES.find(pred);
        return cfg && Array.isArray(ineData[getTableKey(cfg)]) ? ineData[getTableKey(cfg)] : null;
    };

    const addDiffTrend = (pred: (t: typeof TABLES[number]) => boolean, label: string, maxYears: number, scale: number) => {
        const data = getSeries(pred);
        if (!data || !data[0]?.Data || data[0].Data.length < 2) return;
        const series = data[0].Data;
        const vAct = num(series[0]?.Valor);
        const idx = Math.min(maxYears, series.length - 1);
        const vPrev = num(series[idx]?.Valor);
        if (vPrev > 0 && vAct > 0) {
            const diffPct = round(((vAct - vPrev) / vPrev) * 100, 1);
            res.push({
                label,
                value: `${diffPct >= 0 ? "+" : ""}${diffPct}% (${idx} años)`,
                score: diffPct > 0 ? Math.min(20, Math.max(0, Math.round((diffPct / scale) * 20))) : 0,
                max: 20,
            });
        }
    };

    addDiffTrend((t) => t.table === "29005", "Evolución demográfica", 5, 5);
    addDiffTrend((t) => t.table === "4721" && t.title === "Empresas activas", "Tendencia empresarial", 4, 10);

    const addRatioIndicator = (table: string, label: string, keywords: string[], scale: number, suffix: string) => {
        const data = getSeries((t) => t.table === table);
        if (!data?.length) return;
        let match = 0;
        let total = 0;
        for (const s of data) {
            const n = (s.Nombre || "").toLowerCase();
            const val = num(s.Data?.[0]?.Valor ?? s.Valor);
            total += val;
            if (keywords.some((k) => n.includes(k))) match += val;
        }
        if (total > 0) {
            const pct = round((match / total) * 100, 0);
            res.push({
                label,
                value: `${pct}% ${suffix}`,
                score: Math.min(20, Math.max(0, Math.round((pct / scale) * 20))),
                max: 20,
            });
        }
    };

    addRatioIndicator("69993", "Estabilidad laboral", ["fijo", "indefinido", "empresario"], 80, "fijos o autónomos");
    addRatioIndicator("66622", "Nivel de estudios", ["formación profesional", "grado", "licenciado", "doctorado", "diplomado"], 35, "FP o Universidad");

    return res;
}

export function calculateScores(
    municipio: Record<string, unknown>,
    weightMultipliers?: Record<string, number>,
    ineData?: Record<string, any[]> | null
): ScoreResult {
    const departments: Record<string, DepartmentScore> = {};
    const typedConfig = config as Record<string, { weight: number; rules: any[] }>;
    const pop = Math.max(0, num(municipio.poblacion));
    const datos = (municipio.datos ?? municipio) as Record<string, unknown>;

    let weightedSum = 0;
    let totalWeight = 0;
    const penalty = missingWeightFactor(pop);

    for (const [dept, deptCfg] of Object.entries(typedConfig)) {
        const deptData = (datos[dept] ?? {}) as Record<string, unknown>;
        const indicators = deptCfg.rules.map((rule) => evalRule(rule, resolve(deptData, rule.field), pop));
        const score = indicators.reduce((s, i) => s + i.score, 0);
        const maxScore = indicators.reduce((s, i) => s + i.max, 0);
        const hasData = indicators.some((i) => num(i.value) > 0);

        departments[dept] = { score, maxScore, indicators, ...(hasData ? {} : { noData: true }) };

        const baseWeight = deptCfg.weight * (weightMultipliers?.[dept] ?? 1.0);
        const finalWeight = hasData ? baseWeight : baseWeight * penalty;
        weightedSum += hasData && maxScore > 0 ? (score / maxScore) * finalWeight : 0;
        totalWeight += finalWeight;
    }

    const ineList = getIneIndicators(ineData);
    if (ineList.length > 0) {
        departments.ine = {
            score: ineList.reduce((s, i) => s + i.score, 0),
            maxScore: ineList.reduce((s, i) => s + i.max, 0),
            indicators: ineList,
        };
    }

    return {
        global: totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0,
        departments,
    };
}