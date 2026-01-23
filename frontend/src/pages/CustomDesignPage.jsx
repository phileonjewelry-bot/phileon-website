import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { publicApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CustomDesignPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    budget_range: '',
    timeline: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await publicApi.createInquiry({
        ...formData,
        inquiry_type: 'custom_design',
      });
      toast.success('Your custom design request has been submitted! We\'ll be in touch within 24-48 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        budget_range: '',
        timeline: '',
        message: '',
      });
    } catch (error) {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24" data-testid="custom-design-page">
      {/* Hero */}
      <section className="relative py-24 lg:py-32">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=2000&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Bespoke Service</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-[0.1em] text-phileon-ivory leading-tight">
            Create Your<br />
            <span className="text-gold-gradient">Masterpiece</span>
          </h1>
          <p className="mt-8 text-phileon-ivory-muted max-w-2xl mx-auto leading-relaxed">
            From the spark of an idea to the final polish, our bespoke service transforms 
            your vision into an extraordinary piece of jewelry that tells your unique story.
          </p>
        </div>
      </section>

      {/* Why Custom */}
      <section className="section-padding bg-phileon-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-phileon-ivory">
              Why Choose Bespoke?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'Uniquely Yours',
                description: 'No two custom pieces are alike. Your jewelry will be a one-of-a-kind creation that reflects your personal style and story.',
              },
              {
                title: 'Expert Craftsmanship',
                description: 'Our master artisans bring decades of experience to every piece, ensuring exceptional quality and attention to detail.',
              },
              {
                title: 'Meaningful Investment',
                description: 'Custom jewelry isn\'t just worn—it\'s treasured. Create an heirloom that carries significance for generations.',
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 border border-phileon-gold flex items-center justify-center">
                  <span className="font-serif text-2xl text-phileon-gold">{idx + 1}</span>
                </div>
                <h3 className="font-serif text-xl tracking-[0.08em] text-phileon-ivory mb-4">
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

      {/* The Process Preview */}
      <section className="section-padding bg-phileon-near-black">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Our Approach</p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-phileon-ivory">
            A Collaborative Journey
          </h2>
          <p className="mt-6 text-phileon-ivory-muted max-w-2xl mx-auto">
            Creating bespoke jewelry is an intimate process. We work closely with you 
            at every step, from initial concept to final creation.
          </p>
          <Link to="/process" className="btn-outline mt-8 inline-block" data-testid="view-process-link">
            Explore Our Full Process
          </Link>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="section-padding bg-phileon-black" id="inquiry-form">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Begin Your Journey</p>
            <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-phileon-ivory">
              Share Your Vision
            </h2>
            <p className="mt-4 text-phileon-ivory-muted">
              Tell us about your dream piece and we'll guide you through the rest.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="custom-design-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                  YOUR NAME *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12"
                  data-testid="custom-name"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                  EMAIL ADDRESS *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12"
                  data-testid="custom-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                  PHONE NUMBER
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12"
                  data-testid="custom-phone"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                  BUDGET RANGE
                </label>
                <Select 
                  value={formData.budget_range} 
                  onValueChange={(value) => setFormData({ ...formData, budget_range: value })}
                >
                  <SelectTrigger className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12" data-testid="custom-budget">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent className="bg-phileon-charcoal border-phileon-charcoal">
                    <SelectItem value="$2,000 - $5,000">$2,000 - $5,000</SelectItem>
                    <SelectItem value="$5,000 - $10,000">$5,000 - $10,000</SelectItem>
                    <SelectItem value="$10,000 - $25,000">$10,000 - $25,000</SelectItem>
                    <SelectItem value="$25,000 - $50,000">$25,000 - $50,000</SelectItem>
                    <SelectItem value="$50,000+">$50,000+</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                TIMELINE
              </label>
              <Select 
                value={formData.timeline} 
                onValueChange={(value) => setFormData({ ...formData, timeline: value })}
              >
                <SelectTrigger className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12" data-testid="custom-timeline">
                  <SelectValue placeholder="When do you need this piece?" />
                </SelectTrigger>
                <SelectContent className="bg-phileon-charcoal border-phileon-charcoal">
                  <SelectItem value="Within 3 months">Within 3 months</SelectItem>
                  <SelectItem value="3-6 months">3-6 months</SelectItem>
                  <SelectItem value="6-12 months">6-12 months</SelectItem>
                  <SelectItem value="No rush - take your time">No rush - take your time</SelectItem>
                  <SelectItem value="Special occasion (please specify)">Special occasion (please specify)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                YOUR VISION *
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                placeholder="Tell us about your dream piece. What type of jewelry? Any specific materials, stones, or design elements? Is this for a special occasion? Share as much or as little as you'd like—we're here to listen."
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory placeholder:text-phileon-ivory-muted/50 resize-none"
                data-testid="custom-message"
              />
            </div>

            <div className="text-center pt-4">
              <Button 
                type="submit" 
                disabled={submitting}
                className="btn-primary px-12"
                data-testid="submit-custom-design"
              >
                {submitting ? 'Submitting...' : 'Submit Your Vision'}
              </Button>
              <p className="mt-4 text-xs text-phileon-ivory-muted">
                We'll respond within 24-48 hours to schedule your consultation.
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default CustomDesignPage;
