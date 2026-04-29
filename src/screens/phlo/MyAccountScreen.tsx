import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

// Inject responsive CSS for order card step rows and CTA visibility
const _ocCSS = `
  [data-ocsteps="desktop"] { display: flex !important; }
  [data-ocsteps="mobile"]  { display: none  !important; }
  [data-ocfill="desktop"]  { display: block !important; }
  [data-ocfill="mobile"]   { display: none  !important; }
  [data-octacta="desktop"] { display: flex !important; }
  [data-octacta="mobile"]  { display: none !important; }
  @media (max-width: 700px) {
    [data-ocsteps="desktop"] { display: none  !important; }
    [data-ocsteps="mobile"]  { display: flex  !important; }
    [data-ocfill="desktop"]  { display: none  !important; }
    [data-ocfill="mobile"]   { display: block !important; }
    [data-octacta="desktop"] { display: none !important; }
    [data-octacta="mobile"]  { display: flex !important; }
  }
  /* Truncate long medication name in confirmed delivery state on mobile */
  @media (max-width: 700px) {
    [data-ocstatusname="confirmed"] { max-width: calc(100vw - 120px) !important; }
  }
  /* Secondary CTA button states */
  [data-octacta]:hover   { background: #DEF4F7 !important; border-color: #07073D !important; }
  [data-octacta]:active  { background: #AEE5EB !important; border-color: #07073D !important; }
  [data-octacta]:disabled, [data-octacta][disabled] { opacity: 0.4 !important; background: #FFF !important; border-color: #07073D !important; }
  /* Track fade masks — mobile only, only when steps are clipped at that edge */
  @media (max-width: 700px) {
    [data-octrack="start"]  { -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%); mask-image: linear-gradient(to right, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%); }
    [data-octrack="middle"] { -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%); mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%); }
    [data-octrack="end"]    { -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 25%); mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 25%); }
  }
`;
if (typeof document !== 'undefined') {
  let el = document.getElementById('oc-step-css');
  if (!el) { el = document.createElement('style'); el.id = 'oc-step-css'; document.head.appendChild(el); }
  el.textContent = _ocCSS;
}
import {
  PhloLayout,
  ContentContainer,
  StatusBadge,
  StatusBanner,
  PhloButton,
  navigate,
  C,
} from './PhloLayout';
import { mockOrders } from './mockData';

const patient = { firstName: 'Sarah', email: 'sarah.mitchell@example.com' };

// Weight hub widget data (from mock)
const totalWeightLostKg = 4.4; // 86.4 - 82.0
const lastWeightKg = 82.0;
const daysUntilReorder = 5;

const newOrderConditions = [
  { id: 'weight-loss',    bold: 'Weight',  rest: ' loss',   label: 'Weight loss service',                                           image: require('../../images/weight-loss-img.jpg'),    pippStyle: true  },
  { id: 'general-health', bold: 'General', rest: ' health', label: 'Acid reflux, Acne, Hay fever and Migraines',                    image: require('../../images/general-health-img.jpg'), pippStyle: false },
  { id: 'female-health',  bold: 'Female',  rest: ' health', label: 'Daily and Emergency contraception, Period delay and Menopause', image: require('../../images/female-health-img.jpg'),  pippStyle: false },
  { id: 'male-health',    bold: 'Male',    rest: ' health', label: 'Erectile dysfunction, Hair loss and Premature ejaculation',     image: require('../../images/male-health-img.jpg'),    pippStyle: false },
];

const detailsRows = [
  { label: 'Name',   value: 'Sarah Mitchell' },
  { label: 'Email',  value: 'sarah.mitchell@example.com' },
  { label: 'Mobile', value: '+44 7700 900123' },
];

export default function MyAccountScreen() {
  const latestOrder = mockOrders[0];

  return (
    <PhloLayout>
      <ContentContainer>
        {/* ── Main content ── */}
        <View style={s.mainContent}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.headerSub}>Welcome back,</Text>
          <Text style={s.headerName}>{patient.firstName}</Text>
        </View>

        {/* ── Weight hub widget ── */}
        <View style={s.widget}>
          <View style={s.widgetLeft}>
            <Text style={s.widgetTitle}>My weight journey</Text>
            <View style={s.widgetStats}>
              <View style={s.widgetStat}>
                <Text style={s.widgetStatLabel}>Weight loss progress</Text>
                <Text style={s.widgetStatNum}>–</Text>
              </View>
              <View style={s.widgetStat}>
                <Text style={s.widgetStatLabel}>Last weight</Text>
                <Text style={s.widgetStatNum}>{lastWeightKg}kg</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={s.widgetBtn}
            onPress={() => navigate('/phlo/my-account/weight-loss-hub')}
          >
            <Text style={s.widgetBtnText}>View progress</Text>
          </TouchableOpacity>
        </View>

        {/* ── My orders ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Active orders</Text>
            <TouchableOpacity style={s.sectionViewAll} onPress={() => navigate('/phlo/my-account/orders')}>
              <Text style={s.sectionViewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          <OrderCard order={mockOrders[0]} />
        </View>

        {/* ── Start a new order ── */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { marginBottom: 16 }]}>Start a new order</Text>
          <View style={s.conditionGrid}>
            {newOrderConditions.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={s.conditionCard}
                onPress={() => navigate(`/phlo/getting-started?condition=${c.id}`)}
                activeOpacity={0.8}
              >
                <View style={s.conditionImgWrap}>
                  <Image source={c.image} style={s.conditionImg} resizeMode="cover" />
                </View>
                <View style={s.conditionTextArea}>
                  <Text style={s.conditionLabel}>{c.label}</Text>
                  {c.pippStyle ? (
                    <View style={s.conditionBtn}>
                      <Text style={s.conditionBtnText}>Start order</Text>
                      <Image
                        source={require('../../theme/icons/arrow-forward.svg')}
                        style={s.conditionBtnIcon}
                      />
                    </View>
                  ) : (
                    <View style={s.conditionIconBtn}>
                      <Image
                        source={require('../../theme/icons/arrow-forward.svg')}
                        style={s.conditionIconBtnIcon}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── My details ── */}
        <View style={[s.section, s.sectionLast]}>
          <Text style={[s.sectionTitle, { marginBottom: 16 }]}>My details</Text>
          <View style={s.detailsCard}>
            {detailsRows.map((row) => (
              <View key={row.label} style={s.detailRow}>
                <Text style={s.detailLabel}>{row.label}</Text>
                <Text style={s.detailValue}>{row.value}</Text>
              </View>
            ))}
            <PhloButton
              label="Edit details"
              variant="text-btn"
              onPress={() => navigate('/phlo/my-account/details')}
              fullWidth={false}
            />
          </View>
        </View>

        </View>{/* end mainContent */}

        <View style={{ height: 40 }} />
      </ContentContainer>
    </PhloLayout>
  );
}

// ─── Order card config ────────────────────────────────────────────────────────

const OC_STEPS        = ['Order placed', 'Prescriber review', 'Preparing your order', 'On its way', 'Delivered'];
const OC_STEPS_MOBILE = ['Order placed', 'Prescriber review', 'Preparing',            'On its way', 'Delivered'];

type OcVariant = 'pending' | 'hold' | 'approved' | 'dispatched' | 'delivered' | 'error' | 'warning' | 'success' | 'none';

const OC_STATUS: Record<string, {
  label: string; stepIndex: number; variant: OcVariant;
  calloutHeadline: string; calloutBody: string | null;
  ctaLabel: string | null; ctaRoute: string | null;
  ctaSecondary?: boolean;
}> = {
  ORDER_PLACED: {
    label: 'Order placed', stepIndex: 0, variant: 'pending',
    calloutHeadline: "You're all set.",
    calloutBody: "We've received your order and we'll start reviewing shortly.",
    ctaLabel: null, ctaRoute: null,
  },
  ON_HOLD: {
    label: 'Order placed', stepIndex: 0, variant: 'hold',
    calloutHeadline: 'Get approved sooner.',
    calloutBody: 'Upload your supporting photos so we can safely prescribe your treatment.',
    ctaLabel: 'Take photos', ctaRoute: '/phlo/photo-capture/upload',
    ctaSecondary: true,
  },
  PAYMENT_FAILED: {
    label: 'Order placed', stepIndex: 0, variant: 'error',
    calloutHeadline: "Payment didn't go through.",
    calloutBody: "We weren't able to take payment for your order. Please complete payment for your order to be processed.",
    ctaLabel: 'Complete payment', ctaRoute: null,
    ctaSecondary: true,
  },
  IN_REVIEW_NO_ACTION: {
    label: 'Prescriber review', stepIndex: 1, variant: 'none',
    calloutHeadline: '', calloutBody: null,
    ctaLabel: null, ctaRoute: null,
  },
  IN_REVIEW_EVIDENCE_REQUIRED: {
    label: 'Prescriber review', stepIndex: 1, variant: 'warning',
    calloutHeadline: 'We need some more information.',
    calloutBody: 'Upload your supporting photos so we can safely prescribe your treatment.',
    ctaLabel: 'Take photos', ctaRoute: '/phlo/photo-capture/upload',
    ctaSecondary: true,
  },
  IN_REVIEW_UPLOADED: {
    label: 'Prescriber review', stepIndex: 1, variant: 'success',
    calloutHeadline: "We've got your uploaded information.",
    calloutBody: 'A prescriber will review your information soon.',
    ctaLabel: null, ctaRoute: null,
  },
  PRESCRIBER_REVIEW: {
    label: 'Prescriber review', stepIndex: 1, variant: 'pending',
    calloutHeadline: 'A prescriber is reviewing your order.',
    calloutBody: "No action needed from you right now. We'll update this page as soon as there's news.",
    ctaLabel: null, ctaRoute: null,
  },
  PREPARING_YOUR_ORDER: {
    label: 'Preparing your order', stepIndex: 2, variant: 'pending',
    calloutHeadline: 'We are preparing your order.',
    calloutBody: 'Your order has been approved and will be on its way shortly.',
    ctaLabel: null, ctaRoute: null,
  },
  REJECTED: {
    label: 'Rejected', stepIndex: -1, variant: 'none',
    calloutHeadline: '', calloutBody: null,
    ctaLabel: null, ctaRoute: null,
  },
  CANCELLED: {
    label: 'Cancelled', stepIndex: -1, variant: 'none',
    calloutHeadline: '', calloutBody: null,
    ctaLabel: null, ctaRoute: null,
  },
  DISPATCHED: {
    label: 'On its way', stepIndex: 3, variant: 'dispatched',
    calloutHeadline: 'Your order has left our pharmacy.',
    calloutBody: 'Royal Mail Tracked 24 — delivery is usually next working day. Track below for live updates.',
    ctaLabel: 'Track your order', ctaRoute: null,
    ctaSecondary: true,
  },
  DELIVERED: {
    label: 'Delivered', stepIndex: 4, variant: 'delivered',
    calloutHeadline: 'Your order has been delivered.',
    calloutBody: "Not received it within 24 hours of this update? Contact our team and we'll look into it straight away.",
    ctaLabel: null, ctaRoute: null,
  },
  DELIVERED_CONFIRMED: {
    label: '', stepIndex: -1, variant: 'none',
    calloutHeadline: '', calloutBody: null,
    ctaLabel: null, ctaRoute: null,
  },
};

const OC_TOKENS: Record<OcVariant, {
  bottomBg: string; bottomBorder: string;
  iconBg: string; iconColor: string;
  textColor: string;
  ctaBorderColor: string; ctaTextColor: string;
}> = {
  pending:    { bottomBg: '#E9EEFA', bottomBorder: '#E6E7ED', iconBg: '#0E2B62', iconColor: '#fff', textColor: '#07073D', ctaBorderColor: '#07073D', ctaTextColor: '#07073D' },
  hold:       { bottomBg: '#E9EEFA', bottomBorder: '#E6E7ED', iconBg: '#0E2B62', iconColor: '#fff', textColor: '#07073D', ctaBorderColor: '#07073D', ctaTextColor: '#07073D' },
  approved:   { bottomBg: '#E9EEFA', bottomBorder: '#E6E7ED', iconBg: '#0E2B62', iconColor: '#fff', textColor: '#07073D', ctaBorderColor: '#07073D', ctaTextColor: '#07073D' },
  dispatched: { bottomBg: '#E9EEFA', bottomBorder: '#E6E7ED', iconBg: '#0E2B62', iconColor: '#fff', textColor: '#07073D', ctaBorderColor: '#07073D', ctaTextColor: '#07073D' },
  delivered:  { bottomBg: '#E9EEFA', bottomBorder: '#E6E7ED', iconBg: '#0E2B62', iconColor: '#fff', textColor: '#07073D', ctaBorderColor: '#07073D', ctaTextColor: '#07073D' },
  error:      { bottomBg: '#FDEBEE', bottomBorder: '#FBCCD1', iconBg: '#BB292A', iconColor: '#fff', textColor: '#07073D', ctaBorderColor: '#07073D', ctaTextColor: '#07073D' },
  warning:    { bottomBg: '#FEF3C7', bottomBorder: '#FDE68A', iconBg: '#D97706', iconColor: '#fff', textColor: '#07073D', ctaBorderColor: '#07073D', ctaTextColor: '#07073D' },
  success:    { bottomBg: '#DCFCE7', bottomBorder: '#BBF7D0', iconBg: '#16A34A', iconColor: '#fff', textColor: '#07073D', ctaBorderColor: '#07073D', ctaTextColor: '#07073D' },
  none:       { bottomBg: 'transparent', bottomBorder: 'transparent', iconBg: 'transparent', iconColor: 'transparent', textColor: '#07073D', ctaBorderColor: '#07073D', ctaTextColor: '#07073D' },
};

// ─── Order card ───────────────────────────────────────────────────────────────

export function OrderCard({ order }: { order: typeof mockOrders[number] }) {
  const cfg = OC_STATUS[order.status] ?? OC_STATUS['PENDING']!;
  const tok = OC_TOKENS[cfg.variant];
  const si    = cfg.stepIndex;
  const total = OC_STEPS.length - 1; // 4

  // Show 3 windowed steps centred on the active step
  const winStart    = Math.max(0, Math.min(si - 1, total - 2));
  const winEnd      = Math.min(total, winStart + 2);
  const visSteps       = OC_STEPS.slice(winStart, winEnd + 1);
  const visStepsMobile = OC_STEPS_MOBILE.slice(winStart, winEnd + 1);
  const activeInWin = si - winStart;

  // Desktop: fill to centre of each step's segment across all 5
  const trackPctDesktop = si === total
    ? '100%'
    : `${((si + 0.5) / (total + 1)) * 100}%`;

  // Mobile: fill to centre of active step within the 3-step window
  const trackPctMobile = si === total
    ? '100%'
    : `${((activeInWin + 0.5) / visSteps.length) * 100}%`;

  const supplyLabel    = order.description.split('—')[1]?.trim() ?? order.description;

  return (
    <TouchableOpacity
      style={s.oc}
      onPress={() => navigate(`/phlo/my-account/orders/${order.id}`)}
      activeOpacity={0.95}
    >
      {/* ── Top white panel ── */}
      <View style={s.ocTop}>

        {/* Status name + med name + meta + chevron */}
        <View style={s.ocTopRow}>
          <View style={s.ocTopLeft}>
            <Text
              numberOfLines={order.status === 'DELIVERED_CONFIRMED' ? 1 : undefined}
              ellipsizeMode="tail"
              style={[s.ocStatusName, order.status === 'REJECTED' && { color: '#BB292A' }, order.status === 'CANCELLED' && { color: '#9CA3AF' }]}
              dataSet={order.status === 'DELIVERED_CONFIRMED' ? { ocstatusname: 'confirmed' } as any : undefined}
            >
              {order.status === 'DELIVERED_CONFIRMED' ? order.treatmentName : cfg.label}
            </Text>
            {order.status !== 'DELIVERED_CONFIRMED' && (
              <Text style={s.ocMedName}>{order.treatmentName}</Text>
            )}
            <View style={s.ocMeta}>
              <Text style={s.ocMetaText}>{supplyLabel}</Text>
              <View style={s.ocMetaDot} />
              <Text style={s.ocMetaText}>
                {order.status === 'DELIVERED_CONFIRMED'
                  ? `Delivered ${order.deliveryDate}`
                  : `Ordered ${order.orderedDate}`}
              </Text>
            </View>
          </View>
          <Image source={require('../../theme/icons/chevron-right.svg')} style={s.ocChevronIcon} />
        </View>

        {/* Progress bar + step labels — hidden for rejected */}
        {si >= 0 && <View style={s.ocTrackWrap}>
          <View
            style={s.ocTrackBg}
            dataSet={{ octrack: winStart > 0 && winEnd < total ? 'middle' : winStart > 0 ? 'end' : winEnd < total ? 'start' : 'none' } as any}
          >
            {/* Desktop fill */}
            <View
              style={[s.ocTrackFill, { width: trackPctDesktop as any }]}
              dataSet={{ ocfill: 'desktop' } as any}
            />
            {/* Mobile fill */}
            <View
              style={[s.ocTrackFill, s.ocTrackFillMobile, { width: trackPctMobile as any }]}
              dataSet={{ ocfill: 'mobile' } as any}
            />
          </View>

          {/* Desktop: all 5 labels */}
          <View style={s.ocStepRow} dataSet={{ ocsteps: 'desktop' } as any}>
            {OC_STEPS.map((step, i) => {
              const isActive = i === si;
              const isDone   = i < si;
              return (
                <Text
                  key={step}
                  style={[
                    s.ocStepLabel,
                    isDone   && s.ocStepLabelDone,
                    isActive && s.ocStepLabelActive,
                  ]}
                >
                  {step}
                </Text>
              );
            })}
          </View>

          {/* Mobile: 3 labels, active centred, sides faded */}
          <View style={s.ocStepRowMobile} dataSet={{ ocsteps: 'mobile' } as any}>
            {visStepsMobile.map((step, wi) => {
              const isActive = wi === activeInWin;
              return (
                <Text
                  key={step}
                  numberOfLines={1}
                  style={[
                    s.ocStepLabel,
                    s.ocStepLabelMobileItem,
                    isActive && s.ocStepLabelActive,
                    !isActive && s.ocStepLabelMobileFade,
                    wi === 0 && s.ocStepLabelMobileLeft,
                    wi === visSteps.length - 1 && s.ocStepLabelMobileRight,
                  ]}
                >
                  {step}
                </Text>
              );
            })}
          </View>
        </View>}

      </View>

      {/* ── Bottom info panel — hidden for no-action states ── */}
      {cfg.variant !== 'none' && <View style={[s.ocBottom, { backgroundColor: tok.bottomBg, borderColor: tok.bottomBorder }]}>

        {/* Icon + text row — on desktop includes inline CTA */}
        <View style={s.ocCalloutRow}>
          <View style={s.ocCalloutLeft}>
            <View style={[s.ocCalloutIconWrap, { backgroundColor: tok.iconBg }]}>
              <Image
                source={cfg.variant === 'error'
                  ? require('../../theme/icons/warning-filled.svg')
                  : cfg.variant === 'success'
                  ? require('../../theme/icons/check-circle-outline.svg')
                  : require('../../theme/icons/info-outline.svg')}
                style={[s.ocCalloutIconImg, { tintColor: tok.iconColor }]}
              />
            </View>
            <View style={s.ocCalloutTextWrap}>
              <Text style={[s.ocCalloutHeadline, { color: tok.textColor }]}>{cfg.calloutHeadline}</Text>
              {cfg.calloutBody && (
                <Text style={[s.ocCalloutBody, { color: tok.textColor }]}>{cfg.calloutBody}</Text>
              )}
            </View>
          </View>
          {/* Desktop CTA — inline, hugs content */}
          {cfg.ctaLabel && (
            <TouchableOpacity
              style={s.ocCtaDesktop}
              onPress={() => cfg.ctaRoute ? navigate(cfg.ctaRoute) : navigate(`/phlo/my-account/orders/${order.id}`)}
              activeOpacity={0.85}
              dataSet={{ octacta: 'desktop' } as any}
            >
              <Text style={s.ocCtaText}>{cfg.ctaLabel}</Text>
              <Image
                source={order.status === 'DISPATCHED'
                  ? require('../../theme/icons/arrow-outward.svg')
                  : require('../../theme/icons/arrow-forward.svg')}
                style={s.ocCtaIcon}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Mobile CTA — below text, full width */}
        {cfg.ctaLabel && (
          <TouchableOpacity
            style={s.ocCtaMobile}
            onPress={() => cfg.ctaRoute ? navigate(cfg.ctaRoute) : navigate(`/phlo/my-account/orders/${order.id}`)}
            activeOpacity={0.85}
            dataSet={{ octacta: 'mobile' } as any}
          >
            <Text style={s.ocCtaText}>{cfg.ctaLabel}</Text>
            <Image
              source={order.status === 'DISPATCHED'
                ? require('../../theme/icons/arrow-outward.svg')
                : require('../../theme/icons/arrow-forward.svg')}
              style={s.ocCtaIcon}
            />
          </TouchableOpacity>
        )}

      </View>}
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerSub: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16, lineHeight: 24, fontWeight: '400',
    color: '#575D84',
  },
  headerName: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 28, lineHeight: 36, fontWeight: '600',
    color: C.textPrimary,
  },

  mainContent: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 48,
  },

  // Weight hub widget
  widget: {
    backgroundColor: C.primaryMain,
    borderRadius: 8,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    // @ts-ignore
    flexWrap: 'wrap',
    gap: 24,
  },
  widgetLeft: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    gap: 16,
  },
  widgetTitle: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 28, lineHeight: 36, fontWeight: '600',
    color: '#fff',
  },
  widgetStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 303,
  },
  widgetStat: { flexDirection: 'column', flex: 1 },
  widgetStatLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12, lineHeight: 20, fontWeight: '400',
    color: '#fff',
  },
  widgetStatNum: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16, lineHeight: 24, fontWeight: '600',
    color: '#fff',
  },
  widgetBtn: {
    height: 48,
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 360,
  },
  widgetBtnText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16, fontWeight: '600',
    lineHeight: 16,
    color: '#fff',
    textAlign: 'center',
  },

  // Section
  section: {},
  sectionLast: {},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 24, lineHeight: 32, fontWeight: '600',
    color: C.textPrimary,
    // @ts-ignore
    whiteSpace: 'nowrap',
  },
  sectionViewAll: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 4,
    marginLeft: 'auto' as any,
  },
  sectionViewAllText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16, fontWeight: '600',
    lineHeight: 16,
    color: C.primaryMain,
    textAlign: 'center',
  },

  // ── Order card ──
  oc: {
    flexDirection: 'column',
    // @ts-ignore
    cursor: 'pointer',
  },

  // Top white panel
  ocTop: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6E7ED',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    alignSelf: 'stretch' as any,
    position: 'relative' as any,
    zIndex: 1,
  },
  ocTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  ocTopLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    flex: 1,
  },
  ocStatusName: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 20, lineHeight: 28, fontWeight: '600',
    color: '#07073D',
  },
  ocMedName: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, lineHeight: 22, fontWeight: '400',
    color: '#2F345F',
  },
  ocMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ocMetaText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 10, lineHeight: 12, fontWeight: '400',
    color: '#575D84',
  },
  ocMetaDot: {
    width: 4, height: 4,
    borderRadius: 40,
    backgroundColor: '#C0C4D3',
  },
  ocChevronIcon: {
    width: 24, height: 24,
    tintColor: '#C0C4D3',
    flexShrink: 0,
  },

  // Progress bar + windowed step labels
  ocTrackWrap: {
    flexDirection: 'column',
    gap: 8,
    alignSelf: 'stretch',
  },
  ocTrackBg: {
    height: 8,
    backgroundColor: '#DEF4F7',
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'stretch',
    position: 'relative' as any,
  },
  ocTrackFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#07073D',
  },
  ocTrackFillMobile: {
    position: 'absolute' as any,
    top: 0, left: 0,
  },
  // Desktop: all 5 labels visible
  ocStepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // @ts-ignore
    display: undefined, // visible by default on desktop
  },
  // Mobile: windowed 3 labels — hidden on desktop via media query workaround
  ocStepRowMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // @ts-ignore
    display: 'none',
  },
  ocStepLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 10, lineHeight: 12, fontWeight: '400',
    color: '#C0C4D3',
    flex: 1,
    textAlign: 'center',
  },
  ocStepLabelDone: {
    color: '#9CA3AF',
  },
  ocStepLabelActive: {
    fontWeight: '700',
    color: '#07073D',
  },
  ocStepLabelMobileItem: {
    flex: 1,
    // @ts-ignore
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  ocStepLabelMobileFade: {
    color: '#C0C4D3',
  },
  ocStepLabelMobileLeft: {
    textAlign: 'left',
  },
  ocStepLabelMobileRight: {
    textAlign: 'right',
  },
  ocStepLabelActiveMobile: {
    textAlign: 'center',
  },

  // Bottom info panel — overlaps top panel by 12px
  ocBottom: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E7ED',
    backgroundColor: '#E9EEFA',
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 12,
    alignSelf: 'stretch' as any,
    marginTop: -12,
    // @ts-ignore
    zIndex: 0,
  },

  ocCalloutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
    alignSelf: 'stretch',
  },
  ocCalloutLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ocCalloutIconWrap: {
    width: 20, height: 20,
    borderRadius: 360,
    backgroundColor: '#0E2B62',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    flexShrink: 0,
    marginTop: 3,
  },
  ocCalloutIconImg: {
    width: 12, height: 12,
    tintColor: '#fff',
  },
  ocCalloutTextWrap: {
    flex: 1,
    flexDirection: 'column',
  },
  ocCalloutHeadline: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, lineHeight: 22, fontWeight: '600',
    color: '#07073D',
  },
  ocCalloutBody: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12, lineHeight: 20, fontWeight: '400',
    color: '#07073D',
  },

  // CTA button — desktop inline (hug content), mobile full width below text
  ocCtaDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 24,
    paddingRight: 16,
    borderRadius: 360,
    borderWidth: 1,
    borderColor: '#07073D',
    backgroundColor: '#fff',
    flexShrink: 0,
    alignSelf: 'center',
  },
  ocCtaMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 24,
    paddingRight: 16,
    borderRadius: 360,
    borderWidth: 1,
    borderColor: '#07073D',
    backgroundColor: '#fff',
    alignSelf: 'stretch' as any,
  },
  ocCtaText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16, lineHeight: 16, fontWeight: '600',
    color: '#07073D',
    textAlign: 'center',
  },
  ocCtaIcon: {
    width: 16, height: 16,
    tintColor: '#07073D',
  },

  // Condition grid
  conditionGrid: {
    flexDirection: 'row',
    // @ts-ignore
    flexWrap: 'wrap',
    gap: 16,
  },
  conditionCard: {
    // @ts-ignore
    width: 'calc(50% - 8px)',
    alignSelf: 'stretch',
    borderWidth: 1, borderColor: '#E6E7ED',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'column',
    alignItems: 'flex-start',
    // @ts-ignore
    cursor: 'pointer',
  },
  conditionImgWrap: {
    height: 160,
    alignSelf: 'stretch',
    // @ts-ignore
    position: 'relative',
    overflow: 'hidden',
  },
  conditionImg: {
    position: 'absolute' as any,
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%' as any,
    height: '100%' as any,
  },
  conditionImgTitle: {
    position: 'absolute' as any,
    bottom: 16,
    left: 16,
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 20, lineHeight: 28,
    color: C.textPrimary,
  },
  conditionImgTitleBold: {
    fontWeight: '700',
  },
  conditionTextArea: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: C.white,
  },
  conditionLabel: {
    flex: 1,
    fontFamily: "'Inter', sans-serif",
    fontSize: 16, fontWeight: '600',
    lineHeight: 24,
    color: C.textPrimary,
  },
  conditionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 8,
    borderRadius: 40,
    backgroundColor: C.textPrimary,
  },
  conditionBtnText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12, fontWeight: '600',
    lineHeight: 12,
    color: '#FFF',
  },
  conditionBtnIcon: {
    width: 12, height: 12,
    tintColor: '#FFF',
  },
  conditionIconBtn: {
    width: 24, height: 24,
    borderRadius: 360,
    backgroundColor: C.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  conditionIconBtnIcon: {
    width: 16, height: 16,
    flexShrink: 0,
    tintColor: '#FFF',
  },

  // My details card
  detailsCard: {
    backgroundColor: C.white,
    borderWidth: 1, borderColor: C.borderContainer,
    borderRadius: 8, padding: 20, gap: 12,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', gap: 8,
  },
  detailLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, color: C.textTertiary,
    flexShrink: 0,
  },
  detailValue: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, color: C.textPrimary,
    textAlign: 'right',
  },
});
