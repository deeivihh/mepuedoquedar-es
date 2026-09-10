import Link from "next/link";
import DynamicHeading from "@/components/home/DynamicHeading";
import SearchBar from "@/components/home/SearchBar";
import { FaBookOpen, FaGithub, FaLinkedin } from "react-icons/fa";
import { getRandomSites } from "@/lib/supabase/municipalities";

export const dynamic = "force-static";
export const revalidate = 86400;

export default async function Home() {
    const randomSites = await getRandomSites(10);

    return (
        <main className="flex flex-col lg:flex-row min-h-screen w-full lg:h-screen lg:overflow-hidden">
            <div className="w-full lg:w-[60%] h-[100svh] lg:h-screen lg:overflow-y-auto relative no-scrollbar flex flex-col shrink-0">
                <div className="relative w-full h-[100svh] shrink-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        poster="/videos/hero-poster.webp"
                        className="w-full h-full object-cover"
                    >
                        <source src="/videos/hero-video.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute bottom-0 inset-x-0 h-50 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none z-999" />
                    <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 text-text-3 pointer-events-none z-999 p-4">
                        <p className="text-5xl max-w-xl text-balance font-semibold title-font shadow-sm">
                            Tu <span className="text-text-2 brightness-108">próximo gran capítulo</span> empieza aquí
                        </p>
                        <nav className="pointer-events-auto flex items-center gap-3 shrink-0 order-first md:order-last">
                            <Link
                                href="/metodologia"
                                title="Metodología"
                                aria-label="Metodología"
                                className="bg-white/20 hover:bg-white/90 backdrop-blur-md w-11 h-11 rounded-full border border-white/30 text-white hover:text-title transition-colors shadow-sm flex items-center justify-center"
                            >
                                <FaBookOpen size={16} />
                            </Link>
                            <a
                                href="https://github.com/deeivihh/mepuedoquedar.es"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Repositorio"
                                aria-label="Repositorio"
                                className="bg-white/20 hover:bg-white/90 backdrop-blur-md w-11 h-11 rounded-full border border-white/30 text-white hover:text-title transition-colors shadow-sm flex items-center justify-center"
                            >
                                <FaGithub size={17} />
                            </a>
                            <a
                                href="https://linkedin.com/in/deeivihh"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="LinkedIn"
                                aria-label="LinkedIn"
                                className="bg-white/20 hover:bg-white/90 backdrop-blur-md w-11 h-11 rounded-full border border-white/30 text-white hover:text-title transition-colors shadow-sm flex items-center justify-center"
                            >
                                <FaLinkedin size={16} />
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
            <div className="w-full lg:w-[40%] min-h-screen lg:h-full lg:overflow-y-auto flex flex-col items-center justify-center p-6 lg:px-12 lg:py-8">
                <div className="w-full flex flex-col items-center gap-6 shrink-0">
                    <DynamicHeading sites={randomSites} />
                    <div className="max-w-xl w-full">
                        <SearchBar />
                    </div>
                </div>
            </div>
        </main>
    );
}