import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { pippTheme } from '../theme/pipp';
import PIPPButton from './PIPPButton';

const { colors } = pippTheme;

interface PricingData {
  dose: string;
  color: string;
  prices: { original: string; discounted: string }[];
}

interface PlanColumn {
  label: string;
  saving: string;
}

interface BrandPricing {
  brandLabel: string;
  description: string;
  footnote: string;
  columns: PlanColumn[];
  rows: PricingData[];
}

const pricingByBrand: Record<string, BrandPricing> = {
  'mounjaro-kwikpen': {
    brandLabel: 'Mounjaro',
    description: 'Your monthly dose rises gradually over your plan. Longer supply lengths offer a lower price per pen — helping you save as your treatment progresses.',
    footnote: 'Each pen contains 4 weekly doses (one per week) and lasts 4 weeks. Prices shown are per pen per month.',
    columns: [
      { label: '1 Month', saving: '' },
      { label: '2 Months', saving: 'Save £10/m' },
      { label: '3 Months', saving: 'Save £20/m' },
    ],
    rows: [
      { dose: '2.5mg', color: colors.doses.mounjaro['2.5mg'], prices: [{ original: '', discounted: '£149' }, { original: '£149', discounted: '£129' }, { original: '£149', discounted: '£124' }] },
      { dose: '5mg', color: colors.doses.mounjaro['5mg'], prices: [{ original: '', discounted: '£179' }, { original: '£179', discounted: '£159' }, { original: '£179', discounted: '£154' }] },
      { dose: '7.5mg', color: colors.doses.mounjaro['7.5mg'], prices: [{ original: '', discounted: '£199' }, { original: '£199', discounted: '£179' }, { original: '£199', discounted: '£174' }] },
      { dose: '10mg', color: colors.doses.mounjaro['10mg'], prices: [{ original: '', discounted: '£219' }, { original: '£219', discounted: '£199' }, { original: '£219', discounted: '£194' }] },
      { dose: '12.5mg', color: colors.doses.mounjaro['12.5mg'], prices: [{ original: '', discounted: '£239' }, { original: '£239', discounted: '£219' }, { original: '£239', discounted: '£214' }] },
      { dose: '15mg', color: colors.doses.mounjaro['15mg'], prices: [{ original: '', discounted: '£259' }, { original: '£259', discounted: '£239' }, { original: '£259', discounted: '£234' }] },
    ],
  },
  'wegovy-flextouch': {
    brandLabel: 'Wegovy',
    description: 'Your monthly dose rises gradually over your plan. Longer supply lengths offer a lower price per pen — helping you save as your treatment progresses.',
    footnote: 'Each pen contains 4 weekly doses (one per week) and lasts 4 weeks. Prices shown are per pen per month.',
    columns: [
      { label: '1 Month', saving: '' },
      { label: '2 Months', saving: 'Save £10/m' },
      { label: '3 Months', saving: 'Save £20/m' },
    ],
    rows: [
      { dose: '0.25mg', color: colors.doses.wegovy['0.25mg'], prices: [{ original: '', discounted: '£149' }, { original: '£149', discounted: '£129' }, { original: '£149', discounted: '£124' }] },
      { dose: '0.5mg', color: colors.doses.wegovy['0.5mg'], prices: [{ original: '', discounted: '£169' }, { original: '£169', discounted: '£149' }, { original: '£169', discounted: '£144' }] },
      { dose: '1mg', color: colors.doses.wegovy['1mg'], prices: [{ original: '', discounted: '£189' }, { original: '£189', discounted: '£169' }, { original: '£189', discounted: '£164' }] },
      { dose: '1.7mg', color: colors.doses.wegovy['1.7mg'], prices: [{ original: '', discounted: '£209' }, { original: '£209', discounted: '£189' }, { original: '£209', discounted: '£184' }] },
      { dose: '2.4mg', color: colors.doses.wegovy['2.4mg'], prices: [{ original: '', discounted: '£229' }, { original: '£229', discounted: '£209' }, { original: '£229', discounted: '£204' }] },
    ],
  },
  'wegovy-pill': {
    brandLabel: 'Wegovy Pill',
    description: 'Your monthly dose rises gradually over your plan. Longer supply lengths offer a lower price per month — helping you save as your treatment progresses.',
    footnote: 'Each month\'s supply contains a 4-week course of oral tablets. Prices shown are per month.',
    columns: [
      { label: '1 Month', saving: '' },
      { label: '2 Months', saving: 'Save £10/m' },
      { label: '3 Months', saving: 'Save £20/m' },
    ],
    rows: [
      { dose: '1.5mg', color: colors.doses.wegovyPill['1.5mg'], prices: [{ original: '', discounted: '£129' }, { original: '£129', discounted: '£109' }, { original: '£129', discounted: '£104' }] },
      { dose: '4mg', color: colors.doses.wegovyPill['4mg'], prices: [{ original: '', discounted: '£149' }, { original: '£149', discounted: '£129' }, { original: '£149', discounted: '£124' }] },
      { dose: '9mg', color: colors.doses.wegovyPill['9mg'], prices: [{ original: '', discounted: '£169' }, { original: '£169', discounted: '£149' }, { original: '£169', discounted: '£144' }] },
      { dose: '25mg', color: colors.doses.wegovyPill['25mg'], prices: [{ original: '', discounted: '£189' }, { original: '£189', discounted: '£169' }, { original: '£189', discounted: '£164' }] },
    ],
  },
  'orfoglipron': {
    brandLabel: 'Orfoglipron',
    description: 'Your monthly dose rises gradually over your plan. Longer supply lengths offer a lower price per month — helping you save as your treatment progresses.',
    footnote: 'Each month\'s supply contains a 4-week course of oral tablets. Prices shown are per month.',
    columns: [
      { label: '1 Month', saving: '' },
      { label: '2 Months', saving: 'Save £10/m' },
      { label: '3 Months', saving: 'Save £20/m' },
    ],
    rows: [
      { dose: '3mg', color: colors.doses.orfoglipron['3mg'], prices: [{ original: '', discounted: '£119' }, { original: '£119', discounted: '£99' }, { original: '£119', discounted: '£94' }] },
      { dose: '6mg', color: colors.doses.orfoglipron['6mg'], prices: [{ original: '', discounted: '£139' }, { original: '£139', discounted: '£119' }, { original: '£139', discounted: '£114' }] },
      { dose: '12mg', color: colors.doses.orfoglipron['12mg'], prices: [{ original: '', discounted: '£159' }, { original: '£159', discounted: '£139' }, { original: '£159', discounted: '£134' }] },
      { dose: '24mg', color: colors.doses.orfoglipron['24mg'], prices: [{ original: '', discounted: '£179' }, { original: '£179', discounted: '£159' }, { original: '£179', discounted: '£154' }] },
      { dose: '36mg', color: colors.doses.orfoglipron['36mg'], prices: [{ original: '', discounted: '£199' }, { original: '£199', discounted: '£179' }, { original: '£199', discounted: '£174' }] },
    ],
  },
};

interface PricingModalProps {
  visible: boolean;
  onClose: () => void;
  brand: string | null;
}

const PricingModal: React.FC<PricingModalProps> = ({ visible, onClose, brand }) => {
  const slideAnim = React.useRef(new Animated.Value(800)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = React.useState(false);

  const pricing = brand ? pricingByBrand[brand] : null;

  React.useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else if (modalVisible) {
      Animated.timing(slideAnim, {
        toValue: 800,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          setModalVisible(false);
        });
      });
    }
  }, [visible]);

  if (!pricing) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={styles.modalTouchable}>
            <Animated.View
              style={[
                styles.modalContainer,
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentInner} showsVerticalScrollIndicator={false}>
                <Text style={styles.heading}>How pricing works</Text>
                <Text style={styles.description}>{pricing.description}</Text>

                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.learnMore}>Learn more &gt;</Text>
                </TouchableOpacity>

                {/* Pricing table */}
                <View style={styles.table}>
                  {/* Header row */}
                  <View style={styles.tableHeaderRow}>
                    <View style={styles.tableDoseCell}>
                      <Text style={styles.tableHeaderDoseText}>{pricing.brandLabel}</Text>
                    </View>
                    {pricing.columns.map((col, i) => (
                      <View key={i} style={styles.tableHeaderCell}>
                        <Text style={styles.tableHeaderText}>{col.label}</Text>
                        {col.saving ? (
                          <View style={styles.savingBadge}>
                            <Text style={styles.savingBadgeText}>{col.saving}</Text>
                          </View>
                        ) : null}
                      </View>
                    ))}
                  </View>

                  {/* Data rows */}
                  {pricing.rows.map((row, rowIdx) => (
                    <View key={rowIdx} style={[styles.tableRow, rowIdx % 2 === 1 && styles.tableRowAlt]}>
                      <View style={styles.tableDoseCell}>
                        <View style={[styles.doseTag, { backgroundColor: row.color }]}>
                          <Text style={styles.doseTagText}>{row.dose}</Text>
                        </View>
                      </View>
                      {row.prices.map((price, colIdx) => (
                        <View key={colIdx} style={styles.tablePriceCell}>
                          {price.original ? (
                            <Text style={styles.originalPrice}>{price.original}</Text>
                          ) : null}
                          <Text style={price.original ? styles.discountedPrice : styles.standardPrice}>{price.discounted}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>

                <Text style={styles.footnote}>{pricing.footnote}</Text>
              </ScrollView>

              <View style={styles.buttonContainer}>
                <PIPPButton
                  title="Got it"
                  onPress={onClose}
                />
              </View>
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.64)',
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalTouchable: {
    maxHeight: '95%',
  } as any,
  modalContainer: {
    backgroundColor: colors.surface.default,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden' as any,
  },
  scrollContent: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContentInner: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
  } as any,
  heading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.bold.toString() as any,
    lineHeight: pippTheme.lineHeight[32],
    color: colors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[22],
    color: colors.text.secondary,
    marginBottom: 8,
  },
  learnMore: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[22],
    color: colors.text.link,
    marginBottom: 16,
  },
  table: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden' as any,
    marginBottom: 12,
  },
  tableHeaderRow: {
    flexDirection: 'row' as any,
    backgroundColor: colors.surface.dark,
    alignItems: 'stretch' as any,
  },
  tableDoseCell: {
    width: 72,
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  tableHeaderDoseText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#FFFFFF',
    textAlign: 'center' as any,
  },
  tableHeaderCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
    gap: 4,
  },
  tableHeaderText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#FFFFFF',
    textAlign: 'center' as any,
  },
  savingBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    gap: 4,
    borderRadius: 4,
    backgroundImage: 'linear-gradient(291deg, #E2FBF0 0%, #88F3C4 100%)' as any,
  },
  savingBadgeText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    lineHeight: pippTheme.lineHeight[12],
    color: colors.text.primary,
    textAlign: 'center' as any,
  },
  tableRow: {
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  tableRowAlt: {
    backgroundColor: '#F9F9F9',
  },
  doseTag: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  doseTagText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: '#FFFFFF',
    textAlign: 'center' as any,
  },
  tablePriceCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center' as any,
    gap: 2,
  },
  originalPrice: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: colors.text.subtle,
    textDecorationLine: 'line-through' as any,
  },
  standardPrice: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: colors.text.primary,
  },
  discountedPrice: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: colors.text.primary,
  },
  footnote: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.small,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[20],
    color: colors.text.subtle,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
  } as any,
});

export default PricingModal;
