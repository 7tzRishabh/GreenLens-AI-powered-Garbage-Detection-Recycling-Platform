import React, { useState } from 'react';
import { Leaf, ArrowRight, Lock, Mail, User as UserIcon, Truck, Shield, AlertTriangle } from 'lucide-react';
import { User } from '../types';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'driver'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(adminEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (adminPassword !== 'admin123') {
      setError('Invalid admin credentials.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Try to sign in
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    } catch (err: any) {
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: 'Municipality Admin',
            email: adminEmail,
            role: 'municipality_admin',
            createdAt: new Date().toISOString()
          });
        } catch (createErr: any) {
          setError(createErr.message || 'Failed to create admin account');
          if (createErr.code && !createErr.code.startsWith('auth/')) {
            handleFirestoreError(createErr, OperationType.CREATE, 'users');
          }
        }
      } else {
        setError(err.message || 'Failed to login as admin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) return;

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (email.toLowerCase() === 'admin@greenlens.com') {
      setError('Please use the Admin Login page for this email.');
      return;
    }

    if (isSignUp && password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Save user role to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: name,
          email: email,
          role: role,
          points: 120,
          streak: 15,
          co2Saved: 2.4,
          itemsRecycled: 15,
          createdAt: new Date().toISOString(),
          ...(role === 'driver' ? { driverStatus: 'Active', totalPickups: 0, rating: 5.0, walletBalance: 0 } : {})
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // The App.tsx onAuthStateChanged will handle the rest
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else {
        console.error("Auth error:", err);
        setError(err.message || 'Authentication failed');
        if (err.code && !err.code.startsWith('auth/')) {
          handleFirestoreError(err, OperationType.WRITE, 'users');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (user.email?.toLowerCase() === 'admin@greenlens.com') {
        setError('This email is reserved for admin use. Please use email/password login.');
        await auth.signOut();
        setIsGoogleLoading(false);
        return;
      }
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName || 'Eco Warrior',
          email: user.email || '',
          role: role, // Use the selected role for new Google signups
          points: 120,
          streak: 15,
          co2Saved: 2.4,
          itemsRecycled: 15,
          createdAt: new Date().toISOString(),
          ...(role === 'driver' ? { driverStatus: 'Active', totalPickups: 0, rating: 5.0, walletBalance: 0 } : {})
        });
      }
      // App.tsx onAuthStateChanged will handle the rest
    } catch (err: any) {
      console.error("Error signing in with Google", err);
      setError(err.message || 'Google sign-in failed');
      handleFirestoreError(err, OperationType.WRITE, 'users');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-fade-in transition-colors duration-300">
      <div className="w-full max-w-sm">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-3xl shadow-xl mb-4 rotate-3">
            <Leaf size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">GreenLens</h1>
          <p className="text-gray-600 mt-2 font-medium">Recycle smarter, live better.</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {showAdminForm ? 'Admin Login' : (isSignUp ? 'Create Account' : 'Welcome Back')}
          </h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center">
              <AlertTriangle size={16} className="mr-2 shrink-0" />
              {error}
            </div>
          )}
          
          {!showAdminForm && isSignUp && (
            <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-8">
              <button 
                type="button"
                onClick={() => setRole('user')}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === 'user' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserIcon size={16} className="mr-2" /> User
              </button>
              <button 
                type="button"
                onClick={() => setRole('driver')}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === 'driver' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Truck size={16} className="mr-2" /> Driver
              </button>
            </div>
          )}

          {!showAdminForm && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center mb-8 active:scale-[0.98]"
              >
                {isGoogleLoading ? (
                  <span className="w-5 h-5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></span>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              <div className="flex items-center mb-8">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="px-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">OR</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
            </>
          )}

          {showAdminForm ? (
            <form onSubmit={handleAdminLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@greenlens.com"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all flex items-center justify-center mt-8 active:scale-95"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    Login as Admin <ArrowRight size={20} className="ml-2" />
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowAdminForm(false);
                  setError('');
                }}
                className="w-full text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors mt-6"
              >
                Back to User Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                      type="text"
                      required={isSignUp}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all flex items-center justify-center mt-8 active:scale-95"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={20} className="ml-2" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {!showAdminForm && (
          <>
            <p className="text-center text-gray-500 text-sm mt-8 font-medium">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <span 
                className="text-emerald-600 font-bold cursor-pointer hover:underline"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </span>
            </p>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowAdminForm(true);
                  setError('');
                }}
                disabled={isLoading}
                className="text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors flex items-center justify-center mx-auto"
              >
                <Shield size={14} className="mr-1.5" /> Login as Admin
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
