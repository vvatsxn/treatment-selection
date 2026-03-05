import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { pippTheme } from '../theme/pipp';

interface BannerProps {
  text: string;
  linkText: string;
  onLinkPress?: () => void;
}

const Banner: React.FC<BannerProps> = ({ text, linkText, onLinkPress }) => {
  const parts = text.split(linkText);

  return (
    <View style={styles.container}>
      <Image
        source={require('../theme/icons/info-outline.svg')}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={styles.text}>
          {parts[0]}
          <Text style={styles.link} onPress={onLinkPress}>
            {linkText}
          </Text>
          {parts[1]}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: pippTheme.colors.surface.accent,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    borderRadius: pippTheme.radius.md,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: pippTheme.colors.icon.info,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[20],
    color: pippTheme.colors.text.info,
  },
  link: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.link,
    textDecorationLine: 'underline',
  },
});

export default Banner;
