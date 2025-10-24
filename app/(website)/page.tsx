
import HeroSection from './home/hero-section'
import FeaturesSection from './home/features-section';
import AboutSection from './home/about-section';
import AppDownloadSection from './home/app-download-section';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <AppDownloadSection />
    </main>
  );
}