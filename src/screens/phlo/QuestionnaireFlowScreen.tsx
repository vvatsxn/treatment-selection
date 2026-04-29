import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import {
  QuestionnaireLayout,
  QContent,
  PhloButton,
  navigate,
  C,
} from './PhloLayout';

// ─── Types ────────────────────────────────────────────────────────────────────

type NodeType = 'info' | 'single-choice' | 'multi-choice' | 'text-input' | 'number-input' | 'bmi' | 'summary';

interface Answer { id: string; text: string; next?: string; exits?: boolean; exitReason?: string; }
interface QNode { id: string; type: NodeType; title?: string; question?: string; description?: string; answers?: Answer[]; next?: string; unit?: string; placeholder?: string; }
interface Flow { id: string; title: string; startNode: string; nodes: QNode[]; }

// ─── Flow data ────────────────────────────────────────────────────────────────

const flows: Record<string, Flow> = {
  'weight-loss': {
    id: 'weight-loss', title: 'Weight Loss Assessment', startNode: 'welcome',
    nodes: [
      { id: 'welcome', type: 'info', title: 'Your weight loss consultation', description: "We'll ask you a few questions to make sure this treatment is right for you. It takes about 5 minutes.", next: 'age-check' },
      { id: 'age-check', type: 'single-choice', question: 'Are you 18 years of age or older?', answers: [{ id: 'yes', text: 'Yes', next: 'bmi-weight' }, { id: 'no', text: 'No', exits: true, exitReason: 'You must be 18 or over to access this service.' }] },
      { id: 'bmi-weight', type: 'number-input', question: 'What is your current weight?', unit: 'kg', placeholder: 'e.g. 85', next: 'bmi-height' },
      { id: 'bmi-height', type: 'number-input', question: 'What is your height?', unit: 'cm', placeholder: 'e.g. 170', next: 'bmi-result' },
      { id: 'bmi-result', type: 'bmi', title: 'Your BMI', next: 'medical-conditions' },
      { id: 'medical-conditions', type: 'multi-choice', question: 'Do you have any of the following conditions? Select all that apply.', answers: [{ id: 'diabetes', text: 'Type 2 Diabetes' }, { id: 'hypertension', text: 'High blood pressure' }, { id: 'heart', text: 'Heart disease or stroke' }, { id: 'thyroid', text: 'Thyroid condition' }, { id: 'none', text: 'None of the above' }], next: 'medications' },
      { id: 'medications', type: 'single-choice', question: 'Are you currently taking any prescription medications?', answers: [{ id: 'yes', text: 'Yes', next: 'medication-details' }, { id: 'no', text: 'No', next: 'allergies' }] },
      { id: 'medication-details', type: 'text-input', question: 'Please list your current medications', placeholder: 'e.g. Metformin 500mg, Lisinopril 10mg', next: 'allergies' },
      { id: 'allergies', type: 'single-choice', question: 'Do you have any known allergies to medications?', answers: [{ id: 'yes', text: 'Yes', next: 'allergy-details' }, { id: 'no', text: 'No', next: 'pregnancy' }] },
      { id: 'allergy-details', type: 'text-input', question: 'Please describe your allergies', placeholder: 'e.g. Penicillin', next: 'pregnancy' },
      { id: 'pregnancy', type: 'single-choice', question: 'Are you pregnant, breastfeeding, or planning to become pregnant in the next 6 months?', answers: [{ id: 'yes', text: 'Yes', exits: true, exitReason: 'Weight loss medication is not suitable during pregnancy or breastfeeding.' }, { id: 'no', text: 'No', next: 'summary' }, { id: 'na', text: 'Not applicable', next: 'summary' }] },
      { id: 'summary', type: 'summary', title: 'Review your answers', description: 'Please check everything looks correct before we send your consultation to a clinician.' },
    ],
  },
  contraception: {
    id: 'contraception', title: 'Contraception Consultation', startNode: 'welcome',
    nodes: [
      { id: 'welcome', type: 'info', title: 'Contraception consultation', description: "We'll ask a few questions to find the right contraception for you.", next: 'age-check' },
      { id: 'age-check', type: 'single-choice', question: 'Are you 18 years of age or older?', answers: [{ id: 'yes', text: 'Yes', next: 'current-contraception' }, { id: 'no', text: 'No', exits: true, exitReason: 'You must be 18 or over to access this service.' }] },
      { id: 'current-contraception', type: 'single-choice', question: 'Are you currently using any form of contraception?', answers: [{ id: 'yes', text: 'Yes', next: 'migraine' }, { id: 'no', text: 'No', next: 'migraine' }] },
      { id: 'migraine', type: 'single-choice', question: 'Do you experience migraines with aura?', answers: [{ id: 'yes', text: 'Yes', next: 'blood-clots' }, { id: 'no', text: 'No', next: 'blood-clots' }] },
      { id: 'blood-clots', type: 'single-choice', question: 'Have you ever had a blood clot (DVT or pulmonary embolism)?', answers: [{ id: 'yes', text: 'Yes', exits: true, exitReason: 'Combined hormonal contraception may not be suitable for you. Please speak to your GP.' }, { id: 'no', text: 'No', next: 'summary' }] },
      { id: 'summary', type: 'summary', title: 'Review your answers', description: 'Please check everything before submitting.' },
    ],
  },
};

type Answers = Record<string, string | string[]>;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function QuestionnaireFlowScreen() {
  const condition = new URLSearchParams(window.location.search).get('condition') ?? 'weight-loss';
  const flow = flows[condition] ?? null;

  const [answers, setAnswers] = useState<Answers>({});
  const [history, setHistory] = useState<string[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [exitReason, setExitReason] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const nodeId = currentNodeId ?? flow?.startNode ?? null;
  const node = useMemo(() => flow?.nodes.find((n) => n.id === nodeId) ?? null, [flow, nodeId]);

  if (!flow || !node) {
    return (
      <QuestionnaireLayout>
        <QContent>
          <Text style={s.notFound}>Questionnaire not found.</Text>
        </QContent>
      </QuestionnaireLayout>
    );
  }

  const nodeIndex = flow.nodes.findIndex((n) => n.id === nodeId);
  const pct = Math.round(((nodeIndex + 1) / flow.nodes.length) * 100);

  const goTo = (id: string) => { setHistory((h) => [...h, nodeId!]); setCurrentNodeId(id); };
  const goBack = () => { const prev = history[history.length - 1]; if (prev) { setHistory((h) => h.slice(0, -1)); setCurrentNodeId(prev); } };
  const record = (id: string, val: string | string[]) => setAnswers((a) => ({ ...a, [id]: val }));

  const handleSingle = (answerId: string) => {
    record(node.id, answerId);
    const a = node.answers?.find((x) => x.id === answerId);
    if (a?.exits) { setExitReason(a.exitReason ?? 'Not eligible'); return; }
    if (a?.next) goTo(a.next);
    else if (node.next) goTo(node.next);
  };

  if (exitReason) {
    return (
      <QuestionnaireLayout>
        <QContent style={s.centred}>
          <View style={s.warningCircle}>
            <Text style={s.warningIcon}>!</Text>
          </View>
          <Text style={s.exitHeading}>Unfortunately, we can't prescribe this treatment for you</Text>
          <Text style={s.exitBody}>{exitReason}</Text>
          <PhloButton label="Back to home" onPress={() => navigate('/phlo/getting-started')} />
        </QContent>
      </QuestionnaireLayout>
    );
  }

  if (submitted) {
    return (
      <QuestionnaireLayout>
        <QContent style={s.centred}>
          <View style={s.successCircle}>
            <Text style={s.successCheck}>✓</Text>
          </View>
          <Text style={s.successHeading}>Consultation submitted</Text>
          <Text style={s.successBody}>
            A clinician will review your answers and prescribe your treatment. You'll hear from us within 24 hours.
          </Text>
          <PhloButton
            label="Choose your treatment"
            onPress={() => navigate(`/phlo/product-selection?condition=${condition}`)}
          />
        </QContent>
      </QuestionnaireLayout>
    );
  }

  return (
    <QuestionnaireLayout
      progress={pct}
      step="1"
      onBack={history.length > 0 ? goBack : undefined}
    >
      <QContent>
        {node.type === 'info' && (
          <InfoNode node={node} onContinue={() => node.next && goTo(node.next)} />
        )}
        {node.type === 'single-choice' && (
          <SingleChoice node={node} onAnswer={handleSingle} />
        )}
        {node.type === 'multi-choice' && (
          <MultiChoice node={node} onAnswer={(ids) => { record(node.id, ids); if (node.next) goTo(node.next); }} />
        )}
        {node.type === 'text-input' && (
          <TextInputNode node={node} onAnswer={(v) => { record(node.id, v); if (node.next) goTo(node.next); }} />
        )}
        {node.type === 'number-input' && (
          <NumberInputNode node={node} onAnswer={(v) => { record(node.id, v); if (node.next) goTo(node.next); }} />
        )}
        {node.type === 'bmi' && (
          <BmiNode
            node={node}
            weightKg={answers['bmi-weight'] as string}
            heightCm={answers['bmi-height'] as string}
            onContinue={() => node.next && goTo(node.next)}
          />
        )}
        {node.type === 'summary' && (
          <SummaryNode node={node} answers={answers} onSubmit={() => setSubmitted(true)} />
        )}
      </QContent>
    </QuestionnaireLayout>
  );
}

// ─── Node components ──────────────────────────────────────────────────────────

function InfoNode({ node, onContinue }: { node: QNode; onContinue: () => void }) {
  return (
    <View style={s.nodeContent}>
      <Text style={s.nodeTitle}>{node.title}</Text>
      <Text style={s.nodeDesc}>{node.description}</Text>
      <PhloButton label="Continue" onPress={onContinue} />
    </View>
  );
}

function SingleChoice({ node, onAnswer }: { node: QNode; onAnswer: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <View style={s.nodeContent}>
      <Text style={s.nodeQuestion}>{node.question}</Text>
      <View style={s.choices}>
        {node.answers?.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={[s.choiceCard, selected === a.id && s.choiceCardSelected]}
            onPress={() => setSelected(a.id)}
            activeOpacity={0.8}
          >
            <Text style={[s.choiceText, selected === a.id && s.choiceTextSelected]}>
              {a.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <PhloButton label="Continue" disabled={!selected} onPress={() => selected && onAnswer(selected)} />
    </View>
  );
}

function MultiChoice({ node, onAnswer }: { node: QNode; onAnswer: (ids: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (id === 'none') { next.clear(); next.add('none'); }
    else { next.delete('none'); next.has(id) ? next.delete(id) : next.add(id); }
    setSelected(new Set(next));
  };
  return (
    <View style={s.nodeContent}>
      <Text style={s.nodeQuestion}>{node.question}</Text>
      <Text style={s.selectAll}>Select all that apply</Text>
      <View style={s.choices}>
        {node.answers?.map((a) => {
          const isSelected = selected.has(a.id);
          return (
            <TouchableOpacity
              key={a.id}
              style={[s.choiceCard, s.choiceCardRow, isSelected && s.choiceCardSelected]}
              onPress={() => toggle(a.id)}
              activeOpacity={0.8}
            >
              <View style={[s.checkbox, isSelected && s.checkboxSelected]}>
                {isSelected && <Text style={s.checkboxTick}>✓</Text>}
              </View>
              <Text style={[s.choiceText, isSelected && s.choiceTextSelected]}>{a.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <PhloButton label="Continue" disabled={selected.size === 0} onPress={() => onAnswer(Array.from(selected))} />
    </View>
  );
}

function TextInputNode({ node, onAnswer }: { node: QNode; onAnswer: (val: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <View style={s.nodeContent}>
      <Text style={s.nodeQuestion}>{node.question}</Text>
      <TextInput
        style={s.textarea}
        multiline
        numberOfLines={4}
        placeholder={node.placeholder}
        placeholderTextColor={C.textTertiary}
        value={value}
        onChangeText={setValue}
      />
      <PhloButton label="Continue" disabled={!value.trim()} onPress={() => onAnswer(value)} />
    </View>
  );
}

function NumberInputNode({ node, onAnswer }: { node: QNode; onAnswer: (val: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <View style={s.nodeContent}>
      <Text style={s.nodeQuestion}>{node.question}</Text>
      <View style={s.numberRow}>
        <TextInput
          style={s.numberInput}
          keyboardType="numeric"
          placeholder={node.placeholder}
          placeholderTextColor={C.textTertiary}
          value={value}
          onChangeText={setValue}
        />
        {node.unit && <Text style={s.unit}>{node.unit}</Text>}
      </View>
      <PhloButton label="Continue" disabled={!value} onPress={() => onAnswer(value)} />
    </View>
  );
}

function BmiNode({ node, weightKg, heightCm, onContinue }: { node: QNode; weightKg: string; heightCm: string; onContinue: () => void }) {
  const bmi = weightKg && heightCm
    ? (Number(weightKg) / Math.pow(Number(heightCm) / 100, 2)).toFixed(1)
    : '—';
  return (
    <View style={s.nodeContent}>
      <Text style={s.nodeQuestion}>{node.title}</Text>
      <View style={s.bmiBox}>
        <Text style={s.bmiValue}>{bmi}</Text>
        <Text style={s.bmiLabel}>Your BMI</Text>
      </View>
      <PhloButton label="Continue" onPress={onContinue} />
    </View>
  );
}

function SummaryNode({ node, answers, onSubmit }: { node: QNode; answers: Answers; onSubmit: () => void }) {
  return (
    <View style={s.nodeContent}>
      <Text style={s.nodeTitle}>{node.title}</Text>
      <Text style={s.nodeDesc}>{node.description}</Text>
      <View style={s.summaryCard}>
        {Object.entries(answers).map(([id, val], i, arr) => (
          <View key={id} style={[s.summaryRow, i === arr.length - 1 && s.summaryRowLast]}>
            <Text style={s.summaryKey}>{id.replace(/-/g, ' ')}</Text>
            <Text style={s.summaryVal}>{Array.isArray(val) ? val.join(', ') : val}</Text>
          </View>
        ))}
      </View>
      <PhloButton label="Submit consultation" onPress={onSubmit} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  notFound: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    color: C.textTertiary,
    textAlign: 'center',
    paddingTop: 120,
  },
  centred: {
    alignItems: 'center',
    paddingTop: 80,
  } as any,

  warningCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FEF3C7',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  warningIcon: { fontSize: 28, color: '#D97706', fontWeight: '700' },
  exitHeading: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 20, lineHeight: 28, fontWeight: '600',
    color: C.textPrimary, marginBottom: 12,
    textAlign: 'center',
  },
  exitBody: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, lineHeight: 22,
    color: C.textSecondary, marginBottom: 32,
    textAlign: 'center',
  },
  successCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#F0FDF4',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  successCheck: { fontSize: 28, color: '#16A34A' },
  successHeading: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 24, lineHeight: 32, fontWeight: '700',
    color: C.textPrimary, marginBottom: 12,
    textAlign: 'center',
  },
  successBody: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, lineHeight: 22,
    color: C.textSecondary, marginBottom: 32,
    textAlign: 'center',
  },

  nodeContent: { gap: 16, width: '100%' as any },

  nodeTitle: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 24, lineHeight: 32, fontWeight: '700',
    color: C.textPrimary,
  },
  nodeQuestion: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 20, lineHeight: 28, fontWeight: '600',
    color: C.textPrimary,
  },
  nodeDesc: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16, lineHeight: 24,
    color: C.textSecondary,
  },
  selectAll: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12, color: C.textTertiary,
  },

  choices: { gap: 8 },
  choiceCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: C.borderContainer,
    backgroundColor: C.white,
  },
  choiceCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  choiceCardSelected: {
    borderColor: C.primaryMain,
    backgroundColor: C.primary25,
  },
  choiceText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, fontWeight: '600',
    color: C.textPrimary,
  },
  choiceTextSelected: { color: C.primaryMain },

  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 2, borderColor: C.borderContainer,
    backgroundColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxSelected: {
    borderColor: C.primaryMain,
    backgroundColor: C.primaryMain,
  },
  checkboxTick: {
    fontSize: 12, color: '#fff', fontWeight: '700',
  },

  textarea: {
    borderWidth: 2,
    borderColor: '#A7A1B3',
    borderRadius: 8,
    padding: 12,
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    color: C.textPrimary,
    minHeight: 96,
    textAlignVertical: 'top',
    // @ts-ignore — web-only
    outlineStyle: 'none',
  },

  numberRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  numberInput: {
    flex: 1,
    height: 48,
    borderWidth: 2,
    borderColor: '#A7A1B3',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    color: C.textPrimary,
    // @ts-ignore — web-only
    outlineStyle: 'none',
  },
  unit: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16, fontWeight: '600',
    color: C.textSecondary,
  },

  bmiBox: {
    backgroundColor: C.primary25,
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  bmiValue: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 48, fontWeight: '700',
    color: C.primaryMain,
  },
  bmiLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, color: C.textSecondary,
  },

  summaryCard: {
    backgroundColor: C.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.borderContainer,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.borderContainer,
  },
  summaryRowLast: { borderBottomWidth: 0 },
  summaryKey: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12, color: C.textTertiary,
    textTransform: 'capitalize' as any,
    flexShrink: 0,
  },
  summaryVal: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, color: C.textPrimary,
    textAlign: 'right', flex: 1,
  },
});
