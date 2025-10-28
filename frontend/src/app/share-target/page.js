'use client';

// Make sure to import Suspense from React!
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// This is the URL of your deployed backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stashbackend.onrender.com';

function ShareTargetComponent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = searchParams.get('url');
    const text = searchParams.get('text');
    const sharedContent = url || text; // Prefer URL

    if (sharedContent) {
      // Send the shared content to your backend
      fetch(`${API_URL}/v1/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: url ? 'url' : 'text',
          content: sharedContent,
        }),
      })
      .then(() => window.close()) // Close the share window on success
      .catch(() => window.close()); // Also close on failure
    } else {
      window.close(); // No content, just close
    }
  }, [searchParams]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Saving to Stash...</h1>
    </div>
  );
}

// You MUST wrap the component in <Suspense> for useSearchParams to work
export default function ShareTargetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShareTargetComponent />
    </Suspense>
  );
}