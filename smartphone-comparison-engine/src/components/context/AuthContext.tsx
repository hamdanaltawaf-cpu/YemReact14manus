import React, { createContext, useContext, useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle as serviceSignInWithGoogle, signOut as serviceSignOut } from "../../services/auth.service";
import { apiFetch } from "../../utils/apiFetch";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdminUser: boolean;
  signIn: () => Promise<User>;
  logOut: () => Promise<void>;
}

const ADMIN_EMAILS = [
  "hamdanaltawaf@gmail.com",
  "mtaltawaf23@gmail.com"
];

/**
 * Custom logic validating if the parsed address represents a system administrator.
 */
export const isAdmin = (email?: string | null): boolean => {
  return ADMIN_EMAILS.includes(
    (email ?? "").trim().toLowerCase()
  );
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    // onAuthStateChanged registers user status on startup and keeps state across tab reloads
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser?.email) {
        try {
          const res = await apiFetch(`/api/auth/is-admin?email=${encodeURIComponent(firebaseUser.email)}`);
          const data = await res.json();
          if (data.isAdmin) {
            setIsAdminUser(true);
          } else {
            setIsAdminUser(false);
            // Automatic logout for non-allowed emails
            await serviceSignOut();
          }
        } catch (err) {
          setIsAdminUser(false);
        }
      } else {
        setIsAdminUser(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const u = await serviceSignInWithGoogle();
      return u;
    } catch (error) {
      console.error("Auth Exception inside AuthProvider:", error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await serviceSignOut();
    } catch (error) {
      console.error("Logout Exception inside AuthProvider:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdminUser, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be called inside an AuthProvider element structure.");
  }
  return context;
};
