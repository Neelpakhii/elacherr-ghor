import { Link, useParams } from "react-router-dom";
import { ArrowRight, ChevronRight, Leaf, Mail, Phone } from "lucide-react";
import { getAppPath } from "../../config.js";
import NotFoundPage from "../notFound/NotFoundPage.jsx";
import "./informationPages.css";

const faqItems = [
    {
        question: "What do the cardamom grades mean?",
        answer: "The grade names describe pod size. Elacher Ghor’s product pages show the size range for each grade so you can choose what suits your kitchen.",
    },
    {
        question: "Does a different grade mean a different quality?",
        answer: "The grades are based on size. The website describes quality as consistent across its cardamom grades.",
    },
    {
        question: "How should I store cardamom?",
        answer: "Keep cardamom in a tightly closed container in a cool, dry place, away from direct sunlight and moisture.",
    },
    {
        question: "How can I use cardamom?",
        answer: "Cardamom can add fragrance to tea, desserts, and everyday cooking. Visit Recipes for ideas using Elacher Ghor cardamom.",
    },
    {
        question: "Does adding a product to my bag place an order?",
        answer: "No. The bag is stored in your browser and this website does not currently take checkout details or payment. Contact customer care to ask about purchasing a product.",
    },
    {
        question: "How can I contact customer care?",
        answer: "Email elacher@ghor.com or call +91 9835110687. For a purchase inquiry, include the product name and any order details you have.",
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
                <nav className="information-breadcrumb" aria-label="Breadcrumb">
                    <Link to={getAppPath("/")}>Home</Link><ChevronRight size={14} /><span>FAQs</span>
                </nav>
                <header className="information-header">
                    <p className="information-eyebrow"><Leaf size={14} /> Elacher Ghor · Help centre</p>
                    <h1 id="information-title">Frequently asked questions</h1>
                    <p>Helpful answers about our cardamom grades, using the website, and getting in touch.</p>
                </header>
                <div className="information-faq-list">
                    {faqItems.map((item, index) => (
                        <details className="information-faq" key={item.question} open={index === 0}>
                            <summary>{item.question}<span aria-hidden="true">+</span></summary>
                            <p>{item.answer}</p>
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
