export type MasSourceResult = Record<string, Record<string, any>>;

export interface MasSource {
    name: string;
    run: () => Promise<MasSourceResult>;
}
