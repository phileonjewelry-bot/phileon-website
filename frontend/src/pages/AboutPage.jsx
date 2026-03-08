import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="min-h-screen pt-24" data-testid="about-page">
      {/* Hero */}
      <section className="relative py-24 lg:py-32">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?auto=format&fit=crop&w=2000&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Our Story</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-[0.1em] text-phileon-ivory leading-tight">
            Where Artistry<br />Meets Meaning
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-phileon-black">
        <div className="max-w-3xl mx-auto text-center">
          <div className="luxury-line mx-auto mb-12" />
          <p className="font-serif text-2xl md:text-3xl text-phileon-ivory leading-relaxed">
            Phileon was born from a simple belief: that the most precious jewelry 
            isn't just beautiful—it's meaningful.
          </p>
          <p className="mt-8 text-phileon-ivory-muted leading-relaxed">
            We founded Phileon with a vision to create jewelry that transcends 
            trends and captures the essence of life's most significant moments. 
            Our name draws from the Greek word for love—because at the heart of 
            every piece we create is a story of love, whether romantic, familial, 
            or self-affirming.
          </p>
          <p className="mt-6 text-phileon-ivory-muted leading-relaxed">
            Today, we continue this tradition, crafting bespoke jewelry that 
            becomes part of your legacy. Each piece is a collaboration between 
            our master artisans and your vision, resulting in jewelry that is 
            as unique as the story it tells.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-phileon-near-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Our Philosophy</p>
            <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-phileon-ivory">
              What We Believe
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {[
              {
                title: 'Craftsmanship Over Speed',
                description: 'We never rush excellence. Each piece takes the time it needs to achieve perfection, with master artisans dedicating their expertise to every detail.',
              },
              {
                title: 'Story Over Status',
                description: 'While we use the finest materials, our focus is on meaning. We believe the value of jewelry lies in the story it carries, not just its carat weight.',
              },
              {
                title: 'Collaboration Over Convention',
                description: 'Your vision guides our craft. We don\'t impose styles—we listen, advise, and create pieces that authentically represent your personal aesthetic.',
              },
              {
                title: 'Legacy Over Trend',
                description: 'We design for generations, not seasons. Our pieces are meant to be treasured, worn, and passed down as family heirlooms.',
              },
            ].map((value, idx) => (
              <div key={idx} className="border-l border-phileon-gold pl-8">
                <h3 className="font-serif text-xl tracking-[0.08em] text-phileon-ivory mb-4">
                  {value.title}
                </h3>
                <p className="text-phileon-ivory-muted leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials */}
      <section className="section-padding bg-phileon-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Materials</p>
              <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-phileon-ivory mb-6">
                Only the Finest
              </h2>
              <p className="text-phileon-ivory-muted leading-relaxed mb-6">
                We source our materials with the same care we bring to our craft. 
                From ethically sourced diamonds to recycled precious metals, every 
                component meets our uncompromising standards for quality and responsibility.
              </p>
              <ul className="space-y-3">
                {[
                  '18K and 22K Gold',
                  'Platinum and Palladium',
                  'Conflict-free Diamonds',
                  'Rare Colored Gemstones',
                  'Ethically Sourced Pearls',
                ].map((material, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-phileon-ivory">
                    <span className="w-2 h-px bg-phileon-gold" />
                    {material}
                  </li>
                ))}
              </ul>
              <Link to="/craftsmanship" className="btn-outline mt-8 inline-block" data-testid="about-craftsmanship-link">
                Learn About Our Craft
              </Link>
            </div>
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1200&q=80"
                alt="Fine materials"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-phileon-near-black text-center border-t border-phileon-charcoal">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl tracking-[0.1em] text-phileon-ivory">
            Let's Create Together
          </h2>
          <p className="mt-4 text-phileon-ivory-muted">
            We'd love to hear your story and help bring your vision to life.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/custom-design" className="btn-primary" data-testid="about-custom-cta">
              Start Your Design
            </Link>
            <Link to="/contact" className="btn-outline" data-testid="about-contact-cta">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
