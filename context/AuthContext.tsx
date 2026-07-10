import React, { createContext, useContext, useMemo, useState } from 'react';
import { User, Vendor, currentUserWithShop, vendors } from '../data/mockData';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  myVendor: Vendor | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsLoading(false);
    if (!email.includes('@')) {
      return { success: false, error: 'Merci de saisir une adresse email valide.' };
    }
    // Mock : connexion en tant qu'utilisatrice de démo qui possède déjà "Le Vestiaire de Claire"
    setUser({ ...currentUserWithShop, email });
    return { success: true };
  };

  const signup = async (name: string, email: string, _password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsLoading(false);
    if (!name.trim()) return { success: false, error: 'Merci de saisir votre nom complet.' };
    if (!email.includes('@')) return { success: false, error: 'Merci de saisir une adresse email valide.' };
    // Mock : un tout nouveau compte ne possède pas encore de boutique
    setUser({
      id: 'user-new',
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300',
      joinedDate: "Aujourd'hui",
      vendorId: null,
    });
    return { success: true };
  };

  const logout = () => setUser(null);

  const myVendor = useMemo(
    () => vendors.find((v) => v.ownerUserId === user?.id) ?? null,
    [user],
  );

  const value = useMemo(
    () => ({ user, isLoading, myVendor, login, signup, logout }),
    [user, isLoading, myVendor],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  return ctx;
}
