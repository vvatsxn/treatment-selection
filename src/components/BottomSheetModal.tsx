import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { pippTheme } from '../theme/pipp';
import PIPPButton from './PIPPButton';

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
}

const BottomSheetModal: React.FC<BottomSheetModalProps> = ({ visible, onClose }) => {
  const slideAnim = React.useRef(new Animated.Value(600)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      setModalVisible(true);
      // Fade in overlay first
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Then slide up modal with timing animation (no overshoot)
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else if (modalVisible) {
      // Slide down modal then fade out overlay
      Animated.timing(slideAnim, {
        toValue: 600,
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

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[styles.overlay, { opacity: fadeAnim }]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <Animated.View
              style={[
                styles.modalContainer,
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              <Text style={styles.header}>More information</Text>

              <View style={styles.contentContainer}>
                <Text style={styles.bodyText}>
                  Placeholder content for the bottom sheet modal.
                </Text>
              </View>

              <PIPPButton
                title="Got it"
                onPress={onClose}
              />
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
  modalContainer: {
    backgroundColor: pippTheme.colors.surface.default,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
  },
  header: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: pippTheme.fontSize.header3,
    fontWeight: pippTheme.fontWeight.bold.toString() as any,
    lineHeight: pippTheme.lineHeight[32],
    color: pippTheme.colors.text.primary,
  },
  contentContainer: {
    gap: 12,
  },
  bodyText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    lineHeight: pippTheme.lineHeight[24],
    color: pippTheme.colors.text.secondary,
  },
});

export default BottomSheetModal;
