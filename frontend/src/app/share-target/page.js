'use client';

import { useEffect, Suspense } from 'react'; // <-- Import Suspense here
import { useSearchParams } from 'next/navigation';

// This is the inner component that uses the search params
function ShareTargetComponent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = searchParams.get('url');
    const text = searchParams.get('text');
    const sharedContent = url || text;

    if (sharedContent) {
      console.log("Got content:", sharedContent);

      fetch('http://127.0.0.1:8000/v1/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: url ? 'url' : 'text',
          content: sharedContent,
        }),
      })
      .then(res => res.json())
      .then(data => {
        console.log('Saved to stash:', data);
        window.close(); // Close the share popup
      })
      .catch(err => {
        console.error('Failed to save:', err);
        window.close(); // Also close on failure
      });
    } else {
      window.close();
    }
  }, [searchParams]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Saving to Stash...</h1>
    </div>
  );
}

// This is the default export for the page
export default function ShareTargetPage() {
  return (
    // We wrap the component in Suspense
    <Suspense fallback={<div>Loading...</div>}>
      <ShareTargetComponent />
    </Suspense>
  );
}