import { Link } from "react-router-dom";
import "./notFound.css";

function NotFoundPage() {
  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <div className="not-found-page__art" aria-hidden="true">
        <span className="not-found-page__sun" />
        <span className="not-found-page__hill not-found-page__hill--back" />
        <span className="not-found-page__hill not-found-page__hill--front" />
        <span className="not-found-page__leaf not-found-page__leaf--one">✦</span>
        <span className="not-found-page__leaf not-found-page__leaf--two">✧</span>
      </div>

      <div className="not-found-page__content">
        <p className="not-found-page__code">404</p>
        <h1 id="not-found-title">This page wandered off the path.</h1>
        <p className="not-found-page__copy">
          We couldn’t find the page you were looking for. Let’s bring you back
          to the good things: warm spices, thoughtful stories, and recipes made
          to be shared.
        </p>
        <div className="not-found-page__actions">
          <Link className="not-found-page__button not-found-page__button--primary" to="/">
            Back to home
          </Link>
          <Link className="not-found-page__button not-found-page__button--secondary" to="/recipes">
            Explore recipes
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;
