'use client';

import { useState, useEffect } from 'react';

// IMPORTANT: This is the URL of your deployed backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stashbackend.onrender.com';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItemUrl, setNewItemUrl] = useState('');

  // Function to fetch all items
  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/library`);
      if (!res.ok) {
        throw new Error('Failed to fetch from backend. Is it awake?');
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  // Fetch items when the page loads
  useEffect(() => {
    fetchItems();
  }, []);

  // Handler for the test "Add Item" button
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemUrl.trim()) return;

    try {
      const res = await fetch(`${API_URL}/v1/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'url',
          content: newItemUrl,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add item');
      }
      setNewItemUrl(''); // Clear the input
      fetchItems();      // And refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Stash</h1>

      {/* --- TEST FORM --- */}
      <form onSubmit={handleAddItem} className="mb-6 flex space-x-2">
        <input
          type="text"
          value={newItemUrl}
          onChange={(e) => setNewItemUrl(e.target.value)}
          placeholder="Add a test URL..."
          className="grow p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
        >
          Add Item
        </button>
      </form>
      {/* --- END TEST FORM --- */}

      {loading && <p>Loading items...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="flex flex-col space-y-4">
          {items.length === 0 ? (
            <p>Your stash is empty. Try sharing a link!</p>
          ) : (
            items.map(item => (
              <div key={item.id} className="p-4 border border-gray-700 rounded-lg bg-gray-800">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-600 text-gray-200">
                  {item.content_type}
                </span>
                <p className="text-blue-400 mt-2 break-all">
                  {item.raw_content}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}