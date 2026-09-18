import React, { useState } from 'react';
import { CustomerLayout } from '../../layouts/CustomerLayout.tsx';
import { useRouter } from '../../router/RouterContext.tsx';
import { storeService } from '../../services/storeService.ts';
import { ProductCard } from '../../components/customer/ProductCard.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  Award,
  ChevronRight,
  Star,
  Copy,
  Check,
  Truck,
  Sparkles,
  Layers,
  Wind,
  Shirt,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { navigate } = useRouter();

  // Data retrieval from isolated data layer
  const featuredProducts = storeService.getFeaturedProducts();
  const newArrivals = storeService.getNewArrivals();
  const bestSellers = storeService.getBestSellers();
  const popularClubs = storeService.getPopularClubs();
  const customerReviews = storeService.getCustomerReviews();

  // Local interactive states
  const [newArrivalFilter, setNewArrivalFilter] = useState<'ALL' | 'HOME' | 'AWAY' | 'THIRD'>('ALL');
  const [promoCopied, setPromoCopied] = useState(false);

  // Filtered new arrivals
  const filteredNewArrivals = newArrivals.filter((p) => {
    if (newArrivalFilter === 'ALL') return true;
    if (newArrivalFilter === 'HOME') return p.kitType === 'Home';
    if (newArrivalFilter === 'AWAY') return p.kitType === 'Away';
    if (newArrivalFilter === 'THIRD') return p.kitType === 'Third';
    return true;
  });

  const handleCopyPromo = () => {
    navigator.clipboard?.writeText('MATCHDAY25');
    setPromoCopied(true);
    setTimeout(() => setPromoCopied(false), 2200);
  };

  return (
    <CustomerLayout>
      {/* ================================================== */}
      {/* 1. HERO SECTION                                    */}
      {/* ================================================== */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-neutral-800/80">
        {/* Cinematic Backdrop with Deep Darkness & Floodlight Sheen */}
        <div className="absolute inset-0 bg-[#0b0c10]">
          <img
            src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1800&auto=format&fit=crop&q=85"
            alt="Floodlit Football Arena"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-transparent to-[#0b0c10]/90" />
        </div>

        {/* Ambient Subtle Accent Light */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center flex flex-col items-center">
          {/* RAYVEN Branding Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-md shadow-lg">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>RAYVEN FOOTBALL APPAREL • MATCH EDITION SERIES</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-heading text-white tracking-tight uppercase max-w-4xl leading-[1.08] mb-6">
            ENGINEERED FOR THE PITCH.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
              REFINED FOR CULTURE.
            </span>
          </h1>

          {/* Short Description */}
          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl font-normal leading-relaxed mb-10">
            Official match-grade football jerseys engineered with proprietary 140g Aeroknit™
            open-mesh fibers, 3D iridescent silicone crests, and tournament-specification player printing.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button
              variant="gold"
              size="lg"
              className="w-full sm:w-auto px-8"
              onClick={() => navigate('/shop')}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Shop Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 border-neutral-700 hover:bg-neutral-800 text-white"
              onClick={() => navigate('/clubs')}
            >
              Explore Clubs
            </Button>
          </div>

          {/* Key Attributes Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 mt-16 pt-10 border-t border-neutral-800/80 w-full max-w-4xl text-center">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold font-heading text-white">100%</span>
              <span className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
                Player Issue Spec
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold font-heading text-amber-400">140g</span>
              <span className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
                Aeroknit™ Mesh
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold font-heading text-white">8 Clubs</span>
              <span className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
                Partner Roster
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold font-heading text-white">Express</span>
              <span className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
                Worldwide Dispatch
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. FEATURED PRODUCTS                               */}
      {/* ================================================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1.5">
              <Flame className="w-4 h-4" />
              <span>Curated Matchday Selection</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white uppercase tracking-tight">
              Featured Products
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Flagship match edition kits tailored with technical jacquard weaving and 3D heat-sealed crests.
            </p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All Matchwear</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 3. NEW ARRIVALS                                    */}
      {/* ================================================== */}
      <section id="new-arrivals" className="py-20 bg-neutral-950/60 border-y border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Season 24/25 & 25/26 Drops</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white uppercase tracking-tight">
                New Arrivals
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
                The latest club drops, away strips, and special cup tournament editions just released from production.
              </p>
            </div>

            {/* Interactive Drop Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {(['ALL', 'HOME', 'AWAY', 'THIRD'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setNewArrivalFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    newArrivalFilter === filter
                      ? 'bg-amber-400 text-black shadow-md font-bold'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {filter === 'ALL' ? 'All Drops' : `${filter} Kits`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredNewArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/shop?filter=new-arrivals')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore All New Season Drops
            </Button>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. BEST SELLERS                                    */}
      {/* ================================================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1.5">
              <Award className="w-4 h-4" />
              <span>Highest Demand & Collector Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white uppercase tracking-tight">
              Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Most coveted match jerseys worn by world-class players and verified by kit collectors.
            </p>
          </div>
          <button
            onClick={() => navigate('/shop?filter=best-sellers')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All Best Sellers</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 5. POPULAR CLUBS                                   */}
      {/* ================================================== */}
      <section className="py-20 bg-neutral-950 border-y border-neutral-800/80 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Partner Roster & European Giants</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white uppercase tracking-tight">
                Popular Clubs
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
                Official technical matchwear for top-tier European powerhouses and independent syndicate teams.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/clubs')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              All Clubs Roster
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {popularClubs.map((club) => (
              <div
                key={club.id}
                onClick={() => navigate('/clubs')}
                className="group relative p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-amber-400/50 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Accent Color Indicator Bar on Hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: club.primaryColor || '#f59e0b' }}
                />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-800/80 border border-neutral-700/80 flex items-center justify-center text-amber-400 font-bold font-mono text-base group-hover:scale-105 group-hover:border-amber-400/50 transition-all shadow-inner">
                      {club.shortCode}
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                      {club.country}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {club.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">{club.league}</p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 group-hover:text-neutral-300">
                  <span className="font-mono text-[11px]">Match Kits Available</span>
                  <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 6. PROMOTIONAL SECTION                             */}
      {/* ================================================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="relative rounded-3xl border border-neutral-800/90 overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-8 sm:p-12 lg:p-16 shadow-2xl">
          {/* Ambient Lighting Gradients */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-neutral-800/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Limited Matchday Opportunity</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white uppercase tracking-tight leading-tight">
                Complimentary Tournament Flocking & Express Dispatch
              </h2>

              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl">
                Personalize any 2024/25 Player-Version or Fan-Version jersey with official tournament
                font lettering and authentic squad numbers at zero additional charge. Plus receive free
                tracked DHL Express shipping on orders over $120.
              </p>

              {/* Promo Code Pill with Copy Action */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700/80 shadow-inner">
                  <span className="text-xs text-neutral-400 uppercase tracking-wider">Use Promo Code:</span>
                  <span className="text-base font-mono font-bold text-amber-400 tracking-wider">
                    MATCHDAY25
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPromo}
                    className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                    title="Copy promo code"
                    aria-label="Copy promo code"
                  >
                    {promoCopied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {promoCopied && (
                  <span className="text-xs text-emerald-400 font-medium">Code copied to clipboard!</span>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full sm:w-auto px-8"
                  onClick={() => navigate('/shop')}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Shop Promotional Kits
                </Button>
                <button
                  onClick={() => navigate('/about')}
                  className="text-xs font-semibold text-neutral-300 hover:text-white underline underline-offset-4"
                >
                  Learn About Technical Flocking
                </button>
              </div>
            </div>

            {/* Right Feature Highlights Card */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Official Heat-Welded Numbers</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Tournament flocking pressed with industrial 160°C pneumatic precision for zero peel or crack.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Express Global Air Cargo</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Tracked door-to-door delivery with real-time SMS status updates and insured transit.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">30-Day Fit Guarantee</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Hassle-free size exchange within 30 days if your kit doesn't fit your exact preference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 7. CUSTOMER REVIEWS                                */}
      {/* ================================================== */}
      <section className="py-20 bg-neutral-950/80 border-y border-neutral-800/80 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Verified Matchday Reviews</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white uppercase tracking-tight">
                Trusted by Players & Collectors
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
                Read authentic feedback from footballers, kit enthusiasts, and season ticket holders worldwide.
              </p>
            </div>

            {/* Rating Summary Pill */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-xs">
                <span className="font-bold text-white font-mono">4.9 / 5.0</span>
                <span className="text-neutral-400 ml-1.5">(1,420+ Verified Reviews)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerReviews.map((review) => (
              <div
                key={review.id}
                className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col justify-between hover:border-neutral-700 transition-colors"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Review Quote */}
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic mb-4">
                    "{review.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{review.author}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <Check className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1">
                    <span className="truncate max-w-[65%]">{review.location}</span>
                    <span className="font-mono text-[10px] text-amber-400">{review.fitFeedback}</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1 truncate">
                    {review.productName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 8. ABOUT RAYVEN                                    */}
      {/* ================================================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Narrative Pillar Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>The Football Syndicate Manifesto</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white uppercase tracking-tight leading-tight">
              Born on The Pitch. Refined for The Streets.
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              RAYVEN was forged by kit purists and athletic textile engineers who refused to accept the
              gulf between authentic player-issue specifications and streetwear culture. Every jersey in
              our atelier is cut from competition-certified 140g Aeroknit™ fabric.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800">
                <div className="flex items-center gap-2 text-amber-400 mb-1.5">
                  <Wind className="w-4 h-4" />
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Aeroknit™ Jacquard
                  </h4>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Micro-perforated open mesh channels evaporate sweat instantly during high physical output.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800">
                <div className="flex items-center gap-2 text-amber-400 mb-1.5">
                  <Layers className="w-4 h-4" />
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    3D Silicone Heat Crest
                  </h4>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Zero stitch friction against the skin with high-definition multi-angle iridescent luster.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800">
                <div className="flex items-center gap-2 text-amber-400 mb-1.5">
                  <Shirt className="w-4 h-4" />
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Sculpted Athletic Fit
                  </h4>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Anatomical tailoring mapped to matchday movement, drop tail hem, and bonded sleeve cuffs.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800">
                <div className="flex items-center gap-2 text-amber-400 mb-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Recycled Poly-Yarn
                  </h4>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  100% recycled technical polyester microfibers reducing environmental footprint on every kit.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/about')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Read The Full Brand Story
              </Button>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-neutral-800 aspect-[4/5] bg-neutral-950 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1000&auto=format&fit=crop&q=80"
              alt="Jersey Craftsmanship and Fabric Texture"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-transparent to-black/20" />
            <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 text-left">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ATELIER LAB BATCH SPEC</span>
              </div>
              <p className="text-sm font-bold text-white">Tested across 90-minute European cup matches</p>
              <p className="text-xs text-neutral-400 mt-1">
                Precision-engineered in limited batch runs for athletes and dedicated kit aficionados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 9. FOOTER is rendered automatically by             */}
      {/*    CustomerLayout enclosing this page              */}
      {/* ================================================== */}
    </CustomerLayout>
  );
};
