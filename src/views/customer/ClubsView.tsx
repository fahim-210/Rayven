import React from 'react';
import { CustomerLayout } from '../../layouts/CustomerLayout.tsx';
import { useRouter } from '../../router/RouterContext.tsx';
import { storeService } from '../../services/storeService.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Shield, Trophy, MapPin, ArrowRight } from 'lucide-react';

export const ClubsView: React.FC = () => {
  const { navigate } = useRouter();
  const clubs = storeService.getClubs();
  const products = storeService.getProducts();

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
        {/* Header */}
        <div className="max-w-3xl pb-10 border-b border-neutral-800">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            Club Partnerships
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white uppercase tracking-tight mt-1">
            The RAYVEN Roster
          </h1>
          <p className="text-sm text-neutral-300 mt-3 leading-relaxed">
            We are the official kit supplier for premier athletic clubs across Europe and Asia. Each
            uniform is developed alongside club kit managers and sports science personnel.
          </p>
        </div>

        {/* Clubs Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
          {clubs.map((club) => {
            const clubProducts = products.filter((p) => p.clubId === club.id);

            return (
              <div
                key={club.id}
                className="bg-neutral-900/60 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col justify-between"
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-700 flex items-center justify-center text-amber-400 font-extrabold font-heading text-xl shadow-inner">
                      {club.shortCode}
                    </div>
                    <Badge variant="gold" size="sm">
                      Official Partner
                    </Badge>
                  </div>

                  <h3 className="text-2xl font-bold font-heading text-white tracking-wide">
                    {club.name}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-xs text-neutral-400 mt-3 font-mono">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      {club.league}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      {club.country}
                    </span>
                  </div>

                  {/* Club Kits Preview */}
                  <div className="mt-6 pt-6 border-t border-neutral-800/80">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                      Assigned Match Kits ({clubProducts.length})
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      {clubProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => navigate(`/product/${p.slug}`)}
                          className="flex items-center gap-3 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 cursor-pointer group"
                        >
                          <img
                            src={p.images[0]?.url}
                            alt={p.title}
                            className="w-12 h-14 object-cover rounded bg-neutral-900"
                          />
                          <div className="truncate">
                            <p className="text-xs font-bold text-white group-hover:text-amber-400 truncate">
                              {p.kitType} Kit
                            </p>
                            <p className="text-[11px] font-mono text-neutral-400">
                              {p.season}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 px-6 sm:px-8 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Technical Kit Deal 2024-2028</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/shop')}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View Kits
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CustomerLayout>
  );
};
