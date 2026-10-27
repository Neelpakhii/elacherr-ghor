import { useEffect, useState } from "react";
import { BLOG_DATA_URL, EDITORIAL_DATA_URL, RECIPE_DATA_URL } from "../config";

export default function useEditorialData() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const loadJson = async (url) => {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) throw new Error(`Could not load ${url}.`);
            return response.json();
        };

        Promise.all([loadJson(RECIPE_DATA_URL), loadJson(BLOG_DATA_URL), loadJson(EDITORIAL_DATA_URL)])
            .then(([recipes, blogs, editorial]) => setData({
                ...editorial,
                ...recipes,
                ...blogs,
                recipes: [...(recipes.recipes || []), ...(recipes.localRecipes || [])]
                    .filter((item) => String(item.status || "published").toLowerCase() !== "draft"),
                blogs: (blogs.blogs || []).filter((item) => String(item.status || "published").toLowerCase() !== "draft"),
            }))
            .catch((loadError) => {
                if (loadError.name !== "AbortError") {
                    setError(loadError.message);
                }
            });

        return () => controller.abort();
    }, []);

    return { data, error };
}
