import React, { useState } from 'react';
import { CustomerLayout } from '../../layouts/CustomerLayout.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Select } from '../../components/ui/Select.tsx';
import { Checkbox } from '../../components/ui/Checkbox.tsx';
import { RadioGroup } from '../../components/ui/Radio.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card.tsx';
import { Dialog } from '../../components/ui/Dialog.tsx';
import { Dropdown } from '../../components/ui/Dropdown.tsx';
import { Alert } from '../../components/ui/Alert.tsx';
import { Loading } from '../../components/ui/Loading.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog.tsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs.tsx';
import { Sparkles, ArrowRight, ShieldCheck, ChevronDown, Check, AlertCircle } from 'lucide-react';

export const DesignSystemView: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [radioVal, setRadioVal] = useState('valkyrie');
  const [checkVal, setCheckVal] = useState(true);
  const [tabVal, setTabVal] = useState('buttons');

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-12">
        <div className="pb-6 border-b border-neutral-800">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            Brand Engineering System
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white uppercase tracking-tight mt-1">
            RAYVEN UI Design System & Component Library
          </h1>
          <p className="text-xs text-neutral-400 mt-2 font-mono">
            18 reusable production-grade components engineered for high contrast athletic luxury.
          </p>
        </div>

        {/* 1. Buttons Section */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
            1. Button System (Variants & States)
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="gold" size="md">
              Gold Primary
            </Button>
            <Button variant="primary" size="md">
              High Contrast White
            </Button>
            <Button variant="secondary" size="md">
              Secondary Slate
            </Button>
            <Button variant="outline" size="md">
              Precision Outline
            </Button>
            <Button variant="ghost" size="md">
              Ghost Link
            </Button>
            <Button variant="danger" size="md">
              Danger Red
            </Button>
            <Button variant="gold" size="md" isLoading>
              Processing
            </Button>
            <Button
              variant="gold"
              size="md"
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Icon Packed
            </Button>
          </div>
        </section>

        {/* 2. Badges & Indicators */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
            2. Status Badges & Chips
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="gold">Gold Badge</Badge>
            <Badge variant="neutral">Neutral Outline</Badge>
            <Badge variant="success">Match Day Active</Badge>
            <Badge variant="warning">Low Stock 8</Badge>
            <Badge variant="danger">Discontinued</Badge>
          </div>
        </section>

        {/* 3. Form Controls */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
            3. Form Inputs & Selection Controls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input label="Standard Input" placeholder="Type customer name..." />
            <Input label="With Error State" error="Invalid player number" defaultValue="999" />
            <Select
              label="Club Selector"
              options={[
                { value: 'vk', label: 'Valkyrie FC' },
                { value: 'at', label: 'Atlético del Sol' },
              ]}
            />
          </div>

          <div className="flex flex-wrap gap-8 pt-2">
            <Checkbox
              id="check-demo"
              checked={checkVal}
              onChange={(e) => setCheckVal(e.target.checked)}
              label="Official Tournament Sleeve Patch (+ $10.00)"
              description="Includes heat-bonded 3D tournament badge"
            />

            <RadioGroup
              name="demo-radio"
              value={radioVal}
              onChange={setRadioVal}
              options={[
                { value: 'valkyrie', label: 'Valkyrie FC' },
                { value: 'atletico', label: 'Atlético del Sol' },
              ]}
            />
          </div>
        </section>

        {/* 4. Feedback, Dialogs & Modals */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
            4. Interactive Modals & Feedbacks
          </h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
              Launch Dialog Modal
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
              Launch Confirmation Modal
            </Button>
            <Dropdown
              trigger={
                <Button variant="secondary" size="sm" rightIcon={<ChevronDown className="w-3.5 h-3.5" />}>
                  Action Menu Dropdown
                </Button>
              }
              items={[
                { label: 'Download Spec Sheet', onClick: () => {} },
                { label: 'Print Packing Slip', onClick: () => {} },
              ]}
            />
          </div>

          <Alert
            variant="warning"
            title="Warehouse Maintenance Window"
            message="Central distribution facility will perform automated inventory counts on Sunday at 02:00 UTC."
          />

          {/* Dialogs */}
          <Dialog
            isOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Aeroknit™ Technical Specification"
          >
            <p className="text-xs text-neutral-300 leading-relaxed">
              Every seam, yarn, and panel is calibrated for high-intensity match play. Our
              proprietary Aeroknit™ jacquard weave maintains structural airflow under sweat load
              while resisting pitch friction.
            </p>
            <div className="mt-4 flex justify-end">
              <Button variant="gold" size="sm" onClick={() => setDialogOpen(false)}>
                Acknowledge
              </Button>
            </div>
          </Dialog>

          <ConfirmationDialog
            isOpen={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => {
              setConfirmOpen(false);
              alert('Action confirmed');
            }}
            title="Archive Match Kit"
            message="Are you sure you want to archive this SKU? It will be safely moved to the recycle bin."
            confirmText="Archive SKU"
            variant="danger"
          />
        </section>
      </div>
    </CustomerLayout>
  );
};
