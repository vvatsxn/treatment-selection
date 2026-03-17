import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { pippTheme } from '../theme/pipp';
import Header from '../components/Header';
import PIPPButton from '../components/PIPPButton';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type QuestionKey = 'q1' | 'q2' | 'q3';

interface MedicationInfo {
  id: string;
  name: string;
  subtitle: string;
  image: any;
  imageWidth: number;
  imageHeight: number;
  imageBottom: number;
  stats: { label: string; color: string }[];
  reasons: string[];
  pricePerPen: number;
  bundlePrice: number;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const MEDICATIONS: Record<string, MedicationInfo> = {
  wegovy: {
    id: 'wegovy',
    name: 'Wegovy FlexTouch',
    subtitle: 'Semaglutide injectable pen',
    image: require('../images/wegovy-pen.png'),
    imageWidth: 70,
    imageHeight: 300,
    imageBottom: -80,
    stats: [
      { label: '15-20% avg loss', color: '#E2FBF0' },
      { label: 'Once weekly', color: '#DEF4F7' },
      { label: 'NHS approved', color: '#E6E7ED' },
    ],
    reasons: [
      'Best clinical outcomes for first-time patients',
      'Well-established dosing protocol',
      'Highest patient satisfaction ratings',
    ],
    pricePerPen: 89,
    bundlePrice: 168,
  },
  mounjaro: {
    id: 'mounjaro',
    name: 'Mounjaro KwikPen',
    subtitle: 'Tirzepatide injectable pen',
    image: require('../images/mounjaro-pen.png'),
    imageWidth: 50,
    imageHeight: 240,
    imageBottom: -60,
    stats: [
      { label: '20-25% avg loss', color: '#E2FBF0' },
      { label: 'Once weekly', color: '#DEF4F7' },
      { label: 'Dual-action', color: '#E6E7ED' },
    ],
    reasons: [
      'Strongest weight loss results in trials',
      'Dual GIP/GLP-1 mechanism',
      'Cost-effective per kg lost',
    ],
    pricePerPen: 84,
    bundlePrice: 158,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getRecommendation = (
  q1: string | null,
  q2: string | null,
): 'wegovy' | 'mounjaro' => {
  let wegovyScore = 0;
  let mounjaroScore = 0;

  if (q1 === 'Proven results') wegovyScore += 2;
  if (q1 === 'Lower cost') mounjaroScore += 2;
  if (q2 === 'First time') wegovyScore += 1;
  if (q2 === 'Experienced') mounjaroScore += 1;

  return wegovyScore >= mounjaroScore ? 'wegovy' : 'mounjaro';
};

const getAlternative = (recommended: string): string =>
  recommended === 'wegovy' ? 'mounjaro' : 'wegovy';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Concept6Screen: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);

  // State
  const [step, setStep] = useState(1);
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<string | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [showWhySection, setShowWhySection] = useState(false);
  const [showAlternative, setShowAlternative] = useState(false);

  // Animation values
  const recommendationOpacity = useRef(new Animated.Value(0)).current;
  const recommendationTranslate = useRef(new Animated.Value(30)).current;
  const bundleOpacity = useRef(new Animated.Value(0)).current;
  const bundleTranslate = useRef(new Animated.Value(30)).current;

  // URL sync
  useEffect(() => {
    if (showRecommendation) {
      window.location.hash = 'recommendation';
    } else {
      window.location.hash = '';
    }
  }, [showRecommendation]);

  // Scroll to top on step change
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    window.scrollTo(0, 0);
  }, [step]);

  // Auto-transition when all questions answered
  useEffect(() => {
    if (q1 && q2 && q3 && !showRecommendation) {
      const timeout = setTimeout(() => {
        const rec = getRecommendation(q1, q2);
        setSelectedMedication(rec);
        if (q3 === '2+ months') {
          setSelectedBundle('2-pen');
        } else {
          setSelectedBundle('1-pen');
        }
        setShowRecommendation(true);

        // Animate recommendation in
        Animated.parallel([
          Animated.timing(recommendationOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(recommendationTranslate, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Then animate bundle section
          Animated.parallel([
            Animated.timing(bundleOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(bundleTranslate, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start();
        });
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [q1, q2, q3]);

  // Derived
  const recommendedMed = selectedMedication
    ? MEDICATIONS[selectedMedication]
    : null;
  const alternativeMed = selectedMedication
    ? MEDICATIONS[getAlternative(selectedMedication)]
    : null;

  const totalPrice = recommendedMed
    ? selectedBundle === '2-pen'
      ? recommendedMed.bundlePrice
      : recommendedMed.pricePerPen
    : 0;

  const bundleLabel = selectedBundle === '2-pen' ? '2 Pen Bundle' : '1 Pen';

  // Handlers
  const handleBack = () => {
    if (showRecommendation) {
      setShowRecommendation(false);
      setSelectedMedication(null);
      setSelectedBundle(null);
      setShowWhySection(false);
      setShowAlternative(false);
      recommendationOpacity.setValue(0);
      recommendationTranslate.setValue(30);
      bundleOpacity.setValue(0);
      bundleTranslate.setValue(30);
      setQ1(null);
      setQ2(null);
      setQ3(null);
      return;
    }
  };

  const handleContinue = () => {
    console.log('Continue to consultation', {
      medication: selectedMedication,
      bundle: selectedBundle,
      total: totalPrice,
    });
  };

  const handleSelectAlternative = () => {
    if (alternativeMed) {
      setSelectedMedication(alternativeMed.id);
      setShowAlternative(false);
      setShowWhySection(false);
    }
  };

  // -----------------------------------------------------------------------
  // Render Helpers
  // -----------------------------------------------------------------------

  const renderPill = (
    label: string,
    isSelected: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      style={[
        styles.togglePill,
        isSelected ? styles.togglePillSelected : styles.togglePillUnselected,
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.togglePillText,
          isSelected
            ? styles.togglePillTextSelected
            : styles.togglePillTextUnselected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderQuestionCard = (
    question: string,
    options: string[],
    value: string | null,
    setter: (val: string) => void,
    disabled: boolean,
  ) => (
    <View style={[styles.questionCard, disabled && styles.questionCardMuted]}>
      <Text style={[styles.questionText, disabled && styles.questionTextMuted]}>
        {question}
      </Text>
      <View style={styles.pillRow}>
        {options.map((opt) =>
          renderPill(opt, value === opt, () => {
            if (!disabled) setter(opt);
          }),
        )}
      </View>
    </View>
  );

  const renderStatPill = (label: string, color: string) => (
    <View key={label} style={[styles.statPill, { backgroundColor: color }]}>
      <Text style={styles.statPillText}>{label}</Text>
    </View>
  );

  const renderBulletPoint = (text: string) => (
    <View key={text} style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );

  const renderComparisonRow = (
    label: string,
    val1: string,
    val2: string,
    isAlt: boolean,
    highlightVal2?: boolean,
  ) => (
    <View style={[styles.compRow, isAlt && styles.compRowAlt]}>
      <Text style={styles.compLabel}>{label}</Text>
      <Text
        style={[
          styles.compValue,
          selectedBundle === '1-pen'
            ? styles.compValueSelected
            : styles.compValueDefault,
        ]}
      >
        {val1}
      </Text>
      <Text
        style={[
          styles.compValue,
          selectedBundle === '2-pen'
            ? styles.compValueSelected
            : styles.compValueDefault,
          highlightVal2 && styles.compValueGreen,
        ]}
      >
        {val2}
      </Text>
    </View>
  );

  // -----------------------------------------------------------------------
  // Main Render
  // -----------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Step 1 of 2: Treatment"
        onBackPress={showRecommendation ? handleBack : undefined}
        showBackButton={showRecommendation}
        progress={0.5}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================= */}
        {/* PHASE 1: Quick Intake                                         */}
        {/* ============================================================= */}
        <View
          style={[
            styles.section,
            showRecommendation && styles.sectionMuted,
          ]}
        >
          <Text
            style={[
              styles.heading,
              showRecommendation && styles.headingSmall,
            ]}
          >
            {'Help us find your\nbest treatment'}
          </Text>
          <Text
            style={[
              styles.subtitle,
              showRecommendation && styles.subtitleHidden,
            ]}
          >
            Answer a few quick questions so we can personalise your
            recommendation.
          </Text>

          <View style={styles.questionsContainer}>
            {renderQuestionCard(
              "What's most important to you?",
              ['Proven results', 'Lower cost'],
              q1,
              setQ1,
              showRecommendation,
            )}
            {renderQuestionCard(
              'Injection experience?',
              ['First time', 'Experienced'],
              q2,
              setQ2,
              showRecommendation,
            )}
            {renderQuestionCard(
              'Preferred treatment length?',
              ['1 month', '2+ months'],
              q3,
              setQ3,
              showRecommendation,
            )}
          </View>
        </View>

        {/* ============================================================= */}
        {/* PHASE 2: Recommendation Reveal                                */}
        {/* ============================================================= */}
        {showRecommendation && recommendedMed && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: recommendationOpacity,
                transform: [{ translateY: recommendationTranslate }],
              },
            ]}
          >
            <Text style={styles.sectionLabel}>
              YOUR PERSONALISED RECOMMENDATION
            </Text>

            {/* Main recommendation card */}
            <View style={styles.recCard}>
              {/* Gradient banner */}
              <View style={styles.recBanner}>
                <View style={styles.recBadge}>
                  <Text style={styles.recBadgeText}>Recommended for you</Text>
                </View>
              </View>

              {/* Product image section */}
              <View style={styles.recImageContainer}>
                <Image
                  source={recommendedMed.image}
                  style={{
                    width: recommendedMed.imageWidth,
                    height: recommendedMed.imageHeight,
                    position: 'absolute',
                    bottom: recommendedMed.imageBottom,
                  }}
                  resizeMode="contain"
                />
              </View>

              {/* Content */}
              <View style={styles.recContent}>
                <Text style={styles.recName}>{recommendedMed.name}</Text>
                <Text style={styles.recSubtitle}>
                  {recommendedMed.subtitle}
                </Text>

                <View style={styles.statsRow}>
                  {recommendedMed.stats.map((s) =>
                    renderStatPill(s.label, s.color),
                  )}
                </View>

                {/* Why we recommend */}
                <TouchableOpacity
                  style={styles.whyToggle}
                  onPress={() => setShowWhySection(!showWhySection)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.whyToggleText}>
                    Why we recommend this
                  </Text>
                  <Text style={styles.whyChevron}>
                    {showWhySection ? '\u25B2' : '\u25BC'}
                  </Text>
                </TouchableOpacity>

                {showWhySection && (
                  <View style={styles.whyContent}>
                    {recommendedMed.reasons.map(renderBulletPoint)}
                  </View>
                )}
              </View>
            </View>

            {/* "Or choose differently" link */}
            <TouchableOpacity
              onPress={() => setShowAlternative(!showAlternative)}
              style={styles.altLinkContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.altLink}>Or choose differently</Text>
            </TouchableOpacity>

            {/* Alternative card */}
            {showAlternative && alternativeMed && (
              <TouchableOpacity
                style={styles.altCard}
                onPress={handleSelectAlternative}
                activeOpacity={0.7}
              >
                <View style={styles.altCardInner}>
                  <Image
                    source={alternativeMed.image}
                    style={styles.altImage}
                    resizeMode="contain"
                  />
                  <View style={styles.altInfo}>
                    <Text style={styles.altName}>{alternativeMed.name}</Text>
                    <Text style={styles.altSubtitle}>
                      {alternativeMed.subtitle}
                    </Text>
                    <Text style={styles.altCta}>Tap to select</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* ============================================================= */}
        {/* PHASE 3: Bundle Selection                                     */}
        {/* ============================================================= */}
        {showRecommendation && recommendedMed && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: bundleOpacity,
                transform: [{ translateY: bundleTranslate }],
              },
            ]}
          >
            <Text style={styles.sectionLabel}>CHOOSE YOUR PLAN</Text>
            <Text style={styles.bundleHeading}>Select your bundle</Text>

            {/* Comparison table */}
            <View style={styles.compTable}>
              {/* Column headers */}
              <View style={styles.compHeaderRow}>
                <View style={styles.compLabelCol} />
                <TouchableOpacity
                  style={[
                    styles.compHeaderCol,
                    selectedBundle === '1-pen' && styles.compHeaderColSelected,
                  ]}
                  onPress={() => setSelectedBundle('1-pen')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.compHeaderText,
                      selectedBundle === '1-pen' &&
                        styles.compHeaderTextSelected,
                    ]}
                  >
                    1 Pen
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.compHeaderCol,
                    selectedBundle === '2-pen' && styles.compHeaderColSelected,
                  ]}
                  onPress={() => setSelectedBundle('2-pen')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.compHeaderText,
                      selectedBundle === '2-pen' &&
                        styles.compHeaderTextSelected,
                    ]}
                  >
                    2 Pen Bundle
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Data rows */}
              {renderComparisonRow(
                'Supply length',
                '1 month',
                '2 months',
                false,
              )}
              {renderComparisonRow(
                'Price per pen',
                `\u00A3${recommendedMed.pricePerPen}`,
                `\u00A3${recommendedMed.bundlePrice / 2}`,
                true,
              )}
              {renderComparisonRow(
                'Total cost',
                `\u00A3${recommendedMed.pricePerPen}`,
                `\u00A3${recommendedMed.bundlePrice}`,
                false,
              )}
              {renderComparisonRow(
                'Savings',
                '\u2014',
                `Save \u00A3${recommendedMed.pricePerPen * 2 - recommendedMed.bundlePrice}`,
                true,
                true,
              )}
              {renderComparisonRow(
                'Convenience',
                'Monthly order',
                'Single delivery',
                false,
              )}
            </View>

            {/* Klarna */}
            <View style={styles.klarnaRow}>
              <Text style={styles.klarnaText}>
                Pay in 3 interest-free instalments with Klarna
              </Text>
              <Image
                source={require('../images/klarna.jpg')}
                style={styles.klarnaBadge}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
        )}

        {/* ============================================================= */}
        {/* PHASE 4: Summary & CTA                                        */}
        {/* ============================================================= */}
        {showRecommendation && recommendedMed && selectedBundle && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: bundleOpacity,
                transform: [{ translateY: bundleTranslate }],
              },
            ]}
          >
            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <Text style={styles.summaryName}>{recommendedMed.name}</Text>
                <Text style={styles.summaryBundle}>{bundleLabel}</Text>
              </View>
              <Text style={styles.summaryPrice}>
                {`\u00A3${totalPrice}`}
              </Text>
            </View>

            <PIPPButton
              text="Continue to consultation"
              onPress={handleContinue}
            />

            <Text style={styles.footerNote}>
              Your plan will be reviewed by our clinical team
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: pippTheme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },

  // Sections
  section: {
    marginTop: 32,
  },
  sectionMuted: {
    opacity: 0.6,
  },
  sectionLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.teal[800],
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  // Phase 1: Intake
  heading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: pippTheme.lineHeight[32],
    marginBottom: 8,
  },
  headingSmall: {
    fontSize: pippTheme.fontSize.body1,
    lineHeight: pippTheme.lineHeight[24],
  },
  subtitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    color: pippTheme.colors.text.secondary,
    lineHeight: pippTheme.lineHeight[22],
    marginBottom: 24,
  },
  subtitleHidden: {
    display: 'none' as any,
  },
  questionsContainer: {
    gap: 20,
  },
  questionCard: {
    gap: 12,
  },
  questionCardMuted: {
    opacity: 0.7,
  },
  questionText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  questionTextMuted: {
    color: pippTheme.colors.text.subtle,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  togglePill: {
    borderRadius: 360,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  togglePillSelected: {
    backgroundColor: pippTheme.colors.teal[800],
  },
  togglePillUnselected: {
    backgroundColor: pippTheme.colors.background.primary,
    borderWidth: 1,
    borderColor: '#E6E7ED',
  },
  togglePillText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
  },
  togglePillTextSelected: {
    color: '#FFFFFF',
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
  },
  togglePillTextUnselected: {
    color: pippTheme.colors.text.primary,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
  },

  // Phase 2: Recommendation
  recCard: {
    backgroundColor: pippTheme.colors.background.primary,
    borderWidth: 2,
    borderColor: pippTheme.colors.teal[800],
    borderRadius: 16,
    overflow: 'hidden',
  },
  recBanner: {
    height: 60,
    background: 'linear-gradient(291deg, #DEF4F7 0%, #FDFAF7 100%)' as any,
    backgroundColor: '#DEF4F7',
    position: 'relative',
  },
  recBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: pippTheme.colors.teal[800],
    borderRadius: 360,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  recBadgeText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#FFFFFF',
  },
  recImageContainer: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    position: 'relative',
  },
  recContent: {
    padding: 20,
  },
  recName: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header4,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    marginBottom: 4,
  },
  recSubtitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    color: pippTheme.colors.text.subtle,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statPill: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statPillText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },

  // Why section
  whyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  whyToggleText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.teal[800],
  },
  whyChevron: {
    fontSize: 8,
    color: pippTheme.colors.teal[800],
  },
  whyContent: {
    marginTop: 12,
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: pippTheme.colors.teal[800],
    marginTop: 5,
  },
  bulletText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    color: pippTheme.colors.text.secondary,
    lineHeight: pippTheme.lineHeight[20],
    flex: 1,
  },

  // Alternative
  altLinkContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  altLink: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    color: pippTheme.colors.teal[800],
    textDecorationLine: 'underline',
  },
  altCard: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E6E7ED',
    borderRadius: 12,
    padding: 16,
  },
  altCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  altImage: {
    width: 40,
    height: 120,
  },
  altInfo: {
    flex: 1,
  },
  altName: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    marginBottom: 2,
  },
  altSubtitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    color: pippTheme.colors.text.subtle,
    marginBottom: 8,
  },
  altCta: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.teal[800],
  },

  // Phase 3: Bundle
  bundleHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header4,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    marginBottom: 16,
  },
  compTable: {
    borderWidth: 1,
    borderColor: '#E6E7ED',
    borderRadius: 12,
    overflow: 'hidden',
  },
  compHeaderRow: {
    flexDirection: 'row',
  },
  compLabelCol: {
    flex: 1.2,
  },
  compHeaderCol: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E7ED',
  },
  compHeaderColSelected: {
    borderTopWidth: 3,
    borderTopColor: pippTheme.colors.teal[800],
    backgroundColor: pippTheme.colors.teal[50],
  },
  compHeaderText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  compHeaderTextSelected: {
    color: pippTheme.colors.teal[800],
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compRowAlt: {
    backgroundColor: '#F9F9F9',
  },
  compLabel: {
    flex: 1.2,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    color: pippTheme.colors.text.secondary,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  compValue: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  compValueDefault: {
    color: pippTheme.colors.text.subtle,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
  },
  compValueSelected: {
    color: pippTheme.colors.text.primary,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
  },
  compValueGreen: {
    color: pippTheme.colors.success[800],
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
  },

  // Klarna
  klarnaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  klarnaText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    color: pippTheme.colors.text.subtle,
    flex: 1,
  },
  klarnaBadge: {
    width: 48,
    height: 20,
  },

  // Phase 4: Summary
  divider: {
    height: 1,
    backgroundColor: '#E6E7ED',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryName: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  summaryBundle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    color: pippTheme.colors.text.secondary,
    marginTop: 2,
  },
  summaryPrice: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  footerNote: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default Concept6Screen;
