import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorks from "./components/HowItWorks";
import CTAStrip from "./components/CTAStrip";
import Footer from "./components/Footer";
import "./HomePage.css";

export default function HomePage({ onNavigate, currentUser, onLogout }) {
  return (
    <>
      <Navbar onNavigate={onNavigate} currentUser={currentUser} onLogout={onLogout} />
      <Hero onNavigate={onNavigate} />
      <FeaturesSection />
      <HowItWorks />
      <CTAStrip onNavigate={onNavigate} />
      <Footer />
    </>
  );
}
