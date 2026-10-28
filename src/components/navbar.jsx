import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Search, UserRound, ShoppingBag, Menu, X } from "lucide-react";
import { HOME_DATA_URL, PRODUCTS_DATA_URL, getAppPath, getImageUrl } from "../config";
import useBag from "../hooks/useBag.js";
import scrollToTop from "../utils/scrollToTop.js";
import "./navbar.css";

const navLinks = [
    { name: "Home", path: "/", end: true },
    { name: "About", path: "/about" },
    { name: "Shop", path: "/shop" },
    { name: "Recipes", path: "/recipes" },
    { name: "Blogs", path: "/blogs" },
    { name: "CSR", path: "/csr" },
    { name: "FAQs", path: "/pages/faqs", end: true },
];

const Navbar = () => {
    const [logo, setLogo] = useState("");
    const [logoTitle, setLogoTitle] = useState("Elacher Ghor home");
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState(false);
    const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 30);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const searchInputRef = useRef(null);
    const searchContainerRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { itemCount } = useBag();
    const pathname = location.pathname.replace(/\/+$/, "") || "/";
    const hasImageHero = ["/", "/about", "/shop", "/recipes", "/blogs", "/csr", "/pages/csr", "/blogs/recipes", "/blogs/p"].includes(pathname);
    const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase();
    const searchResults = useMemo(() => {
        if (!normalizedSearchQuery) return [];
        return products
            .filter((product) => `${product.name || ""} ${product.id || ""}`.toLocaleLowerCase().includes(normalizedSearchQuery))
            .slice(0, 5);
    }, [normalizedSearchQuery, products]);

    const closeOverlays = () => {
        setMenuOpen(false);
        setSearchFocused(false);
    };

    const handlePageNavigation = () => {
        closeOverlays();
        scrollToTop();
    };

    useEffect(() => {
        const controller = new AbortController();
        Promise.all([
            fetch(HOME_DATA_URL, { signal: controller.signal }),
            fetch(PRODUCTS_DATA_URL, { signal: controller.signal }),
        ])
            .then(async ([homeResponse, productsResponse]) => {
                if (!homeResponse.ok || !productsResponse.ok) throw new Error("Failed to load navbar data");
                return [await homeResponse.json(), await productsResponse.json()];
            })
            .then(([homeData, productsData]) => {
                setLogo(getImageUrl(homeData.navbar?.logo));
                setLogoTitle(homeData.navbar?.logoTitle || "Elacher Ghor home");
                setProducts(Array.isArray(productsData.products) ? productsData.products : []);
            })
            .catch((error) => {
                if (error.name !== "AbortError") {
                    setProductsError(true);
                    console.error("Navbar error:", error);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setProductsLoading(false);
            });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 30);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
                setSearchFocused(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!searchContainerRef.current?.contains(event.target)) setSearchFocused(false);
        };
        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, []);

    const submitSearch = (event) => {
        event.preventDefault();
        const query = searchQuery.trim();
        if (!query) {
            searchInputRef.current?.focus();
            return;
        }
        setSearchFocused(false);
        navigate(getAppPath(`/search?q=${encodeURIComponent(query)}`));
    };

    return (
        <header className={`navbar ${isScrolled ? "scrolled" : ""} ${hasImageHero ? "navbar--hero" : ""} ${menuOpen ? "menu-open" : ""}`}>
            <div className="navbar-logo">
                <NavLink to={getAppPath("/")} aria-label="Elacher Ghor Home" onClick={handlePageNavigation}>
                    {logo && <img src={logo} alt="Elacher Ghor" title={logoTitle} />}
                </NavLink>
            </div>

            <div className="navbar-actions">
                <div className="navbar-search" ref={searchContainerRef}>
                    <form className="navbar-search__form" role="search" onSubmit={submitSearch}>
                        <Search aria-hidden="true" />
                        <input
                            ref={searchInputRef}
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            onFocus={() => {
                                setMenuOpen(false);
                                setSearchFocused(true);
                            }}
                            placeholder="Search recipes, products..."
                            aria-label="Search recipes and products"
                            aria-expanded={Boolean(searchFocused && normalizedSearchQuery)}
                            aria-controls="navbar-search-results"
                        />
                    </form>

                    {searchFocused && normalizedSearchQuery && (
                        <div className="navbar-search__results" id="navbar-search-results">
                            <div className="navbar-search__results-heading">
                                <span>{productsLoading ? "Searching…" : `${searchResults.length} ${searchResults.length === 1 ? "result" : "results"}`}</span>
                                <button type="button" onClick={submitSearch}>See all</button>
                            </div>
                            {productsError && <p className="navbar-search__message" role="alert">We couldn’t load products. Please try again.</p>}
                            {!productsLoading && !productsError && searchResults.length > 0 && searchResults.map((product) => (
                                <Link
                                    className="navbar-search-result"
                                    key={product.id}
                                    to={getAppPath(`/products/${product.id}`)}
                                    onClick={() => {
                                        setSearchQuery("");
                                        handlePageNavigation();
                                    }}
                                >
                                    <span className="navbar-search-result__image">
                                        {product.image && <img src={getImageUrl(product.image)} alt="" loading="lazy" />}
                                    </span>
                                    <span className="navbar-search-result__details">
                                        <span className="navbar-search-result__name">{product.name}</span>
                                        <span className="navbar-search-result__price">Rs. {Number(product.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                                    </span>
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                            ))}
                            {!productsLoading && !productsError && searchResults.length === 0 && (
                                <p className="navbar-search__message">No products found for “{searchQuery.trim()}”.</p>
                            )}
                        </div>
                    )}
                </div>

                <span className="navbar-profile-icon" role="img" aria-label="Profile" title="Profile">
                    <UserRound aria-hidden="true" />
                </span>

                <NavLink
                    to={getAppPath("/bag")}
                    className={({ isActive }) => `navbar-icon navbar-bag-link ${isActive ? "active" : ""}`}
                    aria-label={`Shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
                    onClick={handlePageNavigation}
                >
                    <ShoppingBag />
                    {itemCount > 0 && <span className="navbar-bag-count" aria-hidden="true">{itemCount > 99 ? "99+" : itemCount}</span>}
                </NavLink>

                <button
                    type="button"
                    className="navbar-toggle"
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    aria-controls="main-navigation"
                    onClick={() => {
                        setSearchFocused(false);
                        setMenuOpen((previous) => !previous);
                    }}
                >
                    {menuOpen ? <X /> : <Menu />}
                </button>
            </div>

            <nav id="main-navigation" className={`navbar-menu ${menuOpen ? "show" : ""}`} aria-label="Main navigation">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={getAppPath(link.path)}
                        end={link.end}
                        onClick={handlePageNavigation}
                        className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
                    >
                        {link.name}
                        <span className="navbar-link-arrow" aria-hidden="true">↗</span>
                    </NavLink>
                ))}
            </nav>

            <button
                type="button"
                className={`navbar-backdrop ${menuOpen ? "show" : ""}`}
                aria-label="Close navigation menu"
                tabIndex={menuOpen ? 0 : -1}
                onClick={() => setMenuOpen(false)}
            />
        </header>
    );
};

export default Navbar;
