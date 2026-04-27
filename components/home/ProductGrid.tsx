import ProductCard from "./ProductCard";

const demoProducts = [
  {
    name: "Peluca larga blanca premium",
    price: 180,
    image: "https://placehold.co/600x750?text=Peluca",
    status: "stock" as const,
    category: "Peluca",
  },
  {
    name: "Cosplay completo edición especial",
    price: 420,
    image: "https://placehold.co/600x750?text=Cosplay",
    status: "preventa" as const,
    category: "Cosplay",
  },
  {
    name: "Lentillas azules anime",
    price: 95,
    image: "https://placehold.co/600x750?text=Lentillas",
    status: "stock" as const,
    category: "Lentes",
  },
  {
    name: "Mallas elásticas para cosplay",
    price: 75,
    image: "https://placehold.co/600x750?text=Mallas",
    status: "stock" as const,
    category: "Mallas",
  },
];

export default function ProductGrid() {
  return (
    <section className="mt-12">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {demoProducts.map((product) => (
          <ProductCard
            key={product.name}
            name={product.name}
            price={product.price}
            image={product.image}
            status={product.status}
            category={product.category}
          />
        ))}
      </div>
    </section>
  );
}