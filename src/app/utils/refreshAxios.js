import axios from 'axios';

// A separate axios instance with no interceptors
export const refreshAxios = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE_URL // optional
});
