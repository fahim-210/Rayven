import { PaymentMethodConfig } from '../types/index.ts';

export const DEFAULT_PAYMENT_CONFIGS: PaymentMethodConfig[] = [
  {
    id: 'bKash',
    name: 'bKash Send Money / Merchant',
    accountNumber: '01712-345678',
    accountType: 'Personal',
    isActive: true,
    instructions:
      'Go to your bKash app or dial *247#. Choose "Send Money". Enter our official RAYVEN wallet number 01712345678. Enter the exact Advance or Full Amount. Save the 10-character Transaction ID (TrxID) and submit below.',
  },
  {
    id: 'Nagad',
    name: 'Nagad Send Money',
    accountNumber: '01812-345678',
    accountType: 'Personal',
    isActive: true,
    instructions:
      'Open your Nagad app or dial *167#. Select "Send Money". Send to RAYVEN account 01812345678. Enter the amount. After successful transfer, copy the Nagad Transaction ID and enter it in the form below.',
  },
  {
    id: 'Rocket',
    name: 'DBBL Rocket',
    accountNumber: '01912-345678-9',
    accountType: 'Personal',
    isActive: true,
    instructions:
      'Open DBBL Rocket app or dial *322#. Select "Send Money". Enter our 12-digit Rocket account number 019123456789. Complete payment and enter the transaction confirmation ID below.',
  },
];
