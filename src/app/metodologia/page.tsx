import Link from "next/link";
import { getGroups, MUNICIPALITIES_CONFIG } from "@/lib/datos/groups";
import weights from "@/lib/scores/weights.json";
import {
    FaArrowLeft,
    FaExternalLinkAlt,
    FaChartLine,
    FaBalanceScale,
    FaCalculator,
} from "react-icons/fa";

function humanize(slug: string): string {
    return slug.replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

const INE_GROUPS = [
    {
        name: "demografia",
        label: "Demografía y Población",
        tables: [
            { id: "29005", label: "Población total y evolución histórica" },
            { id: "68535", label: "Población por nacionalidad" },
        ],
    },
    {
        name: "empresas",
        label: "Tejido Empresarial",
        tables: [
            { id: "4721", label: "Empresas activas y evolución anual" },
            { id: "4721", label: "Distribución de empresas por sector" },
        ],
    },
    {
        name: "empleo",
        label: "Mercado Laboral",
        tables: [
            { id: "69993", label: "Situación profesional y contratos laborales" },
            { id: "69991", label: "Distribución por ocupación profesional" },
        ],
    },
    {
        name: "educacion",
        label: "Educación y Formación",
        tables: [
            { id: "66622", label: "Nivel de estudios alcanzado" },
            { id: "66628", label: "Personas que cursan estudios" },
        ],
    },
];

function PortalLink({ id, children, className }: { id: string; children?: React.ReactNode; className?: string }) {
    return (
        <a
            href={`https://analisis.datosabiertos.jcyl.es/explore/dataset/${id}/information/`}
            target="_blank"
            rel="noopener noreferrer"
            className={className ?? "inline-flex items-center gap-1 text-text-2 hover:underline transition-colors"}
        >
            {children ?? humanize(id)} <FaExternalLinkAlt size={9} className="opacity-60" />
        </a>
    );
}

function IneTableLink({ tableId, children, className }: { tableId: string; children?: React.ReactNode; className?: string }) {
    return (
        <a
            href={`https://www.ine.es/jaxiT3/Tabla.htm?t=${tableId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={className ?? "inline-flex items-center gap-1 text-text-2 hover:underline transition-colors font-mono"}
        >
            {children ?? `Tabla ${tableId}`} <FaExternalLinkAlt size={9} className="opacity-60" />
        </a>
    );
}

export default function MetodologiaPage() {
    const groups = getGroups();
    const typedWeights = weights as Record<string, { weight: number }>;

    const enriched = groups.map((g) => {
        const weight = typedWeights[g.group]?.weight ?? 0;
        const uniqueIds = Array.from(new Set(Object.values(g.datasets).map((ds) => ds.id)));
        return {
            name: g.group,
            label: humanize(g.group),
            weight,
            datasets: uniqueIds.map((id) => ({ id })),
        };
    });

    return (
        <main className="flex justify-center min-h-screen w-full p-6 py-10 md:py-16">
            <article className="w-full max-w-3xl flex flex-col gap-10">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-title/60 hover:text-title transition-colors font-medium w-fit"
                >
                    <FaArrowLeft size={11} /> Volver
                </Link>

                <header className="border-b-2 border-title/20 pb-6 flex flex-col gap-2">
                    <h1 className="text-4xl md:text-5xl font-bold title-font text-title">Metodología</h1>
                </header>

                <section className="flex flex-col gap-4">
                    <h2 className="title-font text-2xl md:text-3xl font-bold text-title flex items-center gap-2.5">
                        <span className="text-text-2 font-mono text-lg md:text-xl font-bold">1.</span> Introducción
                    </h2>
                    <p className="text-black/80 text-sm md:text-base leading-relaxed">
                        <strong className="text-title font-semibold">¿Me puedo quedar?</strong> es una plataforma de análisis territorial abierta e independiente concebida para evaluar de forma integral la calidad de vida, los servicios públicos y la vitalidad socioeconómica de los <strong>2.248 municipios de Castilla y León</strong>.
                    </p>
                    <p className="text-black/80 text-sm md:text-base leading-relaxed">
                        El proyecto nace para dar respuesta a la <strong>dispersión de la información</strong> y al <strong>reto demográfico</strong> en la comunidad. Aunque existen abundantes datos sobre servicios, sanidad, colegios, empleo y demografía, estos se encuentran repartidos en diferentes catálogos técnicos. La plataforma centraliza y normaliza estos registros en un indicador comprensible de <strong>0 a 100%</strong>, permitiendo evaluar y comparar cualquier localidad bajo criterios objetivos para facilitar decisiones residenciales y profesionales fundamentadas.
                    </p>
                    <p className="text-black/80 text-sm md:text-base leading-relaxed">
                        Con ello se promueve la <strong>reutilización de los datos públicos</strong> de la Junta de Castilla y León y del Instituto Nacional de Estadística, fomentando la transparencia administrativa y apoyando la vertebración territorial al visibilizar las fortalezas y oportunidades reales del medio rural.
                    </p>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="title-font text-2xl md:text-3xl font-bold text-title flex items-center gap-2.5">
                        <span className="text-text-2 font-mono text-lg md:text-xl font-bold">2.</span> Sistema de puntuación
                    </h2>
                    <p className="text-black/80 text-sm leading-relaxed">
                        El sistema calcula la puntuación final combinando los servicios locales con las estadísticas de cada municipio de forma directa y comprensible:
                    </p>

                    <div className="bg-bg-card border border-title/30 divide-y divide-title/20 text-sm">
                        <div className="p-5 flex flex-col gap-3">
                            <h3 className="font-semibold text-title text-base flex items-center gap-2">
                                <FaCalculator className="text-text-2" size={15} />
                                A. Normalización de indicadores
                            </h3>
                            <p className="text-black/70 text-xs md:text-sm leading-relaxed">
                                Los diferentes servicios se convierten a una escala común de 0 a 100 puntos mediante tres funciones:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                                <div className="bg-bg-card border border-title/20 p-3.5 flex flex-col justify-between gap-2">
                                    <div>
                                        <strong className="block text-title text-xs uppercase tracking-wider mb-1 font-semibold">Umbral</strong>
                                        <p className="text-xs text-black/65">Comprueba si existe o no un servicio básico.</p>
                                    </div>
                                    <code className="block text-[11px] font-mono text-title bg-title/5 p-1.5 border border-title/15">Valor ≥ Mín ? 100 : 0</code>
                                </div>
                                <div className="bg-bg-card border border-title/20 p-3.5 flex flex-col justify-between gap-2">
                                    <div>
                                        <strong className="block text-title text-xs uppercase tracking-wider mb-1 font-semibold">Logarítmica</strong>
                                        <p className="text-xs text-black/65">Premia disponer del primer servicio sin sobredimensionar.</p>
                                    </div>
                                    <code className="block text-[11px] font-mono text-title bg-title/5 p-1.5 border border-title/15">min(100, ln(V)/ln(O) × 100)</code>
                                </div>
                                <div className="bg-bg-card border border-title/20 p-3.5 flex flex-col justify-between gap-2">
                                    <div>
                                        <strong className="block text-title text-xs uppercase tracking-wider mb-1 font-semibold">Interpolación</strong>
                                        <p className="text-xs text-black/65">Puntuación proporcional entre un mínimo y un óptimo.</p>
                                    </div>
                                    <code className="block text-[11px] font-mono text-title bg-title/5 p-1.5 border border-title/15">min(100, (V-Min)/(Opt-Min) × 100)</code>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 flex flex-col gap-3">
                            <h3 className="font-semibold text-title text-base flex items-center gap-2">
                                <FaBalanceScale className="text-text-2" size={15} />
                                B. Factor de corrección por población
                            </h3>
                            <p className="text-black/70 text-xs md:text-sm leading-relaxed">
                                Para evitar que los pueblos pequeños sean penalizados por no disponer de servicios propios de grandes ciudades (como hospitales), el peso de las categorías ausentes se ajusta según los habitantes del municipio:
                            </p>
                            <code className="block bg-title/5 p-3 text-title font-mono text-xs border border-title/15">
                                Factor_penalización(Población) = 0.10 + 0.90 × min( 1.0, Población / 5.000 )
                            </code>
                            <p className="text-xs text-black/55">
                                Un pueblo de menos de 100 habitantes solo asume un 10% de penalización por servicios que no tiene, mientras que una ciudad de más de 5.000 habitantes asume el 100%.
                            </p>
                        </div>

                        <div className="p-5 flex flex-col gap-3">
                            <h3 className="font-semibold text-title text-base flex items-center gap-2">
                                <FaChartLine className="text-text-2" size={15} />
                                C. Indicadores del INE en tiempo real
                            </h3>
                            <p className="text-black/70 text-xs md:text-sm leading-relaxed">
                                En esta sección se evalúan cuatro aspectos clave:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                                <div className="bg-bg-card border border-title/20 p-3.5 flex flex-col justify-between gap-2">
                                    <div>
                                        <strong className="block text-title mb-1 text-xs font-semibold">Evolución demográfica</strong>
                                        <p className="text-black/65">Premia ganar población; perder habitantes da 0 puntos.</p>
                                    </div>
                                    <code className="block text-[11px] font-mono text-title bg-title/5 p-1.5 border border-title/15">Crecimiento &gt; 0% ? min(20, (Var/5%) × 20) : 0</code>
                                </div>
                                <div className="bg-bg-card border border-title/20 p-3.5 flex flex-col justify-between gap-2">
                                    <div>
                                        <strong className="block text-title mb-1 text-xs font-semibold">Tendencia empresarial</strong>
                                        <p className="text-black/65">Premia la creación de empresas; perder negocios da 0 puntos.</p>
                                    </div>
                                    <code className="block text-[11px] font-mono text-title bg-title/5 p-1.5 border border-title/15">Crecimiento &gt; 0% ? min(20, (Var/10%) × 20) : 0</code>
                                </div>
                                <div className="bg-bg-card border border-title/20 p-3.5 flex flex-col justify-between gap-2">
                                    <div>
                                        <strong className="block text-title mb-1 text-xs font-semibold">Estabilidad laboral</strong>
                                        <p className="text-black/65">Porcentaje de trabajadores fijos o autónomos.</p>
                                    </div>
                                    <code className="block text-[11px] font-mono text-title bg-title/5 p-1.5 border border-title/15">min(20, (% Fijos / 80%) × 20)</code>
                                </div>
                                <div className="bg-bg-card border border-title/20 p-3.5 flex flex-col justify-between gap-2">
                                    <div>
                                        <strong className="block text-title mb-1 text-xs font-semibold">Nivel de estudios</strong>
                                        <p className="text-black/65">Porcentaje de habitantes con estudios superiores.</p>
                                    </div>
                                    <code className="block text-[11px] font-mono text-title bg-title/5 p-1.5 border border-title/15">min(20, (% Sup / 35%) × 20)</code>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 flex flex-col gap-2">
                            <h3 className="font-semibold text-title text-base">D. Puntuación global</h3>
                            <p className="text-black/70 text-xs md:text-sm leading-relaxed">
                                La puntuación final combina la media ponderada de todas las categorías adaptada a las preferencias del usuario:
                            </p>
                            <code className="block bg-title/5 p-3 text-title font-mono text-xs border border-title/15">
                                Puntuación_Global = [ Σ ( (Score_k / MaxScore_k) × Peso_k × Factor_k ) / Σ ( Peso_k × Factor_k ) ] × 100
                            </code>
                        </div>
                    </div>
                </section>

                <section className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="title-font text-2xl md:text-3xl font-bold text-title flex items-center gap-2.5">
                            <span className="text-text-2 font-mono text-lg md:text-xl font-bold">3.</span> Datasets utilizados
                        </h2>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2.5 border-b border-title/20 pb-2">
                                <img
                                    src="/logos/jcyl.svg"
                                    alt="Junta de Castilla y León"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 object-contain shrink-0"
                                />
                                <h3 className="title-font text-lg font-bold text-title">
                                    Datos Abiertos de Castilla y León
                                </h3>
                            </div>
                            <p className="text-black/70 text-xs md:text-sm leading-relaxed">
                                Datos estructurados consumidos vía API v2.1 sobre servicios públicos, infraestructuras y patrimonio clasificados en 12 categorías temáticas:
                            </p>

                            <div className="bg-bg-card border border-title/30 p-3.5 flex items-center justify-between gap-3">
                                <div>
                                    <strong className="block text-title text-sm mb-0.5">Dataset Maestro: Registro de Municipios de CyL</strong>
                                    <span className="text-xs text-black/50">Catálogo oficial de municipios y códigos territoriales</span>
                                </div>
                                <PortalLink id={MUNICIPALITIES_CONFIG.id} className="text-xs text-text-2 hover:underline font-semibold inline-flex items-center gap-1 shrink-0">
                                    Ver registro
                                </PortalLink>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {enriched.map((g) => (
                                    <div key={g.name} className="bg-bg-card border border-title/30 p-3.5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-title/20">
                                                <h4 className="title-font text-sm font-semibold text-title">{g.label}</h4>
                                                <span className="text-xs font-mono font-semibold text-text-2 shrink-0">
                                                    Peso: {g.weight}%
                                                </span>
                                            </div>

                                            <ul className="flex flex-col divide-y divide-title/10">
                                                {g.datasets.map((ds) => (
                                                    <li key={ds.id} className="flex items-center justify-between gap-2 py-1.5 text-xs">
                                                        <span className="text-black/80 font-medium leading-snug">
                                                            {humanize(ds.id)}
                                                        </span>
                                                        <PortalLink
                                                            id={ds.id}
                                                            className="shrink-0 text-[11px] text-text-2 hover:underline inline-flex items-center gap-1 font-semibold"
                                                        >
                                                            Ver
                                                        </PortalLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2.5 border-b border-title/20 pb-2">
                                <img
                                    src="/logos/ine.svg"
                                    alt="Instituto Nacional de Estadística"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 object-contain shrink-0"
                                />
                                <h3 className="title-font text-lg font-bold text-title">
                                    B. Instituto Nacional de Estadística
                                </h3>
                            </div>
                            <p className="text-black/70 text-xs md:text-sm leading-relaxed">
                                Tablas estadísticas y censales consultadas directamente para generar series históricas, indicadores y puntuaciones en tiempo real:
                            </p>

                            <div className="bg-bg-card border border-title/30 p-3.5 flex items-center justify-between gap-3">
                                <div>
                                    <strong className="block text-title text-sm mb-0.5">Tabla Maestra: Padrón Municipal de Habitantes</strong>
                                    <span className="text-xs text-black/50">Relación oficial de municipios, códigos territoriales y población (Tabla 29005)</span>
                                </div>
                                <IneTableLink tableId="29005" className="text-xs text-text-2 hover:underline font-semibold inline-flex items-center gap-1 shrink-0">
                                    Ver tabla
                                </IneTableLink>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {INE_GROUPS.map((g) => (
                                    <div key={g.name} className="bg-bg-card border border-title/30 p-3.5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-title/20">
                                                <h4 className="title-font text-sm font-semibold text-title">{g.label}</h4>
                                                <span className="text-xs font-mono font-semibold text-text-2 shrink-0">
                                                    {g.tables.length} {g.tables.length === 1 ? "tabla" : "tablas"}
                                                </span>
                                            </div>

                                            <ul className="flex flex-col divide-y divide-title/10">
                                                {g.tables.map((t, idx) => (
                                                    <li key={`${t.id}-${idx}`} className="flex items-center justify-between gap-2 py-1.5 text-xs">
                                                        <span className="text-black/80 font-medium leading-snug">
                                                            {t.label}
                                                        </span>
                                                        <IneTableLink
                                                            tableId={t.id}
                                                            className="shrink-0 text-[11px] text-text-2 hover:underline inline-flex items-center gap-1 font-semibold"
                                                        >
                                                            Ver
                                                        </IneTableLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="border-t-2 border-title/20 pt-6 pb-4 text-left flex flex-col gap-2">
                    <p className="text-xs text-black/60 leading-relaxed">
                        Este proyecto es independiente y no está vinculado formalmente con la Junta de Castilla y León ni con el Instituto Nacional de Estadística. Los datos utilizados proceden de conjuntos de datos abiertos públicos conforme a la Ley 37/2007 sobre reutilización de la información del sector público.
                    </p>
                    <p className="text-xs text-black/60 leading-relaxed">
                        Las puntuaciones e indicadores son modelos orientativos de análisis ciudadano y no constituyen una recomendación o asesoramiento vinculante.
                    </p>
                    <p className="text-xs text-black/60 leading-relaxed">
                        <strong>¿Me puedo quedar?</strong> es un proyecto de codigo abierto donde cualquiera puede aportar sugerencias y contribuir a través de <a href="https://github.com/deeivihh/mepuedoquedar" target="_blank" rel="noopener noreferrer" className="text-text-2 hover:underline font-medium">GitHub</a>.
                    </p>
                    <p className="text-[11px] text-black/40 leading-relaxed pt-1">
                        Este documento se genera automáticamente a partir de la configuración técnica del sistema.
                    </p>
                </footer>
            </article>
        </main>
    );
}
