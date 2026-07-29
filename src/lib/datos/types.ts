type Row = Record<string, unknown>;

export type Operation = "count" | "sum" | "average" | "exists";

export type DatasetConfig = { id: string; where?: string };

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
    filter?: (row: Row) => boolean;
    details?: boolean;
};

export type ProcessingConfig = {
    group: string;
    municipalities: { id: string; nameField: string; codeField: string };
    datasets: Record<string, DatasetConfig>;
    indicators: Record<string, IndicatorConfig>;
    includeEmpty?: boolean;
};