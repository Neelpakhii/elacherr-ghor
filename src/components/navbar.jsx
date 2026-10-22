import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Leaf, Search, UserRound, ShoppingBag, Menu, X } from "lucide-react";
import { HOME_DATA_URL, getImageUrl } from "../config";
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
];

const Navbar = () => {
    const [logo, setLogo] = useState("");
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState(false);
    const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 30);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { itemCount } = useBag();
    const isEditorialDetail = location.pathname.startsWith("/recipes/")
        || (location.pathname.startsWith("/blogs/") && !["/blogs/recipes", "/blogs/p"].includes(location.pathname));
    const hasImageHero = ["/", "/about", "/shop", "/recipes", "/blogs", "/csr", "/pages/csr", "/blogs/recipes", "/blogs/p"].includes(location.pathname);
    const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase();
    const searchResults = useMemo(() => {
        if (!normalizedSearchQuery) return products.slice(0, 5);
        return products
            .filter((product) => `${product.name || ""} ${product.id || ""}`.toLocaleLowerCase().includes(normalizedSearchQuery))
            .slice(0, 5);
    }, [normalizedSearchQuery, products]);

    const closeOverlays = () => {
        setMenuOpen(false);
        setSearchOpen(false);
    };

    const handlePageNavigation = () => {
        closeOverlays();
        scrollToTop();
    };

    useEffect(() => {
        const controller = new AbortController();
        fetch(HOME_DATA_URL, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error("Failed to load navbar data");
                return response.json();
            })
            .then((data) => {
                setLogo(getImageUrl(data.navbar?.logo));
                setProducts(Array.isArray(data.products) ? data.products : []);
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
        if (!searchOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [searchOpen]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 30);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (searchOpen) searchInputRef.current?.focus();
    }, [searchOpen]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
                setSearchOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const submitSearch = (event) => {
        event.preventDefault();
        const query = searchQuery.trim();
        if (!query) {
            searchInputRef.current?.focus();
            return;
        }
        setSearchOpen(false);
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <header className={`navbar ${isScrolled ? "scrolled" : ""} ${hasImageHero ? "navbar--hero" : ""} ${isEditorialDetail ? "navbar--solid-at-top" : ""} ${menuOpen ? "menu-open" : ""} ${searchOpen ? "search-open" : ""}`}>
            <div className="navbar-logo">
                <NavLink to="/" aria-label="Elacher Ghor Home" onClick={handlePageNavigation}>
                    {logo && <img src={logo} alt="Elacher Ghor" title="Elacher Ghor home" />}
                </NavLink>
            </div>

            <div className="navbar-actions">
                <button
                    type="button"
                    className="navbar-icon"
                    aria-label={searchOpen ? "Close search" : "Search products"}
                    aria-expanded={searchOpen}
                    aria-controls="navbar-search-panel"
                    onClick={() => {
                        setMenuOpen(false);
                        setSearchOpen((open) => !open);
                    }}
                >
                    {searchOpen ? <X /> : <Search />}
                </button>

                <span className="navbar-profile-icon" role="img" aria-label="Profile" title="Profile">
                    <UserRound aria-hidden="true" />
                </span>

                <NavLink
                    to="/bag"
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
                        setSearchOpen(false);
                        setMenuOpen((previous) => !previous);
                    }}
                >
                    {menuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {searchOpen && (
                <div className="search-overlay" id="navbar-search-panel">
                    <button
                        type="button"
                        className="search-overlay__scrim"
                        aria-label="Close search"
                        onClick={() => setSearchOpen(false)}
                    />
                    <aside className="search-drawer" role="dialog" aria-modal="true" aria-labelledby="navbar-search-title">
                        <div className="search-drawer__top">
                            <div>
                                <p className="search-drawer__eyebrow"><Leaf size={14} aria-hidden="true" /> The cardamom edit</p>
                                <h2 id="navbar-search-title">Search our store</h2>
                                <p className="search-drawer__intro">Find the perfect grade for your kitchen.</p>
                            </div>
                            <button
                                type="button"
                                className="search-drawer__close"
                                aria-label="Close search"
                                onClick={() => setSearchOpen(false)}
                            >
                                <X size={22} aria-hidden="true" />
                            </button>
                        </div>

                        <form className="search-drawer__form" role="search" onSubmit={submitSearch}>
                            <div className="search-drawer__field">
                                <Leaf className="search-drawer__leaf" size={21} aria-hidden="true" />
                                <input
                                    ref={searchInputRef}
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Try purple, pink, or green"
                                    aria-label="Search cardamom products"
                                />
                                {searchQuery && (
                                    <button type="button" className="search-drawer__clear" aria-label="Clear search" onClick={() => setSearchQuery("")}>
                                        <X size={17} aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                            <button className="search-drawer__submit" type="submit">
                                <span>Search</span>
                                <ArrowRight size={17} aria-hidden="true" />
                            </button>
                        </form>

                        <div className="search-drawer__results-heading">
                            <h3>{normalizedSearchQuery ? "Matching grades" : "Popular grades"}</h3>
                            {!productsLoading && !productsError && (
                                <span>{searchResults.length} {searchResults.length === 1 ? "grade" : "grades"}</span>
                            )}
                        </div>

                        {productsLoading && <p className="search-drawer__message">Loading cardamom grades…</p>}
                        {!productsLoading && productsError && (
                            <p className="search-drawer__message" role="alert">We couldn’t load the products. Please try again.</p>
                        )}
                        {!productsLoading && !productsError && searchResults.length > 0 && (
                            <div className="search-drawer__results">
                                {searchResults.map((product) => (
                                    <Link
                                        className="search-result"
                                        key={product.id}
                                        to={`/products/${product.id}`}
                                        onClick={handlePageNavigation}
                                    >
                                        <span className="search-result__image">
                                            {product.image && <img src={getImageUrl(product.image)} alt="" title={product.name} loading="lazy" />}
                                        </span>
                                        <span className="search-result__details">
                                            <span className="search-result__name">{product.name}</span>
                                            <span className="search-result__prices">
                                                <span>Rs. {Number(product.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                                                {product.originalPrice != null && (
                                                    <span className="search-result__original">Rs. {Number(product.originalPrice).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                                                )}
                                            </span>
                                        </span>
                                        <ArrowRight className="search-result__arrow" size={18} aria-hidden="true" />
                                    </Link>
                                ))}
                            </div>
                        )}
                        {!productsLoading && !productsError && searchResults.length === 0 && (
                            <div className="search-drawer__empty">
                                <Leaf size={24} aria-hidden="true" />
                                <p>No grades found for “{searchQuery.trim()}”.</p>
                                <span>Try purple, pink, green, orange, or red.</span>
                            </div>
                        )}

                        <Link
                            className="search-drawer__all-results"
                            to={searchQuery.trim() ? `/search?q=${encodeURIComponent(searchQuery.trim())}` : "/search"}
                            onClick={handlePageNavigation}
                        >
                            <span>{searchQuery.trim() ? "See all results" : "Browse all grades"}</span>
                            <ArrowRight size={17} aria-hidden="true" />
                        </Link>
                    </aside>
                </div>
            )}

            <nav id="main-navigation" className={`navbar-menu ${menuOpen ? "show" : ""}`} aria-label="Main navigation">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
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
