import { useEffect, useState } from "react";

export function useData<T>(action: () => Promise<any>, deps: any[] = []) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);

            try {
                const json = await action();
                if (isMounted) {
                    setData(json?.Data ?? (Array.isArray(json) ? json : []));
                }
            } catch (err) {
                console.error("Error fetching data", err);
                if (isMounted) {
                    setData([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [action, ...deps]);

    return { data, loading };
}
