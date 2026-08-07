import MunicipioDetail from "@/app/components/detail/municipio";

export default async function DetailPage({
    params,
}: {
    params: Promise<{ cod: string }>;
}) {
    const { cod } = await params;

    return (
        <main className="flex flex-col justify-start items-center min-h-screen w-full max-md:p-4 p-4">
            <MunicipioDetail cod={cod} />
        </main>
    );
}
