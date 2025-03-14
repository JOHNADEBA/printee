import React, { useEffect } from 'react';

interface SuccessProps {
  message: string;
  onDismiss?: () => void; // Optional callback to dismiss the success message
}

const Success: React.FC<SuccessProps> = ({ message, onDismiss }) => {
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
        className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative animate-success-in"
        role="alert"
      >
        <strong className="font-bold">Success: </strong>
        <span className="block sm:inline">{message}</span>
      </div>
    </div>
  );
};

export default Success;