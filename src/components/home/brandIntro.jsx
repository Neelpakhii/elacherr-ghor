import "./brandIntro.css";

const BrandIntro = () => {
    return (
        <section className="brand-intro" aria-labelledby="brand-intro-title">
            <div className="brand-intro__content">
                <h1 id="brand-intro-title">
                    What makes Elacher Ghor Cardamom Truly Special?
                </h1>

                <p>
                    Alleppey Green, the Green Gold of India’s spice hills, is a
                    global benchmark for exceptional cardamom, treasured for
                    its distinctive aroma, quality, and provenance. For
                    generations, the finest cardamom has been carefully
                    selected and graded through Alleppey.
                </p>

                <p>
                    Elacher Ghor carries this legacy forward, selecting
                    exceptional cardamom and sealing its precious aroma.
                    Experience the aroma and flavour that make Elacher Ghor
                    Alleppey Green Cardamoms truly special.
                </p>

                <a
                    className="brand-intro__link"
                >
                    Facts about cardamom that may surprise you
                    <span aria-hidden="true"> →</span>
                </a>
            </div>
        </section>
    );
};

export default BrandIntro;
