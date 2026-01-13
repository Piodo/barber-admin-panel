import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { auth, db } from './firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth'; 
import { doc, getDoc } from 'firebase/firestore';

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid); 
          const userDocSnap = await getDoc(userDocRef); 
          
          if (userDocSnap.exists()) {
            const userRole = userDocSnap.data().role; 
            
            if (userRole === 'admin') {
              setIsAdminLoggedIn(true); 
            } else {
              console.log("Logged in user is not an admin. Signing out.");
              await auth.signOut();
              setIsAdminLoggedIn(false);
            }
          } else {
            console.log("User document not found in Firestore. Signing out.");
            await auth.signOut();
            setIsAdminLoggedIn(false);
          }
        } catch (error) {
          console.error("Error checking admin role from Firestore:", error);
          setIsAdminLoggedIn(false);
        }
      } else {
        setIsAdminLoggedIn(false);
      }
      setLoading(false); 
    });
    
    return () => unsubscribe();
  }, []); 

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
  };

  const handleLogout = async () => {
    await auth.signOut(); 
    setIsAdminLoggedIn(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '100px', color: 'white', backgroundColor: '#1C1D1D', minHeight: '100vh' }}>Loading authentication...</div>;
  }

  return (
    <div style={{ backgroundColor: '#1C1D1D', minHeight: '100vh', color: 'white' }}>
      {isAdminLoggedIn ? (
        <AdminDashboard onLogout={handleLogout} /> 
      ) : (
        <AdminLogin onLoginSuccess={handleLoginSuccess} /> 
      )}
    </div>
  );
}

export default App;
