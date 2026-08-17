import MunicipioDetail from "@/app/components/detail/municipio";
import SearchBar from "@/app/components/home/searchbar";

export default async function DetailPage({
    params,
}: {
    params: Promise<{ cod: string }>;
}) {
    const { cod } = await params;

    return (
        <main className="flex flex-col justify-start mx-auto items-center min-h-screen w-full p-8 pt-4 max-w-5xl bg-bg-card">
            <section className="w-full pb-4">
                <SearchBar />
            </section>

            <section className="flex w-full h-full">
                <MunicipioDetail cod={cod} />
            </section>
        </main>
    );
}
