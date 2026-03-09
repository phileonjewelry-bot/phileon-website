import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '@/lib/api';
import { ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqCategories = [
  { id: 'all', name: 'All Questions' },
  { id: 'process', name: 'Design Process' },
  { id: 'pricing', name: 'Pricing' },
  { id: 'timeline', name: 'Timeline' },
  { id: 'care', name: 'Care & Maintenance' },
  { id: 'general', name: 'General' },
];

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await publicApi.getFAQ();
        setFaqs(response.data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="min-h-screen pt-24" data-testid="faq-page">
      {/* Hero */}
      <section className="section-padding bg-phileon-black text-center">
        <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Support</p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-[0.1em] text-phileon-ivory">
          Frequently Asked Questions
        </h1>
        <div className="luxury-line mx-auto my-8" />
        <p className="max-w-2xl mx-auto text-phileon-ivory-muted">
          Find answers to common questions about our bespoke jewelry process, 
          pricing, timelines, and more.
        </p>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-phileon-near-black border-b border-phileon-charcoal">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-3">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 text-xs tracking-wider transition-colors ${
                  activeCategory === category.id
                    ? 'bg-phileon-gold text-phileon-black'
                    : 'bg-phileon-charcoal text-phileon-ivory-muted hover:text-phileon-ivory'
                }`}
                data-testid={`faq-category-${category.id}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="section-padding bg-phileon-near-black">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner" />
            </div>
          ) : filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFaqs.map((faq) => (
                <AccordionItem 
                  key={faq.id} 
                  value={faq.id}
                  className="border border-phileon-charcoal bg-phileon-charcoal/30"
                  data-testid={`faq-item-${faq.id}`}
                >
                  <AccordionTrigger className="px-6 py-5 text-left hover:no-underline group">
                    <span className="font-serif text-lg text-phileon-ivory group-hover:text-phileon-gold transition-colors pr-4">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 text-phileon-ivory-muted leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-20">
              <p className="text-phileon-ivory-muted text-lg">
                {activeCategory === 'all' 
                  ? 'FAQs coming soon' 
                  : 'No questions in this category yet'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="section-padding bg-phileon-black text-center border-t border-phileon-charcoal">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl tracking-[0.1em] text-phileon-ivory">
            Still Have Questions?
          </h2>
          <p className="mt-4 text-phileon-ivory-muted">
            We're here to help. Reach out and we'll get back to you within 24-48 hours.
          </p>
          <Link to="/contact" className="btn-primary mt-8 inline-block" data-testid="faq-contact-cta">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
