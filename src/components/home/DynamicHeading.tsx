"use client";

import { useTypewriter } from "@/hooks/useTypewriter";
import * as m from "motion/react-m";
import { useEffect, useState } from "react";

const SITES = [
    "Valladolid",
    "Ponferrada",
    "Burgos",
    "León",
    "Salamanca",
    "Zamora",
    "Palencia",
    "Ávila",
    "Segovia",
    "Soria",
    "Medina del Campo",
    "Aranda de Duero",
    "Miranda de Ebro",
    "Astorga",
    "Benavente",
    "Béjar",
    "Ciudad Rodrigo",
    "Cuéllar",
    "Tordesillas",
    "El Burgo de Osma",
    "Aguilar de Campoo",
    "Arévalo",
    "Toro",
    "Puebla de Sanabria",
    "La Alberca",
    "Cervera de Pisuerga",
    "Lerma",
    "Sahagún",
    "Arenas de San Pedro",
    "Sepúlveda",
    "Pedraza",
    "Medinaceli",
    "Peñafiel",
    "Villafranca del Bierzo",
    "Guardo",
    "Almazán",
    "Candeleda",
    "Frías",
    "La Bañeza",
    "Olmedo",
    "Laguna de Duero",
    "El Espinar",
    "San Esteban de Gormaz",
    "El Barco de Ávila",
    "Real Sitio de San Ildefonso",
];

function shuffle(list: string[]): string[] {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function DynamicHeading({ sites }: { sites?: string[] } = {}) {
    const [names, setNames] = useState(sites && sites.length > 0 ? sites : SITES);

    useEffect(() => {
        if (sites && sites.length > 0) return;
        setNames(shuffle(SITES));
    }, [sites]);

    const typed = useTypewriter(names, 70, 35, 4000);

    return (
        <h1 className="text-2xl sm:text-3xl xl:text-4xl text-center font-semibold tracking-tight flex flex-col justify-center items-center w-full">
            <span className="block sm:whitespace-nowrap">¿Me puedo quedar en</span>
            <span className="block text-balance">
                <span className="text-color-2 uppercase">{typed || "\u00A0"}</span>
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

