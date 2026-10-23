import { ArrowLeft, Clock3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PhotoCredit from "../../components/editorial/PhotoCredit.jsx";
import useEditorialData from "../../hooks/useEditorialData.js";
import "../editorial.css";

const formatDate = (value) => new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
}).format(new Date(`${value}T00:00:00`));

const BlogDetailPage = () => {
    const { slug } = useParams();
    const { data, error } = useEditorialData();
    const article = data?.blogs?.find((item) => item.slug === slug);

    if (error) return <main className="editorial-message" role="alert">{error}</main>;
    if (!data) return <main className="editorial-message" aria-live="polite">Loading story…</main>;
    if (!article) return <main className="editorial-message"><h1>Story not found</h1><Link to="/blogs">Back to the journal</Link></main>;

    return (
        <main className="editorial-page article-page">
            <article>
                <div className="article-heading">
                    <Link className="editorial-back-link" to="/blogs"><ArrowLeft size={16} /> Back to the journal</Link>
                    <p className="editorial-eyebrow editorial-eyebrow--green">{article.category}</p>
                    <h1>{article.title}</h1>
                    <p className="article-deck">{article.excerpt}</p>
                    <div className="article-byline"><span>{formatDate(article.date)}</span><span><Clock3 size={15} /> {article.readTime}</span></div>
                </div>
                <figure className="article-cover">
                    <img src={article.image} alt={article.imageAlt || article.title || "Cardamom story"} title={article.imageTitle || article.imageAlt || article.title || "Cardamom story"} />
                    <figcaption><PhotoCredit name={article.imageCredit} url={article.imageCreditUrl} /></figcaption>
                </figure>
                <div className="article-body">
                    <p className="article-opening">{article.excerpt}</p>
                    {article.sections.map((section) => (
                        <section key={section.heading}>
                            <h2>{section.heading}</h2>
                            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                        </section>
                    ))}
                    <Link className="editorial-text-link" to="/blogs">More from the journal <ArrowLeft size={16} /></Link>
                </div>
            </article>
        </main>
    );
};

export default BlogDetailPage;
