import { Link } from 'react-router-dom';

/**
 * LaMarvaFlagship Component
 * 
 * Luxury editorial storytelling section for La Marva.
 * Two-column layout on desktop, stacks on mobile.
 * Large image on left, minimal text on right.
 */

export default function LaMarvaFlagship() {
  return (
    <section className="relative w-full bg-black text-white py-16 md:py-24 px-6">
      <div className="mx-auto max-w-[1600px]">
        
        {/* Two-column layout: Image left, Text right */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* LEFT: Large dominant ring image (60-70% width) */}
          <div className="w-full lg:w-[65%] flex-shrink-0">
            <Link to="/products/la-marva" className="block group">
              <div className="relative overflow-hidden rounded-2xl border border-white/10">
                <img
                  src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/m7k7yxis_1000138213.jpg"
                  alt="La Marva Ring"
                  className="w-full h-auto object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                />
              </div>
            </Link>
          </div>

          {/* RIGHT: Minimal text block (30-40% width) */}
          <div className="w-full lg:w-[35%] flex-shrink-0 space-y-8">
            
            {/* Title */}
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide">
                LA MARVA
              </h2>
              
              {/* Subtitle */}
              <p className="text-[#C6A24A] text-lg md:text-xl font-light tracking-wide">
                Built on strength. Designed with grace.
              </p>
            </div>

            {/* Story line */}
            <p className="text-white/70 text-lg md:text-xl leading-relaxed font-light">
              Named in honor of Marva Wilson, La Marva is a study in structure, softness, and presence.
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                to="/products/la-marva"
                className="inline-block bg-[#C6A24A] text-black px-8 py-4 rounded-md font-semibold tracking-wide hover:bg-[#D4B05E] transition-colors"
              >
                Discover La Marva
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
