import DynamicHeading from "./components/home/dynamicHeading";
import SearchBar from "./components/home/searchbar";

export default function Home() {
    return (
        <main className="flex flex-col md:flex-row min-h-screen w-full bg-bg-color overflow-hidden">
            <div className="w-full md:w-[60%] h-screen overflow-y-auto relative no-scrollbar flex flex-col">
                <div className="relative w-full h-[100svh] shrink-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        poster="/videos/hero_poster.webp"
                        className="w-full h-full object-cover"
                    >
                        <source src="/videos/hero_video.mp4" type="video/mp4" />
                    </video>

                    <div className="absolute bottom-0 inset-x-0 h-50 backdrop-blur-[1px] bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none z-999" />
                    <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-1 text-text-3 pointer-events-none z-999 p-4">
                        <h2 className="text-5xl max-w-xl text-balance font-semibold title-font shadow-sm">
                            Tu <span className="text-text-2 brightness-108">próximo gran capítulo</span> empieza aquí
                        </h2>
                    </div>
                </div>
            </div>
            <div className="w-full md:w-[40%] h-screen overflow-y-auto flex flex-col relative max-md:pt-6">
                <div className="w-full h-full flex flex-col justify-center items-center min-md:p-24 p-6">
                    <DynamicHeading />
                    <SearchBar />
                </div>
            </div>
        </main>
    );
}
