'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stashbackend.onrender.com';

function ShareTargetComponent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the email from localStorage
    const email = localStorage.getItem('stash_user_email');
    if (!email) {
      // If not logged in, open the app (which will show login)
      window.open('/');
      window.close();
      return;
    }

    const url = searchParams.get('url');
    const text = searchParams.get('text');
    const sharedContent = url || text;

    if (sharedContent) {
      fetch(`${API_URL}/v1/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': email // <-- Send email as header
        },
        body: JSON.stringify({
          type: url ? 'url' : 'text',
          content: sharedContent,
        }),
      })
      .then(() => window.close())
      .catch(() => window.close());
    } else {
      window.close();
    }
  }, [searchParams]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Saving to Stash...</h1>
    </div>
  );
}

export default function ShareTargetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShareTargetComponent />
    </Suspense>
  );
}