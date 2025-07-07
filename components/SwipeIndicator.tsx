import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { X, Heart } from 'lucide-react-native';

interface SwipeIndicatorProps {
  direction: 'left' | 'right';
  style: any;
}

export default function SwipeIndicator({ direction, style }: SwipeIndicatorProps) {
  return (
    <Animated.View
      style={[
        styles.indicator,
        direction === 'left' ? styles.passIndicator : styles.likeIndicator,
        style,
      ]}
      pointerEvents="none">
      {direction === 'left' ? (
        <X size={32} color="#ffffff" />
      ) : (
        <Heart size={32} color="#ffffff" />
      )}
      <Text style={styles.indicatorText}>
        {direction === 'left' ? 'PASS' : 'LIKE'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: -60,
    gap: 8,
  },
  passIndicator: {
    backgroundColor: '#ef4444',
    left: 20,
  },
  likeIndicator: {
    backgroundColor: '#10b981',
    right: 20,
  },
  indicatorText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
});