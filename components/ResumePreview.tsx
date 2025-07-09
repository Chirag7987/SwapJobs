import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { User, Briefcase, GraduationCap, Award, Languages, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, CreditCard as Edit3, Eye, EyeOff } from 'lucide-react-native';
import { ParsedResumeData, ResumeParsingResult } from '../types/resume';

interface ResumePreviewProps {
  parseResult: ResumeParsingResult;
  onApplyData: (selectedData: Partial<ParsedResumeData>) => void;
  onClose: () => void;
}

interface FieldSelection {
  personalInfo: boolean;
  professionalSummary: boolean;
  workExperience: boolean;
  education: boolean;
  skills: boolean;
  certifications: boolean;
  languages: boolean;
}

export default function ResumePreview({ parseResult, onApplyData, onClose }: ResumePreviewProps) {
  const [fieldSelection, setFieldSelection] = useState<FieldSelection>({
    personalInfo: true,
    professionalSummary: true,
    workExperience: true,
    education: true,
    skills: true,
    certifications: true,
    languages: true,
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personalInfo: true,
    workExperience: false,
    education: false,
    skills: false,
    certifications: false,
    languages: false,
  });

  if (!parseResult.success || !parseResult.data) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Parsing Failed</Text>
        <Text style={styles.errorMessage}>{parseResult.error}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const data = parseResult.data;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleFieldSelection = (field: keyof FieldSelection) => {
    setFieldSelection(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleApplySelected = () => {
    const selectedData: Partial<ParsedResumeData> = {};
    
    if (fieldSelection.personalInfo) selectedData.personalInfo = data.personalInfo;
    if (fieldSelection.professionalSummary) selectedData.professionalSummary = data.professionalSummary;
    if (fieldSelection.workExperience) selectedData.workExperience = data.workExperience;
    if (fieldSelection.education) selectedData.education = data.education;
    if (fieldSelection.skills) selectedData.skills = data.skills;
    if (fieldSelection.certifications) selectedData.certifications = data.certifications;
    if (fieldSelection.languages) selectedData.languages = data.languages;

    onApplyData(selectedData);
  };

  const renderPersonalInfo = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.fieldLabel}>Name: <Text style={styles.fieldValue}>{data.personalInfo.fullName}</Text></Text>
      <Text style={styles.fieldLabel}>Email: <Text style={styles.fieldValue}>{data.personalInfo.email}</Text></Text>
      <Text style={styles.fieldLabel}>Phone: <Text style={styles.fieldValue}>{data.personalInfo.phone}</Text></Text>
      <Text style={styles.fieldLabel}>Location: <Text style={styles.fieldValue}>{data.personalInfo.location}</Text></Text>
      {data.personalInfo.website && (
        <Text style={styles.fieldLabel}>Website: <Text style={styles.fieldValue}>{data.personalInfo.website}</Text></Text>
      )}
      {data.personalInfo.linkedin && (
        <Text style={styles.fieldLabel}>LinkedIn: <Text style={styles.fieldValue}>{data.personalInfo.linkedin}</Text></Text>
      )}
    </View>
  );

  const renderWorkExperience = () => (
    <View style={styles.sectionContent}>
      {data.workExperience.map((exp, index) => (
        <View key={exp.id} style={styles.experienceItem}>
          <Text style={styles.experienceTitle}>{exp.position}</Text>
          <Text style={styles.experienceCompany}>{exp.company}</Text>
          <Text style={styles.experienceDate}>
            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
          </Text>
          <View style={styles.responsibilitiesList}>
            {exp.responsibilities.slice(0, 2).map((resp, idx) => (
              <Text key={idx} style={styles.responsibilityItem}>• {resp}</Text>
            ))}
            {exp.responsibilities.length > 2 && (
              <Text style={styles.moreItems}>+{exp.responsibilities.length - 2} more items</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderEducation = () => (
    <View style={styles.sectionContent}>
      {data.education.map((edu) => (
        <View key={edu.id} style={styles.educationItem}>
          <Text style={styles.educationDegree}>{edu.degree} in {edu.field}</Text>
          <Text style={styles.educationSchool}>{edu.institution}</Text>
          <Text style={styles.educationYear}>Graduated: {edu.graduationYear}</Text>
          {edu.gpa && <Text style={styles.educationGpa}>GPA: {edu.gpa}</Text>}
        </View>
      ))}
    </View>
  );

  const renderSkills = () => (
    <View style={styles.sectionContent}>
      <View style={styles.skillsContainer}>
        {data.skills.slice(0, 8).map((skill) => (
          <View key={skill.id} style={styles.skillChip}>
            <Text style={styles.skillText}>{skill.name}</Text>
          </View>
        ))}
        {data.skills.length > 8 && (
          <View style={styles.skillChip}>
            <Text style={styles.skillText}>+{data.skills.length - 8} more</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CheckCircle size={24} color="#10b981" />
          <View>
            <Text style={styles.headerTitle}>Resume Parsed Successfully</Text>
            <Text style={styles.headerSubtitle}>
              Confidence: {Math.round(parseResult.confidence * 100)}%
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeIconButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {parseResult.warnings.length > 0 && (
        <View style={styles.warningsContainer}>
          <AlertTriangle size={16} color="#f59e0b" />
          <View style={styles.warningsContent}>
            <Text style={styles.warningsTitle}>Please Review:</Text>
            {parseResult.warnings.map((warning, index) => (
              <Text key={index} style={styles.warningText}>• {warning}</Text>
            ))}
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity
              style={styles.sectionTitleContainer}
              onPress={() => toggleSection('personalInfo')}
            >
              <User size={20} color="#7c3aed" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
              {expandedSections.personalInfo ? (
                <Eye size={16} color="#64748b" />
              ) : (
                <EyeOff size={16} color="#64748b" />
              )}
            </TouchableOpacity>
            <Switch
              value={fieldSelection.personalInfo}
              onValueChange={() => toggleFieldSelection('personalInfo')}
              trackColor={{ false: '#e2e8f0', true: '#7c3aed' }}
              thumbColor="#ffffff"
            />
          </View>
          {expandedSections.personalInfo && renderPersonalInfo()}
        </View>

        {/* Professional Summary */}
        {data.professionalSummary && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Edit3 size={20} color="#7c3aed" />
                <Text style={styles.sectionTitle}>Professional Summary</Text>
              </View>
              <Switch
                value={fieldSelection.professionalSummary}
                onValueChange={() => toggleFieldSelection('professionalSummary')}
                trackColor={{ false: '#e2e8f0', true: '#7c3aed' }}
                thumbColor="#ffffff"
              />
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.summaryText}>{data.professionalSummary}</Text>
            </View>
          </View>
        )}

        {/* Work Experience */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity
              style={styles.sectionTitleContainer}
              onPress={() => toggleSection('workExperience')}
            >
              <Briefcase size={20} color="#7c3aed" />
              <Text style={styles.sectionTitle}>Work Experience ({data.workExperience.length})</Text>
              {expandedSections.workExperience ? (
                <Eye size={16} color="#64748b" />
              ) : (
                <EyeOff size={16} color="#64748b" />
              )}
            </TouchableOpacity>
            <Switch
              value={fieldSelection.workExperience}
              onValueChange={() => toggleFieldSelection('workExperience')}
              trackColor={{ false: '#e2e8f0', true: '#7c3aed' }}
              thumbColor="#ffffff"
            />
          </View>
          {expandedSections.workExperience && renderWorkExperience()}
        </View>

        {/* Education */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity
              style={styles.sectionTitleContainer}
              onPress={() => toggleSection('education')}
            >
              <GraduationCap size={20} color="#7c3aed" />
              <Text style={styles.sectionTitle}>Education ({data.education.length})</Text>
              {expandedSections.education ? (
                <Eye size={16} color="#64748b" />
              ) : (
                <EyeOff size={16} color="#64748b" />
              )}
            </TouchableOpacity>
            <Switch
              value={fieldSelection.education}
              onValueChange={() => toggleFieldSelection('education')}
              trackColor={{ false: '#e2e8f0', true: '#7c3aed' }}
              thumbColor="#ffffff"
            />
          </View>
          {expandedSections.education && renderEducation()}
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity
              style={styles.sectionTitleContainer}
              onPress={() => toggleSection('skills')}
            >
              <Award size={20} color="#7c3aed" />
              <Text style={styles.sectionTitle}>Skills ({data.skills.length})</Text>
              {expandedSections.skills ? (
                <Eye size={16} color="#64748b" />
              ) : (
                <EyeOff size={16} color="#64748b" />
              )}
            </TouchableOpacity>
            <Switch
              value={fieldSelection.skills}
              onValueChange={() => toggleFieldSelection('skills')}
              trackColor={{ false: '#e2e8f0', true: '#7c3aed' }}
              thumbColor="#ffffff"
            />
          </View>
          {expandedSections.skills && renderSkills()}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApplySelected}>
          <CheckCircle size={20} color="#ffffff" />
          <Text style={styles.applyButtonText}>Apply Selected Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  closeIconButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 18,
    color: '#64748b',
  },
  warningsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    gap: 12,
  },
  warningsContent: {
    flex: 1,
  },
  warningsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#92400e',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#92400e',
    lineHeight: 18,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    flex: 1,
  },
  sectionContent: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#475569',
  },
  fieldValue: {
    fontFamily: 'Inter-Medium',
    color: '#1e293b',
  },
  summaryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1e293b',
    lineHeight: 20,
  },
  experienceItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  experienceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  experienceCompany: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#7c3aed',
    marginBottom: 4,
  },
  experienceDate: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    marginBottom: 8,
  },
  responsibilitiesList: {
    gap: 4,
  },
  responsibilityItem: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#475569',
    lineHeight: 18,
  },
  moreItems: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#7c3aed',
    fontStyle: 'italic',
  },
  educationItem: {
    marginBottom: 12,
  },
  educationDegree: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  educationSchool: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#7c3aed',
    marginBottom: 4,
  },
  educationYear: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  educationGpa: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#10b981',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#3730a3',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ef4444',
    marginTop: 20,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});