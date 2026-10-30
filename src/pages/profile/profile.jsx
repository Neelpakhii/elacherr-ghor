import Details from "../../components/profile/details.jsx";
import "./profile.css";

export default function Profile() {
    return (
        <section className="profile-page">
            <div className="profile-page__inner">
                <header className="profile-page__heading">
                    <p>YOUR LITTLE CORNER OF ELACHER GHOR</p>
                    <h1>My profile</h1>
                    <span>A place for your details, your bag, and your next kitchen discovery.</span>
                </header>
                <Details />
            </div>
        </section>
    );
}
