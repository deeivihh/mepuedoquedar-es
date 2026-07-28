export function normalizarTexto(valor: unknown): string {
    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, " ");
}

export function normalizarNumero(valor: unknown): number {
    if (typeof valor === "number") {
        return valor;
    }

    if (typeof valor !== "string") {
        return 0;
    }

    const normalizado = valor
        .replace(/\./g, "")
        .replace(",", ".");

    const numero = Number(normalizado);

    return Number.isFinite(numero) ? numero : 0;
}