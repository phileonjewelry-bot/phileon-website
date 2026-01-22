import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Shield, Award, Truck, RotateCcw, BadgeCheck, Heart, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { heroSlides, trustBadges, customerPhotos, products, certifications } from '../data/mockData';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const bestsellers = products.filter(p => p.bestseller);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const iconMap = {
    Shield: Shield,
    Award: Award,
    Truck: Truck,
    RotateCcw: RotateCcw,
    BadgeCheck: BadgeCheck,
    Heart: Heart
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Slider */}
      <section className="relative h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center text-center">
              <div className="max-w-3xl px-6">
                <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
                  {slide.title}
                </h1>
                <p className="text-2xl text-yellow-400 mb-8">{slide.subtitle}</p>
                <Link to="/products">
                  <Button
                    size="lg"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
                  >
                    {slide.cta}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-yellow-500/80 hover:bg-yellow-500 text-black p-3 rounded-full transition-all duration-300"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-yellow-500/80 hover:bg-yellow-500 text-black p-3 rounded-full transition-all duration-300"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-yellow-500 w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-black py-12 border-y border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {trustBadges.map((badge, index) => {
              const Icon = iconMap[badge.icon];
              return (
                <div key={index} className="flex items-center gap-4 text-white">
                  <div className="bg-yellow-500/10 p-3 rounded-lg">
                    <Icon className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{badge.title}</h3>
                    <p className="text-sm text-gray-400">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Jewelry Certifications & Proof */}
      <section className="bg-gradient-to-b from-black to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Certified Authenticity</h2>
            <p className="text-gray-400 text-lg">Every piece comes with official certification</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {certifications.map((cert, index) => {
              const Icon = iconMap[cert.icon];
              return (
                <Card key={index} className="bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="bg-yellow-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{cert.name}</h3>
                    <p className="text-gray-400 text-sm">{cert.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Photos Section */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Real People, Real Beauty</h2>
            <p className="text-gray-400 text-lg">See how our customers shine with Phileon</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customerPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-lg aspect-square cursor-pointer"
              >
                <img
                  src={photo.image}
                  alt={photo.customerName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="font-semibold text-lg mb-1">{photo.customerName}</p>
                    <p className="text-yellow-400 text-sm mb-1">{photo.productName}</p>
                    <p className="text-gray-300 text-xs">{photo.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">Bestsellers</h2>
              <p className="text-gray-400 text-lg">Customer favorites that define luxury</p>
            </div>
            <Link to="/products">
              <Button
                variant="outline"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all duration-300"
              >
                View All Products
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {bestsellers.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="bg-gray-900 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden aspect-square">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                        BESTSELLER
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="text-gray-400 text-sm ml-1">({product.reviews})</span>
                      </div>
                      <p className="text-yellow-500 font-bold text-xl">${product.price.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;