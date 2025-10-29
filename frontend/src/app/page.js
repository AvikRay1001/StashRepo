// // 'use client';
// // import { useState, useEffect } from 'react';
// // import { useUser } from './UserContext';

// // // Use localhost for local testing
// // const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stashbackend.onrender.com'; 

// // // --- NEW Login/Signup Component ---
// // function LoginScreen() {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [error, setError] = useState(null);
// //   const [isLoginView, setIsLoginView] = useState(true); // State to toggle views
// //   const { login, signup } = useUser();

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setError(null); // Clear previous errors

// //     try {
// //       if (isLoginView) {
// //         await login(email, password);
// //       } else {
// //         await signup(email, password);
// //       }
// //     } catch (err) {
// //       setError(err.message);
// //     }
// //   };

// //   return (
// //     // New: Centered layout for the login page
// //     <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
// //       <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">

// //         {/* Header */}
// //         <h1 className="text-3xl font-bold text-center">Stash</h1>
// //         <h2 className="text-xl text-gray-300 text-center">
// //           {isLoginView ? 'Sign in to your account' : 'Create a new account'}
// //         </h2>

// //         {/* The Form */}
// //         <form onSubmit={handleSubmit} className="space-y-4">
// //           <div>
// //             <label htmlFor="email" className="block text-sm font-medium text-gray-400">
// //               Email
// //             </label>
// //             <input
// //               id="email"
// //               type="email"
// //               value={email}
// //               onChange={(e) => setEmail(e.target.value)}
// //               placeholder="you@example.com"
// //               className="w-full p-3 mt-1 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //               required
// //             />
// //           </div>

// //           <div>
// //             <label htmlFor="password" className="block text-sm font-medium text-gray-400">
// //               Password
// //             </label>
// //             <input
// //               id="password"
// //               type="password"
// //               value={password}
// //               onChange={(e) => setPassword(e.target.value)}
// //               placeholder="••••••••"
// //               className="w-full p-3 mt-1 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //               required
// //             />
// //           </div>

// //           {/* Error Message */}
// //           {error && <p className="text-red-500 text-sm text-center">{error}</p>}

// //           {/* Submit Button */}
// //           <button
// //             type="submit"
// //             className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors"
// //           >
// //             {isLoginView ? 'Login' : 'Sign Up'}
// //           </button>
// //         </form>

// //         {/* Toggle Link */}
// //         <p className="text-sm text-center text-gray-400">
// //           {isLoginView ? "Don't have an account? " : "Already have an account? "}
// //           <button
// //             onClick={() => {
// //               setIsLoginView(!isLoginView); // Flip the view
// //               setError(null); // Clear errors on toggle
// //             }}
// //             className="font-medium text-blue-400 hover:text-blue-500"
// //           >
// //             {isLoginView ? 'Sign up' : 'Sign in'}
// //           </button>
// //         </p>
// //       </div>
// //     </main>
// //   );
// // }

// // // --- Main App Component (Unchanged) ---
// // function StashApp() {
// //   const { userEmail, logout } = useUser();
// //   const [items, setItems] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [newItemUrl, setNewItemUrl] = useState('');

// //   // async function fetchItems() {
// //   //   setLoading(true);
// //   //   setError(null);
// //   //   try {
// //   //     const res = await fetch(`${API_URL}/v1/library`, {
// //   //       headers: {
// //   //         'X-User-Email': userEmail // <-- Send email as header
// //   //       }
// //   //     });
// //   //     if (!res.ok) {
// //   //       throw new Error(`Failed to fetch (Error ${res.status})`);
// //   //     }
// //   //     const data = await res.json();
// //   //     setItems(data.items || []);
// //   //   } catch (err) {
// //   //     setError(err.message);
// //   //   }
// //   //   setLoading(false);
// //   // }


// //   async function fetchItems() {
// //     setLoading(true);
// //     setError(null);
// //     console.log("fetchItems called. User email:", userEmail); // Log email

// //     // --- Add check for userEmail ---
// //     if (!userEmail) {
// //         console.error("fetchItems called without userEmail!");
// //         setError("User email not available.");
// //         setLoading(false);
// //         return; // Don't proceed if email is missing
// //     }
// //     // -----------------------------

// //     try {
// //       console.log("Attempting to fetch:", `${API_URL}/v1/library`); // Log URL
// //       const res = await fetch(`${API_URL}/v1/library`, {
// //         headers: {
// //           'X-User-Email': userEmail 
// //         }
// //       });

// //       console.log("Fetch response status:", res.status); // Log status code

// //       if (!res.ok) {
// //         // Try to get error detail from backend if available
// //         let errorDetail = `Failed to fetch (Error ${res.status})`;
// //         try {
// //             const errData = await res.json();
// //             errorDetail = errData.detail || errorDetail;
// //         } catch (jsonError) {
// //             // Backend didn't send JSON or response was empty
// //         }
// //         throw new Error(errorDetail); 
// //       }

// //       const data = await res.json();
// //       console.log("Fetched items:", data.items); // Log success data
// //       setItems(data.items || []);

// //     } catch (err) {
// //       console.error("Error in fetchItems:", err); // Log the actual error object
// //       setError(err.message || "Load failed due to network or CORS issue."); // Set more specific error
// //     }
// //     setLoading(false);
// //   }



// //   useEffect(() => {
// //     if (userEmail) {
// //       fetchItems();
// //     }
// //   }, [userEmail]);

// //   const handleAddItem = async (e) => {
// //     e.preventDefault();
// //     if (!newItemUrl.trim()) return;

// //     try {
// //       const res = await fetch(`${API_URL}/v1/capture`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'X-User-Email': userEmail // <-- Send email as header
// //         },
// //         body: JSON.stringify({
// //           type: 'url',
// //           content: newItemUrl,
// //         }),
// //       });

// //       if (!res.ok) {
// //         throw new Error(`Failed to add item (Error ${res.status})`);
// //       }
// //       setNewItemUrl(''); 
// //       fetchItems();      
// //     } catch (err) {
// //       setError(err.message);
// //     }
// //   };

// //   return (
// //     <main className="p-8 max-w-2xl mx-auto">
// //       <div className="flex justify-between items-center mb-6">
// //         <h1 className="text-3xl font-bold">My Stash</h1>
// //         <button 
// //           onClick={logout} 
// //           className="text-sm text-gray-400 hover:text-white"
// //         >
// //           Logout ({userEmail})
// //         </button>
// //       </div>

// //       <form onSubmit={handleAddItem} className="mb-6 flex space-x-2">
// //         <input
// //           type="text"
// //           value={newItemUrl}
// //           onChange={(e) => setNewItemUrl(e.target.value)}
// //           placeholder="Add a test URL..."
// //           className="grow p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
// //         />
// //         <button
// //           type="submit"
// //           className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
// //         >
// //           Add Item
// //         </button>
// //       </form>

// //       {loading && <p>Loading items...</p>}
// //       {error && <p className="text-red-500">Error: {error}</p>}

// //       {!loading && !error && (
// //         <div className="flex flex-col space-y-4">
// //           {items.length === 0 ? (
// //             <p>Your stash is empty. Try sharing a link!</p>
// //           ) : (
// //             items.map(item => (
// //               <div key={item.id} className="p-4 border border-gray-700 rounded-lg bg-gray-800">
// //                 <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-600 text-gray-200">
// //                   {item.content_type}
// //                 </span>
// //                 <p className="text-blue-400 mt-2 break-all">
// //                   {item.raw_content}
// //                 </p>
// //                 <p className="text-xs text-gray-400 mt-2">
// //                   {new Date(item.created_at).toLocaleString()}
// //                 </p>
// //               </div>
// //             ))
// //           )}
// //         </div>
// //       )}
// //     </main>
// //   );
// // }

// // // --- Main Page Component (Unchanged) ---
// // export default function Home() {
// //   const { userEmail } = useUser();

// //   if (!userEmail) {
// //     return <LoginScreen />;
// //   }

// //   return <StashApp />;
// // }







// 'use client';
// import { useState, useEffect } from 'react';
// import { useUser } from './UserContext';
// // Import your new components
// import Header from '../../components/Header';
// import StashList from '../../components/StashList';

// // Your API URL (should match UserContext) - use localhost for local testing
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// // --- Login/Signup Component ---
// function LoginScreen() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState(null);
//   const [isLoginView, setIsLoginView] = useState(true); // State to toggle views
//   const [isLoading, setIsLoading] = useState(false); // Loading state for buttons
//   const { login, signup } = useUser();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setIsLoading(true); // Start loading

//     try {
//       if (isLoginView) {
//         await login(email, password);
//       } else {
//         await signup(email, password);
//       }
//       // No need to setIsLoading(false) here, successful auth unmounts this component
//     } catch (err) {
//       setError(err.message);
//       setIsLoading(false); // Stop loading on error
//     }
//   };

//   return (
//     // Centered layout for the login page
//     <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
//       <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">

//         {/* Header */}
//         <h1 className="text-3xl font-bold text-center">Stash</h1>
//         <h2 className="text-xl text-gray-300 text-center">
//           {isLoginView ? 'Sign in to your account' : 'Create a new account'}
//         </h2>

//         {/* The Form */}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-400">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="you@example.com"
//               className="w-full p-3 mt-1 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//               disabled={isLoading} // Disable input while loading
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-400">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               className="w-full p-3 mt-1 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//               disabled={isLoading} // Disable input while loading
//             />
//           </div>

//           {/* Error Message */}
//           {error && <p className="text-red-500 text-sm text-center">{error}</p>}

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors disabled:opacity-50"
//             disabled={isLoading} // Disable button while loading
//           >
//             {isLoading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
//           </button>
//         </form>

//         {/* Toggle Link */}
//         <p className="text-sm text-center text-gray-400">
//           {isLoginView ? "Don't have an account? " : "Already have an account? "}
//           <button
//             onClick={() => {
//               setIsLoginView(!isLoginView); // Flip the view
//               setError(null); // Clear errors on toggle
//               setEmail(''); // Clear fields on toggle
//               setPassword('');
//             }}
//             className="font-medium text-blue-400 hover:text-blue-500 disabled:opacity-50"
//             disabled={isLoading} // Disable toggle while loading
//           >
//             {isLoginView ? 'Sign up' : 'Sign in'}
//           </button>
//         </p>
//       </div>
//     </main>
//   );
// }

// // --- Main App Component ---
// // This now uses Header and StashList
// // function StashApp() {
// //   const { userEmail, logout } = useUser();

// //   // Add item form state
// //   const [newItemUrl, setNewItemUrl] = useState('');
// //   const [addError, setAddError] = useState(null);
// //   const [isAdding, setIsAdding] = useState(false);
// //   // State to trigger refresh in StashList
// //   const [refreshKey, setRefreshKey] = useState(0); 

// //   const handleAddItem = async (e) => {
// //     e.preventDefault();
// //     if (!newItemUrl.trim() || !userEmail) return;

// //     setIsAdding(true);
// //     setAddError(null);
// //     try {
// //       const res = await fetch(`${API_URL}/v1/capture`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'X-User-Email': userEmail // Send user email
// //         },
// //         body: JSON.stringify({
// //           type: 'url',
// //           content: newItemUrl,
// //         }),
// //       });

// //       if (!res.ok) {
// //          let errorDetail = `Failed to add item (Error ${res.status})`;
// //            try {
// //                const errData = await res.json();
// //                errorDetail = errData.detail || errorDetail;
// //            } catch (jsonError) { /* Ignore */ }
// //           throw new Error(errorDetail);
// //       }
// //       setNewItemUrl('');
// //       // Increment refreshKey to trigger useEffect in StashList
// //       setRefreshKey(prevKey => prevKey + 1); 
// //       console.log("Item added, triggering refresh.");

// //     } catch (err) {
// //       setAddError(err.message);
// //     } finally {
// //         setIsAdding(false);
// //     }
// //   };

// // --- Main App Component (UPDATED FOR FormData UPLOAD) ---
// function StashApp() {
//   const { userEmail, logout } = useUser();
//   const [items, setItems] = useState([]); // Keep state for items list

//   // State for the form
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [addError, setAddError] = useState(null);
//   const [isAdding, setIsAdding] = useState(false);
//   const [refreshKey, setRefreshKey] = useState(0);

//   // fileToBase64 is NOT needed anymore for upload, but keep if used elsewhere

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file && file.type.startsWith('image/')) {
//       setSelectedFile(file); // Store the actual File object
//       setAddError(null);
//       const reader = new FileReader();
//       reader.onloadend = () => setPreviewUrl(reader.result);
//       reader.readAsDataURL(file);
//     } else {
//       // Handle invalid file or no selection
//       setSelectedFile(null);
//       setPreviewUrl(null);
//       if (file) setAddError('Please select a valid image file.');
//       // Reset file input visually if deselected
//       event.target.value = null;
//     }
//   };

//   // Handle submitting the image using FormData
//   const handleAddItem = async (e) => {
//     e.preventDefault();
//     if (!selectedFile || !userEmail) {
//       setAddError('Please select an image file first.');
//       return;
//     };

//     setIsAdding(true);
//     setAddError(null);

//     // --- Create FormData ---
//     const formData = new FormData();
//     formData.append('file', selectedFile); // Append the File object directly
//     // Note: We don't append userEmail here; it's sent via header by the backend guard

//     try {
//       console.log(`Uploading image file: ${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`);

//       // --- Send FormData to the new endpoint ---
//       const res = await fetch(`${API_URL}/v1/capture/image`, { // <-- New Endpoint
//         method: 'POST',
//         headers: {
//           // 'Content-Type' is set automatically by browser for FormData
//           'X-User-Email': userEmail // Still need to send the user email header
//         },
//         body: formData, // Send the FormData object directly
//       });
//       // -----------------------------------------

//       if (!res.ok) {
//         let errorDetail = `Failed to add image (Error ${res.status})`;
//         try { const errData = await res.json(); errorDetail = errData.detail || errorDetail; }
//         catch (jsonError) { /* Ignore */ }
//         throw new Error(errorDetail);
//       }

//       // Clear form and trigger refresh
//       setSelectedFile(null);
//       setPreviewUrl(null);
//       e.target.reset();
//       setRefreshKey(prevKey => prevKey + 1);
//       console.log("Image uploaded, triggering refresh.");

//     } catch (err) {
//       console.error("Error adding image:", err);
//       setAddError(err.message || "Failed to upload image.");
//     } finally {
//       setIsAdding(false);
//     }
//   };

//   // --- JSX for StashApp (Form updated slightly) ---
//   return (
//     <main className="p-4 sm:p-8 max-w-5xl mx-auto text-white min-h-screen">
//       <Header userEmail={userEmail} logoutFunction={logout} />

//       {/* UPDATED Add Item Form for Images */}
//       <form onSubmit={handleAddItem} className="mb-8 p-4 border border-gray-600 rounded bg-gray-700">
//         <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-300 mb-2">
//           Add an Image to your stash:
//         </label>
//         <div className="flex flex-col sm:flex-row gap-3 items-center">
//           <input
//             id="imageUpload"
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             // Added key={refreshKey} to help reset the input after successful upload
//             key={`file-input-${refreshKey}`}
//             className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 cursor-pointer"
//             disabled={isAdding}
//           />
//           <button
//             type="submit"
//             className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
//             disabled={isAdding || !selectedFile}
//           >
//             {isAdding ? 'Uploading...' : 'Add Image'}
//           </button>
//         </div>
//         {previewUrl && (
//           <div className="mt-4"> <img src={previewUrl} alt="Selected preview" className="max-h-40 rounded border border-gray-500" /> </div>
//         )}
//         {addError && <p className="text-red-500 text-sm text-center mt-3">{addError}</p>}
//       </form>

//       {/* <form onSubmit={handleAddItem} className="mb-8 flex flex-col sm:flex-row gap-2">
//         <input
//           type="url" // Use type="url" for better mobile input
//           value={newItemUrl}
//           onChange={(e) => setNewItemUrl(e.target.value)}
//           placeholder="Add a URL to your stash..."
//           className="grow p-3 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           disabled={isAdding}
//           required // Make URL required
//         />
//         <button
//           type="submit"
//           className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
//           disabled={isAdding}
//         >
//           {isAdding ? 'Adding...' : 'Add Item'}
//         </button>
//       </form> */}

//       {/* StashList (unchanged, uses refreshKey) */}
//       <StashList userEmail={userEmail} key={refreshKey} />
//     </main>
//   );
// }
// // --- LoginScreen component (Unchanged) ---
// // --- Home component (Unchanged) ---


// //   return (
// //     // Added text-white for default text color
// //     <main className="p-4 sm:p-8 max-w-5xl mx-auto text-white min-h-screen">
// //       <Header userEmail={userEmail} logoutFunction={logout} />

// //       {/* Add Item Form */}
// // <form onSubmit={handleAddItem} className="mb-8 flex flex-col sm:flex-row gap-2">
// //   <input
// //     type="url" // Use type="url" for better mobile input
// //     value={newItemUrl}
// //     onChange={(e) => setNewItemUrl(e.target.value)}
// //     placeholder="Add a URL to your stash..."
// //     className="grow p-3 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //     disabled={isAdding}
// //     required // Make URL required
// //   />
// //   <button
// //     type="submit"
// //     className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
// //     disabled={isAdding}
// //   >
// //     {isAdding ? 'Adding...' : 'Add Item'}
// //   </button>
// // </form>
// //        {addError && <p className="text-red-500 text-sm text-center mb-4">Error adding item: {addError}</p>}

// //       {/* Main content area - Pass refreshKey to StashList */}
// //       <StashList userEmail={userEmail} key={refreshKey} />
// //     </main>
// //   );
// // }



// // --- Main Page Component (Entry Point) ---
// export default function Home() {
//   const { userEmail } = useUser();
//   if (!userEmail) {
//     return <LoginScreen />;
//   }
//   return <StashApp />;
// }













'use client';
import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
// Import your components (adjust path if needed)
import Header from '../../components/Header';
import StashList from '../../components/StashList';

// API URL - Ensure this is set in Vercel/Render env vars for deployment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// --- Login/Signup Component (Keep the same nice version) ---
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isLoginView) await login(email, password);
      else await signup(email, password);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center">Stash</h1>
        <h2 className="text-xl text-gray-300 text-center">
          {isLoginView ? 'Sign in to your account' : 'Create a new account'}
        </h2>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={isLoading} className="w-full p-3 mt-1 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"/>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required disabled={isLoading} className="w-full p-3 mt-1 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"/>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors disabled:opacity-50">
            {isLoading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
          </button>
        </form>
        {/* Toggle Link */}
        <p className="text-sm text-center text-gray-400">
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLoginView(!isLoginView); setError(null); setEmail(''); setPassword(''); }} disabled={isLoading} className="font-medium text-blue-400 hover:text-blue-500 disabled:opacity-50">
            {isLoginView ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </main>
  );
}


// --- Main App Component (With separate URL and Image forms) ---
function StashApp() {
  const { userEmail, logout } = useUser();

  // State for URL form
  const [newUrl, setNewUrl] = useState('');
  const [urlAddError, setUrlAddError] = useState(null);
  const [isAddingUrl, setIsAddingUrl] = useState(false);

  // State for Image form
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageAddError, setImageAddError] = useState(null);
  const [isAddingImage, setIsAddingImage] = useState(false);

  // State to trigger refresh in StashList
  const [refreshKey, setRefreshKey] = useState(0);

  // --- Handler for URL Form ---
  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!newUrl.trim() || !userEmail) return;

    setIsAddingUrl(true);
    setUrlAddError(null);
    try {
      const res = await fetch(`${API_URL}/v1/capture`, { // Use the URL/Text endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail
        },
        body: JSON.stringify({
          type: 'url', // Send type as 'url'
          content: newUrl,
        }),
      });
      if (!res.ok) {
         let errorDetail = `Failed to add URL (Error ${res.status})`;
         try { const errData = await res.json(); errorDetail = errData.detail || errorDetail; } catch { /* Ignore */ }
         throw new Error(errorDetail);
      }
      setNewUrl(''); // Clear input
      setRefreshKey(prevKey => prevKey + 1); // Trigger refresh
      console.log("URL added, triggering refresh.");
    } catch (err) {
      setUrlAddError(err.message);
    } finally {
      setIsAddingUrl(false);
    }
  };

  // --- Handler for Image Form ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setImageAddError(null);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else { /* Reset state */ setSelectedFile(null); setPreviewUrl(null); if (file) setImageAddError('Invalid image file.'); event.target.value = null; }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!selectedFile || !userEmail) { setImageAddError('Please select an image first.'); return; }

    setIsAddingImage(true);
    setImageAddError(null);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch(`${API_URL}/v1/capture/image`, { // Use the Image endpoint
        method: 'POST',
        headers: { 'X-User-Email': userEmail }, // No Content-Type needed for FormData
        body: formData,
      });
       if (!res.ok) {
         let errorDetail = `Failed to add image (Error ${res.status})`;
         try { const errData = await res.json(); errorDetail = errData.detail || errorDetail; } catch { /* Ignore */ }
         throw new Error(errorDetail);
       }
      // Clear form and refresh
      setSelectedFile(null); setPreviewUrl(null); e.target.reset();
      setRefreshKey(prevKey => prevKey + 1);
      console.log("Image uploaded, triggering refresh.");
    } catch (err) {
      setImageAddError(err.message);
    } finally {
      setIsAddingImage(false);
    }
  };

  return (
    <main className="p-4 sm:p-8 max-w-5xl mx-auto text-white min-h-screen">
      <Header userEmail={userEmail} logoutFunction={logout} />

      {/* --- URL Add Form --- */}
      <form onSubmit={handleAddUrl} className="mb-6 flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Add a URL to your stash..."
          className="flex-grow p-3 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isAddingUrl}
          required
        />
        <button
          type="submit"
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
          disabled={isAddingUrl || !newUrl.trim()}
        >
          {isAddingUrl ? 'Adding URL...' : 'Add URL'}
        </button>
      </form>
      {urlAddError && <p className="text-red-500 text-sm text-center mb-4">Error: {urlAddError}</p>}

      {/* --- Image Add Form --- */}
      <form onSubmit={handleAddImage} className="mb-8 p-4 border border-gray-600 rounded bg-gray-700">
         <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-300 mb-2">
           Or add an Image:
         </label>
         <div className="flex flex-col sm:flex-row gap-3 items-center">
             <input id="imageUpload" type="file" accept="image/*" onChange={handleFileChange} key={`file-input-${refreshKey}`} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 cursor-pointer" disabled={isAddingImage}/>
             <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors disabled:opacity-50 whitespace-nowrap" disabled={isAddingImage || !selectedFile}>
               {isAddingImage ? 'Uploading...' : 'Add Image'}
             </button>
         </div>
          {previewUrl && <div className="mt-4"><img src={previewUrl} alt="Preview" className="max-h-40 rounded border border-gray-500"/></div>}
          {imageAddError && <p className="text-red-500 text-sm text-center mt-3">{imageAddError}</p>}
      </form>

      {/* --- Stash List --- */}
      <StashList userEmail={userEmail} key={refreshKey} />
    </main>
  );
}

// --- Main Page Component (Entry Point - Unchanged) ---
export default function Home() {
  const { userEmail } = useUser();
  if (!userEmail) {
    return <LoginScreen />;
  }
  return <StashApp />;
}