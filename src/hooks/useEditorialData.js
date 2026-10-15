import { useEffect, useState } from "react";
import { EDITORIAL_DATA_URL } from "../config";

export default function useEditorialData() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        fetch(EDITORIAL_DATA_URL, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Editorial content could not be loaded.");
                }
                return response.json();
            })
            .then(setData)
            .catch((loadError) => {
                if (loadError.name !== "AbortError") {
                    setError(loadError.message);
                }
            });

        return () => controller.abort();
    }, []);

    return { data, error };
}