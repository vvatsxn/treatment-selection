import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { pippTheme } from '../theme/pipp';

interface BMISliderProps {
  value: number;
  categories?: { label: string; threshold: number; color: string }[];
}

const DEFAULT_CATEGORIES = [
  { label: 'Low', threshold: 0, color: pippTheme.colors.success[200] },
  { label: 'Medium', threshold: 33, color: pippTheme.colors.warning[200] },
  { label: 'High', threshold: 66, color: pippTheme.colors.error[300] },
];

const BMISlider: React.FC<BMISliderProps> = ({ value, categories = DEFAULT_CATEGORIES }) => {
  const [showCategory, setShowCategory] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bmiScaleAnim = useRef(new Animated.Value(2)).current;
  const categorySlideAnim = useRef(new Animated.Value(30)).current;
  const sliderSlideAnim = useRef(new Animated.Value(30)).current;
  const bmiCountAnim = useRef(new Animated.Value(0)).current;
  const dotPositionAnim = useRef(new Animated.Value(0)).current;

  // Calculate dot position as percentage (0-100)
  const dotPosition = Math.max(0, Math.min(100, value));

  // Determine current category
  const getCategory = () => {
    for (let i = categories.length - 1; i >= 0; i--) {
      if (value >= categories[i].threshold) {
        return categories[i].label;
      }
    }
    return categories[0].label;
  };

  // Calculate section widths as equal portions
  const sectionWidth = 100 / categories.length;

  const category = getCategory();

  useEffect(() => {
    // Step 1: Slide entire component up
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();

    // Step 2: Value counter animation with scale
    Animated.timing(bmiCountAnim, {
      toValue: value,
      duration: 3500,
      delay: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start(() => {
      // Step 3: Scale down text to normal size
      Animated.timing(bmiScaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      }).start(() => {
        // Step 4: Slide in category text and slider together
        setShowCategory(true);
        setShowSlider(true);
        Animated.parallel([
          Animated.timing(categorySlideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
          Animated.timing(sliderSlideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
        ]).start(() => {
          // Step 5: Animate the dot on the slider
          Animated.timing(dotPositionAnim, {
            toValue: dotPosition,
            duration: 1400,
            delay: 200,
            useNativeDriver: false,
            easing: Easing.out(Easing.cubic),
          }).start();
        });
      });
    });
  }, [value, dotPosition]);

  // State to hold the current animated value
  const [displayValue, setDisplayValue] = useState('0.0');

  useEffect(() => {
    const listenerId = bmiCountAnim.addListener(({ value: v }) => {
      setDisplayValue(v.toFixed(1));
    });

    return () => {
      bmiCountAnim.removeListener(listenerId);
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.contentContainer}>
        {/* Value display - with scale animation */}
        <Animated.View
          style={[
            styles.bmiValueContainer,
            {
              transform: [{ scale: bmiScaleAnim }],
            },
          ]}
        >
          <Text style={styles.bmiValueStatic}>Value = </Text>
          <Text style={styles.bmiValue}>{displayValue}</Text>
        </Animated.View>

        {/* Category - slides in */}
        {showCategory && (
          <Animated.View
            style={[
              styles.categoryContainer,
              {
                transform: [{ translateY: categorySlideAnim }],
              },
            ]}
          >
            <Text style={styles.categoryText}>
              Category: <Text style={styles.categoryBold}>{category}</Text>
            </Text>
          </Animated.View>
        )}

        {/* Slider - slides in */}
        {showSlider && (
          <Animated.View
            style={[
              styles.sliderContainer,
              {
                transform: [{ translateY: sliderSlideAnim }],
              },
            ]}
          >
            <View style={styles.slider}>
              {categories.map((cat, index) => (
                <View
                  key={cat.label}
                  style={[
                    { width: `${sectionWidth}%`, height: '100%', backgroundColor: cat.color },
                  ]}
                />
              ))}
            </View>

            {/* Dot indicator */}
            <Animated.View
              style={[
                styles.dotOuter,
                {
                  left: dotPositionAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            >
              <View style={styles.dotInner} />
            </Animated.View>

            {/* Labels */}
            <View style={styles.labelsContainer}>
              {categories.map((cat) => (
                <Text key={cat.label} style={[styles.label, { width: `${sectionWidth}%` }]}>
                  {cat.label}
                </Text>
              ))}
            </View>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  bmiValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bmiValueStatic: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header2,
    fontWeight: pippTheme.fontWeight.bold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
  bmiValue: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header2,
    fontWeight: pippTheme.fontWeight.bold.toString() as any,
    color: pippTheme.colors.text.primary,
    minWidth: 60,
    textAlign: 'left' as any,
  },
  categoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    minHeight: 20,
    width: '100%',
  },
  categoryText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    lineHeight: pippTheme.lineHeight[20],
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
  },
  categoryBold: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body2,
    lineHeight: pippTheme.lineHeight[20],
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.secondary,
  },
  sliderContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 0,
  },
  slider: {
    width: '100%',
    height: 8,
    borderRadius: 360,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  dotOuter: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: pippTheme.colors.navy[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  labelsContainer: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 8,
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 11,
    lineHeight: 11,
    fontWeight: '400',
    color: pippTheme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default BMISlider;
