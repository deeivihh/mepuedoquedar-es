import { FaGithub, FaProjectDiagram } from "react-icons/fa";
import DynamicHeading from "./components/home/dynamicHeading";
import SearchBar from "./components/home/searchbar";
import Link from "next/link";
import { MdEmail } from "react-icons/md";

export default function Home() {
    return (
        <main className="relative flex flex-col justify-center items-center h-screen w-full max-md:p-6">
            <footer className="absolute left-1/2 -translate-x-1/2 bottom-4 max-lg:top-8 z-20 pointer-events-auto">
                <div className="flex max-[17rem]:flex-col gap-6 max-md:gap-4 items-start justify-center">
                    <Link
                        href="/metodologia"
                        className="text-title/75 hover:text-title leading-relaxed text-sm max-[21rem]:text-xs flex items-center justify-center gap-2"
                    >
                        <FaProjectDiagram />
                        Metodología
                    </Link>
                    <Link
                        href="https://github.com/deeivihh/mepuedoquedar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-title/75 hover:text-title leading-relaxed text-sm max-[21rem]:text-xs flex items-center justify-center gap-2"
                    >
                        <FaGithub />
                        Repositorio
                    </Link>
                    <Link
                        href="mailto:deeivihh3@hotmail.com"
                        className="text-title/75 hover:text-title leading-relaxed text-sm max-[21rem]:text-xs flex items-center justify-center gap-2"
                    >
                        <MdEmail />
                        Contacto
                    </Link>
                </div>
            </footer>
            <section className="w-full h-full flex flex-col justify-center items-center relative z-30 pointer-events-none">
                <div className="w-full flex flex-col items-center justify-center pointer-events-auto">
                    <DynamicHeading />
                    <SearchBar />
                </div>
            </section>
        </main>
    );
}
