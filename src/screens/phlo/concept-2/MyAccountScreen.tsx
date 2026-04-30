import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, LayoutChangeEvent } from 'react-native';

// ─── CSS injection ──────────────────────────────────────────────────────────
const _css = `
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap');

[data-c2viewall]:hover { opacity: 0.75 !important; }
[data-c2viewprog]:hover { opacity: 0.8 !important; }
[data-c2support]:hover { opacity: 0.8 !important; }
[data-c2neworder]:hover { opacity: 0.88 !important; }

@keyframes c2fadein {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
[data-c2card] { animation: c2fadein 0.3s ease 0.05s both; }

/* ── Desktop / Mobile layout toggle ── */
[data-c2desktop] { display: flex !important; }
[data-c2mobile]  { display: none  !important; }

@media (max-width: 700px) {
  [data-c2desktop] { display: none !important; }
  [data-c2mobile]  { display: flex !important; }
}


/* ── Mobile banner: stack vertically ── */
@media (max-width: 700px) {
  [data-c2bannerwrap] { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
  [data-c2bannerbtn]  { align-self: stretch !important; justify-content: center !important; }
}

/* ── Mobile condition cards: full-width stack ── */
@media (max-width: 700px) {
  [data-c2condcard] { width: 100% !important; }
}
`;

if (typeof document !== 'undefined') {
  let el = document.getElementById('c2-main-css');
  if (!el) { el = document.createElement('style'); el.id = 'c2-main-css'; document.head.appendChild(el); }
  el.textContent = _css;
}

import {
  PhloLayout,
  ContentContainer,
  PhloButton,
  navigate,
  C,
} from '../PhloLayout';
import { mockOrders } from './mockData';

// ─── Types ──────────────────────────────────────────────────────────────────

type StepStatus = 'done' | 'active' | 'upcoming';

interface Step {
  label: string;
  sublabel?: string;
  status: StepStatus;
  dotIcon?: any;
}

type BannerVariant = 'warning' | 'error' | 'success' | 'info' | 'support';

interface Banner {
  variant: BannerVariant;
  icon: any;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaIcon?: any;
}

interface OrderCfg {
  steps: Step[];
  badgeLabel: string;
  badgeBg: string;
  badgeColor: string;
  statusLine: string;
  statusBold: string;
  bullets: { icon: any; text: string }[];
  banner?: Banner;
  illustration: any;
}

// ─── Config per status ──────────────────────────────────────────────────────

const IC = {
  clock:        require('../../../theme/icons/clock.svg'),
  verified:     require('../../../theme/icons/verified-user.svg'),
  checkCircle:  require('../../../theme/icons/check-circle-outline.svg'),
  infoOutline:  require('../../../theme/icons/info-outline.svg'),
  warning:      require('../../../theme/icons/warning-filled.svg'),
  arrow:        require('../../../theme/icons/arrow-outward.svg'),
  arrowFwd:     require('../../../theme/icons/arrow-forward.svg'),
  lock:         require('../../../theme/icons/lock.svg'),
  medBag:       require('../../../theme/icons/package-box.svg'),
  search:       require('../../../theme/icons/search.svg'),
  truck:        require('../../../theme/icons/truck-fast.svg'),
  send:         require('../../../theme/icons/send.svg'),
};

const STATE_IMAGES = {
  orderPlaced:        require('../../../images/states/order-placed.png'),
  inReview:           require('../../../images/states/in-review.png'),
  awaitingPhotoId:    require('../../../images/states/awaiting-photo-id.png'),
  onHold:             require('../../../images/states/on-hold.png'),
  paymentFailed:      require('../../../images/states/payment-failed.png'),
  informationUploaded: require('../../../images/states/information-uploaded.png'),
  preparing:          require('../../../images/states/preparing.png'),
  dispatched:         require('../../../images/states/dispatched.png'),
  delivered:          require('../../../images/states/delivered.png'),
  rejected:           require('../../../images/states/rejected.png'),
  cancelled:          require('../../../images/states/cancelled.png'),
};

function placedLabel(dateStr: string): string {
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const [d, mon, y] = dateStr.split(' ');
  const date = new Date(Number(y), months[mon], Number(d));
  const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diff === 0) return 'Placed today';
  if (diff === 1) return 'Placed 1 day ago';
  if (diff <= 3) return `Placed ${diff} days ago`;
  return `Placed ${dateStr}`;
}

function getOrderCfg(order: typeof mockOrders[number]): OrderCfg {
  const STEP_DOT_ICONS = [
    IC.medBag,
    IC.search,
    IC.checkCircle,
    IC.arrow,
    IC.checkCircle,
  ];

  const base5Steps = (activeIdx: number, sublabels: (string | undefined)[]): Step[] =>
    ['Order placed', 'Clinical review', 'Preparing', 'On its way', 'Delivered'].map((label, i) => ({
      label,
      sublabel: sublabels[i],
      status: i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'upcoming',
      dotIcon: STEP_DOT_ICONS[i],
    }));

  switch (order.status) {
    case 'ORDER_PLACED':
      return {
        steps: base5Steps(0, [
          'Your order has been placed and will be reviewed by our clinical team soon.',
          'A prescriber will review your order.',
          "We'll prepare your medication once approved.",
          'Dispatched by courier.',
          'Estimated delivery TBC.',
        ]),
        badgeLabel: 'Order placed',
        badgeBg: '#FEF3C7',
        badgeColor: '#D97706',
        statusLine: 'Your order has been',
        statusBold: 'Successfully placed',
        bullets: [
          { icon: IC.infoOutline, text: 'We need your photos to start the review' },
          { icon: IC.clock,       text: 'Upload now to speed up your approval' },
          { icon: IC.verified,    text: 'A prescriber will then review your details' },
        ],
        illustration: STATE_IMAGES.orderPlaced,
        banner: {
          variant: 'info',
          icon: IC.infoOutline,
          title: 'Get approved sooner',
          body: 'Upload your supporting photos so we can safely prescribe your treatment.',
          ctaLabel: 'Take photos',
          ctaIcon: IC.arrowFwd,
        },
      };

    case 'IN_REVIEW_NO_ACTION':
    case 'PRESCRIBER_REVIEW':
      return {
        steps: base5Steps(1, [
          'Your order has been placed and will be reviewed by our clinical team soon.',
          'A prescriber will review your order.',
          "We'll prepare your medication once approved.",
          'Dispatched by courier.',
          `Estimated delivery ${order.deliveryDate ?? 'TBC'}.`,
        ]),
        badgeLabel: 'In review',
        badgeBg: '#EFF6FF',
        badgeColor: '#3B82F6',
        statusLine: 'Your order is being',
        statusBold: 'Clinically reviewed',
        bullets: [
          { icon: IC.clock,       text: 'This usually takes 24-48 hours' },
          { icon: IC.verified,    text: 'Our prescribers carefully review your information' },
          { icon: IC.checkCircle, text: "You don't need to do anything right now" },
        ],
        illustration: STATE_IMAGES.inReview,
        banner: {
          variant: 'support',
          icon: IC.verified,
          title: "We're here if you need us",
          body: 'You can contact our Patient Care Team if you have any questions.',
          ctaLabel: 'Contact support',
          ctaIcon: IC.arrow,
        },
      };

    case 'IN_REVIEW_EVIDENCE_REQUIRED':
      return {
        steps: base5Steps(1, [
          'Your order has been placed.',
          'Our team has requested more information.',
          "We'll prepare your medication once approved",
          'Dispatched by courier',
          `Estimated delivery —`,
        ]),
        badgeLabel: 'Reply needed',
        badgeBg: '#FEF3C7',
        badgeColor: '#D97706',
        statusLine: 'Our team has requested',
        statusBold: 'More information',
        bullets: [
          { icon: IC.infoOutline, text: 'Our team requires more information for your order' },
          { icon: IC.clock,       text: 'Responding sooner means faster approval' },
          { icon: IC.lock,        text: 'Your response is secure and confidential' },
        ],
        illustration: STATE_IMAGES.awaitingPhotoId,
        banner: {
          variant: 'warning',
          icon: IC.infoOutline,
          title: 'Please check your email',
          body: 'Our team has been in touch with details of what information is required.',
        },
      };

    case 'IN_REVIEW_UPLOADED':
      return {
        steps: base5Steps(1, [
          'Your order has been placed.',
          'Details received — awaiting prescriber review.',
          "We'll prepare your medication once approved",
          'Dispatched by courier',
          `Estimated delivery —`,
        ]),
        badgeLabel: 'In review',
        badgeBg: '#EFF6FF',
        badgeColor: '#3B82F6',
        statusLine: 'Your details have been',
        statusBold: 'Received',
        bullets: [
          { icon: IC.checkCircle, text: "We've got everything we need" },
          { icon: IC.clock,       text: 'A prescriber will review your info soon' },
          { icon: IC.verified,    text: "You don't need to do anything right now" },
        ],
        illustration: STATE_IMAGES.informationUploaded,
        banner: {
          variant: 'success',
          icon: IC.checkCircle,
          title: "We've got your uploaded information",
          body: 'A prescriber will review your information soon.',
        },
      };

    case 'ON_HOLD':
      return {
        steps: base5Steps(0, [
          'Your order is on hold — upload photos to continue.',
          'A prescriber will review your order.',
          "We'll prepare your medication once approved.",
          'Dispatched by courier.',
          'Estimated delivery TBC.',
        ]),
        badgeLabel: 'On hold',
        badgeBg: '#FEF3C7',
        badgeColor: '#D97706',
        statusLine: 'Your order is',
        statusBold: 'On hold',
        bullets: [
          { icon: IC.infoOutline, text: 'Upload your photos to get approved sooner' },
          { icon: IC.clock,       text: 'This usually takes just a few minutes' },
          { icon: IC.lock,        text: 'Your photos are safe and secure' },
        ],
        illustration: STATE_IMAGES.onHold,
        banner: {
          variant: 'warning',
          icon: IC.infoOutline,
          title: 'We need a couple of things from you',
          body: 'Upload your photos so prescribers can safely review your order.',
          ctaLabel: 'Take photos',
          ctaIcon: IC.arrowFwd,
        },
      };

    case 'PAYMENT_FAILED':
      return {
        steps: base5Steps(0, [
          "Payment didn't go through — please retry.",
          'A prescriber will review your order.',
          "We'll prepare your medication once approved.",
          'Dispatched by courier.',
          'Estimated delivery TBC.',
        ]),
        badgeLabel: 'Payment failed',
        badgeBg: '#FEF2F2',
        badgeColor: '#DC2626',
        statusLine: 'Your payment',
        statusBold: 'Failed',
        bullets: [
          { icon: IC.warning,     text: "We couldn't take payment for your order" },
          { icon: IC.infoOutline, text: 'Complete payment to keep your order moving' },
          { icon: IC.lock,        text: 'Your card details are secure' },
        ],
        illustration: STATE_IMAGES.paymentFailed,
        banner: {
          variant: 'error',
          icon: IC.warning,
          title: "Payment didn't go through",
          body: "We weren't able to take payment for your order. Please complete payment for your order to be processed.",
          ctaLabel: 'Complete payment',
          ctaIcon: IC.arrowFwd,
        },
      };

    case 'PREPARING_YOUR_ORDER':
      return {
        steps: base5Steps(2, [
          'Order placed.',
          'Approved by your prescriber.',
          'Being prepared for dispatch.',
          'Dispatched by courier',
          `Estimated delivery —`,
        ]),
        badgeLabel: 'Approved',
        badgeBg: '#DCFCE7',
        badgeColor: '#16A34A',
        statusLine: 'Your order is being',
        statusBold: 'Prepared',
        bullets: [
          { icon: IC.checkCircle, text: 'Your prescriber has approved your treatment' },
          { icon: IC.infoOutline, text: "We're preparing your medication for dispatch" },
          { icon: IC.clock,       text: 'Estimated dispatch in 1–2 working days' },
        ],
        illustration: STATE_IMAGES.preparing,
        banner: {
          variant: 'success',
          icon: IC.checkCircle,
          title: 'We are preparing your order',
          body: 'Your order has been approved and will be on its way shortly.',
        },
      };

    case 'DISPATCHED':
      return {
        steps: base5Steps(3, [
          'Order placed.',
          'Approved.',
          'Prepared.',
          `Dispatched via Royal Mail Tracked 24`,
          `Estimated delivery ${order.deliveryDate ?? '—'}`,
        ]),
        badgeLabel: 'On its way',
        badgeBg: '#DCFCE7',
        badgeColor: '#16A34A',
        statusLine: 'Your order is',
        statusBold: 'On its way',
        bullets: [
          { icon: IC.truck,       text: 'Sent with Royal Mail Tracked 24' },
          { icon: IC.clock,       text: `Estimated delivery: ${order.deliveryDate ?? '—'}` },
          { icon: IC.send,        text: "You'll receive a delivery notification" },
        ],
        illustration: STATE_IMAGES.dispatched,
        banner: {
          variant: 'info',
          icon: IC.truck,
          title: 'An update on your order',
          body: 'Royal Mail has your parcel now and can be tracked via their website.',
          ctaLabel: 'Track your order',
          ctaIcon: IC.arrow,
        },
      };

    case 'DELIVERED':
      return {
        steps: base5Steps(4, [
          'Order placed.', 'Approved.', 'Prepared.', 'Dispatched.',
          `Delivered ${order.deliveryDate ?? '—'}`,
        ]),
        badgeLabel: 'Delivered',
        badgeBg: '#DCFCE7',
        badgeColor: '#16A34A',
        statusLine: 'Your order has been',
        statusBold: 'Delivered',
        bullets: [
          { icon: IC.checkCircle, text: `Delivered ${order.deliveryDate ?? '—'}` },
          { icon: IC.arrowFwd,    text: 'Running low? Reorder from 25 Jun 2025' },
          { icon: IC.infoOutline, text: 'Contact support if you have any issues' },
        ],
        illustration: STATE_IMAGES.delivered,
        banner: {
          variant: 'support',
          icon: IC.verified,
          title: "We're here if you need us",
          body: 'You can contact our Patient Care Team if you have any questions.',
          ctaLabel: 'Contact support',
          ctaIcon: IC.arrow,
        },
      };

    case 'DELIVERED_CONFIRMED':
    case 'REJECTED':
    case 'CANCELLED':
    default:
      return {
        steps: [],
        badgeLabel: order.status === 'REJECTED' ? 'Not approved' : order.status === 'CANCELLED' ? 'Cancelled' : 'Delivered',
        badgeBg: order.status === 'REJECTED' ? '#FEF2F2' : order.status === 'CANCELLED' ? '#F3F4F6' : '#DCFCE7',
        badgeColor: order.status === 'REJECTED' ? '#DC2626' : order.status === 'CANCELLED' ? '#6B7280' : '#16A34A',
        statusLine: '',
        statusBold: '',
        bullets: [],
        illustration: order.status === 'REJECTED' ? STATE_IMAGES.rejected : order.status === 'CANCELLED' ? STATE_IMAGES.cancelled : STATE_IMAGES.delivered,
      };
  }
}

// ─── Banner tokens ───────────────────────────────────────────────────────────

const BANNER_TOKENS: Record<BannerVariant, {
  bg: string; border: string;
  iconFrameBg: string; iconColor: string;
  titleColor: string; bodyColor: string;
  btnBg: string; btnBorder: string; btnTextColor: string;
}> = {
  warning: {
    bg: '#FFFBEB', border: '#FDE68A',
    iconFrameBg: '#FEF3C7', iconColor: '#D97706',
    titleColor: '#92400E', bodyColor: '#78350F',
    btnBg: '#FFFFFF', btnBorder: '#92400E', btnTextColor: '#92400E',
  },
  error: {
    bg: '#FEF2F2', border: '#FECACA',
    iconFrameBg: '#FEE2E2', iconColor: '#DC2626',
    titleColor: '#991B1B', bodyColor: '#7F1D1D',
    btnBg: '#FFFFFF', btnBorder: '#991B1B', btnTextColor: '#991B1B',
  },
  success: {
    bg: '#F0FDF4', border: '#BBF7D0',
    iconFrameBg: '#DCFCE7', iconColor: '#16A34A',
    titleColor: '#14532D', bodyColor: '#166534',
    btnBg: '#FFFFFF', btnBorder: '#14532D', btnTextColor: '#14532D',
  },
  info: {
    bg: '#EFF6FF', border: '#BFDBFE',
    iconFrameBg: '#DBEAFE', iconColor: '#2563EB',
    titleColor: '#1E3A8A', bodyColor: '#1E40AF',
    btnBg: '#FFFFFF', btnBorder: '#1E3A8A', btnTextColor: '#1E3A8A',
  },
  support: {
    bg: '#E9EEFA', border: '#C7D2F8',
    iconFrameBg: '#C7D2F8', iconColor: '#07073D',
    titleColor: '#07073D', bodyColor: '#2F345F',
    btnBg: '#FFFFFF', btnBorder: '#07073D', btnTextColor: '#07073D',
  },
};

// ─── OrderCard ──────────────────────────────────────────────────────────────

export function OrderCard({ order, cardIndex, isPast }: {
  order: typeof mockOrders[number];
  cardIndex?: number;
  isPast?: boolean;
}) {
  const cfg = getOrderCfg(order);
  const hasSteps = cfg.steps.length > 0;
  const hasBullets = cfg.bullets.length > 0;

  // Track dot Y positions to draw a precise connector line
  const [rowTops, setRowTops] = useState<Record<number, number>>({});
  const handleRowLayout = useCallback((i: number, e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    setRowTops(prev => ({ ...prev, [i]: y }));
  }, []);

  const firstRowY = rowTops[0];
  const lastRowY  = rowTops[cfg.steps.length - 1];
  // dot centre = rowY + step paddingVertical(12) + half dot height(12) = rowY + 24
  const lineTop    = firstRowY != null ? firstRowY + 24 : undefined;
  const lineBottom = lastRowY  != null ? lastRowY  + 24 : undefined;
  return (
    <View
      style={[s.card, isPast && s.cardPast]}
      // @ts-ignore
      dataSet={{ c2card: String(cardIndex ?? 0) } as any}
    >
      {/* ── Header ── */}
      <View style={s.cardHeader}>
        <View style={s.orderInfo}>
          <View style={s.iconContainer}>
            <Image
              source={require('../../../theme/icons/package-box.svg')}
              style={s.packageIcon as any}
            />
          </View>
          <View style={s.orderDetails}>
            <Text style={s.orderNumber}>{order.treatmentName}</Text>
            <View style={s.orderDateInfo}>
              <Text style={s.orderDateText}>{order.supply}</Text>
              <View style={s.dateSeparatorDot} />
              <Text style={s.orderDateText}>{placedLabel(order.orderedDate)}</Text>
            </View>
          </View>
        </View>
        <Image
          source={require('../../../theme/icons/chevron-right.svg')}
          style={s.headerChevron as any}
        />
      </View>

      {/* ── Header divider ── */}
      <View style={s.headerDivider} />

      {/* ── Content: Desktop ── */}
      {hasSteps && (
        // @ts-ignore
        <View style={s.content} dataSet={{ c2desktop: '1' } as any}>

          {/* Left: Steps */}
          <View style={s.stepsContainer}>
            {/* Measured connector line: first dot centre → last dot centre */}
            {lineTop != null && lineBottom != null && (
              <View style={[s.stepTrackLine, { top: lineTop, height: lineBottom - lineTop }]} />
            )}
            {cfg.steps.map((step, i) => (
              <View key={i} style={s.step} onLayout={(e) => handleRowLayout(i, e)}>
                {/* Dot */}
                <View style={s.stepDotCol}>
                  <View style={[
                    s.stepIconWrapper,
                    step.status === 'done'     && s.stepIconDone,
                    step.status === 'active'   && s.stepIconActive,
                    step.status === 'upcoming' && s.stepIconUpcoming,
                  ]}>
                    {step.status === 'done' && (
                      <Image
                        source={require('../../../theme/icons/check-bold.svg')}
                        style={[s.stepIcon, s.stepIconDoneColor as any]}
                      />
                    )}
                    {step.status === 'active' && step.dotIcon && (
                      <Image source={step.dotIcon} style={[s.stepIcon, s.stepIconWhite as any]} />
                    )}
                  </View>
                </View>
                {/* Text */}
                <View style={s.stepDetails}>
                  <Text style={[
                    s.stepLabel,
                    step.status === 'active'   && s.stepLabelActive,
                    step.status === 'upcoming' && s.stepLabelUpcoming,
                  ]}>
                    {step.label}
                  </Text>
                  {step.sublabel && (
                    <Text style={[
                      s.stepSublabel,
                      step.status === 'active' && s.stepSublabelActive,
                    ]}>
                      {step.sublabel}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Vertical separator */}
          <View style={s.verticalSepWrap}>
            <View style={s.verticalSep} />
          </View>

          {/* Right: Status panel */}
          <View style={s.statusPanel}>
            <Image
              source={cfg.illustration}
              style={s.illustration as any}
              resizeMode="contain"
            />
            <View style={s.statusBody}>
              <View style={s.statusTexts}>
                <Text style={s.statusLine}>{cfg.statusLine}</Text>
                <Text style={s.statusBold}>{cfg.statusBold}</Text>
              </View>
              <View style={s.statusDivider} />
              <View style={s.statusDescriptionInner}>
                {cfg.bullets.map((b, i) => (
                  <View key={i} style={s.statusLineItem}>
                    <View style={s.statusIconContainer}>
                      <Image source={b.icon} style={s.statusIcon as any} />
                    </View>
                    <Text style={s.statusText}>{b.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

        </View>
      )}

      {/* ── Content: Mobile ── */}
      {hasSteps && (() => {
        const activeIdx = cfg.steps.findIndex(s => s.status === 'active');
        const total = cfg.steps.length;
        // Sliding window of 3 steps centred on active
        const winStart = Math.max(0, Math.min(activeIdx - 1, total - 3));
        const visSteps = cfg.steps.slice(winStart, winStart + 3);
        const activeInWin = activeIdx - winStart; // 0-2
        const trackPos = visSteps.length > 1 ? activeInWin / (visSteps.length - 1) : 0;

        return (
          // @ts-ignore
          <View style={s.mobileContent} dataSet={{ c2mobile: '1' } as any}>

            {/* Illustration + status text + divider + bullets */}
            <View style={s.mobileStatusRow}>
              <Image source={cfg.illustration} style={s.mobileIllustration as any} resizeMode="contain" />
              {/* This centred column lets the divider stretch to natural text/bullet width */}
              <View style={s.mobileStatusBody}>
                <View style={s.mobileStatusTexts}>
                  <Text style={s.mobileStatusLine}>{cfg.statusLine}</Text>
                  <Text style={s.mobileStatusBold}>{cfg.statusBold}</Text>
                </View>
                {cfg.bullets.length > 0 && (
                  <>
                    <View style={s.mobileStatusDivider} />
                    <View style={s.mobileBullets}>
                      {cfg.bullets.map((b, i) => (
                        <View key={i} style={s.mobileBulletRow}>
                          <Image source={b.icon} style={s.mobileBulletIcon as any} />
                          <Text style={s.mobileBulletText}>{b.text}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Horizontal 3-step progress bar */}
            {(({ children }: { children: React.ReactNode }) => children)({
              children: React.createElement(
                View,
                { style: s.mobileProgressWrap },
                React.createElement(View, { style: s.mobileTrackBg }),
                React.createElement(View, { style: [s.mobileTrackFill, { width: `${trackPos * 100}%` as any }] }),
                React.createElement(
                  View,
                  { style: s.mobileStepRow },
                  ...visSteps.map((step, wi) => {
                    const isActive = step.status === 'active';
                    const isDone   = step.status === 'done';
                    return React.createElement(
                      View,
                      { key: wi, style: s.mobileStepNode },
                      React.createElement(
                        View,
                        { style: [s.mobileStepDot, isDone ? s.mobileStepDotDone : isActive ? s.mobileStepDotActive : s.mobileStepDotUpcoming] },
                        isDone && React.createElement(Image, { source: require('../../../theme/icons/check-bold.svg'), style: [s.mobileStepDotIcon, { tintColor: '#989EB5' } as any] }),
                        isActive && step.dotIcon && React.createElement(Image, { source: step.dotIcon, style: [s.mobileStepDotIcon, { tintColor: '#FFFFFF' } as any] }),
                      ),
                      React.createElement(
                        Text,
                        { style: [s.mobileStepLabel, isActive ? s.mobileStepLabelActive : !isDone ? s.mobileStepLabelUpcoming : undefined], numberOfLines: 2 },
                        step.label,
                      ),
                    );
                  }),
                ),
              ),
            })}
          </View>
        );
      })()}

      {/* ── Banner ── */}
      {!isPast && cfg.banner && (() => {
        const b = cfg.banner!;
        const t = BANNER_TOKENS[b.variant];
        return (
          <View style={s.footer}>
            {/* @ts-ignore */}
            <View style={[s.bannerWrap, { backgroundColor: t.bg }]} dataSet={{ c2bannerwrap: '1' } as any}>
              <View style={s.bannerLeft}>
                <View style={s.bannerText}>
                  <Text style={s.bannerTitle}>{b.title}</Text>
                  <Text style={s.bannerBody}>{b.body}</Text>
                </View>
              </View>
              {b.ctaLabel && (
                // @ts-ignore
                <TouchableOpacity
                  style={s.bannerBtn}
                  activeOpacity={0.85}
                  onPress={() => {}}
                  // @ts-ignore
                  dataSet={{ c2bannerbtn: '1' } as any}
                >
                  <Text style={s.bannerBtnText}>{b.ctaLabel}</Text>
                  {b.ctaIcon && (
                    <Image source={b.ctaIcon} style={s.bannerBtnIcon as any} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })()}
    </View>
  );
}

// ─── Page-level constants ────────────────────────────────────────────────────

const patient = { firstName: 'Sarah', email: 'sarah.mitchell@example.com' };
const lastWeightKg = 82.0;

const newOrderConditions = [
  { id: 'weight-loss',    bold: 'Weight',  rest: ' loss',   label: 'Weight loss service',                                           image: require('../../../images/weight-loss-img.jpg'),    pippStyle: true  },
  { id: 'general-health', bold: 'General', rest: ' health', label: 'Acid reflux, Acne, Hay fever and Migraines',                    image: require('../../../images/general-health-img.jpg'), pippStyle: false },
  { id: 'female-health',  bold: 'Female',  rest: ' health', label: 'Daily and Emergency contraception, Period delay and Menopause', image: require('../../../images/female-health-img.jpg'),  pippStyle: false },
  { id: 'male-health',    bold: 'Male',    rest: ' health', label: 'Erectile dysfunction, Hair loss and Premature ejaculation',     image: require('../../../images/male-health-img.jpg'),    pippStyle: false },
];

const detailsRows = [
  { label: 'Name',   value: 'Sarah Mitchell' },
  { label: 'Email',  value: 'sarah.mitchell@example.com' },
  { label: 'Mobile', value: '+44 7700 900123' },
];

// ─── MyAccountScreen ─────────────────────────────────────────────────────────

export default function MyAccountScreen() {
  return (
    <PhloLayout>
      <ContentContainer>
        <View style={s.mainContent}>

          {/* Header */}
          <View style={s.header}>
            <Text style={s.headerSub}>Welcome back,</Text>
            <Text style={s.headerName}>{patient.firstName}</Text>
          </View>

          {/* Weight hub widget */}
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
            <TouchableOpacity style={s.widgetBtn} onPress={() => navigate('/phlo/my-account/weight-loss-hub')}>
              <Text style={s.widgetBtnText}>View progress</Text>
            </TouchableOpacity>
          </View>

          {/* Active orders */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Active orders</Text>
              <TouchableOpacity style={s.sectionViewAll} onPress={() => navigate('/phlo/concept-2/my-account/orders')}>
                <Text style={s.sectionViewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
            <OrderCard order={mockOrders[0]} cardIndex={0} />
          </View>

          {/* Start a new order */}
          <View style={s.section}>
            <Text style={[s.sectionTitle, { marginBottom: 16 }]}>Start a new order</Text>
            <View style={s.conditionGrid}>
              {newOrderConditions.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={s.conditionCard}
                  onPress={() => navigate(`/phlo/getting-started?condition=${c.id}`)}
                  activeOpacity={0.8}
                  // @ts-ignore
                  dataSet={{ c2condcard: '1' } as any}
                >
                  <View style={s.conditionImgWrap}>
                    <Image source={c.image} style={s.conditionImg as any} resizeMode="cover" />
                  </View>
                  <View style={s.conditionTextArea}>
                    <Text style={s.conditionLabel}>{c.label}</Text>
                    {c.pippStyle ? (
                      <View style={s.conditionBtn}>
                        <Text style={s.conditionBtnText}>Start order</Text>
                        <Image source={require('../../../theme/icons/arrow-forward.svg')} style={s.conditionBtnIcon as any} />
                      </View>
                    ) : (
                      <View style={s.conditionIconBtn}>
                        <Image source={require('../../../theme/icons/arrow-forward.svg')} style={s.conditionIconBtnIcon as any} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* My details */}
          <View style={[s.section, s.sectionLast]}>
            <Text style={[s.sectionTitle, { marginBottom: 16 }]}>My details</Text>
            <View style={s.detailsCard}>
              {detailsRows.map((row) => (
                <View key={row.label} style={s.detailRow}>
                  <Text style={s.detailLabel}>{row.label}</Text>
                  <Text style={s.detailValue}>{row.value}</Text>
                </View>
              ))}
              <PhloButton label="Edit details" variant="text-btn" onPress={() => navigate('/phlo/my-account/details')} fullWidth={false} />
            </View>
          </View>

        </View>
        <View style={{ height: 40 }} />
      </ContentContainer>
    </PhloLayout>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const TEAL = '#086A74';
const CARD_BORDER = '#E5E7EB';

const s = StyleSheet.create({
  header: { flexDirection: 'column', alignItems: 'flex-start' },
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
  mainContent: { flexDirection: 'column', alignItems: 'stretch', gap: 48 },

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
  widgetLeft: { flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 16 },
  widgetTitle: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 28, lineHeight: 36, fontWeight: '600',
    color: '#fff',
  },
  widgetStats: { flexDirection: 'row', alignItems: 'center', gap: 12, width: 303 },
  widgetStat: { flexDirection: 'column', flex: 1 },
  widgetStatLabel: { fontFamily: "'Inter', sans-serif", fontSize: 12, lineHeight: 20, fontWeight: '400', color: '#fff' },
  widgetStatNum:   { fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 24, fontWeight: '600', color: '#fff' },
  widgetBtn: {
    height: 48, paddingVertical: 16, paddingHorizontal: 24,
    justifyContent: 'center', alignItems: 'center', gap: 8,
    flexDirection: 'row', borderWidth: 1, borderColor: '#fff', borderRadius: 360,
  },
  widgetBtnText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16, fontWeight: '600', lineHeight: 16,
    color: '#fff', textAlign: 'center',
  },

  section: {},
  sectionLast: {},
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 32,
    alignSelf: 'stretch', marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 24, lineHeight: 32, fontWeight: '600',
    color: C.textPrimary,
    // @ts-ignore
    whiteSpace: 'nowrap',
  },
  sectionViewAll: {
    height: 48, justifyContent: 'center', alignItems: 'center',
    gap: 8, borderRadius: 4, marginLeft: 'auto' as any,
  },
  sectionViewAllText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16, fontWeight: '600', lineHeight: 16,
    color: C.primaryMain, textAlign: 'center',
  },

  detailsCard: {
    backgroundColor: C.white,
    borderWidth: 1, borderColor: C.borderContainer,
    borderRadius: 8, padding: 20, gap: 12,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  detailLabel: { fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.textTertiary, flexShrink: 0 },
  detailValue: { fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.textPrimary, textAlign: 'right' },

  conditionGrid: { flexDirection: 'row', // @ts-ignore
    flexWrap: 'wrap', gap: 16 },
  conditionCard: {
    // @ts-ignore
    width: 'calc(50% - 8px)',
    alignSelf: 'stretch',
    borderWidth: 1, borderColor: '#E6E7ED',
    borderRadius: 8, overflow: 'hidden',
    flexDirection: 'column', alignItems: 'flex-start',
    // @ts-ignore
    cursor: 'pointer',
  },
  conditionImgWrap: { height: 160, alignSelf: 'stretch', // @ts-ignore
    position: 'relative', overflow: 'hidden' },
  conditionImg: { position: 'absolute' as any, top: 0, left: 0, right: 0, bottom: 0, width: '100%' as any, height: '100%' as any },
  conditionTextArea: {
    flex: 1, alignSelf: 'stretch',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    gap: 16, padding: 16, backgroundColor: C.white,
  },
  conditionLabel: { flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: '600', lineHeight: 24, color: C.textPrimary },
  conditionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 8,
    borderRadius: 40, backgroundColor: C.textPrimary,
  },
  conditionBtnText: { fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: '600', lineHeight: 12, color: '#FFF' },
  conditionBtnIcon: { width: 12, height: 12, tintColor: '#FFF' } as any,
  conditionIconBtn: { width: 24, height: 24, borderRadius: 360, backgroundColor: C.textPrimary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  conditionIconBtnIcon: { width: 16, height: 16, flexShrink: 0, tintColor: '#FFF' } as any,

  // ── Order card ──────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E7ED',
    overflow: 'hidden' as any,
    marginBottom: 24,
  },
  cardPast: { opacity: 0.72 },

  // Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    flexShrink: 1,
  },
  iconContainer: {
    backgroundColor: '#F1F8FC',
    padding: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  packageIcon: { width: 32, height: 32, tintColor: '#086A74' } as any,
  orderDetails: {
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    flexShrink: 1,
  },
  orderNumber: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#07073D',
  },
  orderDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderDateText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#575D84',
  },
  dateSeparatorDot: {
    width: 4,
    height: 4,
    borderRadius: 10,
    backgroundColor: '#C0C4D3',
  },
  badgeAndChevron: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexShrink: 0,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
  },
  badgeText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 22,
  },
  badgeIcon: { width: 13, height: 13 } as any,
  headerChevron: { width: 24, height: 24, tintColor: '#989EB5' } as any,
  headerDivider: {
    height: 1,
    backgroundColor: '#E6E7ED',
  },

  // Content row (steps + separator + status panel)
  content: {
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden' as any,
    gap: 16,
  },

  // Steps column
  stepsContainer: {
    flex: 40,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    position: 'relative',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  stepDotCol: {
    alignItems: 'center',
    flexShrink: 0,
    width: 24,
  },
  stepTrackLine: {
    position: 'absolute',
    left: 39, // paddingHorizontal(16) + step paddingHorizontal(12) + dot centre(12) - half line(1) = 39
    width: 1,
    backgroundColor: '#E6E7ED',
    zIndex: 0,
  },
  stepIconWrapper: {
    width: 24,
    height: 24,
    padding: 6,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepIconDone:     { backgroundColor: '#E6E7ED' },
  stepIconActive:   { backgroundColor: '#086A74' },
  stepIconUpcoming: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E7ED' },
  stepIcon:         { width: 12, height: 12 } as any,
  stepIconDoneColor: { tintColor: '#989EB5' } as any,
  stepIconWhite:    { tintColor: '#FFFFFF' } as any,
  stepDetails: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 2,
  },
  stepLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
    color: '#575D84',
  },
  stepLabelActive:   { color: '#07073D' },
  stepLabelUpcoming: { color: '#575D84' },
  stepSublabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#989EB5',
  },
  stepSublabelActive: { color: '#575D84' },

  // Vertical separator between steps and status panel
  verticalSepWrap: {
    alignSelf: 'stretch',
    flexShrink: 0,
    justifyContent: 'center',
  },
  verticalSep: {
    width: 1,
    height: '75%' as any,
    backgroundColor: '#E6E7ED',
  },

  // Status panel (right column)
  statusPanel: {
    flex: 60,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    overflow: 'hidden' as any,
    minWidth: 0,
  },
  illustration: {
    width: 160,
    height: 160,
  },
  statusBody: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    alignSelf: 'center',
  },
  statusTexts: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  statusLine: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 28,
    color: '#000000',
    textAlign: 'center',
  },
  statusBold: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: '#000000',
    textAlign: 'center',
  },
  statusDivider: {
    height: 1,
    backgroundColor: '#E6E7ED',
    alignSelf: 'stretch',
  },
  statusDescriptionInner: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  statusLineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusIconContainer: {
    paddingTop: 3,
    paddingBottom: 3,
    flexShrink: 0,
  },
  statusIcon: {
    width: 16,
    height: 16,
    tintColor: '#989EB5',
  },
  statusText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#575D84',
    flex: 1,
  },

  // Footer
  footer: {
    padding: 16,
  },
  bannerWrap: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    flexShrink: 1,
  },
  bannerIconFrame: {
    width: 36,
    height: 36,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bannerIcon: {
    width: 20,
    height: 20,
  } as any,
  bannerText: {
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    flexShrink: 1,
  },
  bannerTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#07073D',
  },
  bannerBody: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#575D84',
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#07073D',
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexShrink: 0,
    // @ts-ignore
    whiteSpace: 'nowrap',
  },
  bannerBtnText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 16,
    color: '#07073D',
  },
  bannerBtnIcon: {
    width: 16,
    height: 16,
    tintColor: '#07073D',
  } as any,

  // ── Mobile content ────────────────────────────────────────────────────────
  mobileContent: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingTop: 20,
    paddingBottom: 16,
    gap: 0,
  },
  mobileStatusRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  mobileIllustration: {
    width: 120,
    height: 120,
  },
  mobileStatusBody: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    // alignSelf: 'center' keeps this block shrunk to content width
    // so the divider stretches to match the longest text/bullet line
    alignSelf: 'center',
  },
  mobileStatusTexts: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
  },
  mobileStatusDivider: {
    height: 1,
    backgroundColor: '#E6E7ED',
    alignSelf: 'stretch',
  },
  mobileStatusLine: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 26,
    color: '#000000',
    textAlign: 'center',
  },
  mobileStatusBold: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    color: '#000000',
    textAlign: 'center',
  },
  mobileBullets: {
    flexDirection: 'column',
    gap: 6,
    alignItems: 'flex-start',
    alignSelf: 'center',
  },
  mobileBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  mobileBulletIcon: {
    width: 16,
    height: 16,
    tintColor: '#989EB5',
    flexShrink: 0,
  } as any,
  mobileBulletText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
    color: '#575D84',
  },
  mobileDivider: {
    height: 1,
    backgroundColor: '#E6E7ED',
    marginHorizontal: 16,
  },
  mobileProgressWrap: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
    position: 'relative',
  },
  mobileTrackBg: {
    position: 'absolute',
    top: 11, // half dot height (24/2) - half line height (1/2) = 11.5 ≈ 11
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: '#E6E7ED',
    borderRadius: 1,
  },
  mobileTrackFill: {
    position: 'absolute',
    top: 11,
    left: 12,
    height: 2,
    backgroundColor: '#086A74',
    borderRadius: 1,
  },
  mobileStepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 0,
  },
  mobileStepNode: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  mobileStepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 1,
  },
  mobileStepDotDone:     { backgroundColor: '#E6E7ED' },
  mobileStepDotActive:   { backgroundColor: '#086A74' },
  mobileStepDotUpcoming: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E6E7ED' },
  mobileStepDotIcon: { width: 12, height: 12 } as any,
  mobileStepLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    color: '#575D84',
    textAlign: 'center',
  },
  mobileStepLabelActive:   { color: '#07073D' },
  mobileStepLabelUpcoming: { color: '#989EB5' },

  // Start a new order
  newOrderTitle: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 20,
    fontWeight: '700',
    color: C.textPrimary,
    marginBottom: 16,
  },
  newOrderGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  newOrderCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden' as any,
    backgroundColor: '#F0F9FA',
    minHeight: 140,
    position: 'relative',
    // @ts-ignore
    cursor: 'pointer',
  },
  newOrderCardInner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 1,
  },
  newOrderLabel: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 18,
    fontWeight: '400',
    color: C.textPrimary,
  },
  newOrderLabelBold: {
    fontWeight: '700',
  },
  newOrderImg: {
    width: '100%' as any,
    height: 140,
    // @ts-ignore
    objectFit: 'cover',
  },
});
