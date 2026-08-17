import { FaGithub, FaProjectDiagram } from "react-icons/fa";
import DynamicHeading from "./components/home/dynamicHeading";
import SearchBar from "./components/home/searchbar";
import Link from "next/link";
import { MdEmail } from "react-icons/md";

export default function Home() {
    return (
        <main className="flex flex-col justify-start h-screen w-full max-md:p-6">
            <footer className="absolute left-1/2 -translate-x-1/2 bottom-4 max-lg:top-8">
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
            <section className="h-[calc(100svh-15rem)] flex flex-col justify-center items-center z-50">
                <DynamicHeading />
                <SearchBar />
            </section>
        </main>
    );
}
