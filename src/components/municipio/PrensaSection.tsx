import { MdArrowOutward } from "react-icons/md";

export default function PrensaSection({ data }: { data: any }) {
    if (!data.mas?.medios?.length) return null;
    return (
        <section className="py-14 sm:py-12">
            <div className="mb-8">
                <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">Prensa local</h2>
            </div>
            <div className="grid grid-cols-1 gap-px border-y border-title/20 bg-title/20 md:grid-cols-2">
                {data.mas.medios.map((medio: { nombre: string; directorio_superior: string | null; paginas_de_internet: string | null }, i: number) => (
                    <div key={medio.nombre} className={`flex flex-col gap-1.5 bg-bg-card p-5 transition-colors hover:bg-white/40 ${data.mas.medios.length % 2 === 1 && i === data.mas.medios.length - 1 ? "md:col-span-2" : ""}`}>
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="title-font text-lg font-semibold leading-snug text-title">{medio.nombre}</h3>
                            {medio.paginas_de_internet && (
                                <a
                                    href={medio.paginas_de_internet}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={`Abrir ${medio.nombre}`}
                                    className="shrink-0 text-title/40 transition-colors hover:text-text-2"
                                >
                                    <MdArrowOutward aria-hidden="true" />
                                </a>
                            )}
                        </div>
                        {medio.directorio_superior && (
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-title/50">
                                {medio.directorio_superior}
                            </p>
                        )}
                    </div>
                ))}
            </div>
            <p className="mt-3 px-0.5 gap-1 flex items-center text-[10px] text-title/50 group relative w-fit">
                <span>Fuente:</span>
                <a target="_blank" rel="noopener noreferrer" className="group-hover:text-text-2 transition-colors duration-150" href="https://analisis.datosabiertos.jcyl.es/explore/dataset/guia-de-medios-de-comunicacion/information">Guía de medios de comunicación de la Junta de Castilla y León</a>
            </p>
        </section>
    );
}
