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
  const initial = getInitialPage();
  const [currentStep, setCurrentStep] = useState<number>(initial.step);
  const [consentAccepted, setConsentAccepted] = useState<boolean>(initial.consent);
  const [treatmentSelected, setTreatmentSelected] = useState<boolean>(initial.treatmentSelected);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null);
  const [selectedSupply, setSelectedSupply] = useState<string | null>('3-month');
  const [supplySelected, setSupplySelected] = useState<boolean>(false);
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
    } else if (currentStep === 1 && consentAccepted && treatmentSelected && !supplySelected) {
      window.location.hash = 'supply';
    } else if (currentStep === 1 && consentAccepted && treatmentSelected && supplySelected) {
      window.location.hash = 'plan';
    } else {
      window.location.hash = `step-${currentStep}`;
    }
  }, [currentStep, consentAccepted, treatmentSelected, supplySelected]);

  // Scroll to top on page change
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    window.scrollTo(0, 0);
  }, [currentStep, consentAccepted, treatmentSelected, supplySelected]);

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

  const activePlanConfig = selectedTreatment ? planGoalConfigs[selectedTreatment] : null;
  const supplyMonths = selectedSupply === '3-month' ? 3 : selectedSupply === '2-month' ? 2 : 1;

  const currentQuestion = questions[currentStep - 1];

  const handleContinue = () => {
    // Handle consent acceptance on step 1
    if (currentStep === 1 && !consentAccepted) {
      setConsentAccepted(true);
      return;
    }

    // Handle treatment selection — go to supply length page
    if (currentStep === 1 && consentAccepted && !treatmentSelected) {
      setSelectedTreatment('wegovy-flextouch');
      setTreatmentSelected(true);
      return;
    }

    // Handle supply selection — go to choose plan page
    if (currentStep === 1 && consentAccepted && treatmentSelected && !supplySelected) {
      setSupplySelected(true);
      return;
    }

    // Store the answer for the current step
    setAnswers((prev) => ({ ...prev, [currentStep]: selectedAnswer }));

    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
    } else {
      // Final step — handle completion
      console.log('Questionnaire completed with answers:', { ...answers, [currentStep]: selectedAnswer });
    }
  };

  const handleBack = () => {
    if (currentStep === 1 && consentAccepted && treatmentSelected && supplySelected) {
      setSupplySelected(false);
      setSelectedPlanGoal(null);
      return;
    }
    if (currentStep === 1 && consentAccepted && treatmentSelected) {
      setTreatmentSelected(false);
      setSelectedTreatment(null);
      setSelectedSupply('3-month');
      setSupplySelected(false);
      setSelectedPlanGoal(null);
      setSelectedAnswer(null);
      return;
    }
    if (currentStep === 1 && consentAccepted) {
      setConsentAccepted(false);
      setSelectedAnswer(null);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Restore the previous answer
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
            {currentStep === 1 && consentAccepted && treatmentSelected && supplySelected ? 'Choose plan' : currentStep === 1 && consentAccepted && treatmentSelected ? 'Choose supply length' : currentStep === 1 && consentAccepted ? 'Choose my treatment' : currentQuestion.question}
          </Text>

          {currentStep === 1 && consentAccepted && treatmentSelected && !supplySelected && (
            <>
            <Text style={styles.treatmentSubtitle}>Please select a treatment to continue. Our clinical team will review your request to make sure its the correct fit for you.</Text>

            <View style={styles.supplyCardsContainer}>
              <TouchableOpacity style={[styles.supplyCard, selectedSupply === '3-month' && styles.supplyCardSelected]} onPress={() => setSelectedSupply('3-month')} activeOpacity={0.7}>
                <View style={styles.supplyCardLabel}>
                  <Text style={[styles.supplyCardLabelText, selectedSupply === '3-month' && styles.supplyCardLabelTextSelected]}>Best value</Text>
                </View>
                <View style={[styles.radioOuter, selectedSupply === '3-month' && styles.radioOuterSelected]}>
                  {selectedSupply === '3-month' && <View style={styles.radioInner} />}
                </View>
                <View style={styles.supplyCardCenter}>
                  <Text style={styles.supplyPlanText}>3 month plan</Text>
                  <View style={styles.supplyPriceRow}>
                    <Text style={styles.supplyPriceAmount}>£185.00</Text>
                    <Text style={styles.supplyPriceStrike}>£238</Text>
                  </View>
                </View>
                <View style={styles.badgeColumn}>
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>Save £53</Text>
                  </View>
                  <Image
                    source={require('../images/klarna-tag.jpg')}
                    style={styles.klarnaTag}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.supplyCard, selectedSupply === '2-month' && styles.supplyCardSelected]} onPress={() => setSelectedSupply('2-month')} activeOpacity={0.7}>
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

              <TouchableOpacity style={[styles.supplyCard, selectedSupply === '1-month' && styles.supplyCardSelected]} onPress={() => setSelectedSupply('1-month')} activeOpacity={0.7}>
                <View style={[styles.radioOuter, selectedSupply === '1-month' && styles.radioOuterSelected]}>
                  {selectedSupply === '1-month' && <View style={styles.radioInner} />}
                </View>
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

          {currentStep === 1 && consentAccepted && treatmentSelected && supplySelected && (
            <>
            <Text style={styles.treatmentSubtitle}>Select a dosing plan. Our clinical team will review your selection.</Text>

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

          {currentStep === 1 && consentAccepted && !treatmentSelected && (
            <>
            <Text style={styles.treatmentSubtitle}>Please select a treatment to continue. Our clinical team will review your request to make sure its the correct fit for you.</Text>
            <View style={styles.treatmentCard}>
              <Image
                source={require('../images/wegovy-pen.png')}
                style={styles.treatmentImage}
                resizeMode="contain"
              />
              <View style={styles.treatmentInfoBox}>
                <View style={styles.treatmentInfoItem}>
                  <Text style={styles.treatmentLabel}>Medication</Text>
                  <Text style={styles.treatmentValue}>Wegovy</Text>
                </View>
                <View style={styles.treatmentInfoDivider} />
                <View style={styles.treatmentInfoItem}>
                  <Text style={styles.treatmentLabel}>Dose</Text>
                  <Text style={styles.treatmentValue}>0.25mg</Text>
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
            </>
          )}

          {currentStep === 1 && !consentAccepted && (
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
          )}

          {currentStep !== 1 && (
            <View style={styles.answersContainer}>
              {currentQuestion.answers.map((answer) => (
                <AnswerCard
                  key={answer}
                  label={answer}
                  selected={selectedAnswer === answer}
                  onPress={() => setSelectedAnswer(answer)}
                />
              ))}
            </View>
          )}

          {!(currentStep === 1 && consentAccepted && treatmentSelected && supplySelected) && (
          <View style={styles.buttonContainer}>
            <PIPPButton
              title={currentStep === 1 && !consentAccepted ? "Agree and continue" : currentStep === 1 && consentAccepted && !treatmentSelected ? "Continue with Wegovy" : "Continue"}
              onPress={handleContinue}
              disabled={currentStep === 1 ? false : !selectedAnswer}
              iconRight={currentStep === 1 && !consentAccepted ? require('../theme/icons/arrow-forward.svg') : undefined}
            />
          </View>
          )}

          {currentStep === 1 && consentAccepted && !treatmentSelected && (
            <>
            <Text style={styles.bundleDisclaimer}>Future bundle prices vary by dose</Text>

            <View style={styles.altCardsContainer}>
              <TouchableOpacity style={styles.mountjaroCard} onPress={() => { setSelectedTreatment('mounjaro-kwikpen'); setTreatmentSelected(true); }} activeOpacity={0.7}>
                <View style={styles.altCardImageArea}>
                  <Image
                    source={require('../images/mounjaro-pen.png')}
                    style={styles.mountjaroPenImage}
                  />
                </View>
                <View style={styles.altCardContent}>
                  <View style={styles.altCardLeft}>
                    <View style={[styles.altCardBadge, { backgroundColor: '#F8EBFF' }]}>
                      <Text style={styles.altCardBadgeText}>Or, instead</Text>
                    </View>
                    <Text style={styles.altCardTitle}>Mounjaro KwikPen</Text>
                    <Text style={styles.altCardPrice}><Text style={styles.altCardPriceStrike}>£119</Text> <Text style={styles.altCardPriceActive}>£89</Text> per month</Text>
                    <Text style={styles.altCardPlan}>As part of a 3-month plan</Text>
                  </View>
                  <Image
                    source={require('../theme/icons/chevron-right.svg')}
                    style={styles.altCardChevron}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.wegovyPillCard} onPress={() => { setSelectedTreatment('wegovy-pill'); setTreatmentSelected(true); }} activeOpacity={0.7}>
                <View style={styles.altCardImageArea}>
                  <Image
                    source={require('../images/wegovy-pill.png')}
                    style={styles.altCardImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.altCardContent}>
                  <View style={styles.altCardLeft}>
                    <View style={[styles.altCardBadge, { backgroundColor: '#DCF2FF' }]}>
                      <Text style={styles.altCardBadgeText}>Or, instead</Text>
                    </View>
                    <Text style={styles.altCardTitle}>Wegovy Pill</Text>
                    <Text style={styles.altCardPrice}><Text style={styles.altCardPriceStrike}>£119</Text> <Text style={styles.altCardPriceActive}>£89</Text> per month</Text>
                    <Text style={styles.altCardPlan}>As part of a 3-month plan</Text>
                  </View>
                  <Image
                    source={require('../theme/icons/chevron-right.svg')}
                    style={styles.altCardChevron}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.orfoglipronCard} onPress={() => { setSelectedTreatment('orfoglipron'); setTreatmentSelected(true); }} activeOpacity={0.7}>
                <View style={styles.altCardImageArea}>
                  <Image
                    source={require('../images/orfoglipron-tablet.png')}
                    style={styles.altCardImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.altCardContent}>
                  <View style={styles.altCardLeft}>
                    <View style={[styles.altCardBadge, { backgroundColor: '#FBE3E3' }]}>
                      <Text style={styles.altCardBadgeText}>Or, instead</Text>
                    </View>
                    <Text style={styles.altCardTitle}>Orfoglipron tablet</Text>
                    <Text style={styles.altCardPrice}><Text style={styles.altCardPriceStrike}>£119</Text> <Text style={styles.altCardPriceActive}>£89</Text> per month</Text>
                    <Text style={styles.altCardPlan}>As part of a 3-month plan</Text>
                  </View>
                  <Image
                    source={require('../theme/icons/chevron-right.svg')}
                    style={styles.altCardChevron}
                  />
                </View>
              </TouchableOpacity>
            </View>
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
  supplyCardsContainer: {
    marginTop: 20,
    gap: 20,
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
    backgroundImage: 'linear-gradient(291deg, #FDFAF7 0%, #DEF4F7 100%)' as any,
  },
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
    overflow: 'hidden' as any,
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
    justifyContent: 'center' as any,
    alignItems: 'center',
    gap: 4,
    borderRadius: 4,
    backgroundImage: 'linear-gradient(291deg, #E2FBF0 0%, #88F3C4 100%)' as any,
  },
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
    backgroundImage: 'linear-gradient(171deg, #DCF2FF 7.12%, #FFF 92.84%)' as any,
    marginTop: 20,
    overflow: 'hidden' as any,
  },
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
    backdropFilter: 'blur(2px)' as any,
  },
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
    flexDirection: 'row' as any,
    alignItems: 'flex-start' as any,
    alignSelf: 'stretch' as any,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundImage: 'linear-gradient(89deg, #F8EBFF 0.62%, #FFF 32.75%)' as any,
    overflow: 'hidden' as any,
  },
  wegovyPillCard: {
    flexDirection: 'row' as any,
    alignItems: 'flex-start' as any,
    alignSelf: 'stretch' as any,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundImage: 'linear-gradient(89deg, #DCF2FF 0.62%, #FFF 32.75%)' as any,
    overflow: 'hidden' as any,
  },
  orfoglipronCard: {
    flexDirection: 'row' as any,
    alignItems: 'flex-start' as any,
    alignSelf: 'stretch' as any,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    backgroundImage: 'linear-gradient(89deg, #FBE3E3 0.62%, #FFF 32.75%)' as any,
    overflow: 'hidden' as any,
  },
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
    alignItems: 'flex-start',
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
    backgroundImage: 'linear-gradient(180deg, #E1FFE5 0%, rgba(255, 255, 255, 0.00) 100%), linear-gradient(0deg, #FFF, #FFF)',
  } as any,
  planGoalLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[22],
    color: pippTheme.colors.text.secondary,
    textAlign: 'center' as any,
  },
  planGoalPriceRow: {
    flexDirection: 'row' as any,
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
    flexDirection: 'row' as any,
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
});

export default QuestionnaireScreen;
