import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { HOME_DATA_URL } from "../../config";
import ProductCard from "../../components/home/productCard.jsx";
import "./search.css";

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [input, setInput] = useState(query);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => setInput(query), [query]);

    useEffect(() => {
        const controller = new AbortController();
        fetch(HOME_DATA_URL, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error("Could not load products.");
                return response.json();
            })
            .then((data) => setProducts(Array.isArray(data.products) ? data.products : []))
            .catch((fetchError) => {
                if (fetchError.name !== "AbortError") setError("We couldn’t load the products. Please try again.");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, []);

    const results = useMemo(() => {
        const term = query.trim().toLocaleLowerCase();
        if (!term) return products;
        return products.filter((product) => `${product.name} ${product.id}`.toLocaleLowerCase().includes(term));
    }, [products, query]);

    const submitSearch = (event) => {
        event.preventDefault();
        const next = input.trim();
        setSearchParams(next ? { q: next } : {});
    };

    return (
        <section className="search-page">
            <div className="search-page__inner">
                <p className="search-page__eyebrow">Find your favourite grade</p>
                <h1>Search the shop</h1>
                <p className="search-page__intro">Explore our cardamom grades and choose the one that suits your kitchen.</p>
                <form className="search-page__form" role="search" onSubmit={submitSearch}>
                    <Search size={20} aria-hidden="true" />
                    <input
                        type="search"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Try purple, green, or cardamom"
                        aria-label="Search cardamom products"
                    />
                    <button type="submit">Search</button>
                </form>

                {query && <p className="search-page__count">{loading ? "Searching…" : `${results.length} ${results.length === 1 ? "product" : "products"} for “${query}”`}</p>}
                {loading && <p className="search-page__message">Loading products…</p>}
                {!loading && error && <p className="search-page__message" role="alert">{error}</p>}
                {!loading && !error && results.length > 0 && (
                    <div className="search-page__grid">{results.map((product) => <ProductCard key={product.id} product={product} />)}</div>
                )}
                {!loading && !error && results.length === 0 && (
                    <div className="search-page__empty">
                        <h2>No matching grades found</h2>
                        <p>Try a grade colour such as purple, pink, green, orange, or red.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SearchPage;
