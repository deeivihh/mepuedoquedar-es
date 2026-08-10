export type PreferenceType = "boolean" | "range";
export interface BooleanPreference {
    id: string;
    type: "boolean";
    label: string;
    description: string;
    defaultValue: boolean;
    effects: {
        onTrue?: Record<string, number>;
        onFalse?: Record<string, number>;
    };
}
export interface RangePreference {
    id: string;
    type: "range";
    label: string;
    defaultValue: number;
    min: number;
    max: number;
    ranges: {
        maxAge: number;
        label: string;
        effects?: Record<string, number>;
    }[];
}

export type PreferenceConfig = BooleanPreference | RangePreference;
export const PREFERENCES_SCHEMA: PreferenceConfig[] = [
    {
        id: "hasCar",
        type: "boolean",
        label: "¿Tienes coche?",
        description: "Afecta a la importancia de servicios cercanos",
        defaultValue: true,
        effects: {
            onTrue: { sanidad: -0.3, empleo: 0.2, turismo: 0.1 },
            onFalse: { sanidad: 0.8, comercio: 0.6, sociedad: 0.5, empleo: 0.3 }
        }
    },
    {
        id: "hasSchoolChildren",
        type: "boolean",
        label: "¿Tienes hijos en edad escolar?",
        description: "Da más peso a educación y seguridad",
        defaultValue: false,
        effects: {
            onTrue: { educacion: 1.0, seguridad: 0.5, ocio: 0.3, sanidad: 0.2, empleo: -0.1 }
        }
    },
    {
        id: "lookingForWork",
        type: "boolean",
        label: "¿Estás buscando trabajo?",
        description: "Prioriza empleo y actividad económica",
        defaultValue: false,
        effects: {
            onTrue: { empleo: 0.9, economia: 0.5, educacion: 0.1 }
        }
    },
    {
        id: "age",
        type: "range",
        label: "¿Cuántos años tienes?",
        defaultValue: 35,
        min: 16,
        max: 90,
        ranges: [
            { maxAge: 30, label: "Joven", effects: { empleo: 0.7, ocio: 0.6, juventud: 0.8, deportes: 0.4, educacion: 0.3, sociedad: -0.2, sanidad: -0.2 } },
            { maxAge: 45, label: "Adulto/a joven", effects: { empleo: 0.4, economia: 0.3, ocio: 0.2, deportes: 0.2 } },
            { maxAge: 60, label: "Adulto/a", effects: { economia: 0.2, cultura: 0.2, sanidad: 0.1 } },
            { maxAge: 999, label: "Mayor", effects: { sanidad: 0.9, sociedad: 0.7, comercio: 0.4, empleo: -0.5, juventud: -0.4, ocio: 0.1, cultura: 0.3 } }
        ]
    }
];
