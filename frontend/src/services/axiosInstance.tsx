import axios from "axios";

const axiosJWT = axios.create({
  baseURL: "https://campuscarawanbackenddeployed-production.up.railway.app",
  withCredentials: true,
});

export default axiosJWT;