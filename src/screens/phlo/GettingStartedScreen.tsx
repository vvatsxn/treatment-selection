import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import {
  QuestionnaireLayout,
  QContent,
  StickyBottom,
  PhloButton,
  navigate,
  C,
} from './PhloLayout';

function getCondition(): string {
  return new URLSearchParams(window.location.search).get('condition') ?? 'weight-loss';
}

const conditionMeta: Record<string, { title: string; subtitle: string }> = {
  'weight-loss':          { title: 'My weight loss journey',         subtitle: 'Clinically-proven GLP-1 treatment' },
  'contraception':        { title: 'My contraception journey',       subtitle: 'Safe, reliable contraception' },
  'erectile-dysfunction': { title: 'My erectile dysfunction journey', subtitle: 'Discreet, effective treatment' },
  'hair-loss':            { title: 'My hair loss journey',           subtitle: 'Clinically proven solutions' },
};

const bullets = [
  'FDA-approved weekly injections',
  'Clinician-prescribed treatment',
  'Delivered discreetly to your door',
];

export default function GettingStartedScreen() {
  const condition = getCondition();
  const meta = conditionMeta[condition] ?? conditionMeta['weight-loss']!;
  const isWeightLoss = condition === 'weight-loss';

  return (
    <QuestionnaireLayout showLogo>
      <QContent>
        {isWeightLoss ? (
          /* Weight loss variant — mirrors OptimisedLandingView */
          <View style={s.weightLossWrap}>
            {/* boxes.png image */}
            <View style={s.imageWrapper}>
              <Image
                source={require('./assets/boxes.png')}
                style={s.heroImage}
                resizeMode="contain"
              />
            </View>

            <View style={s.textBlock}>
              {/* Subtitle */}
              <Text style={s.subtitle}>{meta.title}</Text>
              {/* Title */}
              <Text style={s.title}>{meta.subtitle}</Text>
            </View>

            {/* Bullets */}
            <View style={s.bullets}>
              {bullets.map((b) => (
                <View key={b} style={s.bulletRow}>
                  <Text style={s.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          /* Generic condition landing */
          <View style={s.genericWrap}>
            <Text style={s.subtitle}>{meta.title}</Text>
            <Text style={s.title}>{meta.subtitle}</Text>
          </View>
        )}
      </QContent>

      {/* Sticky bottom CTA — matches ButtonContainer in prototype */}
      <StickyBottom>
        <PhloButton
          label="I'm new to Phlo Clinic"
          onPress={() => navigate(`/phlo/questionnaire?condition=${condition}`)}
        />
        <PhloButton
          label="I've used Phlo Clinic before"
          variant="secondary"
          onPress={() => navigate('/phlo/sign-in')}
        />
      </StickyBottom>
    </QuestionnaireLayout>
  );
}

const s = StyleSheet.create({
  weightLossWrap: {
    alignItems: 'center',
    width: '100%' as any,
    marginTop: 20,
  },
  imageWrapper: {
    width: 320,
    maxWidth: '100%' as any,
    alignSelf: 'center',
  },
  heroImage: {
    width: '100%' as any,
    height: undefined,
    aspectRatio: 1,
  },
  textBlock: {
    gap: 4,
    marginBottom: 24,
    width: '100%' as any,
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    lineHeight: 24,
    color: C.textSecondary,
    textAlign: 'center',
  },
  title: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
    color: C.textPrimary,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  bullets: {
    width: '100%' as any,
    gap: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    lineHeight: 20,
    color: C.textSecondary,
  },

  // Generic variant
  genericWrap: {
    alignItems: 'center',
    marginTop: '15%' as any,
    marginHorizontal: 16,
    marginBottom: 40,
  },
});
