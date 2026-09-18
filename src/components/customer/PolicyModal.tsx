import React from 'react';
import { X, ShieldCheck, Truck, RefreshCw, HelpCircle, Ruler, FileText } from 'lucide-react';

export type PolicyType = 'shipping' | 'returns' | 'privacy' | 'terms' | 'size-guide' | 'faq' | null;

interface PolicyModalProps {
  policy: PolicyType;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ policy, onClose }) => {
  if (!policy) return null;

  const renderContent = () => {
    switch (policy) {
      case 'shipping':
        return (
          <div className="space-y-5 text-sm text-neutral-300">
            <div className="flex items-center gap-2.5 text-amber-400">
              <Truck className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white font-heading">Worldwide Shipping Policy</h3>
            </div>
            <p className="leading-relaxed">
              Every RAYVEN match jersey and technical piece is inspected, custom printed (if requested),
              and dispatched directly from our regional fulfillment centers in London, Madrid, and Singapore.
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="flex justify-between font-semibold text-white">
                  <span>Domestic Express (UK & EU)</span>
                  <span className="text-amber-400">1 – 3 Business Days</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">Standard $5.99 (Free on orders $120+)</p>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="flex justify-between font-semibold text-white">
                  <span>International Priority (USA, Canada, Asia)</span>
                  <span className="text-amber-400">3 – 5 Business Days</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">DHL Express tracked delivery with SMS notifications.</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400">
              Customized jerseys with player printing require an additional 24 hours of precision heat-curing before dispatch.
            </div>
          </div>
        );

      case 'returns':
        return (
          <div className="space-y-5 text-sm text-neutral-300">
            <div className="flex items-center gap-2.5 text-amber-400">
              <RefreshCw className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white font-heading">Returns & Exchanges (30 Days)</h3>
            </div>
            <p className="leading-relaxed">
              We want you to be 100% confident in your kit. If your jersey doesn't fit or meet your expectations,
              return it within 30 days of delivery for a full refund or size exchange.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-400">
              <li>Items must be unworn, unwashed, with all original RAYVEN & club tags attached.</li>
              <li>Free size exchanges are provided for all domestic orders.</li>
              <li>Customized jerseys with personalized names/numbers cannot be returned unless a manufacturing defect exists.</li>
            </ul>
            <div className="pt-2">
              <p className="text-xs text-neutral-300">
                To initiate a return or exchange, visit your Account Orders page or contact our concierge at{' '}
                <span className="text-amber-400 font-mono">returns@rayven-football.com</span>.
              </p>
            </div>
          </div>
        );

      case 'size-guide':
        return (
          <div className="space-y-5 text-sm text-neutral-300">
            <div className="flex items-center gap-2.5 text-amber-400">
              <Ruler className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white font-heading">Football Jersey Size Guide</h3>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400">
              <strong className="text-white">Player Version vs. Fan Version:</strong> Player Version jerseys feature an
              athletic, tapered fit designed for pitch performance. If you prefer a relaxed or casual streetwear fit,
              we recommend ordering one size up.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-neutral-800 rounded-lg overflow-hidden">
                <thead className="bg-neutral-900 text-neutral-200 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="p-2.5 border-b border-neutral-800">Size</th>
                    <th className="p-2.5 border-b border-neutral-800">Chest (Inches)</th>
                    <th className="p-2.5 border-b border-neutral-800">Chest (CM)</th>
                    <th className="p-2.5 border-b border-neutral-800">Body Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80 font-mono">
                  <tr>
                    <td className="p-2.5 font-bold text-amber-400">S</td>
                    <td className="p-2.5">36 - 38"</td>
                    <td className="p-2.5">91 - 96 cm</td>
                    <td className="p-2.5">71 cm</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-amber-400">M</td>
                    <td className="p-2.5">39 - 41"</td>
                    <td className="p-2.5">99 - 104 cm</td>
                    <td className="p-2.5">73 cm</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-amber-400">L</td>
                    <td className="p-2.5">42 - 44"</td>
                    <td className="p-2.5">107 - 112 cm</td>
                    <td className="p-2.5">76 cm</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-amber-400">XL</td>
                    <td className="p-2.5">45 - 47"</td>
                    <td className="p-2.5">114 - 119 cm</td>
                    <td className="p-2.5">78 cm</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-amber-400">2XL</td>
                    <td className="p-2.5">48 - 50"</td>
                    <td className="p-2.5">122 - 127 cm</td>
                    <td className="p-2.5">81 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4 text-sm text-neutral-300">
            <div className="flex items-center gap-2.5 text-amber-400">
              <HelpCircle className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white font-heading">Frequently Asked Questions</h3>
            </div>
            <div className="space-y-3 pt-1">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <h4 className="font-bold text-white text-xs">Are RAYVEN jerseys authentic match specifications?</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Yes. Our "Player Version" matchwear uses exact 140g Aeroknit™ open-mesh capillary fabric and 3D heat-sealed crests worn by professional athletes in competition.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <h4 className="font-bold text-white text-xs">How does custom name and number printing work?</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  We use official competition font heat-press flocking. Simply choose your player or input your custom text on any product page.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <h4 className="font-bold text-white text-xs">How should I wash and care for my matchwear?</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Wash inside-out in cold water (max 30°C) on a gentle cycle. Never tumble dry or iron directly over crests and numbers. Hang dry naturally.
                </p>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-5 text-sm text-neutral-300">
            <div className="flex items-center gap-2.5 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white font-heading">Privacy & Data Security</h3>
            </div>
            <p className="leading-relaxed text-xs">
              RAYVEN Football Apparel respects your personal privacy. We collect customer data solely to process orders,
              safeguard account authentication, and provide delivery notifications.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-400">
              <li>All payments are 256-bit SSL encrypted via PCI-DSS certified gateway processors.</li>
              <li>We never store or share your credit card numbers on our servers.</li>
              <li>You may request complete erasure of your account details at any time.</li>
            </ul>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-5 text-sm text-neutral-300">
            <div className="flex items-center gap-2.5 text-amber-400">
              <FileText className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white font-heading">Terms & Conditions</h3>
            </div>
            <p className="leading-relaxed text-xs">
              By purchasing through the RAYVEN storefront, you agree to our standard terms of sale. Orders are subject to
              inventory verification and card authorization. Prices and limited drop allocations are guaranteed upon checkout completion.
            </p>
            <p className="text-xs text-neutral-400">
              RAYVEN is a registered trademark of RAYVEN Football & Athletic Apparel Ltd. All rights reserved.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {renderContent()}

        <div className="mt-8 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
