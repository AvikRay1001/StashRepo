'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchItems() {
    try {
      // Use the local backend URL
      const res = await fetch('http://127.0.0.1:8000/v1/library');
      if (!res.ok) {
        throw new Error('Failed to fetch from backend');
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Stash</h1>

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