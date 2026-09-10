"use client";

import { useTypewriter } from "@/hooks/useTypewriter";
import * as m from "motion/react-m";
import { useMemo } from "react";

export default function DynamicHeading({ sites = [] }: { sites?: string[] }) {
    const defaultSites = useMemo(() => ["Castilla y León", "tu pueblo", "tu ciudad"], []);
    const names = sites.length > 0 ? sites : defaultSites;
    const typed = useTypewriter(names, 70, 35, 4000);

    return (
        <h1 className="text-4xl max-md:text-3xl text-center font-semibold tracking-tight flex flex-col justify-center items-center w-full">
            <span className="block">¿Me puedo quedar en</span>
            <span className="block text-balance">
                <span className="text-color-2">{typed || "\u00A0"}</span>
                <span className="inline-block whitespace-nowrap">
                    <m.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        className="inline-block w-[2px] h-[1em] bg-current mx-[2px] align-middle translate-y-[-4px] text-color-2"
                    />?
                </span>
            </span>
        </h1>
    );
}
