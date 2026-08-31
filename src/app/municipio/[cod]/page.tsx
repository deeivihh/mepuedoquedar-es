import MunicipioDetail from "@/components/municipio/MunicipioDetail";
import SearchBar from "@/components/home/SearchBar";

export default async function DetailPage({
    params,
}: {
    params: Promise<{ cod: string }>;
}) {
    const { cod } = await params;

    return (
        <main className="min-h-[100dvh] w-full bg-bg p-4 sm:p-8 lg:p-12 flex justify-center">
            <div className="flex w-full max-w-5xl flex-col gap-4 sm:gap-8 lg:gap-12">
                <header className="relative z-50 w-full">
                    <SearchBar />
                </header>

                <section className="w-full">
                    <MunicipioDetail cod={cod} />
                </section>
            </div>
        </main>
    );
}
