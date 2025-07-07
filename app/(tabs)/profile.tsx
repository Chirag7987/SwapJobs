import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Image, 
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, MapPin, DollarSign, Plus, CreditCard as Edit3, Briefcase, GraduationCap, Camera, Check, X, Save, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

export default function ProfileTab() {
  const { state, dispatch } = useApp();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: state.user?.fullName || '',
    email: state.user?.email || '',
    location: state.user?.location || '',
    expectedSalary: state.user?.expectedSalary || '',
    bio: state.user?.bio || '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [workExperience, setWorkExperience] = useState({
    company: '',
    position: '',
    duration: '',
    responsibilities: '',
    current: false,
  });
  const [education, setEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    graduationYear: '',
    gpa: '',
    achievements: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'success' | 'error'>>({});

  // Refs for managing focus
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRefs = useRef<Record<string, TextInput>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateWorkExperience = () => {
    const newErrors: Record<string, string> = {};
    
    if (!workExperience.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    
    if (!workExperience.position.trim()) {
      newErrors.position = 'Position is required';
    }
    
    if (!workExperience.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }
    
    if (!workExperience.responsibilities.trim()) {
      newErrors.responsibilities = 'Responsibilities are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEducation = () => {
    const newErrors: Record<string, string> = {};
    
    if (!education.institution.trim()) {
      newErrors.institution = 'Institution name is required';
    }
    
    if (!education.degree.trim()) {
      newErrors.degree = 'Degree is required';
    }
    
    if (!education.field.trim()) {
      newErrors.field = 'Field of study is required';
    }
    
    if (!education.graduationYear.trim()) {
      newErrors.graduationYear = 'Graduation year is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }

    setSaveStatus(prev => ({ ...prev, basic: 'saving' }));

    try {
      const updatedUser = {
        id: state.user?.id || '1',
        ...formData,
        skills: state.user?.skills || [],
        workExperience: state.user?.workExperience || [],
        education: state.user?.education || [],
        profilePicture: state.user?.profilePicture,
      };
      
      dispatch({ type: 'SET_USER', payload: updatedUser });
      setEditingSection(null);
      setErrors({});
      setSaveStatus(prev => ({ ...prev, basic: 'success' }));
      
      // Reset success status after 2 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, basic: 'idle' }));
      }, 2000);
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      setSaveStatus(prev => ({ ...prev, basic: 'error' }));
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: state.user?.fullName || '',
      email: state.user?.email || '',
      location: state.user?.location || '',
      expectedSalary: state.user?.expectedSalary || '',
      bio: state.user?.bio || '',
    });
    setErrors({});
    setEditingSection(null);
    Keyboard.dismiss();
  };

  const addSkill = () => {
    if (!newSkill.trim()) {
      Alert.alert('Error', 'Please enter a skill name');
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
        }
      ]
    };
    
    dispatch({ type: 'SET_USER', payload: updatedUser });
    setNewSkill('');
    Alert.alert('Success', 'Skill added successfully!');
  };

  const removeSkill = (skillId: string) => {
    const updatedUser = {
      ...state.user!,
      skills: state.user?.skills?.filter(skill => skill.id !== skillId) || []
    };
    
    dispatch({ type: 'SET_USER', payload: updatedUser });
  };

  const saveWorkExperience = async () => {
    if (!validateWorkExperience()) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    setSaveStatus(prev => ({ ...prev, experience: 'saving' }));

    try {
      const updatedUser = {
        ...state.user!,
        workExperience: [
          ...(state.user?.workExperience || []),
          {
            id: Date.now().toString(),
            company: workExperience.company.trim(),
            position: workExperience.position.trim(),
            duration: workExperience.duration.trim(),
            responsibilities: workExperience.responsibilities.trim().split('\n').filter(r => r.trim()),
            current: workExperience.current,
          }
        ]
      };
      
      dispatch({ type: 'SET_USER', payload: updatedUser });
      setWorkExperience({
        company: '',
        position: '',
        duration: '',
        responsibilities: '',
        current: false,
      });
      setErrors({});
      setSaveStatus(prev => ({ ...prev, experience: 'success' }));
      
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, experience: 'idle' }));
      }, 2000);
      
      Alert.alert('Success', 'Work experience added successfully!');
    } catch (error) {
      setSaveStatus(prev => ({ ...prev, experience: 'error' }));
      Alert.alert('Error', 'Failed to save work experience. Please try again.');
    }
  };

  const saveEducation = async () => {
    if (!validateEducation()) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    setSaveStatus(prev => ({ ...prev, education: 'saving' }));

    try {
      const updatedUser = {
        ...state.user!,
        education: [
          ...(state.user?.education || []),
          {
            id: Date.now().toString(),
            institution: education.institution.trim(),
            degree: education.degree.trim(),
            field: education.field.trim(),
            graduationYear: parseInt(education.graduationYear),
            gpa: education.gpa.trim(),
            achievements: education.achievements.trim().split('\n').filter(a => a.trim()),
          }
        ]
      };
      
      dispatch({ type: 'SET_USER', payload: updatedUser });
      setEducation({
        institution: '',
        degree: '',
        field: '',
        graduationYear: '',
        gpa: '',
        achievements: '',
      });
      setErrors({});
      setSaveStatus(prev => ({ ...prev, education: 'success' }));
      
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, education: 'idle' }));
      }, 2000);
      
      Alert.alert('Success', 'Education added successfully!');
    } catch (error) {
      setSaveStatus(prev => ({ ...prev, education: 'error' }));
      Alert.alert('Error', 'Failed to save education. Please try again.');
    }
  };

  const removeWorkExperience = (expId: string) => {
    const updatedUser = {
      ...state.user!,
      workExperience: state.user?.workExperience?.filter(exp => exp.id !== expId) || []
    };
    
    dispatch({ type: 'SET_USER', payload: updatedUser });
  };

  const removeEducation = (eduId: string) => {
    const updatedUser = {
      ...state.user!,
      education: state.user?.education?.filter(edu => edu.id !== eduId) || []
    };
    
    dispatch({ type: 'SET_USER', payload: updatedUser });
  };

  const ProfileSection = ({ title, icon: Icon, children, sectionKey }: any) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Icon size={20} color="#7c3aed" />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditingSection(sectionKey)}>
          <Edit3 size={16} color="#7c3aed" />
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );

  const renderBasicInfo = () => (
    <ProfileSection title="Basic Information" icon={User} sectionKey="basic">
      {editingSection === 'basic' ? (
        <View style={styles.editForm}>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={(ref) => inputRefs.current['fullName'] = ref!}
                style={[styles.input, errors.fullName && styles.inputError]}
                value={formData.fullName}
                onChangeText={(text) => {
                  setFormData({ ...formData, fullName: text });
                  if (errors.fullName) setErrors({ ...errors, fullName: '' });
                }}
                placeholder="Your full name"
                returnKeyType="next"
                onSubmitEditing={() => inputRefs.current['email']?.focus()}
                blurOnSubmit={false}
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={(ref) => inputRefs.current['email'] = ref!}
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({ ...formData, email: text });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="your.email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => inputRefs.current['location']?.focus()}
                blurOnSubmit={false}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
          </View>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Location <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={(ref) => inputRefs.current['location'] = ref!}
                style={[styles.input, errors.location && styles.inputError]}
                value={formData.location}
                onChangeText={(text) => {
                  setFormData({ ...formData, location: text });
                  if (errors.location) setErrors({ ...errors, location: '' });
                }}
                placeholder="City, State"
                returnKeyType="next"
                onSubmitEditing={() => inputRefs.current['expectedSalary']?.focus()}
                blurOnSubmit={false}
              />
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expected Salary</Text>
              <TextInput
                ref={(ref) => inputRefs.current['expectedSalary'] = ref!}
                style={styles.input}
                value={formData.expectedSalary}
                onChangeText={(text) => setFormData({ ...formData, expectedSalary: text })}
                placeholder="$80,000 - $120,000"
                returnKeyType="next"
                onSubmitEditing={() => inputRefs.current['bio']?.focus()}
                blurOnSubmit={false}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              ref={(ref) => inputRefs.current['bio'] = ref!}
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Tell us about yourself and your career goals..."
              multiline
              numberOfLines={4}
              returnKeyType="done"
              blurOnSubmit={true}
            />
          </View>
          
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <X size={16} color="#ef4444" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.saveButton, 
                saveStatus.basic === 'saving' && styles.savingButton
              ]} 
              onPress={handleSave}
              disabled={saveStatus.basic === 'saving'}
            >
              {saveStatus.basic === 'saving' ? (
                <Text style={styles.saveButtonText}>Saving...</Text>
              ) : saveStatus.basic === 'success' ? (
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
        </View>
      ) : (
        <View style={styles.infoContainer}>
          <View style={styles.profilePictureSection}>
            <View style={styles.profilePicture}>
              {state.user?.profilePicture ? (
                <Image source={{ uri: state.user.profilePicture }} style={styles.profileImage} />
              ) : (
                <User size={32} color="#64748b" />
              )}
            </View>
            <TouchableOpacity style={styles.changePictureButton}>
              <Camera size={16} color="#7c3aed" />
              <Text style={styles.changePictureText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoItem}>
            <User size={16} color="#64748b" />
            <Text style={styles.infoText}>{formData.fullName || 'Add your name'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Mail size={16} color="#64748b" />
            <Text style={styles.infoText}>{formData.email || 'Add your email'}</Text>
          </View>
          <View style={styles.infoItem}>
            <MapPin size={16} color="#64748b" />
            <Text style={styles.infoText}>{formData.location || 'Add your location'}</Text>
          </View>
          <View style={styles.infoItem}>
            <DollarSign size={16} color="#64748b" />
            <Text style={styles.infoText}>{formData.expectedSalary || 'Add expected salary'}</Text>
          </View>
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
            style={styles.skillInput}
            value={newSkill}
            onChangeText={setNewSkill}
            placeholder="Add a skill (e.g., React, Python, Design)"
            returnKeyType="done"
            onSubmitEditing={addSkill}
          />
          <TouchableOpacity style={styles.addButton} onPress={addSkill}>
            <Plus size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
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

  const renderExperience = () => (
    <ProfileSection title="Work Experience" icon={Briefcase} sectionKey="experience">
      <View style={styles.experienceContainer}>
        <View style={styles.experienceForm}>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Company <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.company && styles.inputError]}
                value={workExperience.company}
                onChangeText={(text) => {
                  setWorkExperience({ ...workExperience, company: text });
                  if (errors.company) setErrors({ ...errors, company: '' });
                }}
                placeholder="Company name"
                returnKeyType="next"
              />
              {errors.company && <Text style={styles.errorText}>{errors.company}</Text>}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Position <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.position && styles.inputError]}
                value={workExperience.position}
                onChangeText={(text) => {
                  setWorkExperience({ ...workExperience, position: text });
                  if (errors.position) setErrors({ ...errors, position: '' });
                }}
                placeholder="Job title"
                returnKeyType="next"
              />
              {errors.position && <Text style={styles.errorText}>{errors.position}</Text>}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Duration <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.duration && styles.inputError]}
              value={workExperience.duration}
              onChangeText={(text) => {
                setWorkExperience({ ...workExperience, duration: text });
                if (errors.duration) setErrors({ ...errors, duration: '' });
              }}
              placeholder="e.g., Jan 2020 - Present"
              returnKeyType="next"
            />
            {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Key Responsibilities <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.responsibilities && styles.inputError]}
              value={workExperience.responsibilities}
              onChangeText={(text) => {
                setWorkExperience({ ...workExperience, responsibilities: text });
                if (errors.responsibilities) setErrors({ ...errors, responsibilities: '' });
              }}
              placeholder="Describe your key responsibilities and achievements (one per line)"
              multiline
              numberOfLines={4}
              returnKeyType="done"
            />
            {errors.responsibilities && <Text style={styles.errorText}>{errors.responsibilities}</Text>}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.saveExperienceButton,
              saveStatus.experience === 'saving' && styles.savingButton
            ]} 
            onPress={saveWorkExperience}
            disabled={saveStatus.experience === 'saving'}
          >
            {saveStatus.experience === 'saving' ? (
              <Text style={styles.saveExperienceText}>Saving...</Text>
            ) : saveStatus.experience === 'success' ? (
              <>
                <Check size={16} color="#ffffff" />
                <Text style={styles.saveExperienceText}>Saved!</Text>
              </>
            ) : (
              <>
                <Save size={16} color="#ffffff" />
                <Text style={styles.saveExperienceText}>Save Experience</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {state.user?.workExperience?.map((exp) => (
          <View key={exp.id} style={styles.experienceItem}>
            <View style={styles.experienceHeader}>
              <View style={styles.experienceInfo}>
                <Text style={styles.experiencePosition}>{exp.position}</Text>
                <Text style={styles.experienceCompany}>{exp.company} • {exp.duration}</Text>
              </View>
              <TouchableOpacity 
                style={styles.removeItemButton}
                onPress={() => removeWorkExperience(exp.id)}
              >
                <X size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
            {exp.responsibilities.map((resp, index) => (
              <Text key={index} style={styles.experienceResp}>• {resp}</Text>
            ))}
          </View>
        ))}
        
        {(!state.user?.workExperience || state.user.workExperience.length === 0) && (
          <Text style={styles.emptyText}>No work experience added yet</Text>
        )}
      </View>
    </ProfileSection>
  );

  const renderEducation = () => (
    <ProfileSection title="Education" icon={GraduationCap} sectionKey="education">
      <View style={styles.experienceContainer}>
        <View style={styles.experienceForm}>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Institution <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.institution && styles.inputError]}
                value={education.institution}
                onChangeText={(text) => {
                  setEducation({ ...education, institution: text });
                  if (errors.institution) setErrors({ ...errors, institution: '' });
                }}
                placeholder="University/School name"
                returnKeyType="next"
              />
              {errors.institution && <Text style={styles.errorText}>{errors.institution}</Text>}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Degree <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.degree && styles.inputError]}
                value={education.degree}
                onChangeText={(text) => {
                  setEducation({ ...education, degree: text });
                  if (errors.degree) setErrors({ ...errors, degree: '' });
                }}
                placeholder="Bachelor's, Master's, etc."
                returnKeyType="next"
              />
              {errors.degree && <Text style={styles.errorText}>{errors.degree}</Text>}
            </View>
          </View>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Field of Study <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.field && styles.inputError]}
                value={education.field}
                onChangeText={(text) => {
                  setEducation({ ...education, field: text });
                  if (errors.field) setErrors({ ...errors, field: '' });
                }}
                placeholder="Computer Science, Business, etc."
                returnKeyType="next"
              />
              {errors.field && <Text style={styles.errorText}>{errors.field}</Text>}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Graduation Year <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.graduationYear && styles.inputError]}
                value={education.graduationYear}
                onChangeText={(text) => {
                  setEducation({ ...education, graduationYear: text });
                  if (errors.graduationYear) setErrors({ ...errors, graduationYear: '' });
                }}
                placeholder="2024"
                keyboardType="numeric"
                returnKeyType="next"
              />
              {errors.graduationYear && <Text style={styles.errorText}>{errors.graduationYear}</Text>}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GPA (Optional)</Text>
            <TextInput
              style={styles.input}
              value={education.gpa}
              onChangeText={(text) => setEducation({ ...education, gpa: text })}
              placeholder="3.8/4.0"
              returnKeyType="next"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Achievements (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={education.achievements}
              onChangeText={(text) => setEducation({ ...education, achievements: text })}
              placeholder="Awards, honors, relevant coursework (one per line)"
              multiline
              numberOfLines={3}
              returnKeyType="done"
            />
          </View>
          
          <TouchableOpacity 
            style={[
              styles.saveExperienceButton,
              saveStatus.education === 'saving' && styles.savingButton
            ]} 
            onPress={saveEducation}
            disabled={saveStatus.education === 'saving'}
          >
            {saveStatus.education === 'saving' ? (
              <Text style={styles.saveExperienceText}>Saving...</Text>
            ) : saveStatus.education === 'success' ? (
              <>
                <Check size={16} color="#ffffff" />
                <Text style={styles.saveExperienceText}>Saved!</Text>
              </>
            ) : (
              <>
                <Save size={16} color="#ffffff" />
                <Text style={styles.saveExperienceText}>Save Education</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {state.user?.education?.map((edu) => (
          <View key={edu.id} style={styles.experienceItem}>
            <View style={styles.experienceHeader}>
              <View style={styles.experienceInfo}>
                <Text style={styles.experiencePosition}>{edu.degree} in {edu.field}</Text>
                <Text style={styles.experienceCompany}>{edu.institution} • {edu.graduationYear}</Text>
                {edu.gpa && <Text style={styles.experienceResp}>GPA: {edu.gpa}</Text>}
              </View>
              <TouchableOpacity 
                style={styles.removeItemButton}
                onPress={() => removeEducation(edu.id)}
              >
                <X size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
            {edu.achievements.map((achievement, index) => (
              <Text key={index} style={styles.experienceResp}>• {achievement}</Text>
            ))}
          </View>
        ))}
        
        {(!state.user?.education || state.user.education.length === 0) && (
          <Text style={styles.emptyText}>No education added yet</Text>
        )}
      </View>
    </ProfileSection>
  );

  const getProfileCompletion = () => {
    let completed = 0;
    let total = 5;
    
    if (formData.fullName && formData.email && formData.location) completed++;
    if (state.user?.skills && state.user.skills.length > 0) completed++;
    if (state.user?.workExperience && state.user.workExperience.length > 0) completed++;
    if (state.user?.education && state.user.education.length > 0) completed++;
    if (formData.bio) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const renderProgress = () => (
    <View style={styles.progressSection}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Profile Progress</Text>
        <Text style={styles.progressPercentage}>{getProfileCompletion()}% Complete</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${getProfileCompletion()}%` }]} />
      </View>
      <Text style={styles.progressSubtitle}>Complete profile = Better job matches</Text>
      
      <View style={styles.progressItems}>
        <View style={styles.progressItem}>
          <View style={[styles.progressDot, { 
            backgroundColor: (formData.fullName && formData.email && formData.location) ? '#10b981' : '#e2e8f0' 
          }]} />
          <Text style={styles.progressText}>Basic Info</Text>
        </View>
        <View style={styles.progressItem}>
          <View style={[styles.progressDot, { 
            backgroundColor: (state.user?.skills && state.user.skills.length > 0) ? '#10b981' : '#e2e8f0' 
          }]} />
          <Text style={styles.progressText}>Skills</Text>
        </View>
        <View style={styles.progressItem}>
          <View style={[styles.progressDot, { 
            backgroundColor: (state.user?.workExperience && state.user.workExperience.length > 0) ? '#10b981' : '#e2e8f0' 
          }]} />
          <Text style={styles.progressText}>Experience</Text>
        </View>
        <View style={styles.progressItem}>
          <View style={[styles.progressDot, { 
            backgroundColor: (state.user?.education && state.user.education.length > 0) ? '#10b981' : '#e2e8f0' 
          }]} />
          <Text style={styles.progressText}>Education</Text>
        </View>
        <View style={styles.progressItem}>
          <View style={[styles.progressDot, { 
            backgroundColor: formData.bio ? '#10b981' : '#e2e8f0' 
          }]} />
          <Text style={styles.progressText}>Bio</Text>
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
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Complete Your Profile</Text>
              <Text style={styles.headerSubtitle}>Help us find the perfect jobs for you</Text>
            </View>

            {renderBasicInfo()}
            {renderSkills()}
            {renderExperience()}
            {renderEducation()}
            {renderProgress()}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  changePictureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changePictureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#7c3aed',
  },
  infoContainer: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#334155',
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
    gap: 20,
  },
  experienceForm: {
    gap: 16,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  saveExperienceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#10b981',
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  saveExperienceText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  experienceItem: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
    marginBottom: 8,
  },
  experienceResp: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 2,
  },
  removeItemButton: {
    padding: 4,
    borderRadius: 4,
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
});