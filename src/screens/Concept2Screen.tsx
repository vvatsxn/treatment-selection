import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Linking, Image, TouchableOpacity } from 'react-native';
import { pippTheme } from '../theme/pipp';
import Header from '../components/Header';
import AnswerCard from '../components/AnswerCard';
import PIPPButton from '../components/PIPPButton';
import Banner from '../components/Banner';
import BottomSheetModal from '../components/BottomSheetModal';
import MeasurementSection from '../components/MeasurementSection';

const TOTAL_STEPS = 3;

const getInitialPage = (): { step: number; consent: boolean; treatmentSelected: boolean } => {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'supply') return { step: 1, consent: true, treatmentSelected: true };
  if (hash === 'treatment') return { step: 1, consent: true, treatmentSelected: false };
  if (hash.startsWith('step-')) {
    const num = parseInt(hash.replace('step-', ''), 10);
    if (num >= 1 && num <= TOTAL_STEPS) return { step: num, consent: true, treatmentSelected: true };
  }
  return { step: 1, consent: false, treatmentSelected: false };
};

const QuestionnaireScreen: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const medBrandRef = useRef<View>(null);
  const supplyRef = useRef<View>(null);
  const planGoalRef = useRef<View>(null);
  const initial = getInitialPage();
  const [currentStep, setCurrentStep] = useState<number>(initial.step);
  const [consentAccepted, setConsentAccepted] = useState<boolean>(initial.consent);
  const [treatmentSelected, setTreatmentSelected] = useState<boolean>(initial.treatmentSelected);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedMedType, setSelectedMedType] = useState<string | null>(null);
  const [selectedMedBrand, setSelectedMedBrand] = useState<string | null>(null);
  const [selectedSupply, setSelectedSupply] = useState<string | null>(null);
  const [selectedPlanGoal, setSelectedPlanGoal] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // Store answers for each step
  const [answers, setAnswers] = useState<Record<number, string | null>>({});

  // Sync URL hash with current page
  useEffect(() => {
    if (currentStep === 1 && !consentAccepted) {
      window.location.hash = '';
    } else if (currentStep === 1 && consentAccepted && !treatmentSelected) {
      window.location.hash = 'treatment';
    } else if (currentStep === 1 && consentAccepted && treatmentSelected) {
      window.location.hash = 'supply';
    } else {
      window.location.hash = `step-${currentStep}`;
    }
  }, [currentStep, consentAccepted, treatmentSelected]);

  // Scroll to top on page change
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    window.scrollTo(0, 0);
  }, [currentStep, consentAccepted, treatmentSelected]);

  const questions = [
    {
      step: 1,
      title: `Step 1 of ${TOTAL_STEPS}: Consultation`,
      question: 'Clinical consent',
      answers: ['Option A', 'Option B', 'Option C'],
    },
    {
      step: 2,
      title: `Step 2 of ${TOTAL_STEPS}: Consultation`,
      question: 'Placeholder question for step 2',
      answers: ['Option A', 'Option B', 'Option C'],
    },
    {
      step: 3,
      title: `Step 3 of ${TOTAL_STEPS}: Consultation`,
      question: 'Placeholder question for step 3',
      answers: ['Option A', 'Option B', 'Option C'],
    },
  ];

  const planGoalConfigs: Record<string, { unit: string; doseColors: Record<string, string>; plans: { id: string; label: string; price: string; total: string; doses: Record<number, string[]> }[] }> = {
    'mounjaro-kwikpen': {
      unit: '/ pen',
      doseColors: pippTheme.colors.doses.mounjaro,
      plans: [
        { id: 'maintenance', label: 'Maintenance plan', price: '£92.33', total: '£597 total', doses: { 1: ['5mg'], 2: ['5mg', '5mg'], 3: ['5mg', '5mg', '5mg'] } },
        { id: 'increasing', label: 'Increasing plan', price: '£92.33', total: '£597 total', doses: { 1: ['7.5mg'], 2: ['5mg', '7.5mg'], 3: ['5mg', '7.5mg', '10mg'] } },
        { id: 'decreasing', label: 'Decreasing plan', price: '£92.33', total: '£597 total', doses: { 1: ['2.5mg'], 2: ['5mg', '2.5mg'], 3: ['5mg', '2.5mg', '2.5mg'] } },
      ],
    },
    'wegovy-flextouch': {
      unit: '/ pen',
      doseColors: pippTheme.colors.doses.wegovy,
      plans: [
        { id: 'maintenance', label: 'Maintenance plan', price: '£92.33', total: '£597 total', doses: { 1: ['1mg'], 2: ['1mg', '1mg'], 3: ['1mg', '1mg', '1mg'] } },
        { id: 'increasing', label: 'Increasing plan', price: '£92.33', total: '£597 total', doses: { 1: ['1.7mg'], 2: ['1mg', '1.7mg'], 3: ['1mg', '1.7mg', '2.4mg'] } },
        { id: 'decreasing', label: 'Decreasing plan', price: '£92.33', total: '£597 total', doses: { 1: ['0.5mg'], 2: ['1mg', '0.5mg'], 3: ['1mg', '0.5mg', '0.25mg'] } },
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

  const activePlanConfig = selectedMedBrand ? planGoalConfigs[selectedMedBrand] : null;
  const supplyMonths = selectedSupply === '3-month' ? 3 : selectedSupply === '2-month' ? 2 : 1;

  const currentQuestion = questions[currentStep - 1];

  const scrollToRef = (ref: React.RefObject<View>) => {
    setTimeout(() => {
      const node = ref.current as any;
      if (node) {
        // Use web-native scrollIntoView for cross-device compatibility
        const element = node instanceof HTMLElement ? node : node._nativeTag || node;
        if (element?.scrollIntoView) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 150);
  };

  const handleSelectMedType = (type: string) => {
    setSelectedMedType(type);
    setSelectedMedBrand(null);
    setSelectedSupply(null);
    setSelectedPlanGoal(null);
    setTimeout(() => scrollToRef(medBrandRef), 50);
  };

  const handleSelectMedBrand = (brand: string) => {
    setSelectedMedBrand(brand);
    setSelectedSupply(null);
    setSelectedPlanGoal(null);
    setTimeout(() => scrollToRef(supplyRef), 50);
  };

  const handleSelectSupply = (supply: string) => {
    setSelectedSupply(supply);
    setSelectedPlanGoal(null);
    setTimeout(() => scrollToRef(planGoalRef), 50);
  };

  const handleContinue = () => {
    if (currentStep === 1 && !consentAccepted) {
      setConsentAccepted(true);
      return;
    }
  };

  const handleBack = () => {
    if (currentStep === 1 && consentAccepted) {
      setConsentAccepted(false);
      setSelectedMedType(null);
      setSelectedMedBrand(null);
      setSelectedSupply(null);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setSelectedAnswer(answers[currentStep - 1] ?? null);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setSelectedAnswer(null);
    setAnswers({});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header
          title={currentQuestion.title}
          onBackPress={currentStep > 1 || consentAccepted ? handleBack : undefined}
          showBackButton={true}
          progress={currentStep / TOTAL_STEPS}
        />

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={[styles.question, currentStep === 1 && consentAccepted && styles.questionBold]}>
            {currentStep === 1 && consentAccepted ? 'Choose my treatment' : currentQuestion.question}
          </Text>

          {currentStep === 1 && consentAccepted && (
            <>
            <Text style={styles.treatmentSubtitle}>Please select a treatment to continue. Our clinical team will review your request to make sure its the correct fit for you.</Text>

            <Text style={styles.medTypeHeading}>Medication type</Text>

            <View style={styles.medTypeCardsRow}>
              <TouchableOpacity style={[styles.medTypeCard, selectedMedType === 'injectable' && styles.medTypeCardSelected]} onPress={() => handleSelectMedType('injectable')} activeOpacity={0.7}>
                <View style={[styles.medTypeCardTop, selectedMedType === 'injectable' && styles.medTypeCardTopSelected]}>
                  <Image
                    source={require('../images/mounjaro-pen.png')}
                    style={styles.injectableMounjaroPen}
                  />
                  <Image
                    source={require('../images/wegovy-pen.png')}
                    style={styles.injectableWegovyPen}
                  />
                </View>
                <View style={[styles.medTypeCardBottom, selectedMedType === 'injectable' && styles.medTypeCardBottomSelected]}>
                  <Text style={[styles.medTypeCardTitle, selectedMedType === 'injectable' && styles.medTypeCardTitleSelected]}>Injectable</Text>
                  <Text style={styles.medTypeCardSubtitle}>Injected once per week</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.medTypeCard, selectedMedType === 'oral' && styles.medTypeCardSelected]} onPress={() => handleSelectMedType('oral')} activeOpacity={0.7}>
                <View style={[styles.medTypeCardTopOral, selectedMedType === 'oral' && styles.medTypeCardTopSelected]}>
                  <Image
                    source={require('../images/orfoglipron-tablet.png')}
                    style={styles.oralOrfoglipronTablet}
                  />
                  <Image
                    source={require('../images/wegovy-pill.png')}
                    style={styles.oralWegovyPill}
                  />
                </View>
                <View style={[styles.medTypeCardBottom, selectedMedType === 'oral' && styles.medTypeCardBottomSelected]}>
                  <Text style={[styles.medTypeCardTitle, selectedMedType === 'oral' && styles.medTypeCardTitleSelected]}>Oral</Text>
                  <Text style={styles.medTypeCardSubtitle}>Taken once per day</Text>
                </View>
              </TouchableOpacity>
            </View>
            {selectedMedType && (
              <>
              <View ref={medBrandRef} />
              <Text style={styles.medTypeHeading}>Medication brand</Text>

              <View style={styles.medTypeCardsRow}>
                {selectedMedType === 'injectable' ? (
                  <>
                  <TouchableOpacity style={[styles.medTypeCard, selectedMedBrand === 'wegovy-flextouch' && styles.medTypeCardSelected]} onPress={() => handleSelectMedBrand('wegovy-flextouch')} activeOpacity={0.7}>
                    <View style={[styles.brandWegovyTop, selectedMedBrand === 'wegovy-flextouch' && styles.medTypeCardTopSelected]}>
                      <Image
                        source={require('../images/wegovy-pen.png')}
                        style={styles.brandWegovyPen}
                      />
                    </View>
                    <View style={[styles.medTypeCardBottom, selectedMedBrand === 'wegovy-flextouch' && styles.medTypeCardBottomSelected]}>
                      <Text style={[styles.medTypeCardTitle, selectedMedBrand === 'wegovy-flextouch' && styles.medTypeCardTitleSelected]}>Wegovy FlexTouch</Text>
                      <Text style={styles.medTypeCardSubtitle}>Up to 20.1% of body weight</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.medTypeCard, selectedMedBrand === 'mounjaro-kwikpen' && styles.medTypeCardSelected]} onPress={() => handleSelectMedBrand('mounjaro-kwikpen')} activeOpacity={0.7}>
                    <View style={[styles.brandMounjaroTop, selectedMedBrand === 'mounjaro-kwikpen' && styles.medTypeCardTopSelected]}>
                      <Image
                        source={require('../images/mounjaro-pen.png')}
                        style={styles.brandMounjaroPen}
                      />
                    </View>
                    <View style={[styles.medTypeCardBottom, selectedMedBrand === 'mounjaro-kwikpen' && styles.medTypeCardBottomSelected]}>
                      <Text style={[styles.medTypeCardTitle, selectedMedBrand === 'mounjaro-kwikpen' && styles.medTypeCardTitleSelected]}>Mounjaro KwikPen</Text>
                      <Text style={styles.medTypeCardSubtitle}>Up to 22% of body weight</Text>
                    </View>
                  </TouchableOpacity>
                  </>
                ) : (
                  <>
                  <TouchableOpacity style={[styles.medTypeCard, selectedMedBrand === 'wegovy-pill' && styles.medTypeCardSelected]} onPress={() => handleSelectMedBrand('wegovy-pill')} activeOpacity={0.7}>
                    <View style={[styles.brandWegovyPillTop, selectedMedBrand === 'wegovy-pill' && styles.medTypeCardTopSelected]}>
                      <Image
                        source={require('../images/wegovy-pill.png')}
                        style={styles.brandWegovyPill}
                      />
                    </View>
                    <View style={[styles.medTypeCardBottom, selectedMedBrand === 'wegovy-pill' && styles.medTypeCardBottomSelected]}>
                      <Text style={[styles.medTypeCardTitle, selectedMedBrand === 'wegovy-pill' && styles.medTypeCardTitleSelected]}>Wegovy Pill</Text>
                      <Text style={styles.medTypeCardSubtitle}>Up to 15% of body weight</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.medTypeCard, selectedMedBrand === 'orfoglipron' && styles.medTypeCardSelected]} onPress={() => handleSelectMedBrand('orfoglipron')} activeOpacity={0.7}>
                    <View style={[styles.brandOrfoglipronTop, selectedMedBrand === 'orfoglipron' && styles.medTypeCardTopSelected]}>
                      <Image
                        source={require('../images/orfoglipron-tablet.png')}
                        style={styles.brandOrfoglipronTablet}
                      />
                    </View>
                    <View style={[styles.medTypeCardBottom, selectedMedBrand === 'orfoglipron' && styles.medTypeCardBottomSelected]}>
                      <Text style={[styles.medTypeCardTitle, selectedMedBrand === 'orfoglipron' && styles.medTypeCardTitleSelected]}>Orfoglipron</Text>
                      <Text style={styles.medTypeCardSubtitle}>Up to 14.7% of body weight</Text>
                    </View>
                  </TouchableOpacity>
                  </>
                )}
              </View>
              </>
            )}

            {selectedMedBrand && (
              <>
              <View ref={supplyRef} />
              <Text style={styles.medTypeHeading}>Supply length</Text>

              <View style={styles.supplyCardsContainer}>
                <TouchableOpacity style={[styles.supplyCard, selectedSupply === '3-month' && styles.supplyCardSelected]} onPress={() => handleSelectSupply('3-month')} activeOpacity={0.7}>
                  <View style={styles.supplyCardLabel}>
                    <Text style={[styles.supplyCardLabelText, selectedSupply === '3-month' && styles.supplyCardLabelTextSelected]}>Best value</Text>
                  </View>
                  <View style={styles.supplyCardCenter}>
                    <Text style={styles.supplyPlanText}>3 month plan</Text>
                    <View style={styles.supplyPriceRow}>
                      <Text style={styles.supplyPriceAmount}>£185.00</Text>
                      <Text style={styles.supplyPriceStrike}>£238</Text>
                    </View>
                  </View>
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>Save £53</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.supplyCard, selectedSupply === '2-month' && styles.supplyCardSelected]} onPress={() => handleSelectSupply('2-month')} activeOpacity={0.7}>
                  <View style={styles.supplyCardLabel}>
                    <Text style={[styles.supplyCardLabelText, selectedSupply === '2-month' && styles.supplyCardLabelTextSelected]}>Most popular</Text>
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
                  <View style={styles.supplyCardCenter}>
                    <Text style={styles.supplyPlanText}>1 month plan</Text>
                    <View style={styles.supplyPriceRow}>
                      <Text style={styles.supplyPriceAmount}>£185.00</Text>
                      <Text style={styles.supplyPriceStrike}>£238</Text>
                    </View>
                  </View>
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>Save £53</Text>
                  </View>
                </TouchableOpacity>
              </View>
              </>
            )}

            {selectedSupply && (
              <>
              <View ref={planGoalRef} />
              <Text style={styles.medTypeHeading}>Plan goal</Text>

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

              <View style={styles.buttonContainer}>
                <PIPPButton
                  title="Continue"
                  onPress={() => {}}
                  disabled={!selectedPlanGoal}
                />
              </View>
              </>
            )}
            </>
          )}
        </ScrollView>
      </View>

      <BottomSheetModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
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
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  question: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[32],
    color: pippTheme.colors.text.primary,
  },
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
  medTypeHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header4,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[28],
    color: pippTheme.colors.text.primary,
    marginTop: 20,
  },
  medTypeCardsRow: {
    flexDirection: 'row' as any,
    gap: 12,
    marginTop: 16,
    alignSelf: 'stretch' as any,
  },
  medTypeCard: {
    flex: 1,
  },
  medTypeCardSelected: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  medTypeCardTop: {
    height: 164,
    padding: 12,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundImage: 'linear-gradient(180deg, #FFE1F8 0%, rgba(255, 255, 255, 0.00) 100%)',
    overflow: 'hidden',
    position: 'relative',
  } as any,
  medTypeCardTopOral: {
    height: 164,
    padding: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundImage: 'linear-gradient(180deg, #EBFFEC 0.41%, rgba(255, 255, 255, 0.00) 99.58%), linear-gradient(180deg, #FFE1F8 0%, rgba(255, 255, 255, 0.00) 100%)',
    overflow: 'hidden',
    position: 'relative',
  } as any,
  medTypeCardTopSelected: {
    borderColor: pippTheme.colors.border.primary,
  },
  injectableMounjaroPen: {
    position: 'absolute' as any,
    width: 44,
    height: 278,
    transform: [{ rotate: '-90deg' }],
    left: 0,
    bottom: -20,
  },
  injectableWegovyPen: {
    position: 'absolute' as any,
    width: 42,
    height: 264,
    transform: [{ rotate: '90deg' }],
    left: 130,
    top: -10,
  },
  oralOrfoglipronTablet: {
    position: 'absolute' as any,
    width: 92,
    height: 64,
    left: 6.833,
    top: 14,
  },
  oralWegovyPill: {
    position: 'absolute' as any,
    width: 100.335,
    height: 83,
    right: 3.331,
    bottom: 14,
    transform: [{ scaleX: -1 }],
  },
  brandWegovyPen: {
    position: 'absolute' as any,
    width: 44,
    height: 278,
    alignSelf: 'center',
    bottom: -130,
  },
  brandMounjaroPen: {
    position: 'absolute' as any,
    width: 44,
    height: 278,
    alignSelf: 'center',
    transform: [{ rotate: '180deg' }],
    bottom: -130,
  },
  brandWegovyTop: {
    height: 164,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundImage: 'linear-gradient(180deg, #E1F4FF 0%, rgba(255, 255, 255, 0.00) 100%)',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  } as any,
  brandMounjaroTop: {
    height: 164,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundImage: 'linear-gradient(180deg, #F8EBFF 0.41%, rgba(255, 255, 255, 0.00) 99.58%)',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  } as any,
  brandWegovyPillTop: {
    height: 164,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundImage: 'linear-gradient(180deg, #DCF2FF 0%, rgba(255, 255, 255, 0.00) 100%)',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  } as any,
  brandOrfoglipronTop: {
    height: 164,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundImage: 'linear-gradient(180deg, #FFE8D6 0%, rgba(255, 255, 255, 0.00) 100%)',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  } as any,
  brandWegovyPill: {
    width: 92,
    height: 76,
  },
  brandOrfoglipronTablet: {
    width: 92,
    height: 64,
    transform: [{ rotate: '-35deg' }],
  },
  medTypeCardBottom: {
    padding: 8,
    flexDirection: 'column' as any,
    justifyContent: 'center' as any,
    alignItems: 'center',
    gap: 2,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundColor: '#FFFFFF',
  },
  medTypeCardBottomSelected: {
    borderColor: pippTheme.colors.border.primary,
  },
  medTypeCardTitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[20],
    color: pippTheme.colors.text.primary,
  },
  medTypeCardTitleSelected: {
    color: pippTheme.colors.text.action,
  },
  medTypeCardSubtitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.subtle,
    textAlign: 'center' as any,
  },
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
  supplyPriceStrike: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[22],
    color: pippTheme.colors.text.disabled,
    textDecorationLine: 'line-through' as any,
  },
  treatmentCard: {
    height: 324,
    padding: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 12,
    backgroundImage: 'linear-gradient(171deg, #DCF2FF 7.12%, #FFF 92.84%)',
    marginTop: 20,
    overflow: 'hidden',
  } as any,
  treatmentImage: {
    position: 'absolute' as any,
    bottom: -124,
    width: 103.16,
    height: 432,
  },
  treatmentInfoBox: {
    alignSelf: 'stretch' as any,
    flexDirection: 'row' as any,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    backdropFilter: 'blur(2px)',
  } as any,
  treatmentInfoItem: {
    flex: 1,
    paddingHorizontal: 20,
    flexDirection: 'column' as any,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  treatmentLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.primary,
    textAlign: 'center' as any,
  },
  treatmentValue: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[22],
    color: pippTheme.colors.text.primary,
    textAlign: 'center' as any,
  },
  treatmentInfoDivider: {
    width: 1,
    alignSelf: 'stretch' as any,
    backgroundColor: pippTheme.colors.border.default,
  },
  pricingSection: {
    marginTop: 20,
    flexDirection: 'column' as any,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch' as any,
  },
  pricingInner: {
    flexDirection: 'column' as any,
    alignItems: 'center',
    gap: 2,
  },
  priceStrikethrough: {
    color: pippTheme.colors.text.disabled,
    textDecorationLine: 'line-through' as any,
  },
  priceActive: {
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  priceLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[24],
    color: pippTheme.colors.text.primary,
    textAlign: 'center' as any,
  },
  pricingSubtext: {
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
  altCardsContainer: {
    marginTop: 20,
    gap: 20,
    alignSelf: 'stretch' as any,
  },
  mountjaroCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundImage: 'linear-gradient(89deg, #F8EBFF 0.62%, #FFF 32.75%)',
    overflow: 'hidden',
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
  altCardImageArea: {
    width: 80,
    paddingHorizontal: 18,
    flexDirection: 'column' as any,
    alignItems: 'center',
    justifyContent: 'center' as any,
    alignSelf: 'stretch' as any,
  },
  altCardImage: {
    width: 60,
    height: 80,
  },
  mountjaroPenImage: {
    position: 'absolute' as any,
    width: 44,
    height: 276,
    bottom: -80,
  },
  altCardContent: {
    flex: 1,
    flexDirection: 'row' as any,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    alignSelf: 'stretch' as any,
  },
  altCardLeft: {
    flex: 1,
  },
  altCardBadge: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    justifyContent: 'center' as any,
    alignItems: 'center',
    borderRadius: 4,
    alignSelf: 'flex-start' as any,
  },
  altCardBadgeText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.secondary,
    textAlign: 'center' as any,
  },
  altCardTitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[22],
    color: pippTheme.colors.text.primary,
    marginTop: 4,
  },
  altCardPrice: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[20],
    color: pippTheme.colors.text.primary,
  },
  altCardPriceStrike: {
    textDecorationLine: 'line-through' as any,
    color: pippTheme.colors.text.disabled,
  },
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
  bundleDisclaimer: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.subtle,
    textAlign: 'center' as any,
    marginTop: 8,
  },
  bannerContainer: {
    marginTop: 24,
  },
  answersContainer: {
    marginTop: 24,
    gap: 16,
  },
  measurementsContainer: {
    marginTop: 24,
  },
  measurementGap: {
    height: 24,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: pippTheme.colors.navy[100],
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
  resultsScreenContainer: {
    width: '100%',
    height: '100%',
    minHeight: '100vh' as any,
    backgroundColor: pippTheme.colors.background.primary,
    display: 'flex' as any,
    flexDirection: 'column',
  },
  resultsScrollView: {
    flex: 1,
  },
  resultsScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  resultsButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: pippTheme.colors.background.primary,
  },
  planGoalCard: {
    marginTop: 12,
    alignSelf: 'stretch' as any,
  },
  planGoalTop: {
    padding: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundColor: '#FFFFFF',
  },
  planGoalLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[22],
    color: pippTheme.colors.text.secondary,
    textAlign: 'center' as any,
  },
  planGoalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  planGoalPrice: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[32],
    color: pippTheme.colors.text.primary,
    textAlign: 'center' as any,
  },
  planGoalPriceUnit: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[22],
    color: pippTheme.colors.text.subtle,
    textAlign: 'center' as any,
  },
  planGoalTotal: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.secondary,
    textAlign: 'center' as any,
  },
  planGoalBottom: {
    flexDirection: 'row',
    padding: 8,
    paddingBottom: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundColor: '#F9F9F9',
  },
  planGoalMonth: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  planGoalMonthLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: pippTheme.colors.text.subtle,
  },
  planGoalDoseTag: {
    borderRadius: 4,
    backgroundColor: '#402A5B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  planGoalDoseTagText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 10,
    fontWeight: '500' as any,
    color: '#FFFFFF',
  },
  planGoalCardSelected: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planGoalTopSelected: {
    borderColor: pippTheme.colors.border.primary,
    backgroundImage: 'linear-gradient(180deg, #E1FFE5 0%, rgba(255, 255, 255, 0.00) 100%), linear-gradient(0deg, #FFF, #FFF)',
  } as any,
  planGoalBottomSelected: {
    borderColor: pippTheme.colors.border.primary,
  },
});

export default QuestionnaireScreen;
