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

export default function OrdersScreen() {
  return (
    <PhloLayout>
      <ContentContainer>

        {/* Breadcrumb */}
        <View style={s.breadcrumb}>
          <TouchableOpacity onPress={() => navigate('/phlo/concept-1/my-account')}>
            <Text style={s.breadcrumbLink}>My account</Text>
          </TouchableOpacity>
          <Text style={s.breadcrumbSep}> / </Text>
          <Text style={s.breadcrumbCurrent}>My orders</Text>
        </View>

        {/* Heading */}
        <Text style={s.heading}>My orders</Text>

        {/* All five states */}
        <View style={s.cards}>
          {mockOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ContentContainer>
    </PhloLayout>
  );
}

const s = StyleSheet.create({
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  breadcrumbLink: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, color: C.textTertiary,
    // @ts-ignore
    cursor: 'pointer',
  },
  breadcrumbSep: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, color: C.textTertiary,
  },
  breadcrumbCurrent: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, fontWeight: '600',
    color: C.textPrimary,
  },
  heading: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 24, lineHeight: 32, fontWeight: '600',
    color: C.textPrimary,
    marginTop: 20,
    marginBottom: 20,
  },
  cards: {
    flexDirection: 'column',
    gap: 16,
  },
});
