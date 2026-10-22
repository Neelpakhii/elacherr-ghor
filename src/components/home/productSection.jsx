import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HOME_DATA_URL } from "../../config.js";
import ProductCard from "./productCard.jsx";
import { isProductAvailable } from "../../utils/productAvailability.js";
import "./productSection.css";

const ProductSection = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(HOME_DATA_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load products.");
                }

                return response.json();
            })
            .then((data) => {
                setProducts(Array.isArray(data.products)
                    ? data.products.filter(isProductAvailable)
                    : []);
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const featuredProducts = products.slice(0, 3);

    return (
        <section className="product-section" id="products">
            <div className="product-section__header">
                <h1>Elacher Ghor’s Premium Quality Cardamom</h1>
            </div>

            {loading && <p>Loading products...</p>}

            {!loading && error && <p role="alert">{error}</p>}

            {!loading && !error && products.length === 0 && (
                <p>No products are available right now.</p>
            )}

            {!loading && !error && featuredProducts.length > 0 && (
                <>
                    <div className="product-section__grid">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} headingLevel={2} />
                        ))}
                    </div>

                    <div className="product-section__actions">
                        <Link className="product-section__buy-now" to="/shop">
                            Buy Now
                        </Link>
                    </div>
                </>
            )}
        </section>
    );
};

export default ProductSection;
