import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { pippTheme } from '../theme/pipp';
import PIPPButton from '../components/PIPPButton';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const MEDICATIONS = {
  wegovy: {
    name: 'Wegovy',
    subtitle: 'Semaglutide',
    price: '£89',
    image: require('../images/wegovy-pen.png'),
    imageWidth: 100,
    imageHeight: 420,
    imageBottom: -120,
    gradient: 'linear-gradient(171deg, #DCF2FF 7%, #FFFFFF 93%)',
    doses: ['0.25mg', '0.5mg', '1mg', '1.7mg', '2.4mg'],
    doseLabels: ['0.25', '0.5', '1', '1.7', '2.4'],
    startingDose: '0.25mg',
  },
  mounjaro: {
    name: 'Mounjaro',
    subtitle: 'Tirzepatide',
    price: '£89',
    image: require('../images/mounjaro-pen.png'),
    imageWidth: 80,
    imageHeight: 340,
    imageBottom: -100,
    gradient: 'linear-gradient(171deg, #F8EBFF 7%, #FFFFFF 93%)',
    doses: ['2.5mg', '5mg', '7.5mg', '10mg', '12.5mg'],
    doseLabels: ['2.5', '5', '7.5', '10', '12.5'],
    startingDose: '2.5mg',
  },
};

const BUNDLES = {
  single: {
    key: 'single',
    title: '1 Pen',
    subtitle: '1 month supply',
    price: '£89',
    priceValue: 89,
    perPen: '£89 per pen',
  },
  bundle: {
    key: 'bundle',
    title: '2 Pen Bundle',
    subtitle: '2 months supply',
    price: '£168',
    priceValue: 168,
    originalPrice: '£178',
    perPen: '£84 per pen',
    savings: 'Save £10',
    bestValue: true,
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Concept7Screen: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);

  const goTo = (nextStep: number) => {
    setStep(nextStep);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    if (step > 0) goTo(step - 1);
  };

  const med = selectedMedication
    ? MEDICATIONS[selectedMedication as keyof typeof MEDICATIONS]
    : null;

  const bundle = selectedBundle
    ? BUNDLES[selectedBundle as keyof typeof BUNDLES]
    : null;

  // -----------------------------------------------------------------------
  // Back Arrow
  // -----------------------------------------------------------------------
  const renderBackArrow = () => (
    <TouchableOpacity
      onPress={goBack}
      style={styles.backArrow}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Image
        source={require('../theme/icons/arrow-back.svg')}
        style={[styles.backArrowIcon, { tintColor: pippTheme.colors.surface.brand }]}
      />
    </TouchableOpacity>
  );

  // -----------------------------------------------------------------------
  // Medication badge pill
  // -----------------------------------------------------------------------
  const renderMedicationBadge = () => {
    if (!med) return null;
    return (
      <View style={styles.medicationBadge}>
        <Text style={styles.medicationBadgeText}>{med.name}</Text>
      </View>
    );
  };

  // -----------------------------------------------------------------------
  // Screen 0: Hero Landing
  // -----------------------------------------------------------------------
  const renderHeroLanding = () => (
    <View style={styles.heroContainer}>
      <View style={styles.heroLogoContainer}>
        <Image
          source={require('../images/phlo-clinic-logo-default.png')}
          style={styles.heroLogo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.heroContent}>
        <Text style={styles.heroHeading}>
          {'Begin your\nweight loss journey'}
        </Text>
        <Text style={styles.heroSubtext}>
          {'Clinically proven GLP-1 treatments,\npersonalised to you.'}
        </Text>
      </View>

      <View style={styles.heroBottom}>
        <PIPPButton text="Get started" onPress={() => goTo(1)} />
        <Text style={styles.heroSmallText}>Takes less than 2 minutes</Text>
      </View>
    </View>
  );

  // -----------------------------------------------------------------------
  // Screen 1: Medication Selection
  // -----------------------------------------------------------------------
  const renderMedicationCard = (key: string) => {
    const m = MEDICATIONS[key as keyof typeof MEDICATIONS];
    const isSelected = selectedMedication === key;

    return (
      <TouchableOpacity
        key={key}
        activeOpacity={0.9}
        onPress={() => setSelectedMedication(key)}
        style={[
          styles.medCard,
          { backgroundImage: m.gradient } as any,
          isSelected ? styles.medCardSelected : styles.medCardUnselected,
        ]}
      >
        <View style={styles.medCardImageContainer}>
          <Image
            source={m.image}
            style={
              {
                width: m.imageWidth,
                height: m.imageHeight,
                position: 'absolute' as any,
                bottom: m.imageBottom,
                alignSelf: 'center',
              } as any
            }
            resizeMode="contain"
          />
        </View>

        <View style={styles.medCardOverlay}>
          <Text style={styles.medCardName}>{m.name}</Text>
          <Text style={styles.medCardSubtitle}>{m.subtitle}</Text>
          <Text style={styles.medCardPrice}>From {m.price} per pen</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMedicationSelection = () => (
    <View style={styles.screenContainer}>
      {renderBackArrow()}

      <View style={styles.medCardsContainer}>
        {renderMedicationCard('wegovy')}
        {renderMedicationCard('mounjaro')}
      </View>

      <Text style={styles.medApprovedText}>
        Both treatments are clinically proven and NHS approved
      </Text>

      <View style={styles.ctaContainer}>
        <PIPPButton
          text="Continue"
          onPress={() => goTo(2)}
          disabled={!selectedMedication}
        />
      </View>
    </View>
  );

  // -----------------------------------------------------------------------
  // Screen 2: Bundle Selection
  // -----------------------------------------------------------------------
  const renderBundleCard = (bundleKey: string) => {
    const b = BUNDLES[bundleKey as keyof typeof BUNDLES];
    const isSelected = selectedBundle === bundleKey;

    return (
      <TouchableOpacity
        key={bundleKey}
        activeOpacity={0.9}
        onPress={() => setSelectedBundle(bundleKey)}
        style={[
          styles.bundleCard,
          isSelected ? styles.bundleCardSelected : styles.bundleCardUnselected,
        ]}
      >
        {b.bestValue && (
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>BEST VALUE</Text>
          </View>
        )}

        <View style={styles.bundleRow}>
          <View style={styles.bundleLeft}>
            <Text style={styles.bundleTitle}>{b.title}</Text>
            <Text style={styles.bundleSubtitle}>{b.subtitle}</Text>
            {b.savings && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>{b.savings}</Text>
              </View>
            )}
          </View>

          <View style={styles.bundleRight}>
            <Text style={styles.bundlePrice}>{b.price}</Text>
            {b.originalPrice ? (
              <>
                <Text style={styles.bundleOriginalPrice}>{b.originalPrice}</Text>
                <Text style={styles.bundlePerPen}>{b.perPen}</Text>
              </>
            ) : (
              <Text style={styles.bundlePerPenSubtle}>per pen</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBundleSelection = () => (
    <View style={styles.screenContainer}>
      {renderBackArrow()}

      <View style={styles.screenContent}>
        {renderMedicationBadge()}
        <Text style={styles.sectionHeading}>Choose your plan</Text>

        <View style={styles.bundleCardsContainer}>
          {renderBundleCard('single')}
          {renderBundleCard('bundle')}
        </View>

        <Text style={styles.deliveryText}>
          Delivered to your door in discreet packaging
        </Text>
      </View>

      <View style={styles.ctaContainer}>
        <PIPPButton
          text="Continue"
          onPress={() => goTo(3)}
          disabled={!selectedBundle}
        />
      </View>
    </View>
  );

  // -----------------------------------------------------------------------
  // Screen 3: Dose Preview
  // -----------------------------------------------------------------------
  const renderDosePreview = () => {
    if (!med) return null;

    const doseColors =
      selectedMedication === 'wegovy'
        ? pippTheme.colors.doses.wegovy
        : pippTheme.colors.doses.mounjaro;

    const startingDoseColor =
      doseColors[med.startingDose as keyof typeof doseColors] ||
      pippTheme.colors.surface.brand;

    const segmentCount = med.doses.length;
    const segmentWidthPercent = 100 / segmentCount;

    return (
      <View style={styles.screenContainer}>
        {renderBackArrow()}

        <View style={styles.screenContent}>
          {renderMedicationBadge()}
          <Text style={styles.sectionHeading}>Your starting dose</Text>

          {/* Large dose circle */}
          <View style={styles.doseCircleContainer}>
            <View
              style={[
                styles.doseCircle,
                { borderColor: startingDoseColor },
              ]}
            >
              <Text style={[styles.doseCircleText, { color: startingDoseColor }]}>
                {med.startingDose}
              </Text>
            </View>
            <Text style={styles.doseCircleLabel}>Starting dose</Text>
          </View>

          {/* Dose progression bar */}
          <View style={styles.doseBarContainer}>
            <View style={styles.doseBarTrack}>
              <View
                style={
                  [
                    styles.doseBarFill,
                    {
                      width: `${segmentWidthPercent}%`,
                      backgroundImage: `linear-gradient(90deg, ${startingDoseColor}, ${startingDoseColor}88)`,
                    },
                  ] as any
                }
              />
            </View>

            <View style={styles.doseLabelsRow}>
              {med.doseLabels.map((label, index) => (
                <Text
                  key={label}
                  style={[
                    styles.doseLabel,
                    index === 0
                      ? {
                          fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
                          color: startingDoseColor,
                        }
                      : {},
                  ]}
                >
                  {label}
                </Text>
              ))}
            </View>
          </View>

          <Text style={styles.doseExplanation}>
            Your clinician will gradually increase your dose over time to minimise side effects.
          </Text>
        </View>

        <View style={styles.ctaContainer}>
          <PIPPButton text="Continue" onPress={() => goTo(4)} />
        </View>
      </View>
    );
  };

  // -----------------------------------------------------------------------
  // Screen 4: Summary
  // -----------------------------------------------------------------------
  const renderSummary = () => {
    if (!med || !bundle) return null;

    const doseColors =
      selectedMedication === 'wegovy'
        ? pippTheme.colors.doses.wegovy
        : pippTheme.colors.doses.mounjaro;

    const startingDoseColor =
      doseColors[med.startingDose as keyof typeof doseColors] ||
      pippTheme.colors.surface.brand;

    const medGradient = med.gradient;

    return (
      <View style={styles.screenContainer}>
        {renderBackArrow()}

        <View style={styles.screenContent}>
          <Text style={[styles.sectionHeading, { textAlign: 'center' }]}>
            Your plan summary
          </Text>

          {/* Receipt card */}
          <View style={styles.receiptCard}>
            {/* Top gradient area with medication image */}
            <View
              style={
                [
                  styles.receiptImageArea,
                  { backgroundImage: medGradient },
                ] as any
              }
            >
              <Image
                source={med.image}
                style={styles.receiptImage}
                resizeMode="contain"
              />
            </View>

            {/* Content section */}
            <View style={styles.receiptContent}>
              <Text style={styles.receiptLabel}>Treatment</Text>
              <Text style={styles.receiptValue}>{med.name}</Text>

              <View style={styles.receiptDivider} />

              <Text style={styles.receiptLabel}>Plan</Text>
              <Text style={styles.receiptValue}>{bundle.title}</Text>

              <View style={styles.receiptDivider} />

              <Text style={styles.receiptLabel}>Starting dose</Text>
              <View
                style={[
                  styles.dosePillBadge,
                  { backgroundColor: startingDoseColor },
                ]}
              >
                <Text style={styles.dosePillBadgeText}>{med.startingDose}</Text>
              </View>

              <View style={styles.receiptDivider} />

              <Text style={styles.receiptLabel}>Total</Text>
              <Text style={styles.receiptTotal}>{bundle.price}</Text>
              {bundle.perPen && (
                <Text style={styles.receiptPerPen}>{bundle.perPen}</Text>
              )}
            </View>
          </View>

          {/* Klarna row */}
          <View style={styles.klarnaRow}>
            <Text style={styles.klarnaText}>or pay in 3 with</Text>
            <Image
              source={require('../images/klarna-tag.jpg')}
              style={styles.klarnaBadge}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.reassuranceText}>
            Subject to clinical approval by our medical team.
          </Text>
        </View>

        <View style={styles.ctaContainer}>
          <PIPPButton text="Continue to consultation" onPress={() => {}} />
          <Text style={styles.changeText}>
            You can change your plan at any time
          </Text>
        </View>
      </View>
    );
  };

  // -----------------------------------------------------------------------
  // Main Render
  // -----------------------------------------------------------------------
  const renderStep = () => {
    switch (step) {
      case 0:
        return renderHeroLanding();
      case 1:
        return renderMedicationSelection();
      case 2:
        return renderBundleSelection();
      case 3:
        return renderDosePreview();
      case 4:
        return renderSummary();
      default:
        return renderHeroLanding();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Layout
  safeArea: {
    flex: 1,
    backgroundColor: pippTheme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  screenContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  screenContent: {
    paddingHorizontal: 20,
    paddingTop: 56,
    flexGrow: 1,
  },
  ctaContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // -------------------------------------------------------------------------
  // Back Arrow
  // -------------------------------------------------------------------------
  backArrow: {
    position: 'absolute' as any,
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 4,
  },
  backArrowIcon: {
    width: 24,
    height: 24,
  },

  // -------------------------------------------------------------------------
  // Medication badge pill
  // -------------------------------------------------------------------------
  medicationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: pippTheme.colors.surface.brand,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  medicationBadgeText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.inverse,
  },

  // -------------------------------------------------------------------------
  // Screen 0: Hero Landing
  // -------------------------------------------------------------------------
  heroContainer: {
    flexGrow: 1,
    backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #F1F9FF 40%, #DEF4F7 100%)',
    paddingHorizontal: 20,
    paddingBottom: 48,
  } as any,
  heroLogoContainer: {
    alignItems: 'center',
    paddingTop: 32,
  },
  heroLogo: {
    height: 24,
    width: 120,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  heroHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 32,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  heroSubtext: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  heroBottom: {
    alignItems: 'center',
  },
  heroSmallText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    color: pippTheme.colors.text.subtle,
    marginTop: 12,
  },

  // -------------------------------------------------------------------------
  // Screen 1: Medication Selection
  // -------------------------------------------------------------------------
  medCardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 56,
    gap: 20,
  },
  medCard: {
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative' as any,
  },
  medCardSelected: {
    borderWidth: 2,
    borderColor: pippTheme.colors.surface.brand,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  } as any,
  medCardUnselected: {
    borderWidth: 1,
    borderColor: '#E6E7ED',
  },
  medCardImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as any,
  },
  medCardOverlay: {
    position: 'absolute' as any,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(8px)',
    padding: 20,
  } as any,
  medCardName: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 24,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  medCardSubtitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    color: pippTheme.colors.text.subtle,
    marginTop: 2,
  },
  medCardPrice: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.surface.brand,
    marginTop: 4,
  },
  medApprovedText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    color: pippTheme.colors.text.subtle,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },

  // -------------------------------------------------------------------------
  // Screen 2: Bundle Selection
  // -------------------------------------------------------------------------
  sectionHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 28,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    marginBottom: 24,
  },
  bundleCardsContainer: {
    gap: 20,
  },
  bundleCard: {
    backgroundColor: pippTheme.colors.background.primary,
    borderRadius: 16,
    padding: 24,
    position: 'relative' as any,
  },
  bundleCardSelected: {
    borderWidth: 2,
    borderColor: pippTheme.colors.surface.brand,
    backgroundImage: `linear-gradient(180deg, ${pippTheme.colors.teal[50]}22 0%, #FFFFFF 100%)`,
  } as any,
  bundleCardUnselected: {
    borderWidth: 1,
    borderColor: '#E6E7ED',
  },
  bestValueBadge: {
    position: 'absolute' as any,
    top: -10,
    alignSelf: 'center',
    backgroundColor: pippTheme.colors.surface.brand,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestValueText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 10,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.inverse,
    letterSpacing: 0.5,
  },
  bundleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bundleLeft: {
    flex: 1,
  },
  bundleRight: {
    alignItems: 'flex-end',
  },
  bundleTitle: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 20,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  bundleSubtitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    color: pippTheme.colors.text.secondary,
    marginTop: 4,
  },
  saveBadge: {
    alignSelf: 'flex-start',
    backgroundImage: 'linear-gradient(135deg, #00C376 0%, #009E5A 100%)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 8,
  } as any,
  saveBadgeText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.inverse,
  },
  bundlePrice: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 28,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  bundleOriginalPrice: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    color: pippTheme.colors.text.subtle,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  bundlePerPen: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.surface.brand,
    marginTop: 2,
  },
  bundlePerPenSubtle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    color: pippTheme.colors.text.subtle,
    marginTop: 2,
  },
  deliveryText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    color: pippTheme.colors.text.subtle,
    textAlign: 'center',
    marginTop: 20,
  },

  // -------------------------------------------------------------------------
  // Screen 3: Dose Preview
  // -------------------------------------------------------------------------
  doseCircleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  doseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  doseCircleText: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 28,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
  },
  doseCircleLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    color: pippTheme.colors.text.secondary,
  },
  doseBarContainer: {
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  doseBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E6E7ED',
    overflow: 'hidden',
  },
  doseBarFill: {
    height: '100%',
    borderRadius: 4,
  } as any,
  doseLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  doseLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 10,
    color: pippTheme.colors.text.subtle,
  },
  doseExplanation: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 24,
  },

  // -------------------------------------------------------------------------
  // Screen 4: Summary
  // -------------------------------------------------------------------------
  receiptCard: {
    backgroundColor: pippTheme.colors.background.primary,
    borderWidth: 1,
    borderColor: '#E6E7ED',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  receiptImageArea: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  } as any,
  receiptImage: {
    width: 40,
    height: 160,
    position: 'absolute' as any,
    bottom: -30,
  } as any,
  receiptContent: {
    padding: 24,
  },
  receiptLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    color: pippTheme.colors.text.subtle,
    marginBottom: 4,
  },
  receiptValue: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 16,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E6E7ED',
    marginVertical: 16,
  },
  dosePillBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  dosePillBadgeText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.inverse,
  },
  receiptTotal: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 28,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  receiptPerPen: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    color: pippTheme.colors.text.subtle,
    marginTop: 4,
  },

  // Klarna
  klarnaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 6,
  },
  klarnaText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    color: pippTheme.colors.text.subtle,
  },
  klarnaBadge: {
    height: 18,
    width: 48,
  },

  // Reassurance
  reassuranceText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  changeText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    color: pippTheme.colors.text.subtle,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default Concept7Screen;
