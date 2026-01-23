import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { publicApi } from '@/lib/api';
import { Check, Upload, X, Image as ImageIcon } from 'lucide-react';

const steps = [
  { id: 1, title: 'Jewelry Type' },
  { id: 2, title: 'Inspiration' },
  { id: 3, title: 'Style' },
  { id: 4, title: 'Materials' },
  { id: 5, title: 'Budget' },
  { id: 6, title: 'Contact' },
];

const jewelryTypes = [
  { id: 'ring', name: 'Ring', description: 'Engagement, wedding, or statement rings' },
  { id: 'necklace', name: 'Necklace', description: 'Pendants, chains, and collars' },
  { id: 'bracelet', name: 'Bracelet', description: 'Bangles, cuffs, and tennis bracelets' },
  { id: 'earrings', name: 'Earrings', description: 'Studs, drops, and hoops' },
  { id: 'other', name: 'Other', description: 'Brooches, cufflinks, or custom pieces' },
];

const stylePreferences = [
  { id: 'classic', name: 'Classic', description: 'Timeless, elegant designs' },
  { id: 'modern', name: 'Modern', description: 'Clean lines, contemporary feel' },
  { id: 'vintage', name: 'Vintage', description: 'Art deco, Victorian inspired' },
  { id: 'minimalist', name: 'Minimalist', description: 'Simple, understated beauty' },
  { id: 'bold', name: 'Bold', description: 'Statement pieces that stand out' },
];

const materialOptions = {
  metals: [
    { id: '18k-yellow', name: '18K Yellow Gold' },
    { id: '18k-white', name: '18K White Gold' },
    { id: '18k-rose', name: '18K Rose Gold' },
    { id: 'platinum', name: 'Platinum' },
  ],
  stones: [
    { id: 'diamond', name: 'Diamond' },
    { id: 'sapphire', name: 'Sapphire' },
    { id: 'emerald', name: 'Emerald' },
    { id: 'ruby', name: 'Ruby' },
    { id: 'other-stone', name: 'Other gemstone' },
    { id: 'no-stone', name: 'No stones' },
  ],
  finishes: [
    { id: 'polished', name: 'High Polish' },
    { id: 'matte', name: 'Matte / Brushed' },
    { id: 'hammered', name: 'Hammered' },
    { id: 'mixed', name: 'Mixed finishes' },
  ],
};

const budgetRanges = [
  { id: '2k-5k', name: '$2,000 – $5,000' },
  { id: '5k-10k', name: '$5,000 – $10,000' },
  { id: '10k-25k', name: '$10,000 – $25,000' },
  { id: '25k-50k', name: '$25,000 – $50,000' },
  { id: '50k+', name: '$50,000+' },
  { id: 'undecided', name: 'Not sure yet' },
];

const CustomDesignPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inspirationImages, setInspirationImages] = useState([]);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    jewelryType: '',
    style: '',
    metal: '',
    stone: '',
    finish: '',
    budget: '',
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (inspirationImages.length + files.length > 5) {
      toast.error('Maximum 5 inspiration images allowed');
      return;
    }

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB per image.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setInspirationImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          url: event.target.result,
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setInspirationImages(prev => prev.filter(img => img.id !== id));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.jewelryType;
      case 2: return true; // Inspiration is optional
      case 3: return formData.style;
      case 4: return formData.metal && formData.finish;
      case 5: return formData.budget;
      case 6: return formData.name && formData.email;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const summary = `
Jewelry Type: ${jewelryTypes.find(t => t.id === formData.jewelryType)?.name}
Style: ${stylePreferences.find(s => s.id === formData.style)?.name}
Metal: ${materialOptions.metals.find(m => m.id === formData.metal)?.name}
Stone: ${materialOptions.stones.find(s => s.id === formData.stone)?.name || 'Not specified'}
Finish: ${materialOptions.finishes.find(f => f.id === formData.finish)?.name}
Budget: ${budgetRanges.find(b => b.id === formData.budget)?.name}
Inspiration Images: ${inspirationImages.length > 0 ? `${inspirationImages.length} uploaded` : 'None'}

Additional notes: ${formData.message || 'None'}
      `.trim();

      await publicApi.createInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        inquiry_type: 'custom_design',
        message: summary,
        budget_range: budgetRanges.find(b => b.id === formData.budget)?.name,
      });
      
      setSubmitted(true);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const SelectOption = ({ selected, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-6 text-left border transition-all duration-300 ${
        selected
          ? 'border-phileon-gold bg-phileon-gold/10'
          : 'border-phileon-charcoal hover:border-phileon-gold/50'
      }`}
    >
      {children}
    </button>
  );

  // Confirmation screen
  if (submitted) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-8" data-testid="custom-design-confirmation">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-phileon-gold/20 flex items-center justify-center">
            <Check className="text-phileon-gold" size={32} />
          </div>
          <h1 className="font-serif text-3xl tracking-[0.08em] text-phileon-ivory">
            Thank You
          </h1>
          <p className="mt-6 text-phileon-ivory-muted leading-relaxed">
            Your custom design inquiry has been received. Our team will review your 
            preferences and reach out within 24-48 hours to schedule your consultation.
          </p>
          <Link 
            to="/" 
            className="inline-block mt-10 px-10 py-4 border border-phileon-gold text-phileon-gold text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold hover:text-phileon-black"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24" data-testid="custom-design-page">
      {/* Hero */}
      <section className="py-16 lg:py-20 px-8 bg-phileon-black text-center">
        <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Bespoke</p>
        <h1 className="font-serif text-3xl md:text-4xl tracking-[0.08em] text-phileon-ivory">
          Custom Jewelry
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-phileon-ivory-muted leading-relaxed">
          Every piece begins with your vision. Our master artisans combine time-honored 
          craftsmanship with the finest materials to create jewelry that is uniquely yours.
        </p>
      </section>

      {/* Progress Steps */}
      <div className="bg-phileon-near-black border-y border-phileon-charcoal/50 py-6 px-8">
        <div className="max-w-3xl mx-auto flex justify-between">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`flex items-center gap-3 ${
                step.id === currentStep 
                  ? 'text-phileon-gold' 
                  : step.id < currentStep 
                    ? 'text-phileon-ivory-muted' 
                    : 'text-phileon-charcoal'
              }`}
            >
              <span className={`w-8 h-8 flex items-center justify-center text-sm border ${
                step.id === currentStep 
                  ? 'border-phileon-gold' 
                  : step.id < currentStep 
                    ? 'border-phileon-ivory-muted' 
                    : 'border-phileon-charcoal'
              }`}>
                {step.id < currentStep ? <Check size={14} /> : step.id}
              </span>
              <span className="hidden md:block text-xs tracking-wider">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <section className="py-16 lg:py-20 px-8 bg-phileon-black">
        <div className="max-w-3xl mx-auto">
          {/* Step 1: Jewelry Type */}
          {currentStep === 1 && (
            <div data-testid="step-1">
              <h2 className="font-serif text-2xl tracking-[0.08em] text-phileon-ivory mb-8">
                What type of jewelry are you envisioning?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jewelryTypes.map((type) => (
                  <SelectOption
                    key={type.id}
                    selected={formData.jewelryType === type.id}
                    onClick={() => setFormData({ ...formData, jewelryType: type.id })}
                  >
                    <p className="font-serif text-lg text-phileon-ivory">{type.name}</p>
                    <p className="text-sm text-phileon-ivory-muted mt-1">{type.description}</p>
                  </SelectOption>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Inspiration Images */}
          {currentStep === 2 && (
            <div data-testid="step-2">
              <h2 className="font-serif text-2xl tracking-[0.08em] text-phileon-ivory mb-4">
                Share your inspiration
              </h2>
              <p className="text-phileon-ivory-muted mb-8">
                Upload images that inspire your vision. These help our artisans understand your aesthetic.
              </p>

              {/* Upload Area */}
              <div 
                className="border-2 border-dashed border-phileon-charcoal hover:border-phileon-gold/50 transition-colors p-8 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  data-testid="inspiration-upload"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-phileon-charcoal flex items-center justify-center">
                    <Upload className="text-phileon-gold" size={24} />
                  </div>
                  <div>
                    <p className="text-phileon-ivory font-medium">Click to upload inspiration images</p>
                    <p className="text-sm text-phileon-ivory-muted mt-1">PNG, JPG up to 10MB each · Max 5 images</p>
                  </div>
                </div>
              </div>

              {/* Uploaded Images Preview */}
              {inspirationImages.length > 0 && (
                <div className="mt-8">
                  <p className="text-phileon-gold text-xs tracking-[0.2em] uppercase mb-4">
                    Uploaded ({inspirationImages.length}/5)
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {inspirationImages.map((img) => (
                      <div key={img.id} className="relative group aspect-square">
                        <img 
                          src={img.url} 
                          alt={img.name}
                          className="w-full h-full object-cover border border-phileon-charcoal"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(img.id);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <X size={16} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                          <p className="text-xs text-phileon-ivory truncate">{img.name}</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add more button */}
                    {inspirationImages.length < 5 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-phileon-charcoal hover:border-phileon-gold/50 flex flex-col items-center justify-center gap-2 transition-colors"
                      >
                        <ImageIcon className="text-phileon-charcoal" size={24} />
                        <span className="text-xs text-phileon-ivory-muted">Add more</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Skip note */}
              <p className="mt-8 text-center text-sm text-phileon-ivory-muted">
                This step is optional. You can continue without uploading images.
              </p>
            </div>
          )}

          {/* Step 3: Style */}
          {currentStep === 3 && (
            <div data-testid="step-2">
              <h2 className="font-serif text-2xl tracking-[0.08em] text-phileon-ivory mb-8">
                What style speaks to you?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stylePreferences.map((style) => (
                  <SelectOption
                    key={style.id}
                    selected={formData.style === style.id}
                    onClick={() => setFormData({ ...formData, style: style.id })}
                  >
                    <p className="font-serif text-lg text-phileon-ivory">{style.name}</p>
                    <p className="text-sm text-phileon-ivory-muted mt-1">{style.description}</p>
                  </SelectOption>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Materials */}
          {currentStep === 3 && (
            <div data-testid="step-3">
              <h2 className="font-serif text-2xl tracking-[0.08em] text-phileon-ivory mb-8">
                Select your materials
              </h2>
              
              <div className="mb-10">
                <p className="text-phileon-gold text-xs tracking-[0.2em] uppercase mb-4">Metal</p>
                <div className="grid grid-cols-2 gap-3">
                  {materialOptions.metals.map((metal) => (
                    <SelectOption
                      key={metal.id}
                      selected={formData.metal === metal.id}
                      onClick={() => setFormData({ ...formData, metal: metal.id })}
                    >
                      <p className="text-phileon-ivory">{metal.name}</p>
                    </SelectOption>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <p className="text-phileon-gold text-xs tracking-[0.2em] uppercase mb-4">Stones (optional)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {materialOptions.stones.map((stone) => (
                    <SelectOption
                      key={stone.id}
                      selected={formData.stone === stone.id}
                      onClick={() => setFormData({ ...formData, stone: stone.id })}
                    >
                      <p className="text-phileon-ivory text-sm">{stone.name}</p>
                    </SelectOption>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-phileon-gold text-xs tracking-[0.2em] uppercase mb-4">Finish</p>
                <div className="grid grid-cols-2 gap-3">
                  {materialOptions.finishes.map((finish) => (
                    <SelectOption
                      key={finish.id}
                      selected={formData.finish === finish.id}
                      onClick={() => setFormData({ ...formData, finish: finish.id })}
                    >
                      <p className="text-phileon-ivory">{finish.name}</p>
                    </SelectOption>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Budget */}
          {currentStep === 4 && (
            <div data-testid="step-4">
              <h2 className="font-serif text-2xl tracking-[0.08em] text-phileon-ivory mb-8">
                What is your budget range?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {budgetRanges.map((budget) => (
                  <SelectOption
                    key={budget.id}
                    selected={formData.budget === budget.id}
                    onClick={() => setFormData({ ...formData, budget: budget.id })}
                  >
                    <p className="text-phileon-ivory">{budget.name}</p>
                  </SelectOption>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Contact */}
          {currentStep === 5 && (
            <div data-testid="step-5">
              <h2 className="font-serif text-2xl tracking-[0.08em] text-phileon-ivory mb-8">
                How can we reach you?
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs tracking-[0.15em] text-phileon-ivory-muted uppercase mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-4 bg-phileon-charcoal border border-phileon-charcoal text-phileon-ivory focus:border-phileon-gold focus:outline-none transition-colors"
                    data-testid="contact-name"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.15em] text-phileon-ivory-muted uppercase mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-4 bg-phileon-charcoal border border-phileon-charcoal text-phileon-ivory focus:border-phileon-gold focus:outline-none transition-colors"
                    data-testid="contact-email"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.15em] text-phileon-ivory-muted uppercase mb-2">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-4 bg-phileon-charcoal border border-phileon-charcoal text-phileon-ivory focus:border-phileon-gold focus:outline-none transition-colors"
                    data-testid="contact-phone"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.15em] text-phileon-ivory-muted uppercase mb-2">
                    Additional notes (optional)
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-4 bg-phileon-charcoal border border-phileon-charcoal text-phileon-ivory focus:border-phileon-gold focus:outline-none transition-colors resize-none"
                    placeholder="Tell us more about your vision..."
                    data-testid="contact-message"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-12 pt-8 border-t border-phileon-charcoal/30">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-8 py-3 text-phileon-ivory-muted text-xs tracking-[0.15em] uppercase hover:text-phileon-gold transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                onClick={() => canProceed() && setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className={`px-10 py-4 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 ${
                  canProceed()
                    ? 'bg-phileon-gold text-phileon-black hover:bg-phileon-gold/90'
                    : 'bg-phileon-charcoal text-phileon-ivory-muted cursor-not-allowed'
                }`}
                data-testid="next-step"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className={`px-10 py-4 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 ${
                  canProceed() && !submitting
                    ? 'bg-phileon-gold text-phileon-black hover:bg-phileon-gold/90'
                    : 'bg-phileon-charcoal text-phileon-ivory-muted cursor-not-allowed'
                }`}
                data-testid="submit-inquiry"
              >
                {submitting ? 'Submitting...' : 'Book a Design Consultation'}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomDesignPage;
