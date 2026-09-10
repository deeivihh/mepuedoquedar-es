"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MdErrorOutline, MdRefresh, MdHome } from "react-icons/md";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="flex flex-col justify-center items-center min-h-[70svh] w-full px-6 py-12">
            <div className="card border border-title/20 p-8 md:p-10 max-w-md w-full flex flex-col items-center text-center gap-5 shadow-sm">
                <div className="p-3.5 bg-text-2/10 text-color-2">
                    <MdErrorOutline size={42} />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-title">Ha ocurrido un problema</h2>
                    <p className="text-sm text-black/70 leading-relaxed text-balance">
                        No hemos podido cargar la información solicitada. Puedes intentar recargar la vista o volver a la página principal.
                    </p>
                </div>

                <div className="flex max-[24rem]:flex-col gap-3 w-full justify-center pt-2">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-medium text-sm text-white bg-title hover:opacity-90 transition-opacity"
                    >
                        <MdRefresh size={18} />
                        Reintentar
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-medium text-sm text-title border border-title/30 hover:bg-white/80 transition-colors"
                    >
                        <MdHome size={18} />
                        Ir al inicio
                    </Link>
                </div>
            </div>
        </main>
    );
}
