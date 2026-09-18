import React, { useState } from 'react';
import { CustomerLayout } from '../../layouts/CustomerLayout.tsx';
import { useRouter } from '../../router/RouterContext.tsx';
import { storeService } from '../../services/storeService.ts';
import { useCart } from '../../context/CartContext.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs.tsx';
import { formatCurrency } from '../../lib/utils.ts';
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Check,
  Zap,
} from 'lucide-react';
import { JerseySize } from '../../types/index.ts';

export const ProductDetailView: React.FC<{ slug?: string }> = ({ slug }) => {
  const { navigate, routeParams } = useRouter();
  const { addToCart, isInWishlist, toggleWishlist } = useCart();

  const activeSlug = slug || routeParams.slug || 'valkyrie-fc-home-24-25';
  const product = storeService.getProductBySlug(activeSlug) || storeService.getProducts()[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => product?.variants[0]?.id || '');
  const [quantity, setQuantity] = useState(1);

  // Customization state
  const [enableCustomPrint, setEnableCustomPrint] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [selectedBadgePatch, setSelectedBadgePatch] = useState<string>('none');

  if (!product) {
    return (
      <CustomerLayout>
        <div className="py-24 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Product Not Found</h2>
          <Button variant="outline" onClick={() => navigate('/shop')}>
            Return to Shop
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const isWish = isInWishlist(product.id);

  const handleAdd = () => {
    if (!selectedVariant) return;

    const customization = enableCustomPrint || selectedBadgePatch !== 'none'
      ? {
          playerPrint: enableCustomPrint && (playerName || playerNumber) ? `${playerName.toUpperCase()} ${playerNumber}`.trim() : undefined,
          badgePatch: selectedBadgePatch !== 'none' ? selectedBadgePatch : undefined,
        }
      : undefined;

    addToCart(product, selectedVariant, quantity, customization);
  };

  const currentPrice = selectedVariant.priceOverride ?? product.basePrice;
  const badgeSurcharge = selectedBadgePatch !== 'none' ? 10.0 : 0.0;
  const printSurcharge = enableCustomPrint ? 15.0 : 0.0;
  const totalItemPrice = currentPrice + badgeSurcharge + printSurcharge;

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-6 font-mono">
          <button onClick={() => navigate('/')} className="hover:text-white">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <button onClick={() => navigate('/shop')} className="hover:text-white">Kits Catalog</button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-neutral-200 truncate">{product.title}</span>
        </nav>

        {/* Two column product layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Product Images Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800">
              <img
                src={product.images[selectedImageIndex]?.url || product.images[0]?.url}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.kitType && <Badge variant="gold">{product.kitType} Kit</Badge>}
                {product.isNewArrival && <Badge variant="neutral">New Season</Badge>}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-24 rounded-lg overflow-hidden border transition-all ${
                      selectedImageIndex === idx
                        ? 'border-amber-400 ring-2 ring-amber-400/40'
                        : 'border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Engine (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-1">
                <span>{product.clubName}</span>
                <span>SKU: {selectedVariant.sku}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-wide">
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="text-xs text-amber-400 font-mono mt-1">{product.subtitle}</p>
              )}
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-neutral-800">
              <span className="text-3xl font-bold font-mono text-white">
                {formatCurrency(totalItemPrice)}
              </span>
              {product.comparePrice && (
                <span className="text-sm font-mono text-neutral-500 line-through">
                  {formatCurrency(product.comparePrice)}
                </span>
              )}
            </div>

            {/* Size Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Select Size
                </label>
                <span className="text-xs text-neutral-400">Standard Pro Athletic Fit</span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  const isLow = v.stockQuantity > 0 && v.stockQuantity < 10;
                  const isOut = v.stockQuantity <= 0;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={isOut}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`relative py-3 rounded-lg border text-center font-bold text-xs transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-black border-amber-400 shadow-sm'
                          : isOut
                          ? 'bg-neutral-950 text-neutral-600 border-neutral-800 cursor-not-allowed line-through'
                          : 'bg-neutral-900 text-neutral-200 border-neutral-700/80 hover:border-neutral-500'
                      }`}
                    >
                      <span>{v.size}</span>
                      {isLow && !isSelected && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <Check className="w-4 h-4" />
                <span>
                  In Stock ({selectedVariant.stockQuantity} units available at Central Warehouse)
                </span>
              </div>
            </div>

            {/* Official Customization Module */}
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Official Printing & Badging
                </span>
                <button
                  type="button"
                  onClick={() => setEnableCustomPrint(!enableCustomPrint)}
                  className="text-xs text-neutral-300 hover:text-white underline"
                >
                  {enableCustomPrint ? 'Remove Custom Print' : '+ Add Name & Number (+$15)'}
                </button>
              </div>

              {enableCustomPrint && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Input
                    label="Player Name"
                    placeholder="e.g. BELLINGHAM"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                  />
                  <Input
                    label="Number"
                    placeholder="e.g. 5"
                    maxLength={2}
                    value={playerNumber}
                    onChange={(e) => setPlayerNumber(e.target.value)}
                  />
                </div>
              )}

              {/* Sleeve Badge */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Competition Sleeve Patch
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedBadgePatch('none')}
                    className={`p-2 rounded-lg border text-left ${
                      selectedBadgePatch === 'none'
                        ? 'border-amber-400 bg-neutral-900 text-white'
                        : 'border-neutral-800 text-neutral-400'
                    }`}
                  >
                    No Sleeve Patch
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBadgePatch('Champions League Pro Patch')}
                    className={`p-2 rounded-lg border text-left ${
                      selectedBadgePatch === 'Champions League Pro Patch'
                        ? 'border-amber-400 bg-neutral-900 text-white'
                        : 'border-neutral-800 text-neutral-400'
                    }`}
                  >
                    Champions League (+$10)
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="gold"
                size="lg"
                className="flex-1"
                onClick={handleAdd}
                leftIcon={<ShoppingBag className="w-5 h-5" />}
              >
                Add to Bag • {formatCurrency(totalItemPrice * quantity)}
              </Button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="p-3.5 rounded-lg border border-neutral-700 bg-neutral-900 text-white hover:text-amber-400 transition-colors"
                aria-label="Wishlist toggle"
              >
                <Heart className={`w-5 h-5 ${isWish ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-800 text-neutral-400 text-[11px] text-center">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>100% Match Issue</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Express Courier</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>30-Day Returns</span>
              </div>
            </div>

            {/* Tech Details Tabs */}
            <div className="pt-4">
              <Tabs value="description" onValueChange={() => {}}>
                <TabsList variant="underline">
                  <TabsTrigger value="description">Overview</TabsTrigger>
                  <TabsTrigger value="specs">Aeroknit™ Tech</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-3 text-xs text-neutral-300 leading-relaxed">
                  {product.description}
                </TabsContent>
                <TabsContent value="specs" className="pt-3 text-xs text-neutral-300 leading-relaxed">
                  {product.details}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};
