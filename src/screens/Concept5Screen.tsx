import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Animated } from 'react-native';
import { pippTheme } from '../theme/pipp';
import Header from '../components/Header';
import PIPPButton from '../components/PIPPButton';

const TOTAL_SLIDES = 6; // 0-5

const SLIDE_HASHES = ['welcome', 'education', 'medication', 'bundle', 'dose', 'review'];

const getInitialStep = (): {
  step: number;
  medication: string | null;
  bundle: string | null;
} => {
  const hash = window.location.hash.replace('#', '');
  const idx = SLIDE_HASHES.indexOf(hash);
  if (idx >= 0) {
    return { step: idx, medication: null, bundle: null };
  }
  return { step: 0, medication: null, bundle: null };
};

const WEGOVY_DOSES = [
  { dose: '0.25mg', duration: 'Month 1', note: 'Starting dose' },
  { dose: '0.5mg', duration: 'Month 2', note: 'Adjustment period' },
  { dose: '1mg', duration: 'Month 3-4', note: 'Adjustment period' },
  { dose: '1.7mg', duration: 'Month 5-6', note: 'Adjustment period' },
  { dose: '2.4mg', duration: 'Month 7+', note: 'Target dose' },
];

const MOUNJARO_DOSES = [
  { dose: '2.5mg', duration: 'Month 1', note: 'Starting dose' },
  { dose: '5mg', duration: 'Month 2', note: 'Adjustment period' },
  { dose: '7.5mg', duration: 'Month 3-4', note: 'Adjustment period' },
  { dose: '10mg', duration: 'Month 5-6', note: 'Adjustment period' },
  { dose: '12.5mg', duration: 'Month 7+', note: 'Target dose' },
];

const Concept5Screen: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const initial = getInitialStep();
  const [step, setStep] = useState<number>(initial.step);
  const [selectedMedication, setSelectedMedication] = useState<string | null>(initial.medication);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(initial.bundle);

  // Sync URL hash
  useEffect(() => {
    window.location.hash = SLIDE_HASHES[step] || '';
  }, [step]);

  // Scroll to top on step change
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    window.scrollTo(0, 0);
  }, [step]);

  const handleNext = () => {
    if (step < TOTAL_SLIDES - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const doses = selectedMedication === 'mounjaro' ? MOUNJARO_DOSES : WEGOVY_DOSES;
  const doseColors = selectedMedication === 'mounjaro'
    ? pippTheme.colors.doses.mounjaro
    : pippTheme.colors.doses.wegovy;

  const getMedicationName = () => {
    return selectedMedication === 'mounjaro' ? 'Mounjaro KwikPen' : 'Wegovy FlexTouch';
  };

  const getBundleLabel = () => {
    return selectedBundle === '2-pen' ? '2 Pen Bundle' : '1 Pen';
  };

  const getBundlePrice = () => {
    return selectedBundle === '2-pen' ? '£168' : '£89';
  };

  const getBundlePricePerPen = () => {
    return selectedBundle === '2-pen' ? '£84 per pen' : '£89 per pen';
  };

  const getStartingDose = () => {
    return selectedMedication === 'mounjaro' ? '2.5mg' : '0.25mg';
  };

  const getStartingDoseColor = () => {
    const dose = getStartingDose();
    return (doseColors as any)[dose] || pippTheme.colors.teal[800];
  };

  // ─── Progress Dots ───
  const renderProgressDots = () => {
    return (
      <View style={styles.progressDotsContainer}>
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i === step ? styles.progressDotActive : styles.progressDotInactive,
            ]}
          />
        ))}
      </View>
    );
  };

  // ─── Slide 0: Welcome ───
  const renderWelcome = () => (
    <View style={styles.welcomeSlide}>
      <View style={styles.welcomeContent}>
        <Image
          source={require('../images/phlo-clinic-logo-default.png')}
          style={styles.welcomeLogo}
          resizeMode="contain"
        />
        <Text style={styles.welcomeHeading}>
          {'Your weight loss\njourney starts here'}
        </Text>
        <Text style={styles.welcomeBody}>
          We'll guide you through choosing the right treatment, tailored to your needs.
        </Text>
      </View>
      <View style={styles.welcomeBottom}>
        {renderProgressDots()}
        <View style={styles.ctaContainer}>
          <PIPPButton text="Let's begin" onPress={handleNext} />
        </View>
      </View>
    </View>
  );

  // ─── Slide 1: Education ───
  const renderEducation = () => (
    <View style={styles.contentSlide}>
      <View style={styles.contentBody}>
        <Text style={styles.sectionLabel}>UNDERSTANDING YOUR TREATMENT</Text>
        <Text style={styles.slideHeading}>How GLP-1 treatments work</Text>

        <View style={styles.infoCardsContainer}>
          {/* Card 1 */}
          <View style={styles.infoCard}>
            <View style={[styles.infoCircle, { backgroundColor: pippTheme.colors.teal[800] }]}>
              <Text style={styles.infoCircleText}>1</Text>
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Reduces appetite</Text>
              <Text style={styles.infoCardDescription}>
                GLP-1 medications work with your body's natural signals to help you feel full sooner.
              </Text>
            </View>
          </View>

          {/* Card 2 */}
          <View style={styles.infoCard}>
            <View style={[styles.infoCircle, { backgroundColor: pippTheme.colors.navy[900] }]}>
              <Text style={styles.infoCircleText}>2</Text>
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Proven results</Text>
              <Text style={styles.infoCardDescription}>
                Clinical trials show average weight loss of 15-20% of body weight over 68 weeks.
              </Text>
            </View>
          </View>

          {/* Card 3 */}
          <View style={styles.infoCard}>
            <View style={[styles.infoCircle, { backgroundColor: pippTheme.colors.success[900] }]}>
              <Text style={styles.infoCircleText}>3</Text>
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Clinically supervised</Text>
              <Text style={styles.infoCardDescription}>
                Your Phlo clinician monitors your progress and adjusts your dose.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.slideBottom}>
        {renderProgressDots()}
        <View style={styles.ctaContainer}>
          <PIPPButton text="Continue" onPress={handleNext} />
        </View>
      </View>
    </View>
  );

  // ─── Slide 2: Choose Medication ───
  const renderChooseMedication = () => (
    <View style={styles.contentSlide}>
      <View style={styles.contentBody}>
        <Text style={styles.slideHeading}>Choose your medication</Text>
        <Text style={styles.slideSubtitle}>
          Both are clinically proven GLP-1 treatments. Your clinician will confirm the right fit.
        </Text>

        <View style={styles.medicationCardsRow}>
          {/* Wegovy Card */}
          <TouchableOpacity
            style={[
              styles.medicationCard,
              selectedMedication === 'wegovy' && styles.medicationCardSelected,
            ]}
            onPress={() => setSelectedMedication('wegovy')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.medicationImageArea,
                { backgroundImage: 'linear-gradient(171deg, #DCF2FF 7%, #FFF 93%)' } as any,
              ]}
            >
              <Image
                source={require('../images/wegovy-pen.png')}
                style={styles.wegovyPenImage}
                resizeMode="contain"
              />
            </View>
            <View
              style={[
                styles.medicationInfoArea,
                selectedMedication === 'wegovy' && styles.medicationInfoAreaSelected,
              ]}
            >
              <Text style={styles.medicationName}>Wegovy</Text>
              <Text style={styles.medicationType}>Injectable pen</Text>
              <Text style={styles.medicationPrice}>From £89/pen</Text>
            </View>
          </TouchableOpacity>

          {/* Mounjaro Card */}
          <TouchableOpacity
            style={[
              styles.medicationCard,
              selectedMedication === 'mounjaro' && styles.medicationCardSelected,
            ]}
            onPress={() => setSelectedMedication('mounjaro')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.medicationImageArea,
                { backgroundImage: 'linear-gradient(171deg, #F8EBFF 7%, #FFF 93%)' } as any,
              ]}
            >
              <Image
                source={require('../images/mounjaro-pen.png')}
                style={styles.mountjaroPenImage}
                resizeMode="contain"
              />
            </View>
            <View
              style={[
                styles.medicationInfoArea,
                selectedMedication === 'mounjaro' && styles.medicationInfoAreaSelected,
              ]}
            >
              <Text style={styles.medicationName}>Mounjaro</Text>
              <Text style={styles.medicationType}>Injectable pen</Text>
              <Text style={styles.medicationPrice}>From £89/pen</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.slideBottom}>
        {renderProgressDots()}
        <View style={styles.ctaContainer}>
          <PIPPButton
            text="Continue"
            onPress={handleNext}
            disabled={!selectedMedication}
          />
        </View>
      </View>
    </View>
  );

  // ─── Slide 3: Choose Bundle ───
  const renderChooseBundle = () => (
    <View style={styles.contentSlide}>
      <View style={styles.contentBody}>
        <Text style={styles.slideHeading}>
          {'How much would you\nlike to start with?'}
        </Text>
        <Text style={styles.slideSubtitle}>
          Bundles save you money and reduce the hassle of reordering.
        </Text>

        <View style={styles.bundleCardsContainer}>
          {/* 1 Pen */}
          <TouchableOpacity
            style={[
              styles.bundleCard,
              selectedBundle === '1-pen' && styles.bundleCardSelected,
            ]}
            onPress={() => setSelectedBundle('1-pen')}
            activeOpacity={0.7}
          >
            <View style={styles.bundleRadioContainer}>
              <View style={[styles.radioOuter, selectedBundle === '1-pen' && styles.radioOuterSelected]}>
                {selectedBundle === '1-pen' && <View style={styles.radioInner} />}
              </View>
            </View>
            <View style={styles.bundleContent}>
              <Text style={styles.bundleLabel}>1 Pen</Text>
              <Text style={styles.bundleDescription}>1 month supply</Text>
            </View>
            <View style={styles.bundlePriceArea}>
              <Text style={styles.bundlePriceMain}>£89</Text>
              <Text style={styles.bundlePricePer}>£89/pen</Text>
            </View>
          </TouchableOpacity>

          {/* 2 Pen Bundle */}
          <TouchableOpacity
            style={[
              styles.bundleCard,
              selectedBundle === '2-pen' && styles.bundleCardSelected,
            ]}
            onPress={() => setSelectedBundle('2-pen')}
            activeOpacity={0.7}
          >
            <View style={styles.bundleRadioContainer}>
              <View style={[styles.radioOuter, selectedBundle === '2-pen' && styles.radioOuterSelected]}>
                {selectedBundle === '2-pen' && <View style={styles.radioInner} />}
              </View>
            </View>
            <View style={styles.bundleContent}>
              <Text style={styles.bundleLabel}>2 Pen Bundle</Text>
              <Text style={styles.bundleDescription}>2 months supply — sent together</Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>SAVE £10</Text>
              </View>
            </View>
            <View style={styles.bundlePriceArea}>
              <Text style={styles.bundlePriceMain}>£168</Text>
              <Text style={styles.bundlePricePer}>£84/pen</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.slideBottom}>
        {renderProgressDots()}
        <View style={styles.ctaContainer}>
          <PIPPButton
            text="Continue"
            onPress={handleNext}
            disabled={!selectedBundle}
          />
        </View>
      </View>
    </View>
  );

  // ─── Slide 4: Dose Progression ───
  const renderDoseProgression = () => (
    <View style={styles.contentSlide}>
      <View style={styles.contentBody}>
        <Text style={styles.slideHeading}>Your dose progression</Text>
        <Text style={styles.slideSubtitle}>
          We start you on a lower dose and gradually increase. This minimises side effects and helps your body adjust.
        </Text>

        <View style={styles.timelineContainer}>
          {/* Vertical line */}
          <View style={styles.timelineLine} />

          {doses.map((item, index) => {
            const isFirst = index === 0;
            const doseColor = (doseColors as any)[item.dose] || pippTheme.colors.teal[800];

            return (
              <View key={item.dose} style={styles.timelineStep}>
                {/* Dot */}
                <View style={styles.timelineDotContainer}>
                  <View
                    style={[
                      styles.timelineDot,
                      isFirst
                        ? { backgroundColor: pippTheme.colors.teal[800] }
                        : styles.timelineDotHollow,
                    ]}
                  />
                </View>

                {/* Content card */}
                <View style={styles.timelineCard}>
                  <View style={[styles.doseTag, { backgroundColor: doseColor }]}>
                    <Text style={styles.doseTagText}>{item.dose}</Text>
                  </View>
                  <Text style={styles.timelineDuration}>{item.duration}</Text>
                  <Text style={styles.timelineNote}>{item.note}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Image
            source={require('../theme/icons/info-outline.svg')}
            style={styles.infoBannerIcon}
          />
          <Text style={styles.infoBannerText}>
            Your clinician will personalise your dose schedule
          </Text>
        </View>
      </View>

      <View style={styles.slideBottom}>
        {renderProgressDots()}
        <View style={styles.ctaContainer}>
          <PIPPButton text="Continue" onPress={handleNext} />
        </View>
      </View>
    </View>
  );

  // ─── Slide 5: Review & Confirm ───
  const renderReview = () => (
    <View style={styles.contentSlide}>
      <View style={styles.contentBody}>
        <Text style={[styles.slideHeading, { textAlign: 'center' }]}>Your treatment plan</Text>

        <View style={styles.summaryCard}>
          {/* Medication row */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryMedRow}>
              <View style={styles.summaryMedIcon}>
                <Image
                  source={
                    selectedMedication === 'mounjaro'
                      ? require('../images/mounjaro-pen.png')
                      : require('../images/wegovy-pen.png')
                  }
                  style={styles.summaryMedImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.summaryMedName}>{getMedicationName()}</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          {/* Bundle row */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bundle</Text>
            <Text style={styles.summaryValue}>{getBundleLabel()}</Text>
          </View>

          <View style={styles.summaryDivider} />

          {/* Starting dose row */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Starting dose</Text>
            <View style={[styles.summaryDoseTag, { backgroundColor: getStartingDoseColor() }]}>
              <Text style={styles.summaryDoseTagText}>{getStartingDose()}</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          {/* Total row */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <View style={styles.summaryTotalArea}>
              <Text style={styles.summaryTotalPrice}>{getBundlePrice()}</Text>
              <Text style={styles.summaryTotalPerPen}>{getBundlePricePerPen()}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.reassuranceText}>
          Your order is subject to clinical approval. Our team will review your information to ensure this treatment is right for you.
        </Text>
      </View>

      <View style={styles.slideBottom}>
        {renderProgressDots()}
        <View style={styles.ctaContainer}>
          <PIPPButton text="Continue to consultation" onPress={() => {
            console.log('Continue to consultation', {
              medication: selectedMedication,
              bundle: selectedBundle,
            });
          }} />
        </View>
      </View>
    </View>
  );

  // ─── Render current slide ───
  const renderSlide = () => {
    switch (step) {
      case 0:
        return renderWelcome();
      case 1:
        return renderEducation();
      case 2:
        return renderChooseMedication();
      case 3:
        return renderChooseBundle();
      case 4:
        return renderDoseProgression();
      case 5:
        return renderReview();
      default:
        return renderWelcome();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {step > 0 && (
          <Header
            title=""
            onBackPress={handleBack}
            showBackButton={true}
          />
        )}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={step === 0 ? styles.scrollContentFull : styles.scrollContent}
        >
          {renderSlide()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ─── Layout ───
  safeArea: {
    flex: 1,
    backgroundColor: pippTheme.colors.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: pippTheme.colors.background.primary,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollContentFull: {
    flexGrow: 1,
    minHeight: '100vh' as any,
  },

  // ─── Welcome Slide ───
  welcomeSlide: {
    flex: 1,
    backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #DEF4F7 50%, #AEE5EB 100%)' as any,
    justifyContent: 'space-between',
    minHeight: '100vh' as any,
  },
  welcomeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  welcomeLogo: {
    width: 160,
    height: 48,
    marginBottom: 40,
  },
  welcomeHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    textAlign: 'center',
    lineHeight: pippTheme.lineHeight[40],
    marginBottom: 16,
  },
  welcomeBody: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: pippTheme.lineHeight[24],
  },
  welcomeBottom: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // ─── Content Slides (1-5) ───
  contentSlide: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentBody: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  slideBottom: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 24,
  },
  ctaContainer: {
    marginTop: 16,
  },

  // ─── Progress Dots ───
  progressDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    backgroundColor: pippTheme.colors.teal[800],
  },
  progressDotInactive: {
    backgroundColor: pippTheme.colors.navy[50],
  },

  // ─── Section Label ───
  sectionLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.teal[800],
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  // ─── Slide Heading / Subtitle ───
  slideHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: pippTheme.lineHeight[36],
    marginBottom: 12,
  },
  slideSubtitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    lineHeight: pippTheme.lineHeight[22],
    marginBottom: 24,
  },

  // ─── Info Cards (Slide 1) ───
  infoCardsContainer: {
    gap: 12,
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E6E7ED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
    gap: 16,
  },
  infoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCircleText: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#FFFFFF',
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    marginBottom: 4,
  },
  infoCardDescription: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    lineHeight: pippTheme.lineHeight[20],
  },

  // ─── Medication Cards (Slide 2) ───
  medicationCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  medicationCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E6E7ED',
    borderRadius: 12,
    overflow: 'hidden',
  },
  medicationCardSelected: {
    borderWidth: 2,
    borderColor: pippTheme.colors.teal[800],
    boxShadow: '0 4px 12px rgba(8, 106, 116, 0.15)' as any,
  },
  medicationImageArea: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'hidden',
  } as any,
  wegovyPenImage: {
    width: 80,
    height: 340,
    position: 'absolute' as any,
    bottom: -100,
  },
  mountjaroPenImage: {
    width: 60,
    height: 280,
    position: 'absolute' as any,
    bottom: -80,
  },
  medicationInfoArea: {
    padding: 16,
  },
  medicationInfoAreaSelected: {
    backgroundImage: 'linear-gradient(291deg, #FDFAF7 0%, #DEF4F7 100%)' as any,
  },
  medicationName: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    marginBottom: 2,
  },
  medicationType: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.subtle,
    marginBottom: 8,
  },
  medicationPrice: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.teal[800],
  },

  // ─── Bundle Cards (Slide 3) ───
  bundleCardsContainer: {
    gap: 16,
  },
  bundleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E7ED',
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  bundleCardSelected: {
    borderWidth: 2,
    borderColor: pippTheme.colors.teal[800],
    backgroundImage: 'linear-gradient(291deg, #FDFAF7 0%, #DEF4F7 100%)' as any,
    boxShadow: '0 4px 12px rgba(8, 106, 116, 0.15)' as any,
  },
  bundleRadioContainer: {
    alignSelf: 'flex-start',
    paddingTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: pippTheme.colors.navy[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: pippTheme.colors.teal[800],
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: pippTheme.colors.teal[800],
  },
  bundleContent: {
    flex: 1,
  },
  bundleLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    marginBottom: 2,
  },
  bundleDescription: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    marginBottom: 6,
  },
  saveBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundImage: 'linear-gradient(291deg, #E2FBF0 0%, #88F3C4 100%)' as any,
  },
  saveBadgeText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  bundlePriceArea: {
    alignItems: 'flex-end',
  },
  bundlePriceMain: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  bundlePricePer: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.subtle,
  },

  // ─── Dose Timeline (Slide 4) ───
  timelineContainer: {
    position: 'relative',
    paddingLeft: 20,
    marginTop: 8,
  } as any,
  timelineLine: {
    position: 'absolute' as any,
    left: 9,
    top: 8,
    bottom: 8,
    width: 2,
    backgroundColor: '#E6E7ED',
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  } as any,
  timelineDotContainer: {
    position: 'absolute' as any,
    left: -20,
    top: 6,
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineDotHollow: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E6E7ED',
  },
  timelineCard: {
    flex: 1,
    paddingLeft: 12,
  },
  doseTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  doseTagText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#FFFFFF',
  },
  timelineDuration: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.subtle,
    marginBottom: 2,
  },
  timelineNote: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
  },

  // ─── Info Banner (Slide 4) ───
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pippTheme.colors.surface.info,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 24,
  },
  infoBannerIcon: {
    width: 20,
    height: 20,
    tintColor: pippTheme.colors.info[800],
  },
  infoBannerText: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: pippTheme.lineHeight[20],
  },

  // ─── Summary Card (Slide 5) ───
  summaryCard: {
    borderWidth: 1,
    borderColor: '#E6E7ED',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryMedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryMedIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  summaryMedImage: {
    width: 24,
    height: 60,
  },
  summaryMedName: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E6E7ED',
  },
  summaryLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
  },
  summaryValue: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  summaryDoseTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  summaryDoseTagText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#FFFFFF',
  },
  summaryTotalArea: {
    alignItems: 'flex-end',
  },
  summaryTotalPrice: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  summaryTotalPerPen: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.subtle,
  },

  // ─── Reassurance Text (Slide 5) ───
  reassuranceText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: pippTheme.lineHeight[20],
    marginTop: 24,
    paddingHorizontal: 8,
  },
});

export default Concept5Screen;
