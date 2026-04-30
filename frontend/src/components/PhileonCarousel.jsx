import { useRef } from "react";
import { Link } from "react-router-dom";
import { products } from "@/data/products";

const carouselItems = [
  { name: "DRAPE", slug: "drape", image: products.drape?.imageUrl, tagline: "The dress left. The bones remain." },
  { name: "LE COCKTAIL DE JESSICA", slug: "le-cocktail-de-jessica", image: products.cocktailJessica?.imageUrl, tagline: "In rest." },
  { name: "COOGI I", slug: "coogi-i", image: products.coogiI?.imageUrl },
  { name: "THE BAMBURGH", slug: "the-bamburgh", image: products.bamburgh?.imageUrl },
  { name: "LADY BAMBURGH", slug: "lady-bamburgh", image: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ulu0v463_1000146371.png" },
  { name: "FONDO CURVO", slug: "fondo-curvo", image: products.fondoCurvo?.imageUrl, tagline: "Says everything to those who see it. Says nothing to those who don't." },
  { name: "LA MARVA", slug: "la-marva", image: products.laMarva?.imageUrl },
  { name: "CYPHER", slug: "cypher", image: products.cypher?.imageUrl },
  { name: "BOUND", slug: "bound", image: products.bound?.imageUrl },
  { name: "LA BETE", slug: "labete", image: products.labete?.imageUrl },
  { name: "BLESSED", slug: "blessed", image: products.blessed?.imageUrl },
].filter(item => item.image);

export default function PhileonCarousel() {
  const scrollRef = useRef(null);

  return (
    <section className="w-full bg-black py-12 md:py-16">
      <div className="max-w-[1100px] mx-auto px-4">

        <h2 className="text-white text-xl tracking-[0.2em] mb-8">
          COLLECTION
        </h2>

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
        >
          {carouselItems.map((product, i) => (
            <Link
              to={`/products/${product.slug}`}
              key={i}
              className="min-w-[70%] md:min-w-[30%] snap-center group"
            >
              <div className="relative overflow-hidden rounded-[14px] bg-[#0a0a0a]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full aspect-square object-cover transition duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white text-sm tracking-wide">
                    {product.name}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
