import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Upload } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';

const CustomWizard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    productType: '',
    style: [],
    inspirationText: '',
    inspirationImage: null,
    metal: '',
    metalColor: '',
    stones: '',
    budget: '',
    name: '',
    email: '',
    phone: '',
    timeline: '',
    additionalNotes: ''
  });

  const totalSteps = 5;

  const productTypes = [
    { id: 'ring', name: 'Ring', emoji: '💍' },
    { id: 'chain', name: 'Chain', emoji: '⛓️' },
    { id: 'pendant', name: 'Pendant', emoji: '📿' },
    { id: 'earrings', name: 'Earrings', emoji: '👂' },
    { id: 'bracelet', name: 'Bracelet', emoji: '💎' },
    { id: 'not_sure', name: 'Not Sure Yet', emoji: '💭' }
  ];

  const styles = [
    { id: 'minimal', name: 'Minimal' },
    { id: 'bold', name: 'Bold' },
    { id: 'timeless', name: 'Timeless' },
    { id: 'statement', name: 'Statement' },
    { id: 'symbolic', name: 'Symbolic' }
  ];

  const metalTypes = [
    { id: '10k', name: '10K Gold' },
    { id: '14k', name: '14K Gold' },
    { id: '18k', name: '18K Gold' },
    { id: 'platinum', name: 'Platinum' }
  ];

  const metalColors = [
    { id: 'yellow', name: 'Yellow Gold' },
    { id: 'white', name: 'White Gold' },
    { id: 'rose', name: 'Rose Gold' }
  ];

  const stoneOptions = [
    { id: 'none', name: 'No Stones' },
    { id: 'lab_diamonds', name: 'Lab Diamonds' },
    { id: 'natural_diamonds', name: 'Natural Diamonds' },
    { id: 'color_stones', name: 'Color Stones' },
    { id: 'moissanite', name: 'Moissanite' },
    { id: 'cz', name: 'Cubic Zirconia' }
  ];

  const budgetRanges = [
    { id: 'under_1k', name: 'Under $1,000', value: '< $1,000' },
    { id: '1k_3k', name: '$1,000 - $3,000', value: '$1,000 - $3,000' },
    { id: '3k_5k', name: '$3,000 - $5,000', value: '$3,000 - $5,000' },
    { id: '5k_10k', name: '$5,000 - $10,000', value: '$5,000 - $10,000' },
    { id: 'over_10k', name: '$10,000+', value: '$10,000+' }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleStyleToggle = (styleId) => {
    setFormData(prev => ({
      ...prev,
      style: prev.style.includes(styleId)
        ? prev.style.filter(s => s !== styleId)
        : [...prev.style, styleId]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, inspirationImage: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Here you would send to backend/email
    toast({
      title: 'Request Submitted!',
      description: 'Our team will review your custom request and contact you within 24 hours.',
    });
    
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.productType !== '';
      case 2:
        return formData.style.length > 0;
      case 3:
        return formData.metal !== '' && formData.metalColor !== '' && formData.stones !== '';
      case 4:
        return formData.budget !== '';
      case 5:
        return formData.name !== '' && formData.email !== '';
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Step {currentStep} of {totalSteps}</span>
            <span className="text-gray-400 text-sm">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-8">
          {/* Step 1: Product Type */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-4xl font-serif font-light text-[#f5f5dc] mb-4">
                What are we making?
              </h2>
              <p className="text-gray-400 text-lg mb-12">Choose the type of jewelry you'd like to create</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {productTypes.map((type) => (
                  <Card
                    key={type.id}
                    onClick={() => setFormData({ ...formData, productType: type.id })}
                    className={`cursor-pointer transition-all duration-300 ${
                      formData.productType === type.id
                        ? 'bg-yellow-500/10 border-yellow-500'
                        : 'bg-[#0f0f0f] border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <CardContent className="p-8 text-center">
                      <div className="text-5xl mb-4">{type.emoji}</div>
                      <div className="text-[#f5f5dc] font-medium">{type.name}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Style & Inspiration */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-4xl font-serif font-light text-[#f5f5dc] mb-4">
                Style & Inspiration
              </h2>
              <p className="text-gray-400 text-lg mb-12">Select styles that resonate with you (multiple ok)</p>
              
              <div className="space-y-8">
                <div className="flex flex-wrap gap-4">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => handleStyleToggle(style.id)}
                      className={`px-8 py-4 rounded-full font-medium transition-all ${
                        formData.style.includes(style.id)
                          ? 'bg-yellow-500 text-black'
                          : 'bg-[#0f0f0f] text-gray-400 hover:text-[#f5f5dc] border border-gray-800'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[#f5f5dc] mb-3 text-lg">Tell us more (optional)</label>
                  <Textarea
                    value={formData.inspirationText}
                    onChange={(e) => setFormData({ ...formData, inspirationText: e.target.value })}
                    placeholder="Describe your vision, any special meaning, or references..."
                    className="bg-[#0f0f0f] border-gray-800 text-[#f5f5dc] min-h-[150px] focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-[#f5f5dc] mb-3 text-lg">Upload inspiration image (optional)</label>
                  <div className="border-2 border-dashed border-gray-800 rounded-lg p-12 text-center cursor-pointer hover:border-yellow-500 transition-colors"
                    onClick={() => document.getElementById('inspiration-upload').click()}
                  >
                    {formData.inspirationImage ? (
                      <img src={formData.inspirationImage} alt="Inspiration" className="max-h-64 mx-auto" />
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Click to upload reference image</p>
                      </div>
                    )}
                    <input
                      id="inspiration-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Materials */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-4xl font-serif font-light text-[#f5f5dc] mb-4">
                Materials
              </h2>
              <p className="text-gray-400 text-lg mb-12">Select your preferred materials</p>

              <div className="space-y-12">
                <div>
                  <label className="block text-[#f5f5dc] mb-6 text-xl font-light">Metal Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {metalTypes.map((metal) => (
                      <button
                        key={metal.id}
                        onClick={() => setFormData({ ...formData, metal: metal.id })}
                        className={`p-6 rounded-lg font-medium transition-all ${
                          formData.metal === metal.id
                            ? 'bg-yellow-500 text-black'
                            : 'bg-[#0f0f0f] text-gray-400 hover:text-[#f5f5dc] border border-gray-800'
                        }`}
                      >
                        {metal.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#f5f5dc] mb-6 text-xl font-light">Metal Color</label>
                  <div className="grid grid-cols-3 gap-4">
                    {metalColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setFormData({ ...formData, metalColor: color.id })}
                        className={`p-6 rounded-lg font-medium transition-all ${
                          formData.metalColor === color.id
                            ? 'bg-yellow-500 text-black'
                            : 'bg-[#0f0f0f] text-gray-400 hover:text-[#f5f5dc] border border-gray-800'
                        }`}
                      >
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#f5f5dc] mb-6 text-xl font-light">Stones/Gems</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {stoneOptions.map((stone) => (
                      <button
                        key={stone.id}
                        onClick={() => setFormData({ ...formData, stones: stone.id })}
                        className={`p-6 rounded-lg font-medium transition-all ${
                          formData.stones === stone.id
                            ? 'bg-yellow-500 text-black'
                            : 'bg-[#0f0f0f] text-gray-400 hover:text-[#f5f5dc] border border-gray-800'
                        }`}
                      >
                        {stone.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Budget */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-4xl font-serif font-light text-[#f5f5dc] mb-4">
                Budget Range
              </h2>
              <p className="text-gray-400 text-lg mb-12">Help us understand your investment level</p>
              <div className="space-y-4">
                {budgetRanges.map((range) => (
                  <Card
                    key={range.id}
                    onClick={() => setFormData({ ...formData, budget: range.value })}
                    className={`cursor-pointer transition-all duration-300 ${
                      formData.budget === range.value
                        ? 'bg-yellow-500/10 border-yellow-500'
                        : 'bg-[#0f0f0f] border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <CardContent className="p-6 flex items-center justify-between">
                      <span className="text-[#f5f5dc] text-xl font-light">{range.name}</span>
                      {formData.budget === range.value && (
                        <Check className="w-6 h-6 text-yellow-500" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Contact Info */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-4xl font-serif font-light text-[#f5f5dc] mb-4">
                Almost There
              </h2>
              <p className="text-gray-400 text-lg mb-12">How can we reach you?</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-[#f5f5dc] mb-3 text-lg">Full Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[#0f0f0f] border-gray-800 text-[#f5f5dc] py-6 text-lg focus:border-yellow-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-[#f5f5dc] mb-3 text-lg">Email Address *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-[#0f0f0f] border-gray-800 text-[#f5f5dc] py-6 text-lg focus:border-yellow-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-[#f5f5dc] mb-3 text-lg">Phone Number (optional)</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-[#0f0f0f] border-gray-800 text-[#f5f5dc] py-6 text-lg focus:border-yellow-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-[#f5f5dc] mb-3 text-lg">Timeline</label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full bg-[#0f0f0f] border border-gray-800 text-[#f5f5dc] py-6 px-4 text-lg focus:border-yellow-500 rounded-md"
                  >
                    <option value="">Select timeline</option>
                    <option value="flexible">Flexible / No Rush</option>
                    <option value="4-6_weeks">4-6 Weeks</option>
                    <option value="rush">Rush (2-3 Weeks)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#f5f5dc] mb-3 text-lg">Additional Notes (optional)</label>
                  <Textarea
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    placeholder="Any other details we should know?"
                    className="bg-[#0f0f0f] border-gray-800 text-[#f5f5dc] min-h-[120px] focus:border-yellow-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-16 flex items-center justify-between">
          <Button
            onClick={handleBack}
            disabled={currentStep === 1}
            variant="outline"
            className="border-gray-800 text-gray-400 hover:text-[#f5f5dc] hover:bg-[#0f0f0f] py-6 px-8 rounded-none disabled:opacity-30"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-yellow-500 hover:bg-yellow-600 text-black py-6 px-8 rounded-none disabled:opacity-30"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed()}
              className="bg-yellow-500 hover:bg-yellow-600 text-black py-6 px-8 rounded-none disabled:opacity-30"
            >
              Submit Request
              <Check className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomWizard;