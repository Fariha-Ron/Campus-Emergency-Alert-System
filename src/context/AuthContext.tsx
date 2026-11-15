import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ user: User; role: 'student' | 'admin' }>;
  signup: (email: string, pass: string, name: string, role?: 'student' | 'admin') => Promise<{ user: User; role: 'student' | 'admin' }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Check user profile and role in Firestore
  const fetchUserProfile = async (user: User): Promise<UserProfile> => {
    const isDesignatedAdminEmail = Boolean(
      user.email?.toLowerCase() === 'naofumiiwatanisan911@gmail.com'
    );

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        const adminFlag = Boolean(data.role === 'admin' || isDesignatedAdminEmail);
        const resolved: UserProfile = { ...data, role: adminFlag ? 'admin' : 'student' };
        setUserProfile(resolved);
        setIsAdmin(adminFlag);
        return resolved;
      } else {
        // Create baseline profile if not yet existing
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || 'student@campus.edu',
          displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Campus User'),
          role: isDesignatedAdminEmail ? 'admin' : 'student',
          createdAt: new Date().toISOString(),
        };
        try {
          await setDoc(userDocRef, newProfile);
        } catch {
          // Ignore if Firestore rules restrict initial write
        }
        setUserProfile(newProfile);
        setIsAdmin(isDesignatedAdminEmail);
        return newProfile;
      }
    } catch (err) {
      console.warn('Failed to load user profile from Firestore, checking auth email:', err);
      const fallbackProfile: UserProfile = {
        uid: user.uid,
        email: user.email || 'user@campus.edu',
        displayName: user.displayName || 'Campus User',
        role: isDesignatedAdminEmail ? 'admin' : 'student',
      };
      setUserProfile(fallbackProfile);
      setIsAdmin(isDesignatedAdminEmail);
      return fallbackProfile;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Standard Email/Password Login
  const login = async (email: string, pass: string): Promise<{ user: User; role: 'student' | 'admin' }> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const isDesignatedAdmin = normalizedEmail === 'naofumiiwatanisan911@gmail.com';
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      
      setCurrentUser(cred.user);
      if (isDesignatedAdmin) {
        setIsAdmin(true);
      }

      const profile = await fetchUserProfile(cred.user);
      const finalRole: 'student' | 'admin' = (isDesignatedAdmin || profile?.role === 'admin') ? 'admin' : 'student';
      setIsAdmin(finalRole === 'admin');
      return { user: cred.user, role: finalRole };
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        throw new Error(
          'Email/Password sign-in method is currently disabled in your Firebase project console. Please enable Email/Password under Authentication -> Sign-in method.'
        );
      }
      throw err;
    }
  };

  // Standard Email/Password Registration
  const signup = async (
    email: string,
    pass: string,
    name: string,
    _role?: 'student' | 'admin'
  ): Promise<{ user: User; role: 'student' | 'admin' }> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      // Only naofumiiwatanisan911@gmail.com is allowed admin role on registration
      const isDesignatedAdmin = normalizedEmail === 'naofumiiwatanisan911@gmail.com';
      const assignedRole: 'student' | 'admin' = isDesignatedAdmin ? 'admin' : 'student';

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name && cred.user) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }

      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email.trim(),
        displayName: name.trim() || email.split('@')[0],
        role: assignedRole,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', cred.user.uid), profile);
        if (assignedRole === 'admin') {
          await setDoc(doc(db, 'admins', cred.user.uid), {
            uid: cred.user.uid,
            email: cred.user.email,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn('Profile sync notice:', e);
      }

      setCurrentUser(cred.user);
      setUserProfile(profile);
      setIsAdmin(assignedRole === 'admin');
      return { user: cred.user, role: assignedRole };
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        throw new Error(
          'Email/Password provider is not enabled in Firebase Console for this project. Please enable Email/Password under Authentication -> Sign-in method.'
        );
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut notice:', e);
    }
    setCurrentUser(null);
    setUserProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
