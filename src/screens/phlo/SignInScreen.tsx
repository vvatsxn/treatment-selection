import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import {
  QuestionnaireLayout,
  PhloClinicLogo,
  StickyBottom,
  PhloButton,
  navigate,
  C,
} from './PhloLayout';

export default function SignInScreen() {
  const [email, setEmail]       = useState('sarah.mitchell@example.com');
  const [password, setPassword] = useState('');

  return (
    <QuestionnaireLayout showLogo>
      <View style={s.content}>
        {/* Logo — 110px mobile, centred */}
        <View style={s.logoWrap}>
          <PhloClinicLogo width={110} />
        </View>

        {/* Max-width form container */}
        <View style={s.formContainer}>
          {/* Title */}
          <Text style={s.heading}>Sign in to Phlo Clinic</Text>

          {/* Fields */}
          <View style={s.fields}>
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Email address</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="your@email.com"
                placeholderTextColor={C.textTertiary}
              />
            </View>

            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Password</Text>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={C.textTertiary}
              />
            </View>

            <View style={s.forgotRow}>
              <Text style={s.forgotText}>Forgot password?</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Sticky bottom — matches ButtonContainer exactly */}
      <StickyBottom>
        <PhloButton
          label="Sign in"
          onPress={() => navigate('/phlo/my-account')}
        />
        <PhloButton
          label="I'm new to Phlo Clinic"
          variant="secondary"
          onPress={() => navigate('/phlo/getting-started')}
        />
      </StickyBottom>
    </QuestionnaireLayout>
  );
}

const s = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%' as any,
    alignItems: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: '15%' as any,
    marginBottom: 32,
  },
  formContainer: {
    width: '100%' as any,
    maxWidth: 480,
    paddingHorizontal: 16,
    gap: 16,
  },
  heading: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: C.textPrimary,
  },
  fields: { gap: 16 },
  fieldWrap: { gap: 6 },
  fieldLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: '500',
    color: C.textPrimary,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: C.borderContainer,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    color: C.textPrimary,
    backgroundColor: C.white,
    // @ts-ignore — web-only
    outlineStyle: 'none',
  },
  forgotRow: { alignItems: 'flex-end' },
  forgotText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    color: C.primaryMain,
    cursor: 'pointer' as any,
  },
});
