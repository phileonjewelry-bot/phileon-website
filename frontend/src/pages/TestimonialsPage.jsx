import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '@/lib/api';

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await publicApi.getTestimonials();
        setTestimonials(response.data);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <div className="min-h-screen pt-24" data-testid="testimonials-page">
      {/* Hero */}
      <section className="section-padding bg-phileon-black text-center">
        <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Testimonials</p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-[0.1em] text-phileon-ivory">
          Client Stories
        </h1>
        <div className="luxury-line mx-auto my-8" />
        <p className="max-w-2xl mx-auto text-phileon-ivory-muted">
          The greatest reward is seeing our creations become part of our clients' 
          most treasured moments. Here are some of their stories.
        </p>
      </section>

      {/* Testimonials Grid */}
      <section className="section-padding bg-phileon-near-black">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner" />
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, idx) => (
                <div 
                  key={testimonial.id}
                  className={`bg-phileon-charcoal p-8 lg:p-10 ${
                    idx === 0 ? 'md:col-span-2' : ''
                  }`}
                  data-testid={`testimonial-item-${testimonial.id}`}
                >
                  <div className="flex items-start gap-4">
                    <span className="font-serif text-5xl text-phileon-gold leading-none">"</span>
                    <div className="flex-1">
                      <p className={`text-phileon-ivory leading-relaxed ${
                        idx === 0 ? 'text-lg md:text-xl' : ''
                      }`}>
                        {testimonial.quote}
                      </p>
                      
                      {testimonial.story && (
                        <p className="mt-6 text-phileon-ivory-muted text-sm leading-relaxed">
                          {testimonial.story}
                        </p>
                      )}
                      
                      <div className="mt-8 pt-6 border-t border-phileon-charcoal/50">
                        <p className="font-serif text-phileon-gold tracking-wider">
                          {testimonial.client_name}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-phileon-ivory-muted">
                          {testimonial.client_location && (
                            <span>{testimonial.client_location}</span>
                          )}
                          {testimonial.client_location && testimonial.product_type && (
                            <span>•</span>
                          )}
                          {testimonial.product_type && (
                            <span>{testimonial.product_type}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-phileon-ivory-muted text-lg">
                Client stories coming soon
              </p>
              <p className="text-phileon-ivory-muted text-sm mt-2">
                We're collecting testimonials from our valued clients
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-phileon-black text-center border-t border-phileon-charcoal">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl tracking-[0.1em] text-phileon-ivory">
            Create Your Own Story
          </h2>
          <p className="mt-4 text-phileon-ivory-muted">
            Join our community of clients who wear their stories with pride.
          </p>
          <Link to="/custom-design" className="btn-primary mt-8 inline-block" data-testid="testimonials-cta">
            Begin Your Journey
          </Link>
        </div>
      </section>
    </div>
  );
};

export default TestimonialsPage;
