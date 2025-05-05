import axiosJWT from "./axiosInstance";
import { AuthUser } from "../interfaces/authInterfaces";


// interface User {
//   accessToken: string;
//   [key: string]: any
// }


export const refreshToken = async (): Promise<string | null> => {
  try {
    const res = await axiosJWT.post<{ accessToken: string }>("/auth/refresh", {});
    return res.data.accessToken;
  } catch (err:any) {
    console.log("Refresh Token Error:", err);
    return null;
  }
};


export const loginUser = async (
  username: string,
  password: string,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<null | string>>
): Promise<string | null> => {
  try {
    setLoading(true);
    setError(null); 
    console.log("Trying to login");

    const res = await axiosJWT.post<{ accessToken: string }>("/auth/login", { username, password });
    console.log("Logged user: ", res.data);

    return res.data.accessToken;

  } catch (err: any) {
    setError(err.response.data.error);
    return null;
  } finally {
    setLoading(false);
  }
};


export const signupUser = async (
  userData: any,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<null | string>>
) => {
  try {
    setLoading(true);
    setError(null);

    const res = await axiosJWT.post<any>("/auth/signup", userData);

    const accessToken = res.data.accessToken;
    return accessToken;

  } catch (err: any) {
    setError(err.response.data.error);

  } finally {
    setLoading(false);
  }
}
export const getUser = async (accessToken: string): Promise<any> => {
  try {
    console.log("Trying: ");
    const res = await axiosJWT.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });

    console.log("THIS00000: ", res.data);
    return res.data;
  } catch (err) {
    console.error("Error fetching user data:", err);
  }
};

export const logoutUser = async (
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>,
  accessToken: string | null
): Promise<void> => {
  try {
    await axiosJWT.post(
      "/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true, 
      }
    );

    setUser(null);
  } catch (err) {
    console.log("Logout Error:", err);
  }
};

