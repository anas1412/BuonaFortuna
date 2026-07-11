import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, radius } from '../constants/theme';

type Props = {
  images: string[];
  visible: boolean;
  initialIndex: number;
  onClose: () => void;
};

export default function ImageGallery({ images, visible, initialIndex, onClose }: Props) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const hasScrolled = useRef(false);
  const prevVisible = useRef(visible);

  useEffect(() => {
    if (visible && !prevVisible.current) {
      hasScrolled.current = false;
      setActiveIndex(initialIndex);
    }
    prevVisible.current = visible;
  }, [visible, initialIndex]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Close button */}
        <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.white} />
        </Pressable>

        {/* Counter */}
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {activeIndex + 1}/{images.length}
          </Text>
        </View>

        {/* Gallery */}
        <FlatList
          data={images}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            if (!hasScrolled.current) {
              hasScrolled.current = true;
              return;
            }
            const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
            setActiveIndex(index);
          }}
          renderItem={({ item }) => (
            <ZoomableImage uri={item} width={screenWidth} height={screenHeight} />
          )}
        />
      </View>
    </Modal>
  );
}

function ZoomableImage({ uri, width, height }: { uri: string; width: number; height: number }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, savedScale.value * e.scale);
    })
    .onEnd(() => {
      if (scale.value < 1.2) {
        scale.value = withSpring(1);
      }
      savedScale.value = scale.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={pinch}>
      <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.Image
          source={{ uri }}
          style={[{ width, height }, animatedStyle]}
          resizeMode="contain"
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeBtn: {
    position: 'absolute',
    top: 54,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    position: 'absolute',
    top: 54,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  counterText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
});
