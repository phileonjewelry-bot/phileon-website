import { useState } from 'react';
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
import { MapPin, Mail, Phone, Clock } from 'lucide-react';

const ContactPage = () => {
  const [formType, setFormType] = useState('inquiry'); // 'inquiry' or 'consultation'
  const [submitting, setSubmitting] = useState(false);
  
  const [inquiryData, setInquiryData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [consultationData, setConsultationData] = useState({
    name: '',
    email: '',
    phone: '',
    preferred_date: '',
    preferred_time: '',
    consultation_type: '',
    interest: '',
    message: '',
  });

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await publicApi.createInquiry({
        ...inquiryData,
        inquiry_type: 'general',
      });
      toast.success('Message sent successfully! We\'ll respond within 24-48 hours.');
      setInquiryData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await publicApi.createConsultation(consultationData);
      toast.success('Consultation request submitted! We\'ll confirm your appointment shortly.');
      setConsultationData({
        name: '',
        email: '',
        phone: '',
        preferred_date: '',
        preferred_time: '',
        consultation_type: '',
        interest: '',
        message: '',
      });
    } catch (error) {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24" data-testid="contact-page">
      {/* Hero */}
      <section className="section-padding bg-phileon-black text-center">
        <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Contact</p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-[0.1em] text-phileon-ivory">
          Get in Touch
        </h1>
        <div className="luxury-line mx-auto my-8" />
        <p className="max-w-2xl mx-auto text-phileon-ivory-muted">
          Whether you have a question about our pieces, want to discuss a custom design, 
          or would like to schedule a consultation, we're here to help.
        </p>
      </section>

      {/* Contact Info + Form */}
      <section className="section-padding bg-phileon-near-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="font-serif text-2xl tracking-[0.1em] text-phileon-ivory mb-8">
                Visit Us
              </h2>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <MapPin className="text-phileon-gold flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-phileon-ivory">Phileon Atelier</p>
                    <p className="text-phileon-ivory-muted text-sm mt-1">
                      By Appointment Only
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Mail className="text-phileon-gold flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-phileon-ivory">Email</p>
                    <a 
                      href="mailto:hello@phileon.com" 
                      className="text-phileon-ivory-muted text-sm mt-1 hover:text-phileon-gold transition-colors"
                    >
                      hello@phileon.com
                    </a>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Phone className="text-phileon-gold flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-phileon-ivory">Phone</p>
                    <p className="text-phileon-ivory-muted text-sm mt-1">
                      Available by appointment
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Clock className="text-phileon-gold flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-phileon-ivory">Response Time</p>
                    <p className="text-phileon-ivory-muted text-sm mt-1">
                      Within 24-48 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-2">
              {/* Form Type Toggle */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setFormType('inquiry')}
                  className={`px-6 py-3 text-sm tracking-wider transition-colors ${
                    formType === 'inquiry'
                      ? 'bg-phileon-gold text-phileon-black'
                      : 'bg-phileon-charcoal text-phileon-ivory hover:bg-phileon-charcoal/80'
                  }`}
                  data-testid="inquiry-tab"
                >
                  Send a Message
                </button>
                <button
                  onClick={() => setFormType('consultation')}
                  className={`px-6 py-3 text-sm tracking-wider transition-colors ${
                    formType === 'consultation'
                      ? 'bg-phileon-gold text-phileon-black'
                      : 'bg-phileon-charcoal text-phileon-ivory hover:bg-phileon-charcoal/80'
                  }`}
                  data-testid="consultation-tab"
                >
                  Book a Consultation
                </button>
              </div>

              {/* Inquiry Form */}
              {formType === 'inquiry' && (
                <form onSubmit={handleInquirySubmit} className="space-y-6" data-testid="inquiry-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                        YOUR NAME *
                      </label>
                      <Input
                        value={inquiryData.name}
                        onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                        required
                        className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12"
                        data-testid="inquiry-name-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                        EMAIL ADDRESS *
                      </label>
                      <Input
                        type="email"
                        value={inquiryData.email}
                        onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                        required
                        className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12"
                        data-testid="inquiry-email-input"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                      PHONE NUMBER
                    </label>
                    <Input
                      type="tel"
                      value={inquiryData.phone}
                      onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                      className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12"
                      data-testid="inquiry-phone-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                      YOUR MESSAGE *
                    </label>
                    <Textarea
                      value={inquiryData.message}
                      onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                      required
                      rows={6}
                      placeholder="How can we help you?"
                      className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory placeholder:text-phileon-ivory-muted/50 resize-none"
                      data-testid="inquiry-message-input"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="btn-primary"
                    data-testid="submit-inquiry-btn"
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}

              {/* Consultation Form */}
              {formType === 'consultation' && (
                <form onSubmit={handleConsultationSubmit} className="space-y-6" data-testid="consultation-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                        YOUR NAME *
                      </label>
                      <Input
                        value={consultationData.name}
                        onChange={(e) => setConsultationData({ ...consultationData, name: e.target.value })}
                        required
                        className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12"
                        data-testid="consult-name-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                        EMAIL ADDRESS *
                      </label>
                      <Input
                        type="email"
                        value={consultationData.email}
                        onChange={(e) => setConsultationData({ ...consultationData, email: e.target.value })}
                        required
                        className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12"
                        data-testid="consult-email-input"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                      PHONE NUMBER *
                    </label>
                    <Input
                      type="tel"
                      value={consultationData.phone}
                      onChange={(e) => setConsultationData({ ...consultationData, phone: e.target.value })}
                      required
                      className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12"
                      data-testid="consult-phone-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                        PREFERRED DATE *
                      </label>
                      <Input
                        type="date"
                        value={consultationData.preferred_date}
                        onChange={(e) => setConsultationData({ ...consultationData, preferred_date: e.target.value })}
                        required
                        className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12"
                        data-testid="consult-date-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                        PREFERRED TIME *
                      </label>
                      <Select 
                        value={consultationData.preferred_time}
                        onValueChange={(value) => setConsultationData({ ...consultationData, preferred_time: value })}
                        required
                      >
                        <SelectTrigger className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12" data-testid="consult-time-select">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent className="bg-phileon-charcoal border-phileon-charcoal">
                          <SelectItem value="Morning (9AM - 12PM)">Morning (9AM - 12PM)</SelectItem>
                          <SelectItem value="Afternoon (12PM - 4PM)">Afternoon (12PM - 4PM)</SelectItem>
                          <SelectItem value="Evening (4PM - 7PM)">Evening (4PM - 7PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                        CONSULTATION TYPE *
                      </label>
                      <Select 
                        value={consultationData.consultation_type}
                        onValueChange={(value) => setConsultationData({ ...consultationData, consultation_type: value })}
                        required
                      >
                        <SelectTrigger className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12" data-testid="consult-type-select">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-phileon-charcoal border-phileon-charcoal">
                          <SelectItem value="in_person">In-Person</SelectItem>
                          <SelectItem value="virtual">Virtual (Video Call)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                        INTEREST *
                      </label>
                      <Select 
                        value={consultationData.interest}
                        onValueChange={(value) => setConsultationData({ ...consultationData, interest: value })}
                        required
                      >
                        <SelectTrigger className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12" data-testid="consult-interest-select">
                          <SelectValue placeholder="What interests you?" />
                        </SelectTrigger>
                        <SelectContent className="bg-phileon-charcoal border-phileon-charcoal">
                          <SelectItem value="rings">Rings</SelectItem>
                          <SelectItem value="necklaces">Necklaces</SelectItem>
                          <SelectItem value="bracelets">Bracelets</SelectItem>
                          <SelectItem value="heirloom">Heirloom Pieces</SelectItem>
                          <SelectItem value="custom">Custom Design</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                      ADDITIONAL NOTES
                    </label>
                    <Textarea
                      value={consultationData.message}
                      onChange={(e) => setConsultationData({ ...consultationData, message: e.target.value })}
                      rows={4}
                      placeholder="Tell us more about what you're looking for..."
                      className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory placeholder:text-phileon-ivory-muted/50 resize-none"
                      data-testid="consult-message-input"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="btn-primary"
                    data-testid="submit-consultation-btn"
                  >
                    {submitting ? 'Submitting...' : 'Request Consultation'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
