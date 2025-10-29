// 'use client';
// import React, { useState, useEffect } from 'react';
// import SmartStack from './SmartStack'; // Make sure SmartStack.js is in the same folder

// // Your backend API URL (ensure it's available via environment variable)
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; // Fallback to local for dev

// export default function StashList({ userEmail }) {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     async function fetchItems() {
//       // Don't fetch if userEmail isn't available yet
//       if (!userEmail) {
//         setLoading(false); // Stop loading if no user
//         return; 
//       }

//       setLoading(true);
//       setError(null);
//       console.log("StashList: Fetching items for:", userEmail);

//       // --- Use Real Fetching ---
//       try {
//         const res = await fetch(`${API_URL}/v1/library`, {
//           headers: {
//             // Send the user's email as the required header
//             'X-User-Email': userEmail 
//           }
//         });

//         console.log("StashList: Fetch response status:", res.status);

//         // Handle authentication errors specifically
//         if (res.status === 401) {
//              throw new Error("Authentication failed. Please log out and log back in.");
//         }
//         if (!res.ok) {
//           // Try to get error detail from backend
//           let errorDetail = `Failed to fetch items (Error ${res.status})`;
//            try {
//                const errData = await res.json();
//                errorDetail = errData.detail || errorDetail;
//            } catch (jsonError) { /* Ignore if response isn't JSON */ }
//           throw new Error(errorDetail);
//         }

//         const data = await res.json();
//         console.log("StashList: Raw items received:", data.items);
//         setItems(data.items || []); // Set the items from the backend response

//       } catch (err) {
//         console.error("StashList: Error fetching items:", err);
//         setError(err.message || "Could not load stash. Check network or backend."); // Provide more context in error
//       } finally {
//         setLoading(false); // Ensure loading is set to false in all cases
//       }
//       // --- End Real Fetching ---
//     }

//     fetchItems();
//   }, [userEmail]); // Re-fetch when userEmail changes

//   // Grouping Logic (remains the same)
//   const groupedItems = items.reduce((acc, item) => {
//     let stackKey = 'Other'; // Default stack
//     if (item.status === 'pending') {
//         stackKey = 'Processing';
//     } else if (item.status === 'failed') {
//         stackKey = 'Failed'; 
//     } else if (item.status === 'processed' && item.smart_stack) {
//         stackKey = item.smart_stack;
//     }
    
//     if (!acc[stackKey]) {
//       acc[stackKey] = [];
//     }
//     acc[stackKey].push(item);
//     return acc;
//   }, {});
//   console.log("StashList: Grouped items:", groupedItems);

//   // Define the order of stacks (remains the same)
//   const stackOrder = ['Processing', 'Recipe', 'Movie', 'Product', 'Article', 'Place', 'Software', 'Other', 'Failed'];

//   // Render Logic (remains the same)
//   if (loading) {
//     return <p className="text-center text-gray-400 mt-10">Loading your stash...</p>;
//   }

//   if (error) {
//     return <p className="text-center text-red-500 mt-10">Error loading stash: {error}</p>;
//   }

//   // Check if there are any items *after* grouping to decide if stash is empty
//   const isEmpty = Object.keys(groupedItems).length === 0;

//   if (isEmpty) {
//      return <p className="text-center text-gray-400 mt-10">Your stash is empty. Try adding or sharing some links!</p>;
//   }

//   return (
//     <div>
//       {/* Loop through the defined order */}
//       {stackOrder.map(stackName => 
//         // Only render the stack if it exists in the grouped data
//         groupedItems[stackName] 
//           ? <SmartStack key={stackName} title={stackName} items={groupedItems[stackName]} />
//           : null 
//       )}
//     </div>
//   );
// }




'use client';
import React, { useState, useEffect } from 'react';
import SmartStack from './SmartStack'; // Ensure SmartStack.js is in the same folder

// Your backend API URL (ensure it's set in Vercel/Render env vars)
// Fallback to localhost for local development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function StashList({ userEmail, refreshKey }) { // Accept refreshKey
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchItems() {
      // Don't fetch if userEmail isn't available yet
      if (!userEmail) {
        console.log("StashList: No userEmail provided, skipping fetch.");
        setLoading(false); // Stop loading if no user
        setItems([]); // Clear items if user logs out
        return;
      }

      setLoading(true);
      setError(null);
      console.log("StashList: Fetching items for:", userEmail);

      // --- Use Real Fetching ---
      try {
        const res = await fetch(`${API_URL}/v1/library`, {
          headers: {
            // Send the user's email as the required header
            'X-User-Email': userEmail
          },
          // Optional: Add cache control if needed, though usually GETs aren't cached aggressively by default
          // cache: 'no-store' 
        });

        console.log("StashList: Fetch response status:", res.status);

        // Handle authentication errors specifically
        if (res.status === 401) {
             throw new Error("Authentication failed. Please log out and log back in.");
        }
        if (!res.ok) {
          // Try to get error detail from backend
          let errorDetail = `Failed to fetch items (Error ${res.status})`;
           try {
               const errData = await res.json();
               errorDetail = errData.detail || errorDetail;
           } catch (jsonError) { /* Ignore if response isn't JSON */ }
          throw new Error(errorDetail);
        }

        const data = await res.json();
        console.log("StashList: Raw items received:", data.items);
        setItems(data.items || []); // Set the items from the backend response

      } catch (err) {
        console.error("StashList: Error fetching items:", err);
        setError(err.message || "Could not load stash. Check network or backend."); // Provide more context in error
        setItems([]); // Clear items on error
      } finally {
        setLoading(false); // Ensure loading is set to false in all cases
      }
      // --- End Real Fetching ---
    }

    fetchItems();
    // Re-run fetchItems when userEmail OR refreshKey changes
  }, [userEmail, refreshKey]); 

  // Grouping Logic
  const groupedItems = items.reduce((acc, item) => {
    let stackKey = 'Other'; // Default stack
    if (item.status === 'pending') {
        stackKey = 'Processing';
    } else if (item.status === 'failed') {
        stackKey = 'Failed'; 
    } else if (item.status === 'processed' && item.smart_stack) {
        // Use the smart_stack from the DB, ensuring it's a string
        stackKey = String(item.smart_stack); 
    }
    
    // Ensure the key exists in the accumulator
    if (!acc[stackKey]) {
      acc[stackKey] = [];
    }
    acc[stackKey].push(item);
    return acc;
  }, {});
  console.log("StashList: Grouped items:", groupedItems);

  // Get all category keys directly from the grouped data
  const availableCategories = Object.keys(groupedItems);

  // Render Logic
  if (loading) {
    return <p className="text-center text-gray-400 mt-10">Loading your stash...</p>;
  }

  // Show error only if not loading and items haven't loaded
  if (error && items.length === 0) {
    return <p className="text-center text-red-500 mt-10">Error loading stash: {error}</p>;
  }

  const isEmpty = availableCategories.length === 0;

  if (isEmpty && !loading) { // Check !loading to avoid showing "empty" during initial load
     return <p className="text-center text-gray-400 mt-10">Your stash is empty. Try adding or sharing some links!</p>;
  }

  // --- Sort the categories: Put "Processing" and "Failed" first/last, sort others alphabetically ---
  const sortedCategories = availableCategories.sort((a, b) => {
      // Prioritize "Processing"
      if (a === 'Processing') return -1;
      if (b === 'Processing') return 1;
      // Put "Failed" last (among non-Processing)
      if (a === 'Failed') return 1;
      if (b === 'Failed') return -1;
       // Put "Other" just before "Failed" (if both exist)
      if (a === 'Other') return (b === 'Failed' ? -1 : 1);
      if (b === 'Other') return (a === 'Failed' ? 1 : -1);
      // Sort all other categories alphabetically
      return a.localeCompare(b);
  });
  // ------------------------------------------------------------------------------------------------

  return (
    <div>
      {/* Iterate over the dynamically sorted categories */}
      {sortedCategories.map(stackName => 
        // Render the stack - the check for groupedItems[stackName] is implicitly true here
        <SmartStack 
          key={stackName} 
          title={stackName} 
          items={groupedItems[stackName]} 
        />
      )}
    </div>
  );
}