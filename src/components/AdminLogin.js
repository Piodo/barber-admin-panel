import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        // More flexible role checking
        const userRole = userData.role?.toString().trim().toLowerCase();
        
        if (!userRole) {
          setError('Access denied: No role assigned to this user. Please contact administrator.');
          await auth.signOut();
          return;
        }

        // Check for admin role (case insensitive)
        if (userRole === 'admin') {
          onLoginSuccess();
        } else {
          setError(`Access denied: Admin role required. Your role: "${userData.role}"`);
          await auth.signOut();
        }
      } else {
        setError('User profile not found in Firestore database. Please contact administrator.');
        await auth.signOut();
      }

    } catch (error) {
      console.error("Login error:", error);
      if (error.code === 'auth/user-not-found') {
        setError('Email not registered in authentication.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError(`Login failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', backgroundColor: '#333', borderRadius: '8px', color: 'white' }}>
      <h2 style={{ textAlign: 'center', color: '#BD9245' }}>Admin Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#444', color: 'white' }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#444', color: 'white' }}
          required
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px', backgroundColor: loading ? '#555' : '#BD9245', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      </form>
    </div>
  );
};

export default AdminLogin;