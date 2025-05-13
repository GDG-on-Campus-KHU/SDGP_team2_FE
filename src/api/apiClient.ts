import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

// 프록시 대신 직접 서버 URL 사용
const API_BASE_URL = "http://34.64.59.141:8080/";

// API 클라이언트 설정
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 타임아웃 시간 (15초)
});

// 액세스 토큰 가져오기
const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

// 리프레시 토큰 가져오기
const getRefreshToken = (): string | null => {
  return localStorage.getItem("refreshToken");
};

// 토큰 저장
const saveTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

// 토큰 제거
const removeTokens = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// 토큰 갱신
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("리프레시 토큰이 없습니다.");
  }

  try {
    console.log("[디버깅] 토큰 갱신 시도...");

    // 전체 URL 경로 사용 (프록시 대신)
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refreshToken,
    });

    console.log("[디버깅] 토큰 갱신 응답:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data ? "(응답 데이터 있음)" : "(응답 데이터 없음)",
    });

    if (response.data && response.data.data) {
      const newAccessToken = response.data.data;
      localStorage.setItem("accessToken", newAccessToken);
      return newAccessToken;
    }

    throw new Error("토큰 갱신 실패: 응답에 새 토큰이 없습니다.");
  } catch (error: any) {
    console.error("[디버깅] 토큰 갱신 오류:", error.message);

    if (error.response) {
      console.error("[디버깅] 응답 데이터:", error.response.data);
      console.error("[디버깅] 응답 상태:", error.response.status);
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
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    console.log("[디버깅] API 요청:", {
      url: config.url,
      method: config.method?.toUpperCase(),
      hasToken: !!accessToken,
    });

    return config;
  },
  (error) => {
    console.error("[디버깅] API 요청 인터셉터 오류:", error.message);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 만료 처리 및 갱신
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("[디버깅] API 응답 성공:", {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
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
      message: error.message,
    };

    // 만료된 토큰으로 인한 인증 오류인 경우
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "AUTH404" &&
      !originalRequest._retry
    ) {
      console.log("[디버깅] 인증 오류 감지 - 토큰 갱신 시도", errorInfo);
      originalRequest._retry = true;

      try {
        // 토큰 갱신 시도
        const newAccessToken = await refreshAccessToken();
        console.log("[디버깅] 새 액세스 토큰 발급 성공");

        // 원래 요청 헤더 업데이트 후 재시도
        originalRequest.headers.set(
          "Authorization",
          `Bearer ${newAccessToken}`
        );
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("[디버깅] 토큰 갱신 실패 - 로그아웃 필요");

        // 토큰 갱신 실패 시 로그아웃 처리
        removeTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    console.error("[디버깅] API 오류:", errorInfo);

    if (error.response) {
      console.error("[디버깅] 응답 데이터:", error.response.data);
    } else if (error.request) {
      console.error("[디버깅] 요청만 전송됨 (응답 없음)");
    }

    return Promise.reject(error);
  }
);

// API 함수들

// 회원가입 API - 프로필 이미지 지원 추가
export interface RegisterUserData {
  username: string;
  password: string;
  email: string;
  role: string;
  profileImage?: string; // 이제 Base64 인코딩된 이미지 또는 URL 문자열 가능
}

export const register = async (userData: RegisterUserData) => {
  console.log("[디버깅] 회원가입 요청:", {
    ...userData,
    password: "********",
    profileImage: userData.profileImage
      ? userData.profileImage.startsWith("data:image")
        ? "(Base64 인코딩된 사용자 이미지)"
        : userData.profileImage
      : "(프로필 이미지 없음)",
  });

  // Base64 이미지가 너무 크면 요청이 실패할 수 있으므로 검증
  if (userData.profileImage && userData.profileImage.startsWith("data:image")) {
    // Base64 문자열의 크기 (바이트) 계산
    const base64Size = Math.ceil((userData.profileImage.length * 3) / 4);
    // 2MB보다 크면 경고 로그
    if (base64Size > 2 * 1024 * 1024) {
      console.warn(
        "[디버깅] 경고: 프로필 이미지 크기가 2MB를 초과합니다. API 요청이 실패할 수 있습니다."
      );
    }
  }

  return apiClient.post("/api/auth/register", userData);
};

// 로그인 API
export const login = async (loginData: {
  username: string;
  password: string;
}) => {
  console.log("[디버깅] 로그인 요청:", {
    username: loginData.username,
    password: "********",
  });
  return apiClient.post("/api/auth/login", loginData);
};

// 구글 로그인 API
export const googleLogin = async (authCode: string) => {
  console.log("[디버깅] 구글 로그인 요청:", {
    authorizationCode: authCode.substring(0, 10) + "...",
  });

  try {
    return await apiClient.post("/api/auth/login/google", {
      authorizationCode: authCode,
    });
  } catch (error) {
    console.error("[디버깅] 구글 로그인 요청 실패:", error);
    throw error;
  }
};

// 구글 OAuth 콜백 코드 처리 함수 추가
export const processGoogleAuthCode = async (code: string) => {
  console.log("[디버깅] 구글 인증 코드 처리:", {
    code: code.substring(0, 10) + "...",
  });

  try {
    return await apiClient.post("/api/auth/google/token", {
      code: code,
      redirectUri: window.location.origin + "/oauth/google/callback",
    });
  } catch (error) {
    console.error("[디버깅] 구글 인증 코드 처리 실패:", error);
    throw error;
  }
};

// 로그아웃
export const logout = async () => {
  console.log("[디버깅] 로그아웃 처리");
  removeTokens();
  return { success: true };
};

// 프로필 이미지 업데이트 (새 기능)
export const updateProfileImage = async (userId: string, imageData: string) => {
  console.log("[디버깅] 프로필 이미지 업데이트 요청:", {
    userId,
    imageData: imageData.startsWith("data:image")
      ? "(Base64 인코딩된 이미지)"
      : imageData,
  });

  try {
    // 이미지 크기 제한 확인 (2MB)
    if (imageData.startsWith("data:image")) {
      const base64Size = Math.ceil((imageData.length * 3) / 4);
      if (base64Size > 2 * 1024 * 1024) {
        throw new Error("이미지 크기는 2MB 이하여야 합니다.");
      }
    }

    // 실제 API가 준비되었을 때 사용할 코드
    return await apiClient.put(`/api/users/${userId}/profile-image`, {
      profileImage: imageData,
    });
  } catch (error) {
    console.error("[디버깅] 프로필 이미지 업데이트 오류:", error);
    throw error;
  }
};

// 수거 요청 생성 API - 수정
export const createPickupRequest = async (
  groundId: number,
  requestData: {
    amount: number;
    message?: string;
    pickupDate: string;
  }
) => {
  console.log("[디버깅] 수거 요청 생성:", { groundId, ...requestData });

  try {
    // API 엔드포인트 수정
    return await apiClient.post(`/api/pickups/${groundId}`, requestData);
  } catch (error) {
    console.error("[디버깅] 수거 요청 생성 오류:", error);
    throw error;
  }
};

// 수거 요청 목록 조회 API - 사용자 기준
export const getUserPickups = async (status?: string) => {
  console.log("[디버깅] 사용자 수거 요청 목록 조회:", { status });

  try {
    // 실제 API가 준비되었을 때 사용할 코드
    const url = status
      ? `/api/mypage/pickups?status=${status}`
      : "/api/mypage/pickups";
    return await apiClient.get(url);
  } catch (error) {
    console.error("[디버깅] 수거 요청 목록 조회 오류:", error);
    throw error;
  }
};

// 수거 요청 삭제 API - 수정
export const deletePickup = async (pickupId: number) => {
  console.log("[디버깅] 수거 요청 삭제:", { pickupId });

  try {
    // API 엔드포인트 확인
    return await apiClient.delete(`/api/pickups/${pickupId}`);
  } catch (error) {
    console.error("[디버깅] 수거 요청 삭제 오류:", error);
    throw error;
  }
};

// 수거 요청 상태 업데이트 API
export const updatePickupStatus = async (pickupId: number, status: string) => {
  console.log("[디버깅] 수거 요청 상태 업데이트:", { pickupId, status });

  try {
    // 실제 API가 준비되었을 때 사용할 코드
    return await apiClient.put(`/api/pickups/${pickupId}/status`, { status });
  } catch (error) {
    console.error("[디버깅] 수거 요청 상태 업데이트 오류:", error);
    throw error;
  }
};

export default apiClient;
