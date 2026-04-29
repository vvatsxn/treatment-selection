import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import {
  PhloLayout,
  ContentContainer,
  PhloButton,
  navigate,
  C,
} from './PhloLayout';
import { mockPatient } from './mockData';

export default function MyDetailsScreen() {
  const [firstName, setFirstName]       = useState(mockPatient.firstName);
  const [lastName, setLastName]         = useState(mockPatient.lastName);
  const [mobile, setMobile]             = useState(mockPatient.mobile);
  const [email, setEmail]               = useState(mockPatient.email);
  const [addressLine1, setAddressLine1] = useState(mockPatient.addressLine1);
  const [city, setCity]                 = useState(mockPatient.city);
  const [postcode, setPostcode]         = useState(mockPatient.postcode);
  const [saved, setSaved]               = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const dob = mockPatient.dob;

  return (
    <PhloLayout>
      <ContentContainer>
        {/* Breadcrumb */}
        <View style={s.breadcrumb}>
          <TouchableOpacity onPress={() => navigate('/phlo/my-account')}>
            <Text style={s.breadcrumbLink}>My account</Text>
          </TouchableOpacity>
          <Text style={s.breadcrumbSep}> / </Text>
          <Text style={s.breadcrumbCurrent}>My details</Text>
        </View>

        <Text style={s.heading}>My details</Text>

        {/* Personal details */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Personal details</Text>

          <View style={s.rowPair}>
            <Field label="First name" value={firstName} onChangeText={setFirstName} style={{ flex: 1 }} />
            <Field label="Last name"  value={lastName}  onChangeText={setLastName}  style={{ flex: 1 }} />
          </View>

          <Field
            label="Date of birth"
            value={dob}
            editable={false}
            hint="Date of birth cannot be changed"
          />

          <Field label="Mobile number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
        </View>

        {/* Contact details */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Contact details</Text>
          <Field
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Delivery address */}
        <View style={[s.card, { marginBottom: 24 }]}>
          <Text style={s.cardTitle}>Delivery address</Text>
          <Field label="Address line 1" value={addressLine1} onChangeText={setAddressLine1} />
          <Field label="City"           value={city}         onChangeText={setCity}         />
          <Field label="Postcode"       value={postcode}     onChangeText={setPostcode}     autoCapitalize="characters" />
        </View>

        {/* Save button */}
        <View style={s.saveBtnWrap}>
          <PhloButton
            label={saved ? 'Saved ✓' : 'Save changes'}
            onPress={handleSave}
            fullWidth={false}
          />
        </View>

        <View style={{ height: 40 }} />
      </ContentContainer>
    </PhloLayout>
  );
}

// ─── Field component ──────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  onChangeText?: (v: string) => void;
  editable?: boolean;
  hint?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  style?: any;
}

function Field({ label, value, onChangeText, editable = true, hint, keyboardType, autoCapitalize, style }: FieldProps) {
  return (
    <View style={[s.field, style]}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={[s.fieldInput, !editable && s.fieldInputDisabled]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor={C.textTertiary}
      />
      {hint && <Text style={s.fieldHint}>{hint}</Text>}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  breadcrumb: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 24, fontWeight: '700',
    color: C.textPrimary,
    marginTop: 12, marginBottom: 24,
  },

  card: {
    backgroundColor: C.white,
    borderWidth: 1, borderColor: C.borderContainer,
    borderRadius: 8, padding: 20,
    gap: 16, marginBottom: 16,
  },
  cardTitle: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 16, fontWeight: '600',
    color: C.textPrimary,
  },

  rowPair: { flexDirection: 'row', gap: 12 },

  field: { gap: 6 },
  fieldLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14, fontWeight: '600',
    color: C.textPrimary,
  },
  fieldInput: {
    height: 48,
    borderWidth: 1, borderColor: C.borderContainer,
    borderRadius: 8, paddingHorizontal: 14,
    fontFamily: "'Inter', sans-serif",
    fontSize: 16, color: C.textPrimary,
    backgroundColor: C.white,
    // @ts-ignore — web-only
    outlineStyle: 'none',
  },
  fieldInputDisabled: {
    backgroundColor: '#F9F9F9',
    color: C.textTertiary,
  },
  fieldHint: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12, color: C.textTertiary,
  },

  saveBtnWrap: { alignItems: 'flex-start' },
});
