import { useEffect, useMemo, useRef, useState } from "react";
import { HOME_DATA_URL } from "../../config";
import ProductCard from "../home/productCard.jsx";
import { isProductAvailable } from "../../utils/productAvailability.js";
import "./productCollection.css";

const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-ascending", label: "Price, low to high" },
    { value: "price-descending", label: "Price, high to low" },
    { value: "title-ascending", label: "Title, A-Z" },
    { value: "title-descending", label: "Title, Z-A" },
    { value: "date-descending", label: "Date, new to old" },
    { value: "date-ascending", label: "Date, old to new" },
    { value: "best-selling", label: "Best Selling" },
];

const sortProducts = (products, sortBy) => {
    if (sortBy === "featured") {
        return products;
    }

    return products
        .map((product, index) => ({ product, index }))
        .sort((a, b) => {
            const first = a.product;
            const second = b.product;

            let result = 0;

            switch (sortBy) {
                case "price-ascending":
                    result =
                        Number(first.price || 0) -
                        Number(second.price || 0);
                    break;

                case "price-descending":
                    result =
                        Number(second.price || 0) -
                        Number(first.price || 0);
                    break;

                case "title-ascending":
                    result = (first.name || "").localeCompare(
                        second.name || ""
                    );
                    break;

                case "title-descending":
                    result = (second.name || "").localeCompare(
                        first.name || ""
                    );
                    break;

                case "date-descending":
                    result =
                        new Date(second.createdAt || 0).getTime() -
                        new Date(first.createdAt || 0).getTime();
                    break;

                case "date-ascending":
                    result =
                        new Date(first.createdAt || 0).getTime() -
                        new Date(second.createdAt || 0).getTime();
                    break;

                case "best-selling":
                    result =
                        Number(second.bestSelling || 0) -
                        Number(first.bestSelling || 0);
                    break;

                default:
                    result = 0;
            }

            // Preserve the original array order when values are equal.
            return result || a.index - b.index;
        })
        .map(({ product }) => product);
};

const ProductCollection = () => {
    const [products, setProducts] = useState([]);
    const [sortBy, setSortBy] = useState("featured");
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const sortDropdownRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();

        const loadProducts = async () => {
            try {
                const response = await fetch(HOME_DATA_URL, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Failed to load shop products.");
                }

                const data = await response.json();

                setProducts(
                    Array.isArray(data.products)
                        ? data.products.filter(isProductAvailable)
                        : []
                );
            } catch (fetchError) {
                if (fetchError.name !== "AbortError") {
                    console.error("Shop products error:", fetchError);
                    setError("Products could not be loaded. Please try again.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const closeOnOutsideClick = (event) => {
            if (!sortDropdownRef.current?.contains(event.target)) {
                setSortMenuOpen(false);
            }
        };

        const closeOnEscape = (event) => {
            if (event.key === "Escape") {
                setSortMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", closeOnOutsideClick);
        document.addEventListener("keydown", closeOnEscape);

        return () => {
            document.removeEventListener("mousedown", closeOnOutsideClick);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, []);

    const sortedProducts = useMemo(
        () => sortProducts(products, sortBy),
        [products, sortBy]
    );

    const selectedSortLabel =
        sortOptions.find((option) => option.value === sortBy)?.label ||
        "Featured";

    return (
        <section
            className="product-collection"
            aria-label="Cardamom products"
        >
            <div className="product-collection__toolbar">
                <span className="product-collection__sort-label">
                    SORT BY
                </span>

                <div
                    className="product-collection__sort"
                    ref={sortDropdownRef}
                >
                    <button
                        type="button"
                        className="product-collection__sort-trigger"
                        aria-haspopup="listbox"
                        aria-expanded={sortMenuOpen}
                        aria-label={`Sort products. Current sort: ${selectedSortLabel}`}
                        onClick={() =>
                            setSortMenuOpen((isOpen) => !isOpen)
                        }
                    >
                        <span>{selectedSortLabel}</span>

                        <span
                            className={`product-collection__sort-arrow ${
                                sortMenuOpen ? "is-open" : ""
                            }`}
                            aria-hidden="true"
                        />
                    </button>

                    {sortMenuOpen && (
                        <div
                            className="product-collection__sort-menu"
                            role="listbox"
                            aria-label="Sort products"
                        >
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={sortBy === option.value}
                                    className={`product-collection__sort-option ${
                                        sortBy === option.value
                                            ? "is-selected"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        setSortBy(option.value);
                                        setSortMenuOpen(false);
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <p className="product-collection__message">
                    Loading products...
                </p>
            )}

            {!loading && error && (
                <p className="product-collection__message" role="alert">
                    {error}
                </p>
            )}

            {!loading && !error && sortedProducts.length === 0 && (
                <p className="product-collection__message">
                    No products are available.
                </p>
            )}

            {!loading && !error && sortedProducts.length > 0 && (
                <div className="product-collection__grid">
                    {sortedProducts.map((product, index) => (
                        <ProductCard
                            key={product.id || `${product.name}-${index}`}
                            product={product}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default ProductCollection;
