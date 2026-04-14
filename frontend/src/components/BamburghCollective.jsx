import { Link } from "react-router-dom";

const BAMBURGH_IMG = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/q1n5n1fg_1000146370.png";
const LADY_BAMBURGH_IMG = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ulu0v463_1000146371.png";

const items = [
  { name: "THE BAMBURGH", image: BAMBURGH_IMG, href: "/products/the-bamburgh" },
  { name: "LADY BAMBURGH", image: LADY_BAMBURGH_IMG, href: "/products/lady-bamburgh" },
];

export default function BamburghCollective() {
  return (
    <section className="w-full bg-black py-20">
      <div className="max-w-[900px] mx-auto px-4">

        <p className="text-white/60 text-[10px] tracking-[0.35em] uppercase mb-8">
          Bamburgh Circle
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {items.map((item, i) => (
            <Link key={i} to={item.href} className="group">
              <div className="relative overflow-hidden rounded-[14px] bg-[#0a0a0a]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full aspect-square object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-white text-sm tracking-wide">{item.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
