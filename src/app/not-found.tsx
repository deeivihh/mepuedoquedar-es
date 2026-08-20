import Link from "next/link";
import { MdSearchOff, MdArrowBack } from "react-icons/md";

export default function NotFound() {
    return (
        <main className="flex flex-col justify-center items-center min-h-[70svh] w-full px-6 py-12">
            <div className="p-8 md:p-10 max-w-md w-full flex flex-col items-center text-center gap-5">

                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-title">Página no encontrada</h1>
                    <p className="text-sm text-black/70 leading-relaxed text-balance">
                        El municipio o la sección que buscas no existe o no se encuentra disponible.
                    </p>
                </div>

                <div className="pt-2">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm text-white bg-text-2 hover:opacity-90 transition-opacity"
                    >
                        <MdArrowBack size={18} />
                        Volver al buscador
                    </Link>
                </div>
            </div>
        </main>
    );
}
