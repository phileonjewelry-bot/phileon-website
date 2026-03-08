import { Link } from 'react-router-dom';

const processSteps = [
  {
    number: '01',
    title: 'Discovery',
    subtitle: 'Understanding Your Vision',
    description: 'Every masterpiece begins with a conversation. We meet with you to understand your inspiration, preferences, and the story you want your jewelry to tell. Whether you have a clear vision or just the seed of an idea, we\'re here to listen and guide.',
    details: [
      'Initial consultation (in-person or virtual)',
      'Discussion of design preferences and inspirations',
      'Understanding the occasion and significance',
      'Budget and timeline considerations',
    ],
    duration: '1-2 weeks',
  },
  {
    number: '02',
    title: 'Design',
    subtitle: 'Bringing Ideas to Life',
    description: 'Our designers translate your vision into detailed sketches and 3D renderings. We explore different approaches, present options, and refine the design until it\'s exactly right. This collaborative phase ensures every detail reflects your personal style.',
    details: [
      'Hand sketches and digital renderings',
      'Material and gemstone selection',
      'Multiple design iterations',
      'Final design approval',
    ],
    duration: '2-4 weeks',
  },
  {
    number: '03',
    title: 'Creation',
    subtitle: 'Master Craftsmanship',
    description: 'With the design finalized, our master artisans bring your piece to life. Using time-honored techniques combined with precision modern methods, each element is crafted with meticulous attention to detail. Quality checks occur at every stage.',
    details: [
      'Material preparation and stone setting',
      'Hand fabrication by master jewelers',
      'Multiple quality inspections',
      'Progress updates throughout creation',
    ],
    duration: '4-8 weeks',
  },
  {
    number: '04',
    title: 'Perfection',
    subtitle: 'Final Touches',
    description: 'The finishing touches make all the difference. Polishing, setting adjustments, and final quality assurance ensure your piece meets our exacting standards. We prepare your jewelry with the presentation it deserves.',
    details: [
      'Final polishing and finishing',
      'Quality certification',
      'Custom packaging',
      'Care instructions and documentation',
    ],
    duration: '1-2 weeks',
  },
  {
    number: '05',
    title: 'Unveiling',
    subtitle: 'Your Moment',
    description: 'The reveal is a special moment. Whether picked up in our atelier or delivered to you, we ensure your first experience with your new piece is memorable. Welcome to a lifetime of enjoying your bespoke creation.',
    details: [
      'Personal presentation',
      'Sizing confirmation',
      'Care guidance',
      'Beginning of your jewelry journey',
    ],
    duration: 'Your special day',
  },
];

const ProcessPage = () => {
  return (
    <div className="min-h-screen pt-24" data-testid="process-page">
      {/* Hero */}
      <section className="section-padding bg-phileon-black text-center">
        <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">The Journey</p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-[0.1em] text-phileon-ivory">
          Our Design Process
        </h1>
        <div className="luxury-line mx-auto my-8" />
        <p className="max-w-2xl mx-auto text-phileon-ivory-muted leading-relaxed">
          Creating bespoke jewelry is an intimate collaboration. From your first 
          inspiration to the final unveiling, we guide you through every step 
          with care and expertise.
        </p>
      </section>

      {/* Timeline Overview */}
      <section className="py-16 bg-phileon-near-black">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <p className="font-serif text-3xl text-phileon-gold">8-16</p>
              <p className="text-xs text-phileon-ivory-muted tracking-wider mt-1">WEEKS TYPICAL</p>
            </div>
            <div className="hidden md:block w-px bg-phileon-charcoal" />
            <div>
              <p className="font-serif text-3xl text-phileon-gold">5</p>
              <p className="text-xs text-phileon-ivory-muted tracking-wider mt-1">KEY STAGES</p>
            </div>
            <div className="hidden md:block w-px bg-phileon-charcoal" />
            <div>
              <p className="font-serif text-3xl text-phileon-gold">1</p>
              <p className="text-xs text-phileon-ivory-muted tracking-wider mt-1">UNIQUE PIECE</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="section-padding bg-phileon-black">
        <div className="max-w-5xl mx-auto">
          {processSteps.map((step, idx) => (
            <div 
              key={step.number}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 ${
                idx !== processSteps.length - 1 ? 'pb-16 mb-16 border-b border-phileon-charcoal' : ''
              }`}
            >
              {/* Number */}
              <div className="lg:col-span-2">
                <span className="font-serif text-6xl lg:text-7xl text-phileon-charcoal">
                  {step.number}
                </span>
              </div>
              
              {/* Content */}
              <div className="lg:col-span-10">
                <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-2">
                  {step.subtitle}
                </p>
                <h2 className="font-serif text-3xl tracking-[0.1em] text-phileon-ivory mb-6">
                  {step.title}
                </h2>
                <p className="text-phileon-ivory-muted leading-relaxed mb-8">
                  {step.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {step.details.map((detail, detailIdx) => (
                    <div key={detailIdx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-phileon-gold mt-2 flex-shrink-0" />
                      <span className="text-sm text-phileon-ivory-muted">{detail}</span>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-phileon-gold tracking-wider">
                  Duration: {step.duration}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-phileon-near-black text-center border-t border-phileon-charcoal">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl tracking-[0.1em] text-phileon-ivory">
            Ready to Begin?
          </h2>
          <p className="mt-4 text-phileon-ivory-muted">
            Start your bespoke journey today. Share your vision with us.
          </p>
          <Link to="/custom-design" className="btn-primary mt-8 inline-block" data-testid="process-cta">
            Start Your Design
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ProcessPage;
