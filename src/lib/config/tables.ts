export type ChartType = "line" | "bar" | "area" | "pie" | "donut" | "column";

export interface TableConfig {
    table: string;
    nult?: number;
    title?: string;
    type?: ChartType;
    tv?: string | string[];
    filter?: string | (string | string[])[] | number[] | ((series: any) => boolean);
    formatName?: (name: string) => string;
}

export const CHART_PALETTE = [
    "#C46A4A", "#1F3A2E", "#6B7F4D", "#C28B38", "#3D6053", "#D48B6E",
    "#4E6E7E", "#944C36", "#8EA675", "#9E7B56", "#825366", "#284B3D"
];

const IGNORED_SEGMENTS = new Set(["dato base", "personas", "todas las edades"]);

export function formatSeriesName(name?: string): string {
    if (!name) return "";
    const parts = name.split(".").map((p) => p.trim()).filter(Boolean);
    if (parts.length <= 1) return name.trim();
    const segments = parts.slice(1).filter((p) => !IGNORED_SEGMENTS.has(p.toLowerCase()));
    if (!segments.length) return parts[1] || parts[0] || name;
    const nonTotal = segments.filter((p) => p.toLowerCase() !== "total");
    return (nonTotal.length ? nonTotal : segments).join(" - ");
}

export const getPeriod = (d: any) => String(d?.Anyo ?? d?.T3_Periodo ?? d?.Periodo ?? d?.Fecha ?? d?.period ?? "");

export function getTableKey(t: TableConfig): string {
    const tvStr = t.tv ? (Array.isArray(t.tv) ? t.tv.join("&") : t.tv) : "";
    return `${t.table}:${t.nult ?? 15}:${t.title || ""}:${tvStr}`;
}

export function filterData(data: any[], filter?: TableConfig["filter"]): any[] {
    if (!filter || !Array.isArray(data)) return data;
    if (typeof filter === "function") return data.filter(filter);
    if (typeof filter === "string") {
        const q = filter.toLowerCase();
        return data.filter((s: any) => s.Nombre?.toLowerCase().includes(q) || s.COD?.toLowerCase().includes(q));
    }
    if (Array.isArray(filter)) {
        if (typeof filter[0] === "number") return (filter as number[]).flatMap((i) => data[i] ? [data[i]] : []);
        return data.filter((s: any) => {
            const name = (s.Nombre || "").toLowerCase();
            const cod = (s.COD || "").toLowerCase();
            return (filter as any[]).some((f) =>
                Array.isArray(f)
                    ? f.every((w) => name.includes(String(w).toLowerCase()) || cod.includes(String(w).toLowerCase()))
                    : name.includes(String(f).toLowerCase()) || cod.includes(String(f).toLowerCase())
            );
        });
    }
    return data;
}

const matchFormat = (name: string, pairs: [string, string][]) => {
    for (const [pattern, label] of pairs) {
        if (name.includes(pattern)) return label;
    }
    return name;
};

export const TABLES: TableConfig[] = [
    { table: "29005", nult: 11, title: "Población total", type: "line", tv: ["18:451"], filter: "Total." },
    {
        table: "68535",
        nult: 1,
        title: "Población por nacionalidad",
        type: "pie",
        tv: ["356:15668", "141:21386", "141:274512"],
        filter: [
            ["Total.", "Española", "Todas las edades"],
            ["Total.", "Extranjera", "Todas las edades"],
        ],
    },
    {
        table: "4721",
        nult: 1,
        title: "Empresas por sector",
        type: "donut",
        filter: [
            ["Industrias extractivas"], ["Construcción. Empresas"], ["Comercio al por mayor"],
            ["Información y comunicaciones"], ["Actividades financieras"], ["Actividades inmobiliarias"],
            ["Actividades profesionales"], ["Secciones P y Q"], ["Secciones R y S"]
        ],
        formatName: (name) => matchFormat(name, [
            ["Industrias extractivas", "Industria y energía"],
            ["Construcción. Empresas", "Construcción"],
            ["Comercio al por mayor", "Comercio, transporte y hostelería"],
            ["Información y comunicaciones", "Información y comunicaciones"],
            ["Actividades financieras", "Finanzas y seguros"],
            ["Actividades inmobiliarias", "Inmobiliarias"],
            ["Actividades profesionales", "Servicios profesionales y técnicos"],
            ["Secciones P y Q", "Educación y sanidad"],
            ["Secciones R y S", "Arte, ocio y otros servicios"],
        ])
    },
    {
        table: "4721",
        nult: 11,
        title: "Empresas activas",
        type: "line",
        tv: ["393:23092"],
        filter: [["Total de empresas", "Total CNAE"]],
        formatName: () => "Total empresas"
    },
    {
        table: "69993",
        nult: 1,
        title: "Situación profesional",
        type: "column",
        tv: ["18:451"],
        filter: [
            ["Total.", "Empresario con asalariados"],
            ["Total.", "Empresario sin asalariados"],
            ["Total.", "cuenta ajena fijo"],
            ["Total.", "cuenta ajena temporal"],
        ],
        formatName: (name) => matchFormat(name, [
            ["Empresario con asalariados", "Empresarios con asalariados"],
            ["Empresario sin asalariados", "Autónomos / Sin asalariados"],
            ["fijo o indefinido", "Cuenta ajena (indefinido)"],
            ["cuenta ajena temporal", "Cuenta ajena (temporal)"],
        ])
    },
    {
        table: "69991",
        nult: 1,
        title: "Ocupación profesional",
        type: "pie",
        tv: ["18:451"],
        filter: [
            ["Total.", "Directores y gerentes"], ["Total.", "científicos e intelectuales"],
            ["Total.", "profesionales de apoyo"], ["Total.", "Empleados contables"],
            ["Total.", "servicios de restauración"], ["Total.", "sector agrícola"],
            ["Total.", "Artesanos"], ["Total.", "Operadores de instalaciones"],
            ["Total.", "Ocupaciones elementales"],
        ],
        formatName: (name) => matchFormat(name, [
            ["Directores y gerentes", "Directores y gerentes"],
            ["científicos e intelectuales", "Científicos e intelectuales"],
            ["profesionales de apoyo", "Técnicos y apoyo"],
            ["Empleados contables", "Administrativos y oficina"],
            ["servicios de restauración", "Servicios y comercio"],
            ["sector agrícola", "Agricultura y pesca"],
            ["Artesanos", "Industria y construcción"],
            ["Operadores de instalaciones", "Operadores de maquinaria"],
            ["Ocupaciones elementales", "Ocupaciones elementales"],
        ])
    },
    {
        table: "66628",
        nult: 1,
        title: "Personas que cursan estudios",
        type: "donut",
        tv: ["18:451", "141:16420", "138:405113", "138:291031", "138:291038", "138:291126", "138:291050"],
        filter: [
            ["Total. 15 y más años. Total.", "primaria e inferior"],
            ["Total. 15 y más años. Total.", "Primera etapa"],
            ["Total. 15 y más años. Total.", "orientación general"],
            ["Total. 15 y más años. Total.", "orientación profesional"],
            ["Total. 15 y más años. Total.", "Educación superior"],
        ],
        formatName: (name) => matchFormat(name, [
            ["primaria e inferior", "Primaria e inferior"],
            ["Primera etapa", "Secundaria (ESO)"],
            ["orientación general", "Bachillerato"],
            ["orientación profesional", "Formación Profesional (FP)"],
            ["Educación superior", "Educación superior"],
        ])
    },
    {
        table: "66622",
        nult: 1,
        title: "Nivel de estudios",
        type: "column",
        tv: ["18:451", "141:16420", "137:291085", "137:291086", "137:291106", "137:291110", "137:291115", "137:291123"],
        filter: [
            ["Total. 15 y más años. Total.", "Sin estudios"],
            ["Total. 15 y más años. Total.", "Educación primaria"],
            ["Total. 15 y más años. Total.", "Primera etapa"],
            ["Total. 15 y más años. Total.", "Enseñanzas de formación profesional, artes plásticas y diseño y deportivas de grado superior y equivalentes."],
            ["Total. 15 y más años. Total.", "rados universitarios de hasta 240 créditos ECTS, diplomados universitarios y equivalentes."],
            ["Total. 15 y más años. Total.", "Grados universitarios de más de 240 créditos ECTS, licenciados, arquitectos, ingenieros y equivalentes."],
            ["Total. 15 y más años. Total.", "Grados universitarios de más de 240 créditos ECTS, licenciados y equivalentes"],
            ["Total. 15 y más años. Total.", "Doctorado universitario"],
        ],
        formatName: (name) => matchFormat(name, [
            ["Sin estudios", "Sin estudios"],
            ["Educación primaria", "Educación primaria"],
            ["Primera etapa", "Educación secundaria"],
            ["Enseñanzas de formación profesional, artes plásticas y diseño y deportivas de grado superior y equivalentes.", "Formación profesional"],
            ["rados universitarios de hasta 240 créditos ECTS, diplomados universitarios y equivalentes.", "Diplomados y equivalentes"],
            ["Grados universitarios de más de 240 créditos ECTS, licenciados, arquitectos, ingenieros y equivalentes.", "Licenciados y equivalentes"],
            ["Grados universitarios de más de 240 créditos ECTS, licenciados y equivalentes", "Licenciados y equivalentes"],
            ["Doctorado universitario", "Doctorado"],
        ])
    },
];
