import MunicipioDetail from "@/app/components/detail/municipio";

export default async function DetailPage({
    params,
}: {
    params: Promise<{ cod: string }>;
}) {
    const { cod } = await params;

    return (
        <main className="flex flex-col h-screen w-full max-md:p-4">
            <MunicipioDetail cod={cod} />
        </main>
    );
}
