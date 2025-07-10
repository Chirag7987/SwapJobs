import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter, Heart, Trash2, ExternalLink, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import SavedJobCard from '../../components/SavedJobCard';

export default function SavedTab() {
  const { state, dispatch } = useApp();
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const handleRemoveJob = (jobId: string) => {
    Alert.alert(
      'Remove Job',
      'Are you sure you want to remove this job from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch({ type: 'REMOVE_SAVED_JOB', payload: jobId }),
        },
      ]
    );
  };

  const handleApplyToJob = (jobId: string) => {
    Alert.alert(
      'Apply to Job',
      'This will mark the job as applied and redirect you to the application process.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            dispatch({ type: 'APPLY_TO_JOB', payload: jobId });
            Alert.alert('Success', 'Job marked as applied! You can now proceed with the application process.');
          },
        },
      ]
    );
  };

  const filteredJobs = state.savedJobs.filter(job => {
    if (filterBy === 'all') return true;
    if (filterBy === 'applied') return job.applied;
    if (filterBy === 'not-applied') return !job.applied;
    return true;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
    }
    if (sortBy === 'match') {
      return b.matchPercentage - a.matchPercentage;
    }
    if (sortBy === 'salary') {
      const getSalaryNum = (salary: string) => {
        const match = salary.match(/\$(\d+,?\d+)/);
        return match ? parseInt(match[1].replace(',', '')) : 0;
      };
      return getSalaryNum(b.salary) - getSalaryNum(a.salary);
    }
    return 0;
  });

  const appliedJobsCount = state.savedJobs.filter(job => job.applied).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Saved Jobs</Text>
          <View style={styles.statsContainer}>
            <View style={styles.badge}>
              <Heart size={12} color="#7c3aed" />
              <Text style={styles.badgeText}>{state.savedJobs.length}</Text>
            </View>
            {appliedJobsCount > 0 && (
              <View style={styles.appliedBadge}>
                <CheckCircle size={12} color="#10b981" />
                <Text style={styles.appliedBadgeText}>{appliedJobsCount} Applied</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.filters}>
        <View style={styles.filterRow}>
          <View style={styles.filterButtons}>
            <TouchableOpacity 
              style={[styles.filterButton, filterBy === 'all' && styles.activeFilterButton]}
              onPress={() => setFilterBy('all')}>
              <Text style={[styles.filterText, filterBy === 'all' && styles.activeFilterText]}>
                All ({state.savedJobs.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, filterBy === 'not-applied' && styles.activeFilterButton]}
              onPress={() => setFilterBy('not-applied')}>
              <Text style={[styles.filterText, filterBy === 'not-applied' && styles.activeFilterText]}>
                Not Applied ({state.savedJobs.filter(job => !job.applied).length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, filterBy === 'applied' && styles.activeFilterButton]}
              onPress={() => setFilterBy('applied')}>
              <Text style={[styles.filterText, filterBy === 'applied' && styles.activeFilterText]}>
                Applied ({appliedJobsCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'date' && styles.activeSortButton]}
            onPress={() => setSortBy('date')}>
            <Text style={[styles.sortText, sortBy === 'date' && styles.activeSortText]}>Date</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'match' && styles.activeSortButton]}
            onPress={() => setSortBy('match')}>
            <Text style={[styles.sortText, sortBy === 'match' && styles.activeSortText]}>Match %</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'salary' && styles.activeSortButton]}
            onPress={() => setSortBy('salary')}>
            <Text style={[styles.sortText, sortBy === 'salary' && styles.activeSortText]}>Salary</Text>
          </TouchableOpacity>
        </View>
      </View>

      {sortedJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Heart size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>
            {filterBy === 'all' ? 'No Saved Jobs Yet' : 
             filterBy === 'applied' ? 'No Applied Jobs' : 'No Pending Applications'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {filterBy === 'all' ? 
              'Start swiping right on jobs you\'re interested in!' :
              filterBy === 'applied' ?
              'Jobs you\'ve applied to will appear here.' :
              'Save some jobs and start applying!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SavedJobCard
              job={item}
              onRemove={() => handleRemoveJob(item.id)}
              onApply={() => handleApplyToJob(item.id)}
            />
          )}
          contentContainerStyle={styles.jobList}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#7c3aed',
  },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  appliedBadgeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10b981',
  },
  filters: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeFilterButton: {
    backgroundColor: '#7c3aed',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  activeSortButton: {
    backgroundColor: '#7c3aed',
  },
  sortText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  activeSortText: {
    color: '#ffffff',
  },
  jobList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});