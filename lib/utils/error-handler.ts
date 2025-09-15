import { 
  showErrorToast, 
  showRetryToast, 
  showNetworkErrorToast, 
  showAuthErrorToast,
  showValidationErrorToast 
} from '@/components/ui/enhanced-toast';
import { 
  withRetry, 
  RetryOptions, 
  getErrorType, 
  getErrorMessage, 
  isAuthError,
  isValidationError 
} from './retry';

export interface ErrorHandlerOptions extends RetryOptions {
  showToast?: boolean;
  toastMessage?: string;
  redirectOnAuth?: boolean;
  logError?: boolean;
}

export interface ErrorHandlerResult<T> {
  data: T | null;
  error: Error | null;
  success: boolean;
  retryCount: number;
  errorType: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{ error: Error; timestamp: Date; context?: string }> = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  async handleWithRetry<T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<ErrorHandlerResult<T>> {
    const {
      showToast = true,
      toastMessage,
      redirectOnAuth = true,
      logError = true,
      ...retryOptions
    } = options;

    const result = await withRetry(operation, {
      ...retryOptions,
      onRetry: (error, retryCount) => {
        if (showToast) {
          const message = toastMessage || getErrorMessage(error);
          showRetryToast(message, () => {}, retryCount);
        }
        retryOptions.onRetry?.(error, retryCount);
      },
    });

    const errorType = result.error ? getErrorType(result.error) : 'none';

    if (result.error) {
      if (logError) {
        this.logError(result.error);
      }

      if (showToast) {
        this.showErrorToast(result.error, toastMessage, redirectOnAuth);
      }
    }

    return {
      ...result,
      errorType,
    };
  }

  handleError(
    error: Error,
    options: Omit<ErrorHandlerOptions, keyof RetryOptions> = {}
  ): void {
    const {
      showToast = true,
      toastMessage,
      redirectOnAuth = true,
      logError = true,
    } = options;

    if (logError) {
      this.logError(error);
    }

    if (showToast) {
      this.showErrorToast(error, toastMessage, redirectOnAuth);
    }
  }

  private showErrorToast(error: Error, customMessage?: string, redirectOnAuth = true): void {
    const errorType = getErrorType(error);
    const message = customMessage || getErrorMessage(error, errorType);

    switch (errorType) {
      case 'auth':
        showAuthErrorToast(message);
        if (redirectOnAuth) {
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 2000);
        }
        break;

      case 'network':
        showNetworkErrorToast();
        break;

      case 'validation':
        // Try to extract validation errors if available
        const validationErrors = this.extractValidationErrors(error);
        if (validationErrors.length > 0) {
          showValidationErrorToast(validationErrors);
        } else {
          showErrorToast(message);
        }
        break;

      default:
        showErrorToast(message);
        break;
    }
  }

  private extractValidationErrors(error: Error): string[] {
    // Try to extract validation errors from different error formats
    try {
      // Check if error has a details property (common in API responses)
      const errorObj = error as any;
      
      if (errorObj.details && Array.isArray(errorObj.details)) {
        return errorObj.details.map((detail: any) => 
          typeof detail === 'string' ? detail : detail.message || String(detail)
        );
      }

      if (errorObj.errors && Array.isArray(errorObj.errors)) {
        return errorObj.errors.map((err: any) => 
          typeof err === 'string' ? err : err.message || String(err)
        );
      }

      // Try to parse JSON error message
      if (error.message.startsWith('{')) {
        const parsed = JSON.parse(error.message);
        if (parsed.errors && Array.isArray(parsed.errors)) {
          return parsed.errors;
        }
      }
    } catch {
      // Ignore parsing errors
    }

    return [];
  }

  private logError(error: Error, context?: string): void {
    const logEntry = {
      error,
      timestamp: new Date(),
      context,
    };

    this.errorLog.push(logEntry);

    // Keep only the last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: logEntry.timestamp,
      });
    }

    // In production, you might want to send errors to a logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logEntry);
    }
  }

  private async sendToLoggingService(logEntry: { error: Error; timestamp: Date; context?: string }): Promise<void> {
    try {
      // Example: Send to a logging service
      // await fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     message: logEntry.error.message,
      //     stack: logEntry.error.stack,
      //     timestamp: logEntry.timestamp.toISOString(),
      //     context: logEntry.context,
      //     userAgent: navigator.userAgent,
      //     url: window.location.href,
      //   }),
      // });
    } catch (loggingError) {
      console.error('Failed to send error to logging service:', loggingError);
    }
  }

  getErrorLog(): Array<{ error: Error; timestamp: Date; context?: string }> {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Utility method for handling async operations with error handling
  async safeAsync<T>(
    operation: () => Promise<T>,
    fallback?: T,
    options?: ErrorHandlerOptions
  ): Promise<T | null> {
    try {
      const result = await this.handleWithRetry(operation, options);
      return result.success ? result.data : (fallback ?? null);
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)), options);
      return fallback ?? null;
    }
  }

  // Utility method for handling sync operations with error handling
  safe<T>(
    operation: () => T,
    fallback?: T,
    options?: Omit<ErrorHandlerOptions, keyof RetryOptions>
  ): T | null {
    try {
      return operation();
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)), options);
      return fallback ?? null;
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const handleError = (error: Error, options?: Omit<ErrorHandlerOptions, keyof RetryOptions>) => {
  errorHandler.handleError(error, options);
};

export const handleWithRetry = <T>(
  operation: () => Promise<T>,
  options?: ErrorHandlerOptions
) => {
  return errorHandler.handleWithRetry(operation, options);
};

export const safeAsync = <T>(
  operation: () => Promise<T>,
  fallback?: T,
  options?: ErrorHandlerOptions
) => {
  return errorHandler.safeAsync(operation, fallback, options);
};

export const safe = <T>(
  operation: () => T,
  fallback?: T,
  options?: Omit<ErrorHandlerOptions, keyof RetryOptions>
) => {
  return errorHandler.safe(operation, fallback, options);
};