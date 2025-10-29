'use client';
import React from 'react';

export default function ItemCard({ item }) {
  // --- Handle Pending State ---
  if (item.status === 'pending' || !item.processed_data) {
    return (
      <div className="p-4 border border-gray-700 rounded-lg bg-gray-800 opacity-70 h-full flex flex-col justify-between shadow-md">
        {/* Main content - Show raw content */}
        <div>
          <p className="text-blue-400 text-sm break-all line-clamp-3" title={item.raw_content || 'No raw content'}>
            {item.raw_content || 'No raw content'}
          </p>
        </div>
        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-gray-600">
            <p className="text-xs text-yellow-400">Processing...</p>
            <p className="text-xs text-gray-500 mt-1">
                Added: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
            </p>
        </div>
      </div>
    );
  }

  // --- Handle Failed State ---
  if (item.status === 'failed') {
    return (
      <div className="p-4 border border-red-700 rounded-lg bg-gray-800 opacity-70 h-full flex flex-col justify-between shadow-md">
         {/* Main content - Show raw content */}
         <div>
             <p className="text-gray-400 text-sm break-all line-clamp-3" title={item.raw_content || 'No raw content'}>
                 {item.raw_content || 'No raw content'}
             </p>
         </div>
         {/* Footer */}
         <div className="mt-3 pt-2 border-t border-gray-600">
            <p className="text-xs text-red-400 font-semibold">Processing Failed</p>
             <p className="text-xs text-gray-500 mt-1">
                 Added: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
             </p>
         </div>
      </div>
    );
  }

  // --- Render Processed Item ---
  // Safely access properties from the processed_data with default values
  const {
      title = 'No Title Available',
      summary = 'No summary available.',
      primary_category = 'Other', // Use primary_category from data
      specific_tags = [],       // Get the tags list, default to empty array
      key_info = {}              // Get key info, default to empty object
  } = item.processed_data || {}; // Add fallback for processed_data itself

  return (
    <div className="p-4 border border-gray-600 rounded-lg bg-gray-700 text-white flex flex-col justify-between h-full shadow-md hover:shadow-lg hover:border-gray-500 transition-all duration-200">
      
      {/* Main content */}
      <div className="grow mb-3">
        {/* Display Title */}
        <h3 className="text-lg font-semibold mb-2 line-clamp-2" title={title}>
            {title}
        </h3>
        {/* Display Summary */}
        <p className="text-sm text-gray-300 line-clamp-3" title={summary}>
            {summary}
        </p>
      </div>

      {/* Display Specific Tags */}
      {specific_tags && specific_tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
              {specific_tags.slice(0, 4).map((tag, index) => ( // Show max 4 tags
                  <span key={`${tag}-${index}`} className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded whitespace-nowrap">
                      {tag}
                  </span>
              ))}
          </div>
      )}
      
      {/* Footer with details */}
      <div className="border-t border-gray-600 pt-2 text-xs">
        {/* Display Key Info (Optional, show max 1 entry) */}
        {key_info && Object.keys(key_info).length > 0 && (
          <div className="text-gray-400 mb-1 space-y-1">
            {Object.entries(key_info).slice(0, 1).map(([key, value]) => ( 
              <p key={key} className="truncate" title={`${key.replace(/_/g, ' ')}: ${String(value)}`}>
                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {String(value)}
              </p>
            ))}
          </div>
        )}
        {/* Display Category and Date */}
        <p className="text-gray-500 mt-1">
          Category: {primary_category} | Added: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
        </p>
      </div>
    </div>
  );
}