import React, { useState } from 'react';
import { CustomerLayout } from '../../layouts/CustomerLayout.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { ShieldCheck, Mail, MapPin, Phone, Award, CheckCircle2 } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
          The Manifesto
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white uppercase tracking-tight mt-1 mb-6">
          Forged on The Pitch. Refined for Culture.
        </h1>

        <div className="space-y-6 text-sm text-neutral-300 leading-relaxed">
          <p>
            RAYVEN was founded on a singular conviction: football kits are the pinnacle of
            contemporary athletic engineering and urban cultural expression.
          </p>
          <p>
            While commercial replicas flood global retail with polyester blends prone to heavy sweat
            saturation, RAYVEN engineers matchwear exclusively to the exacting standards demanded
            by elite athletes competing under extreme physical strain.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
            <Award className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white font-heading">Aeroknit™ Jacquard</h3>
            <p className="text-xs text-neutral-400 mt-2 leading-normal">
              140g featherweight yarns with 3D ventilation capillaries that maintain structural
              anti-cling airflow under peak match perspiration.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
            <ShieldCheck className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white font-heading">Pro Tournament Crests</h3>
            <p className="text-xs text-neutral-400 mt-2 leading-normal">
              Ultra-lightweight polymer heat-applied crests and official sleeve competition badges
              replacing stiff, friction-inducing embroidery.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
            <MapPin className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white font-heading">Direct Club Alliance</h3>
            <p className="text-xs text-neutral-400 mt-2 leading-normal">
              Direct technical partnerships with visionary independent and top-flight clubs across
              the global football landscape.
            </p>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export const ContactView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
          Customer Concierge
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white uppercase tracking-tight mt-1 mb-6">
          Connect with RAYVEN
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-6">
            <p className="text-sm text-neutral-300">
              For custom squad kit inquiries, wholesale club orders, or order dispatch questions,
              our kit specialists are available Monday through Saturday.
            </p>

            <div className="space-y-4 text-xs text-neutral-300">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>support@rayven-football.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>+1 (800) 729-8361 (RAYVEN)</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>RAYVEN HQ, 442 Pitchside Way, Suite 800</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            {submitted ? (
              <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">Message Dispatched</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Our kit specialists will respond to your inquiry within 24 business hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4"
              >
                <Input label="Your Name" required placeholder="Alex Mercer" />
                <Input label="Email Address" type="email" required placeholder="alex@domain.com" />
                <Input label="Order Number (Optional)" placeholder="e.g. RVN-89421" />
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Inquiry Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can our technical matchwear specialists assist you today?"
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg p-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <Button type="submit" variant="gold" size="md" className="w-full">
                  Send Inquiry to Concierge
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};
