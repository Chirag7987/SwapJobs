import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  Dimensions,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Mail,
  MapPin,
  DollarSign,
  Plus,
  CreditCard as Edit3,
  Briefcase,
  GraduationCap,
  Camera,
  Check,
  X,
  Save,
  CircleAlert as AlertCircle,
  Upload,
  Image as ImageIcon,
  Trash2,
  Calendar,
  FileText,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import ResumeUploader from '../../components/ResumeUploader';
import ResumePreview from '../../components/ResumePreview';
import { ParsedResumeData, ResumeParsingResult } from '../../types/resume';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ValidationErrors {
  [key: string]: string;
}

interface FormData {
  fullName: string;
  email: string;
  location: string;
  expectedSalary: string;
  bio: string;
  phone: string;
  website: string;
  linkedin: string;
}

interface WorkExperienceForm {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string;
  achievements: string;
}

interface EducationForm {
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
  gpa: string;
  achievements: string;
  honors: string;
}

export default function ProfileTab() {
  const { state, dispatch } = useApp();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: state.user?.fullName || '',
    email: state.user?.email || '',
    location: state.user?.location || '',
    expectedSalary: state.user?.expectedSalary || '',
    bio: state.user?.bio || '',
    phone: state.user?.phone || '',
    website: state.user?.website || '',
    linkedin: state.user?.linkedin || '',
  });

  // Work Experience Form
  const [workExperienceForm, setWorkExperienceForm] =
    useState<WorkExperienceForm>({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      responsibilities: '',
      achievements: '',
    });

  // Education Form
  const [educationForm, setEducationForm] = useState<EducationForm>({
    institution: '',
    degree: '',
    field: '',
    graduationYear: '',
    gpa: '',
    achievements: '',
    honors: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [profileImage, setProfileImage] = useState<string | null>(
    state.user?.profilePicture || null
  );
  const [imageUploading, setImageUploading] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showResumeUploader, setShowResumeUploader] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [parseResult, setParseResult] = useState<ResumeParsingResult | null>(null);

  // Animation values
  const successOpacity = useSharedValue(0);
  const errorShake = useSharedValue(0);
  const imageScale = useSharedValue(1);

  // Refs for managing focus
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRefs = useRef<Record<string, TextInput>>({});

  // Keyboard event listeners
  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateURL = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    // Required fields
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    // Optional field validations
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.website && !validateURL(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    if (formData.linkedin && !validateURL(formData.linkedin)) {
      newErrors.linkedin = 'Please enter a valid LinkedIn URL';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validateWorkExperience = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!workExperienceForm.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!workExperienceForm.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!workExperienceForm.startDate.trim()) {
      newErrors.startDate = 'Start date is required';
    }

    if (!workExperienceForm.current && !workExperienceForm.endDate.trim()) {
      newErrors.endDate = 'End date is required (or mark as current)';
    }

    if (!workExperienceForm.responsibilities.trim()) {
      newErrors.responsibilities = 'Responsibilities are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEducation = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!educationForm.institution.trim()) {
      newErrors.institution = 'Institution name is required';
    }

    if (!educationForm.degree.trim()) {
      newErrors.degree = 'Degree is required';
    }

    if (!educationForm.field.trim()) {
      newErrors.field = 'Field of study is required';
    }

    if (!educationForm.graduationYear.trim()) {
      newErrors.graduationYear = 'Graduation year is required';
    } else if (!/^\d{4}$/.test(educationForm.graduationYear)) {
      newErrors.graduationYear = 'Please enter a valid 4-digit year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time validation
  const handleFieldChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error for this field if it exists
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }

      // Real-time validation for specific fields
      if (field === 'email' && value && !validateEmail(value)) {
        setErrors((prev) => ({ ...prev, email: 'Invalid email format' }));
      }
    },
    [errors]
  );

  // Image picker functions
  const requestImagePermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setErrors((prev) => ({
          ...prev,
          image: 'Permission to access photos is required',
        }));
        return false;
      }
    }
    return true;
  };

  const pickImageFromLibrary = async () => {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) return;

    setImageUploading(true);
    imageScale.value = withSpring(0.95);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);

        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setShowImageOptions(false);
        successOpacity.value = withTiming(1, { duration: 300 });
        setTimeout(() => {
          successOpacity.value = withTiming(0, { duration: 300 });
        }, 2000);
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, image: 'Failed to select image' }));
      errorShake.value = withSpring(1, {}, () => {
        errorShake.value = withSpring(0);
      });
    } finally {
      setImageUploading(false);
      imageScale.value = withSpring(1);
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      // Web doesn't support camera, fallback to library
      pickImageFromLibrary();
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setErrors((prev) => ({
        ...prev,
        image: 'Camera permission is required',
      }));
      return;
    }

    setImageUploading(true);
    imageScale.value = withSpring(0.95);

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        setShowImageOptions(false);

        successOpacity.value = withTiming(1, { duration: 300 });
        setTimeout(() => {
          successOpacity.value = withTiming(0, { duration: 300 });
        }, 2000);
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, image: 'Failed to take photo' }));
    } finally {
      setImageUploading(false);
      imageScale.value = withSpring(1);
    }
  };

  // Form submission
  const handleSave = async () => {
    if (!validateForm()) {
      errorShake.value = withSpring(1, {}, () => {
        errorShake.value = withSpring(0);
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const updatedUser = {
        id: state.user?.id || '1',
        ...formData,
        skills: state.user?.skills || [],
        workExperience: state.user?.workExperience || [],
        education: state.user?.education || [],
        profilePicture: profileImage,
      };

      dispatch({
        type: 'SET_USER',
        payload: {
          ...updatedUser,
          profilePicture: updatedUser.profilePicture ?? undefined,
        },
      });
      setEditingSection(null);
      setErrors({});
      setSubmitStatus('success');

      // Success animation
      successOpacity.value = withTiming(1, { duration: 300 });
      setTimeout(() => {
        successOpacity.value = withTiming(0, { duration: 300 });
        setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      setSubmitStatus('error');
      setErrors((prev) => ({
        ...prev,
        submit: 'Failed to save profile. Please try again.',
      }));

      errorShake.value = withSpring(1, {}, () => {
        errorShake.value = withSpring(0);
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: state.user?.fullName || '',
      email: state.user?.email || '',
      location: state.user?.location || '',
      expectedSalary: state.user?.expectedSalary || '',
      bio: state.user?.bio || '',
      phone: state.user?.phone || '',
      website: state.user?.website || '',
      linkedin: state.user?.linkedin || '',
    });
    setErrors({});
    setEditingSection(null);
    setSubmitStatus('idle');
    Keyboard.dismiss();
  };

  // Skills management
  const addSkill = () => {
    if (!newSkill.trim()) {
      setErrors((prev) => ({ ...prev, skill: 'Please enter a skill name' }));
      return;
    }

    const updatedUser = {
      ...state.user!,
      skills: [
        ...(state.user?.skills || []),
        {
          id: Date.now().toString(),
          name: newSkill.trim(),
          level: 'Intermediate' as const,
          endorsements: 0,
        },
      ],
    };

    dispatch({ type: 'SET_USER', payload: updatedUser });
    setNewSkill('');
    setErrors((prev) => ({ ...prev, skill: '' }));
  };

  const removeSkill = (skillId: string) => {
    const updatedUser = {
      ...state.user!,
      skills: state.user?.skills?.filter((skill) => skill.id !== skillId) || [],
    };

    dispatch({ type: 'SET_USER', payload: updatedUser });
  };

  // Work Experience management
  const saveWorkExperience = async () => {
    if (!validateWorkExperience()) {
      errorShake.value = withSpring(1, {}, () => {
        errorShake.value = withSpring(0);
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newExperience = {
        id: Date.now().toString(),
        company: workExperienceForm.company.trim(),
        position: workExperienceForm.position.trim(),
        duration: workExperienceForm.current
          ? `${workExperienceForm.startDate} - Present`
          : `${workExperienceForm.startDate} - ${workExperienceForm.endDate}`,
        responsibilities: workExperienceForm.responsibilities
          .trim()
          .split('\n')
          .filter((r) => r.trim()),
        current: workExperienceForm.current,
      };

      const updatedUser = {
        ...state.user!,
        workExperience: [...(state.user?.workExperience || []), newExperience],
      };

      dispatch({ type: 'SET_USER', payload: updatedUser });

      // Reset form
      setWorkExperienceForm({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        responsibilities: '',
        achievements: '',
      });

      setErrors({});

      successOpacity.value = withTiming(1, { duration: 300 });
      setTimeout(() => {
        successOpacity.value = withTiming(0, { duration: 300 });
      }, 2000);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        workExperience: 'Failed to save work experience',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeWorkExperience = (expId: string) => {
    const updatedUser = {
      ...state.user!,
      workExperience:
        state.user?.workExperience?.filter((exp) => exp.id !== expId) || [],
    };

    dispatch({ type: 'SET_USER', payload: updatedUser });
  };

  // Education management
  const saveEducation = async () => {
    if (!validateEducation()) {
      errorShake.value = withSpring(1, {}, () => {
        errorShake.value = withSpring(0);
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newEducation = {
        id: Date.now().toString(),
        institution: educationForm.institution.trim(),
        degree: educationForm.degree.trim(),
        field: educationForm.field.trim(),
        graduationYear: parseInt(educationForm.graduationYear),
        gpa: educationForm.gpa.trim(),
        achievements: educationForm.achievements
          .trim()
          .split('\n')
          .filter((a) => a.trim()),
      };

      const updatedUser = {
        ...state.user!,
        education: [...(state.user?.education || []), newEducation],
      };

      dispatch({ type: 'SET_USER', payload: updatedUser });

      // Reset form
      setEducationForm({
        institution: '',
        degree: '',
        field: '',
        graduationYear: '',
        gpa: '',
        achievements: '',
        honors: '',
      });

      setErrors({});

      successOpacity.value = withTiming(1, { duration: 300 });
      setTimeout(() => {
        successOpacity.value = withTiming(0, { duration: 300 });
      }, 2000);
    } catch (error) {
      setErrors((prev) => ({ ...prev, education: 'Failed to save education' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeEducation = (eduId: string) => {
    const updatedUser = {
      ...state.user!,
      education: state.user?.education?.filter((edu) => edu.id !== eduId) || [],
    };

    dispatch({ type: 'SET_USER', payload: updatedUser });
  };

  const handleResumeParseComplete = (result: ResumeParsingResult) => {
    setParseResult(result);
    setShowResumeUploader(false);
    setShowResumePreview(true);
  };

  const handleApplyParsedData = (selectedData: Partial<ParsedResumeData>) => {
    // Apply personal information
    if (selectedData.personalInfo) {
      setFormData(prev => ({
        ...prev,
        fullName: selectedData.personalInfo?.fullName || prev.fullName,
        email: selectedData.personalInfo?.email || prev.email,
        phone: selectedData.personalInfo?.phone || prev.phone,
        location: selectedData.personalInfo?.location || prev.location,
        website: selectedData.personalInfo?.website || prev.website,
        linkedin: selectedData.personalInfo?.linkedin || prev.linkedin,
      }));
    }

    // Apply professional summary
    if (selectedData.professionalSummary) {
      setFormData(prev => ({
        ...prev,
        bio: selectedData.professionalSummary || prev.bio,
      }));
    }

    // Apply work experience
    if (selectedData.workExperience) {
      const mappedExperience = selectedData.workExperience.map(exp => ({
        id: exp.id,
        company: exp.company,
        position: exp.position,
        duration: `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`,
        responsibilities: exp.responsibilities,
        current: exp.current,
      }));
      const updatedUser = {
        ...state.user!,
        workExperience: mappedExperience,
      };
      dispatch({ type: 'SET_USER', payload: updatedUser });
    }

    // Apply education
    if (selectedData.education) {
      const mappedEducation = selectedData.education.map(edu => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        graduationYear: edu.graduationYear,
        gpa: edu.gpa,
        achievements: edu.achievements,
      }));
      const updatedUser = {
        ...state.user!,
        education: mappedEducation,
      };
      dispatch({ type: 'SET_USER', payload: updatedUser });
    }

    // Apply skills
    if (selectedData.skills) {
      const mappedSkills = selectedData.skills.map(skill => ({
        id: skill.id,
        name: skill.name,
        level: skill.level || 'Intermediate',
        endorsements: 0,
      }));
      const updatedUser = {
        ...state.user!,
        skills: mappedSkills,
      };
      dispatch({ type: 'SET_USER', payload: updatedUser });
    }

    setShowResumePreview(false);
    successOpacity.value = withTiming(1, { duration: 300 });
    setTimeout(() => {
      successOpacity.value = withTiming(0, { duration: 300 });
    }, 2000);
  };

  // Animated styles
  const successAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: successOpacity.value,
      transform: [{ scale: successOpacity.value }],
    };
  });

  const errorAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: errorShake.value * 10 }],
    };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: imageScale.value }],
    };
  });

  // Progress calculation
  const getProfileCompletion = () => {
    let completed = 0;
    const total = 8;

    if (formData.fullName && formData.email && formData.location) completed++;
    if (profileImage) completed++;
    if (formData.bio) completed++;
    if (formData.phone) completed++;
    if (state.user?.skills && state.user.skills.length > 0) completed++;
    if (state.user?.workExperience && state.user.workExperience.length > 0)
      completed++;
    if (state.user?.education && state.user.education.length > 0) completed++;
    if (formData.website || formData.linkedin) completed++;

    return Math.round((completed / total) * 100);
  };

  const ProfileSection = ({ title, icon: Icon, children, sectionKey }: any) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Icon size={20} color="#7c3aed" />
          <Text style={styles.sectionTitle}>{title}</Text>
          {sectionKey === 'basic' && (
            <TouchableOpacity
              style={styles.resumeUploadButton}
              onPress={() => setShowResumeUploader(true)}
            >
              <Upload size={16} color="#7c3aed" />
              <Text style={styles.resumeUploadText}>Import from Resume</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditingSection(sectionKey)}
        >
          <Edit3 size={16} color="#7c3aed" />
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );

  const renderPhotoSection = () => (
    <View style={styles.photoSection}>
      <Text style={styles.photoSectionTitle}>Profile Photo</Text>
      <View style={styles.photoContainer}>
        <Animated.View style={[styles.photoWrapper, imageAnimatedStyle]}>
          <TouchableOpacity
            style={styles.profilePicture}
            onPress={() => setShowImageOptions(true)}
            disabled={imageUploading}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <User size={32} color="#64748b" />
              </View>
            )}
            {imageUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.photoActions}>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => setShowImageOptions(true)}
            disabled={imageUploading}
          >
            <Camera size={16} color="#7c3aed" />
            <Text style={styles.photoButtonText}>
              {profileImage ? 'Change Photo' : 'Add Photo'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Options Modal */}
      {showImageOptions && (
        <View style={styles.imageOptionsOverlay}>
          <View style={styles.imageOptionsModal}>
            <Text style={styles.imageOptionsTitle}>Select Photo</Text>
            <TouchableOpacity
              style={styles.imageOption}
              onPress={pickImageFromLibrary}
            >
              <ImageIcon size={20} color="#7c3aed" />
              <Text style={styles.imageOptionText}>Choose from Library</Text>
            </TouchableOpacity>
            {Platform.OS !== 'web' && (
              <TouchableOpacity style={styles.imageOption} onPress={takePhoto}>
                <Camera size={20} color="#7c3aed" />
                <Text style={styles.imageOptionText}>Take Photo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.imageOptionCancel}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.imageOptionCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
    </View>
  );

  const renderBasicInfo = () => (
    <ProfileSection title="Basic Information" icon={User} sectionKey="basic">
      {editingSection === 'basic' ? (
        <Animated.View style={[styles.editForm, errorAnimatedStyle]}>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={(ref) => {
                  if (ref) inputRefs.current['fullName'] = ref;
                }}
                style={[styles.input, errors.fullName && styles.inputError]}
                value={formData.fullName}
                onChangeText={(text) => handleFieldChange('fullName', text)}
                placeholder="Your full name"
                returnKeyType="next"
                onSubmitEditing={() => {
                  setTimeout(() => inputRefs.current['email']?.focus(), 100);
                }}
                blurOnSubmit={false}
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={(ref) => {
                  if (ref) inputRefs.current['email'] = ref;
                }}
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(text) => handleFieldChange('email', text)}
                placeholder="your.email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => {
                  setTimeout(() => inputRefs.current['phone']?.focus(), 100);
                }}
                blurOnSubmit={false}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                ref={(ref) => {
                  inputRefs.current['phone'] = ref!;
                }}
                style={[styles.input, errors.phone && styles.inputError]}
                value={formData.phone}
                onChangeText={(text) => handleFieldChange('phone', text)}
                placeholder="+1 (555) 123-4567"
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => {
                  setTimeout(() => inputRefs.current['location']?.focus(), 100);
                }}
                blurOnSubmit={false}
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Location <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={(ref) => {
                  inputRefs.current['location'] = ref!;
                }}
                style={[styles.input, errors.location && styles.inputError]}
                value={formData.location}
                onChangeText={(text) => handleFieldChange('location', text)}
                placeholder="City, State"
                returnKeyType="next"
                onSubmitEditing={() => {
                  setTimeout(
                    () => inputRefs.current['expectedSalary']?.focus(),
                    100
                  );
                }}
                blurOnSubmit={false}
              />
              {errors.location && (
                <Text style={styles.errorText}>{errors.location}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expected Salary</Text>
              <TextInput
                ref={(ref) => {
                  inputRefs.current['expectedSalary'] = ref!;
                }}
                style={styles.input}
                value={formData.expectedSalary}
                onChangeText={(text) =>
                  handleFieldChange('expectedSalary', text)
                }
                placeholder="$80,000 - $120,000"
                returnKeyType="next"
                onSubmitEditing={() => {
                  setTimeout(() => inputRefs.current['website']?.focus(), 100);
                }}
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput
                ref={(ref) => {
                  inputRefs.current['website'] = ref!;
                }}
                style={[styles.input, errors.website && styles.inputError]}
                value={formData.website}
                onChangeText={(text) => handleFieldChange('website', text)}
                placeholder="yourwebsite.com"
                keyboardType="url"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => {
                  setTimeout(() => inputRefs.current['linkedin']?.focus(), 100);
                }}
                blurOnSubmit={false}
              />
              {errors.website && (
                <Text style={styles.errorText}>{errors.website}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>LinkedIn</Text>
            <TextInput
              ref={(ref) => {
                inputRefs.current['linkedin'] = ref!;
              }}
              style={[styles.input, errors.linkedin && styles.inputError]}
              value={formData.linkedin}
              onChangeText={(text) => handleFieldChange('linkedin', text)}
              placeholder="linkedin.com/in/yourprofile"
              keyboardType="url"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => {
                setTimeout(() => inputRefs.current['bio']?.focus(), 100);
              }}
              blurOnSubmit={false}
            />
            {errors.linkedin && (
              <Text style={styles.errorText}>{errors.linkedin}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Bio{' '}
              <Text style={styles.characterCount}>
                ({formData.bio.length}/500)
              </Text>
            </Text>
            <TextInput
              ref={(ref) => {
                inputRefs.current['bio'] = ref!;
              }}
              style={[
                styles.input,
                styles.textArea,
                errors.bio && styles.inputError,
              ]}
              value={formData.bio}
              onChangeText={(text) => handleFieldChange('bio', text)}
              placeholder="Tell us about yourself and your career goals..."
              multiline
              numberOfLines={4}
              maxLength={500}
              returnKeyType="done"
              blurOnSubmit={true}
            />
            {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
          </View>

          {errors.submit && (
            <Text style={styles.submitErrorText}>{errors.submit}</Text>
          )}

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <X size={16} color="#ef4444" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                isSubmitting && styles.savingButton,
                submitStatus === 'success' && styles.successButton,
              ]}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.saveButtonText}>Saving...</Text>
                </>
              ) : submitStatus === 'success' ? (
                <>
                  <Check size={16} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Saved!</Text>
                </>
              ) : (
                <>
                  <Save size={16} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : (
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <User size={16} color="#64748b" />
            <Text style={styles.infoText}>
              {formData.fullName || 'Add your name'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Mail size={16} color="#64748b" />
            <Text style={styles.infoText}>
              {formData.email || 'Add your email'}
            </Text>
          </View>
          {formData.phone && (
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📞</Text>
              <Text style={styles.infoText}>{formData.phone}</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <MapPin size={16} color="#64748b" />
            <Text style={styles.infoText}>
              {formData.location || 'Add your location'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <DollarSign size={16} color="#64748b" />
            <Text style={styles.infoText}>
              {formData.expectedSalary || 'Add expected salary'}
            </Text>
          </View>
          {formData.website && (
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🌐</Text>
              <Text style={styles.infoText}>{formData.website}</Text>
            </View>
          )}
          {formData.linkedin && (
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>💼</Text>
              <Text style={styles.infoText}>{formData.linkedin}</Text>
            </View>
          )}
          {formData.bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>{formData.bio}</Text>
            </View>
          )}
        </View>
      )}
    </ProfileSection>
  );

  const renderSkills = () => (
    <ProfileSection title="Skills" icon={Plus} sectionKey="skills">
      <View style={styles.skillsContainer}>
        <View style={styles.addSkillContainer}>
          <TextInput
            style={[styles.skillInput, errors.skill && styles.inputError]}
            value={newSkill}
            onChangeText={(text) => {
              setNewSkill(text);
              if (errors.skill) setErrors((prev) => ({ ...prev, skill: '' }));
            }}
            placeholder="Add a skill (e.g., React, Python, Design)"
            returnKeyType="done"
            onSubmitEditing={addSkill}
          />
          <TouchableOpacity style={styles.addButton} onPress={addSkill}>
            <Plus size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {errors.skill && <Text style={styles.errorText}>{errors.skill}</Text>}

        <View style={styles.skillsList}>
          {state.user?.skills?.map((skill) => (
            <View key={skill.id} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill.name}</Text>
              <TouchableOpacity onPress={() => removeSkill(skill.id)}>
                <X size={14} color="#64748b" />
              </TouchableOpacity>
            </View>
          ))}
          {(!state.user?.skills || state.user.skills.length === 0) && (
            <Text style={styles.emptyText}>No skills added yet</Text>
          )}
        </View>
      </View>
    </ProfileSection>
  );

  const renderWorkExperience = () => (
    <ProfileSection
      title="Work Experience"
      icon={Briefcase}
      sectionKey="experience"
    >
      <View style={styles.experienceContainer}>
        <View style={styles.experienceForm}>
          <Text style={styles.formSectionTitle}>Add Work Experience</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Company <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.company && styles.inputError]}
                value={workExperienceForm.company}
                onChangeText={(text) => {
                  setWorkExperienceForm((prev) => ({ ...prev, company: text }));
                  if (errors.company)
                    setErrors((prev) => ({ ...prev, company: '' }));
                }}
                placeholder="Company name"
                returnKeyType="next"
                onSubmitEditing={() => {
                  setTimeout(() => inputRefs.current['position']?.focus(), 100);
                }}
                blurOnSubmit={false}
              />
              {errors.company && (
                <Text style={styles.errorText}>{errors.company}</Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Position <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={(ref) => {
                  if (ref) inputRefs.current['position'] = ref;
                }}
                style={[styles.input, errors.position && styles.inputError]}
                value={workExperienceForm.position}
                onChangeText={(text) => {
                  setWorkExperienceForm((prev) => ({
                    ...prev,
                    position: text,
                  }));
                  if (errors.position)
                    setErrors((prev) => ({ ...prev, position: '' }));
                }}
                placeholder="Job title"
                returnKeyType="next"
                onSubmitEditing={() => {
                  setTimeout(
                    () => inputRefs.current['startDate']?.focus(),
                    100
                  );
                }}
                blurOnSubmit={false}
              />
              {errors.position && (
                <Text style={styles.errorText}>{errors.position}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Start Date <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={(ref) => {
                  inputRefs.current['startDate'] = ref!;
                }}
                style={[styles.input, errors.startDate && styles.inputError]}
                value={workExperienceForm.startDate}
                onChangeText={(text) => {
                  setWorkExperienceForm((prev) => ({
                    ...prev,
                    startDate: text,
                  }));
                  if (errors.startDate)
                    setErrors((prev) => ({ ...prev, startDate: '' }));
                }}
                placeholder="Jan 2020"
                returnKeyType="next"
                onSubmitEditing={() => {
                  if (!workExperienceForm.current) {
                    setTimeout(
                      () => inputRefs.current['endDate']?.focus(),
                      100
                    );
                  }
                }}
                blurOnSubmit={false}
              />
              {errors.startDate && (
                <Text style={styles.errorText}>{errors.startDate}</Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                End Date{' '}
                {!workExperienceForm.current && (
                  <Text style={styles.required}>*</Text>
                )}
              </Text>
              <TextInput
                ref={(ref) => {
                  inputRefs.current['endDate'] = ref!;
                }}
                style={[
                  styles.input,
                  errors.endDate && styles.inputError,
                  workExperienceForm.current && styles.inputDisabled,
                ]}
                value={
                  workExperienceForm.current
                    ? 'Present'
                    : workExperienceForm.endDate
                }
                onChangeText={(text) => {
                  if (!workExperienceForm.current) {
                    setWorkExperienceForm((prev) => ({
                      ...prev,
                      endDate: text,
                    }));
                    if (errors.endDate)
                      setErrors((prev) => ({ ...prev, endDate: '' }));
                  }
                }}
                placeholder="Dec 2023"
                editable={!workExperienceForm.current}
                returnKeyType="next"
                onSubmitEditing={() => {
                  setTimeout(
                    () => inputRefs.current['responsibilities']?.focus(),
                    100
                  );
                }}
                blurOnSubmit={false}
              />
              {errors.endDate && (
                <Text style={styles.errorText}>{errors.endDate}</Text>
              )}
            </View>
          </View>

          <View style={styles.currentJobContainer}>
            <Switch
              value={workExperienceForm.current}
              onValueChange={(value) => {
                setWorkExperienceForm((prev) => ({
                  ...prev,
                  current: value,
                  endDate: value ? '' : prev.endDate,
                }));
                if (errors.endDate)
                  setErrors((prev) => ({ ...prev, endDate: '' }));
              }}
              trackColor={{ false: '#e2e8f0', true: '#7c3aed' }}
              thumbColor={workExperienceForm.current ? '#ffffff' : '#f4f3f4'}
            />
            <Text style={styles.currentJobText}>I currently work here</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Key Responsibilities <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              ref={(ref) => {
                inputRefs.current['responsibilities'] = ref!;
              }}
              style={[
                styles.input,
                styles.textArea,
                errors.responsibilities && styles.inputError,
              ]}
              value={workExperienceForm.responsibilities}
              onChangeText={(text) => {
                setWorkExperienceForm((prev) => ({
                  ...prev,
                  responsibilities: text,
                }));
                if (errors.responsibilities)
                  setErrors((prev) => ({ ...prev, responsibilities: '' }));
              }}
              placeholder="• Developed and maintained web applications&#10;• Led a team of 5 developers&#10;• Improved system performance by 40%"
              multiline
              numberOfLines={4}
              returnKeyType="next"
              onSubmitEditing={() => {
                setTimeout(
                  () => inputRefs.current['achievements']?.focus(),
                  100
                );
              }}
              blurOnSubmit={false}
            />
            {errors.responsibilities && (
              <Text style={styles.errorText}>{errors.responsibilities}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Key Achievements (Optional)</Text>
            <TextInput
              ref={(ref) => {
                inputRefs.current['achievements'] = ref!;
              }}
              style={[styles.input, styles.textArea]}
              value={workExperienceForm.achievements}
              onChangeText={(text) =>
                setWorkExperienceForm((prev) => ({
                  ...prev,
                  achievements: text,
                }))
              }
              placeholder="• Increased sales by 25%&#10;• Won Employee of the Year award&#10;• Successfully launched 3 major projects"
              multiline
              numberOfLines={3}
              returnKeyType="done"
              blurOnSubmit={true}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveExperienceButton,
              isSubmitting && styles.savingButton,
            ]}
            onPress={saveWorkExperience}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.saveExperienceText}>Saving...</Text>
              </>
            ) : (
              <>
                <Save size={16} color="#ffffff" />
                <Text style={styles.saveExperienceText}>Add Experience</Text>
              </>
            )}
          </TouchableOpacity>

          {errors.workExperience && (
            <Text style={styles.errorText}>{errors.workExperience}</Text>
          )}
        </View>

        {/* Existing Work Experience */}
        <View style={styles.existingExperiences}>
          <Text style={styles.existingTitle}>Your Work Experience</Text>
          {state.user?.workExperience?.map((exp) => (
            <View key={exp.id} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <View style={styles.experienceInfo}>
                  <Text style={styles.experiencePosition}>{exp.position}</Text>
                  <Text style={styles.experienceCompany}>
                    {exp.company} • {exp.duration}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeItemButton}
                  onPress={() => removeWorkExperience(exp.id)}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
              <View style={styles.responsibilitiesList}>
                {exp.responsibilities.map((resp, index) => (
                  <Text key={index} style={styles.experienceResp}>
                    • {resp}
                  </Text>
                ))}
              </View>
            </View>
          ))}

          {(!state.user?.workExperience ||
            state.user.workExperience.length === 0) && (
            <Text style={styles.emptyText}>No work experience added yet</Text>
          )}
        </View>
      </View>
    </ProfileSection>
  );

  const renderEducation = () => (
    <ProfileSection
      title="Education"
      icon={GraduationCap}
      sectionKey="education"
    >
      <View style={styles.experienceContainer}>
        <View style={styles.experienceForm}>
          <Text style={styles.formSectionTitle}>Add Education</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Institution <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.institution && styles.inputError]}
                value={educationForm.institution}
                onChangeText={(text) => {
                  setEducationForm((prev) => ({ ...prev, institution: text }));
                  if (errors.institution)
                    setErrors((prev) => ({ ...prev, institution: '' }));
                }}
                placeholder="University/School name"
                returnKeyType="next"
                onSubmitEditing={() => {
                  setTimeout(() => inputRefs.current['degree']?.focus(), 100);
                }}
                blurOnSubmit={false}
              />
              {errors.institution && (
                <Text style={styles.errorText}>{errors.institution}</Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Degree <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={(ref) => {
                  inputRefs.current['degree'] = ref!;
                }}
                style={[styles.input, errors.degree && styles.inputError]}
                value={educationForm.degree}
                onChangeText={(text) => {
                  setEducationForm((prev) => ({ ...prev, degree: text }));
                  if (errors.degree)
                    setErrors((prev) => ({ ...prev, degree: '' }));
                }}
                placeholder="Bachelor's, Master's, etc."
                returnKeyType="next"
                onSubmitEditing={() => {
                  setTimeout(() => inputRefs.current['field']?.focus(), 100);
                }}
                blurOnSubmit={false}
              />
              {errors.degree && (
                <Text style={styles.errorText}>{errors.degree}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Field of Study <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={(ref) => {
                  inputRefs.current['field'] = ref!;
                }}
                style={[styles.input, errors.field && styles.inputError]}
                value={educationForm.field}
                onChangeText={(text) => {
                  setEducationForm((prev) => ({ ...prev, field: text }));
                  if (errors.field)
                    setErrors((prev) => ({ ...prev, field: '' }));
                }}
                placeholder="Computer Science, Business, etc."
                returnKeyType="next"
                onSubmitEditing={() => {
                  setTimeout(
                    () => inputRefs.current['graduationYear']?.focus(),
                    100
                  );
                }}
                blurOnSubmit={false}
              />
              {errors.field && (
                <Text style={styles.errorText}>{errors.field}</Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Graduation Year <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={(ref) => {
                  inputRefs.current['graduationYear'] = ref!;
                }}
                style={[
                  styles.input,
                  errors.graduationYear && styles.inputError,
                ]}
                value={educationForm.graduationYear}
                onChangeText={(text) => {
                  setEducationForm((prev) => ({
                    ...prev,
                    graduationYear: text,
                  }));
                  if (errors.graduationYear)
                    setErrors((prev) => ({ ...prev, graduationYear: '' }));
                }}
                placeholder="2024"
                keyboardType="numeric"
                maxLength={4}
                returnKeyType="next"
                onSubmitEditing={() => {
                  setTimeout(() => inputRefs.current['gpa']?.focus(), 100);
                }}
                blurOnSubmit={false}
              />
              {errors.graduationYear && (
                <Text style={styles.errorText}>{errors.graduationYear}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GPA (Optional)</Text>
            <TextInput
              ref={(ref) => {
                inputRefs.current['gpa'] = ref!;
              }}
              style={styles.input}
              value={educationForm.gpa}
              onChangeText={(text) =>
                setEducationForm((prev) => ({ ...prev, gpa: text }))
              }
              placeholder="3.8/4.0 or 3.8"
              keyboardType="decimal-pad"
              returnKeyType="next"
              onSubmitEditing={() => {
                setTimeout(
                  () => inputRefs.current['educationAchievements']?.focus(),
                  100
                );
              }}
              blurOnSubmit={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Achievements & Honors (Optional)
            </Text>
            <TextInput
              ref={(ref) => {
                inputRefs.current['educationAchievements'] = ref!;
              }}
              style={[styles.input, styles.textArea]}
              value={educationForm.achievements}
              onChangeText={(text) =>
                setEducationForm((prev) => ({ ...prev, achievements: text }))
              }
              placeholder="• Dean's List&#10;• Magna Cum Laude&#10;• Relevant coursework: Data Structures, Algorithms"
              multiline
              numberOfLines={3}
              returnKeyType="done"
              blurOnSubmit={true}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveExperienceButton,
              isSubmitting && styles.savingButton,
            ]}
            onPress={saveEducation}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.saveExperienceText}>Saving...</Text>
              </>
            ) : (
              <>
                <Save size={16} color="#ffffff" />
                <Text style={styles.saveExperienceText}>Add Education</Text>
              </>
            )}
          </TouchableOpacity>

          {errors.education && (
            <Text style={styles.errorText}>{errors.education}</Text>
          )}
        </View>

        {/* Existing Education */}
        <View style={styles.existingExperiences}>
          <Text style={styles.existingTitle}>Your Education</Text>
          {state.user?.education?.map((edu) => (
            <View key={edu.id} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <View style={styles.experienceInfo}>
                  <Text style={styles.experiencePosition}>
                    {edu.degree} in {edu.field}
                  </Text>
                  <Text style={styles.experienceCompany}>
                    {edu.institution} • {edu.graduationYear}
                  </Text>
                  {edu.gpa && (
                    <Text style={styles.experienceGpa}>GPA: {edu.gpa}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removeItemButton}
                  onPress={() => removeEducation(edu.id)}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
              {edu.achievements.length > 0 && (
                <View style={styles.responsibilitiesList}>
                  {edu.achievements.map((achievement, index) => (
                    <Text key={index} style={styles.experienceResp}>
                      • {achievement}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}

          {(!state.user?.education || state.user.education.length === 0) && (
            <Text style={styles.emptyText}>No education added yet</Text>
          )}
        </View>
      </View>
    </ProfileSection>
  );

  const renderProgress = () => (
    <View style={styles.progressSection}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Profile Progress</Text>
        <Text style={styles.progressPercentage}>
          {getProfileCompletion()}% Complete
        </Text>
      </View>
      <View style={styles.progressBar}>
        <Animated.View
          style={[styles.progressFill, { width: `${getProfileCompletion()}%` }]}
        />
      </View>
      <Text style={styles.progressSubtitle}>
        Complete profile = Better job matches
      </Text>

      <View style={styles.progressItems}>
        <View style={styles.progressItem}>
          <View
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  formData.fullName && formData.email && formData.location
                    ? '#10b981'
                    : '#e2e8f0',
              },
            ]}
          />
          <Text style={styles.progressText}>Basic Info</Text>
        </View>
        <View style={styles.progressItem}>
          <View
            style={[
              styles.progressDot,
              {
                backgroundColor: profileImage ? '#10b981' : '#e2e8f0',
              },
            ]}
          />
          <Text style={styles.progressText}>Photo</Text>
        </View>
        <View style={styles.progressItem}>
          <View
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  state.user?.skills && state.user.skills.length > 0
                    ? '#10b981'
                    : '#e2e8f0',
              },
            ]}
          />
          <Text style={styles.progressText}>Skills</Text>
        </View>
        <View style={styles.progressItem}>
          <View
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  state.user?.workExperience &&
                  state.user.workExperience.length > 0
                    ? '#10b981'
                    : '#e2e8f0',
              },
            ]}
          />
          <Text style={styles.progressText}>Experience</Text>
        </View>
        <View style={styles.progressItem}>
          <View
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  state.user?.education && state.user.education.length > 0
                    ? '#10b981'
                    : '#e2e8f0',
              },
            ]}
          />
          <Text style={styles.progressText}>Education</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.dismissArea} onTouchEnd={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              keyboardVisible && { paddingBottom: 100 },
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Complete Your Resume</Text>
              <Text style={styles.headerSubtitle}>
                Build a comprehensive professional profile
              </Text>
            </View>

            {renderPhotoSection()}
            {renderBasicInfo()}
            {renderSkills()}
            {renderWorkExperience()}
            {renderEducation()}
            {renderProgress()}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Resume Upload Modal */}
      <Modal
        visible={showResumeUploader}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowResumeUploader(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Import Resume</Text>
            <TouchableOpacity
              onPress={() => setShowResumeUploader(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.uploadInstructions}>
              <FileText size={48} color="#7c3aed" />
              <Text style={styles.instructionsTitle}>
                Upload Your Resume
              </Text>
              <Text style={styles.instructionsText}>
                We'll automatically extract your information and let you review it before applying to your profile.
              </Text>
            </View>
            
            <ResumeUploader
              onParseComplete={handleResumeParseComplete}
              disabled={false}
            />
            
            <View style={styles.privacyNote}>
              <AlertCircle size={16} color="#64748b" />
              <Text style={styles.privacyText}>
                Your resume is processed securely and not stored on our servers.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Resume Preview Modal */}
      <Modal
        visible={showResumePreview}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowResumePreview(false)}
      >
        <SafeAreaView style={styles.fullScreenModal}>
          {parseResult && (
            <ResumePreview
              parseResult={parseResult}
              onApplyData={handleApplyParsedData}
              onClose={() => setShowResumePreview(false)}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Success Toast */}
      <Animated.View style={[styles.successToast, successAnimatedStyle]}>
        <Check size={20} color="#ffffff" />
        <Text style={styles.successToastText}>
          Profile updated successfully!
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  dismissArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
  },
  photoSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginBottom: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  photoSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 16,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoWrapper: {
    position: 'relative',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActions: {
    alignItems: 'center',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
  },
  photoButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#7c3aed',
  },
  imageOptionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  imageOptionsModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: SCREEN_WIDTH - 80,
    maxWidth: 300,
  },
  imageOptionsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 12,
  },
  imageOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1e293b',
  },
  imageOptionCancel: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  imageOptionCancelText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginBottom: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    flex: 1,
  },
  resumeUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  resumeUploadText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#7c3aed',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  infoContainer: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    fontSize: 16,
    width: 16,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#334155',
    flex: 1,
  },
  bioContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  bioText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    lineHeight: 20,
  },
  editForm: {
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  characterCount: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Inter-Medium',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputDisabled: {
    backgroundColor: '#f8fafc',
    color: '#9ca3af',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ef4444',
    marginTop: 4,
  },
  submitErrorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ef4444',
    textAlign: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    gap: 8,
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    gap: 8,
  },
  savingButton: {
    backgroundColor: '#a855f7',
  },
  successButton: {
    backgroundColor: '#10b981',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  skillsContainer: {
    gap: 16,
  },
  addSkillContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  skillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  addButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  skillText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  experienceContainer: {
    gap: 24,
  },
  experienceForm: {
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 16,
  },
  currentJobContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  currentJobText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  saveExperienceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#10b981',
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
  },
  saveExperienceText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  existingExperiences: {
    gap: 12,
  },
  existingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 8,
  },
  experienceItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  experienceInfo: {
    flex: 1,
  },
  experiencePosition: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  experienceCompany: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    marginBottom: 4,
  },
  experienceGpa: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#7c3aed',
  },
  responsibilitiesList: {
    gap: 4,
  },
  experienceResp: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    lineHeight: 20,
  },
  removeItemButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  progressSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  progressPercentage: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#7c3aed',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    marginBottom: 20,
  },
  progressItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  progressItem: {
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  successToast: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    zIndex: 1000,
  },
  successToastText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#64748b',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  uploadInstructions: {
    alignItems: 'center',
    marginBottom: 40,
  },
  instructionsTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginTop: 40,
    gap: 12,
  },
  privacyText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    flex: 1,
    lineHeight: 20,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});