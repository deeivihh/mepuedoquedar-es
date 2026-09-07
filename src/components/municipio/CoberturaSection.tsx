import Source from "./Source";
import { MdOutlineWifi, MdSignalCellularAlt, MdSpeed, MdSatelliteAlt } from "react-icons/md";
import type { CoberturaData } from "@/types";
import { FaStore } from "react-icons/fa";

export default function CoberturaSection({ data }: { data: any }) {
    const cobertura: CoberturaData | undefined = data.mas?.cobertura;
    if (!cobertura) return null;

    const esCompetitiva = cobertura.zona_cnmc === "competitiva";
    const teletrabajoScore = cobertura.ftth >= 90 ? "Excelente" : cobertura.ftth >= 80 ? "Muy bueno" : "Básico";
    const videollamadas = cobertura.ftth >= 85 ? "Óptimo (Múltiples HD/4K)" : "Adecuado (1-2 flujos)";
    const estabilidad = cobertura.ftth >= 80 ? "Alta (Fibra simétrica)" : "Media (Sujeta a cobertura)";

    return (
        <section id="conectividad" className="relative">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">Conectividad</h2>
                </div>
            </div>

            <div className="border border-title/20 bg-white/30">
                <div className="grid grid-cols-1 divide-y divide-title/15 md:grid-cols-3 md:divide-y-0 md:divide-x">
                    <div className="flex flex-col justify-between p-6 sm:p-8">
                        <div>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-title/55">
                                    Fibra óptica (FTTH)
                                </p>
                                <MdOutlineWifi className="text-xl text-text-2" aria-hidden="true" />
                            </div>
                            <div className="mt-4 flex items-baseline gap-1.5">
                                <span className="title-font text-5xl font-semibold leading-none text-title sm:text-6xl">
                                    {cobertura.ftth}%
                                </span>
                            </div>
                            <div className="mt-4 h-1.5 w-full overflow-hidden bg-title/10">
                                <div
                                    className="h-full bg-text-2 transition-all duration-500"
                                    style={{ width: `${cobertura.ftth}%` }}
                                />
                            </div>
                        </div>
                        <p className="mt-4 text-xs leading-relaxed text-title/60">
                            Población con cobertura de red fija de fibra simétrica para teletrabajo y uso intensivo.
                        </p>
                    </div>

                    <div className="flex flex-col justify-between p-6 sm:p-8">
                        <div>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-title/55">
                                    Velocidad y móvil
                                </p>
                                <MdSignalCellularAlt className="text-xl text-text-2" aria-hidden="true" />
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="title-font text-5xl font-semibold leading-none text-title sm:text-6xl">
                                    {cobertura.velocidad_max}
                                </span>
                            </div>
                        </div>
                        <p className="mt-4 text-xs leading-relaxed text-title/60">
                            Velocidad máxima disponible en el núcleo urbano y tecnología móvil predominante.
                        </p>
                    </div>

                    <div className="flex flex-col justify-between p-6 sm:p-8">
                        <div>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-title/55">
                                    Mercado y operadores
                                </p>
                                <FaStore className="text-xl text-text-2" aria-hidden="true" />
                            </div>
                            <h3 className="title-font mt-4 text-xl font-semibold text-title">
                                {esCompetitiva ? "Alta competencia" : "Acceso mayorista"}
                            </h3>
                        </div>
                        <p className="mt-4 text-xs leading-relaxed text-title/60">
                            {esCompetitiva
                                ? "Presencia de múltiples redes independientes (Digi, Movistar, Orange, Vodafone) con las tarifas más ventajosas."
                                : "Municipio regulado por la CNMC con servicio asegurado a través de la red mayorista NEBA."}
                        </p>
                    </div>
                </div>

                {cobertura.satelite_rural && (
                    <div className="border-t border-title/15 bg-white/20 px-6 py-3 sm:px-8">
                        <div className="flex items-center gap-2 text-xs text-title/70">
                            <span>
                                Dispone además de derecho a internet por satélite subvencionado a 200 Mbps (35 €/mes) mediante el programa estatal Conéctate35.
                            </span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 divide-y divide-title/15 border-t border-title/15 md:grid-cols-2 md:divide-y-0 md:divide-x">
                    <div className="flex flex-col divide-y divide-title/10 p-6 sm:p-8">
                        <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
                            <span className="text-title/65">Nivel de idoneidad</span>
                            <span className="font-semibold text-title">{teletrabajoScore}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
                            <span className="text-title/65">Videoconferencia simultánea</span>
                            <span className="font-semibold text-title">{videollamadas}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
                            <span className="text-title/65">Estabilidad de conexión</span>
                            <span className="font-semibold text-title">{estabilidad}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
                            <span className="text-title/65">Acceso móvil en exteriores</span>
                            <span className="font-semibold text-title">Tecnología {cobertura.red_movil}</span>
                        </div>
                    </div>

                    <div className="flex flex-col divide-y divide-title/10 p-6 sm:p-8">
                        <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
                            <span className="text-title/65">Tecnología de banda ancha</span>
                            <span className="font-semibold text-title">FTTH (Fibra hasta el hogar)</span>
                        </div>
                        <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
                            <span className="text-title/65">Hogares con cobertura FTTH</span>
                            <span className="font-semibold text-title">{cobertura.ftth}%</span>
                        </div>
                        <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
                            <span className="text-title/65">Velocidad máxima teórica</span>
                            <span className="font-semibold text-title">{cobertura.velocidad_max}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
                            <span className="text-title/65">Régimen regulatorio CNMC</span>
                            <span className="font-semibold text-title">
                                {esCompetitiva ? "Mercado desregulado" : "Obligación mayorista NEBA"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <Source href="https://data.cnmc.es/">
                Comisión Nacional de los Mercados y la Competencia
            </Source>
        </section>
    );
}
