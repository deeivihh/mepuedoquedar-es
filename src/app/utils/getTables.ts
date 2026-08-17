export type ChartType = "line" | "bar" | "area" | "pie" | "donut";

export interface TableConfig {
    table: string;
    nult?: number;
    title?: string;
    type?: ChartType;
    filter?: string | (string | string[])[] | number[] | ((series: any) => boolean);
}

export const TABLES: TableConfig[] = [
    { table: "29005", nult: 11, title: "Población total", type: "line", filter: "Total." },
    {
        table: "68535",
        nult: 1,
        title: "Población por nacionalidad",
        type: "pie",
        filter: [
            ["Total.", "Española", "Todas las edades"],
            ["Total.", "Extranjera", "Todas las edades"],
        ],
    },
];
