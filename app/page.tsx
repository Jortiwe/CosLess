import Header from "../components/layout/Header";
import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import HomeIntro from "../components/home/HomeIntro";
import HomeProductRail from "../components/home/HomeProductRail";
import Footer from "../components/layout/Footer";

const offerProducts = [
  {
    title: "Oferta especial de cosplay fantasy",
    oldPrice: "Bs483,59",
    price: "Bs310,88",
    image: "/images/home/offer-1.png",
    href: "/productos",
    badge: "Oferta",
  },
  {
    title: "Cosplay en descuento limitado",
    oldPrice: "Bs566,49",
    price: "Bs407,60",
    image: "/images/home/offer-2.png",
    href: "/productos",
    badge: "Oferta",
  },
  {
    title: "Accesorios seleccionados en promoción",
    oldPrice: "Bs180,00",
    price: "Bs125,00",
    image: "/images/home/offer-3.png",
    href: "/productos",
    badge: "Promo",
  },
  {
    title: "Peluca edición especial",
    oldPrice: "Bs250,00",
    price: "Bs189,00",
    image: "/images/home/offer-4.png",
    href: "/productos",
    badge: "Oferta",
  },
];

const weeklyProducts = [
  {
    title: "Lanzamiento semanal de cosplay",
    price: "Desde Bs117,44",
    image: "/images/home/weekly-1.png",
    href: "/productos",
    badge: "Nuevo",
  },
  {
    title: "Nuevo outfit cosplay disponible",
    price: "Bs587,22",
    image: "/images/home/weekly-2.png",
    href: "/productos",
    badge: "Nuevo",
  },
  {
    title: "Nuevo ingreso de accesorios",
    price: "Desde Bs85,00",
    image: "/images/home/weekly-3.png",
    href: "/productos",
    badge: "Nuevo",
  },
  {
    title: "Cosplay bajo pedido semanal",
    price: "Consultar",
    image: "/images/home/weekly-4.png",
    href: "/productos",
    badge: "Preventa",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <div className="mx-auto max-w-[1380px] px-4 pb-6 pt-3 sm:px-6 sm:pt-4 lg:px-8">
        <Hero />

        <Categories />

        <HomeProductRail
          title="Ofertas"
          subtitle="Productos seleccionados con precios especiales."
          products={offerProducts}
          viewAllHref="/productos"
        />

        <HomeProductRail
          title="Nuevos semanales"
          subtitle="Ingresos recientes y productos destacados de la semana."
          products={weeklyProducts}
          viewAllHref="/productos"
        />

        <HomeIntro />
      </div>

      <Footer />
    </main>
  );
}