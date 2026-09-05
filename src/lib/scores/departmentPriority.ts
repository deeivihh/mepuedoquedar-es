import { Indicator } from "./calculateScores";
import { UserPreferences } from "./userPreferences";

export interface PriorityInfo {
    level: "high" | "low" | "normal";
    reason?: string;
}

export function getDepartmentPriority(
    category: string,
    multiplier: number,
    preferences: UserPreferences,
    isDefault: boolean
): PriorityInfo {
    if (isDefault) return { level: "normal" };

    if (multiplier >= 1.4) {
        let reason = "Mayor peso según tu perfil";
        if (category === "educacion" && preferences.hasSchoolChildren) reason = "Prioridad alta por tener hijos a cargo";
        else if (category === "sanidad" && preferences.isRetired) reason = "Prioridad alta por perfil sénior";
        else if (category === "sanidad" && preferences.hasCar === false) reason = "Mayor peso por no disponer de coche";
        else if (category === "comercio" && preferences.hasCar === false) reason = "Mayor peso en compras locales por no disponer de coche";
        else if (category === "empleo" && preferences.lookingForWork) reason = "Prioridad alta por búsqueda activa de empleo";
        else if (category === "seguridad" && preferences.hasSchoolChildren) reason = "Mayor importancia en seguridad por tener hijos";
        else if (category === "turismo" && preferences.hasPet) reason = "Mayor peso en entorno natural por mascota";
        else if ((category === "ocio" || category === "cultura") && preferences.remotework) reason = "Mayor peso para descanso y ocio";
        return { level: "high", reason };
    }

    if (multiplier <= 0.6) {
        let reason = "Menor peso según tu perfil";
        if (category === "empleo" && preferences.remotework) reason = "Peso reducido al teletrabajar";
        else if (category === "empleo" && preferences.isRetired) reason = "Sin impacto laboral por jubilación";
        else if (category === "educacion" && preferences.isRetired) reason = "Sin impacto escolar por jubilación";
        else if (category === "sanidad" && preferences.hasCar) reason = "Menor dependencia local por disponer de coche";
        else if (category === "comercio" && preferences.hasCar) reason = "Menor dependencia de comercio local por disponer de coche";
        return { level: "low", reason };
    }

    return { level: "normal" };
}

export function formatIndicatorValue(indicator: Indicator): string {
    const raw = indicator.value;
    if (typeof raw === "string" && isNaN(Number(raw))) return raw;
    const num = typeof raw === "number" ? raw : Number(raw);
    if (isNaN(num) || num === 0) return "0 registrados";
    if (num === 1) return "1 registrado";
    return `${num.toLocaleString("es-ES")} registrados`;
}
