import Header from "../components/layout/Header";
import Hero from "../components/home/Hero";
import HomeIntro from "../components/home/HomeIntro";
import Categories from "../components/home/Categories";
import Footer from "../components/layout/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <Hero />
        <HomeIntro />
        <Categories />
      </div>

      <Footer />
    </main>
  );
}