import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { pippTheme } from '../theme/pipp';

interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  progress?: number; // 0 to 1
}

const Header: React.FC<HeaderProps> = ({ title, onBackPress, showBackButton = true, progress }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {showBackButton && onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Image
              source={require('../theme/icons/arrow-back.svg')}
              style={styles.icon}
            />
          </TouchableOpacity>
        )}
        {showBackButton && !onBackPress && (
          <Image
            source={require('../theme/icons/arrow-back.svg')}
            style={styles.icon}
          />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      {progress !== undefined && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: 88 }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'sticky' as any,
    top: 0,
    zIndex: 10,
    backgroundColor: pippTheme.colors.background.primary,
  },
  container: {
    height: 60,
    backgroundColor: pippTheme.colors.background.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 0,
    margin: 0,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: pippTheme.colors.icon.brand,
  },
  title: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  progressTrack: {
    height: 4,
    width: '100%',
    backgroundColor: pippTheme.colors.surface.accent,
  },
  progressFill: {
    height: '100%',
    backgroundColor: pippTheme.colors.surface.brandDark,
  },
});

export default Header;
