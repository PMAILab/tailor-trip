import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = "Something went wrong.", 
  onRetry,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-red-100 shadow-sm ${className}`}>
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Oops!</h3>
      <p className="text-slate-500 mb-6 max-w-sm">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-6 rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </div>
  );
};
