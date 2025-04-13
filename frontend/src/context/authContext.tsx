import React, { createContext, useState, useEffect, ReactNode } from "react";
import { AuthUser } from "../interfaces/authInterfaces.tsx";
import { getUser } from "../services/authServices.tsx";
import { refreshToken } from "../services/authServices.tsx";
import "../static/blue.png";
import Loading from "../components/sub/Loading.tsx";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean | null;
  error: string | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean | null>>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean | null>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const accessToken = await refreshToken();
        if (accessToken) {
          const res = await getUser(accessToken);
          console.log("User: ", res);
          setUser(res);
          setAccessToken(accessToken);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        error,
        setAccessToken,
        setError,
        setUser,
        setLoading,
      }}
    >
      {loading ? (
      <Loading></Loading>
        
      
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
