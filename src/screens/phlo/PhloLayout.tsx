/**
 * Shared layout primitives for Phlo Clinic screens.
 * Mirrors the prototype _layout.tsx exactly — phloClinicTheme colours,
 * same nav structure, same progress-bar nav.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';

// ─── Exact phloClinicTheme palette values ────────────────────────────────────
export const C = {
  primaryMain:    '#086A74',
  primary25:      '#E6F4F5',
  textPrimary:    '#07073D',
  textSecondary:  '#4B5563',
  textTertiary:   '#9CA3AF',
  textSubtle:     '#6B7280',
  borderBorder:   '#E0E0E8',
  borderContainer:'#C8C8D0',
  white:          '#FFFFFF',
  lightGrey:      '#F5F5F5',
  successAccent:  '#DCFCE7',
  success:        '#16A34A',
  infoBg:         '#EFF6FF',
  info:           '#3B82F6',
  warningBg:      '#FFFBEB',
  warning:        '#D97706',
  warning700:     '#B45309',
  errorBg:        '#FEF2F2',
  error800:       '#DC2626',
  progressSecondary: '#E2E8F0',
  // surface.warning — used for HelpCentreCta background
  surfaceWarning: '#FEF3C7',
  // surface.accent — used for TrustPilotCta background
  surfaceAccent:  '#E6F4F5',
};

// ─── CSS injection ───────────────────────────────────────────────────────────
const _layoutCss = `
@media (max-width: 700px) {
  [data-phlonav] { height: 56px !important; padding-left: 16px !important; padding-right: 16px !important; padding-top: 0 !important; padding-bottom: 0 !important; }
  [data-phlologo] { width: 114px !important; height: auto !important; display: block !important; }
  [data-phlomenuicon] { width: 24px !important; height: 24px !important; }
  [data-phlobody] { padding-top: 56px !important; }
}
`;
if (typeof document !== 'undefined') {
  let el = document.getElementById('phlo-layout-css');
  if (!el) { el = document.createElement('style'); el.id = 'phlo-layout-css'; document.head.appendChild(el); }
  el.textContent = _layoutCss;
}

// ─── Navigation helper ────────────────────────────────────────────────────────
export function navigate(path: string | number) {
  if (typeof path === 'number') {
    window.history.go(path);
  } else {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  // Reset scroll position on the main scroll container
  const scroller = document.getElementById('phlo-scroll-body');
  if (scroller) scroller.scrollTop = 0;
}

// ─── Phlo Clinic logo (real PNG asset) ───────────────────────────────────────
export function PhloClinicLogo() {
  const src = require('../../images/phlo-clinic-logo-default.png');
  // Use a plain <img> so we can attach data-phlologo for the mobile CSS resize
  return (
    <img
      src={typeof src === 'string' ? src : src.default ?? src.uri ?? src}
      alt="Phlo Clinic"
      data-phlologo="1"
      style={{ width: 152, height: 32, objectFit: 'contain', display: 'block' }}
    />
  );
}

// ─── Side nav (hamburger menu panel) ─────────────────────────────────────────
const navLinks = [
  { href: '/phlo/my-account',                    label: 'My account' },
  { href: '/phlo/my-account/weight-loss-hub',    label: 'My weight journey' },
  { href: '/phlo/my-account/orders',             label: 'My orders' },
  { href: '/phlo/my-account/details',            label: 'My details' },
];

function SideNav({ onClose }: { onClose: () => void }) {
  const currentPath = window.location.pathname;
  return (
    <View style={s.blanket}>
      <TouchableOpacity style={s.blanketDismiss} onPress={onClose} />
      <View style={s.sidePanel}>
        <ScrollView contentContainerStyle={s.sidePanelInner}>
          {/* Header row: logo + close */}
          <View style={s.sideHeader}>
            <PhloClinicLogo />
            <TouchableOpacity onPress={onClose} style={s.closeHit}>
              <Image
                source={require('../../theme/icons/close.svg')}
                style={s.closeIcon}
                accessibilityLabel="Close menu"
              />
            </TouchableOpacity>
          </View>

          {/* Nav links */}
          <View style={s.sideLinks}>
            {navLinks.map((l) => (
              <TouchableOpacity
                key={l.href}
                onPress={() => { onClose(); navigate(l.href); }}
              >
                <Text style={[
                  s.sideLinkText,
                  currentPath === l.href && s.sideLinkTextActive,
                ]}>
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <View style={s.sideFooter}>
            <TouchableOpacity onPress={() => { onClose(); navigate('/phlo/sign-in'); }}>
              <Text style={s.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// ─── My Account top nav (logo + hamburger) ────────────────────────────────────
function MyAccountNav({ onMenuClick }: { onMenuClick: () => void }) {
  const navProps: any = { style: s.accountNav, dataSet: { phlonav: '1' } };
  const iconProps: any = { source: require('../../theme/icons/notes.svg'), style: s.menuIcon, dataSet: { phlomenuicon: '1' }, accessibilityLabel: 'Open menu' };
  return (
    <View {...navProps}>
      <TouchableOpacity onPress={() => navigate('/phlo/my-account')}>
        <PhloClinicLogo />
      </TouchableOpacity>
      <TouchableOpacity onPress={onMenuClick} style={s.menuIconHit}>
        <Image {...iconProps} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Questionnaire progress-bar nav ──────────────────────────────────────────
export interface QuestionnaireNavProps {
  progress?: number;   // 0–100
  onBack?: () => void;
  title?: string;
  step?: string;
  showLogo?: boolean;
}

export function QuestionnaireNav({
  progress,
  onBack,
  title,
  step,
  showLogo,
}: QuestionnaireNavProps) {
  const handleBack = onBack ?? (() => window.history.back());
  return (
    <View style={s.qNavOuter}>
      <View style={s.qNavRow}>
        {/* Left — back arrow */}
        <TouchableOpacity style={s.qNavSide} onPress={handleBack}>
          <Image
            source={require('../../theme/icons/arrow-back.svg')}
            style={s.qNavArrow}
            accessibilityLabel="Back"
          />
        </TouchableOpacity>

        {/* Centre */}
        <View style={s.qNavCentre}>
          {showLogo && (
            <TouchableOpacity onPress={() => navigate('/phlo')}>
              <PhloClinicLogo />
            </TouchableOpacity>
          )}
          {step && !showLogo && (
            <Text style={s.qNavStepText}>Step {step} of 3</Text>
          )}
          {title && !step && !showLogo && (
            <Text style={s.qNavStepText}>{title}</Text>
          )}
          {!showLogo && !step && !title && (
            <TouchableOpacity onPress={() => navigate('/phlo')}>
              <PhloClinicLogo />
            </TouchableOpacity>
          )}
        </View>

        {/* Right spacer */}
        <View style={s.qNavSide} />
      </View>

      {/* Progress bar */}
      {progress !== undefined && (
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progress}%` as any }]} />
        </View>
      )}
    </View>
  );
}

// ─── PhloLayout — My Account pages ───────────────────────────────────────────
export function PhloLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <View style={s.screen}>
      <MyAccountNav onMenuClick={() => setMenuOpen(true)} />
      {menuOpen && <SideNav onClose={() => setMenuOpen(false)} />}
      <ScrollView style={s.body} nativeID="phlo-scroll-body">
        {/* @ts-ignore */}
        <View style={s.bodyContent} dataSet={{ phlobody: '1' } as any}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── QuestionnaireLayout — questionnaire / flow pages ────────────────────────
export function QuestionnaireLayout({
  children,
  progress,
  onBack,
  step,
  title,
  showLogo,
}: { children: React.ReactNode } & QuestionnaireNavProps) {
  return (
    <View style={s.screen}>
      <QuestionnaireNav
        progress={progress}
        onBack={onBack}
        step={step}
        title={title}
        showLogo={showLogo}
      />
      <ScrollView style={s.body} contentContainerStyle={s.qBodyContent}>
        {children}
      </ScrollView>
    </View>
  );
}

// ─── ContentContainer — for My Account / full-page layouts ───────────────────
// Max-width 800px, centred, horizontal padding 16px, vertical padding 24px
export function ContentContainer({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[contentContainerStyle, style]}>
      {children}
    </View>
  );
}
const contentContainerStyle = {
  width: '100%' as any,
  maxWidth: 800,
  alignSelf: 'center' as any,
  paddingHorizontal: 16,
  paddingTop: 40,
};

// ─── QuestionnaireContentContainer ───────────────────────────────────────────
// Mirrors: padding 24px 16px (mobile), 48px 16px (desktop), centred flex column
export function QContent({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[s.qContent, style]}>
      {children}
    </View>
  );
}

// ─── Shared Status Badge ──────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string; color: string; label: string }> = {
    PENDING:    { bg: C.infoBg,        dot: C.info,     color: C.info,     label: 'In review' },
    DISPATCHED: { bg: C.successAccent, dot: C.success,  color: C.success,  label: 'Dispatched' },
    DELIVERED:  { bg: C.successAccent, dot: C.success,  color: C.success,  label: 'Delivered' },
    ON_HOLD:    { bg: C.warningBg,     dot: C.warning,  color: C.warning,  label: 'On hold' },
    CANCELLED:  { bg: C.borderBorder,  dot: C.textTertiary, color: C.textTertiary, label: 'Cancelled' },
  };
  const v = map[status] ?? map['PENDING']!;
  return (
    <View style={[s.badge, { backgroundColor: v.bg }]}>
      {status !== 'CANCELLED' && (
        <View style={[s.badgeDot, { backgroundColor: v.dot }]} />
      )}
      <Text style={[s.badgeText, { color: v.color }]}>{v.label}</Text>
    </View>
  );
}

// ─── Shared Status Banner ─────────────────────────────────────────────────────
export function StatusBanner({ text, variant = 'info' }: { text: string; variant?: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    info:    { bg: C.infoBg,    color: C.info },
    caution: { bg: C.warningBg, color: C.warning700 },
    error:   { bg: C.errorBg,   color: C.error800 },
  };
  const v = map[variant] ?? map['info']!;
  return (
    <View style={[s.banner, { backgroundColor: v.bg }]}>
      <Text style={[s.bannerText, { color: v.color }]}>{text}</Text>
    </View>
  );
}

// ─── Sticky bottom CTA container ─────────────────────────────────────────────
export function StickyBottom({ children }: { children: React.ReactNode }) {
  return <View style={s.stickyBottom}>{children}</View>;
}

// ─── Primary / Secondary button ──────────────────────────────────────────────
export function PhloButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = true,
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text-btn';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: string; // arrow character
}) {
  const isPrimary   = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isText      = variant === 'text-btn';

  const bg = isPrimary ? (disabled ? '#93C8CB' : C.primaryMain) : 'transparent';
  const borderStyle = isSecondary
    ? { borderWidth: 1, borderColor: C.primaryMain }
    : {};
  const textCol = isPrimary
    ? C.white
    : isText
    ? C.primaryMain
    : C.primaryMain;

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        s.btn,
        { backgroundColor: bg },
        borderStyle,
        !fullWidth && { alignSelf: 'flex-start' as any },
        isText && { height: 'auto' as any, paddingVertical: 0, paddingHorizontal: 0 },
      ]}
    >
      <Text style={[s.btnText, { color: textCol }]}>
        {label}{icon ? ` ${icon}` : ''}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.white,
  },
  body: { flex: 1 },
  bodyContent: { flexGrow: 1, paddingTop: 72 },
  qBodyContent: { flexGrow: 1, paddingBottom: 120 },

  // My Account nav
  accountNav: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    backgroundColor: C.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 72,
    paddingHorizontal: 32,
    paddingVertical: 20,
    shadowColor: '#726D6D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuIconHit: { padding: 4 },
  menuIcon: { width: 32, height: 32, tintColor: C.primaryMain },

  // Side nav blanket
  blanket: {
    position: 'fixed' as any,
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 5000,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.64)',
  },
  blanketDismiss: { flex: 1 },
  sidePanel: {
    width: 391,
    maxWidth: '100%' as any,
    backgroundColor: C.white,
    height: '100%' as any,
  },
  sidePanelInner: { padding: 28 },
  sideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 0,
    paddingTop: 8,
  },
  closeHit: { padding: 8 },
  closeIcon: { width: 24, height: 24, tintColor: C.primaryMain },

  sideLinks: {
    borderTopWidth: 1,
    borderTopColor: C.borderBorder,
    marginTop: 28,
    paddingTop: 28,
    paddingBottom: 28,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: C.borderBorder,
  },
  sideLinkText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    lineHeight: 24,
    color: C.textPrimary,
  },
  sideLinkTextActive: { fontWeight: '700' },

  sideFooter: { paddingTop: 20 },
  logoutText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    lineHeight: 24,
    color: C.error800,
  },

  // Questionnaire nav
  qNavOuter: {
    position: 'sticky' as any,
    top: 0,
    zIndex: 100,
    backgroundColor: C.white,
  },
  qNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 57,
  },
  qNavSide: { width: 20, alignItems: 'center' },
  qNavArrow: { width: 24, height: 24, tintColor: C.primaryMain },
  qNavCentre: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'flex-start',
  },
  qNavStepText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: '600',
    color: C.textPrimary,
  },

  // Progress bar
  progressTrack: {
    height: 4,
    backgroundColor: C.progressSecondary,
    width: '100%' as any,
  },
  progressFill: {
    height: 4,
    backgroundColor: C.primaryMain,
  },

  // QuestionnaireContentContainer
  qContent: {
    width: '100%' as any,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    maxWidth: 560,
  },

  // Status badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 40,
    gap: 4,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: '600',
  },

  // Status banner
  banner: { padding: 12, paddingHorizontal: 16, borderRadius: 4 },
  bannerText: { fontFamily: "'Inter', sans-serif", fontSize: 14 },

  // Sticky bottom
  stickyBottom: {
    position: 'sticky' as any,
    bottom: 0,
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: C.borderBorder,
    zIndex: 10,
    gap: 12,
  },

  // Button
  btn: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%' as any,
  },
  btnText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
});
