"use client";

import { useState } from "react";
import { useLocation } from "@/hooks/useLocation";
import { MdLocationOff, MdClose } from "react-icons/md";

export default function LocationNotice({ className = "" }: { className?: string }) {
    const { permissionDenied, requestLocation } = useLocation();
    const [dismissed, setDismissed] = useState(false);
    const [retryStatus, setRetryStatus] = useState<"idle" | "loading" | "error">("idle");

    if (!permissionDenied || dismissed) return null;

    const handleRetry = async () => {
        setRetryStatus("loading");
        const success = await requestLocation();
        if (!success) {
            setRetryStatus("error");
            setTimeout(() => {
                setRetryStatus("idle");
            }, 3000);
        } else {
            setRetryStatus("idle");
        }
    };

    return (
        <div className={`w-full bg-white/60 backdrop-blur-xs border border-title/30 shadow-sm p-2.5 sm:p-3 pointer-events-auto flex flex-col gap-2 ${className}`.trim()}>
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-title/15">
                <div className="flex items-center gap-1.5 min-w-0">
                    <MdLocationOff className="text-text-2 text-sm shrink-0" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-title/70 truncate">
                        Ubicación
                    </span>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="text-title/50 hover:text-title active:scale-[0.96] p-0.5 transition-[color,transform] duration-150 cursor-pointer"
                    aria-label="Cerrar aviso de ubicación"
                >
                    <MdClose size={14} />
                </button>
            </div>

            <p className="text-xs leading-relaxed text-title/75">
                Sin acceso a tu ubicación no podemos calcular la distancia a este municipio.
            </p>

            <button
                onClick={handleRetry}
                disabled={retryStatus === "loading"}
                className={`mt-0.5 w-full py-1 text-center text-[11px] font-medium transition-[background-color,color,transform] duration-150 active:scale-[0.96] cursor-pointer ${retryStatus === "error"
                        ? "bg-red-500/15 text-red-700 hover:bg-red-500/20 font-medium"
                        : retryStatus === "loading"
                            ? "bg-title/10 text-title/50 cursor-wait"
                            : "bg-title/10 hover:bg-title/15 text-title"
                    }`}
            >
                {retryStatus === "loading"
                    ? "Comprobando..."
                    : retryStatus === "error"
                        ? "Acceso denegado"
                        : "Reintentar"}
            </button>
        </div>
    );
}
