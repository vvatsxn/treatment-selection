import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  QuestionnaireLayout,
  QContent,
  StickyBottom,
  PhloButton,
  navigate,
  C,
} from './PhloLayout';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface SupplyOption {
  id: string;
  months: number;
  price: number;
  pricePerMonth: number;
  isBestValue?: boolean;
  saving?: number;
}

const supplyOptions: SupplyOption[] = [
  { id: '1m', months: 1, price: 149, pricePerMonth: 149 },
  { id: '3m', months: 3, price: 399, pricePerMonth: 133, isBestValue: true, saving: 48 },
  { id: '6m', months: 6, price: 749, pricePerMonth: 124, saving: 145 },
];

const treatmentLabel: Record<string, string> = {
  'mounjaro-25': 'Mounjaro 2.5mg',
  'mounjaro-5':  'Mounjaro 5mg',
  'wegovy-025':  'Wegovy 0.25mg',
  'wegovy-05':   'Wegovy 0.5mg',
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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SupplyDurationScreen() {
  const params = new URLSearchParams(window.location.search);
  const condition = params.get('condition') ?? 'weight-loss';
  const treatment = params.get('treatment') ?? '';
  const displayName = treatmentLabel[treatment] ?? 'Your selected treatment';

  const [selected, setSelected] = useState('');

  return (
    <QuestionnaireLayout progress={85} step="2" onBack={() => window.history.back()}>
      <QContent>
        {/* Selected treatment summary banner */}
        <View style={s.selectedBanner}>
          <View style={s.selectedDot} />
          <View style={s.selectedTextWrap}>
            <Text style={s.selectedLabel}>YOUR SELECTED PRODUCT</Text>
            <Text style={s.selectedName}>{displayName}</Text>
          </View>
        </View>

        <Text style={s.heading}>Select supply duration</Text>
        <Text style={s.subheading}>We'll send your entire supply in one delivery.</Text>

        <View style={s.cards}>
          {supplyOptions.map((option) => {
            const isSelected = selected === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[s.card, isSelected && s.cardSelected]}
                onPress={() => setSelected(option.id)}
                activeOpacity={0.8}
              >
                {option.isBestValue && (
                  <View style={s.bestValueBadge}>
                    <Text style={s.bestValueText}>Best value</Text>
                  </View>
                )}
                <View style={s.cardRow}>
                  <View style={s.cardLeft}>
                    <Text style={s.months}>{option.months} month supply</Text>
                    <Text style={s.perMonth}>£{option.pricePerMonth}/month</Text>
                    {option.saving != null && (
                      <Text style={s.saving}>Save £{option.saving}</Text>
                    )}
                  </View>
                  <View style={s.cardRight}>
                    <Text style={s.price}>£{option.price}</Text>
                    {isSelected && (
                      <View style={s.checkCircle}>
                        <Text style={s.checkTick}>✓</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.desktopCta}>
          <PhloButton
            label="Continue"
            disabled={!selected}
            fullWidth={false}
            onPress={() => navigate(`/phlo/checkout?treatment=${treatment}&supply=${selected}&condition=${condition}`)}
          />
        </View>
      </QContent>

      <StickyBottom>
        <PhloButton
          label="Continue"
          disabled={!selected}
          onPress={() => navigate(`/phlo/checkout?treatment=${treatment}&supply=${selected}&condition=${condition}`)}
        />
      </StickyBottom>
    </QuestionnaireLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.primary25,
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
  },
  selectedDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: C.primaryMain,
    flexShrink: 0,
  },
  selectedTextWrap: { flexDirection: 'column' },
  selectedLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12, fontWeight: '600',
    color: C.primaryMain,
    letterSpacing: 0.7,
  },
  selectedName: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 15, fontWeight: '600',
    color: C.textPrimary,
  },

  heading: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 20, lineHeight: 28, fontWeight: '600',
    color: C.textPrimary,
    marginBottom: 4,
  },
  subheading: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, color: C.textTertiary,
    marginBottom: 20,
  },

  cards: { gap: 12, marginBottom: 32 },

  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: C.borderContainer,
    backgroundColor: C.white,
    gap: 8,
    position: 'relative',
    // @ts-ignore — web-only
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  cardSelected: {
    borderColor: C.primaryMain,
    backgroundColor: C.primary25,
  },

  bestValueBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    borderRadius: 40,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  bestValueText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 11, fontWeight: '600',
    color: '#16A34A',
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLeft: { gap: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },

  months: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16, fontWeight: '600',
    color: C.textPrimary,
  },
  perMonth: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13, color: C.textTertiary,
  },
  saving: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13, color: '#16A34A',
  },
  price: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 20, fontWeight: '600',
    color: C.textPrimary,
  },

  checkCircle: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: C.primaryMain,
    alignItems: 'center', justifyContent: 'center',
  },
  checkTick: { fontSize: 12, color: '#fff' },

  desktopCta: {
    // @ts-ignore — web-only
    display: 'none',
  },
});
