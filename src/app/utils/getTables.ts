import LineChart from "@/app/components/charts/LineChart";
import type { ComponentType } from "react";
import PieChart from "../components/charts/PieChart";

export interface TableConfig {
    table: string;
    nult?: number;
    title?: string;
    chart: ComponentType<any>;
    filter?: string | (string | string[])[] | number[] | ((series: any) => boolean);
}

export const TABLES: TableConfig[] = [
    { table: "29005", nult: 11, title: "Población total", chart: LineChart, filter: "Total." },
    { table: "68535", nult: 1, title: "Población por nacionalidad", chart: PieChart, filter: [["Total.", "Española", "Todas las edades"], ["Total.", "Extranjera", "Todas las edades"]] },
];
