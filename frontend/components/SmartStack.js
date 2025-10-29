'use client';
import React from 'react';
import ItemCard from './ItemCard'; // Make sure ItemCard.js is in the same folder

export default function SmartStack({ title, items }) {
  if (!items || items.length === 0) {
    return null; // Don't render empty stacks
  }

  // Simple category pluralization / Title formatting
  let stackTitle = title;
  if (title === 'Processing') {
      stackTitle = '⏳ Processing Items';
  } else if (title === 'Other') {
       stackTitle = 'Miscellaneous';
  } else if (title.endsWith('y')) {
      stackTitle = title.slice(0, -1) + 'ies'; // e.g., Category -> Categories
  } else {
      stackTitle = title + 's'; // e.g., Movie -> Movies
  }


  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-gray-300 mb-4 border-b border-gray-600 pb-2">
        {stackTitle}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}