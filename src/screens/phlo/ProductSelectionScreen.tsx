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

// ─── Treatment data ───────────────────────────────────────────────────────────

const conditionTreatments: Record<string, { id: string; name: string; description: string }[]> = {
  'weight-loss': [
    { id: 'mounjaro-25',  name: 'Mounjaro (Tirzepatide) 2.5mg',  description: 'Starter dose — weekly injection pen' },
    { id: 'mounjaro-5',   name: 'Mounjaro (Tirzepatide) 5mg',    description: 'Maintenance dose — weekly injection pen' },
    { id: 'wegovy-025',   name: 'Wegovy (Semaglutide) 0.25mg',   description: 'Starter dose — weekly injection pen' },
    { id: 'wegovy-05',    name: 'Wegovy (Semaglutide) 0.5mg',    description: 'Maintenance dose — weekly injection pen' },
  ],
  contraception: [
    { id: 'cerelle',      name: 'Cerelle',         description: 'Progestogen-only pill (mini-pill)' },
    { id: 'noriday',      name: 'Noriday',         description: 'Progestogen-only pill (mini-pill)' },
    { id: 'microgynon',   name: 'Microgynon 30',   description: 'Combined contraceptive pill' },
    { id: 'rigevidon',    name: 'Rigevidon',       description: 'Combined contraceptive pill' },
  ],
  'erectile-dysfunction': [
    { id: 'sildenafil-50',  name: 'Sildenafil 50mg',  description: 'Generic Viagra — as needed' },
    { id: 'sildenafil-100', name: 'Sildenafil 100mg', description: 'Generic Viagra — higher dose' },
    { id: 'tadalafil-10',   name: 'Tadalafil 10mg',   description: 'Generic Cialis — as needed' },
    { id: 'tadalafil-5',    name: 'Tadalafil 5mg',    description: 'Generic Cialis — daily use' },
  ],
  'hair-loss': [
    { id: 'finasteride-1', name: 'Finasteride 1mg',       description: 'Daily oral tablet for male pattern hair loss' },
    { id: 'minoxidil-5',   name: 'Minoxidil 5% Solution', description: 'Topical solution — applied twice daily' },
  ],
};

const conditionLabel: Record<string, string> = {
  'weight-loss': 'weight loss',
  contraception: 'contraception',
  'erectile-dysfunction': 'erectile dysfunction',
  'hair-loss': 'hair loss',
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProductSelectionScreen() {
  const condition = new URLSearchParams(window.location.search).get('condition') ?? 'weight-loss';
  const treatments = conditionTreatments[condition] ?? conditionTreatments['weight-loss']!;
  const [selected, setSelected] = useState('');

  return (
    <QuestionnaireLayout progress={75} step="2" onBack={() => window.history.back()}>
      <QContent>
        <Text style={s.heading}>Choose your treatment</Text>
        <Text style={s.subheading}>
          Select the {conditionLabel[condition] ?? condition} treatment you'd like to order.
        </Text>

        <View style={s.cards}>
          {treatments.map((t) => {
            const isSelected = selected === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[s.card, isSelected && s.cardSelected]}
                onPress={() => setSelected(t.id)}
                activeOpacity={0.8}
              >
                {/* Icon box */}
                <View style={s.iconBox} />

                {/* Text */}
                <View style={s.cardText}>
                  <Text style={[s.cardName, isSelected && s.cardNameSelected]}>{t.name}</Text>
                  <Text style={s.cardDesc}>{t.description}</Text>
                </View>

                {/* Check circle */}
                {isSelected && (
                  <View style={s.checkCircle}>
                    <Text style={s.checkTick}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.desktopCta}>
          <PhloButton
            label="Continue"
            disabled={!selected}
            fullWidth={false}
            onPress={() => navigate(`/phlo/product-selection/supply?treatment=${selected}&condition=${condition}`)}
          />
        </View>
      </QContent>

      <StickyBottom>
        <PhloButton
          label="Continue"
          disabled={!selected}
          onPress={() => navigate(`/phlo/product-selection/supply?treatment=${selected}&condition=${condition}`)}
        />
      </StickyBottom>
    </QuestionnaireLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  heading: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 24, lineHeight: 32, fontWeight: '600',
    color: C.textPrimary,
    marginBottom: 8,
  },
  subheading: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, color: C.textTertiary,
    marginBottom: 24,
  },

  cards: { gap: 12, marginBottom: 32 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: C.borderContainer,
    backgroundColor: C.white,
    // @ts-ignore — web-only
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  cardSelected: {
    borderColor: C.primaryMain,
    backgroundColor: C.primary25,
  },

  iconBox: {
    width: 48, height: 48,
    borderRadius: 8,
    backgroundColor: C.primary25,
    flexShrink: 0,
  },

  cardText: { flex: 1, gap: 2 },
  cardName: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 15, fontWeight: '600',
    color: C.textPrimary,
  },
  cardNameSelected: { color: C.primaryMain },
  cardDesc: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13, color: C.textSecondary,
  },

  checkCircle: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: C.primaryMain,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  checkTick: {
    fontSize: 12, color: '#fff',
  },

  desktopCta: {
    // @ts-ignore — web-only
    display: 'none',
  },
});
