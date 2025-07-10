import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export default function DebugPanel({ visible, onClose }: DebugPanelProps) {
  const { state } = useApp();

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Debug Information</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jobs Data</Text>
            <Text style={styles.debugText}>Total Jobs: {state.jobs.length}</Text>
            <Text style={styles.debugText}>Current Index: {state.currentJobIndex}</Text>
            <Text style={styles.debugText}>Saved Jobs: {state.savedJobs.length}</Text>
            <Text style={styles.debugText}>Loading: {state.loading ? 'Yes' : 'No'}</Text>
            <Text style={styles.debugText}>Error: {state.error || 'None'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Job</Text>
            {state.jobs[state.currentJobIndex] ? (
              <View>
                <Text style={styles.debugText}>ID: {state.jobs[state.currentJobIndex].id}</Text>
                <Text style={styles.debugText}>Title: {state.jobs[state.currentJobIndex].title}</Text>
                <Text style={styles.debugText}>Company: {state.jobs[state.currentJobIndex].company}</Text>
              </View>
            ) : (
              <Text style={styles.debugText}>No current job available</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Jobs</Text>
            {state.jobs.map((job, index) => (
              <Text key={job.id} style={styles.debugText}>
                {index}: {job.title} at {job.company}
              </Text>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
  },
  panel: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 60,
    borderRadius: 12,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#64748b',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginBottom: 4,
  },
});