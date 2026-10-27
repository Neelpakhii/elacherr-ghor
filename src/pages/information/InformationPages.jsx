import { Link, useParams } from "react-router-dom";
import { ArrowRight, ChevronRight, Leaf, Mail, Phone } from "lucide-react";
import { getAppPath } from "../../config.js";
import NotFoundPage from "../notFound/NotFoundPage.jsx";
import "./informationPages.css";

const faqItems = [
    {
        question: "What is Elacher Ghor’s Aroma-Lock Pack, and why does it matter?",
        answer: "Cardamom’s signature fragrance comes from the natural oils inside each pod. Elacher Ghor’s resealable Aroma-Lock packaging is designed to help protect that aroma between uses. Close the pack after opening to help keep the cardamom fresh.",
        video: "ZG5toIfI0uU",
    },
    {
        question: "Why choose branded cardamom instead of loose pods?",
        answer: "Branded packs make it easier to identify the grade and check the product information on the label. Elacher Ghor selects and grades cardamom by pod size, helping you choose a pack that suits the way you cook.",
        video: "gm3CCtznbZ0",
    },
    {
        question: "Does Elacher Ghor cardamom contain additives?",
        answer: "Elacher Ghor presents its cardamom as 100% natural. Check the ingredients and product details printed on your pack for the information that applies to the specific product you have purchased.",
        video: "cJukGtkotjk",
    },
    {
        question: "What makes Alleppey Green Cardamom distinctive?",
        answer: "Growing conditions in the Alleppey region contribute to the character of its green cardamom. Elacher Ghor’s About page shares more about the region and its Geographical Indication recognition.",
        video: "fE74nLSkFHA",
    },
    {
        question: "Why are Elacher Ghor cardamom packs different colours?",
        answer: "The colours help identify the grade and pod-size range. Purple, pink, green, orange, and red packs represent different sizes; check each product listing for its exact range. Pod size can vary naturally, while the characteristic cardamom flavour comes from its aromatic seeds.",
        video: "am3hVLKzTAA",
    },
    {
        question: "Which cardamom grade should I choose?",
        answer: "Choose a grade based on the pod size and how you plan to use it. Larger grades work well when you want whole pods to stand out in tea, desserts, or cooking; other sizes may suit grinding and blends. Compare the grade details on the Shop page.",
        video: "PCiu7hCo-6U",
    },
    {
        question: "How should I store cardamom to keep its aroma?",
        answer: "Close the resealable pack after each use and store it in a cool, dry place away from heat, sunlight, and moisture. This helps protect the cardamom’s natural fragrance.",
        video: "mduJOBhteSs",
    },
    {
        question: "Why can cardamom pods lose their green colour?",
        answer: "Cardamom’s colour can change naturally over time. A change in appearance does not by itself tell you everything about freshness; keep the pack sealed and check the aroma and the product’s best-before information.",
        video: "04WgN67E_8k",
    },
    {
        question: "Why are the pods in a pack not all exactly the same size?",
        answer: "Cardamom is graded by size, but it is a natural agricultural product and individual pods can still vary. The grade description gives you the intended size range for the pack.",
        video: "4ziTlfKpZx4",
    },
];

const policies = {
    "refund-policy": {
        title: "Return and refund policy",
        eyebrow: "Customer care",
        intro: "We want you to feel confident when you choose Elacher Ghor. The current website does not take payments or complete online orders, so return and refund requests cannot be submitted through the shopping bag.",
        sections: [
            {
                title: "If you have a concern about a purchase",
                paragraphs: [
                    "If you bought directly from Elacher Ghor, contact customer care with your purchase details and a clear description of the issue. The team can review the request and confirm the options and any applicable terms for that purchase.",
                    "If you purchased from another shop or marketplace, please contact that seller first, as its return process may apply.",
                ],
            },
            {
                title: "What to include",
                paragraphs: ["Share the product name, purchase date, seller or order reference, and photos if the item arrived damaged or incorrect. Please do not send payment card details."],
            },
        ],
    },
    "privacy-policy": {
        title: "Privacy policy",
        eyebrow: "Your information",
        intro: "This notice describes the current Elacher Ghor website. It is a static storefront and does not connect to an account, checkout, or payment service.",
        sections: [
            {
                title: "Shopping bag and browser storage",
                paragraphs: ["Products you add to your bag are saved in your browser’s local storage on this device. The bag is not sent to an Elacher Ghor order database, and clearing this browser’s site data may remove it."],
            },
            {
                title: "Forms and contacting us",
                paragraphs: ["The newsletter form on this website is not connected to a subscription service and does not submit your email address. Email and telephone links open the relevant app on your device; information you choose to send is handled through that service."],
            },
            {
                title: "Questions",
                paragraphs: ["For questions about information you have shared with Elacher Ghor outside this website, contact customer care directly."],
            },
        ],
    },
    "terms-of-service": {
        title: "Terms of service",
        eyebrow: "Using this website",
        intro: "This website provides information about Elacher Ghor cardamom, recipes, stories, and community initiatives, along with a browser-based shopping bag.",
        sections: [
            {
                title: "Product information and availability",
                paragraphs: ["Product descriptions, images, grades, prices, and availability are shown for information. They may change. Please confirm current product details and availability with customer care before arranging a purchase."],
            },
            {
                title: "Shopping bag and orders",
                paragraphs: ["Adding a product to the bag does not place an order, reserve stock, or submit payment. The current website has no online checkout or order service. Any purchase arranged directly with Elacher Ghor is subject to the details confirmed by customer care."],
            },
            {
                title: "Questions",
                paragraphs: ["For help using the website or questions about a purchase, email elacher@ghor.com or call +91 9835110687."],
            },
        ],
    },
    "shipping-policy": {
        title: "Shipping policy",
        eyebrow: "Delivery information",
        intro: "The current website does not collect delivery addresses or create online orders. Shipping details therefore need to be confirmed directly when arranging a purchase.",
        sections: [
            {
                title: "Availability, fees, and delivery estimates",
                paragraphs: ["Contact customer care to confirm whether delivery is available for your location, the applicable shipping fee, and the estimated delivery time for your purchase. These details can depend on the product and destination."],
            },
            {
                title: "Need help?",
                paragraphs: ["Email elacher@ghor.com or call +91 9835110687 with your location and the product you are interested in. Do not share payment card details by email or telephone."],
            },
        ],
    },
};

const ContactCard = () => (
    <aside className="information-contact" aria-label="Customer care contact details">
        <div className="information-contact__copy">
            <p className="information-eyebrow">We’re here to help</p>
            <h2>Talk to customer care</h2>
            <p>For product and purchase questions, contact the Elacher Ghor team.</p>
        </div>
        <div className="information-contact__actions">
            <a href="mailto:elacher@ghor.com"><Mail size={17} /> elacher@ghor.com</a>
            <a href="tel:+919835110687"><Phone size={17} /> +91 9835110687</a>
        </div>
    </aside>
);

export function FaqPage() {
    return (
        <section className="information-page" aria-labelledby="information-title">
            <div className="information-page__inner">
                <header className="information-header">
                    <p className="information-eyebrow"><Leaf size={14} /> Elacher Ghor · Help centre</p>
                    <h1 id="information-title">Frequently asked questions</h1>
                    <p>From choosing a cardamom grade to keeping its aroma fresh, find helpful answers about Elacher Ghor and our products.</p>
                </header>
                <div className="information-faq-list">
                    {faqItems.map((item, index) => (
                        <details className="information-faq" key={item.question} open={index === 0}>
                            <summary>{item.question}<span aria-hidden="true">+</span></summary>
                            <p>{item.answer}</p>
                            {item.video && (
                                <div className="information-faq__video">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${item.video}`}
                                        title={`Elacher Ghor FAQ video: ${item.question}`}
                                        loading="lazy"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                    <a href={`https://www.youtube.com/watch?v=${item.video}`} target="_blank" rel="noreferrer">
                                        Open video on YouTube
                                    </a>
                                </div>
                            )}
                        </details>
                    ))}
                </div>
                <ContactCard />
            </div>
        </section>
    );
}

export function PolicyPage() {
    const { policyId } = useParams();
    const page = policies[policyId];

    if (!page) return <NotFoundPage />;

    return (
        <section className="information-page" aria-labelledby="information-title">
            <div className="information-page__inner">
                <nav className="information-breadcrumb" aria-label="Breadcrumb">
                    <Link to={getAppPath("/")}>Home</Link><ChevronRight size={14} /><span>Legal policies</span><ChevronRight size={14} /><span>{page.title}</span>
                </nav>
                <header className="information-header">
                    <p className="information-eyebrow"><Leaf size={14} /> Elacher Ghor · {page.eyebrow}</p>
                    <h1 id="information-title">{page.title}</h1>
                    <p>{page.intro}</p>
                </header>
                <div className="information-policy-content">
                    {page.sections.map((section) => (
                        <section className="information-policy-section" key={section.title}>
                            <h2>{section.title}</h2>
                            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                        </section>
                    ))}
                </div>
                <ContactCard />
                <Link className="information-back-link" to={getAppPath("/")}>Back to home <ArrowRight size={16} /></Link>
            </div>
        </section>
    );
}
