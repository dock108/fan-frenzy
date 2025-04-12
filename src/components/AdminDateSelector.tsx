'use client';

import React, { useState, useEffect } from 'react';

const AdminDateSelector: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isDev, setIsDev] = useState<boolean>(false);

  useEffect(() => {
    // Only run in browser and non-production
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      setIsDev(true);
      // Load saved date from local storage on mount
      const savedDate = localStorage.getItem('adminDateOverride');
      if (savedDate && /^\d{4}-\d{2}-\d{2}$/.test(savedDate)) {
        setSelectedDate(savedDate);
      } else {
        // Set default to today if nothing valid is saved
        setSelectedDate(new Date().toISOString().slice(0, 10));
      }
    }
  }, []);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleApplyDate = () => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      localStorage.setItem('adminDateOverride', selectedDate);
      // Reload the current page (assuming this is on /daily) with the adminDate query param
      window.location.href = `/daily?adminDate=${selectedDate}`;
    } else {
      alert('Please select a valid date in YYYY-MM-DD format.');
    }
  };

  const handleClearDate = () => {
    localStorage.removeItem('adminDateOverride');
    setSelectedDate(new Date().toISOString().slice(0, 10)); // Reset to today
    // Reload without the adminDate param to get the default challenge
     window.location.href = `/daily`;
  }

  if (!isDev) {
    return null; // Don't render in production or during SSR
  }

  return (
    <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-md my-4 text-sm shadow-sm">
      <h4 className="font-semibold text-yellow-800 mb-2">Admin: Override Challenge Date (Dev Only)</h4>
      <div className="flex items-center space-x-2">
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="p-1 border border-gray-300 rounded-md text-xs text-black"
        />
        <button
          onClick={handleApplyDate}
          className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-xs"
        >
          Load Date
        </button>
         <button
          onClick={handleClearDate}
          className="px-2 py-1 bg-gray-400 text-white rounded-md hover:bg-gray-500 text-xs"
        >
          Clear & Use Today
        </button>
      </div>
       <p className="text-xs text-gray-700 mt-1">Current override: {localStorage.getItem('adminDateOverride') || 'None (using today)'}</p>
    </div>
  );
};

export default AdminDateSelector; 