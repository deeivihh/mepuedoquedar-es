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
        description: "Ajusta la necesidad de servicios médicos y comercios cercanos",
        defaultValue: true,
        effects: {
            onTrue: { sanidad: -0.4, comercio: -0.4 },
            onFalse: { sanidad: 2.2, comercio: 2.0, sociedad: 1.0 }
        }
    },
    {
        id: "hasSchoolChildren",
        type: "boolean",
        label: "¿Tienes hijos?",
        description: "Prioriza colegios, seguridad y ocio familiar",
        defaultValue: false,
        effects: {
            onTrue: { educacion: 2.5, seguridad: 1.2, sanidad: 0.6, ocio: 0.8, juventud: 0.8 }
        }
    },
    {
        id: "lookingForWork",
        type: "boolean",
        label: "¿Estás buscando trabajo?",
        description: "Prioriza ofertas de empleo y actividad económica local",
        defaultValue: false,
        effects: {
            onTrue: { empleo: 2.5, economia: 1.5, comercio: 0.8 }
        }
    },
    {
        id: "remotework",
        type: "boolean",
        label: "¿Teletrabajas?",
        description: "Reduce el peso del empleo local y prioriza calidad de vida",
        defaultValue: false,
        effects: {
            onTrue: { empleo: -0.85, economia: -0.5, ocio: 0.8, cultura: 0.6 }
        }
    },
    {
        id: "isRetired",
        type: "boolean",
        label: "¿Estás jubilado/a?",
        description: "Prioriza sanidad, servicios sociales y tranquilidad",
        defaultValue: false,
        effects: {
            onTrue: { sanidad: 2.5, sociedad: 1.8, seguridad: 1.0, comercio: 1.0, empleo: -0.9, educacion: -0.8 }
        }
    },
    {
        id: "hasPet",
        type: "boolean",
        label: "¿Tienes mascota?",
        description: "Prioriza entorno natural y comercios de proximidad",
        defaultValue: false,
        effects: {
            onTrue: { comercio: 0.5, turismo: 0.8 }
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
            {
                maxAge: 30,
                label: "Joven",
                effects: { empleo: 1.2, juventud: 2.0, ocio: 1.5, deportes: 1.0, cultura: 0.6, sanidad: -0.4 }
            },
            {
                maxAge: 45,
                label: "Adulto/a joven",
                effects: { empleo: 0.8, economia: 0.6, ocio: 0.5, deportes: 0.5 }
            },
            {
                maxAge: 60,
                label: "Adulto/a",
                effects: { sanidad: 0.8, economia: 0.5, seguridad: 0.5, cultura: 0.5 }
            },
            {
                maxAge: 999,
                label: "Mayor",
                effects: { sanidad: 2.0, sociedad: 1.5, seguridad: 1.0, comercio: 0.8, empleo: -0.8, juventud: -0.8 }
            }
        ]
    }
];
