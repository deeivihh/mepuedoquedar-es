import { MdArrowOutward } from "react-icons/md";
import Source from "./Source";

export default function PrensaSection({ data }: { data: any }) {
    if (!data.mas?.medios?.length) return null;
    return (
        <section id="prensa-local" className="">
            <div className="mb-8">
                <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">Prensa local</h2>
            </div>
            <div className="grid grid-cols-1 bg-white/30 md:grid-cols-2 gap-2 p-4 border border-title/20">
                {data.mas.medios.map((medio: { nombre: string; directorio_superior: string | null; paginas_de_internet: string | null }, i: number) => (
                    <a title={`Abrir ${medio.nombre}`} href={medio.paginas_de_internet || `https://www.google.com/search?q=${medio.nombre.replace(" ", "+")}`} target="_blank" rel="noopener noreferrer" key={medio.nombre} className={`border border-title/20 flex flex-col gap-2 p-4 transition-colors hover:bg-white/40 ${data.mas.medios.length % 2 === 1 && i === data.mas.medios.length - 1 ? "md:col-span-2" : ""}`}>
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="title-font text-lg font-semibold leading-snug text-title">{medio.nombre}</h3>
                            <span className="flex items-center justify-center gap-1"><MdArrowOutward /></span>
                        </div>
                    </a>
                ))}
            </div>
            <Source href="https://analisis.datosabiertos.jcyl.es/explore/dataset/guia-de-medios-de-comunicacion/information">
                Guía de medios de comunicación de la Junta de Castilla y León
            </Source>
        </section>
    );
}
