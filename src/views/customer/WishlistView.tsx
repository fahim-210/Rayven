import React from 'react';
import { CustomerAccountLayout } from '../../layouts/CustomerAccountLayout.tsx';
import { useRouter } from '../../router/RouterContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { storeService } from '../../services/storeService.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { formatCurrency } from '../../lib/utils.ts';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { navigate } = useRouter();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const allProducts = storeService.getProducts();

  const wishProducts = allProducts.filter((p) => wishlist.includes(p.id));

  return (
    <CustomerAccountLayout
      title="Saved Wishlist"
      subtitle="Your curated selection of match editions and upcoming releases."
    >
      {wishProducts.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-neutral-900/40 border border-neutral-800">
          <Heart className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-white mb-1">Your wishlist is empty</p>
          <p className="text-xs text-neutral-400 mb-4">
            Save football shirts and apparel you want to track or buy later.
          </p>
          <Button variant="gold" size="sm" onClick={() => navigate('/shop')}>
            Browse Kits
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wishProducts.map((product) => (
            <div
              key={product.id}
              className="flex gap-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700"
            >
              <img
                src={product.images[0]?.url}
                alt={product.title}
                className="w-20 h-24 object-cover rounded-lg bg-neutral-950 shrink-0"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase">
                    {product.clubName}
                  </span>
                  <h4
                    onClick={() => navigate(`/product/${product.slug}`)}
                    className="text-xs font-bold text-white cursor-pointer hover:text-amber-400 line-clamp-1"
                  >
                    {product.title}
                  </h4>
                  <p className="text-xs font-mono font-bold text-white mt-1">
                    {formatCurrency(product.basePrice)}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-[11px]"
                    onClick={() => {
                      const def = product.variants[0];
                      if (def) addToCart(product, def, 1);
                    }}
                    leftIcon={<ShoppingBag className="w-3 h-3" />}
                  >
                    Add to Bag
                  </Button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CustomerAccountLayout>
  );
};
