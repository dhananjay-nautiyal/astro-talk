import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { store } from '../store'
import { logout } from '../store/authSlice'
import { apiBaseUrl } from '../utils/env'

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      store.dispatch(logout())
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
