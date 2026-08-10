import { PREFERENCES_SCHEMA } from "./preferencesSchema";

export type UserPreferences = Record<string, any>;
export const DEFAULT_PREFERENCES: UserPreferences = PREFERENCES_SCHEMA.reduce(
    (acc, pref) => {
        acc[pref.id] = pref.defaultValue;
        return acc;
    },
    {} as UserPreferences
);

export function computeWeightMultipliers(
    prefs: UserPreferences
): Record<string, number> {
    const mult: Record<string, number> = {
        sanidad: 1.0,
        educacion: 1.0,
        empleo: 1.0,
        seguridad: 1.0,
        economia: 1.0,
        comercio: 1.0,
        turismo: 1.0,
        cultura: 1.0,
        ocio: 1.0,
        juventud: 1.0,
        deportes: 1.0,
        sociedad: 1.0,
    };

    for (const config of PREFERENCES_SCHEMA) {
        const value = prefs[config.id];

        if (config.type === "boolean") {
            const boolValue = value as boolean;
            const effects = boolValue ? config.effects.onTrue : config.effects.onFalse;

            if (effects) {
                for (const [category, change] of Object.entries(effects)) {
                    if (mult[category] !== undefined) {
                        mult[category] += change;
                    }
                }
            }
        } else if (config.type === "range") {
            const numValue = value as number;
            const rangeMatch = config.ranges.find(r => numValue < r.maxAge);

            if (rangeMatch && rangeMatch.effects) {
                for (const [category, change] of Object.entries(rangeMatch.effects)) {
                    if (mult[category] !== undefined) {
                        mult[category] += change;
                    }
                }
            }
        }
    }

    for (const key of Object.keys(mult)) {
        mult[key] = Math.max(0.1, mult[key]);
    }

    return mult;
}
