import { Link } from 'react-router-dom';

const CraftsmanshipPage = () => {
  return (
    <div className="min-h-screen pt-24" data-testid="craftsmanship-page">
      {/* Hero */}
      <section className="relative py-24 lg:py-32">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=2000&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Excellence</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-[0.1em] text-phileon-ivory leading-tight">
            Care & Craftsmanship
          </h1>
          <p className="mt-8 text-phileon-ivory-muted max-w-2xl mx-auto">
            The art of fine jewelry requires not only exceptional creation but 
            also thoughtful care. Learn about our materials and how to preserve 
            your treasured pieces.
          </p>
        </div>
      </section>

      {/* Materials Section */}
      <section className="section-padding bg-phileon-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Materials</p>
            <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-phileon-ivory">
              The Finest Elements
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Precious Metals',
                items: [
                  { name: '18K Yellow Gold', desc: 'Rich, warm tones with excellent durability' },
                  { name: '18K White Gold', desc: 'Modern elegance with rhodium finish' },
                  { name: '18K Rose Gold', desc: 'Romantic blush tones, increasingly rare' },
                  { name: 'Platinum', desc: 'The ultimate in purity and permanence' },
                ],
              },
              {
                title: 'Diamonds',
                items: [
                  { name: 'Conflict-Free', desc: 'Ethically sourced from certified suppliers' },
                  { name: 'GIA Certified', desc: 'Each stone graded by expert gemologists' },
                  { name: 'Hand-Selected', desc: 'Chosen for exceptional brilliance' },
                  { name: 'Custom Cut', desc: 'Tailored to maximize beauty' },
                ],
              },
              {
                title: 'Gemstones',
                items: [
                  { name: 'Sapphires', desc: 'From classic blue to rare padparadscha' },
                  { name: 'Emeralds', desc: 'Colombian and Zambian origins' },
                  { name: 'Rubies', desc: 'Burmese and Mozambique varieties' },
                  { name: 'Rare Stones', desc: 'Alexandrite, paraiba, and more' },
                ],
              },
            ].map((category, idx) => (
              <div key={idx} className="bg-phileon-charcoal p-8">
                <h3 className="font-serif text-xl tracking-[0.08em] text-phileon-gold mb-6">
                  {category.title}
                </h3>
                <ul className="space-y-4">
                  {category.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <p className="text-phileon-ivory text-sm">{item.name}</p>
                      <p className="text-phileon-ivory-muted text-xs mt-1">{item.desc}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Standards */}
      <section className="section-padding bg-phileon-near-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Standards</p>
            <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-phileon-ivory">
              Our Quality Promise
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Master Craftsmanship',
                description: 'Every piece is created by artisans with decades of experience, using techniques passed down through generations.',
              },
              {
                title: 'Rigorous Inspection',
                description: 'Multiple quality checks throughout creation ensure each piece meets our exacting standards before completion.',
              },
              {
                title: 'Ethical Sourcing',
                description: 'We work exclusively with certified suppliers who share our commitment to responsible practices.',
              },
              {
                title: 'Lifetime Support',
                description: 'Your relationship with Phileon extends beyond purchase. We offer cleaning, repairs, and resizing services.',
              },
            ].map((item, idx) => (
              <div key={idx} className="border-l border-phileon-gold pl-6">
                <h3 className="font-serif text-xl tracking-[0.08em] text-phileon-ivory mb-3">
                  {item.title}
                </h3>
                <p className="text-phileon-ivory-muted text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Care Guide */}
      <section className="section-padding bg-phileon-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Care Guide</p>
            <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-phileon-ivory">
              Preserving Your Jewelry
            </h2>
          </div>

          <div className="space-y-12">
            {[
              {
                title: 'Daily Care',
                tips: [
                  'Remove jewelry before showering, swimming, or exercising',
                  'Apply perfume, lotion, and hairspray before putting on jewelry',
                  'Wipe pieces gently with a soft cloth after wearing',
                  'Store pieces individually to prevent scratching',
                ],
              },
              {
                title: 'Cleaning',
                tips: [
                  'Clean gold and platinum with mild soap and warm water',
                  'Use a soft brush for intricate settings',
                  'Avoid harsh chemicals and ultrasonic cleaners for delicate stones',
                  'Professional cleaning recommended annually',
                ],
              },
              {
                title: 'Storage',
                tips: [
                  'Store in a fabric-lined jewelry box',
                  'Keep pieces in individual pouches or compartments',
                  'Avoid storing in humid areas',
                  'Keep diamonds separate from other pieces',
                ],
              },
              {
                title: 'Professional Maintenance',
                tips: [
                  'Annual inspection of prong settings',
                  'Professional polishing to restore luster',
                  'Rhodium replating for white gold (every 1-2 years)',
                  'Prompt repair of any loose stones or damaged clasps',
                ],
              },
            ].map((section, idx) => (
              <div key={idx}>
                <h3 className="font-serif text-xl tracking-[0.08em] text-phileon-gold mb-6">
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.tips.map((tip, tipIdx) => (
                    <div key={tipIdx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-phileon-gold mt-2 flex-shrink-0" />
                      <span className="text-phileon-ivory-muted text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service CTA */}
      <section className="section-padding bg-phileon-near-black text-center border-t border-phileon-charcoal">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl tracking-[0.1em] text-phileon-ivory">
            Need Servicing?
          </h2>
          <p className="mt-4 text-phileon-ivory-muted">
            Contact us to schedule cleaning, repairs, or resizing for your Phileon pieces.
          </p>
          <Link to="/contact" className="btn-primary mt-8 inline-block" data-testid="craftsmanship-contact-cta">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CraftsmanshipPage;
