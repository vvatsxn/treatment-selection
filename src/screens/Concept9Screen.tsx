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
// Design Tokens — Concept 9
// Strict 4-size type scale: 24 / 16 / 14 / 12 (NO 10px, 20px, 22px, 28px, 32px)
// ---------------------------------------------------------------------------
const C9 = {
  fontSize: {
    display: 34,   // Welcome hero heading only
    heading: 24,   // Section headings
    body: 16,      // Body text, subheadings
    secondary: 14, // Secondary text
    caption: 12,   // Captions, labels, small text (minimum)
  },
  lineHeight: {
    display: 42,
    heading: 32,
    body: 24,
    secondary: 22,
    caption: 16,
  },
  card: {
    radius: 12,
    padding: 16,
    borderDefault: pippTheme.colors.border.default,
    borderSelected: pippTheme.colors.border.primary,
    bgDefault: '#FFFFFF',
    bgSelected: 'linear-gradient(291deg, #FDFAF7 0%, #DEF4F7 100%)',
    shadowSm: '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.04)',
    shadowMd: '0px 4px 12px rgba(0, 0, 0, 0.08), 0px 1px 3px rgba(0, 0, 0, 0.04)',
    shadowLg: '0px 8px 24px rgba(0, 0, 0, 0.10), 0px 2px 6px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  anim: {
    fadeOut: 150,
    fadeIn: 350,
    stagger: 80,
  },
} as const;

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
        price: '£89.00',
        priceValue: 89,
        perPen: '£89/pen',
        originalPrice: '£119',
        savings: 'Save £30',
        convenience: '',
      },
      double: {
        key: 'double',
        title: '2 pen bundle',
        subtitle: '2 months supply',
        price: '£185.00',
        priceValue: 185,
        perPen: '£92.50/pen',
        originalPrice: '£238',
        savings: 'Save £53',
        bestValue: true,
        convenience: 'Fewer deliveries',
      },
      triple: {
        key: 'triple',
        title: '3 pen bundle',
        subtitle: '3 months supply',
        price: '£299.00',
        priceValue: 299,
        perPen: '£99.67/pen',
        originalPrice: '£413',
        savings: 'Save £114',
        bestValue: false,
        convenience: 'Best value per pen',
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
        price: '£149.00',
        priceValue: 149,
        perPen: '£149/pen',
        originalPrice: '£179',
        savings: 'Save £30',
        convenience: '',
      },
      double: {
        key: 'double',
        title: '2 pen bundle',
        subtitle: '2 months supply',
        price: '£253.00',
        priceValue: 253,
        perPen: '£126.50/pen',
        originalPrice: '£298',
        savings: 'Save £45',
        bestValue: true,
        convenience: 'Fewer deliveries',
      },
      triple: {
        key: 'triple',
        title: '3 pen bundle',
        subtitle: '3 months supply',
        price: '£349.00',
        priceValue: 349,
        perPen: '£116.33/pen',
        originalPrice: '£537',
        savings: 'Save £188',
        bestValue: false,
        convenience: 'Best value per pen',
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
// Animated FAQ Item
// ---------------------------------------------------------------------------
const AnimatedFaqItem: React.FC<{
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
  card?: boolean;
}> = ({ question, answer, isExpanded, onToggle, isLast, card }) => {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(heightAnim, {
        toValue: isExpanded ? 1 : 0,
        tension: 80,
        friction: 12,
        useNativeDriver: false,
      }),
      Animated.spring(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        tension: 80,
        friction: 12,
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
    <View style={card ? faqStyles.faqItemCard : undefined}>
      <TouchableOpacity
        style={card ? faqStyles.faqItemCardInner : faqStyles.faqItem}
        onPress={onToggle}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel={`${question}. ${isExpanded ? 'Collapse' : 'Expand'}`}
        accessibilityState={{ expanded: isExpanded }}
      >
        <Text style={faqStyles.faqQuestion}>{question}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Text style={faqStyles.faqIcon}>+</Text>
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={card
        ? { maxHeight, opacity, overflow: 'hidden', paddingHorizontal: 16 } as any
        : { maxHeight, opacity, overflow: 'hidden' } as any
      }>
        <Text style={faqStyles.faqAnswer}>{answer}</Text>
      </Animated.View>
      {!isLast && !card && <View style={faqStyles.faqDivider} />}
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
    fontSize: C9.fontSize.heading,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: C9.lineHeight.heading,
    letterSpacing: 0.3,
  },
  faqDivider: {
    height: 1,
    backgroundColor: '#DAE0E8',
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 16,
    minHeight: 48,
  } as any,
  faqItemCard: {
    alignSelf: 'stretch',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    overflow: 'hidden',
  } as any,
  faqItemCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 16,
  } as any,
  faqQuestion: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.body,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: C9.lineHeight.body,
  },
  faqIcon: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.heading,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.action,
    lineHeight: C9.lineHeight.body,
    width: 24,
    textAlign: 'center',
  } as any,
  faqAnswer: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.secondary,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    lineHeight: C9.lineHeight.secondary,
    paddingBottom: 20,
  },
});

// ---------------------------------------------------------------------------
// Animated Best For — smooth expand/collapse for goal card details
// ---------------------------------------------------------------------------
const AnimatedBestFor: React.FC<{
  isVisible: boolean;
  bestFor: string[];
}> = ({ isVisible, bestFor }) => {
  const heightAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(heightAnim, {
      toValue: isVisible ? 1 : 0,
      tension: 80,
      friction: 12,
      useNativeDriver: false,
    }).start();
  }, [isVisible]);

  const maxHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const opacity = heightAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const marginTop = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 0],
  });

  return (
    <Animated.View style={{ maxHeight, opacity, marginTop, overflow: 'hidden' } as any}>
      <View style={goalBestForStyles.container}>
        <Text style={goalBestForStyles.label}>Best for</Text>
        {bestFor.map((item, i) => (
          <View key={i} style={goalBestForStyles.row}>
            <Text style={goalBestForStyles.bullet}>•</Text>
            <Text style={goalBestForStyles.text}>{item}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const goalBestForStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    borderColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    gap: 4,
    padding: 12,
    paddingVertical: 8,
  },
  label: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: C9.lineHeight.caption,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bullet: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    color: pippTheme.colors.text.primary,
    lineHeight: C9.lineHeight.caption,
  },
  text: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: C9.lineHeight.caption,
  },
});

// ---------------------------------------------------------------------------
// Animated Consent Section — smooth expand/collapse
// ---------------------------------------------------------------------------
const AnimatedConsentSection: React.FC<{
  section: typeof CONSENT_SECTIONS[0];
  index: number;
  isExpanded: boolean;
  isRead: boolean;
  onToggle: () => void;
  hoveredCard: string | null;
  setHoveredCard: (id: string | null) => void;
}> = ({ section, index, isExpanded, isRead, onToggle, hoveredCard, setHoveredCard }) => {
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heightAnim, {
      toValue: isExpanded ? 1 : 0,
      tension: 80,
      friction: 12,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const maxHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500],
  });
  const bodyOpacity = heightAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const cardId = `consent-${index}`;
  const isHovered = hoveredCard === cardId;

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        consentStyles.consentCard,
        isExpanded && consentStyles.consentCardExpanded,
        isRead && !isExpanded && consentStyles.consentCardRead,
        isHovered && !isExpanded && { boxShadow: C9.card.shadowMd } as any,
      ]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
      accessibilityLabel={`${section.title}${isRead ? ', read' : ''}`}
      {...{ onMouseEnter: () => setHoveredCard(cardId), onMouseLeave: () => setHoveredCard(null) } as any}
    >
      <View style={consentStyles.consentCardHeader}>
        <View style={consentStyles.consentCardTitleRow}>
          {isRead && !isExpanded && (
            <Text style={consentStyles.consentReadCheck}>✓</Text>
          )}
          <Text style={consentStyles.consentCardTitle}>{section.title}</Text>
        </View>
        <View style={consentStyles.consentChevronContainer}>
          <Text
            style={[
              consentStyles.consentChevron,
              isExpanded && consentStyles.consentChevronExpanded,
            ]}
          >
            ▾
          </Text>
        </View>
      </View>
      <Animated.View style={{ maxHeight, opacity: bodyOpacity, overflow: 'hidden' } as any}>
        <View style={consentStyles.consentCardBody}>
          {section.bullets.map((bullet, i) => (
            <View key={i} style={consentStyles.consentBulletRow}>
              <Text style={consentStyles.consentBulletDot}>•</Text>
              <Text style={consentStyles.consentBulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Consent card styles (extracted for AnimatedConsentSection)
const consentStyles = StyleSheet.create({
  consentCard: {
    borderRadius: C9.card.radius,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    padding: C9.card.padding,
    boxShadow: C9.card.shadowSm,
    transition: C9.card.transition,
  } as any,
  consentCardExpanded: {
    borderColor: pippTheme.colors.border.primary,
    borderWidth: 2,
    padding: 15,
    backgroundImage: C9.card.bgSelected,
    boxShadow: C9.card.shadowMd,
  } as any,
  consentCardRead: {
    borderColor: '#00C376',
    backgroundColor: 'rgba(0, 195, 118, 0.06)',
  },
  consentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  } as any,
  consentCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  } as any,
  consentReadCheck: {
    color: '#00C376',
    fontSize: C9.fontSize.body,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: C9.lineHeight.body,
  },
  consentCardTitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.body,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: C9.lineHeight.body,
  },
  consentChevronContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentChevron: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.body,
    color: pippTheme.colors.text.subtle,
    lineHeight: C9.lineHeight.body,
    transition: 'transform 0.3s ease',
  } as any,
  consentChevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  consentCardBody: {
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
    fontSize: C9.fontSize.secondary,
    color: pippTheme.colors.text.secondary,
    lineHeight: C9.lineHeight.secondary,
    width: 12,
  },
  consentBulletText: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.secondary,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    lineHeight: C9.lineHeight.secondary,
  },
});

// ---------------------------------------------------------------------------
// Premium CTA Wrapper — navy-tinted glow shadow for primary buttons
// ---------------------------------------------------------------------------
const PremiumCTAWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={premiumCtaStyles.wrapper}>
    {children}
  </View>
);

const premiumCtaStyles = StyleSheet.create({
  wrapper: {
    borderRadius: 360,
    boxShadow: '0px 4px 14px rgba(7, 7, 61, 0.25), 0px 1px 3px rgba(7, 7, 61, 0.12)',
    overflow: 'visible',
  } as any,
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const Concept9Screen: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Welcome animation refs
  const welcomeFadeAnim = useRef(new Animated.Value(0)).current;
  const welcomeSlideAnim = useRef(new Animated.Value(40)).current;
  const badgeFadeAnim = useRef(new Animated.Value(0)).current;
  const badgeSlideAnim = useRef(new Animated.Value(24)).current;

  const STEP_PATHS = ['/concept-2', '/concept-2/treatment', '/concept-2/bundle', '/concept-2/plan', '/concept-2/consent'];
  const getStepFromPath = () => {
    const path = window.location.pathname;
    const idx = STEP_PATHS.findIndex((p, i) => i > 0 && path === p);
    return idx >= 0 ? idx : 0;
  };
  const [step, setStep] = useState(getStepFromPath);
  const [selectedMedication, setSelectedMedication] = useState<string | null>(() => sessionStorage.getItem('c2_med') || null);
  const [selectedBundle, setSelectedBundle] = useState<string>(() => sessionStorage.getItem('c2_bundle') || 'double');
  const [selectedDose, setSelectedDose] = useState<string | null>(null);
  const [expandedConsent, setExpandedConsent] = useState<number | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentRead, setConsentRead] = useState<Set<number>>(new Set()); // Track read sections
  const [exploringOther, setExploringOther] = useState(false);
  const [expandedFaqs, setExpandedFaqs] = useState<Set<number>>(new Set());
  const [isPricingModalVisible, setIsPricingModalVisible] = useState(false);
  const [selectedPlanGoal, setSelectedPlanGoal] = useState<string | null>('increasing');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const recommendedMedKey = MEDICATION_KEYS[0];
  const activeMedKey = selectedMedication || recommendedMedKey;
  const med = MEDICATIONS[activeMedKey];
  const bundle = selectedBundle ? med.bundles[selectedBundle] : null;

  // Persist selections to sessionStorage
  useEffect(() => { if (selectedMedication) sessionStorage.setItem('c2_med', selectedMedication); }, [selectedMedication]);
  useEffect(() => { if (selectedBundle) sessionStorage.setItem('c2_bundle', selectedBundle); }, [selectedBundle]);

  // Welcome entrance animation
  useEffect(() => {
    if (step === 0) {
      welcomeFadeAnim.setValue(0);
      welcomeSlideAnim.setValue(40);
      badgeFadeAnim.setValue(0);
      badgeSlideAnim.setValue(24);

      Animated.parallel([
        Animated.timing(welcomeFadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: false,
        }),
        Animated.spring(welcomeSlideAnim, {
          toValue: 0,
          tension: 50,
          friction: 10,
          useNativeDriver: false,
        }),
      ]).start(() => {
        Animated.parallel([
          Animated.timing(badgeFadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.spring(badgeSlideAnim, {
            toValue: 0,
            tension: 60,
            friction: 10,
            useNativeDriver: false,
          }),
        ]).start();
      });
    }
  }, [step]);

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

  const animateTransition = (nextStep: number, skipPush?: boolean) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: C9.anim.fadeOut,
      useNativeDriver: false,
    }).start(() => {
      setStep(nextStep);
      if (!skipPush) {
        window.history.pushState({ step: nextStep }, '', STEP_PATHS[nextStep]);
      }
      scrollToTop();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: C9.anim.fadeIn,
          useNativeDriver: false,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: false,
        }),
      ]).start();
    });
  };

  const goTo = (nextStep: number) => animateTransition(nextStep);
  const goBack = () => { if (step > 0) goTo(step - 1); };

  // Sync step with browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const newStep = getStepFromPath();
      animateTransition(newStep, true);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const switchMedication = (medKey: string) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: C9.anim.fadeOut,
      useNativeDriver: false,
    }).start(() => {
      setSelectedMedication(medKey);
      setSelectedBundle('double');
      scrollToTop();
      slideAnim.setValue(15);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: C9.anim.fadeIn,
          useNativeDriver: false,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
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
  // Header with Step Indicator
  // -------------------------------------------------------------------------
  const totalSteps = 5;

  const renderHeader = () => {
    if (step === 0) return null;

    const progressPercent = `${(step / (totalSteps - 1)) * 100}%`;

    return (
      <View style={styles.header} accessibilityRole="banner">
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={goBack}
            style={styles.headerBackButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Image
              source={require('../theme/icons/arrow-back.svg')}
              style={styles.headerBackIcon}
              accessibilityLabel="Back arrow"
            />
          </TouchableOpacity>
          <View style={styles.headerLogoContainer}>
            <Image
              source={require('../images/phlo-clinic-logo-default.png')}
              style={styles.headerLogo}
              resizeMode="contain"
              accessibilityLabel="Phlo Clinic logo"
            />
          </View>
          <View style={styles.headerBackButton} />
        </View>
        <View style={styles.progressTrack} accessibilityRole="progressbar" accessibilityLabel={`Step ${step} of 4`}>
          <View
            style={
              [
                styles.progressFill,
                {
                  width: progressPercent,
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                },
              ] as any
            }
          />
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------------------
  // Step 0: Welcome — Trust badges + animated entrance + stronger gradient
  // -------------------------------------------------------------------------
  const renderWelcome = () => (
    <View style={styles.welcomeContainer} accessibilityRole="main">
      <View style={styles.welcomeLogoContainer}>
        <Image
          source={require('../images/phlo-clinic-logo-default.png')}
          style={styles.welcomeLogo}
          resizeMode="contain"
          accessibilityLabel="Phlo Clinic logo"
        />
      </View>

      <Animated.View style={[styles.welcomeContent, {
        opacity: welcomeFadeAnim,
        transform: [{ translateY: welcomeSlideAnim }],
      }]}>
        <Text style={styles.welcomeHeading} accessibilityRole="header">
          {'Your weight loss\njourney starts here'}
        </Text>
      </Animated.View>

      {/* Trust strip */}
      <Animated.View style={[styles.trustStrip, {
        opacity: badgeFadeAnim,
        transform: [{ translateY: badgeSlideAnim }],
      }]}>
        {['CQC Regulated', 'Clinician-led programme', 'Trusted by +90,000 patients'].map((item, i) => (
          <React.Fragment key={item}>
            {i > 0 && <Text style={styles.trustStripDot}>{'\u00B7'}</Text>}
            <Text style={styles.trustStripText}>{item.toUpperCase()}</Text>
          </React.Fragment>
        ))}
      </Animated.View>

      <View style={styles.welcomeBottom}>
        <PIPPButton text="Explore all treatments" onPress={() => goTo(1)} />
      </View>
    </View>
  );

  // -------------------------------------------------------------------------
  // Step 1: Treatment — Fixed pricing, 4-size type scale, a11y
  // -------------------------------------------------------------------------
  const renderTreatment = () => {
    const altKey = activeMedKey === 'wegovy' ? 'mounjaro' : 'wegovy';
    const alt = MEDICATIONS[altKey];
    const altGradient = altKey === 'mounjaro'
      ? 'linear-gradient(89deg, #F8EBFF 0.62%, #FFF 32.75%)'
      : 'linear-gradient(89deg, #DCF2FF 0.62%, #FFF 32.75%)';

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepContent}>
          <Text style={[faqStyles.faqLabel, { textAlign: 'center' }]} accessibilityRole="header">Choose your treatment</Text>

          {/* Hero card */}
          <View style={styles.heroCard}>
            <View
              style={
                [
                  styles.heroImageFrame,
                  { backgroundImage: med.gradient },
                ] as any
              }
            >
              <Image
                source={med.image}
                style={[styles.heroFrameImage, activeMedKey === 'mounjaro' && { bottom: -120, transform: 'rotate(180deg)' }] as any}
                resizeMode="contain"
                accessibilityLabel={`${med.fullName} pen`}
              />

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
              <Text style={styles.priceLabel}>
                From <Text style={styles.priceStrikethrough}>{med.bundles.single.originalPrice}</Text>{' '}
                <Text style={styles.priceActive}>{med.bundles.single.price.replace('.00', '')}</Text> per pen
              </Text>
              <Text style={styles.pricingSubtext}>Starting dose, subject to clinical approval</Text>
            </View>
            <View style={styles.klarnaRow}>
              <Text style={styles.klarnaText}>Pay with</Text>
              <View style={styles.klarnaBadge}>
                <Image
                  source={require('../images/klarna.jpg')}
                  style={styles.klarnaImage}
                  resizeMode="contain"
                  accessibilityLabel="Klarna"
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

          {/* Other treatments frame */}
          <View style={[styles.otherTreatmentsFrame, { marginTop: 32 }]}>
            <View style={styles.otherTreatmentsHeader}>
              <Image
                source={require('../theme/icons/check_circle.svg')}
                style={styles.otherTreatmentsIcon}
              />
              <Text style={styles.otherTreatmentsLabel}>You're also eligible for</Text>
            </View>

            <TouchableOpacity
              style={[styles.altMedCard, { backgroundImage: altGradient }] as any}
              onPress={() => switchMedication(altKey)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${alt.fullName}, from ${alt.bundles.single.price} per pen`}
            >
              <View style={styles.altCardImageArea}>
                <Image
                  source={alt.image}
                  style={[styles.altCardPenImage, altKey === 'mounjaro' && { bottom: -70 }]}
                  accessibilityLabel={`${alt.fullName} pen`}
                />
              </View>
              <View style={[styles.altCardContent, { paddingVertical: 20 }]}>
                <View style={styles.altCardLeft}>
                  <Text style={styles.altCardTitle}>{alt.fullName}</Text>
                  <Text style={styles.altCardPrice}>
                    <Text style={styles.altCardPriceStrike}>{alt.bundles.single.originalPrice}</Text>{' '}
                    <Text style={styles.altCardPriceActive}>{alt.bundles.single.price.replace('.00', '')}</Text> per pen
                  </Text>
                  <Text style={styles.altCardPlan}>Starting dose price</Text>
                </View>
                <Image
                  source={require('../theme/icons/chevron-right.svg')}
                  style={styles.altCardChevron}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.wegovyPillCard, { marginTop: 8 }]} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="View Wegovy Pill">
              <View style={styles.altCardImageArea}>
                <Image
                  source={require('../images/wegovy-pill.png')}
                  style={styles.exploreCardImage}
                  resizeMode="contain"
                  accessibilityLabel="Wegovy Pill"
                />
              </View>
              <View style={[styles.altCardContent, { paddingVertical: 20 }]}>
                <View style={styles.altCardLeft}>
                  <Text style={styles.altCardTitle}>Wegovy Pill</Text>
                  <Text style={styles.altCardPrice}>
                    <Text style={styles.altCardPriceStrike}>£119</Text>{' '}
                    <Text style={styles.altCardPriceActive}>£89</Text> per pen
                  </Text>
                  <Text style={styles.altCardPlan}>Starting dose price</Text>
                </View>
                <Image
                  source={require('../theme/icons/chevron-right.svg')}
                  style={styles.altCardChevron}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.orfoglipronCard, { marginTop: 8 }]} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="View Orfoglipron tablet">
              <View style={styles.altCardImageArea}>
                <Image
                  source={require('../images/orfoglipron-tablet.png')}
                  style={styles.exploreCardImage}
                  resizeMode="contain"
                  accessibilityLabel="Orfoglipron tablet"
                />
              </View>
              <View style={[styles.altCardContent, { paddingVertical: 20 }]}>
                <View style={styles.altCardLeft}>
                  <Text style={styles.altCardTitle}>Orfoglipron tablet</Text>
                  <Text style={styles.altCardPrice}>
                    <Text style={styles.altCardPriceStrike}>£119</Text>{' '}
                    <Text style={styles.altCardPriceActive}>£89</Text> per pen
                  </Text>
                  <Text style={styles.altCardPlan}>Starting dose price</Text>
                </View>
                <Image
                  source={require('../theme/icons/chevron-right.svg')}
                  style={styles.altCardChevron}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reassurance quote */}
        <View style={[styles.reassuranceCard, { marginHorizontal: 20, marginTop: 32 }] as any}>
          <View style={styles.reassuranceAvatar}>
            <Image
              source={require('../images/alistair-murray-results-img.png')}
              style={styles.reassuranceAvatarImg}
              resizeMode="cover"
              accessibilityLabel="Alistair Murray"
            />
          </View>
          <View style={styles.reassuranceTextCol}>
            <Text style={styles.reassuranceQuote}>
              "Our clinical team supports you at every step — from your first dose through to your long-term weight loss goals."
            </Text>
            <Text style={styles.reassuranceName}>Alistair Murray GPhC, Chief Operating Officer</Text>
          </View>
        </View>

        {/* FAQ section */}
        <View style={styles.faqCard}>
          <Text style={styles.faqCardHeading}>Got a question?</Text>
          <View style={styles.faqCardQuestions}>
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
              card
            />
          ))}
          </View>
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------------------
  // Step 2: Bundle Selection — Pre-selected, checkmarks, Most Popular
  // -------------------------------------------------------------------------
  const renderBundleSelection = () => {
    const singleBundle = med.bundles.single;
    const doubleBundle = med.bundles.double;
    const tripleBundle = med.bundles.triple;

    const bundleOptions = [
      { key: 'triple', bundle: tripleBundle, penCount: 3, title: '3 month plan from', badge: 'Best value',
        savingsPill: `Savings up to £${Math.floor((parseInt(tripleBundle.originalPrice!.replace('£','')) - tripleBundle.priceValue) / 3)} per pen`,
        bullets: [
          { bold: 'Price locked', rest: ' for 3 months' },
          { bold: '1 order, 1 delivery', rest: ' re-order every 3 months' },
        ],
        showKlarna: true },
      { key: 'double', bundle: doubleBundle, penCount: 2, title: '2 month plan from', badge: 'Most popular',
        savingsPill: `Savings up to £${Math.floor((parseInt(doubleBundle.originalPrice!.replace('£','')) - doubleBundle.priceValue) / 2)} per pen`,
        bullets: [
          { bold: 'Price locked', rest: ' for 2 months' },
          { bold: '1 order, 1 delivery', rest: ' — re-order every 2 months' },
        ],
        showKlarna: false },
      { key: 'single', bundle: singleBundle, penCount: 1, title: '1 month plan from', badge: null,
        savingsPill: null,
        bullets: [
          { bold: 'No price lock', rest: '' },
          { bold: '', rest: 'Re-order required each month' },
        ],
        showKlarna: false },
    ];

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepContent}>
          <Text style={faqStyles.faqLabel} accessibilityRole="header">Choose supply length</Text>

          <View style={styles.bundleCardsContainer} accessibilityRole="radiogroup" accessibilityLabel="Supply length options">
            {bundleOptions.map((option) => {
              const isSelected = selectedBundle === option.key;
              return (
                <View key={option.key} style={[styles.bundleCardWrapper, option.badge ? { marginTop: 9 } : undefined] as any}>
                  {option.badge && (
                    <View style={[styles.supplyCardLabel, { zIndex: 1 }] as any}>
                      <Text style={styles.bundleBadgeText}>{option.badge}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.bundleCard}
                    onPress={() => { setSelectedBundle(option.key); goTo(3); }}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${option.title} ${option.bundle.price}`}
                  >
                    {/* Top: pen image + pricing + View */}
                    <View style={styles.bundleCardTop}>
                      <View style={styles.bundleCardPenWrap}>
                        {Array.from({ length: option.penCount }).map((_, i) => (
                          <Image
                            key={i}
                            source={med.image}
                            style={{
                              width: 17,
                              height: 70,
                              transform: 'rotate(-15deg)',
                              flexShrink: 0,
                              aspectRatio: 17 / 70,
                              marginRight: i < option.penCount - 1 ? -26 : 0,
                              filter: i < option.penCount - 1
                                ? 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.12))'
                                : option.penCount === 1 ? 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.12))' : 'none',
                              zIndex: option.penCount - i,
                            } as any}
                            resizeMode="contain"
                          />
                        ))}
                      </View>
                      <View style={styles.bundleCardPricing}>
                        <Text style={styles.bundleCardPlanName}>{option.title}</Text>
                        <View style={styles.bundleCardPriceRow}>
                          <Text style={styles.bundleCardPrice}>{option.bundle.price}</Text>
                          {option.bundle.originalPrice && (
                            <Text style={styles.bundleCardOrigPrice}>{option.bundle.originalPrice}</Text>
                          )}
                        </View>
                      </View>
                      <Text style={styles.bundleCardViewBtn}>View</Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.bundleCardDivider} />

                    {/* Bottom: savings pill + bullet points */}
                    <View style={styles.bundleCardBullets}>
                      {option.savingsPill && (
                        <View style={styles.bundleSavingsPill}>
                          <Image source={require('../theme/icons/exemption-money.svg')} style={styles.bundleSavingsIcon} resizeMode="contain" />
                          <Text style={styles.bundleSavingsPillText}>{option.savingsPill}</Text>
                        </View>
                      )}
                      {option.bullets.map((bullet, i) => (
                        <View key={i} style={styles.bundleCardBulletRow}>
                          <Text style={styles.bundleCardBulletDot}>{'\u2022'}</Text>
                          <Text style={styles.bundleCardBulletText}>
                            {bullet.bold ? <Text style={styles.bundleCardBulletSemiBold}>{bullet.bold}</Text> : null}
                            {bullet.rest}
                          </Text>
                        </View>
                      ))}
                      {option.showKlarna && (
                        <View style={styles.bundleKlarnaRow}>
                          <View style={styles.bundleKlarnaLine} />
                          <View style={[styles.klarnaRow, { flexShrink: 0 }] as any}>
                            <Text style={styles.klarnaText}>Pay with</Text>
                            <View style={styles.klarnaBadge}>
                              <Image
                                source={require('../images/klarna.jpg')}
                                style={styles.klarnaImage}
                                resizeMode="contain"
                                accessibilityLabel="Klarna"
                              />
                            </View>
                            <Text style={styles.klarnaText}>available</Text>
                          </View>
                          <View style={styles.bundleKlarnaLine} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

        </View>

        <TouchableOpacity
          onPress={() => setIsPricingModalVisible(true)}
          style={styles.exploreButton}
          accessibilityRole="button"
          accessibilityLabel="View pricing breakdown"
        >
          <Text style={styles.exploreButtonText}>View pricing breakdown</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // -------------------------------------------------------------------------
  // Step 3: Plan Goal — Timeline visible on ALL cards
  // -------------------------------------------------------------------------
  const renderPlanGoal = () => {
    const doseColors =
      activeMedKey === 'wegovy'
        ? pippTheme.colors.doses.wegovy
        : pippTheme.colors.doses.mounjaro;

    const wegovyPlansByBundle: Record<string, any[]> = {
      single: [
        { id: 'increasing', title: 'Start your journey', perPen: '£89', total: '£89.00', savings: 'Save £30',
          timeline: [{ period: 'Month 1', dose: '0.25mg' }] },
        { id: 'maintenance', title: 'Stay consistent', perPen: '£139', total: '£139.00', savings: null,
          timeline: [{ period: 'Month 1', dose: '0.5mg' }] },
      ],
      double: [
        { id: 'increasing', title: 'Start your journey', perPen: '£92.50', total: '£185.00', savings: 'Save £53',
          timeline: [{ period: 'Month 1', dose: '0.25mg' }, { period: 'Month 2', dose: '0.5mg' }] },
        { id: 'maintenance', title: 'Stay consistent', perPen: '£92.50', total: '£185.00', savings: 'Save £53',
          timeline: [{ period: 'Month 1', dose: '0.25mg' }, { period: 'Month 2', dose: '0.25mg' }] },
      ],
      triple: [
        { id: 'increasing', title: 'Start your journey', perPen: '£99.67', total: '£299.00', savings: 'Save £58',
          timeline: [{ period: 'Month 1', dose: '0.25mg' }, { period: 'Month 2', dose: '0.5mg' }, { period: 'Month 3', dose: '1mg' }] },
        { id: 'maintenance', title: 'Stay consistent', perPen: '£99.67', total: '£299.00', savings: 'Save £58',
          timeline: [{ period: 'Month 1', dose: '0.25mg' }, { period: 'Month 2', dose: '0.25mg' }, { period: 'Month 3', dose: '0.5mg' }] },
      ],
    };

    const mountjaroPlansByBundle: Record<string, any[]> = {
      single: [
        { id: 'increasing', title: 'Start your journey', perPen: '£149', total: '£149.00', savings: 'Save £30',
          timeline: [{ period: 'Month 1', dose: '2.5mg' }] },
        { id: 'maintenance', title: 'Stay consistent', perPen: '£199', total: '£199.00', savings: null,
          timeline: [{ period: 'Month 1', dose: '5mg' }] },
      ],
      double: [
        { id: 'increasing', title: 'Start your journey', perPen: '£126.50', total: '£253.00', savings: 'Save £45',
          timeline: [{ period: 'Month 1', dose: '2.5mg' }, { period: 'Month 2', dose: '5mg' }] },
        { id: 'maintenance', title: 'Stay consistent', perPen: '£126.50', total: '£253.00', savings: 'Save £45',
          timeline: [{ period: 'Month 1', dose: '2.5mg' }, { period: 'Month 2', dose: '2.5mg' }] },
      ],
      triple: [
        { id: 'increasing', title: 'Start your journey', perPen: '£116.33', total: '£349.00', savings: 'Save £188',
          timeline: [{ period: 'Month 1', dose: '2.5mg' }, { period: 'Month 2', dose: '5mg' }, { period: 'Month 3', dose: '7.5mg' }] },
        { id: 'maintenance', title: 'Stay consistent', perPen: '£116.33', total: '£349.00', savings: 'Save £188',
          timeline: [{ period: 'Month 1', dose: '2.5mg' }, { period: 'Month 2', dose: '2.5mg' }, { period: 'Month 3', dose: '5mg' }] },
      ],
    };

    const bundleKey = selectedBundle || 'single';
    const plans = activeMedKey === 'wegovy' ? wegovyPlansByBundle[bundleKey] : mountjaroPlansByBundle[bundleKey];

    const bundleLabel = selectedBundle === 'single' ? '1 month' : selectedBundle === 'double' ? '2 month' : '3 month';
    const penCount = selectedBundle === 'single' ? 1 : selectedBundle === 'double' ? 2 : 3;

    return (
      <View style={styles.stepContainer}>
        {/* Hero pen display — no page padding */}
        <View style={styles.goalHero}>
          <View style={styles.goalHeroPens}>
            {Array.from({ length: penCount }).map((_, i) => (
              <Image
                key={i}
                source={med.image}
                style={[
                  styles.goalHeroPenImage,
                  i > 0 && { marginLeft: activeMedKey === 'mounjaro' ? -52 : -32 },
                  activeMedKey === 'mounjaro' && { transform: 'rotate(180deg)' },
                ] as any}
                resizeMode="contain"
              />
            ))}
          </View>
        </View>

        {/* Plan details header */}
        <View style={styles.goalDetailsHeader}>
          <Text style={styles.goalDetailsTitle}>{bundleLabel} plans</Text>
          <View style={styles.goalDetailsMedInfo}>
            <Text style={styles.goalDetailsMedName}>{med.fullName}</Text>
            <Text style={styles.goalDetailsMedDesc}>{med.description}</Text>
          </View>
        </View>

        {/* Delivery notice */}
        <View style={styles.goalDeliveryNotice}>
          <View style={styles.goalDeliveryLine} />
          <Text style={styles.goalDeliveryText}>All pens delivered in one shipment</Text>
          <View style={styles.goalDeliveryLine} />
        </View>

        {/* Plan cards */}
        <View style={styles.goalCardsSection}>
          {plans.map((plan) => {
            const isSelected = selectedPlanGoal === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[styles.goalCardNew, isSelected && styles.goalCardNewSelected]}
                onPress={() => setSelectedPlanGoal(plan.id)}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${plan.title}, ${plan.total}, ${plan.perPen} per pen`}
              >
                {/* Top half — white */}
                <View style={styles.goalCardTop}>
                  <View style={styles.goalCardTopRow}>
                    <View style={styles.goalCardTopLeft}>
                      <Text style={styles.goalCardPlanName}>{plan.title}</Text>
                      <Text style={styles.goalCardPlanPrice}>{plan.total}</Text>
                      <Text style={styles.goalCardPlanPerPen}>{plan.perPen} / pen</Text>
                    </View>
                    {plan.savings && (
                      <View style={styles.saveBadge}>
                        <Text style={styles.saveBadgeText}>{plan.savings}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Bottom half — grey with dose timeline */}
                <View style={styles.goalCardBottom}>
                  {plan.timeline.map((timelineStep, i) => {
                    const color = (doseColors as any)[timelineStep.dose] || pippTheme.colors.surface.brand;
                    return (
                      <View key={i} style={styles.goalCardDoseRow}>
                        <Text style={styles.goalCardDoseMonth}>{timelineStep.period}</Text>
                        <View style={[styles.goalCardDoseTag, { backgroundColor: color }]}>
                          <Text style={styles.goalCardDoseText}>{timelineStep.dose}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------------------
  // Step 4: Consent — Read tracking, green checkmarks, "What happens next"
  // -------------------------------------------------------------------------
  const toggleConsentSection = (index: number) => {
    const newExpanded = expandedConsent === index ? null : index;
    setExpandedConsent(newExpanded);
    // Track that this section has been read
    if (newExpanded !== null) {
      setConsentRead(prev => new Set(prev).add(index));
    }
  };

  const renderConsent = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        <Text style={faqStyles.faqLabel} accessibilityRole="header">Before you proceed</Text>
        <Text style={styles.dosingSubtitle}>
          Please read and acknowledge the following information.
        </Text>

        {/* Read progress */}
        <Text style={[styles.consentProgress, { color: consentRead.size === CONSENT_SECTIONS.length ? '#00C376' : pippTheme.colors.text.subtle }]}>
          {consentRead.size} of {CONSENT_SECTIONS.length} sections reviewed
        </Text>

        <View style={styles.consentSections}>
          {CONSENT_SECTIONS.map((section, index) => (
            <AnimatedConsentSection
              key={index}
              section={section}
              index={index}
              isExpanded={expandedConsent === index}
              isRead={consentRead.has(index)}
              onToggle={() => toggleConsentSection(index)}
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
            />
          ))}
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          onPress={() => setConsentChecked(!consentChecked)}
          style={styles.checkboxRow}
          activeOpacity={0.7}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: consentChecked }}
          accessibilityLabel="I have read and agree to the above information"
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
        <PremiumCTAWrapper>
          <PIPPButton
            text="Confirm and continue"
            onPress={() => {}}
            disabled={!consentChecked}
          />
        </PremiumCTAWrapper>
        <Text style={styles.footerText}>
          By continuing, you confirm this information is accurate
        </Text>
        {/* What happens next */}
        <View style={styles.whatHappensNext}>
          <Text style={{ fontSize: 18, lineHeight: 22 }}>{'ℹ️'}</Text>
          <Text style={styles.whatHappensNextText}>
            Your order will be reviewed by our clinical team within 24 hours. We'll notify you once your treatment is approved and dispatched.
          </Text>
        </View>
      </View>
    </View>
  );

  // -------------------------------------------------------------------------
  // Main Render
  // -------------------------------------------------------------------------
  const renderStep = () => {
    switch (step) {
      case 0: return renderWelcome();
      case 1: return renderTreatment();
      case 2: return renderBundleSelection();
      case 3: return renderPlanGoal();
      case 4: return renderConsent();
      default: return renderWelcome();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={step === 0 ? styles.scrollContentFixed : step === 3 ? [styles.scrollContent, { paddingBottom: 80 }] : styles.scrollContent}
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
      {step === 3 && (
        <View style={styles.stickyFooter}>
          <PIPPButton
            text="Continue with plan"
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
// Styles — Concept 9
// Strict 4-size type scale, unified card system, box shadows, 12px radius
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  // Layout
  safeArea: {
    flex: 1,
    backgroundColor: pippTheme.colors.background.primary,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  } as any,
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
    paddingTop: 24,
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
    boxShadow: '0px 1px 0px rgba(0, 0, 0, 0.04)',
  } as any,
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  headerBackButton: {
    width: 48,
    height: 48,
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
    backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #F1F9FF 20%, #E3F3FF 50%, #DEF4F7 80%, #D0EEF2 100%)',
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
    paddingVertical: 48,
  },
  welcomeHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: C9.fontSize.display,
    fontWeight: pippTheme.fontWeight.bold.toString() as any,
    color: pippTheme.colors.text.primary,
    textAlign: 'center',
    lineHeight: C9.lineHeight.display,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  welcomeSubtext: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.body,
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: C9.lineHeight.body,
    maxWidth: 300,
    letterSpacing: 0.1,
  },
  trustStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
    paddingHorizontal: 20,
  } as any,
  trustStripText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 10,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.subtle,
    lineHeight: 14,
    letterSpacing: 1.2,
  } as any,
  trustStripDot: {
    fontSize: 14,
    color: pippTheme.colors.text.disabled,
    lineHeight: 14,
  },
  welcomeBottom: {
    alignSelf: 'stretch',
    paddingHorizontal: 20,
  },

  // -------------------------------------------------------------------------
  // Step 1: Treatment
  // -------------------------------------------------------------------------
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
    borderRadius: C9.card.radius,
    overflow: 'hidden',
    width: '100%',
  } as any,
  heroFrameImage: {
    position: 'absolute',
    bottom: -150,
    width: 120,
    height: 500,
  } as any,
  heroInfoBox: {
    padding: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    zIndex: 2,
    alignSelf: 'stretch',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
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
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: C9.lineHeight.caption,
  },
  heroFullName: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: C9.fontSize.body,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#000000',
    textAlign: 'left',
    lineHeight: C9.lineHeight.body,
  },
  heroDescription: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: '#000000',
    textAlign: 'left',
    lineHeight: C9.lineHeight.caption,
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
    borderRadius: C9.card.radius,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    overflow: 'hidden',
    marginTop: 20,
    boxShadow: C9.card.shadowSm,
    transition: C9.card.transition,
  } as any,
  altMedCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    borderRadius: C9.card.radius,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    overflow: 'hidden',
  } as any,
  altCardBanner: {
    flexDirection: 'row',
    padding: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: '#D8D9E0',
    backgroundImage: 'linear-gradient(90deg, #F9F9F9 0%, #FFF 100%)',
  } as any,
  altCardBannerIcon: {
    width: 16,
    height: 16,
    tintColor: pippTheme.colors.icon.subtle,
  },
  altCardBannerText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: C9.lineHeight.caption,
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
    gap: 4,
  } as any,
  altCardTitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.secondary,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: C9.lineHeight.secondary,
    color: pippTheme.colors.text.primary,
  },
  altCardPrice: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: C9.lineHeight.caption,
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
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: C9.lineHeight.caption,
    color: pippTheme.colors.text.subtle,
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
    minHeight: 48,
    justifyContent: 'center',
  } as any,
  exploreButtonText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.body,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#086A74',
    lineHeight: C9.lineHeight.body,
    textAlign: 'center',
  } as any,
  exploreCardsContainer: {
    gap: 12,
    alignSelf: 'stretch',
  } as any,
  otherTreatmentsFrame: {
    paddingHorizontal: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundImage: 'linear-gradient(0deg, #FFF 70.78%, #F1F8FC 100%)',
    marginTop: 0,
  } as any,
  otherTreatmentsHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
    alignSelf: 'stretch',
  } as any,
  otherTreatmentsIcon: {
    width: 16,
    height: 16,
    tintColor: pippTheme.colors.icon.default,
  },
  otherTreatmentsLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 10,
    fontWeight: '600' as any,
    lineHeight: 12,
    color: '#575D84',
    textAlign: 'center',
  } as any,
  faqCard: {
    marginTop: 32,
    marginHorizontal: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  } as any,
  faqCardQuestions: {
    alignSelf: 'stretch',
    gap: 8,
  } as any,
  faqCardHeading: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '600',
    color: pippTheme.colors.text.primary,
    lineHeight: 24,
  } as any,
  wegovyPillCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    borderRadius: C9.card.radius,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundImage: 'linear-gradient(89deg, #DCF2FF 0.62%, #FFF 32.75%)',
    overflow: 'hidden',
    boxShadow: C9.card.shadowSm,
  } as any,
  orfoglipronCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    borderRadius: C9.card.radius,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundImage: 'linear-gradient(89deg, #FBE3E3 0.62%, #FFF 32.75%)',
    overflow: 'hidden',
    boxShadow: C9.card.shadowSm,
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
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: C9.lineHeight.caption,
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
  } as any,

  // -------------------------------------------------------------------------
  // Supply cards — Checkmark circles instead of radio buttons
  // -------------------------------------------------------------------------
  supplyCardsContainerTight: {
    gap: 12,
    alignSelf: 'stretch',
  } as any,
  supplyCard: {
    position: 'relative',
    borderRadius: C9.card.radius,
    borderWidth: 2,
    borderColor: pippTheme.colors.border.default,
    padding: 15,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
    transition: C9.card.transition,
  } as any,
  supplyCardSelected: {
    borderColor: pippTheme.colors.border.primary,
    backgroundImage: C9.card.bgSelected,
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
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: C9.lineHeight.caption,
    color: pippTheme.colors.text.primary,
  } as any,
  supplyCardLabelTextSelected: {
    borderColor: pippTheme.colors.border.primary,
    backgroundColor: pippTheme.colors.border.primary,
    color: '#FFFFFF',
  },
  // Checkmark circle (replaces radio button)
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: pippTheme.colors.border.alt,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    borderColor: pippTheme.colors.icon.brand,
    backgroundColor: pippTheme.colors.icon.brand,
  },
  checkCircleTick: {
    color: '#FFFFFF',
    fontSize: C9.fontSize.secondary,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: C9.fontSize.secondary,
    marginTop: -1,
  },
  supplyCardCenter: {
    flex: 1,
  },
  supplyPlanText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: C9.lineHeight.caption,
    color: pippTheme.colors.text.secondary,
  },
  supplyPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as any,
  supplyPriceAmount: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: C9.fontSize.heading,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: C9.lineHeight.heading,
    color: pippTheme.colors.text.primary,
    letterSpacing: 0.2,
  },
  supplyPriceStrike: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.secondary,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: C9.lineHeight.secondary,
    color: pippTheme.colors.text.disabled,
    textDecorationLine: 'line-through',
  } as any,
  saveBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundImage: 'linear-gradient(291deg, #E2FBF0 0%, #A8F0D4 100%)',
  } as any,
  saveBadgeText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: C9.lineHeight.caption,
    color: pippTheme.colors.text.primary,
  },

  // Bundle cards (supply length selection)
  bundleCardsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    alignSelf: 'stretch',
  } as any,
  bundleCardWrapper: {
    alignSelf: 'stretch',
    alignItems: 'center',
  } as any,
  bundleCard: {
    alignSelf: 'stretch',
    padding: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E7ED',
    backgroundColor: '#FFFFFF',
  } as any,
  bundleCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  } as any,
  bundleCardPenWrap: {
    width: 47,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  } as any,
  bundleCardPricing: {
    flex: 1,
    gap: 0,
  } as any,
  bundleCardPlanName: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#07073D',
  } as any,
  bundleCardPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  } as any,
  bundleCardPrice: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: '#07073D',
  } as any,
  bundleCardOrigPrice: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#989EB5',
    textDecorationLine: 'line-through',
  } as any,
  bundleCardViewBtn: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 16,
    color: '#086A74',
  } as any,
  bundleCardBullets: {
    alignSelf: 'stretch',
  } as any,
  bundleCardBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    gap: 6,
  } as any,
  bundleCardBulletDot: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    lineHeight: 20,
    color: '#07073D',
  },
  bundleCardBulletText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 20,
    color: '#07073D',
    flex: 1,
  } as any,
  bundleCardBulletTextBold: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 20,
    color: '#07073D',
    flex: 1,
  } as any,
  bundleCardBulletSemiBold: {
    fontWeight: '600',
  } as any,
  bundleCardDivider: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: '#E6E7ED',
  } as any,
  bundleSavingsPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 60,
    backgroundColor: '#E9EEFA',
  } as any,
  bundleSavingsIcon: {
    width: 12,
    height: 12,
  } as any,
  bundleSavingsPillText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
    color: '#003D88',
  } as any,
  bundleBadgeText: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: '#086A74',
    overflow: 'hidden',
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: C9.lineHeight.caption,
    color: '#FFFFFF',
  } as any,
  bundleKlarnaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
    marginTop: 12,
  } as any,
  bundleKlarnaLine: {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 0,
    height: 0,
    borderTopWidth: 1,
    borderTopColor: '#E6E7ED',
  } as any,
  bundleKlarnaTag: {
    height: 16,
    width: undefined as any,
    aspectRatio: 646 / 115,
    borderRadius: 4,
  } as any,
  bundleDisclaimer: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: C9.lineHeight.caption,
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  } as any,

  // Reassurance card
  reassuranceCard: {
    flexDirection: 'row',
    padding: C9.card.padding,
    alignItems: 'flex-start',
    gap: 16,
    borderRadius: C9.card.radius,
    backgroundImage: 'linear-gradient(291deg, #FDFAF7 0%, #DEF4F7 100%)',
    alignSelf: 'stretch',
    boxShadow: C9.card.shadowSm,
    borderWidth: 1,
    borderColor: 'rgba(222, 244, 247, 0.6)',
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
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: 18,
  },
  reassuranceName: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.secondary,
    lineHeight: C9.lineHeight.caption,
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
    zIndex: 20,
  } as any,

  // -------------------------------------------------------------------------
  // Step 3 (new): Goal page — hero pens + plan cards
  // -------------------------------------------------------------------------
  goalHero: {
    height: 248,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    alignSelf: 'stretch',
    backgroundImage: 'linear-gradient(181deg, rgba(255, 255, 255, 0.00) 81.18%, rgba(0, 0, 0, 0.04) 99.52%)',
    overflow: 'hidden',
  } as any,
  goalHeroPens: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 220,
  } as any,
  goalHeroPensHorizontal: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  } as any,
  goalHeroPenImage: {
    height: 432,
    width: 'auto' as any,
    aspectRatio: 1 / 4,
    boxShadow: '2px -4px 16px 0 rgba(0, 0, 0, 0.08), -2px 0 16px 0 rgba(0, 0, 0, 0.08)',
  } as any,
  goalDetailsHeader: {
    padding: 16,
    paddingHorizontal: 0,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    alignSelf: 'stretch',
  } as any,
  goalDetailsTitle: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: '#07073D',
    textAlign: 'center',
  } as any,
  goalDetailsMedInfo: {
    flexDirection: 'column',
    alignItems: 'center',
  } as any,
  goalDetailsMedName: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
    color: '#2F345F',
    textAlign: 'center',
  } as any,
  goalDetailsMedDesc: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 12,
    color: '#575D84',
    textAlign: 'center',
  } as any,
  goalDeliveryNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
  } as any,
  goalDeliveryLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D8D9E0',
  } as any,
  goalDeliveryText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: '400',
    lineHeight: C9.lineHeight.caption,
    color: '#2F345F',
  } as any,
  goalCardsSection: {
    padding: 16,
    paddingHorizontal: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    alignSelf: 'stretch',
  } as any,
  goalCardNew: {
    alignSelf: 'stretch',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E6E7ED',
  } as any,
  goalCardNewSelected: {
    borderColor: pippTheme.colors.border.primary,
  } as any,
  goalCardTop: {
    padding: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
  } as any,
  goalCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
  } as any,
  goalCardTopLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  } as any,
  goalCardPlanName: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#2F345F',
  } as any,
  goalCardPlanPrice: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: '#07073D',
  } as any,
  goalCardPlanPerPen: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 12,
    color: '#07073D',
  } as any,
  goalCardBottom: {
    padding: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#F9F9F9',
    borderTopWidth: 0,
  } as any,
  goalCardDoseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  } as any,
  goalCardDoseMonth: {
    width: 64,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 20,
    color: '#07073D',
  } as any,
  goalCardDoseTag: {
    width: 60,
    paddingVertical: 2,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  } as any,
  goalCardDoseText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: '#FFFFFF',
  } as any,

  // -------------------------------------------------------------------------
  // Step 3 (old): Plan Goal — kept for potential reuse
  // -------------------------------------------------------------------------
  goalCard: {
    alignSelf: 'stretch',
    borderRadius: C9.card.radius,
    borderWidth: 2,
    borderColor: pippTheme.colors.border.default,
    backgroundColor: '#FFFFFF',
    padding: 15,
    gap: 12,
    position: 'relative',
    marginBottom: 16,
    transition: C9.card.transition,
  } as any,
  goalCardSelected: {
    borderColor: pippTheme.colors.border.primary,
    backgroundImage: C9.card.bgSelected,
  } as any,
  goalCardUnselected: {
    opacity: 0.88,
  },
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
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#FFFFFF',
    lineHeight: C9.lineHeight.caption,
  },
  goalBadgeInnerUnselected: {
    backgroundColor: pippTheme.colors.border.default,
  },
  goalBadgeTextUnselected: {
    color: pippTheme.colors.text.primary,
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
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.secondary,
    lineHeight: pippTheme.lineHeight[24],
  },
  goalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  } as any,
  goalPriceValue: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: C9.fontSize.heading,
    fontWeight: pippTheme.fontWeight.bold.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: C9.lineHeight.heading,
    letterSpacing: 0.2,
  },
  goalPriceUnit: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.secondary,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.subtle,
    lineHeight: C9.lineHeight.secondary,
  },
  goalTotalText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    lineHeight: C9.lineHeight.caption,
    marginTop: -8,
  },
  goalTimeline: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: pippTheme.colors.border.default,
    paddingTop: 12,
  } as any,
  goalTimelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'stretch',
  } as any,
  goalTimelinePeriod: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: '#000000',
    lineHeight: C9.lineHeight.caption,
    width: 68,
  },
  goalTimelineDoseTag: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  goalTimelineDoseText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#FFFFFF',
    lineHeight: C9.lineHeight.caption,
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
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#000000',
    lineHeight: C9.lineHeight.caption,
  },
  goalBestForRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  } as any,
  goalBestForBullet: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    color: '#000000',
    lineHeight: C9.lineHeight.caption,
  },
  goalBestForText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: '#000000',
    lineHeight: C9.lineHeight.caption,
    flex: 1,
  },

  // -------------------------------------------------------------------------
  // Step 4: Consent — Read tracking, green border
  // -------------------------------------------------------------------------
  dosingSubtitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.secondary,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    lineHeight: C9.lineHeight.secondary,
  },
  consentSections: {
    gap: 12,
  } as any,
  consentProgress: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: C9.lineHeight.caption,
    marginTop: -8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    minHeight: 48,
  } as any,
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: pippTheme.colors.border.alt,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: pippTheme.colors.icon.brand,
    backgroundColor: pippTheme.colors.icon.brand,
  },
  checkboxTick: {
    color: '#FFFFFF',
    fontSize: C9.fontSize.secondary,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: C9.fontSize.secondary,
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.secondary,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: C9.lineHeight.secondary,
  },
  footerText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.caption,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.subtle,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: C9.lineHeight.caption,
  } as any,
  whatHappensNext: {
    marginTop: 24,
    padding: C9.card.padding,
    borderRadius: C9.card.radius,
    backgroundColor: pippTheme.colors.surface.info,
    boxShadow: C9.card.shadowSm,
    borderLeftWidth: 3,
    borderLeftColor: pippTheme.colors.surface.brand,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  } as any,
  whatHappensNextText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: C9.fontSize.secondary,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.primary,
    lineHeight: C9.lineHeight.secondary,
    flex: 1,
  },
});

export default Concept9Screen;
