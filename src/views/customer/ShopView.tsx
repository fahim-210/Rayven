import React, { useState, useMemo } from 'react';
import { CustomerLayout } from '../../layouts/CustomerLayout.tsx';
import { useRouter } from '../../router/RouterContext.tsx';
import { storeService } from '../../services/storeService.ts';
import { useCart } from '../../context/CartContext.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { formatCurrency } from '../../lib/utils.ts';
import { Filter, SlidersHorizontal, Heart, Plus, Search, Check, RefreshCcw } from 'lucide-react';
import { KitType, JerseySize } from '../../types/index.ts';

export const ShopView: React.FC = () => {
  const { navigate } = useRouter();
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const products = storeService.getProducts();
  const clubs = storeService.getClubs();

  // Filters state
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [selectedKitType, setSelectedKitType] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const kitTypes: KitType[] = ['Home', 'Away', 'Third', 'Retro'];
  const sizes: JerseySize[] = ['S', 'M', 'L', 'XL', '2XL'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedClub !== 'all' && p.clubId !== selectedClub) return false;
      if (selectedKitType !== 'all' && p.kitType !== selectedKitType) return false;
      if (selectedSize !== 'all') {
        const hasSize = p.variants.some((v) => v.size === selectedSize && v.stockQuantity > 0);
        if (!hasSize) return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchClub = p.clubName?.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        if (!matchTitle && !matchClub && !matchSku) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, selectedClub, selectedKitType, selectedSize, searchTerm, sortBy]);

  const resetFilters = () => {
    setSelectedClub('all');
    setSelectedKitType('all');
    setSelectedSize('all');
    setSearchTerm('');
    setSortBy('featured');
  };

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-neutral-800">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Catalog & Collections
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white uppercase tracking-tight mt-1">
              Official Football Kits ({filteredProducts.length})
            </h1>
          </div>

          {/* Quick search input */}
          <div className="w-full md:w-72">
            <Input
              isSearch
              placeholder="Search jerseys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
            />
          </div>
        </div>

        {/* Layout with Filters + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
          {/* Filter Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Filters</span>
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Club Filter */}
            <div className="space-y-2 border-t border-neutral-800 pt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Partner Club
              </span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedClub('all')}
                  className={`text-xs px-3 py-2 rounded-lg text-left transition-colors flex items-center justify-between ${
                    selectedClub === 'all'
                      ? 'bg-neutral-800 text-amber-400 font-bold'
                      : 'text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <span>All Clubs</span>
                  {selectedClub === 'all' && <Check className="w-3.5 h-3.5" />}
                </button>
                {clubs.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClub(c.id)}
                    className={`text-xs px-3 py-2 rounded-lg text-left transition-colors flex items-center justify-between ${
                      selectedClub === c.id
                        ? 'bg-neutral-800 text-amber-400 font-bold'
                        : 'text-neutral-300 hover:bg-neutral-900'
                    }`}
                  >
                    <span>{c.name}</span>
                    {selectedClub === c.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Kit Type Filter */}
            <div className="space-y-2 border-t border-neutral-800 pt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Kit Type
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedKitType('all')}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    selectedKitType === 'all'
                      ? 'bg-amber-400 text-black border-amber-400 font-bold'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  All
                </button>
                {kitTypes.map((kt) => (
                  <button
                    key={kt}
                    onClick={() => setSelectedKitType(kt)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      selectedKitType === kt
                        ? 'bg-amber-400 text-black border-amber-400 font-bold'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {kt}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="space-y-2 border-t border-neutral-800 pt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Available Size
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedSize('all')}
                  className={`text-xs py-2 rounded-lg border text-center transition-all ${
                    selectedSize === 'all'
                      ? 'bg-amber-400 text-black border-amber-400 font-bold'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  Any
                </button>
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`text-xs py-2 rounded-lg border text-center transition-all ${
                      selectedSize === sz
                        ? 'bg-amber-400 text-black border-amber-400 font-bold'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="p-16 text-center rounded-2xl border border-neutral-800 bg-neutral-900/40">
                <Filter className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No matchwear found</h3>
                <p className="text-xs text-neutral-400 mb-6">
                  Try adjusting your filter settings or search keyword.
                </p>
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const isWish = isInWishlist(product.id);
                  const primaryImg = product.images[0]?.url;

                  return (
                    <div
                      key={product.id}
                      className="group flex flex-col bg-neutral-900/60 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative aspect-[4/5] bg-neutral-950 overflow-hidden">
                        <img
                          src={primaryImg}
                          alt={product.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          {product.kitType && (
                            <Badge variant="neutral" size="sm">
                              {product.kitType}
                            </Badge>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-amber-400 transition-colors"
                          aria-label="Wishlist toggle"
                        >
                          <Heart
                            className={`w-4 h-4 ${isWish ? 'fill-amber-400 text-amber-400' : ''}`}
                          />
                        </button>

                        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full bg-white text-black font-bold shadow-lg"
                            onClick={() => navigate(`/product/${product.slug}`)}
                          >
                            Customize & View
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                            <span>{product.clubName}</span>
                            <span className="font-mono">{product.season}</span>
                          </div>
                          <h3
                            onClick={() => navigate(`/product/${product.slug}`)}
                            className="text-sm font-bold text-white font-heading cursor-pointer hover:text-amber-400 transition-colors"
                          >
                            {product.title}
                          </h3>
                        </div>

                        <div className="pt-3 mt-3 border-t border-neutral-800 flex items-center justify-between">
                          <span className="text-base font-bold font-mono text-white">
                            {formatCurrency(product.basePrice)}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const defaultVariant = product.variants[0];
                              if (defaultVariant) {
                                addToCart(product, defaultVariant, 1);
                              }
                            }}
                            leftIcon={<Plus className="w-3.5 h-3.5" />}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </CustomerLayout>
  );
};
