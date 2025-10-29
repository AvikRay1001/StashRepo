'use client';
import { useState, useEffect } from 'react';
import { useUser } from './UserContext';

// Use localhost for local testing
const API_URL = 'http://localhost:8000'; 

// --- NEW Login/Signup Component ---
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoginView, setIsLoginView] = useState(true); // State to toggle views
  const { login, signup } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    
    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    // New: Centered layout for the login page
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-center">Stash</h1>
        <h2 className="text-xl text-gray-300 text-center">
          {isLoginView ? 'Sign in to your account' : 'Create a new account'}
        </h2>

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full p-3 mt-1 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 mt-1 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors"
          >
            {isLoginView ? 'Login' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle Link */}
        <p className="text-sm text-center text-gray-400">
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLoginView(!isLoginView); // Flip the view
              setError(null); // Clear errors on toggle
            }}
            className="font-medium text-blue-400 hover:text-blue-500"
          >
            {isLoginView ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </main>
  );
}

// --- Main App Component (Unchanged) ---
function StashApp() {
  const { userEmail, logout } = useUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItemUrl, setNewItemUrl] = useState('');

  async function fetchItems() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/v1/library`, {
        headers: {
          'X-User-Email': userEmail // <-- Send email as header
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch (Error ${res.status})`);
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (userEmail) {
      fetchItems();
    }
  }, [userEmail]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemUrl.trim()) return;

    try {
      const res = await fetch(`${API_URL}/v1/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail // <-- Send email as header
        },
        body: JSON.stringify({
          type: 'url',
          content: newItemUrl,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to add item (Error ${res.status})`);
      }
      setNewItemUrl(''); 
      fetchItems();      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Stash</h1>
        <button 
          onClick={logout} 
          className="text-sm text-gray-400 hover:text-white"
        >
          Logout ({userEmail})
        </button>
      </div>

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

// --- Main Page Component (Unchanged) ---
export default function Home() {
  const { userEmail } = useUser();
  
  if (!userEmail) {
    return <LoginScreen />;
  }
  
  return <StashApp />;
}