import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import {
  QuestionnaireLayout,
  QContent,
  PhloButton,
  navigate,
  C,
} from './PhloLayout';

// ─── Static data ──────────────────────────────────────────────────────────────

const treatmentLabels: Record<string, string> = {
  'mounjaro-25': 'Mounjaro (Tirzepatide) 2.5mg',
  'mounjaro-5':  'Mounjaro (Tirzepatide) 5mg',
  'wegovy-025':  'Wegovy (Semaglutide) 0.25mg',
  'wegovy-05':   'Wegovy (Semaglutide) 0.5mg',
  cerelle:       'Cerelle 75mcg',
  noriday:       'Noriday 350mcg',
  microgynon:    'Microgynon 30',
  rigevidon:     'Rigevidon',
  'sildenafil-50':  'Sildenafil 50mg',
  'sildenafil-100': 'Sildenafil 100mg',
  'tadalafil-10':   'Tadalafil 10mg',
  'tadalafil-5':    'Tadalafil 5mg',
  'finasteride-1':  'Finasteride 1mg',
  'minoxidil-5':    'Minoxidil 5%',
};

const supplyLabels: Record<string, { label: string; price: number }> = {
  '1m': { label: '1 month supply', price: 149 },
  '3m': { label: '3 month supply', price: 399 },
  '6m': { label: '6 month supply', price: 749 },
};

const patient = {
  name: 'Sarah Mitchell',
  email: 'sarah.mitchell@example.com',
  address: '14 Rosewood Avenue, London, SW4 7BN',
};

function getParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    treatment: p.get('treatment') ?? 'mounjaro-5',
    supply:    p.get('supply')    ?? '1m',
  };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CheckoutScreen() {
  const { treatment, supply } = getParams();
  const [discountCode, setDiscountCode] = useState('');
  const [placed, setPlaced] = useState(false);

  const treatmentName = treatmentLabels[treatment] ?? treatment;
  const supplyInfo    = supplyLabels[supply] ?? { label: '1 month supply', price: 149 };
  const total         = supplyInfo.price;

  if (placed) {
    return (
      <QuestionnaireLayout showLogo>
        <QContent style={s.centred}>
          <View style={s.successCircle}>
            <Text style={s.successCheck}>✓</Text>
          </View>
          <Text style={s.successHeading}>Order placed!</Text>
          <Text style={s.successBody}>
            Your order is being reviewed by a clinician. We'll email you once it's approved.
          </Text>

          <View style={s.summaryCard}>
            {[
              { label: 'Order number', value: 'PHL-2025-0042' },
              { label: 'Treatment',    value: treatmentName },
              { label: 'Supply',       value: supplyInfo.label },
              { label: 'Total paid',   value: `£${total.toFixed(2)}` },
            ].map((row) => (
              <View key={row.label} style={s.summaryRow}>
                <Text style={s.summaryKey}>{row.label}</Text>
                <Text style={s.summaryVal}>{row.value}</Text>
              </View>
            ))}
          </View>

          <PhloButton
            label="Go to My Account"
            onPress={() => navigate('/phlo/my-account')}
          />
        </QContent>
      </QuestionnaireLayout>
    );
  }

  return (
    <QuestionnaireLayout progress={95} step="3" onBack={() => window.history.back()}>
      <QContent>
        <Text style={s.heading}>Order summary</Text>

        {/* Treatment card */}
        <SectionCard title="Your treatment">
          <View style={s.treatmentRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.treatmentName}>{treatmentName}</Text>
              <Text style={s.treatmentSub}>{supplyInfo.label}</Text>
            </View>
            <Text style={s.treatmentPrice}>£{supplyInfo.price.toFixed(2)}</Text>
          </View>
        </SectionCard>

        {/* Delivery card */}
        <SectionCard title="Delivery">
          <View style={s.deliveryRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.detailText}>Standard tracked delivery</Text>
              <Text style={s.detailSub}>3–5 working days once approved</Text>
              <Text style={s.detailSub}>{patient.address}</Text>
            </View>
            <Text style={s.freeText}>Free</Text>
          </View>
        </SectionCard>

        {/* Your details card */}
        <SectionCard title="Your details">
          {[
            { label: 'Name',  value: patient.name },
            { label: 'Email', value: patient.email },
          ].map((row) => (
            <View key={row.label} style={s.detailRow}>
              <Text style={s.detailLabel}>{row.label}</Text>
              <Text style={s.detailValue}>{row.value}</Text>
            </View>
          ))}
        </SectionCard>

        {/* Discount code card */}
        <SectionCard title="Discount code">
          <View style={s.discountRow}>
            <TextInput
              style={s.discountInput}
              placeholder="Enter code"
              placeholderTextColor="#9CA3AF"
              value={discountCode}
              onChangeText={setDiscountCode}
            />
            <View style={{ width: 100 }}>
              <PhloButton
                label="Apply"
                variant="secondary"
                disabled={!discountCode}
                onPress={() => {}}
                fullWidth={false}
              />
            </View>
          </View>
        </SectionCard>

        {/* Total */}
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>£{total.toFixed(2)}</Text>
        </View>

        <Text style={s.disclaimer}>
          Payment will only be taken once your prescription is approved by a clinician.
        </Text>
      </QContent>

      {/* Sticky bottom CTA */}
      <View style={s.stickyBottom}>
        <View style={s.mobileTotalRow}>
          <Text style={s.mobileTotalLabel}>Total</Text>
          <Text style={s.mobileTotalValue}>£{total.toFixed(2)}</Text>
        </View>
        <PhloButton label="Place order" onPress={() => setPlaced(true)} />
      </View>
    </QuestionnaireLayout>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.sectionCard}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  centred: {
    alignItems: 'center',
    paddingTop: 80,
  } as any,

  successCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#F0FDF4',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  successCheck: { fontSize: 28, color: '#16A34A' },
  successHeading: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 24, fontWeight: '700',
    color: C.textPrimary,
    marginBottom: 12, textAlign: 'center',
  },
  successBody: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, color: '#6B7280',
    textAlign: 'center', marginBottom: 32,
  },
  summaryCard: {
    width: '100%' as any,
    backgroundColor: C.white,
    borderWidth: 1, borderColor: C.borderContainer,
    borderRadius: 8, padding: 20,
    gap: 12, marginBottom: 32,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', gap: 8,
  },
  summaryKey: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, color: '#9CA3AF',
  },
  summaryVal: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, fontWeight: '600',
    color: C.textPrimary, textAlign: 'right', flex: 1,
  },

  heading: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 24, fontWeight: '700',
    color: C.textPrimary, marginBottom: 24,
  },

  sectionCard: {
    backgroundColor: C.white,
    borderWidth: 1, borderColor: C.borderContainer,
    borderRadius: 8, padding: 20,
    gap: 12, marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 16, fontWeight: '600',
    color: C.textPrimary,
  },

  treatmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  treatmentName: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 15, fontWeight: '600',
    color: C.textPrimary,
  },
  treatmentSub: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13, color: '#9CA3AF',
  },
  treatmentPrice: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 18, fontWeight: '600',
    color: C.textPrimary,
  },

  deliveryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
  },
  detailText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, color: C.textPrimary,
  },
  detailSub: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13, color: '#9CA3AF',
  },
  freeText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, fontWeight: '600',
    color: '#16A34A',
  },

  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', gap: 8,
  },
  detailLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, color: '#9CA3AF', flexShrink: 0,
  },
  detailValue: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, color: C.textPrimary,
    textAlign: 'right', flex: 1,
  },

  discountRow: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
  },
  discountInput: {
    flex: 1, height: 48,
    borderWidth: 1, borderColor: C.borderContainer,
    borderRadius: 8, paddingHorizontal: 14,
    fontFamily: "'Inter', sans-serif",
    fontSize: 16, color: C.textPrimary,
    // @ts-ignore — web-only
    outlineStyle: 'none',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.primary25,
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  },
  totalLabel: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 16, fontWeight: '600',
    color: C.textPrimary,
  },
  totalValue: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 22, fontWeight: '700',
    color: C.textPrimary,
  },
  disclaimer: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12, color: '#9CA3AF',
    textAlign: 'center', marginBottom: 24,
  },

  stickyBottom: {
    position: 'sticky' as any,
    bottom: 0,
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: C.borderContainer,
    gap: 8,
  },
  mobileTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mobileTotalLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, color: '#9CA3AF',
  },
  mobileTotalValue: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 18, fontWeight: '700',
    color: C.textPrimary,
  },
});
