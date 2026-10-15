import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Search, UserRound, ShoppingBag, Menu, X } from "lucide-react";
import { HOME_DATA_URL, getImageUrl } from "../config";
import { useBag } from "../context/BagContext.jsx";
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
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { itemCount } = useBag();
    const hasImageHero = ["/", "/about", "/shop", "/recipes", "/blogs", "/csr", "/pages/csr"].includes(location.pathname)
        || location.pathname.startsWith("/recipes/")
        || location.pathname.startsWith("/blogs/");

    useEffect(() => {
        const controller = new AbortController();
        fetch(HOME_DATA_URL, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error("Failed to load navbar data");
                return response.json();
            })
            .then((data) => setLogo(getImageUrl(data.navbar?.logo)))
            .catch((error) => {
                if (error.name !== "AbortError") console.error("Navbar error:", error);
            });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 30);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
        setSearchOpen(false);
        setIsScrolled(false);
        window.scrollTo(0, 0);
    }, [location.pathname]);

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
        <header className={`navbar ${isScrolled ? "scrolled" : ""} ${hasImageHero ? "navbar--hero" : ""} ${menuOpen ? "menu-open" : ""} ${searchOpen ? "search-open" : ""}`}>
            <div className="navbar-logo">
                <NavLink to="/" aria-label="Elacher Ghor Home">
                    {logo && <img src={logo} alt="Elacher Ghor" />}
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
                <form id="navbar-search-panel" className="navbar-search-panel" role="search" onSubmit={submitSearch}>
                    <Search size={20} aria-hidden="true" />
                    <input
                        ref={searchInputRef}
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search cardamom grades…"
                        aria-label="Search products"
                    />
                    <button type="submit">Search</button>
                </form>
            )}

            <nav id="main-navigation" className={`navbar-menu ${menuOpen ? "show" : ""}`} aria-label="Main navigation">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.end}
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
