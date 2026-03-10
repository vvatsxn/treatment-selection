import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Linking, Image, TouchableOpacity, Dimensions } from 'react-native';
import { pippTheme } from '../theme/pipp';
import Header from '../components/Header';
import PIPPButton from '../components/PIPPButton';
import BottomSheetModal from '../components/BottomSheetModal';
import PricingModal from '../components/PricingModal';

const TOTAL_STEPS = 3;

const medications = [
  {
    id: 'wegovy-flextouch',
    name: 'Wegovy FlexTouch',
    image: require('../images/wegovy-pen.png'),
    gradient: 'linear-gradient(171deg, #DCF2FF 7.12%, #FFF 92.84%)',
    originalPrice: '£119',
    discountedPrice: '£89',
    unit: 'per pen',
    imageStyle: { width: 84, height: 500, position: 'absolute' as any, bottom: -110 },
  },
  {
    id: 'mounjaro-kwikpen',
    name: 'Mounjaro KwikPen',
    image: require('../images/mounjaro-pen.png'),
    gradient: 'linear-gradient(171deg, #F8EBFF 7.12%, #FFF 92.84%)',
    originalPrice: '£119',
    discountedPrice: '£89',
    unit: 'per pen',
    imageStyle: { width: 70, height: 420, position: 'absolute' as any, bottom: -100, transform: [{ rotate: '180deg' }] },
  },
  {
    id: 'orfoglipron',
    name: 'Orfoglipron',
    image: require('../images/orfoglipron-tablet.png'),
    gradient: 'linear-gradient(171deg, #FFE8D6 7.12%, #FFF 92.84%)',
    originalPrice: '£99',
    discountedPrice: '£69',
    unit: 'per month',
    imageStyle: { width: 160, height: 110, transform: [{ rotate: '-15deg' }] },
  },
  {
    id: 'wegovy-pill',
    name: 'Wegovy Pill',
    image: require('../images/wegovy-pill.png'),
    gradient: 'linear-gradient(171deg, #DCF2FF 7.12%, #FFF 92.84%)',
    originalPrice: '£99',
    discountedPrice: '£69',
    unit: 'per month',
    imageStyle: { width: 160, height: 132 },
  },
];

// Build infinite loop array: [...meds, ...meds, ...meds]
const LOOP_COUNT = 3;
const loopedMedications = Array.from({ length: LOOP_COUNT }, () => medications).flat();
const REAL_COUNT = medications.length;
const MIDDLE_START = REAL_COUNT; // start index of the middle copy

const getInitialPage = (): { step: number; consent: boolean } => {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'treatment') return { step: 1, consent: true };
  if (hash === 'supply') return { step: 1, consent: true };
  if (hash === 'plan') return { step: 1, consent: true };
  if (hash.startsWith('step-')) {
    const num = parseInt(hash.replace('step-', ''), 10);
    if (num >= 1 && num <= TOTAL_STEPS) return { step: num, consent: true };
  }
  return { step: 1, consent: false };
};

const Concept3Screen: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const supplyRef = useRef<View>(null);
  const planGoalRef = useRef<View>(null);
  const initial = getInitialPage();
  const [currentStep, setCurrentStep] = useState<number>(initial.step);
  const [consentAccepted, setConsentAccepted] = useState<boolean>(initial.consent);
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);
  const [selectedSupply, setSelectedSupply] = useState<string | null>(null);
  const [selectedPlanGoal, setSelectedPlanGoal] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isPricingModalVisible, setIsPricingModalVisible] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Record<number, string | null>>({});

  const CARD_GAP = 12;
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width);
  const CARD_WIDTH = Math.round(containerWidth * 0.82);
  const SNAP_WIDTH = CARD_WIDTH + CARD_GAP;
  const SIDE_PADDING = Math.round((containerWidth - CARD_WIDTH) / 2);

  // Track if we've initialised the carousel position
  const carouselInitialised = useRef(false);
  const isScrolling = useRef(false);

  // Sync URL hash
  useEffect(() => {
    if (currentStep === 1 && !consentAccepted) {
      window.location.hash = '';
    } else if (currentStep === 1 && consentAccepted) {
      window.location.hash = 'treatment';
    } else {
      window.location.hash = `step-${currentStep}`;
    }
  }, [currentStep, consentAccepted]);

  // Scroll to top on consent change
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    window.scrollTo(0, 0);
  }, [currentStep, consentAccepted]);

  // Initialise carousel to middle copy on mount
  useEffect(() => {
    if (consentAccepted && carouselRef.current && !carouselInitialised.current) {
      const initialOffset = MIDDLE_START * SNAP_WIDTH;
      carouselRef.current.scrollLeft = initialOffset;
      carouselInitialised.current = true;
      // Auto-select first medication
      setSelectedMedication(medications[0].id);
    }
  }, [consentAccepted, SNAP_WIDTH]);

  const questions = [
    { step: 1, title: `Step 1 of ${TOTAL_STEPS}: Consultation`, question: 'Clinical consent' },
    { step: 2, title: `Step 2 of ${TOTAL_STEPS}: Consultation`, question: 'Placeholder question for step 2' },
    { step: 3, title: `Step 3 of ${TOTAL_STEPS}: Consultation`, question: 'Placeholder question for step 3' },
  ];

  const planGoalConfigs: Record<string, { unit: string; doseColors: Record<string, string>; plans: { id: string; label: string; price: string; total: string; doses: Record<number, string[]> }[] }> = {
    'wegovy-flextouch': {
      unit: '/ pen',
      doseColors: pippTheme.colors.doses.wegovy,
      plans: [
        { id: 'maintenance', label: 'Maintenance plan', price: '£92.33', total: '£597 total', doses: { 1: ['1mg'], 2: ['1mg', '1mg'], 3: ['1mg', '1mg', '1mg'] } },
        { id: 'increasing', label: 'Increasing plan', price: '£92.33', total: '£597 total', doses: { 1: ['1.7mg'], 2: ['1mg', '1.7mg'], 3: ['1mg', '1.7mg', '2.4mg'] } },
        { id: 'decreasing', label: 'Decreasing plan', price: '£92.33', total: '£597 total', doses: { 1: ['0.5mg'], 2: ['1mg', '0.5mg'], 3: ['1mg', '0.5mg', '0.25mg'] } },
      ],
    },
    'mounjaro-kwikpen': {
      unit: '/ pen',
      doseColors: pippTheme.colors.doses.mounjaro,
      plans: [
        { id: 'maintenance', label: 'Maintenance plan', price: '£92.33', total: '£597 total', doses: { 1: ['5mg'], 2: ['5mg', '5mg'], 3: ['5mg', '5mg', '5mg'] } },
        { id: 'increasing', label: 'Increasing plan', price: '£92.33', total: '£597 total', doses: { 1: ['7.5mg'], 2: ['5mg', '7.5mg'], 3: ['5mg', '7.5mg', '10mg'] } },
        { id: 'decreasing', label: 'Decreasing plan', price: '£92.33', total: '£597 total', doses: { 1: ['2.5mg'], 2: ['5mg', '2.5mg'], 3: ['5mg', '2.5mg', '2.5mg'] } },
      ],
    },
    'wegovy-pill': {
      unit: '/ month',
      doseColors: pippTheme.colors.doses.wegovyPill,
      plans: [
        { id: 'maintenance', label: 'Maintenance plan', price: '£92.33', total: '£597 total', doses: { 1: ['9mg'], 2: ['9mg', '9mg'], 3: ['9mg', '9mg', '9mg'] } },
        { id: 'increasing', label: 'Increasing plan', price: '£92.33', total: '£597 total', doses: { 1: ['25mg'], 2: ['9mg', '25mg'], 3: ['9mg', '25mg', '25mg'] } },
        { id: 'decreasing', label: 'Decreasing plan', price: '£92.33', total: '£597 total', doses: { 1: ['4mg'], 2: ['9mg', '4mg'], 3: ['9mg', '4mg', '1.5mg'] } },
      ],
    },
    'orfoglipron': {
      unit: '/ month',
      doseColors: pippTheme.colors.doses.orfoglipron,
      plans: [
        { id: 'maintenance', label: 'Maintenance plan', price: '£92.33', total: '£597 total', doses: { 1: ['12mg'], 2: ['12mg', '12mg'], 3: ['12mg', '12mg', '12mg'] } },
        { id: 'increasing', label: 'Increasing plan', price: '£92.33', total: '£597 total', doses: { 1: ['24mg'], 2: ['12mg', '24mg'], 3: ['12mg', '24mg', '36mg'] } },
        { id: 'decreasing', label: 'Decreasing plan', price: '£92.33', total: '£597 total', doses: { 1: ['6mg'], 2: ['12mg', '6mg'], 3: ['12mg', '6mg', '3mg'] } },
      ],
    },
  };

  const activePlanConfig = selectedMedication ? planGoalConfigs[selectedMedication] : null;
  const supplyMonths = selectedSupply === '3-month' ? 3 : selectedSupply === '2-month' ? 2 : 1;

  const currentQuestion = questions[currentStep - 1];

  const scrollToRef = (ref: React.RefObject<View>) => {
    setTimeout(() => {
      const node = ref.current as any;
      if (node) {
        const element = node instanceof HTMLElement ? node : node._nativeTag || node;
        if (element?.scrollIntoView) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 150);
  };

  const handleSelectSupply = (supply: string) => {
    if (supply === selectedSupply) return;
    setSelectedSupply(supply);
    setSelectedPlanGoal(null);
    setTimeout(() => scrollToRef(planGoalRef), 50);
  };

  const handleBack = () => {
    if (currentStep === 1 && consentAccepted) {
      setConsentAccepted(false);
      setSelectedMedication(null);
      setSelectedSupply(null);
      setSelectedPlanGoal(null);
      carouselInitialised.current = false;
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContainerLayout = (event: any) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  // Carousel scroll handler using native DOM for infinite loop
  const handleCarouselScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el || isScrolling.current) return;

    const scrollLeft = el.scrollLeft;
    const rawIndex = Math.round(scrollLeft / SNAP_WIDTH);
    const realIndex = ((rawIndex % REAL_COUNT) + REAL_COUNT) % REAL_COUNT;

    // Auto-select the centered medication
    const medId = medications[realIndex].id;
    if (medId !== selectedMedication) {
      setSelectedMedication(medId);
      setSelectedSupply(null);
      setSelectedPlanGoal(null);
    }

    // Infinite loop: silently jump to middle copy when reaching edges
    const minBound = REAL_COUNT * SNAP_WIDTH * 0.3;
    const maxBound = REAL_COUNT * SNAP_WIDTH * 2.3;
    if (scrollLeft < minBound || scrollLeft > maxBound) {
      isScrolling.current = true;
      const middleOffset = (MIDDLE_START + realIndex) * SNAP_WIDTH;
      el.scrollLeft = middleOffset;
      isScrolling.current = false;
    }
  }, [SNAP_WIDTH, selectedMedication]);

  // Attach native scroll listener for the carousel
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    let scrollTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        handleCarouselScroll();
      }, 80);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimer);
    };
  }, [handleCarouselScroll, consentAccepted]);

  // Derive the active carousel index for dots
  const getActiveIndex = () => {
    if (!selectedMedication) return 0;
    return medications.findIndex(m => m.id === selectedMedication);
  };
  const activeCarouselIndex = getActiveIndex();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container} onLayout={handleContainerLayout}>
        <Header
          title={currentQuestion.title}
          onBackPress={currentStep > 1 || consentAccepted ? handleBack : undefined}
          showBackButton={true}
          progress={currentStep / TOTAL_STEPS}
        />

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentNoPadding}
        >
          {/* Consent page */}
          {currentStep === 1 && !consentAccepted && (
            <View style={styles.paddedContent}>
              <Text style={styles.question}>Clinical consent</Text>
              <View style={styles.consentContainer}>
                <Text style={styles.consentIntro}>I understand and agree to the following:</Text>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletPoint}>{'\u2022'}</Text>
                  <Text style={styles.consentBody}>I consent for Phlo to contact my GP to verify the information provided and to <Text style={styles.semiBold}>inform them of any treatment received.</Text></Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletPoint}>{'\u2022'}</Text>
                  <Text style={styles.consentBody}>I am aged between 18-85.</Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletPoint}>{'\u2022'}</Text>
                  <Text style={styles.consentBody}>I consent to Phlo accessing my <Text style={styles.linkText} onPress={() => Linking.openURL('https://digital.nhs.uk/services/summary-care-records-scr/summary-care-records-scr-information-for-patients')}>Summary Care Record</Text> to verify my medical history and medication eligibility. If I don't have a Summary Care Record I will be required to contact my GP and provide a copy of my medical record.</Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletPoint}>{'\u2022'}</Text>
                  <Text style={styles.consentBody}>I confirm I will read the patient information leaflet provided with the medicine which includes more information including side effects. I understand increasing the dose of my medicine may result in side effects like vomiting, diarrhoea or constipation. Rarely, hospital treatment is needed for side effects. I agree to report all side effects to Phlo Clinical Team.</Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletPoint}>{'\u2022'}</Text>
                  <Text style={styles.consentBody}>I understand that there is a risk of allergic reaction or side effects with weight loss medication and that I should seek medical attention and discontinue the treatment if I experience severe symptoms.</Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletPoint}>{'\u2022'}</Text>
                  <Text style={styles.consentBody}>I understand I will stop using the treatment if I experience <Text style={styles.semiBold}>prolonged stomach pain or a sustained increase in heart rate.</Text></Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletPoint}>{'\u2022'}</Text>
                  <Text style={styles.consentBody}>I confirm I will follow all storage instructions that come with the medicine.</Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletPoint}>{'\u2022'}</Text>
                  <Text style={styles.consentBody}>I confirm not to combine doses (taking an extra strength or mixing different strengths to reach a higher weekly dose) and will only use the pen prescribed by Phlo. Combining doses can cause dangerous dosing errors which can increase risk of side effects and is not licensed or recommended.</Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletPoint}>{'\u2022'}</Text>
                  <Text style={styles.consentBody}>I understand that if I am switching between weight loss injectable medications, I must stop my old medication and wait <Text style={styles.semiBold}>at least 10 days</Text> before starting the new medication. This 'washout' period is required to reduce the risk of side effects or interactions between treatments.</Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletPoint}>{'\u2022'}</Text>
                  <Text style={styles.consentBody}>I confirm I understand my order is subject to clinical approval by the Phlo Clinical Team, and I have provided honest and accurate information throughout.</Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletPoint}>{'\u2022'}</Text>
                  <Text style={styles.consentBody}>If I am transferring to Phlo, I confirm I previously met criteria for initiation of treatment and I wish to continue weight loss treatment / maintenance treatment.</Text>
                </View>

                <View style={styles.consentDivider} />

                <Text style={styles.consentFooter}>
                  By selecting '<Text style={styles.consentFooterBold}>Agree and continue</Text>' you acknowledge that you have read, understood and agree to all of the above.
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                <PIPPButton
                  title="Agree and continue"
                  onPress={() => setConsentAccepted(true)}
                  iconRight={require('../theme/icons/arrow-forward.svg')}
                />
              </View>
            </View>
          )}

          {/* Treatment selection — single page progressive reveal */}
          {currentStep === 1 && consentAccepted && (
            <>
              <View style={styles.paddedContent}>
                <Text style={[styles.question, styles.questionBold]}>Choose my treatment</Text>
                <Text style={styles.treatmentSubtitle}>Please select a treatment to continue. Our clinical team will review your request to make sure its the correct fit for you.</Text>
              </View>

              {/* Infinite carousel - native DOM scroll container */}
              <div
                ref={carouselRef}
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  paddingLeft: SIDE_PADDING,
                  paddingRight: SIDE_PADDING,
                  paddingTop: 20,
                  paddingBottom: 32,
                  gap: CARD_GAP,
                }}
                className="hide-scrollbar"
              >
                {loopedMedications.map((med, index) => {
                  const isActive = selectedMedication === med.id;
                  return (
                    <div
                      key={index}
                      style={{
                        flex: '0 0 auto',
                        width: CARD_WIDTH,
                        scrollSnapAlign: 'center',
                        borderRadius: 16,
                        boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.15)' : 'none',
                        transform: isActive ? 'translateY(-4px)' : 'none',
                        transition: 'box-shadow 0.2s, transform 0.2s',
                      }}
                    >
                      <TouchableOpacity activeOpacity={0.9} style={{ flex: 1 }}>
                        <View style={[styles.carouselCardTop, { backgroundImage: med.gradient } as any]}>
                          <Image
                            source={med.image}
                            style={med.imageStyle}
                            resizeMode="contain"
                          />
                        </View>
                        <View style={styles.carouselCardBottom}>
                          <Text style={styles.carouselCardName}>{med.name}</Text>
                          <View style={styles.carouselPricingInner}>
                            <Text style={styles.carouselPriceLabel}>From <Text style={styles.carouselPriceStrike}>{med.originalPrice}</Text> <Text style={styles.carouselPriceActive}>{med.discountedPrice}</Text> {med.unit}</Text>
                            <Text style={styles.carouselPricingSubtext}>As part of a 3-month plan</Text>
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
                      </TouchableOpacity>
                    </div>
                  );
                })}
              </div>

              {/* Hide scrollbar CSS */}
              <style dangerouslySetInnerHTML={{ __html: '.hide-scrollbar::-webkit-scrollbar { display: none; }' }} />

              {/* Carousel dots */}
              <View style={styles.carouselDots}>
                {medications.map((_, index) => (
                  <View
                    key={index}
                    style={[styles.carouselDot, index === activeCarouselIndex && styles.carouselDotActive]}
                  />
                ))}
              </View>

              {/* Plan length — appears when medication selected */}
              {selectedMedication && (
                <View style={styles.paddedContent}>
                  <View ref={supplyRef} />
                  <Text style={styles.sectionHeading}>Plan length</Text>

                  <View style={styles.supplyCardsContainer}>
                    <TouchableOpacity style={[styles.supplyCard, selectedSupply === '3-month' && styles.supplyCardSelected]} onPress={() => handleSelectSupply('3-month')} activeOpacity={0.7}>
                      <View style={styles.supplyCardLabel}>
                        <Text style={[styles.supplyCardLabelText, selectedSupply === '3-month' && styles.supplyCardLabelTextSelected]}>Best value</Text>
                      </View>
                      <View style={[styles.radioOuter, selectedSupply === '3-month' && styles.radioOuterSelected]}>
                        {selectedSupply === '3-month' && <View style={styles.radioInner} />}
                      </View>
                      <View style={styles.supplyCardCenter}>
                        <Text style={styles.supplyPlanText}>3 month plan</Text>
                        <View style={styles.supplyPriceRow}>
                          <Text style={styles.supplyPriceAmount}>£277.00</Text>
                          <Text style={styles.supplyPriceStrike}>£357</Text>
                        </View>
                      </View>
                      <View style={styles.badgeColumn}>
                        <View style={styles.saveBadge}>
                          <Text style={styles.saveBadgeText}>Save £80</Text>
                        </View>
                        <Image
                          source={require('../images/klarna-tag.jpg')}
                          style={styles.klarnaTag}
                          resizeMode="contain"
                        />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.supplyCard, selectedSupply === '2-month' && styles.supplyCardSelected]} onPress={() => handleSelectSupply('2-month')} activeOpacity={0.7}>
                      <View style={styles.supplyCardLabel}>
                        <Text style={[styles.supplyCardLabelText, selectedSupply === '2-month' && styles.supplyCardLabelTextSelected]}>Most popular</Text>
                      </View>
                      <View style={[styles.radioOuter, selectedSupply === '2-month' && styles.radioOuterSelected]}>
                        {selectedSupply === '2-month' && <View style={styles.radioInner} />}
                      </View>
                      <View style={styles.supplyCardCenter}>
                        <Text style={styles.supplyPlanText}>2 month plan</Text>
                        <View style={styles.supplyPriceRow}>
                          <Text style={styles.supplyPriceAmount}>£185.00</Text>
                          <Text style={styles.supplyPriceStrike}>£238</Text>
                        </View>
                      </View>
                      <View style={styles.saveBadge}>
                        <Text style={styles.saveBadgeText}>Save £53</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.supplyCard, selectedSupply === '1-month' && styles.supplyCardSelected]} onPress={() => handleSelectSupply('1-month')} activeOpacity={0.7}>
                      <View style={[styles.radioOuter, selectedSupply === '1-month' && styles.radioOuterSelected]}>
                        {selectedSupply === '1-month' && <View style={styles.radioInner} />}
                      </View>
                      <View style={styles.supplyCardCenter}>
                        <Text style={styles.supplyPlanText}>1 month plan</Text>
                        <View style={styles.supplyPriceRow}>
                          <Text style={styles.supplyPriceAmount}>£89.00</Text>
                          <Text style={styles.supplyPriceStrike}>£119</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Plan goal — appears when supply selected */}
              {selectedSupply && (
                <View style={styles.paddedContent}>
                  <View ref={planGoalRef} />
                  <Text style={styles.sectionHeading}>Plan goal</Text>

                  {activePlanConfig?.plans.map((plan) => (
                    <TouchableOpacity key={plan.id} style={[styles.planGoalCard, selectedPlanGoal === plan.id && styles.planGoalCardSelected]} onPress={() => setSelectedPlanGoal(plan.id)} activeOpacity={0.7}>
                      <View style={[styles.planGoalTop, selectedPlanGoal === plan.id && styles.planGoalTopSelected]}>
                        <Text style={styles.planGoalLabel}>{plan.label}</Text>
                        <View style={styles.planGoalPriceRow}>
                          <Text style={styles.planGoalPrice}>{plan.price}</Text>
                          <Text style={styles.planGoalPriceUnit}>{activePlanConfig.unit}</Text>
                        </View>
                        <Text style={styles.planGoalTotal}>{plan.total}</Text>
                      </View>
                      <View style={[styles.planGoalBottom, selectedPlanGoal === plan.id && styles.planGoalBottomSelected]}>
                        {(plan.doses[supplyMonths] || []).map((dose: string, i: number) => (
                          <View key={i} style={styles.planGoalMonth}>
                            <Text style={styles.planGoalMonthLabel}>Month {i + 1}</Text>
                            <View style={[styles.planGoalDoseTag, { backgroundColor: activePlanConfig.doseColors[dose] || '#402A5B' }]}>
                              <Text style={styles.planGoalDoseTagText}>{dose}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity onPress={() => setIsPricingModalVisible(true)} activeOpacity={0.7} style={styles.pricingLinkContainer}>
                    <Text style={styles.pricingLinkText}>See how dosing and pricing work</Text>
                  </TouchableOpacity>

                  <View style={styles.buttonContainer}>
                    <PIPPButton
                      title="Continue"
                      onPress={() => {}}
                      disabled={!selectedPlanGoal}
                    />
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>

      <BottomSheetModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
      <PricingModal
        visible={isPricingModalVisible}
        onClose={() => setIsPricingModalVisible(false)}
        brand={selectedMedication}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: pippTheme.colors.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: pippTheme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentNoPadding: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  paddedContent: {
    paddingHorizontal: 20,
  },
  question: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[32],
    color: pippTheme.colors.text.primary,
    marginTop: 20,
  },
  questionBold: {
    fontWeight: pippTheme.fontWeight.bold.toString() as any,
  },
  treatmentSubtitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[22],
    color: pippTheme.colors.text.secondary,
    marginTop: 12,
  },
  sectionHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header4,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[28],
    color: pippTheme.colors.text.primary,
    marginTop: 24,
  },

  // Consent styles
  consentContainer: {
    marginTop: 12,
    paddingLeft: 8,
  },
  consentIntro: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[24],
    color: pippTheme.colors.text.primary,
    marginBottom: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    lineHeight: pippTheme.lineHeight[24],
    color: pippTheme.colors.text.primary,
    marginRight: 8,
  },
  consentBody: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[24],
    color: pippTheme.colors.text.primary,
  },
  semiBold: {
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
  },
  linkText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[24],
    color: pippTheme.colors.text.action,
    textDecorationLine: 'underline',
  },
  consentDivider: {
    height: 1,
    width: '100%',
    backgroundColor: pippTheme.colors.border.default,
    marginTop: 16,
    marginBottom: 16,
  },
  consentFooter: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[22],
    color: pippTheme.colors.text.primary,
    textAlign: 'center',
    width: 320,
    alignSelf: 'center',
  },
  consentFooterBold: {
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
  },
  buttonContainer: {
    marginTop: 24,
  },

  // Carousel card styles
  carouselCardTop: {
    height: 380,
    padding: 20,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: pippTheme.colors.border.default,
    overflow: 'hidden' as any,
    position: 'relative' as any,
  },
  carouselCardBottom: {
    padding: 12,
    paddingVertical: 12,
    flexDirection: 'column' as any,
    justifyContent: 'center' as any,
    alignItems: 'center',
    gap: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundColor: '#FFFFFF',
  },
  carouselCardName: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header4,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[28],
    color: pippTheme.colors.text.primary,
    textAlign: 'center' as any,
  },
  carouselPricingInner: {
    flexDirection: 'column' as any,
    alignItems: 'center',
    gap: 2,
  },
  carouselPriceLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[24],
    color: pippTheme.colors.text.primary,
    textAlign: 'center' as any,
  },
  carouselPriceStrike: {
    color: pippTheme.colors.text.disabled,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[24],
    textDecorationLine: 'line-through' as any,
  },
  carouselPriceActive: {
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  carouselPricingSubtext: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[20],
    color: pippTheme.colors.text.primary,
    textAlign: 'center' as any,
  },
  klarnaRow: {
    flexDirection: 'row' as any,
    alignItems: 'center',
    gap: 4,
  },
  klarnaText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.subtle,
    textAlign: 'center' as any,
  },
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

  // Carousel dots
  carouselDots: {
    flexDirection: 'row' as any,
    justifyContent: 'center' as any,
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: pippTheme.colors.border.default,
  },
  carouselDotActive: {
    backgroundColor: pippTheme.colors.border.primary,
    width: 24,
  },

  // Supply card styles
  supplyCardsContainer: {
    marginTop: 12,
    gap: 16,
    alignSelf: 'stretch' as any,
  },
  supplyCard: {
    position: 'relative' as any,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    padding: 16,
    paddingHorizontal: 12,
    flexDirection: 'row' as any,
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch' as any,
  },
  supplyCardSelected: {
    borderColor: pippTheme.colors.border.primary,
    borderWidth: 2,
    padding: 15,
    paddingHorizontal: 11,
    backgroundImage: 'linear-gradient(291deg, #FDFAF7 0%, #DEF4F7 100%)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  } as any,
  supplyCardLabel: {
    position: 'absolute' as any,
    top: -10,
    alignSelf: 'center' as any,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  supplyCardLabelText: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundColor: pippTheme.colors.border.default,
    overflow: 'hidden' as any,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.primary,
  },
  supplyCardLabelTextSelected: {
    borderColor: pippTheme.colors.border.primary,
    backgroundColor: pippTheme.colors.border.primary,
    color: '#FFFFFF',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: pippTheme.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center' as any,
  },
  radioOuterSelected: {
    borderColor: pippTheme.colors.border.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: pippTheme.colors.border.primary,
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
    flexDirection: 'row' as any,
    alignItems: 'center',
    gap: 4,
  },
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
    textDecorationLine: 'line-through' as any,
  },
  saveBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
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
  badgeColumn: {
    flexDirection: 'column' as any,
    alignItems: 'flex-end',
    gap: 4,
  },
  klarnaTag: {
    height: 16,
    width: undefined as any,
    aspectRatio: 646 / 115,
    borderRadius: 4,
  },

  // Plan goal card styles
  planGoalCard: {
    marginTop: 12,
    alignSelf: 'stretch' as any,
    borderRadius: 8,
    overflow: 'hidden' as any,
  },
  planGoalCardSelected: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planGoalTop: {
    padding: 16,
    flexDirection: 'column' as any,
    alignItems: 'flex-start' as any,
    gap: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundColor: '#FFFFFF',
  },
  planGoalTopSelected: {
    borderColor: pippTheme.colors.border.primary,
    borderWidth: 2,
    padding: 15,
    backgroundImage: 'linear-gradient(291deg, #FDFAF7 0%, #DEF4F7 100%)',
  } as any,
  planGoalLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[22],
    color: pippTheme.colors.text.secondary,
  },
  planGoalPriceRow: {
    flexDirection: 'row' as any,
    alignItems: 'baseline' as any,
    gap: 4,
  },
  planGoalPrice: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[32],
    color: pippTheme.colors.text.primary,
  },
  planGoalPriceUnit: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[22],
    color: pippTheme.colors.text.subtle,
  },
  planGoalTotal: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.secondary,
  },
  planGoalBottom: {
    flexDirection: 'row' as any,
    padding: 8,
    paddingBottom: 12,
    paddingHorizontal: 12,
    alignItems: 'center' as any,
    gap: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundColor: '#F9F9F9',
  },
  planGoalBottomSelected: {
    borderColor: pippTheme.colors.border.primary,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    padding: 7,
    paddingBottom: 11,
    paddingHorizontal: 11,
  },
  planGoalMonth: {
    flex: 1,
    flexDirection: 'column' as any,
    alignItems: 'center',
    gap: 6,
  },
  planGoalMonthLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.subtle,
    textAlign: 'center' as any,
  },
  planGoalDoseTag: {
    borderRadius: 4,
    backgroundColor: '#402A5B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'stretch' as any,
    alignItems: 'center' as any,
  },
  planGoalDoseTagText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 10,
    fontWeight: '500' as any,
    color: '#FFFFFF',
  },
  pricingLinkContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  pricingLinkText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[22],
    color: pippTheme.colors.text.link,
    textDecorationLine: 'underline' as any,
  },
});

export default Concept3Screen;
