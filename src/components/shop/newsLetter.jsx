import { useEffect, useState } from "react";
import { HOME_DATA_URL } from "../../config";
import "./newsLetter.css";

const Newsletter = () => {
    const [newsletter, setNewsletter] = useState(null);

    useEffect(() => {
        fetch(HOME_DATA_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load newsletter section.");
                }

                return response.json();
            })
            .then((data) => setNewsletter(data.newsletter || null))
            .catch((error) => {
                console.error("Newsletter section error:", error);
            });
    }, []);

    if (!newsletter) return null;

    return (
        <section
            className="newsletter"
            aria-labelledby="newsletter-heading"
        >
            <div className="newsletter__inner">

                {/* Envelope icon */}
                <div
                    className="newsletter__icon"
                    aria-hidden="true"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="50"
                        height="34"
                        viewBox="0 0 50 34"
                        fill="none"
                    >
                        <rect
                            x="1"
                            y="1"
                            width="48"
                            height="32"
                            stroke="currentColor"
                            strokeWidth="2"
                        />

                        <path
                            d="M2 3 L25 17 L48 3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                {/* Newsletter heading */}
                <h2 id="newsletter-heading">
                    {newsletter.heading}
                </h2>

                {/* Newsletter subscription form */}
                <form
                    className="newsletter__form"
                    onSubmit={(event) => event.preventDefault()}
                >
                    <label
                        className="newsletter__sr-only"
                        htmlFor="newsletter-email"
                    >
                        {newsletter.inputLabel || "Email address"}
                    </label>

                    <input
                        id="newsletter-email"
                        className="newsletter__input"
                        type="email"
                        name="email"
                        placeholder={
                            newsletter.placeholder || "Email address"
                        }
                        autoComplete="email"
                        required
                    />

                    <button
                        className="newsletter__button"
                        type="submit"
                    >
                        {newsletter.buttonText || "Subscribe"}
                    </button>
                </form>

            </div>
        </section>
    );
};

export default Newsletter;