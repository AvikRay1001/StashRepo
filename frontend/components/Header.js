'use client';
import React from 'react';

export default function Header({ userEmail, logoutFunction }) {
  return (
    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
      <h1 className="text-3xl font-bold text-white">My Stash</h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-400 truncate max-w-[150px] sm:max-w-xs">{userEmail}</span>
        <button
          onClick={logoutFunction}
          className="text-sm text-red-400 hover:text-red-300 whitespace-nowrap"
        >
          Logout
        </button>
      </div>
    </div>
  );
}