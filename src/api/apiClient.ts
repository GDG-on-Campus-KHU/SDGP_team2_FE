import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = 'http://35.216.4.12:8080'; 

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

const saveTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const removeTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('리프레시 토큰이 없습니다.');
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refreshToken
    });
    
    if (response.data && response.data.data) {
      const newAccessToken = response.data.data;
      localStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;
    }
    
    throw new Error('토큰 갱신 실패');
  } catch (error) {
    removeTokens(); 
    throw error;
  }
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && 
        error.response?.data?.code === 'AUTH404' && 
        !originalRequest._retry) {
      
      originalRequest._retry = true;
      
      try {
        const newAccessToken = await refreshAccessToken();        

        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return apiClient(originalRequest);
      } catch (refreshError) {
        removeTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const register = async (userData: {
  username: string;
  password: string;
  email: string;
  role: string;
  profileImage?: string;
}) => {
  return apiClient.post('/api/auth/register', userData);
};

export const login = async (loginData: {
  username: string;
  password: string;
}) => {
  return apiClient.post('/api/auth/login', loginData);
};

export const googleLogin = async (authCode: string) => {
  return apiClient.post('/api/auth/login/google', {
    authorizationCode: authCode
  });
};

export const logout = async () => {
  removeTokens();
  return { success: true };
};

export default apiClient;