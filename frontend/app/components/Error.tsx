import React, { useEffect } from 'react';

interface ErrorProps {
  message: string;
  onDismiss?: () => void;
}

const Error: React.FC<ErrorProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    if (onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000); // Dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [onDismiss]);
  
  return (
    <div className="flex justify-center items-center w-full h-full pt-6 mb-2">
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative animate-error-in"
        role="alert"
      >
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
      </div>
    </div>
  );
};

export default Error;