import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import PhotoCredit from "../../components/editorial/PhotoCredit.jsx";
import useEditorialData from "../../hooks/useEditorialData.js";
import "../editorial.css";

const formatDate = (value) => new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
}).format(new Date(`${value}T00:00:00`));

const BlogsPage = () => {
    const { data, error } = useEditorialData();
    const [category, setCategory] = useState("All stories");
    const [query, setQuery] = useState("");
    const articles = data?.blogs || [];
    const page = data?.blogsPage;
    const categories = useMemo(
        () => ["All stories", ...new Set(articles.map((article) => article.category))],
        [articles]
    );
    const visibleArticles = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return articles.filter((article) => {
            const matchesCategory = category === "All stories" || article.category === category;
            const matchesQuery = !normalizedQuery ||
                `${article.title} ${article.excerpt} ${article.category}`.toLowerCase().includes(normalizedQuery);
            return matchesCategory && matchesQuery;
        });
    }, [articles, category, query]);
    const featured = visibleArticles.find((article) => article.featured) || visibleArticles[0];
    const remaining = visibleArticles.filter((article) => article.slug !== featured?.slug);

    if (error) return <main className="editorial-message" role="alert">{error}</main>;
    if (!page) return <main className="editorial-message" aria-live="polite">Loading stories…</main>;

    return (
        <main className="editorial-page blogs-page">
            <header className="editorial-hero editorial-hero--journal">
                <img src={page.heroImage} alt={page.heroImageAlt} />
                <div className="editorial-hero__shade" />
                <div className="editorial-hero__content">
                    <h1>{page.title}</h1>
                    <p className="editorial-hero__description">{page.description}</p>
                    <a className="editorial-button editorial-button--light" href="#journal-collection">
                        Read the journal <ArrowRight size={17} />
                    </a>
                    <PhotoCredit name={page.heroImageCredit} url={page.heroImageCreditUrl} />
                </div>
            </header>

            <section className="editorial-section journal-section" id="journal-collection">
                <div className="editorial-section__heading editorial-section__heading--row">
                    <div>
                        <p className="editorial-eyebrow editorial-eyebrow--green">A journal for curious cooks</p>
                        <h2>Good things to know</h2>
                        <p>Stories, useful guides and ideas to bring more aroma to the everyday.</p>
                    </div>
                    <label className="editorial-search">
                        <Search size={18} aria-hidden="true" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search the journal"
                            aria-label="Search journal articles"
                        />
                    </label>
                </div>
                <div className="journal-filter-row" aria-label="Filter stories by topic">
                    {categories.map((item) => (
                        <button
                            type="button"
                            key={item}
                            className={category === item ? "is-active" : ""}
                            onClick={() => setCategory(item)}
                            aria-pressed={category === item}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {featured ? (
                    <article className="journal-featured">
                        <Link className="journal-featured__image" to={`/blogs/${featured.slug}`}>
                            <img src={featured.image} alt={featured.imageAlt} loading="lazy" />
                        </Link>
                        <div className="journal-featured__body">
                            <p className="editorial-card-kicker">{featured.category} <span>·</span> {featured.readTime}</p>
                            <h3><Link to={`/blogs/${featured.slug}`}>{featured.title}</Link></h3>
                            <p className="editorial-card-copy">{featured.excerpt}</p>
                            <p className="journal-date">{formatDate(featured.date)}</p>
                            <Link className="editorial-text-link" to={`/blogs/${featured.slug}`}>
                                Read the story <ArrowRight size={16} />
                            </Link>
                            <PhotoCredit name={featured.imageCredit} url={featured.imageCreditUrl} />
                        </div>
                    </article>
                ) : (
                    <p className="editorial-empty">No stories match that search. Try another topic.</p>
                )}

                {remaining.length > 0 && (
                    <div className="editorial-card-grid editorial-card-grid--journal">
                        {remaining.map((article) => (
                            <article className="editorial-card" key={article.slug}>
                                <Link className="editorial-card__image" to={`/blogs/${article.slug}`}>
                                    <img src={article.image} alt={article.imageAlt} loading="lazy" />
                                </Link>
                                <div className="editorial-card__body">
                                    <p className="editorial-card-kicker">{article.category} <span>·</span> {article.readTime}</p>
                                    <h3><Link to={`/blogs/${article.slug}`}>{article.title}</Link></h3>
                                    <p className="editorial-card-copy">{article.excerpt}</p>
                                    <p className="journal-date">{formatDate(article.date)}</p>
                                    <Link className="editorial-text-link" to={`/blogs/${article.slug}`}>
                                        Read article <ArrowRight size={16} />
                                    </Link>
                                    <PhotoCredit name={article.imageCredit} url={article.imageCreditUrl} />
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

export default BlogsPage;
