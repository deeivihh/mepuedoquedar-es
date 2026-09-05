import { PREFERENCES_SCHEMA } from "./preferencesSchema";

export type UserPreferences = Record<string, any>;

export const DEFAULT_PREFERENCES: UserPreferences = PREFERENCES_SCHEMA.reduce(
    (acc, pref) => {
        acc[pref.id] = pref.defaultValue;
        return acc;
    },
    {} as UserPreferences
);

export function computeWeightMultipliers(prefs: UserPreferences): Record<string, number> {
    const mult: Record<string, number> = {
        sanidad: 1.0, educacion: 1.0, empleo: 1.0, seguridad: 1.0,
        economia: 1.0, comercio: 1.0, turismo: 1.0, cultura: 1.0,
        ocio: 1.0, juventud: 1.0, deportes: 1.0, sociedad: 1.0,
    };

    for (const cfg of PREFERENCES_SCHEMA) {
        const val = prefs[cfg.id];
        if (cfg.type === "boolean") {
            const effects = val ? cfg.effects.onTrue : cfg.effects.onFalse;
            if (effects) {
                for (const [k, v] of Object.entries(effects)) {
                    if (mult[k] !== undefined) mult[k] += v;
                }
            }
        } else if (cfg.type === "range") {
            const match = cfg.ranges.find((r) => (val as number) < r.maxAge);
            if (match?.effects) {
                for (const [k, v] of Object.entries(match.effects)) {
                    if (mult[k] !== undefined) mult[k] += v;
                }
            }
        }
    }

    for (const k of Object.keys(mult)) {
        mult[k] = Math.max(0.1, mult[k]);
    }

    return mult;
}
