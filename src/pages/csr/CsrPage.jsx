import { ArrowRight, HeartHandshake, Leaf, UsersRound } from "lucide-react";
import PhotoCredit from "../../components/editorial/PhotoCredit.jsx";
import useEditorialData from "../../hooks/useEditorialData.js";
import "../editorial.css";

const icons = [UsersRound, HeartHandshake, Leaf];

const CsrPage = () => {
    const { data, error } = useEditorialData();
    const page = data?.csrPage;

    if (error) return <main className="editorial-message" role="alert">{error}</main>;
    if (!page) return <main className="editorial-message" aria-live="polite">Loading our commitments…</main>;

    return (
        <main className="editorial-page csr-page">
            <header className="csr-hero">
                <img src={page.heroImage} alt={page.heroImageAlt} />
                <div className="csr-hero__shade" />
                <div className="csr-hero__copy">
                    <h1>{page.title}</h1>
                    <p>{page.description}</p>
                    <a className="editorial-button editorial-button--light" href="#our-commitments">
                        What guides us <ArrowRight size={17} />
                    </a>
                    <PhotoCredit name={page.heroImageCredit} url={page.heroImageCreditUrl} note={page.imageNote} />
                </div>
            </header>

            <section className="csr-intro editorial-section" id="our-commitments">
                <div className="csr-intro__mark" aria-hidden="true">EG</div>
                <div className="csr-intro__copy">
                    <p className="editorial-eyebrow editorial-eyebrow--green">The way we see it</p>
                    <h2>{page.introTitle}</h2>
                    <p>{page.introText}</p>
                </div>
            </section>

            <section className="csr-commitments">
                <div className="csr-commitments__heading">
                    <p className="editorial-eyebrow">Our priorities</p>
                    <h2>Care, in the places it matters.</h2>
                </div>
                <div className="csr-commitment-grid">
                    {page.commitments.map((item, index) => {
                        const Icon = icons[index] || Leaf;
                        return (
                            <article className="csr-commitment" key={item.number}>
                                <div className="csr-commitment__top"><span>{item.number}</span><Icon size={24} strokeWidth={1.5} /></div>
                                <h3>{item.title}</h3>
                                <p>{item.text}</p>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="csr-community editorial-section">
                <div className="csr-community__image">
                    <img src={page.communityImage} alt={page.communityImageAlt} loading="lazy" />
                    <PhotoCredit name={page.communityImageCredit} url={page.communityImageCreditUrl} note={page.communityImageNote} />
                </div>
                <div className="csr-community__copy">
                    <p className="editorial-eyebrow editorial-eyebrow--green">Our approach</p>
                    <h2>{page.communityTitle}</h2>
                    <p>{page.communityText}</p>
                    <div className="csr-quote-mark" aria-hidden="true">“</div>
                    <p className="csr-community__note">We will share verified work here as it takes shape.</p>
                </div>
            </section>

            <section className="csr-contact">
                <div>
                    <p className="editorial-eyebrow">A conversation can be a beginning</p>
                    <h2>{page.closingTitle}</h2>
                    <p>{page.closingText}</p>
                </div>
                <a className="editorial-button editorial-button--light" href={`mailto:${page.contactEmail}`}>
                    Talk with us <ArrowRight size={17} />
                </a>
            </section>
        </main>
    );
};

export default CsrPage;
