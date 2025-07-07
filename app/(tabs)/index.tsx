import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useApp } from '../../context/AppContext';
import JobCard from '../../components/JobCard';
import SwipeIndicator from '../../components/SwipeIndicator';
import DebugPanel from '../../components/DebugPanel';
import { Bug, RefreshCw, Heart } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DiscoverTab() {
  const { state, dispatch } = useApp();
  const [showDebug, setShowDebug] = useState(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const currentJob = state.jobs[state.currentJobIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      dispatch({ type: 'SAVE_JOB', payload: currentJob });
    }
    dispatch({ type: 'NEXT_JOB' });
    resetCard();
  };

  const handleLike = () => {
    dispatch({ type: 'SAVE_JOB', payload: currentJob });
    dispatch({ type: 'NEXT_JOB' });
    resetCard();
  };

  const handlePass = () => {
    dispatch({ type: 'NEXT_JOB' });
    resetCard();
  };

  const resetCard = () => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    rotate.value = withSpring(0);
    scale.value = withSpring(1);
    opacity.value = withSpring(1);
  };

  const resetJobIndex = () => {
    dispatch({ type: 'RESET_JOB_INDEX' });
    resetCard();
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      translateX.value = gestureState.dx;
      translateY.value = gestureState.dy;
      rotate.value = gestureState.dx / 10;
      scale.value = 1 - Math.abs(gestureState.dx) / (SCREEN_WIDTH * 3);
    },
    onPanResponderRelease: (_, gestureState) => {
      const threshold = SCREEN_WIDTH * 0.3;

      if (gestureState.dx > threshold) {
        // Swipe right - Like
        translateX.value = withSpring(SCREEN_WIDTH);
        opacity.value = withSpring(0, {}, () => {
          runOnJS(handleSwipe)('right');
        });
      } else if (gestureState.dx < -threshold) {
        // Swipe left - Pass
        translateX.value = withSpring(-SCREEN_WIDTH);
        opacity.value = withSpring(0, {}, () => {
          runOnJS(handleSwipe)('left');
        });
      } else {
        // Snap back
        resetCard();
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const swipeDirection = useAnimatedStyle(() => {
    const direction =
      translateX.value > 50 ? 'right' : translateX.value < -50 ? 'left' : null;
    return {
      opacity: direction ? Math.abs(translateX.value) / 100 : 0,
    };
  });

  if (state.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingTitle}>Loading Jobs...</Text>
          <Text style={styles.loadingSubtitle}>
            Please wait while we fetch opportunities
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (state.error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSubtitle}>{state.error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch({ type: 'RETRY_FETCH' })}
          >
            <RefreshCw size={20} color="#ffffff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentJob) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover Jobs</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowDebug(true)}
              style={styles.debugButton}
            >
              <Bug size={20} color="#7c3aed" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No More Jobs!</Text>
          <Text style={styles.emptySubtitle}>
            You've viewed all available jobs. Check back later for new
            opportunities.
          </Text>
          <TouchableOpacity style={styles.resetButton} onPress={resetJobIndex}>
            <RefreshCw size={20} color="#ffffff" />
            <Text style={styles.resetButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>

        <DebugPanel visible={showDebug} onClose={() => setShowDebug(false)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerSubtitle}>
            {state.currentJobIndex + 1} of {state.jobs.length}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.savedCounter}>
            <Heart size={16} color="#7c3aed" />
            <Text style={styles.savedCountText}>{state.savedJobs.length}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowDebug(true)}
            style={styles.debugButton}
          >
            <Bug size={20} color="#7c3aed" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View
          style={[styles.card, animatedStyle]}
          {...panResponder.panHandlers}
        >
          <JobCard job={currentJob} onLike={handleLike} onPass={handlePass} />
        </Animated.View>

        <SwipeIndicator direction="left" style={swipeDirection} />
        <SwipeIndicator direction="right" style={swipeDirection} />
      </View>

      <DebugPanel visible={showDebug} onClose={() => setShowDebug(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    marginBottom: 40,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savedCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  savedCountText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#7c3aed',
  },
  debugButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    marginBottom: 40,
  },
  debugInfo: {
    backgroundColor: '#fef3c7',
    margin: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#92400e',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#dc2626',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
  },
  instructions: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});