import axiosJWT from "./axiosInstance";


export const putRequest = async (
  data: any,
  url: string,
): Promise<any> => {
  try {
    console.log("das");
    const response = await axiosJWT.put(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("Response: ", response);
    return response.data;
  } catch (err: any) {
    // if (err.response) {
    // } else if (err.request) {
    // } else {
    // }
    throw err; 
  }
};

export const postRequest = async (
  data: any,
  url: string,
  accessToken: string | null,
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>, 
  setError?: React.Dispatch<React.SetStateAction<null | string>>
) => {
  console.log(accessToken);
  try {
    if (setError) setError(null);
    if (setLoading) setLoading(true); 

    const res = await axiosJWT.post(url, data);

    return res.data;
  } catch (err: any) {
    if (setError) setError(err.response.data.error); 
  } finally {
    if (setLoading) setLoading(false); 
  }
};



export const getRequest = async (
  url: string,
  accessToken:string | null,
  setLoading?:React.Dispatch<React.SetStateAction<boolean>>,
  setError?: React.Dispatch<React.SetStateAction<null | string>>
) => {
  try {
    setError?.(null);
    setLoading?.(true);
    const res = await axiosJWT.get(url,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });

    return res.data;

  } catch (err: any) {
    setError?.(err.response.data.error);
    
  } finally {
    setLoading?.(false);

  }
}
