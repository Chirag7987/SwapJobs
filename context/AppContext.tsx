import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job, User, SavedJob } from '../types';
import { mockJobs } from '../data/mockJobs';

interface AppState {
  user: User | null;
  jobs: Job[];
  savedJobs: SavedJob[];
  currentJobIndex: number;
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_JOBS'; payload: Job[] }
  | { type: 'SAVE_JOB'; payload: Job }
  | { type: 'REMOVE_SAVED_JOB'; payload: string }
  | { type: 'NEXT_JOB' }
  | { type: 'RESET_JOB_INDEX' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'APPLY_TO_JOB'; payload: string }
  | { type: 'RETRY_FETCH' }
  | { type: 'LOAD_SAVED_DATA'; payload: { user?: User; savedJobs?: SavedJob[]; currentJobIndex?: number } };

const initialState: AppState = {
  user: null,
  jobs: [],
  savedJobs: [],
  currentJobIndex: 0,
  loading: true,
  error: null,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({ state: initialState, dispatch: () => {} });

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_JOBS':
      return { 
        ...state, 
        jobs: action.payload, 
        loading: false,
        error: null,
        // Reset index if we have new jobs
        currentJobIndex: action.payload.length > 0 ? 0 : state.currentJobIndex
      };
    case 'SAVE_JOB':
      const savedJob: SavedJob = {
        ...action.payload,
        savedDate: new Date().toISOString(),
        applied: false,
      };
      return { ...state, savedJobs: [...state.savedJobs, savedJob] };
    case 'REMOVE_SAVED_JOB':
      return {
        ...state,
        savedJobs: state.savedJobs.filter(job => job.id !== action.payload),
      };
    case 'NEXT_JOB':
      const nextIndex = state.currentJobIndex + 1;
      return { 
        ...state, 
        currentJobIndex: nextIndex
      };
    case 'RESET_JOB_INDEX':
      return { 
        ...state, 
        currentJobIndex: 0,
        error: null
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'APPLY_TO_JOB':
      return {
        ...state,
        savedJobs: state.savedJobs.map(job =>
          job.id === action.payload ? { ...job, applied: true } : job
        ),
      };
    case 'RETRY_FETCH':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOAD_SAVED_DATA':
      return {
        ...state,
        user: action.payload.user || state.user,
        savedJobs: action.payload.savedJobs || state.savedJobs,
        currentJobIndex: action.payload.currentJobIndex ?? state.currentJobIndex,
      };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API delay for testing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load saved data from AsyncStorage
      await loadSavedData();
      
      // Load jobs (simulate API call)
      await loadJobs();
      
    } catch (error) {
      console.error('Error initializing app:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize app. Please try again.' });
    }
  };

  const loadJobs = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For now, use mock data. In production, this would be an API call
      if (mockJobs && mockJobs.length > 0) {
        dispatch({ type: 'SET_JOBS', payload: mockJobs });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'No jobs available at the moment.' });
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load jobs. Please check your connection.' });
    }
  };

  const loadSavedData = async () => {
    try {
      const [savedUser, savedJobsData, savedIndex] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('savedJobs'),
        AsyncStorage.getItem('currentJobIndex')
      ]);
      
      const loadedData: any = {};
      
      if (savedUser) {
        loadedData.user = JSON.parse(savedUser);
      }
      
      if (savedJobsData) {
        loadedData.savedJobs = JSON.parse(savedJobsData);
      }
      
      if (savedIndex) {
        loadedData.currentJobIndex = parseInt(savedIndex, 10);
      }
      
      if (Object.keys(loadedData).length > 0) {
        dispatch({ type: 'LOAD_SAVED_DATA', payload: loadedData });
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      // Don't set error state for saved data loading failures
    }
  };

  // Save data to AsyncStorage when state changes
  useEffect(() => {
    if (state.user) {
      AsyncStorage.setItem('user', JSON.stringify(state.user));
    }
  }, [state.user]);

  useEffect(() => {
    AsyncStorage.setItem('savedJobs', JSON.stringify(state.savedJobs));
  }, [state.savedJobs]);

  useEffect(() => {
    AsyncStorage.setItem('currentJobIndex', state.currentJobIndex.toString());
  }, [state.currentJobIndex]);

  // Retry mechanism
  useEffect(() => {
    if (state.loading && state.error === null && state.jobs.length === 0) {
      loadJobs();
    }
  }, [state.loading]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};