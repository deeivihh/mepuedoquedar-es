import Link from "next/link";
import { getGroups, MUNICIPALITIES_CONFIG } from "@/lib/datos/groups";
import weights from "@/lib/scores/weights.json";
import { TABLES } from "@/app/utils/getTables";
import { FaArrowLeft, FaExternalLinkAlt, FaChartLine, FaChartPie, FaChartBar } from "react-icons/fa";

function humanize(slug: string): string {
    return slug.replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function chartTypeLabel(type?: string): string {
    switch (type) {
        case "line": return "Línea temporal";
        case "pie": return "Gráfico circular";
        case "donut": return "Gráfico de anillo";
        case "column": return "Columnas";
        case "bar": return "Barras";
        case "area": return "Área";
        default: return "Gráfico estadístico";
    }
}

function ChartIcon({ type }: { type?: string }) {
    switch (type) {
        case "line":
        case "area":
            return <FaChartLine className="text-text-2 shrink-0" size={13} />;
        case "pie":
        case "donut":
            return <FaChartPie className="text-text-2 shrink-0" size={13} />;
        case "column":
        case "bar":
        default:
            return <FaChartBar className="text-text-2 shrink-0" size={13} />;
    }
}

function PortalLink({ id, children }: { id: string; children?: React.ReactNode }) {
    return (
        <a
            href={`https://analisis.datosabiertos.jcyl.es/explore/dataset/${id}/information/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-text-2 hover:underline transition-colors"
        >
            {children ?? humanize(id)} <FaExternalLinkAlt size={9} className="opacity-60" />
        </a>
    );
}

function IneTableLink({ tableId, children }: { tableId: string; children?: React.ReactNode }) {
    return (
        <a
            href={`https://www.ine.es/jaxiT3/Tabla.htm?t=${tableId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-text-2 hover:underline transition-colors font-mono"
        >
            {children ?? `Tabla ${tableId}`} <FaExternalLinkAlt size={9} className="opacity-60" />
        </a>
    );
}

export default function MetodologiaPage() {
    const groups = getGroups();
    const typedWeights = weights as Record<string, { weight: number }>;

    const allIds = new Set<string>();
    for (const g of groups) for (const ds of Object.values(g.datasets)) allIds.add(ds.id);
    const enriched = groups.map((g) => {
        const weight = typedWeights[g.group]?.weight ?? 0;
        const dsMap = new Map<string, string[]>();
        for (const ds of Object.values(g.datasets)) {
            if (!dsMap.has(ds.id)) dsMap.set(ds.id, []);
        }
        for (const [key, ind] of Object.entries(g.indicators)) {
            const ds = g.datasets[ind.dataset];
            if (ds) dsMap.get(ds.id)?.push(key);
        }
        return {
            name: g.group,
            label: humanize(g.group),
            weight,
            datasets: Array.from(dsMap.entries()).map(([id, indicators]) => ({ id, indicators })),
        };
    });

    return (
        <main className="flex justify-center min-h-screen w-full px-4 py-10 md:py-16">
            <article className="w-full max-w-3xl">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-title/50 hover:text-title transition-colors mb-8"
                >
                    <FaArrowLeft size={11} /> Volver
                </Link>
                <header className="mb-12 border-b-2 border-title/15 pb-4">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3">Metodología</h1>
                </header>
                <section className="mb-10">
                    <h2 className="title-font text-xl font-semibold text-title mb-3">1. Introducción</h2>
                    <p className="text-title/75 leading-relaxed mb-4">
                        <strong className="text-title">¿Me puedo quedar?</strong> es una herramienta que evalúa
                        la calidad de vida y el perfil socioeconómico de los municipios de Castilla y León.
                        Para ello combina datos abiertos de la Junta de Castilla y León en su portal{" "}
                        <a href="https://datosabiertos.jcyl.es" target="_blank" rel="noopener noreferrer" className="text-text-2 hover:underline font-medium">
                            datosabiertos.jcyl.es
                        </a>{" "}
                        junto a series estadísticas del{" "}
                        <a href="https://www.ine.es" target="_blank" rel="noopener noreferrer" className="text-text-2 hover:underline font-medium">
                            Instituto Nacional de Estadística (INE)
                        </a>.
                    </p>
                    <p className="text-title/75 leading-relaxed">
                        Los servicios y equipamientos se sincronizan automáticamente a través de la{" "}
                        <a href="https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/console" target="_blank" rel="noopener noreferrer" className="text-text-2 hover:underline font-medium">
                            API v2.1
                        </a>{" "}
                        del portal autonómico para alimentar el sistema de puntuación en {groups.length} categorías,
                        mientras que la API Tempus del INE provee las series históricas sociodemográficas y laborales representadas en las gráficas interactivas.
                    </p>
                </section>
                <section className="mb-10">
                    <h2 className="title-font text-xl font-semibold text-title mb-3">2. Sistema de puntuación</h2>
                    <p className="text-title/75 leading-relaxed mb-4">
                        Cada municipio recibe una puntuación global de <strong className="text-title">0 a 100</strong>.
                        Esta puntuación es la media ponderada de las categorías temáticas en las que el municipio
                        dispone de datos. Las categorías sin datos tienen un valor de 0 puntos, pero su peso en la media final se reduce en función de la población del municipio.
                    </p>
                    <p className="text-title/75 leading-relaxed mb-4">
                        Este <strong>factor de reducción de peso</strong> evita que municipios muy pequeños sean penalizados excesivamente por carecer de servicios
                        que solo existen en núcleos urbanos (como hospitales). Un municipio de menos de 100
                        habitantes solo sufre un 10% de penalización por las categorías que le faltan, mientras que a uno de
                        más de 5.000 habitantes se le aplica el 100% de la penalización (todo el peso original), resultando en puntuaciones realistas para ambos casos.
                    </p>
                    <p className="text-title/75 leading-relaxed mb-4">
                        Los indicadores de cada categoría se evalúan mediante tres tipos de funciones matemáticas para normalizar sus valores a una escala común de 0 a 100 puntos:
                    </p>
                    <div className="card rounded-xl border border-title/10 divide-y divide-title/10 text-sm mb-5">
                        <div className="px-5 py-4">
                            <h4 className="font-semibold text-title mb-2">Umbral</h4>
                            <p className="text-title/65 mb-2">Evalúa la existencia binaria de un servicio. Se otorgan los puntos máximos si el valor supera el mínimo exigido.</p>
                            <code className="block bg-title/5 p-3 rounded-lg text-title/80 font-mono text-xs">
                                Si (Valor ≥ Mínimo) → 100 puntos<br />
                                Si (Valor &lt; Mínimo) → 0 puntos
                            </code>
                        </div>
                        <div className="px-5 py-4">
                            <h4 className="font-semibold text-title mb-2">Escala Logarítmica</h4>
                            <p className="text-title/65 mb-2">Valora positivamente disponer de un servicio con rendimientos decrecientes: tener uno ya otorga una puntuación significativa, pero acumular más no multiplica los puntos proporcionalmente. Las bases están ajustadas para que incluso 1-2 servicios den puntuaciones relevantes.</p>
                            <code className="block bg-title/5 p-3 rounded-lg text-title/80 font-mono text-xs">
                                Puntuación = min( 100, ( log(Valor) / log(Objetivo) ) × 100 )
                            </code>
                        </div>
                        <div className="px-5 py-4">
                            <h4 className="font-semibold text-title mb-2">Interpolación Lineal</h4>
                            <p className="text-title/65 mb-2">Calcula una puntuación proporcional directa entre un valor mínimo (0 puntos) y un valor óptimo (100 puntos).</p>
                            <code className="block bg-title/5 p-3 rounded-lg text-title/80 font-mono text-xs">
                                Puntuación = min( 100, (Valor - Mín) / (Óptimo - Mín) × 100 )
                            </code>
                        </div>
                    </div>
                    <p className="text-title/75 leading-relaxed">
                        Finalmente, la puntuación global aplica los pesos base de la <em>Sección 3</em>, los cuales
                        pueden ser personalizados según el perfil del usuario (edad, situación laboral, hijos).
                    </p>
                </section>
                <section className="mb-10">
                    <h2 className="title-font text-xl font-semibold text-title mb-3">3. Pesos por categoría</h2>
                    <p className="text-title/75 leading-relaxed mb-5">
                        La siguiente tabla muestra el peso base de cada categoría en la puntuación global.
                        Estos valores se modifican en función de las preferencias del usuario.
                    </p>
                    <div className="card rounded-xl border border-title/10 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-title/15">
                                    <th className="text-left px-5 py-3 font-semibold text-title">Categoría</th>
                                    <th className="text-right px-5 py-3 font-semibold text-title">Peso</th>
                                    <th className="text-right px-5 py-3 font-semibold text-title">Datasets</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enriched
                                    .sort((a, b) => b.weight - a.weight)
                                    .map((g) => (
                                        <tr key={g.name} className="border-b border-title/5 last:border-0">
                                            <td className="px-5 py-2.5 text-title/80">{g.label}</td>
                                            <td className="px-5 py-2.5 text-right font-medium text-text-2">{g.weight}%</td>
                                            <td className="px-5 py-2.5 text-right text-title/50">{g.datasets.length}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </section>
                <section className="mb-10">
                    <h2 className="title-font text-xl font-semibold text-title mb-3">4. Dataset base</h2>
                    <p className="text-title/75 leading-relaxed mb-4">
                        El eje central del sistema es el{" "}
                        <PortalLink id={MUNICIPALITIES_CONFIG.id}>
                            registro de municipios de Castilla y León
                        </PortalLink>,
                        que proporciona el listado oficial de todos los municipios con su código INE,
                        nombre y provincia. Todos los demás datasets se cruzan contra este registro.
                    </p>
                    <div className="card rounded-xl border border-title/10 px-5 py-3 text-sm">
                        <div className="flex justify-between items-center">
                            <code className="text-title/50">{MUNICIPALITIES_CONFIG.id}</code>
                            <PortalLink id={MUNICIPALITIES_CONFIG.id}>Ver dataset</PortalLink>
                        </div>
                    </div>
                </section>
                <section className="mb-10">
                    <h2 className="title-font text-xl font-semibold text-title mb-3">5. Datasets de servicios (Junta de Castilla y León)</h2>
                    <p className="text-title/75 leading-relaxed mb-6">
                        A continuación se detalla, por cada categoría temática, los datasets del portal de datos
                        abiertos autonómico consultados y los indicadores cuantitativos derivados para calcular la afinidad.
                    </p>

                    <div className="flex flex-col gap-8">
                        {enriched.map((g) => (
                            <div key={g.name}>
                                <div className="flex items-baseline justify-between mb-3 border-b border-title/10 pb-2">
                                    <h3 className="title-font text-lg font-semibold text-title">{g.label}</h3>
                                    <span className="text-sm text-text-2 font-medium">{g.weight}%</span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {g.datasets.map((ds) => (
                                        <div key={ds.id} className="card rounded-xl border border-title/10 px-5 py-4">
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <p className="font-medium text-title text-sm leading-snug">
                                                    {humanize(ds.id)}
                                                </p>
                                                <PortalLink id={ds.id}>Ver</PortalLink>
                                            </div>
                                            <code className="text-xs text-title/40 block mb-2">{ds.id}</code>
                                            {ds.indicators.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {ds.indicators.map((ind) => (
                                                        <span
                                                            key={ind}
                                                            className="text-xs text-title/60 bg-title/5 px-2 py-0.5 rounded-md border border-title/8"
                                                        >
                                                            {humanize(ind)}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="mb-14">
                    <h2 className="title-font text-xl font-semibold text-title mb-3">6. Estadísticas sociodemográficas e históricas (INE)</h2>
                    <p className="text-title/75 leading-relaxed mb-4">
                        Para complementar la evaluación de servicios con el contexto real demográfico, laboral y educativo,
                        la aplicación consulta directamente las series estadísticas del <strong>Instituto Nacional de Estadística (INE)</strong> a través de su API pública Tempus.
                    </p>
                    <p className="text-title/75 leading-relaxed mb-6">
                        Cada municipio se vincula con su identificador interno del INE (<code className="text-xs bg-title/5 px-1.5 py-0.5 rounded font-mono text-title">cod_int</code>) a partir de la tabla maestra <IneTableLink tableId="29005" />. Las consultas se ejecutan en lote y se representan en el detalle del municipio mediante gráficas interactivas:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {TABLES.map((table) => (
                            <div key={`${table.table}-${table.title}`} className="card rounded-xl border border-title/10 p-5 flex flex-col justify-between gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <ChartIcon type={table.type} />
                                            <span className="text-xs font-semibold uppercase text-text-2 tracking-wider">
                                                {chartTypeLabel(table.type)}
                                            </span>
                                        </div>
                                        <IneTableLink tableId={table.table} />
                                    </div>
                                    <h3 className="title-font text-base font-semibold text-title">
                                        {table.title}
                                    </h3>
                                </div>
                                <div className="flex items-center justify-between text-xs text-title/60 pt-2 border-t border-title/10">
                                    <span>{table.nult && table.nult > 1 ? `Últimos ${table.nult} periodos` : "Último registro oficial"}</span>
                                    <span className="font-mono text-title/40">Tabla INE {table.table}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                <footer className="border-t-2 border-title/15 pt-8 pb-6 text-left">
                    <p className="text-xs text-title/50 leading-relaxed mb-1.5">
                        Este proyecto es independiente y no está afiliado ni vinculado con la Junta de Castilla y León ni con el Instituto Nacional de Estadística (INE). Los datos utilizados proceden de conjuntos de datos abiertos públicos puestos a disposición ciudadana en el marco de la normativa de transparencia y reutilización de la información pública.
                    </p>
                    <p className="text-xs text-title/40 leading-relaxed">
                        Este documento se genera automáticamente a partir de la configuración técnica del sistema.
                    </p>
                </footer>
            </article>
        </main>
    );
}
