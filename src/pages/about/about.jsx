import AboutImage from "../../components/about/aboutimage"
import Award from "../../components/about/award";
import CertifyBest from "../../components/about/certifyBest";
import Origin from "../../components/about/origin";
import Pioneer from "../../components/about/pioneer";
import Story from "../../components/about/story";
import ThreeStar from "../../components/about/threeStar";
import Newsletter from "../../components/home/newsLetter";
import WorldBestCardamom from "../../components/home/worldBestCardamom";

const About = ()=>{
    return(
        <div className="about-page">
            <AboutImage/>
            <Origin/>
            <Award/>
            <Story/>
            <Pioneer/>
            <CertifyBest/>
            <ThreeStar/>
            <WorldBestCardamom/>
            <Newsletter/>
        </div>
    )
}
export default About;
