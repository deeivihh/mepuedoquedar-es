import MunicipioDetail from "@/app/components/detail/municipio";
import SearchBar from "@/app/components/home/searchbar";
import Link from "next/link";

export default async function DetailPage({
    params,
}: {
    params: Promise<{ cod: string }>;
}) {
    const { cod } = await params;

    return (
        <main className="min-h-screen w-full bg-bg px-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full flex-col max-w-5xl">
                <header className="pt-6 flex justify-between items-center">
                    <div className="flex-1">
                        <SearchBar />
                    </div>
                </header>

                <div className="py-5 sm:py-8 lg:py-10">
                    <MunicipioDetail cod={cod} />
                </div>
            </div>
        </main>
    );
}
