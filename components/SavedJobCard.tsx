import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { MapPin, DollarSign, Clock, ExternalLink, Trash2, ChevronDown, ChevronUp, CircleCheck as CheckCircle, Briefcase } from 'lucide-react-native';
import { SavedJob } from '../types';

interface SavedJobCardProps {
  job: SavedJob;
  onRemove: () => void;
  onApply: () => void;
}

export default function SavedJobCard({ job, onRemove, onApply }: SavedJobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const heightValue = useSharedValue(0);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    heightValue.value = withTiming(isExpanded ? 0 : 1, { duration: 300 });
  };

  const expandedStyle = useAnimatedStyle(() => {
    return {
      opacity: heightValue.value,
      maxHeight: heightValue.value * 400,
    };
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Image source={{ uri: job.logo }} style={styles.logo} />
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.companyName}>{job.company}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{job.matchPercentage}%</Text>
          </View>
          {job.applied && (
            <View style={styles.appliedBadge}>
              <CheckCircle size={12} color="#10b981" />
              <Text style={styles.appliedText}>Applied</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <MapPin size={14} color="#64748b" />
            <Text style={styles.detailText}>{job.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <DollarSign size={14} color="#64748b" />
            <Text style={styles.detailText}>{job.salary}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Clock size={14} color="#64748b" />
            <Text style={styles.detailText}>{job.postedDate}</Text>
          </View>
          <View style={styles.typeContainer}>
            <Text style={styles.typeText}>{job.type}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={isExpanded ? undefined : 2}>
        {job.description}
      </Text>

      <Animated.View style={[styles.expandedContent, expandedStyle]}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {job.requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <CheckCircle size={12} color="#10b981" />
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={styles.benefitsContainer}>
            {job.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitChip}>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.applicationSection}>
          <Text style={styles.deadlineText}>Deadline: {job.deadline}</Text>
          <Text style={styles.savedDateText}>Saved on: {new Date(job.savedDate).toLocaleDateString()}</Text>
        </View>
      </Animated.View>

      <View style={styles.skillsContainer}>
        {job.skills.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillChip}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {job.skills.length > 3 && (
          <View style={styles.skillChip}>
            <Text style={styles.skillText}>+{job.skills.length - 3}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.viewButton} onPress={toggleExpanded}>
          {isExpanded ? <ChevronUp size={16} color="#7c3aed" /> : <ChevronDown size={16} color="#7c3aed" />}
          <Text style={styles.viewButtonText}>{isExpanded ? 'Less' : 'Details'}</Text>
        </TouchableOpacity>
        
        {!job.applied && (
          <TouchableOpacity style={styles.applyButton} onPress={onApply}>
            <Briefcase size={16} color="#ffffff" />
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Trash2 size={16} color="#ef4444" />
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  matchBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  appliedText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#10b981',
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  typeContainer: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#475569',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  expandedContent: {
    overflow: 'hidden',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    flex: 1,
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  benefitChip: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  benefitText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#10b981',
  },
  applicationSection: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  deadlineText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#dc2626',
    marginBottom: 4,
  },
  savedDateText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  skillChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#475569',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#7c3aed',
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#10b981',
    borderRadius: 8,
    gap: 6,
  },
  applyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  removeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    gap: 6,
  },
  removeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ef4444',
  },
});