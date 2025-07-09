import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Upload, FileText, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ResumeParserService } from '../services/resumeParser';
import { ParsedResumeData, ResumeParsingResult } from '../types/resume';

interface ResumeUploaderProps {
  onParseComplete: (result: ResumeParsingResult) => void;
  disabled?: boolean;
}

export default function ResumeUploader({ onParseComplete, disabled }: ResumeUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async () => {
    if (disabled) return;

    try {
      // Use DocumentPicker for web compatibility
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      if (!file) {
        Alert.alert('Error', 'No file selected');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Parse the resume
      const parseResult = await ResumeParserService.parseResume(file.uri, file.name);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onParseComplete(parseResult);
      }, 500);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      
      if (Platform.OS === 'web') {
        Alert.alert('Error', 'File upload failed. Please try again.');
      } else {
        Alert.alert(
          'Upload Error',
          'Failed to upload resume. Please check your file and try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.uploadButton,
          disabled && styles.uploadButtonDisabled,
          isUploading && styles.uploadButtonUploading
        ]}
        onPress={handleFileUpload}
        disabled={disabled || isUploading}
      >
        {isUploading ? (
          <View style={styles.uploadingContent}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={styles.uploadingText}>
              Parsing Resume... {uploadProgress}%
            </Text>
          </View>
        ) : (
          <View style={styles.uploadContent}>
            <Upload size={24} color="#ffffff" />
            <Text style={styles.uploadButtonText}>Upload Resume</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <FileText size={16} color="#64748b" />
          <Text style={styles.infoText}>
            Supported formats: PDF, DOC, DOCX
          </Text>
        </View>
        <View style={styles.infoRow}>
          <AlertCircle size={16} color="#64748b" />
          <Text style={styles.infoText}>
            Maximum file size: 5MB
          </Text>
        </View>
      </View>

      {isUploading && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${uploadProgress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Extracting information from your resume...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  uploadButtonUploading: {
    backgroundColor: '#8b5cf6',
  },
  uploadContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  uploadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  uploadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  infoContainer: {
    marginTop: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
});