import Categories from "../components/HomeComponents/Categories/Categories.jsx";
import FeaturedProjects from "../components/HomeComponents/FeaturedProjects/FeaturedProjects.jsx";
import FinalCta from "../components/HomeComponents/FinalCta/FinalCta.jsx";
import Footer from "../components/HomeComponents/Footer/Footer.jsx";
import Hero from "../components/HomeComponents/Hero/Hero.jsx";
import HowItWorks from "../components/HomeComponents/HowItWorks/HowItWorks.jsx";
import Navbar from "../components/HomeComponents/Navbar/Navbar.jsx";
import SimpleAnalytics from "../components/HomeComponents/SimpleAnalytics/SimpleAnalytics.jsx";   


export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedProjects />
      <SimpleAnalytics />
      <HowItWorks />
      <FinalCta />
      <Footer />
    </>
  );
}