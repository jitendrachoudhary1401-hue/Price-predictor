"use client";

import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Ruler, Bath, Hash, ArrowUp, Calendar, CarFront, Calculator, Loader2 } from 'lucide-react';

const LOCATIONS = [
  "Airoli", "Belapur", "Cbd Belapur", "Ghansoli", "Kharghar",
  "Nerul", "Panvel", "Ulwe", "Vashi", "Sanpada", "Seawoods", "Kopar Khairane"
];

const getImageSet = (bhk: number) => {
  if (bhk === 1) {
    return {
      exterior: "https://images.unsplash.com/photo-1560448075-81676dfb37c8?auto=format&fit=crop&w=400&q=80",
      interior: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=400&q=80",
      bedroom: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80"
    };
  } else if (bhk === 2) {
    return {
      exterior: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80",
      interior: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80",
      bedroom: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=400&q=80"
    };
  } else if (bhk === 3) {
    return {
      exterior: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80",
      interior: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=400&q=80",
      bedroom: "https://images.unsplash.com/photo-1536349788264-1b816dfddcf8?auto=format&fit=crop&w=400&q=80"
    };
  } else {
    return {
      exterior: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80",
      interior: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=400&q=80",
      bedroom: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=400&q=80"
    }
  }
};

const THOUGHTS = [
  {
    quote: "Ninety percent of all millionaires become so through owning real estate.",
    author: "Andrew Carnegie",
    subtext: "Discover the true potential of Navi Mumbai's booming property market. As the city expands, so does your wealth."
  },
  {
    quote: "Location is the foundation of real estate value.",
    author: "Industry Adage",
    subtext: "From the bustling tech hubs of Airoli to the serene landscapes of Kharghar, Navi Mumbai offers diverse pockets of high-growth investments."
  },
  {
    quote: "Buy land, they're not making it anymore.",
    author: "Mark Twain",
    subtext: "Premium plot locations are scarce. With upcoming transport hubs, secure your future value in Navi Mumbai today."
  },
  {
    quote: "Don't wait to buy real estate. Buy real estate and wait.",
    author: "Will Rogers",
    subtext: "Time in the market beats timing the market. Let our advanced AI models guide your entry point with precision."
  },
  {
    quote: "The best investment on earth is earth.",
    author: "Louis Glickman",
    subtext: "Data-driven insights for fundamentally solid investments. We analyze over 50 data points to predict accurate property valuations."
  },
  {
    quote: "Price is what you pay. Value is what you get.",
    author: "Warren Buffett",
    subtext: "Ensure you never overpay. Our predictive models balance amenities, age, and location to find true market value."
  }
];

export default function Home() {
  const [formData, setFormData] = useState({
    Location: 'Kharghar',
    Area_sqft: 1000,
    BHK: 2,
    Bathrooms: 2,
    Floor: 5,
    Total_Floors: 15,
    Age_of_Property: 5,
    Parking: 1,
    Lift: 1
  });

  const [shopFormData, setShopFormData] = useState({
    Location: 'Vashi',
    Area_sqft: 500,
    Floor: 0,
    Total_Floors: 5,
    Age_of_Property: 5,
    Parking: 1,
    Main_Road_Facing: 1
  });

  const [predictorMode, setPredictorMode] = useState<'house' | 'shop'>('house');

  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeThought, setActiveThought] = useState(0);
  const [showPredictor, setShowPredictor] = useState(false);
  const [smallThoughtIndex, setSmallThoughtIndex] = useState(0);

  // Simple scroll spy effect for thoughts
  useEffect(() => {
    const handleScroll = () => {
      // If predictor is shown, we might not want to obsessively track thoughts
      // but keeping it doesn't hurt.
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      // Roughly calculate which thought is in view based on scroll position
      const newActive = Math.min(
        THOUGHTS.length - 1,
        Math.max(0, Math.floor((scrollY + windowHeight / 2) / windowHeight))
      );
      setActiveThought(newActive);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showPredictor) {
      interval = setInterval(() => {
        setSmallThoughtIndex(prev => (prev + 1) % THOUGHTS.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [showPredictor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Location' ? value : Number(value)
    }));
  };

  const handleShopInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShopFormData(prev => ({
      ...prev,
      [name]: name === 'Location' ? value : Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPredictedPrice(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      if (predictorMode === 'shop') {
        // Mock prediction for shop as backend might not support it yet
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Simple mock logic: base price 15000 per sqft + premium for main road / ground floor
        let baseRate = 15000;
        if (shopFormData.Location === 'Vashi' || shopFormData.Location === 'Nerul') baseRate += 5000;
        if (shopFormData.Main_Road_Facing === 1) baseRate *= 1.2;
        if (shopFormData.Floor === 0) baseRate *= 1.3;

        const mockPrice = shopFormData.Area_sqft * baseRate;
        setPredictedPrice(mockPrice);
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to reach the prediction service.');
      }

      const data = await response.json();
      setPredictedPrice(data.predicted_price_inr);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <main className="relative bg-slate-950 font-sans text-slate-200 overflow-x-hidden">
      {/* Fixed Dynamic Background Elements */}
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80')] bg-cover bg-center bg-no-repeat opacity-[0.15] z-0"></div>
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none z-0"></div>
      <div className="fixed inset-0 backdrop-blur-[2px] z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-screen-2xl mx-auto flex flex-col lg:flex-row min-h-screen">

        {/* Scrollytelling Narrative */}
        <div className={`w-full relative py-20 px-4 sm:px-12 transition-all duration-1000 ${showPredictor ? 'lg:w-5/12 hidden lg:flex flex-col justify-start pt-32 min-h-screen lg:sticky lg:top-0' : 'max-w-4xl mx-auto'}`}>
          {!showPredictor ? (
            <>
              {THOUGHTS.map((thought, index) => (
                <div
                  key={index}
                  className={`h-screen flex flex-col justify-center transition-all duration-1000 ease-in-out ${activeThought === index
                    ? 'opacity-100 translate-y-0 scale-100 filter-none'
                    : 'opacity-10 translate-y-12 scale-95 blur-[2px]'
                    }`}
                >
                  <div className="relative">
                    <span className="absolute -left-8 -top-8 text-7xl text-emerald-500/20 font-serif leading-none">"</span>
                    <h2 className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 drop-shadow-sm pb-4 leading-tight relative z-10 text-5xl md:text-6xl xl:text-7xl">
                      {thought.quote}
                    </h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mb-6"></div>
                    <p className="text-emerald-400 font-medium tracking-wide text-2xl">— {thought.author}</p>
                    <p className="mt-6 text-slate-400 font-light leading-relaxed max-w-2xl text-xl md:text-2xl">
                      {thought.subtext}
                    </p>

                    {/* Predict Button on Last Thought */}
                    {index === THOUGHTS.length - 1 && (
                      <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                        <button
                          onClick={() => {
                            setShowPredictor(true);
                            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                          }}
                          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-emerald-500 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 hover:bg-emerald-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/30 active:translate-y-0"
                        >
                          <Calculator className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                          Start Your Prediction
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-xl"></div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* Subtle scroll indicator */}
              {activeThought < THOUGHTS.length - 1 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-emerald-500/50">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Scroll</span>
                  <div className="w-px h-8 bg-gradient-to-b from-emerald-500/50 to-transparent"></div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full max-w-lg mx-auto animate-in fade-in slide-in-from-left-8 duration-1000 hidden lg:block">
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 to-cyan-500"></div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                <span className="absolute left-6 -top-4 text-9xl text-emerald-500/10 font-serif leading-none select-none border-none">"</span>

                <div className="relative z-10 min-h-[220px] flex flex-col justify-center transition-all duration-500" key={smallThoughtIndex}>
                  <h3 className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 drop-shadow-sm pb-4 leading-tight text-2xl lg:text-3xl xl:text-4xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {THOUGHTS[smallThoughtIndex].quote}
                  </h3>
                  <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mb-4 animate-in fade-in duration-700"></div>
                  <p className="text-emerald-400 font-medium tracking-wide text-sm md:text-base lg:text-lg animate-in fade-in duration-700 delay-100">— {THOUGHTS[smallThoughtIndex].author}</p>
                  <p className="mt-4 text-slate-400 font-light leading-relaxed text-sm lg:text-base animate-in fade-in duration-700 delay-200">
                    {THOUGHTS[smallThoughtIndex].subtext}
                  </p>
                </div>

                <div className="flex gap-2 mt-10 justify-start items-center relative z-10">
                  {THOUGHTS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSmallThoughtIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${idx === smallThoughtIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-700 hover:bg-slate-500'}`}
                      aria-label={`Go to thought ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Predictor Form */}
        <div className={`w-full py-12 px-4 sm:px-6 lg:px-12 xl:px-20 min-h-screen flex items-center transition-all duration-1000 min-w-0 ${showPredictor ? 'lg:w-7/12 opacity-100 translate-x-0' : 'hidden opacity-0 translate-x-[100%]'}`}>
          <div className="w-full max-w-3xl mx-auto space-y-10">
            <div className="text-center lg:text-left animate-in fade-in slide-in-from-top-10 duration-1000">
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold tracking-wider backdrop-blur-md shadow-[0_0_15px_rgba(52,211,153,0.15)] uppercase">
                Intelligent Valuation
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-2">
                Navi Mumbai <br className="hidden lg:block" /> AI Predictor
              </h1>
              <p className="text-slate-400 text-base md:text-lg font-light max-w-lg mx-auto lg:mx-0">
                Input your property details and let our machine learning model calculate a precise market estimate.
              </p>
            </div>

            {/* Predictor Type Toggle */}
            <div className="flex bg-slate-900/80 p-1.5 rounded-2xl mb-2 w-fit mx-auto lg:mx-0 border border-slate-700/50 shadow-inner">
              <button
                onClick={() => { setPredictorMode('house'); setPredictedPrice(null); setError(''); }}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${predictorMode === 'house' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-900 shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              >
                House Predictor
              </button>
              <button
                onClick={() => { setPredictorMode('shop'); setPredictedPrice(null); setError(''); }}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${predictorMode === 'shop' ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              >
                Shop Predictor
              </button>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden transition-all duration-700 hover:border-emerald-500/20">
              <div className="p-6 md:p-10 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10 text-left">
                  {predictorMode === 'house' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">

                      {/* Location */}
                      <div className="space-y-2 group/input">
                        <label htmlFor="Location" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-emerald-400 transition-colors">
                          <MapPin className="w-3.5 h-3.5 mr-2" />
                          Location
                        </label>
                        <div className="relative">
                          <select
                            id="Location"
                            name="Location"
                            value={formData.Location}
                            onChange={handleInputChange}
                            className="appearance-none block w-full bg-slate-950/50 border border-slate-700/50 text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner cursor-pointer transition-all"
                            required
                          >
                            {LOCATIONS.map(loc => (
                              <option key={loc} value={loc} className="bg-slate-900">{loc}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-400/50 group-hover/input:text-emerald-400 transition-colors">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                          </div>
                        </div>
                      </div>

                      {/* Area Sqft */}
                      <div className="space-y-2 group/input">
                        <label htmlFor="Area_sqft" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-emerald-400 transition-colors">
                          <Ruler className="w-3.5 h-3.5 mr-2" />
                          Carpet Area (Sq.Ft.)
                        </label>
                        <input
                          type="number"
                          id="Area_sqft"
                          name="Area_sqft"
                          min="100"
                          value={formData.Area_sqft || ''}
                          onChange={handleInputChange}
                          className="block w-full bg-slate-950/50 border border-slate-700/50 text-white text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner placeholder-slate-600 transition-all focus:-translate-y-0.5"
                          placeholder="e.g. 1000"
                          required
                        />
                      </div>

                      {/* BHK */}
                      <div className="space-y-2 group/input">
                        <label htmlFor="BHK" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-emerald-400 transition-colors">
                          <Building2 className="w-3.5 h-3.5 mr-2" />
                          BHK Config
                        </label>
                        <input
                          type="number"
                          id="BHK"
                          name="BHK"
                          min="1"
                          max="10"
                          value={formData.BHK || ''}
                          onChange={handleInputChange}
                          className="block w-full bg-slate-950/50 border border-slate-700/50 text-white text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner placeholder-slate-600 transition-all focus:-translate-y-0.5"
                          placeholder="e.g. 2"
                          required
                        />
                      </div>

                      {/* Bathrooms */}
                      <div className="space-y-2 group/input">
                        <label htmlFor="Bathrooms" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-emerald-400 transition-colors">
                          <Bath className="w-3.5 h-3.5 mr-2" />
                          Bathrooms
                        </label>
                        <input
                          type="number"
                          id="Bathrooms"
                          name="Bathrooms"
                          min="1"
                          max="10"
                          value={formData.Bathrooms || ''}
                          onChange={handleInputChange}
                          className="block w-full bg-slate-950/50 border border-slate-700/50 text-white text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner placeholder-slate-600 transition-all focus:-translate-y-0.5"
                          required
                        />
                      </div>

                      {/* Floor & Total Floors combined */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 group/input relative">
                          <label htmlFor="Floor" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-emerald-400 transition-colors">
                            <Hash className="w-3.5 h-3.5 mr-1" />
                            Floor Level
                          </label>
                          <input
                            type="number"
                            id="Floor"
                            name="Floor"
                            min="0"
                            value={formData.Floor}
                            onChange={handleInputChange}
                            className="block w-full bg-slate-950/50 border border-slate-700/50 text-white text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner transition-all focus:-translate-y-0.5"
                            required
                          />
                        </div>
                        <div className="space-y-2 group/input">
                          <label htmlFor="Total_Floors" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-emerald-400 transition-colors">
                            <ArrowUp className="w-3.5 h-3.5 mr-1" />
                            Total Floors
                          </label>
                          <input
                            type="number"
                            id="Total_Floors"
                            name="Total_Floors"
                            min="1"
                            value={formData.Total_Floors || ''}
                            onChange={handleInputChange}
                            className="block w-full bg-slate-950/50 border border-slate-700/50 text-white text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner transition-all focus:-translate-y-0.5"
                            required
                          />
                        </div>
                      </div>

                      {/* Age of Property */}
                      <div className="space-y-2 group/input">
                        <label htmlFor="Age_of_Property" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-emerald-400 transition-colors">
                          <Calendar className="w-3.5 h-3.5 mr-2" />
                          Age (Years)
                        </label>
                        <input
                          type="number"
                          id="Age_of_Property"
                          name="Age_of_Property"
                          min="0"
                          value={formData.Age_of_Property}
                          onChange={handleInputChange}
                          className="block w-full bg-slate-950/50 border border-slate-700/50 text-white text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner transition-all focus:-translate-y-0.5"
                          required
                        />
                      </div>

                      {/* Parking & Lift */}
                      <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
                        <div className="space-y-2 group/input">
                          <label htmlFor="Parking" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-emerald-400 transition-colors">
                            <CarFront className="w-3.5 h-3.5 mr-2" />
                            Parking Facility
                          </label>
                          <div className="relative">
                            <select
                              id="Parking"
                              name="Parking"
                              value={formData.Parking}
                              onChange={handleInputChange}
                              className="appearance-none block w-full bg-slate-950/50 border border-slate-700/50 text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner cursor-pointer"
                            >
                              <option value={1} className="bg-slate-900">Included</option>
                              <option value={0} className="bg-slate-900">None</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-400/50">
                              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 group/input">
                          <label htmlFor="Lift" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-emerald-400 transition-colors">
                            <ArrowUp className="w-3.5 h-3.5 mr-2" />
                            Elevators
                          </label>
                          <div className="relative">
                            <select
                              id="Lift"
                              name="Lift"
                              value={formData.Lift}
                              onChange={handleInputChange}
                              className="appearance-none block w-full bg-slate-950/50 border border-slate-700/50 text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner cursor-pointer"
                            >
                              <option value={1} className="bg-slate-900">Available</option>
                              <option value={0} className="bg-slate-900">None</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-400/50">
                              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                      {/* Location */}
                      <div className="space-y-2 group/input">
                        <label htmlFor="Location" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-cyan-400 transition-colors">
                          <MapPin className="w-3.5 h-3.5 mr-2" />
                          Location
                        </label>
                        <div className="relative">
                          <select
                            id="Location"
                            name="Location"
                            value={shopFormData.Location}
                            onChange={handleShopInputChange}
                            className="appearance-none block w-full bg-slate-950/50 border border-slate-700/50 text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner cursor-pointer transition-all"
                            required
                          >
                            {LOCATIONS.map(loc => (
                              <option key={loc} value={loc} className="bg-slate-900">{loc}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-400/50 group-hover/input:text-cyan-400 transition-colors">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                          </div>
                        </div>
                      </div>

                      {/* Area Sqft */}
                      <div className="space-y-2 group/input">
                        <label htmlFor="Area_sqft" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-cyan-400 transition-colors">
                          <Ruler className="w-3.5 h-3.5 mr-2" />
                          Carpet Area (Sq.Ft.)
                        </label>
                        <input
                          type="number"
                          id="Area_sqft"
                          name="Area_sqft"
                          min="50"
                          value={shopFormData.Area_sqft || ''}
                          onChange={handleShopInputChange}
                          className="block w-full bg-slate-950/50 border border-slate-700/50 text-white text-sm rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner placeholder-slate-600 transition-all focus:-translate-y-0.5"
                          placeholder="e.g. 500"
                          required
                        />
                      </div>

                      {/* Floor & Total Floors combined */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 group/input relative">
                          <label htmlFor="Floor" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-cyan-400 transition-colors">
                            <Hash className="w-3.5 h-3.5 mr-1" />
                            Floor Level
                          </label>
                          <input
                            type="number"
                            id="Floor"
                            name="Floor"
                            min="0"
                            value={shopFormData.Floor}
                            onChange={handleShopInputChange}
                            className="block w-full bg-slate-950/50 border border-slate-700/50 text-white text-sm rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner transition-all focus:-translate-y-0.5"
                            required
                          />
                        </div>
                        <div className="space-y-2 group/input">
                          <label htmlFor="Total_Floors" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-cyan-400 transition-colors">
                            <ArrowUp className="w-3.5 h-3.5 mr-1" />
                            Total Floors
                          </label>
                          <input
                            type="number"
                            id="Total_Floors"
                            name="Total_Floors"
                            min="1"
                            value={shopFormData.Total_Floors || ''}
                            onChange={handleShopInputChange}
                            className="block w-full bg-slate-950/50 border border-slate-700/50 text-white text-sm rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner transition-all focus:-translate-y-0.5"
                            required
                          />
                        </div>
                      </div>

                      {/* Age of Property */}
                      <div className="space-y-2 group/input">
                        <label htmlFor="Age_of_Property" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-cyan-400 transition-colors">
                          <Calendar className="w-3.5 h-3.5 mr-2" />
                          Age (Years)
                        </label>
                        <input
                          type="number"
                          id="Age_of_Property"
                          name="Age_of_Property"
                          min="0"
                          value={shopFormData.Age_of_Property}
                          onChange={handleShopInputChange}
                          className="block w-full bg-slate-950/50 border border-slate-700/50 text-white text-sm rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner transition-all focus:-translate-y-0.5"
                          required
                        />
                      </div>

                      {/* Parking & Main Road Facing */}
                      <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
                        <div className="space-y-2 group/input">
                          <label htmlFor="Main_Road_Facing" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-cyan-400 transition-colors">
                            <Building2 className="w-3.5 h-3.5 mr-2" />
                            Main Road Facing
                          </label>
                          <div className="relative">
                            <select
                              id="Main_Road_Facing"
                              name="Main_Road_Facing"
                              value={shopFormData.Main_Road_Facing}
                              onChange={handleShopInputChange}
                              className="appearance-none block w-full bg-slate-950/50 border border-slate-700/50 text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner cursor-pointer"
                            >
                              <option value={1} className="bg-slate-900">Yes</option>
                              <option value={0} className="bg-slate-900">No</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-400/50">
                              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 group/input">
                          <label htmlFor="Parking" className="flex items-center font-semibold text-slate-300 tracking-wider uppercase text-[10px] group-hover/input:text-cyan-400 transition-colors">
                            <CarFront className="w-3.5 h-3.5 mr-2" />
                            Customer Parking
                          </label>
                          <div className="relative">
                            <select
                              id="Parking"
                              name="Parking"
                              value={shopFormData.Parking}
                              onChange={handleShopInputChange}
                              className="appearance-none block w-full bg-slate-950/50 border border-slate-700/50 text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent block p-4 outline-none hover:bg-slate-900 shadow-inner cursor-pointer"
                            >
                              <option value={1} className="bg-slate-900">Available</option>
                              <option value={0} className="bg-slate-900">None</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-400/50">
                              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`group relative w-full flex justify-center items-center py-4 px-6 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-4 transition-all duration-300 ease-out transform hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] overflow-hidden ${predictorMode === 'house' ? 'bg-emerald-400 hover:bg-emerald-300 focus:ring-emerald-500/30 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]' : 'bg-cyan-400 hover:bg-cyan-300 focus:ring-cyan-500/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]'}`}
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" />
                          Analyzing Algorithms...
                        </>
                      ) : (
                        <>
                          <Calculator className="-ml-1 mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                          {predictorMode === 'house' ? 'Generate House Valuation' : 'Generate Shop Valuation'}
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {error && (
                  <div className="mt-6 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 animate-in slide-in-from-bottom-4 flex items-center justify-center text-rose-400 text-sm font-medium">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                  </div>
                )}

                {predictedPrice !== null && !error && (
                  <div className={`mt-8 relative group overflow-hidden rounded-[1.5rem] animate-in slide-in-from-bottom-8 fade-in zoom-in-95 duration-500`}>
                    <div className={`absolute inset-0 bg-gradient-to-r backdrop-blur-md ${predictorMode === 'house' ? 'from-emerald-500/10 via-cyan-500/10 to-emerald-500/10' : 'from-cyan-500/10 via-blue-500/10 to-cyan-500/10'}`}></div>
                    <div className={`absolute inset-0 border rounded-[1.5rem] pointer-events-none ${predictorMode === 'house' ? 'border-emerald-400/20' : 'border-cyan-400/20'}`}></div>

                    <div className="relative p-8 flex flex-col items-center justify-center text-center">
                      <span className={`px-4 py-1.5 rounded-full bg-slate-950/50 border flex items-center text-[10px] font-bold uppercase tracking-widest mb-4 ${predictorMode === 'house' ? 'border-emerald-500/30 text-emerald-300' : 'border-cyan-500/30 text-cyan-300'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] ${predictorMode === 'house' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'}`}></span>
                        Success
                      </span>

                      <h3 className="text-slate-400 text-xs font-semibold tracking-widest uppercase mb-1">Market Value</h3>

                      <div className="flex items-baseline justify-center text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-8">
                        {formatCurrency(predictedPrice)}
                      </div>

                      {predictorMode === 'house' ? (
                        <div className="w-full">
                          <h4 className="text-slate-300 text-[11px] font-semibold tracking-[0.15em] uppercase mb-4 text-left border-b border-white/5 pb-2">Vision Board ({formData.BHK} BHK)</h4>
                          <div className="grid grid-cols-3 gap-3 md:gap-4">
                            <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 group/img shadow-2xl">
                              <img src={getImageSet(formData.BHK).exterior} alt="Exterior" className="object-cover w-full h-full group-hover/img:scale-110 transition-transform duration-700 ease-out" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Exterior</span>
                              </div>
                            </div>
                            <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 group/img shadow-2xl">
                              <img src={getImageSet(formData.BHK).interior} alt="Living Room" className="object-cover w-full h-full group-hover/img:scale-110 transition-transform duration-700 ease-out" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Interior</span>
                              </div>
                            </div>
                            <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 group/img shadow-2xl">
                              <img src={getImageSet(formData.BHK).bedroom} alt="Bedroom" className="object-cover w-full h-full group-hover/img:scale-110 transition-transform duration-700 ease-out" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Bedroom</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full">
                          <h4 className="text-slate-300 text-[11px] font-semibold tracking-[0.15em] uppercase mb-4 text-left border-b border-white/5 pb-2">Vision Board (Commercial)</h4>
                          <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 group/img shadow-2xl">
                              <img src="https://images.unsplash.com/photo-1576483562624-9dfc8230ebae?auto=format&fit=crop&w=800&q=80" alt="Shop Front" className="object-cover w-full h-full group-hover/img:scale-110 transition-transform duration-700 ease-out" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Storefront</span>
                              </div>
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 group/img shadow-2xl">
                              <img src="https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=80" alt="Shop Interior" className="object-cover w-full h-full group-hover/img:scale-110 transition-transform duration-700 ease-out" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Interior</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center lg:text-left flex flex-col sm:flex-row justify-between items-center text-slate-500 text-xs font-light tracking-wider uppercase mt-8 pt-4 border-t border-white/5">
              <span>&copy; {new Date().getFullYear()} RE AI Labs</span>
              <span className="flex items-center mt-2 sm:mt-0">
                Precision Built
                <svg className="w-3.5 h-3.5 ml-1.5 text-emerald-500/70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
              </span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
