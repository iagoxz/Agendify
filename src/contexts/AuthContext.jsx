import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [businessProfile, setBusinessProfile] = useState(null); // <<< NOVO STATE para a empresa
  const [loadingAuthState, setLoadingAuthState] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const profileData = { uid: user.uid, ...userDocSnap.data() };
          setUserProfile(profileData);

          // >>> SE FOR EMPRESÁRIO, BUSCA OS DADOS DA EMPRESA <<<
          if (profileData.role === 'empresario') {
            const businessDocRef = doc(db, 'businesses', user.uid);
            const businessDocSnap = await getDoc(businessDocRef);
            if (businessDocSnap.exists()) {
              setBusinessProfile({ id: businessDocSnap.id, ...businessDocSnap.data() });
            } else {
              setBusinessProfile(null);
            }
          } else {
            setBusinessProfile(null);
          }
        } else {
          setUserProfile(null);
          setBusinessProfile(null);
        }
      } else {
        setUserProfile(null);
        setBusinessProfile(null);
      }
      setLoadingAuthState(false);
    });
    return unsubscribe;
  }, []);

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    userProfile,
    businessProfile, 
    loadingAuthState,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loadingAuthState && children}
    </AuthContext.Provider>
  );
}