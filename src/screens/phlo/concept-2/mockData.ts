export const mockOrders = [
  // 1. ORDER_PLACED — order confirmed, photos needed
  {
    id: 'ord-001',
    orderNumber: '1234-5678-9012',
    treatmentName: 'Mounjaro KwikPen 5mg',
    supply: '1 pen',
    status: 'ORDER_PLACED' as const,
    price: '£169.00',
    orderedDate: '10 Apr 2025',
    deliveryDate: null as string | null,
    address: '14 Rosewood Avenue, London, SW4 7BN',
  },

  // 2. IN_REVIEW_NO_ACTION — details received, prescriber reviewing
  {
    id: 'ord-008',
    orderNumber: '2345-6789-0123',
    treatmentName: 'Mounjaro KwikPen 5mg',
    supply: '1 pen',
    status: 'IN_REVIEW_NO_ACTION' as const,
    price: '£169.00',
    orderedDate: '14 Apr 2025',
    deliveryDate: null as string | null,
    address: '14 Rosewood Avenue, London, SW4 7BN',
  },

  // 3. IN_REVIEW_EVIDENCE_REQUIRED — prescriber has a question
  {
    id: 'ord-009',
    orderNumber: '3456-7890-1234',
    treatmentName: 'Wegovy 0.25mg',
    supply: '1 pen',
    status: 'IN_REVIEW_EVIDENCE_REQUIRED' as const,
    price: '£189.00',
    orderedDate: '11 Apr 2025',
    deliveryDate: null as string | null,
    address: '14 Rosewood Avenue, London, SW4 7BN',
  },

  // 4. IN_REVIEW_UPLOADED — photos uploaded, awaiting review
  {
    id: 'ord-010',
    orderNumber: '4567-8901-2345',
    treatmentName: 'Mounjaro KwikPen 2.5mg',
    supply: '1 pen',
    status: 'IN_REVIEW_UPLOADED' as const,
    price: '£149.00',
    orderedDate: '9 Apr 2025',
    deliveryDate: null as string | null,
    address: '14 Rosewood Avenue, London, SW4 7BN',
  },

  // 5. PRESCRIBER_REVIEW — in prescriber review, no issues
  {
    id: 'ord-002',
    orderNumber: '5678-9012-3456',
    treatmentName: 'Mounjaro KwikPen 2.5mg',
    supply: '1 pen',
    status: 'PRESCRIBER_REVIEW' as const,
    price: '£149.00',
    orderedDate: '10 Mar 2025',
    deliveryDate: null as string | null,
    address: '14 Rosewood Avenue, London, SW4 7BN',
  },

  // 6. PREPARING_YOUR_ORDER — approved, preparing to dispatch
  {
    id: 'ord-003',
    orderNumber: '6789-0123-4567',
    treatmentName: 'Mounjaro KwikPen 2.5mg',
    supply: '1 pen',
    status: 'PREPARING_YOUR_ORDER' as const,
    price: '£149.00',
    orderedDate: '10 Feb 2025',
    deliveryDate: null as string | null,
    address: '14 Rosewood Avenue, London, SW4 7BN',
  },

  // 7. DISPATCHED — physically collected by courier
  {
    id: 'ord-004',
    orderNumber: '7890-1234-5678',
    treatmentName: 'Wegovy 0.25mg',
    supply: '1 pen',
    status: 'DISPATCHED' as const,
    price: '£189.00',
    orderedDate: '22 Apr 2025',
    deliveryDate: '28 Apr 2025' as string | null,
    address: '14 Rosewood Avenue, London, SW4 7BN',
  },

  // 8. DELIVERED — delivered, reorder nudge shown
  {
    id: 'ord-005',
    orderNumber: '8901-2345-6789',
    treatmentName: 'Mounjaro KwikPen 5mg',
    supply: '3 pens',
    status: 'DELIVERED' as const,
    price: '£469.00',
    orderedDate: '1 Apr 2025',
    deliveryDate: '6 Apr 2025' as string | null,
    address: '14 Rosewood Avenue, London, SW4 7BN',
  },

  // 9. DELIVERED_CONFIRMED — final delivered state
  {
    id: 'ord-012',
    orderNumber: '9012-3456-7890',
    treatmentName: 'Mounjaro KwikPen 2.5mg',
    supply: '1 pen',
    status: 'DELIVERED_CONFIRMED' as const,
    price: '£149.00',
    orderedDate: '10 Jan 2025',
    deliveryDate: '14 Jan 2025' as string | null,
    address: '14 Rosewood Avenue, London, SW4 7BN',
  },

  // 10. REJECTED — not approved
  {
    id: 'ord-011',
    orderNumber: '0123-4567-8901',
    treatmentName: 'Mounjaro KwikPen 2.5mg',
    supply: '1 pen',
    status: 'REJECTED' as const,
    price: '£149.00',
    orderedDate: '5 Feb 2025',
    deliveryDate: null as string | null,
    address: '14 Rosewood Avenue, London, SW4 7BN',
  },

  // 11. CANCELLED — patient cancelled
  {
    id: 'ord-013',
    orderNumber: '1357-2468-0246',
    treatmentName: 'Wegovy 0.25mg',
    supply: '1 pen',
    status: 'CANCELLED' as const,
    price: '£189.00',
    orderedDate: '3 Feb 2025',
    deliveryDate: null as string | null,
    address: '14 Rosewood Avenue, London, SW4 7BN',
  },

  // 12. ON_HOLD — on hold, upload needed
  {
    id: 'ord-006',
    orderNumber: '2468-1357-9753',
    treatmentName: 'Wegovy 0.5mg',
    supply: '1 pen',
    status: 'ON_HOLD' as const,
    price: '£199.00',
    orderedDate: '12 Apr 2025',
    deliveryDate: null as string | null,
    address: '14 Rosewood Avenue, London, SW4 7BN',
  },

  // 13. PAYMENT_FAILED — payment failed
  {
    id: 'ord-007',
    orderNumber: '3579-8642-0864',
    treatmentName: 'Mounjaro KwikPen 2.5mg',
    supply: '1 pen',
    status: 'PAYMENT_FAILED' as const,
    price: '£149.00',
    orderedDate: '8 Mar 2025',
    deliveryDate: null as string | null,
    address: '14 Rosewood Avenue, London, SW4 7BN',
  },
] as const;

export type MockOrder = typeof mockOrders[number];

export const mockWeightHistory = [
  { id: 'wh-1', weight_lbs: 180.8, weight_kg: 82.0, date: new Date('2025-04-10'), type: 'check-in' as const, verified: false },
  { id: 'wh-2', weight_lbs: 183.4, weight_kg: 83.2, date: new Date('2025-03-10'), type: 'check-in' as const, verified: true },
  { id: 'wh-3', weight_lbs: 186.1, weight_kg: 84.4, date: new Date('2025-02-10'), type: 'check-in' as const, verified: false },
  { id: 'wh-4', weight_lbs: 190.5, weight_kg: 86.4, date: new Date('2025-01-15'), type: 'starting-weight' as const, verified: false },
];

export const mockPatient = {
  firstName: 'Sarah',
  lastName: 'Mitchell',
  email: 'sarah.mitchell@example.com',
  mobile: '+44 7700 900123',
  dob: '15/06/1988',
  addressLine1: '14 Rosewood Avenue',
  city: 'London',
  postcode: 'SW4 7BN',
};
