'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface FeedbackState {
  loading: boolean;
  success: boolean;
  error: boolean;
  message: string;
}

interface FeedbackContextType {
  showLoading: (message?: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  hideFeedback: () => void;
  feedback: FeedbackState;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feedback, setFeedback] = useState<FeedbackState>({
    loading: false,
    success: false,
    error: false,
    message: ''
  });

  const showLoading = useCallback((message: string = 'Chargement...') => {
    setFeedback({
      loading: true,
      success: false,
      error: false,
      message
    });
  }, []);

  const showSuccess = useCallback((message: string) => {
    setFeedback({
      loading: false,
      success: true,
      error: false,
      message
    });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, success: false, message: '' }));
    }, 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setFeedback({
      loading: false,
      success: false,
      error: true,
      message
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, error: false, message: '' }));
    }, 5000);
  }, []);

  const hideFeedback = useCallback(() => {
    setFeedback({
      loading: false,
      success: false,
      error: false,
      message: ''
    });
  }, []);

  return (
    <FeedbackContext.Provider value={{
      showLoading,
      showSuccess,
      showError,
      hideFeedback,
      feedback
    }}>
      {children}
      <FeedbackDisplay />
    </FeedbackContext.Provider>
  );
};

const FeedbackDisplay: React.FC = () => {
  const { feedback, hideFeedback } = useFeedback();

  if (!feedback.loading && !feedback.success && !feedback.error) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div
        className={`p-4 rounded-lg shadow-lg border-l-4 ${
          feedback.loading
            ? 'bg-blue-100 border-blue-600 text-blue-900'
            : feedback.success
            ? 'bg-green-50 border-green-500 text-green-800'
            : 'bg-red-50 border-red-500 text-red-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {feedback.loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
            {feedback.success && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {feedback.error && (
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <p className="text-sm font-medium">{feedback.message}</p>
          </div>
          <button
            onClick={hideFeedback}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer la notification"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackProvider;