import MunicipioDetail from "@/app/components/detail/municipio";
import SearchBar from "@/app/components/home/searchbar";

export default async function DetailPage({
    params,
}: {
    params: Promise<{ cod: string }>;
}) {
    const { cod } = await params;

    return (
        <main className="flex flex-col justify-center mx-auto items-center min-h-screen w-full max-md:p-4 p-4 max-w-6xl">
            <section className="w-full">
                <SearchBar />
            </section>

            <section className="flex w-full h-full mt-2">
                <MunicipioDetail cod={cod} />
            </section>
        </main>
    );
}
