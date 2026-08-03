type Row = Record<string, unknown>;

export type Operation = "count" | "sum" | "average" | "exists";

export type DatasetConfig = { id: string; where?: string; select?: string[] };

export type JoinConfig = {
    dataset: string;
    municipality: string;
    localKey: string;
    foreignKey: string;
};

export type IndicatorConfig = {
    dataset: string;
    municipality?: string;
    ineCode?: string;
    joinVia?: JoinConfig;
    operation: Operation;
    field?: string;
    fields?: string[];
    exclude?: string | string[] | ((row: Row) => boolean) | Record<string, unknown>;
    filter?: (row: Row) => boolean;
    details?: boolean;
    requires?: string;
    latestBy?: string;
    latestGroupBy?: string;
    dateField?: string;
};

export type GroupConfig = {
    group: string;
    datasets: Record<string, DatasetConfig>;
    indicators: Record<string, IndicatorConfig>;
};

export type ProcessingConfig = {
    municipalities: { id: string; nameField: string; codeField: string };
    groups: GroupConfig[];
    includeEmpty?: boolean;
};