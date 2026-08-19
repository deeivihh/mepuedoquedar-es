import { useEffect, useState } from "react";

export function useData<T>(action: () => Promise<any>, deps: any[] = []) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const json = await action();
                setData(json?.Data ?? (Array.isArray(json) ? json : []));
            } catch (err) {
                console.error("Error fetching data", err);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, deps);

    return { data, loading };
}