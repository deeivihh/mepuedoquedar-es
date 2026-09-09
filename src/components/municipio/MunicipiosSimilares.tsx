import Link from "next/link";
import { IoPeopleSharp } from "react-icons/io5";

export interface MunicipioSimilar {
    codigo: string;
    municipio: string;
    provincia: string;
    poblacion: number;
}

export default function MunicipiosSimilares({
    items,
    className = "",
}: {
    items?: MunicipioSimilar[];
    className?: string;
}) {
    if (!items || items.length === 0) return null;

    return (
        <div className={`bg-white/50 border border-title/30 shadow p-2 flex flex-col gap-1.5 ${className}`}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-title/60 px-1 py-0.5">
                Municipios similares
            </span>
            <div className="flex flex-col gap-1">
                {items.map((m) => (
                    <Link
                        key={m.codigo}
                        href={`/municipio/${m.codigo}`}
                        className="group flex flex-col py-1.5 px-2 rounded-xs transition-colors duration-150 hover:bg-white text-title/80 hover:text-title"
                    >
                        <span className="text-xs font-medium truncate group-hover:underline" title={m.municipio}>
                            {m.municipio}
                        </span>
                        <span className="text-[10px] text-title/50 flex items-center gap-1">
                            <IoPeopleSharp className="text-[10px] text-text-2" />
                            {m.poblacion > 0 ? `${m.poblacion.toLocaleString("es-ES")} hab.` : m.provincia}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
