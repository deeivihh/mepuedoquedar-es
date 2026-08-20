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
            ["Industrias extractivas"],
            ["Construcción. Empresas"],
            ["Comercio al por mayor"],
            ["Información y comunicaciones"],
            ["Actividades financieras"],
            ["Actividades inmobiliarias"],
            ["Actividades profesionales"],
            ["Secciones P y Q"],
            ["Secciones R y S"],
        ],
        formatName: (name) => {
            if (name.includes("Industrias extractivas")) return "Industria y energía";
            if (name.includes("Construcción. Empresas")) return "Construcción";
            if (name.includes("Comercio al por mayor")) return "Comercio, transporte y hostelería";
            if (name.includes("Información y comunicaciones")) return "Información y comunicaciones";
            if (name.includes("Actividades financieras")) return "Finanzas y seguros";
            if (name.includes("Actividades inmobiliarias")) return "Inmobiliarias";
            if (name.includes("Actividades profesionales")) return "Servicios profesionales y técnicos";
            if (name.includes("Secciones P y Q")) return "Educación y sanidad";
            if (name.includes("Secciones R y S")) return "Arte, ocio y otros servicios";
            return name;
        }
    },
    {
        table: "4721",
        nult: 11,
        title: "Empresas activas",
        type: "line",
        tv: ["393:23092"],
        filter: [
            ["Total de empresas", "Total CNAE"]
        ],
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
        formatName: (name) => {
            if (name.includes("Empresario con asalariados")) return "Empresarios con asalariados";
            if (name.includes("Empresario sin asalariados")) return "Autónomos / Sin asalariados";
            if (name.includes("fijo o indefinido")) return "Cuenta ajena (indefinido)";
            if (name.includes("cuenta ajena temporal")) return "Cuenta ajena (temporal)";
            return name;
        }
    },
    {
        table: "69991",
        nult: 1,
        title: "Ocupación profesional",
        type: "pie",
        tv: ["18:451"],
        filter: [
            ["Total.", "Directores y gerentes"],
            ["Total.", "científicos e intelectuales"],
            ["Total.", "profesionales de apoyo"],
            ["Total.", "Empleados contables"],
            ["Total.", "servicios de restauración"],
            ["Total.", "sector agrícola"],
            ["Total.", "Artesanos"],
            ["Total.", "Operadores de instalaciones"],
            ["Total.", "Ocupaciones elementales"],
        ],
        formatName: (name) => {
            if (name.includes("Directores y gerentes")) return "Directores y gerentes";
            if (name.includes("científicos e intelectuales")) return "Científicos e intelectuales";
            if (name.includes("profesionales de apoyo")) return "Técnicos y apoyo";
            if (name.includes("Empleados contables")) return "Administrativos y oficina";
            if (name.includes("servicios de restauración")) return "Servicios y comercio";
            if (name.includes("sector agrícola")) return "Agricultura y pesca";
            if (name.includes("Artesanos")) return "Industria y construcción";
            if (name.includes("Operadores de instalaciones")) return "Operadores de maquinaria";
            if (name.includes("Ocupaciones elementales")) return "Ocupaciones elementales";
            return name;
        }
    },
    {
        table: "66628",
        nult: 1,
        title: "Personas que cursan estudios",
        type: "donut",
        tv: [
            "18:451",
            "141:16420",
            "138:405113",
            "138:291031",
            "138:291038",
            "138:291126",
            "138:291050",
        ],
        filter: [
            ["Total. 15 y más años. Total.", "primaria e inferior"],
            ["Total. 15 y más años. Total.", "Primera etapa"],
            ["Total. 15 y más años. Total.", "orientación general"],
            ["Total. 15 y más años. Total.", "orientación profesional"],
            ["Total. 15 y más años. Total.", "Educación superior"],
        ],
        formatName: (name) => {
            if (name.includes("primaria e inferior")) return "Primaria e inferior";
            if (name.includes("Primera etapa")) return "Secundaria (ESO)";
            if (name.includes("orientación general")) return "Bachillerato";
            if (name.includes("orientación profesional")) return "Formación Profesional (FP)";
            if (name.includes("Educación superior")) return "Educación superior";
            return name;
        }
    },
    {
        table: "66622",
        nult: 1,
        title: "Nivel de estudios",
        type: "column",
        tv: [
            "18:451",
            "141:16420",
            "137:291085",
            "137:291086",
            "137:291106",
            "137:291110",
            "137:291115",
            "137:291123",
        ],
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
        formatName: (name) => {
            if (name.includes("Sin estudios")) return "Sin estudios";
            if (name.includes("Educación primaria")) return "Educación primaria";
            if (name.includes("Primera etapa")) return "Educación secundaria";
            if (name.includes("Enseñanzas de formación profesional, artes plásticas y diseño y deportivas de grado superior y equivalentes.")) return "Formación profesional";
            if (name.includes("Grados universitarios de hasta 240 créditos ECTS, diplomados universitarios y equivalentes.")) return "Diplomados y equivalentes";
            if (name.includes("Grados universitarios de más de 240 créditos ECTS, licenciados y equivalentes")) return "Licenciados y equivalentes";
            if (name.includes("Doctorado universitario")) return "Doctorado";
            return name;
        }
    },
];
