import React, { useState, useRef, useEffect } from 'react';
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
import PIPPButton from '../components/PIPPButton';
import PricingModal from '../components/PricingModal';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface BundleInfo {
  key: string;
  title: string;
  subtitle: string;
  price: string;
  priceValue: number;
  perPen: string;
  originalPrice?: string;
  savings?: string;
  bestValue?: boolean;
  convenience?: string;
}

interface MedicationInfo {
  name: string;
  fullName: string;
  subtitle: string;
  description: string;
  frequency: string;
  weightLossRange: string;
  type: string;
  mechanism: string;
  weightLoss: string;
  image: any;
  imageWidth: number;
  imageHeight: number;
  imageBottom: number;
  gradient: string;
  doses: string[];
  doseDescriptions: Record<string, string>;
  startingDose: string;
  bundles: Record<string, BundleInfo>;
}

const MEDICATIONS: Record<string, MedicationInfo> = {
  wegovy: {
    name: 'Wegovy',
    fullName: 'Wegovy FlexTouch',
    subtitle: 'Semaglutide',
    description: 'Semaglutide injectable pen',
    frequency: 'Once weekly',
    weightLossRange: '15–20%',
    type: 'Injectable pen',
    mechanism: 'GLP-1 receptor agonist',
    weightLoss: '~15% body weight',
    image: require('../images/wegovy-pen.png'),
    imageWidth: 100,
    imageHeight: 420,
    imageBottom: -120,
    gradient: 'linear-gradient(171deg, #DCF2FF 7%, #FFFFFF 93%)',
    doses: ['0.25mg', '0.5mg', '1mg', '1.7mg', '2.4mg'],
    doseDescriptions: {
      '0.25mg': 'Starting dose, weeks 1–4',
      '0.5mg': 'Increased if tolerated, weeks 5–8',
      '1mg': 'Continued titration, weeks 9–12',
      '1.7mg': 'Further increase, weeks 13–16',
      '2.4mg': 'Maintenance dose',
    },
    startingDose: '0.25mg',
    bundles: {
      single: {
        key: 'single',
        title: '1 pen',
        subtitle: '1 month supply',
        price: '£89',
        priceValue: 89,
        perPen: '£89/pen',
        originalPrice: '£119',
        savings: 'Welcome offer £30 off',
        convenience: '',
      },
      double: {
        key: 'double',
        title: '2 pen bundle',
        subtitle: '2 months supply',
        price: '£185',
        priceValue: 185,
        perPen: '£92.50/pen',
        originalPrice: '£230',
        savings: 'Save £47',
        bestValue: true,
        convenience: 'Fewer deliveries',
      },
    },
  },
  mounjaro: {
    name: 'Mounjaro',
    fullName: 'Mounjaro KwikPen',
    subtitle: 'Tirzepatide',
    description: 'Tirzepatide injectable pen',
    frequency: 'Once weekly',
    weightLossRange: '~20%',
    type: 'Injectable pen',
    mechanism: 'Dual GIP/GLP-1 receptor agonist',
    weightLoss: '~20% body weight',
    image: require('../images/mounjaro-pen.png'),
    imageWidth: 80,
    imageHeight: 340,
    imageBottom: -100,
    gradient: 'linear-gradient(171deg, #F8EBFF 7%, #FFFFFF 93%)',
    doses: ['2.5mg', '5mg', '7.5mg', '10mg', '12.5mg', '15mg'],
    doseDescriptions: {
      '2.5mg': 'Starting dose, weeks 1–4',
      '5mg': 'Increased if tolerated, weeks 5–8',
      '7.5mg': 'Continued titration, weeks 9–12',
      '10mg': 'Further increase, weeks 13–16',
      '12.5mg': 'Higher dose if needed',
      '15mg': 'Maximum maintenance dose',
    },
    startingDose: '2.5mg',
    bundles: {
      single: {
        key: 'single',
        title: '1 pen',
        subtitle: '1 month supply',
        price: '£149',
        priceValue: 149,
        perPen: '£149/pen',
        originalPrice: '£179',
        savings: 'Welcome offer £30 off',
        convenience: '',
      },
      double: {
        key: 'double',
        title: '2 pen bundle',
        subtitle: '2 months supply',
        price: '£253',
        priceValue: 253,
        perPen: '£126.50/pen',
        originalPrice: '£298',
        savings: 'Save £47',
        bestValue: true,
        convenience: 'Fewer deliveries',
      },
    },
  },
};

const CONSENT_SECTIONS = [
  {
    title: 'GP & medical records',
    bullets: [
      'I consent for Phlo to contact my GP to verify the information provided and to inform them of any treatment received.',
      'I consent to Phlo accessing my Summary Care Record to verify my medical history and medication eligibility. If I don\'t have a Summary Care Record I will be required to contact my GP and provide a copy of my medical record.',
      'I am aged between 18-85.',
    ],
  },
  {
    title: 'Safety & side effects',
    bullets: [
      'I confirm I will read the patient information leaflet provided with the medicine which includes more information including side effects.',
      'I understand increasing the dose of my medicine may result in side effects like vomiting, diarrhoea or constipation. Rarely, hospital treatment is needed for side effects. I agree to report all side effects to Phlo Clinical Team.',
      'I understand that there is a risk of allergic reaction or side effects with weight loss medication and that I should seek medical attention and discontinue the treatment if I experience severe symptoms.',
      'I understand I will stop using the treatment if I experience prolonged stomach pain or a sustained increase in heart rate.',
    ],
  },
  {
    title: 'Usage & dosing',
    bullets: [
      'I confirm I will follow all storage instructions that come with the medicine.',
      'I confirm not to combine doses (taking an extra strength or mixing different strengths to reach a higher weekly dose) and will only use the pen prescribed by Phlo. Combining doses can cause dangerous dosing errors which can increase risk of side effects and is not licensed or recommended.',
      'I understand that if I am switching between weight loss injectable medications, I must stop my old medication and wait at least 10 days before starting the new medication.',
    ],
  },
  {
    title: 'Clinical approval & accuracy',
    bullets: [
      'I confirm I understand my order is subject to clinical approval by the Phlo Clinical Team, and I have provided honest and accurate information throughout.',
      'If I am transferring to Phlo, I confirm I previously met criteria for initiation of treatment and I wish to continue weight loss treatment / maintenance treatment.',
    ],
  },
];

const MEDICATION_KEYS = Object.keys(MEDICATIONS);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// Animated FAQ Item component
const AnimatedFaqItem: React.FC<{
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}> = ({ question, answer, isExpanded, onToggle, isLast }) => {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isExpanded]);

  const maxHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  const opacity = heightAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View>
      <TouchableOpacity
        style={faqStyles.faqItem}
        onPress={onToggle}
        activeOpacity={0.6}
      >
        <Text style={faqStyles.faqQuestion}>{question}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Text style={faqStyles.faqIcon}>+</Text>
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={{ maxHeight, opacity, overflow: 'hidden' } as any}>
        <Text style={faqStyles.faqAnswer}>{answer}</Text>
      </Animated.View>
      {!isLast && <View style={faqStyles.faqDivider} />}
    </View>
  );
};

const faqStyles = StyleSheet.create({
  faqSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  faqLabel: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.bold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: pippTheme.lineHeight[32],
  },
  faqDivider: {
    height: 1,
    backgroundColor: '#E6E7ED',
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 16,
  } as any,
  faqQuestion: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: 24,
  },
  faqIcon: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 22,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.action,
    lineHeight: 24,
    width: 24,
    textAlign: 'center',
  } as any,
  faqAnswer: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    lineHeight: 22,
    paddingBottom: 20,
  },
});

const Concept8Screen: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [step, setStep] = useState(0);
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [selectedDose, setSelectedDose] = useState<string | null>(null);
  const [expandedConsent, setExpandedConsent] = useState<number | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [exploringOther, setExploringOther] = useState(false);
  const [expandedFaqs, setExpandedFaqs] = useState<Set<number>>(new Set());
  const [isPricingModalVisible, setIsPricingModalVisible] = useState(false);
  const [selectedPlanGoal, setSelectedPlanGoal] = useState<string | null>('increasing');

  // Default recommended medication (first in data)
  const recommendedMedKey = MEDICATION_KEYS[0];

  // Resolve active medication
  const activeMedKey = selectedMedication || recommendedMedKey;
  const med = MEDICATIONS[activeMedKey];

  const bundle = selectedBundle ? med.bundles[selectedBundle] : null;

  // Auto-set starting dose based on selected plan goal
  useEffect(() => {
    if (selectedPlanGoal && med) {
      setSelectedDose(med.startingDose);
    }
  }, [selectedPlanGoal, activeMedKey]);

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    window.scrollTo(0, 0);
  };

  const animateTransition = (nextStep: number) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start(() => {
      setStep(nextStep);
      scrollToTop();
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    });
  };

  const goTo = (nextStep: number) => {
    animateTransition(nextStep);
  };

  const goBack = () => {
    if (step > 0) goTo(step - 1);
  };

  const switchMedication = (medKey: string) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start(() => {
      setSelectedMedication(medKey);
      setSelectedBundle(null);
      scrollToTop();
      slideAnim.setValue(10);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    });
  };

  // -------------------------------------------------------------------------
  // Dose color helper
  // -------------------------------------------------------------------------
  const getDoseColor = (dose: string) => {
    const doseMap =
      activeMedKey === 'wegovy'
        ? pippTheme.colors.doses.wegovy
        : pippTheme.colors.doses.mounjaro;
    return (doseMap as any)[dose] || pippTheme.colors.surface.brand;
  };

  // -------------------------------------------------------------------------
  // Custom Header (steps 1-4)
  // -------------------------------------------------------------------------
  const totalSteps = 5; // steps 0-4

  const renderHeader = () => {
    if (step === 0) return null;

    const progressPercent = `${(step / (totalSteps - 1)) * 100}%`;
    const showBack = step > 0;

    return (
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {showBack ? (
            <TouchableOpacity
              onPress={goBack}
              style={styles.headerBackButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Image
                source={require('../theme/icons/arrow-back.svg')}
                style={styles.headerBackIcon}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerBackButton} />
          )}
          <View style={styles.headerLogoContainer}>
            <Image
              source={require('../images/phlo-clinic-logo-default.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerBackButton} />
        </View>
        <View style={styles.progressTrack}>
          <View
            style={
              [
                styles.progressFill,
                {
                  width: progressPercent,
                  transition: 'width 0.3s ease',
                },
              ] as any
            }
          />
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------------------
  // Step 0: Welcome
  // -------------------------------------------------------------------------
  const renderWelcome = () => (
    <View style={styles.welcomeContainer}>
      {/* Logo */}
      <View style={styles.welcomeLogoContainer}>
        <Image
          source={require('../images/phlo-clinic-logo-default.png')}
          style={styles.welcomeLogo}
          resizeMode="contain"
        />
      </View>

      {/* Centered content */}
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeHeading}>
          {'Your weight loss\njourney starts here'}
        </Text>
        <Text style={styles.welcomeSubtext}>
          {"We'll guide you through choosing the right\ntreatment, tailored to your needs."}
        </Text>
      </View>

      {/* Bottom CTA */}
      <View style={styles.welcomeBottom}>
        <PIPPButton text="Continue" onPress={() => goTo(1)} />
      </View>
    </View>
  );

  // -------------------------------------------------------------------------
  // Step 1: Treatment
  // -------------------------------------------------------------------------
  const renderTreatment = () => {
    const singleBundle = med.bundles.single;
    const doubleBundle = med.bundles.double;

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepContent}>
          {/* ---- YOUR PERSONALISED RECOMMENDATION ---- */}
          <Text style={faqStyles.faqLabel}>Your Recommended Plan</Text>

          {/* Hero card */}
          <View style={styles.heroCard}>
            {/* Gradient image frame */}
            <View
              style={
                [
                  styles.heroImageFrame,
                  { backgroundImage: med.gradient },
                ] as any
              }
            >
              {/* Pen image (absolute) */}
              <Image
                source={med.image}
                style={[styles.heroFrameImage, activeMedKey === 'mounjaro' && { bottom: -120 }]}
                resizeMode="contain"
              />

              {/* Bottom info box with stat pills + name */}
              <View style={styles.heroInfoBox}>
                <View style={styles.statPillsRow}>
                  <View style={[styles.statPill, styles.statPillSuccess]}>
                    <Text style={styles.statPillText}>{med.weightLossRange} avg loss</Text>
                  </View>
                  <View style={[styles.statPill, styles.statPillInfo]}>
                    <Text style={styles.statPillText}>{med.frequency}</Text>
                  </View>
                </View>
                <Text style={styles.heroFullName}>{med.fullName}</Text>
                <Text style={styles.heroDescription}>{med.description}</Text>
              </View>
            </View>
          </View>

          <View style={styles.pricingSection}>
            <View style={styles.pricingInner}>
              <Text style={styles.priceLabel}>From <Text style={styles.priceStrikethrough}>£119</Text> <Text style={styles.priceActive}>£89</Text> per month</Text>
              <Text style={styles.pricingSubtext}>As part of a 3-month plan</Text>
            </View>
            <View style={styles.klarnaRow}>
              <Text style={styles.klarnaText}>Pay with</Text>
              <View style={styles.klarnaBadge}>
                <Image
                  source={require('../images/klarna.jpg')}
                  style={styles.klarnaImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.klarnaText}>available</Text>
            </View>
          </View>

        </View>

        <View style={styles.ctaContainer}>
          <PIPPButton
            text={`Continue with ${med.name}`}
            onPress={() => {
              if (!selectedMedication) setSelectedMedication(activeMedKey);
              goTo(2);
            }}
          />

          {/* Alternative treatment card */}
          {(() => {
            const altKey = activeMedKey === 'wegovy' ? 'mounjaro' : 'wegovy';
            const alt = MEDICATIONS[altKey];
            const altGradient = altKey === 'mounjaro'
              ? 'linear-gradient(89deg, #F8EBFF 0.62%, #FFF 32.75%)'
              : 'linear-gradient(89deg, #DCF2FF 0.62%, #FFF 32.75%)';
            return (
              <TouchableOpacity
                style={styles.altCard}
                onPress={() => switchMedication(altKey)}
                activeOpacity={0.7}
              >
                <View style={styles.altCardBanner}>
                  <Image
                    source={require('../theme/icons/check-circle-outline.svg')}
                    style={styles.altCardBannerIcon}
                  />
                  <Text style={styles.altCardBannerText}>You're also eligible for</Text>
                </View>
                <View style={[styles.altCardBody, { backgroundImage: altGradient }] as any}>
                  <View style={styles.altCardImageArea}>
                    <Image
                      source={alt.image}
                      style={[styles.altCardPenImage, altKey === 'mounjaro' && { bottom: -70 }]}
                    />
                  </View>
                  <View style={styles.altCardContent}>
                    <View style={styles.altCardLeft}>
                      <Text style={styles.altCardTitle}>{alt.fullName}</Text>
                      <Text style={styles.altCardPrice}>
                        <Text style={styles.altCardPriceStrike}>£119</Text>{' '}
                        <Text style={styles.altCardPriceActive}>£89</Text> per month
                      </Text>
                      <Text style={styles.altCardPlan}>As part of a 3-month plan</Text>
                    </View>
                    <Image
                      source={require('../theme/icons/chevron-right.svg')}
                      style={styles.altCardChevron}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })()}

          {/* Explore other treatments */}
          <TouchableOpacity
            onPress={() => setExploringOther(!exploringOther)}
            style={styles.exploreButton}
          >
            <Text style={styles.exploreButtonText}>
              {exploringOther ? 'Hide other treatments' : 'Explore other treatments'}
            </Text>
          </TouchableOpacity>

          {exploringOther && (
            <View style={styles.exploreCardsContainer}>
              {/* Wegovy Pill */}
              <TouchableOpacity style={styles.wegovyPillCard} activeOpacity={0.7}>
                <View style={styles.altCardImageArea}>
                  <Image
                    source={require('../images/wegovy-pill.png')}
                    style={styles.exploreCardImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={[styles.altCardContent, { paddingVertical: 12 }]}>
                  <View style={styles.altCardLeft}>
                    <View style={[styles.altCardBadge, { backgroundColor: '#DCF2FF' }]}>
                      <Text style={styles.altCardBadgeText}>Or, instead</Text>
                    </View>
                    <Text style={styles.altCardTitle}>Wegovy Pill</Text>
                    <Text style={styles.altCardPrice}>
                      <Text style={styles.altCardPriceStrike}>£119</Text>{' '}
                      <Text style={styles.altCardPriceActive}>£89</Text> per month
                    </Text>
                    <Text style={styles.altCardPlan}>As part of a 3-month plan</Text>
                  </View>
                  <Image
                    source={require('../theme/icons/chevron-right.svg')}
                    style={styles.altCardChevron}
                  />
                </View>
              </TouchableOpacity>

              {/* Orfoglipron */}
              <TouchableOpacity style={styles.orfoglipronCard} activeOpacity={0.7}>
                <View style={styles.altCardImageArea}>
                  <Image
                    source={require('../images/orfoglipron-tablet.png')}
                    style={styles.exploreCardImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={[styles.altCardContent, { paddingVertical: 12 }]}>
                  <View style={styles.altCardLeft}>
                    <View style={[styles.altCardBadge, { backgroundColor: '#FBE3E3' }]}>
                      <Text style={styles.altCardBadgeText}>Or, instead</Text>
                    </View>
                    <Text style={styles.altCardTitle}>Orfoglipron tablet</Text>
                    <Text style={styles.altCardPrice}>
                      <Text style={styles.altCardPriceStrike}>£119</Text>{' '}
                      <Text style={styles.altCardPriceActive}>£89</Text> per month
                    </Text>
                    <Text style={styles.altCardPlan}>As part of a 3-month plan</Text>
                  </View>
                  <Image
                    source={require('../theme/icons/chevron-right.svg')}
                    style={styles.altCardChevron}
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}

        </View>

        {/* Divider between explore and FAQ */}
        <View style={{ height: 1, backgroundColor: '#E6E7ED', marginHorizontal: 20, marginTop: 24, marginBottom: 8 }} />

        {/* FAQ section */}
        <View style={faqStyles.faqSection}>
          <Text style={[faqStyles.faqLabel, { marginBottom: 20 }]}>Frequently Asked Questions</Text>
          <View style={faqStyles.faqDivider} />
          {(activeMedKey === 'wegovy'
            ? [
                ['What is Wegovy and how does it work?', 'Wegovy contains semaglutide, a GLP-1 receptor agonist that mimics a natural hormone to regulate appetite. It works by reducing hunger, helping you feel full sooner, and slowing the emptying of your stomach — leading to reduced calorie intake and sustained weight loss.'],
                ['How do I take Wegovy?', 'Wegovy is a once-weekly subcutaneous injection using a pre-filled pen. You inject it into your stomach, thigh, or upper arm on the same day each week. Full instructions are provided with your medication.'],
                ['Is Wegovy the same as Ozempic?', 'Wegovy and Ozempic both contain semaglutide but are licensed for different purposes. Ozempic is approved for type 2 diabetes, while Wegovy is specifically approved for weight management at a higher maintenance dose (2.4mg vs 1mg).'],
                ['How much weight can I expect to lose with Wegovy?', 'In clinical trials, patients lost an average of 15% of their body weight over 68 weeks. Results vary between individuals, but most patients experience meaningful weight loss within the first 3-4 months of treatment.'],
                ['How long does it take to see results?', 'Most patients begin to notice appetite changes within the first 1-2 weeks. Visible weight loss typically becomes apparent within the first month, with the most significant results seen between months 3-6.'],
              ]
            : [
                ['What is Mounjaro and how does it work?', 'Mounjaro contains tirzepatide, a dual GIP/GLP-1 receptor agonist. It targets two hormones involved in appetite and blood sugar regulation, which may lead to greater weight loss compared to GLP-1 only treatments.'],
                ['How do I take Mounjaro?', 'Mounjaro is a once-weekly subcutaneous injection using a pre-filled pen. You inject it into your stomach, thigh, or upper arm on the same day each week. Full instructions are provided with your medication.'],
                ['How does Mounjaro compare to Wegovy?', 'Both are injectable weight loss treatments, but Mounjaro targets two receptors (GIP and GLP-1) while Wegovy targets one (GLP-1). Clinical trials suggest Mounjaro may produce greater average weight loss (~20% vs ~15%).'],
                ['How much weight can I expect to lose with Mounjaro?', 'In clinical trials, patients lost up to 22.5% of their body weight. Results vary between individuals, but most patients experience meaningful weight loss within the first 3-4 months of treatment.'],
                ['How long does it take to see results?', 'Most patients begin to notice appetite changes within the first 1-2 weeks. Visible weight loss typically becomes apparent within the first month, with the most significant results seen between months 3-6.'],
              ]
          ).map(([question, answer], index, arr) => (
            <AnimatedFaqItem
              key={question}
              question={question}
              answer={answer}
              isExpanded={expandedFaqs.has(index)}
              onToggle={() => {
                setExpandedFaqs(prev => {
                  const next = new Set(prev);
                  next.has(index) ? next.delete(index) : next.add(index);
                  return next;
                });
              }}
              isLast={index === arr.length - 1}
            />
          ))}
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------------------
  // Step 3: Bundle Selection
  // -------------------------------------------------------------------------
  const renderBundleSelection = () => {
    const singleBundle = med.bundles.single;
    const doubleBundle = med.bundles.double;

    const pricingBrand = activeMedKey === 'wegovy' ? 'wegovy-flextouch' : 'mounjaro-kwikpen';

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepContent}>
          <Text style={faqStyles.faqLabel}>Choose Supply Length</Text>

          {/* Supply cards */}
          <View style={styles.supplyCardsContainerTight}>
            {/* 2 month plan */}
            <TouchableOpacity
              style={[styles.supplyCard, { marginTop: 9 }, selectedBundle === 'double' && styles.supplyCardSelected]}
              onPress={() => setSelectedBundle('double')}
              activeOpacity={0.7}
            >
              <View style={styles.supplyCardLabel}>
                <Text style={[styles.supplyCardLabelText, selectedBundle === 'double' && styles.supplyCardLabelTextSelected]}>Best value</Text>
              </View>
              <View style={[styles.radioOuter, selectedBundle === 'double' && styles.radioOuterSelected]}>
                {selectedBundle === 'double' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.supplyCardCenter}>
                <Text style={styles.supplyPlanText}>2 month plan</Text>
                <View style={styles.supplyPriceRow}>
                  <Text style={styles.supplyPriceAmount}>{doubleBundle.price}</Text>
                  {doubleBundle.originalPrice && (
                    <Text style={styles.supplyPriceStrike}>{doubleBundle.originalPrice}</Text>
                  )}
                </View>
              </View>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>{doubleBundle.savings}</Text>
              </View>
            </TouchableOpacity>

            {/* 1 month plan */}
            <TouchableOpacity
              style={[styles.supplyCard, selectedBundle === 'single' && styles.supplyCardSelected]}
              onPress={() => setSelectedBundle('single')}
              activeOpacity={0.7}
            >
              <View style={[styles.radioOuter, selectedBundle === 'single' && styles.radioOuterSelected]}>
                {selectedBundle === 'single' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.supplyCardCenter}>
                <Text style={styles.supplyPlanText}>1 month plan</Text>
                <View style={styles.supplyPriceRow}>
                  <Text style={styles.supplyPriceAmount}>{singleBundle.price}</Text>
                  {singleBundle.originalPrice && (
                    <Text style={styles.supplyPriceStrike}>{singleBundle.originalPrice}</Text>
                  )}
                </View>
              </View>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>{singleBundle.savings}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Reassurance quote */}
          <View style={styles.reassuranceCard}>
            <View style={styles.reassuranceAvatar}>
              <Image
                source={require('../images/alistair-murray-results-img.png')}
                style={styles.reassuranceAvatarImg}
                resizeMode="cover"
              />
            </View>
            <View style={styles.reassuranceTextCol}>
              <Text style={styles.reassuranceQuote}>
                "One month is our minimum plan length and gives you enough time to build early habits and see real results."
              </Text>
              <Text style={styles.reassuranceName}>Alistair Murray GPhC, Chief Operating Officer</Text>
            </View>
          </View>
        </View>

        {/* Pricing breakdown link */}
        <TouchableOpacity
          onPress={() => setIsPricingModalVisible(true)}
          style={styles.exploreButton}
        >
          <Text style={styles.exploreButtonText}>View pricing breakdown</Text>
        </TouchableOpacity>

      </View>
    );
  };

  // -------------------------------------------------------------------------
  // Step 3: Plan Goal
  // -------------------------------------------------------------------------
  const renderPlanGoal = () => {
    const doseColors =
      activeMedKey === 'wegovy'
        ? pippTheme.colors.doses.wegovy
        : pippTheme.colors.doses.mounjaro;

    const is1Month = selectedBundle === 'single';
    const penCount = is1Month ? 1 : 2;

    // Build plans dynamically based on medication and bundle length
    const wegovyPlans = is1Month
      ? [
          {
            id: 'increasing',
            title: 'Start your journey',
            badge: 'Recommended',
            perPen: '£89',
            total: '£89',
            savings: 'Save £30',
            timeline: [{ period: 'Month 1', dose: '0.25mg', label: 'Start at 0.25mg' }],
            bestFor: ['New to treatment or on a starter dose', 'First time using GLP-1 medication'],
          },
          {
            id: 'maintenance',
            title: 'Stay consistent',
            badge: null,
            perPen: '£139',
            total: '£139',
            savings: null,
            timeline: [{ period: 'Month 1', dose: '0.5mg', label: 'Maintain at 0.5mg' }],
            bestFor: ['Already seeing good results at your current dose', 'Clinician recommends staying steady'],
          },
          {
            id: 'decreasing',
            title: 'Step down safely',
            badge: null,
            perPen: '£89',
            total: '£89',
            savings: 'Save £30',
            timeline: [{ period: 'Month 1', dose: '0.25mg', label: 'Step down to 0.25mg' }],
            bestFor: ['Winding down treatment with clinician guidance', 'Preparing to come off medication'],
          },
        ]
      : [
          {
            id: 'increasing',
            title: 'Start your journey',
            badge: 'Recommended',
            perPen: '£102.50',
            total: '£205',
            savings: 'Save £40',
            timeline: [
              { period: 'Month 1', dose: '0.25mg', label: 'Start at 0.25mg' },
              { period: 'Month 2', dose: '0.5mg', label: 'Increase to 0.5mg' },
            ],
            bestFor: ['New to treatment or on a starter dose', 'Ready for the next step in your titration'],
          },
          {
            id: 'maintenance',
            title: 'Stay consistent',
            badge: null,
            perPen: '£92.50',
            total: '£185',
            savings: 'Save £47',
            timeline: [
              { period: 'Month 1', dose: '0.25mg', label: 'Maintain at 0.25mg' },
              { period: 'Month 2', dose: '0.25mg', label: 'Maintain at 0.25mg' },
            ],
            bestFor: ['Already seeing good results at your current dose', 'Clinician recommends staying steady'],
          },
          {
            id: 'decreasing',
            title: 'Step down safely',
            badge: null,
            perPen: '£102.50',
            total: '£205',
            savings: 'Save £40',
            timeline: [
              { period: 'Month 1', dose: '0.5mg', label: 'Continue at 0.5mg' },
              { period: 'Month 2', dose: '0.25mg', label: 'Step down to 0.25mg' },
            ],
            bestFor: ['Winding down treatment with clinician guidance', 'Preparing to come off medication'],
          },
        ];

    const mountjaroPlans = is1Month
      ? [
          {
            id: 'increasing',
            title: 'Start your journey',
            badge: 'Recommended',
            perPen: '£149',
            total: '£149',
            savings: 'Save £30',
            timeline: [{ period: 'Month 1', dose: '2.5mg', label: 'Start at 2.5mg' }],
            bestFor: ['New to treatment or on a starter dose', 'First time using GLP-1 medication'],
          },
          {
            id: 'maintenance',
            title: 'Stay consistent',
            badge: null,
            perPen: '£199',
            total: '£199',
            savings: null,
            timeline: [{ period: 'Month 1', dose: '5mg', label: 'Maintain at 5mg' }],
            bestFor: ['Already seeing good results at your current dose', 'Clinician recommends staying steady'],
          },
          {
            id: 'decreasing',
            title: 'Step down safely',
            badge: null,
            perPen: '£149',
            total: '£149',
            savings: 'Save £30',
            timeline: [{ period: 'Month 1', dose: '2.5mg', label: 'Step down to 2.5mg' }],
            bestFor: ['Winding down treatment with clinician guidance', 'Preparing to come off medication'],
          },
        ]
      : [
          {
            id: 'increasing',
            title: 'Start your journey',
            badge: 'Recommended',
            perPen: '£162.50',
            total: '£325',
            savings: 'Save £40',
            timeline: [
              { period: 'Month 1', dose: '2.5mg', label: 'Start at 2.5mg' },
              { period: 'Month 2', dose: '5mg', label: 'Increase to 5mg' },
            ],
            bestFor: ['New to treatment or on a starter dose', 'Ready for the next step in your titration'],
          },
          {
            id: 'maintenance',
            title: 'Stay consistent',
            badge: null,
            perPen: '£126.50',
            total: '£253',
            savings: 'Save £47',
            timeline: [
              { period: 'Month 1', dose: '2.5mg', label: 'Maintain at 2.5mg' },
              { period: 'Month 2', dose: '2.5mg', label: 'Maintain at 2.5mg' },
            ],
            bestFor: ['Already seeing good results at your current dose', 'Clinician recommends staying steady'],
          },
          {
            id: 'decreasing',
            title: 'Step down safely',
            badge: null,
            perPen: '£162.50',
            total: '£325',
            savings: 'Save £40',
            timeline: [
              { period: 'Month 1', dose: '5mg', label: 'Continue at 5mg' },
              { period: 'Month 2', dose: '2.5mg', label: 'Step down to 2.5mg' },
            ],
            bestFor: ['Winding down treatment with clinician guidance', 'Preparing to come off medication'],
          },
        ];

    const plans = activeMedKey === 'wegovy' ? wegovyPlans : mountjaroPlans;

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepContent}>
          <Text style={faqStyles.faqLabel}>What's your goal?</Text>
          <Text style={styles.dosingSubtitle}>
            Choose the plan that best matches where you are in your journey.
          </Text>

          {plans.map((plan) => {
            const isSelected = selectedPlanGoal === plan.id;

            return (
              <TouchableOpacity
                key={plan.id}
                style={[styles.goalCard, isSelected && styles.goalCardSelected]}
                onPress={() => setSelectedPlanGoal(plan.id)}
                activeOpacity={0.7}
              >
                {/* Badge */}
                {plan.badge && (
                  <View style={styles.goalBadge}>
                    <View style={styles.goalBadgeInner}>
                      <Text style={styles.goalBadgeText}>{plan.badge}</Text>
                    </View>
                  </View>
                )}

                {/* Header: title + savings tag */}
                <View style={styles.goalHeaderRow}>
                  <Text style={styles.goalTitle}>{plan.title}</Text>
                  {plan.savings && (
                    <View style={styles.saveBadge}>
                      <Text style={styles.saveBadgeText}>{plan.savings}</Text>
                    </View>
                  )}
                </View>

                {/* Price */}
                <View style={styles.goalPriceRow}>
                  <Text style={styles.goalPriceValue}>{plan.perPen}</Text>
                  <Text style={styles.goalPriceUnit}> / pen</Text>
                </View>
                <Text style={styles.goalTotalText}>{plan.total} total</Text>

                {/* Expanded content */}
                {isSelected && (
                  <View style={styles.goalExpanded}>
                    {/* Timeline */}
                    <View style={styles.goalTimeline}>
                      {plan.timeline.map((step, i) => {
                        const color = (doseColors as any)[step.dose] || pippTheme.colors.surface.brand;
                        return (
                          <View key={i} style={styles.goalTimelineRow}>
                            <Text style={styles.goalTimelinePeriod}>{step.period}</Text>
                            <View style={[styles.goalTimelineDoseTag, { backgroundColor: color }]}>
                              <Text style={styles.goalTimelineDoseText}>{step.dose}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>

                    {/* Best for */}
                    <View style={styles.goalBestFor}>
                      <Text style={styles.goalBestForLabel}>Best for</Text>
                      {plan.bestFor.map((item, i) => (
                        <View key={i} style={styles.goalBestForRow}>
                          <Text style={styles.goalBestForBullet}>•</Text>
                          <Text style={styles.goalBestForText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------------------
  // Step 4: Consent
  // -------------------------------------------------------------------------
  const toggleConsentSection = (index: number) => {
    setExpandedConsent(expandedConsent === index ? null : index);
  };

  const renderConsent = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        <Text style={faqStyles.faqLabel}>Before you proceed</Text>
        <Text style={styles.dosingSubtitle}>
          I understand and agree to the following:
        </Text>

        {/* Consent cards */}
        <View style={styles.consentSections}>
          {CONSENT_SECTIONS.map((section, index) => {
            const isExpanded = expandedConsent === index;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => toggleConsentSection(index)}
                style={[
                  styles.consentCard,
                  isExpanded && styles.consentCardExpanded,
                ]}
                activeOpacity={0.7}
              >
                {/* Header */}
                <View style={styles.consentCardHeader}>
                  <Text style={styles.consentCardTitle}>{section.title}</Text>
                  <View style={styles.consentChevronContainer}>
                    <Text
                      style={[
                        styles.consentChevron,
                        isExpanded && styles.consentChevronExpanded,
                      ]}
                    >
                      ▾
                    </Text>
                  </View>
                </View>

                {/* Expanded bullets */}
                {isExpanded && (
                  <View style={styles.consentCardBody}>
                    {section.bullets.map((bullet, i) => (
                      <View key={i} style={styles.consentBulletRow}>
                        <Text style={styles.consentBulletDot}>•</Text>
                        <Text style={styles.consentBulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          onPress={() => setConsentChecked(!consentChecked)}
          style={styles.checkboxRow}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              consentChecked && styles.checkboxChecked,
            ]}
          >
            {consentChecked && (
              <Text style={styles.checkboxTick}>✓</Text>
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            I have read and agree to the above information
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ctaContainer}>
        <PIPPButton
          text="Confirm and continue"
          onPress={() => {}}
          disabled={!consentChecked}
        />
        <Text style={styles.footerText}>
          By continuing, you confirm this information is accurate
        </Text>
      </View>
    </View>
  );

  // -------------------------------------------------------------------------
  // Main Render
  // -------------------------------------------------------------------------
  const renderStep = () => {
    switch (step) {
      case 0:
        return renderWelcome();
      case 1:
        return renderTreatment();
      case 2:
        return renderBundleSelection();
      case 3:
        return renderPlanGoal();
      case 4:
        return renderConsent();
      default:
        return renderWelcome();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={step === 0 ? styles.scrollContentFixed : (step === 2 || step === 3) ? [styles.scrollContent, { paddingBottom: 80 }] : styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={step !== 0}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            flexGrow: 1,
          }}
        >
          {renderStep()}
        </Animated.View>
      </ScrollView>
      {step === 2 && (
        <View style={styles.stickyFooter}>
          <PIPPButton
            text="Continue"
            onPress={() => goTo(3)}
            disabled={!selectedBundle}
          />
        </View>
      )}
      {step === 3 && (
        <View style={styles.stickyFooter}>
          <PIPPButton
            text="Continue to consent"
            onPress={() => goTo(4)}
            disabled={!selectedPlanGoal}
          />
        </View>
      )}
      <PricingModal
        visible={isPricingModalVisible}
        onClose={() => setIsPricingModalVisible(false)}
        brand={activeMedKey === 'wegovy' ? 'wegovy-flextouch' : 'mounjaro-kwikpen'}
      />
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
  scrollContentFixed: {
    flexGrow: 1,
    overflow: 'hidden',
  } as any,
  stepContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  stepContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexGrow: 1,
    gap: 20,
  },
  ctaContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // -------------------------------------------------------------------------
  // Header
  // -------------------------------------------------------------------------
  header: {
    position: 'sticky' as any,
    top: 0,
    zIndex: 10,
    backgroundColor: pippTheme.colors.background.primary,
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  headerBackButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackIcon: {
    width: 24,
    height: 24,
    tintColor: pippTheme.colors.icon.brand,
  },
  headerLogoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerLogo: {
    height: 22,
    width: 110,
  },
  progressTrack: {
    height: 4,
    width: '100%',
    backgroundColor: pippTheme.colors.surface.accent,
  },
  progressFill: {
    height: '100%',
    backgroundColor: pippTheme.colors.surface.brandDark,
  },

  // -------------------------------------------------------------------------
  // Step 0: Welcome
  // -------------------------------------------------------------------------
  welcomeContainer: {
    flexGrow: 1,
    minHeight: '100vh',
    backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #F1F9FF 40%, #DEF4F7 100%)',
    paddingHorizontal: 20,
    paddingBottom: 48,
  } as any,
  welcomeLogoContainer: {
    alignItems: 'center',
    paddingTop: 32,
  },
  welcomeLogo: {
    height: 28,
    width: 140,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  welcomeHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  welcomeSubtext: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  welcomeBottom: {
    alignItems: 'center',
  },

  // -------------------------------------------------------------------------
  // Step 1: Treatment
  // -------------------------------------------------------------------------
  sectionLabel: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: pippTheme.lineHeight[32],
  },

  // Hero card
  heroCard: {
    alignItems: 'center',
  },
  heroImageFrame: {
    height: 394,
    paddingTop: 20,
    paddingRight: 12,
    paddingBottom: 20,
    paddingLeft: 12,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E7ED',
    overflow: 'hidden',
    width: '100%',
  } as any,
  recommendedBadgeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 2,
  } as any,
  recommendedBadge: {
    backgroundColor: '#07073D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 17,
  },
  recommendedBadgeText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.inverse,
    lineHeight: 12,
  },
  heroFrameImage: {
    position: 'absolute',
    bottom: -150,
    width: 120,
    height: 500,
  } as any,
  heroInfoBox: {
    padding: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.60)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    zIndex: 2,
    alignSelf: 'stretch',
  } as any,
  statPillsRow: {
    flexDirection: 'row',
    gap: 4,
  } as any,
  statPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statPillSuccess: {
    backgroundColor: pippTheme.colors.surface.success,
  },
  statPillInfo: {
    backgroundColor: pippTheme.colors.surface.info,
  },
  statPillText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: 12,
  },
  heroFullName: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header4,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#000000',
    textAlign: 'left',
    lineHeight: 28,
  },
  heroDescription: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: '#000000',
    textAlign: 'left',
    lineHeight: 20,
  },
  pricingSection: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  } as any,
  pricingInner: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  } as any,
  priceLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[24],
    color: pippTheme.colors.text.primary,
    textAlign: 'center',
  } as any,
  priceStrikethrough: {
    color: pippTheme.colors.text.disabled,
    textDecorationLine: 'line-through',
  } as any,
  priceActive: {
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  pricingSubtext: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[20],
    color: pippTheme.colors.text.primary,
    textAlign: 'center',
  } as any,
  klarnaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as any,
  klarnaText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.subtle,
    textAlign: 'center',
  } as any,
  klarnaBadge: {
    padding: 2,
    borderRadius: 4,
    backgroundColor: '#FFB3C7',
  },
  klarnaImage: {
    width: 40,
    height: 9,
    aspectRatio: 40 / 9,
  },

  // Alt card
  altCard: {
    flexDirection: 'column',
    alignSelf: 'stretch',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    overflow: 'hidden',
    marginTop: 20,
  } as any,
  altCardBanner: {
    flexDirection: 'row',
    padding: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E7ED',
    backgroundImage: 'linear-gradient(90deg, #F9F9F9 0%, #FFF 100%)',
  } as any,
  altCardBannerIcon: {
    width: 16,
    height: 16,
    tintColor: pippTheme.colors.icon.subtle,
  },
  altCardBannerText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.subtle,
  },
  altCardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    overflow: 'hidden',
  } as any,
  altCardImageArea: {
    width: 80,
    paddingHorizontal: 18,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  } as any,
  altCardPenImage: {
    position: 'absolute',
    width: 44,
    height: 276,
    bottom: -100,
  } as any,
  altCardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    gap: 4,
    alignSelf: 'stretch',
  } as any,
  altCardLeft: {
    flex: 1,
  },
  altCardTitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[22],
    color: pippTheme.colors.text.primary,
  },
  altCardPrice: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[20],
    color: pippTheme.colors.text.primary,
  },
  altCardPriceStrike: {
    textDecorationLine: 'line-through',
    color: pippTheme.colors.text.disabled,
  } as any,
  altCardPriceActive: {
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  altCardPlan: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.subtle,
    marginTop: 2,
  },
  altCardChevron: {
    width: 24,
    height: 24,
    tintColor: pippTheme.colors.icon.default,
  },

  // Explore other treatments
  exploreButton: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  exploreButtonText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#086A74',
    lineHeight: 16,
    textAlign: 'center',
  } as any,
  exploreCardsContainer: {
    gap: 12,
    alignSelf: 'stretch',
  } as any,
  wegovyPillCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundImage: 'linear-gradient(89deg, #DCF2FF 0.62%, #FFF 32.75%)',
    overflow: 'hidden',
  } as any,
  orfoglipronCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundImage: 'linear-gradient(89deg, #FBE3E3 0.62%, #FFF 32.75%)',
    overflow: 'hidden',
  } as any,
  exploreCardImage: {
    width: 60,
    height: 80,
  },
  altCardBadge: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    alignSelf: 'flex-start',
  } as any,
  altCardBadgeText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
  } as any,

  pricingFrameLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.action,
    letterSpacing: 1.2,
    lineHeight: 20,
    textTransform: 'uppercase',
  } as any,
  pricingFrameHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.bold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: 28,
  },
  pricingFrameBody: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.subtle,
    lineHeight: 18,
    marginBottom: 8,
  },
  pricingTable: {
    overflow: 'hidden',
  } as any,
  pricingHeaderRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
    marginBottom: 0,
  },
  pricingHeaderLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.subtle,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } as any,
  pricingHeaderValue: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.subtle,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'right',
  } as any,
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  } as any,
  pricingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pricingDoseCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  } as any,
  pricingDoseText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: 24,
  },
  pricingDoseTag: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.subtle,
    lineHeight: 18,
  },
  pricingPriceText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.bold.toString() as any,
    color: pippTheme.colors.text.action,
    lineHeight: 24,
    textAlign: 'right',
  } as any,
  pricingFooter: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.subtle,
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'center',
  } as any,

  // Supply cards (Concept 1 style)
  supplyCardsContainer: {
    gap: 20,
    alignSelf: 'stretch',
  } as any,
  supplyCardsContainerTight: {
    gap: 12,
    alignSelf: 'stretch',
  } as any,
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  } as any,
  disclaimerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E6E7ED',
  },
  disclaimerText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: 22,
  },
  reassuranceCard: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
    gap: 14,
    borderRadius: 8,
    backgroundImage: 'linear-gradient(291deg, #FDFAF7 0%, #DEF4F7 100%)',
    alignSelf: 'stretch',
  } as any,
  reassuranceAvatar: {
    width: 44,
    height: 44,
    borderRadius: 120,
    backgroundColor: '#BEE9ED',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  } as any,
  reassuranceAvatarImg: {
    width: 44,
    height: 44,
  },
  reassuranceTextCol: {
    flex: 1,
    gap: 6,
  } as any,
  reassuranceQuote: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: 18,
  },
  reassuranceName: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.secondary,
    lineHeight: 16,
  },
  supplyCard: {
    position: 'relative',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    padding: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  } as any,
  supplyCardSelected: {
    borderColor: pippTheme.colors.border.primary,
    borderWidth: 2,
    padding: 15,
    paddingHorizontal: 11,
    backgroundImage: 'linear-gradient(291deg, #FDFAF7 0%, #DEF4F7 100%)',
  } as any,
  supplyCardLabel: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
  } as any,
  supplyCardLabelText: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundColor: pippTheme.colors.border.default,
    overflow: 'hidden',
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.primary,
  } as any,
  supplyCardLabelTextSelected: {
    borderColor: pippTheme.colors.border.primary,
    backgroundColor: pippTheme.colors.border.primary,
    color: '#FFFFFF',
  },
  supplyCardCenter: {
    flex: 1,
  },
  supplyPlanText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[20],
    color: pippTheme.colors.text.secondary,
  },
  supplyPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as any,
  supplyPriceAmount: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[32],
    color: pippTheme.colors.text.primary,
  },
  supplyPriceStrike: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[22],
    color: pippTheme.colors.text.disabled,
    textDecorationLine: 'line-through',
  } as any,
  saveBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundImage: 'linear-gradient(291deg, #E2FBF0 0%, #88F3C4 100%)',
  } as any,
  saveBadgeText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.primary,
  },

  // Pricing breakdown (bundle page)
  bundlePricingSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  pricingTabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F8FC',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  } as any,
  pricingTabItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  } as any,
  pricingTabItemActive: {
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
  } as any,
  pricingTabText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  } as any,
  pricingTabTextActive: {
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  pricingSupplyInfo: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  } as any,
  pricingSavePill: {
    backgroundColor: '#E8F5F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pricingSavePillText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.action,
    lineHeight: 16,
  },

  // Sticky footer
  stickyFooter: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: pippTheme.colors.background.primary,
    boxShadow: '0px -2px 12px rgba(0, 0, 0, 0.06)',
    zIndex: 20,
  } as any,

  // -------------------------------------------------------------------------
  // Medication badge pill (dosing step)
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

  // Section heading / subtitle
  sectionHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.bold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: pippTheme.lineHeight[32],
  },
  sectionSubtitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    color: pippTheme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: 24,
  },

  // -------------------------------------------------------------------------
  // Radio (shared)
  // -------------------------------------------------------------------------
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: pippTheme.colors.border.alt,
    backgroundColor: 'transparent',
    position: 'relative' as any,
  },
  radioOuterSelected: {
    borderColor: pippTheme.colors.icon.brand,
  },
  radioInner: {
    position: 'absolute' as any,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: pippTheme.colors.icon.brand,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -5 }, { translateY: -5 }],
  },

  // -------------------------------------------------------------------------
  // Step 3: Plan Goal
  // -------------------------------------------------------------------------
  goalCard: {
    alignSelf: 'stretch',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
    position: 'relative',
  } as any,
  goalCardSelected: {
    borderColor: pippTheme.colors.border.primary,
    borderWidth: 2,
    padding: 15,
    backgroundImage: 'linear-gradient(291deg, #FDFAF7 0%, #DEF4F7 100%)',
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
  } as any,
  goalBadge: {
    position: 'absolute',
    top: -11,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  } as any,
  goalBadgeInner: {
    backgroundColor: pippTheme.colors.surface.brand,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  goalBadgeText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#FFFFFF',
    lineHeight: 16,
  },
  goalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',
  } as any,
  goalTitle: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.secondary,
    lineHeight: 22,
  },
  goalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  } as any,
  goalPriceValue: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: pippTheme.lineHeight[22],
  },
  goalPriceUnit: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.subtle,
    lineHeight: pippTheme.lineHeight[22],
  },
  goalTotalText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    lineHeight: pippTheme.lineHeight[12],
    marginTop: -8,
  },
  goalExpanded: {
    borderTopWidth: 1,
    borderTopColor: pippTheme.colors.border.default,
    paddingTop: 12,
    gap: 12,
  } as any,
  goalTimeline: {
    gap: 8,
  } as any,
  goalTimelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'stretch',
  } as any,
  goalTimelinePeriod: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: '#000000',
    lineHeight: pippTheme.lineHeight[20],
    width: 68,
  },
  goalTimelineDoseTag: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  goalTimelineDoseText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#FFFFFF',
    lineHeight: 16,
  },
  goalBestFor: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    padding: 12,
    paddingVertical: 8,
    gap: 4,
  } as any,
  goalBestForLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#000000',
    lineHeight: pippTheme.lineHeight[20],
  },
  goalBestForRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  } as any,
  goalBestForBullet: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    color: '#000000',
    lineHeight: pippTheme.lineHeight[20],
  },
  goalBestForText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: '#000000',
    lineHeight: pippTheme.lineHeight[20],
    flex: 1,
  },

  // -------------------------------------------------------------------------
  // Step 4: Dosing Plan
  // -------------------------------------------------------------------------
  dosingSubtitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    lineHeight: 22,
  },
  doseTimeline: {
    gap: 0,
  } as any,
  doseTimelineRow: {
    flexDirection: 'row',
    minHeight: 68,
  } as any,
  doseTimelineLeft: {
    width: 36,
    alignItems: 'center',
    position: 'relative' as any,
  },
  doseConnectorLine: {
    position: 'absolute' as any,
    top: 0,
    width: 2,
    height: '50%',
  },
  doseConnectorLineBottom: {
    position: 'absolute' as any,
    bottom: 0,
    width: 2,
    height: '50%',
  },
  doseDot: {
    position: 'absolute' as any,
    top: '50%',
    transform: [{ translateY: -6 }],
    zIndex: 1,
  },
  doseTimelineContent: {
    flex: 1,
    paddingLeft: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  doseTimelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  } as any,
  doseTimelineDose: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: 24,
  },
  doseTimelineDesc: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    color: pippTheme.colors.text.secondary,
    lineHeight: 20,
    marginTop: 2,
  },
  startingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  startingBadgeText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: 14,
  },
  infoCard: {
    backgroundImage: 'linear-gradient(291deg, #FDFAF7 0%, #DEF4F7 100%)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  } as any,
  infoCardIcon: {
    width: 20,
    height: 20,
    marginTop: 1,
  },
  infoCardText: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    color: pippTheme.colors.text.primary,
    lineHeight: 22,
  },

  // -------------------------------------------------------------------------
  // Step 3: Review Summary
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
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  receiptRowLeft: {
    flex: 1,
  },
  receiptLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    color: pippTheme.colors.text.subtle,
    marginBottom: 4,
  },
  receiptValue: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E6E7ED',
    marginVertical: 16,
  },
  receiptTotal: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  receiptSavings: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    color: '#00C376',
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    marginTop: 4,
  },
  receiptPerPen: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    color: pippTheme.colors.text.subtle,
    marginTop: 4,
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
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.inverse,
  },
  editLink: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    color: pippTheme.colors.text.action,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
  },
  reassuranceText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
  },

  // -------------------------------------------------------------------------
  // Step 4: Consent
  // -------------------------------------------------------------------------
  consentSections: {
    gap: 10,
  } as any,
  consentCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
  } as any,
  consentCardExpanded: {
    borderColor: pippTheme.colors.border.primary,
    backgroundImage: 'linear-gradient(291deg, #FDFAF7 0%, #DEF4F7 100%)',
  } as any,
  consentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  } as any,
  consentCardTitle: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: 22,
  },
  consentChevronContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  } as any,
  consentChevron: {
    fontSize: 16,
    color: pippTheme.colors.text.subtle,
    transform: [{ rotate: '0deg' }],
  },
  consentChevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  consentCardBody: {
    borderTopWidth: 1,
    borderTopColor: pippTheme.colors.border.default,
    paddingTop: 12,
    gap: 8,
  } as any,
  consentBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  } as any,
  consentBulletDot: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    color: pippTheme.colors.text.action,
    lineHeight: pippTheme.lineHeight[20],
  },
  consentBulletText: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    lineHeight: pippTheme.lineHeight[20],
  },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: pippTheme.colors.border.alt,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: pippTheme.colors.surface.brand,
    borderColor: pippTheme.colors.surface.brand,
  },
  checkboxTick: {
    fontSize: 14,
    color: pippTheme.colors.text.inverse,
    fontWeight: pippTheme.fontWeight.bold.toString() as any,
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    color: pippTheme.colors.text.primary,
    lineHeight: 20,
  },
  footerText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    color: pippTheme.colors.text.subtle,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default Concept8Screen;
