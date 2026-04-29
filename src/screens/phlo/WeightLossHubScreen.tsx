import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import {
  PhloLayout,
  ContentContainer,
  PhloButton,
  navigate,
  C,
} from './PhloLayout';
import { mockWeightHistory } from './mockData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getMonthYear(d: Date) {
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// Group weight history by month
function groupByMonth(entries: typeof mockWeightHistory) {
  const groups: { month: string; entries: typeof mockWeightHistory }[] = [];
  for (const entry of entries) {
    const m = getMonthYear(entry.date);
    const last = groups[groups.length - 1];
    if (last && last.month === m) {
      last.entries.push(entry);
    } else {
      groups.push({ month: m, entries: [entry] });
    }
  }
  return groups;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WeightLossHubScreen() {
  const startEntry  = mockWeightHistory[mockWeightHistory.length - 1]!;
  const latestEntry = mockWeightHistory[0]!;
  const daysUntilReorder = 5;

  const lastWeightKg  = latestEntry.weight_kg;
  const totalLostKg   = (startEntry.weight_kg - latestEntry.weight_kg).toFixed(1);
  const startDateStr  = formatDate(startEntry.date);

  const monthGroups = groupByMonth([...mockWeightHistory]);

  return (
    <PhloLayout>
      <ContentContainer>

        {/* Back link */}
        <PhloButton
          label="← Back to My Account"
          variant="text-btn"
          onPress={() => navigate('/phlo/my-account')}
          fullWidth={false}
        />

        {/* ── Header widget ── */}
        <View style={s.headerWidget}>
          {/* SVG background — top right, large */}
          <Image
            source={require('./assets/phlo-clinic/weight-loss-hub-widget-mobile.svg')}
            style={s.headerBgSvg}
            resizeMode="contain"
          />

          {/* Left side: weight info */}
          <View style={s.headerLeft}>
            <Text style={s.headerLabel}>My weight journey</Text>
            <Text style={s.headerWeight}>{lastWeightKg}kg</Text>
            <View style={s.headerDeltaRow}>
              <Text style={s.headerArrow}>↓</Text>
              <Text style={s.headerDeltaText}>{totalLostKg}kg since {startDateStr}</Text>
            </View>
          </View>

          {/* Re-order text — bottom right */}
          {daysUntilReorder > 0 && (
            <Text style={s.headerReorder}>
              Re-order available in{' '}
              <Text style={s.headerReorderUnderline}>{daysUntilReorder} days</Text>
            </Text>
          )}
        </View>

        {/* ── Weight history ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Weight history</Text>

          <View style={s.historyCard}>
            {monthGroups.map((group, gi) => (
              <View key={group.month}>
                {/* Month header row */}
                <View style={[s.monthRow, gi === 0 && s.monthRowFirst]}>
                  <Text style={s.monthLabel}>{group.month.split(' ')[0]}</Text>
                </View>

                {group.entries.map((entry, i) => {
                  const isStarting = entry.type === 'starting-weight';
                  const fullIdx = mockWeightHistory.indexOf(entry);
                  const prev    = mockWeightHistory[fullIdx + 1];
                  const deltaKg = prev ? +(entry.weight_kg - prev.weight_kg).toFixed(1) : null;
                  const isLoss  = deltaKg !== null && deltaKg < 0;

                  return (
                    <View key={entry.id} style={s.historyRow}>
                      {/* Icon circle */}
                      <View style={s.iconCircle}>
                        {isStarting ? (
                          <View style={s.iconDot} />
                        ) : (
                          <Text style={s.iconArrows}>↻</Text>
                        )}
                      </View>

                      {/* Row content */}
                      <View style={s.rowContent}>
                        <View style={s.rowLeft}>
                          <Text style={s.rowTitle}>{isStarting ? 'Starting weight' : 'Check in'}</Text>
                          <Text style={s.rowDate}>{formatDate(entry.date)}</Text>
                          {entry.verified && (
                            <View style={s.verifiedBadge}>
                              <Text style={s.verifiedText}>✓ Verified by prescriber</Text>
                            </View>
                          )}
                        </View>
                        <View style={s.rowRight}>
                          <Text style={s.rowWeight}>{entry.weight_kg}kg</Text>
                          {deltaKg !== null && (
                            <Text style={[s.rowDelta, isLoss ? s.deltaGreen : s.deltaRed]}>
                              {isLoss ? '−' : '+'}{Math.abs(deltaKg)}kg
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* ── CTA cards ── */}
        <View style={s.ctaRow}>
          {/* Help centre */}
          <View style={s.helpCard}>
            <Image
              source={require('./assets/phlo-clinic/help-centre.png')}
              style={s.helpImg}
              resizeMode="contain"
            />
            <View style={s.ctaContent}>
              <Text style={s.ctaTitle}>Got a question?</Text>
              <Text style={s.ctaBody}>
                Our dedicated weight loss help centre offers expert articles, guidance, personalised tips and clinical advice.
              </Text>
              <PhloButton
                label="Get tips & advice →"
                variant="text-btn"
                onPress={() => {}}
                fullWidth={false}
              />
            </View>
          </View>

          {/* Trustpilot */}
          <View style={s.trustCard}>
            <Image
              source={require('./assets/phlo-clinic/flat-woman-laptop.png')}
              style={s.trustImg}
              resizeMode="contain"
            />
            <View style={s.ctaContent}>
              <Text style={s.ctaTitle}>Leave us a review</Text>
              <Text style={s.ctaBody}>
                Had a great experience with Phlo Clinic? Help others find the care they deserve by leaving us a review!
              </Text>
              <PhloButton
                label="Write a review →"
                variant="text-btn"
                onPress={() => {}}
                fullWidth={false}
              />
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ContentContainer>
    </PhloLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({

  // ── Header widget ──
  headerWidget: {
    backgroundColor: C.primaryMain,
    borderRadius: 8,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 120,
    marginTop: 16,
    marginBottom: 8,
  },
  headerBgSvg: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '55%' as any,
    height: '100%' as any,
    // @ts-ignore — web-only
    objectFit: 'cover',
  },
  headerLeft: {
    zIndex: 1,
    gap: 2,
  },
  headerLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, lineHeight: 22, fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
  },
  headerWeight: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 32, lineHeight: 40, fontWeight: '600',
    color: '#fff',
  },
  headerDeltaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  headerArrow: { color: '#fff', fontSize: 14 },
  headerDeltaText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, lineHeight: 22,
    color: '#fff',
  },
  headerReorder: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, lineHeight: 22, fontWeight: '600',
    color: '#fff',
    zIndex: 1,
    marginTop: 12,
  },
  headerReorderUnderline: {
    textDecorationLine: 'underline',
  },

  // ── Section ──
  section: { marginTop: 4, marginBottom: 8 },
  sectionTitle: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 20, lineHeight: 28, fontWeight: '600',
    color: C.textPrimary,
    marginBottom: 16,
  },

  // ── History card ──
  historyCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.borderContainer,
    borderRadius: 8,
    overflow: 'hidden',
  },

  monthRow: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: C.borderContainer,
  },
  monthRowFirst: { borderTopWidth: 0 },
  monthLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, fontWeight: '600',
    color: C.textSecondary,
  },

  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: C.borderContainer,
  },

  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  iconDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: C.primaryMain,
  },
  iconArrows: {
    fontSize: 18, color: C.primaryMain,
    fontWeight: '400',
  },

  rowContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rowLeft: { gap: 2 },
  rowRight: { alignItems: 'flex-end', gap: 2 },

  rowTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16, fontWeight: '600',
    color: C.textPrimary,
  },
  rowDate: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, color: C.textSecondary,
  },
  rowWeight: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 20, lineHeight: 28, fontWeight: '600',
    color: C.textPrimary,
  },
  rowDelta: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
  },
  deltaGreen: { color: '#16A34A' },
  deltaRed:   { color: C.textTertiary },

  verifiedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  verifiedText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12, fontWeight: '600',
    color: '#16A34A',
  },

  // ── CTA cards ──
  ctaRow: {
    flexDirection: 'row',
    // @ts-ignore
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },

  helpCard: {
    flex: 1, minWidth: 220,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 160,
  },
  helpImg: {
    position: 'absolute',
    right: 0, bottom: 0,
    width: 132,
    height: 132,
    zIndex: 0,
  },
  ctaContent: {
    maxWidth: '70%' as any,
    gap: 12,
    zIndex: 1,
  },

  trustCard: {
    flex: 1, minWidth: 220,
    backgroundColor: C.primary25,
    borderRadius: 8,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 160,
  },
  trustImg: {
    position: 'absolute',
    right: -11, bottom: 0,
    width: 159,
    height: 159,
    zIndex: 0,
  },

  ctaTitle: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 20, lineHeight: 24, fontWeight: '600',
    color: C.textPrimary,
  },
  ctaBody: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, lineHeight: 22,
    color: C.textPrimary,
  },
});
