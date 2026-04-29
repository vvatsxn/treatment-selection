import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  PhloLayout,
  ContentContainer,
  navigate,
  C,
} from '../PhloLayout';
import { mockOrders } from './mockData';
import { OrderCard } from './MyAccountScreen';

// ─── Status ordering + grouping ───────────────────────────────────────────────

// Most urgent first: payment issues → action needed → in review → preparing → dispatched → delivered → past
const STATUS_ORDER: Record<string, number> = {
  PAYMENT_FAILED:              0,
  ORDER_PLACED:                1,
  ON_HOLD:                     2,
  IN_REVIEW_EVIDENCE_REQUIRED: 3,
  IN_REVIEW_NO_ACTION:         4,
  IN_REVIEW_UPLOADED:          5,
  PRESCRIBER_REVIEW:           6,
  PREPARING_YOUR_ORDER:        7,
  DISPATCHED:                  8,
  DELIVERED:                   9,
  DELIVERED_CONFIRMED:        10,
  REJECTED:                   11,
  CANCELLED:                  12,
};

// Past = terminal states only; DELIVERED stays active
const PAST_STATUSES = new Set([
  'DELIVERED_CONFIRMED',
  'REJECTED',
  'CANCELLED',
]);

export default function OrdersScreen() {
  const sorted = [...mockOrders].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
  );

  const activeOrders = sorted.filter((o) => !PAST_STATUSES.has(o.status));
  const pastOrders   = sorted.filter((o) =>  PAST_STATUSES.has(o.status));

  // Build global index for stagger animation (active first, then past)
  let globalIndex = 0;

  return (
    <PhloLayout>
      <ContentContainer>

        {/* Breadcrumb */}
        <View style={s.breadcrumb}>
          <TouchableOpacity onPress={() => navigate('/phlo/concept-2/my-account')}>
            <Text style={s.breadcrumbLink}>My account</Text>
          </TouchableOpacity>
          <Text style={s.breadcrumbSep}> / </Text>
          <Text style={s.breadcrumbCurrent}>My orders</Text>
        </View>

        {/* Page heading */}
        <Text style={s.heading}>My orders</Text>

        {/* Active orders */}
        {activeOrders.length > 0 && (
          <View style={s.group}>
            <Text style={s.groupLabel}>Active orders</Text>
            <View style={s.cards}>
              {activeOrders.map((order) => {
                const idx = globalIndex++;
                return (
                  <OrderCard
                    key={order.id}
                    order={order}
                    cardIndex={idx}
                    isPast={false}
                  />
                );
              })}
            </View>
          </View>
        )}

        {/* Past orders */}
        {pastOrders.length > 0 && (
          <View style={s.group}>
            <Text style={s.groupLabel}>Past orders</Text>
            <View style={s.cards}>
              {pastOrders.map((order) => {
                const idx = globalIndex++;
                return (
                  <OrderCard
                    key={order.id}
                    order={order}
                    cardIndex={idx}
                    isPast={true}
                  />
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ContentContainer>
    </PhloLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  breadcrumbLink: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: C.textTertiary,
    // @ts-ignore
    cursor: 'pointer',
  },
  breadcrumbSep: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: C.textTertiary,
  },
  breadcrumbCurrent: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: '600',
    color: C.textPrimary,
  },
  heading: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    color: C.textPrimary,
    marginTop: 8,
    marginBottom: 32,
  },
  group: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 32,
  },
  groupLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    color: C.textTertiary,
    letterSpacing: 0.8,
    // @ts-ignore
    textTransform: 'uppercase',
  },
  cards: {
    flexDirection: 'column',
    gap: 12,
  },
});
