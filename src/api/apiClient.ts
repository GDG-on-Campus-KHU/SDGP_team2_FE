import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// 프록시 사용을 위해 기본 URL을 비워둡니다
// 개발 환경: 빈 문자열 사용
// 프로덕션 환경: 실제 API URL 사용 (배포 시 수정 필요)
const API_BASE_URL = '';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 타임아웃 시간 (15초)
});

// 액세스 토큰 가져오기
const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// 리프레시 토큰 가져오기
const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

// 토큰 저장
const saveTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

// 토큰 제거
const removeTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// 토큰 갱신
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('리프레시 토큰이 없습니다.');
  }
  
  try {
    console.log('[디버깅] 토큰 갱신 시도...');
    
    // 상대 경로 사용 (프록시 적용)
    const response = await axios.post('/api/auth/refresh', {
      refreshToken
    });
    
    console.log('[디버깅] 토큰 갱신 응답:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data ? '(응답 데이터 있음)' : '(응답 데이터 없음)'
    });
    
    if (response.data && response.data.data) {
      const newAccessToken = response.data.data;
      localStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;
    }
    
    throw new Error('토큰 갱신 실패: 응답에 새 토큰이 없습니다.');
  } catch (error: any) {
    console.error('[디버깅] 토큰 갱신 오류:', error.message);
    
    if (error.response) {
      console.error('[디버깅] 응답 데이터:', error.response.data);
      console.error('[디버깅] 응답 상태:', error.response.status);
    }
    
    removeTokens();
    throw error;
  }
};

// 요청 인터셉터 - 모든 요청에 인증 헤더 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    
    console.log('[디버깅] API 요청:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      hasToken: !!accessToken
    });
    
    return config;
  },
  (error) => {
    console.error('[디버깅] API 요청 인터셉터 오류:', error.message);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 만료 처리 및 갱신
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('[디버깅] API 응답 성공:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 로그 정보 설정
    const errorInfo = {
      url: originalRequest?.url,
      method: originalRequest?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message
    };
    
    // 만료된 토큰으로 인한 인증 오류인 경우
    if (error.response?.status === 401 && 
        error.response?.data?.code === 'AUTH404' && 
        !originalRequest._retry) {
      
      console.log('[디버깅] 인증 오류 감지 - 토큰 갱신 시도', errorInfo);
      originalRequest._retry = true;
      
      try {
        // 토큰 갱신 시도
        const newAccessToken = await refreshAccessToken();
        console.log('[디버깅] 새 액세스 토큰 발급 성공');
        
        // 원래 요청 헤더 업데이트 후 재시도
        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('[디버깅] 토큰 갱신 실패 - 로그아웃 필요');
        
        // 토큰 갱신 실패 시 로그아웃 처리
        removeTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    console.error('[디버깅] API 오류:', errorInfo);
    
    if (error.response) {
      console.error('[디버깅] 응답 데이터:', error.response.data);
    } else if (error.request) {
      console.error('[디버깅] 요청만 전송됨 (응답 없음)');
    }
    
    return Promise.reject(error);
  }
);

// API 함수들

// 회원가입 API
export const register = async (userData: {
  username: string;
  password: string;
  email: string;
  role: string;
  profileImage?: string;
}) => {
  console.log('[디버깅] 회원가입 요청:', {
    ...userData,
    password: '********' 
  });
  return apiClient.post('/api/auth/register', userData);
};

// 로그인 API
export const login = async (loginData: {
  username: string;
  password: string;
}) => {
  console.log('[디버깅] 로그인 요청:', { 
    username: loginData.username,
    password: '********' 
  });
  return apiClient.post('/api/auth/login', loginData);
};

// 구글 로그인 API
export const googleLogin = async (authCode: string) => {
  console.log('[디버깅] 구글 로그인 요청:', { 
    authorizationCode: authCode.substring(0, 10) + '...' 
  });
  
  try {
    return await apiClient.post('/api/auth/login/google', {
      authorizationCode: authCode
    });
  } catch (error) {
    console.error('[디버깅] 구글 로그인 요청 실패:', error);
    throw error;
  }
};

// 로그아웃 
export const logout = async () => {
  console.log('[디버깅] 로그아웃 처리');
  removeTokens();
  return { success: true };
};

// 수거 요청 생성 API
export const createPickupRequest = async (groundId: number, requestData: {
  amount: number;
  message?: string;
  pickupDate: string;
}) => {
  console.log('[디버깅] 수거 요청 생성:', { groundId, ...requestData });
  
  try {
    // 실제 API가 준비되었을 때 사용할 코드
    // return await apiClient.post(`/api/pickups/${groundId}`, requestData);
    
    // 모킹 - 실제 API가 준비되지 않은 환경에서 테스트
    return {
      data: {
        success: true,
        code: "PICKUP_CREATE_SUCCESS",
        message: "수거 요청이 성공적으로 생성되었습니다.",
        data: {
          pickupId: Date.now(),
          memberId: 1, // 현재 로그인한 사용자 ID
          groundId: groundId,
          amount: requestData.amount,
          message: requestData.message,
          pickupDate: requestData.pickupDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "PENDING"
        }
      }
    };
  } catch (error) {
    console.error('[디버깅] 수거 요청 생성 오류:', error);
    throw error;
  }
};

// 수거 요청 목록 조회 API - 사용자 기준
export const getUserPickups = async (status?: string) => {
  console.log('[디버깅] 사용자 수거 요청 목록 조회:', { status });
  
  try {
    // 실제 API가 준비되었을 때 사용할 코드
    // const url = status ? `/api/mypage/pickups?status=${status}` : '/api/mypage/pickups';
    // return await apiClient.get(url);
    
    // 모킹 - 실제 API가 준비되지 않은 환경에서 테스트
    // 현재 MapComponent에 있는 MOCK_LOCATIONS을 활용
    const mockLocations = [
      { 
        id: 1, 
        cafeName: '스타벅스 강남점', 
        requestDate: new Date('2023-11-29'),
        pickupDate: new Date('2023-12-05'),
        beanName: '에티오피아 예가체프',
        amount: 3.5,
        status: status || 'PENDING'
      },
      { 
        id: 2, 
        cafeName: '커피빈 선릉점', 
        requestDate: new Date('2023-11-27'),
        pickupDate: new Date('2023-12-04'),
        beanName: '콜롬비아 수프리모',
        amount: 2.0,
        status: 'ACCEPTED'
      },
      { 
        id: 3, 
        cafeName: '블루보틀 삼청점', 
        requestDate: new Date('2023-11-25'),
        pickupDate: new Date('2023-12-03'),
        beanName: '브라질 산토스',
        amount: 4.0,
        status: 'COMPLETED'
      },
      { 
        id: 4, 
        cafeName: '이디야 서초점', 
        requestDate: new Date('2023-11-20'),
        pickupDate: new Date('2023-11-25'),
        beanName: '에티오피아 예가체프',
        amount: 5.0,
        status: 'REJECTED'
      }
    ];
    
    // 상태 필터링
    const filteredPickups = status 
      ? mockLocations.filter(p => p.status === status)
      : mockLocations;
    
    return {
      data: {
        success: true,
        code: "PICKUP_GET_LIST_SUCCESS",
        message: "수거 요청 목록을 성공적으로 조회했습니다.",
        data: filteredPickups
      }
    };
  } catch (error) {
    console.error('[디버깅] 수거 요청 목록 조회 오류:', error);
    throw error;
  }
};

// 수거 요청 삭제 API
export const deletePickup = async (pickupId: number) => {
  console.log('[디버깅] 수거 요청 삭제:', { pickupId });
  
  try {
    // 실제 API가 준비되었을 때 사용할 코드
    // return await apiClient.delete(`/api/pickups/${pickupId}`);
    
    // 모킹 - 실제 API가 준비되지 않은 환경에서 테스트
    return {
      data: {
        success: true,
        code: "PICKUP_DELETE_SUCCESS",
        message: "수거 요청이 성공적으로 삭제되었습니다."
      }
    };
  } catch (error) {
    console.error('[디버깅] 수거 요청 삭제 오류:', error);
    throw error;
  }
};

// 수거 요청 상태 업데이트 API
export const updatePickupStatus = async (pickupId: number, status: string) => {
  console.log('[디버깅] 수거 요청 상태 업데이트:', { pickupId, status });
  
  try {
    // 실제 API가 준비되었을 때 사용할 코드
    // return await apiClient.put(`/api/pickups/${pickupId}/status`, { status });
    
    // 모킹 - 실제 API가 준비되지 않은 환경에서 테스트
    return {
      data: {
        success: true,
        code: "PICKUP_STATUS_UPDATE_SUCCESS",
        message: "수거 요청 상태가 성공적으로 수정되었습니다."
      }
    };
  } catch (error) {
    console.error('[디버깅] 수거 요청 상태 업데이트 오류:', error);
    throw error;
  }
};


export default apiClient;