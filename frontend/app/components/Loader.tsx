import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-full pt-6">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-800"></div>
    </div>
  );
};

export default Loader;
