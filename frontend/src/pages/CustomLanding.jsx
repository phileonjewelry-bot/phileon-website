import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Award, Clock, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const CustomLanding = () => {
  const pastWork = [
    { id: 1, image: 'https://images.pexels.com/photos/14823622/pexels-photo-14823622.jpeg', title: 'Custom Diamond Ring' },
    { id: 2, image: 'https://images.unsplash.com/photo-1605100804567-1ffe942b5cd6', title: 'Bespoke Gold Chain' },
    { id: 3, image: 'https://images.pexels.com/photos/3641059/pexels-photo-3641059.jpeg', title: 'Personalized Bracelet' },
    { id: 4, image: 'https://images.unsplash.com/photo-1588814096146-e7c56156f9f8', title: 'Statement Necklace' },
    { id: 5, image: 'https://images.pexels.com/photos/2735981/pexels-photo-2735981.jpeg', title: 'Custom Wedding Bands' },
    { id: 6, image: 'https://images.unsplash.com/photo-1583095880514-777b51b6c771', title: 'Unique Pendant' },
  ];

  const steps = [
    { step: '01', title: 'Share Your Vision', description: 'Tell us what you want to create' },
    { step: '02', title: 'Design Consultation', description: 'We craft initial concepts' },
    { step: '03', title: 'Approval & Creation', description: 'Your piece comes to life' },
    { step: '04', title: 'Delivery', description: 'Receive your unique treasure' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-8">
            <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          </div>
          <h1 className="text-6xl md:text-7xl font-serif font-light text-[#f5f5dc] mb-8 leading-tight">
            Your story.
            <br />
            <span className="text-yellow-500">Crafted in gold.</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform your memories, milestones, and dreams into one-of-a-kind jewelry pieces.
            Each design is uniquely yours.
          </p>
          <Link to="/custom/start">
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-12 py-8 text-lg rounded-none"
            >
              Begin Your Custom Journey
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-serif font-light text-[#f5f5dc] text-center mb-20">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {steps.map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-8">
                  <div className="text-7xl font-serif text-yellow-500/20 mb-4">
                    {item.step}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-12 w-24 h-px bg-yellow-500/20" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-[#f5f5dc] mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Custom Work Gallery */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-light text-[#f5f5dc] mb-6">
              Recent Custom Creations
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Every piece tells a unique story. See what we've crafted for others.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pastWork.map((work) => (
              <div
                key={work.id}
                className="group relative overflow-hidden aspect-square cursor-pointer"
              >
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-[#f5f5dc] text-lg font-light">{work.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6 bg-[#0f0f0f]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <Award className="w-12 h-12 text-yellow-500 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-[#f5f5dc] mb-3">Master Craftsmanship</h3>
              <p className="text-gray-400">40+ years combined experience</p>
            </div>
            <div className="text-center">
              <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-[#f5f5dc] mb-3">4-6 Week Turnaround</h3>
              <p className="text-gray-400">Rush orders available</p>
            </div>
            <div className="text-center">
              <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-[#f5f5dc] mb-3">Lifetime Guarantee</h3>
              <p className="text-gray-400">We stand behind our work</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-serif font-light text-[#f5f5dc] mb-8 leading-tight">
            Ready to create something extraordinary?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            It takes just 5 minutes to share your vision with us.
          </p>
          <Link to="/custom/start">
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-12 py-8 text-lg rounded-none"
            >
              Start Your Custom Request
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CustomLanding;