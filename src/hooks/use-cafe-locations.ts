import { useState, useEffect } from 'react';
import axios from 'axios';

// 카페 위치 정보 인터페이스
export interface CafeLocation {
  cafeId: number;
  name: string;
  address: string;
  detailAddress: string;
  openHours: string;
  latitude: number;
  longitude: number;
  collectSchedule: string;
  description?: string;
}

export const useCafeLocations = () => {
  const [locations, setLocations] = useState<CafeLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        // API 엔드포인트가 이미 구현된 백엔드를 사용
        const response = await axios.get('/api/cafes');
        
        if (response.data && response.data.data) {
          setLocations(response.data.data);
        } else {
          setLocations([]);
        }
        setError(null);
      } catch (err: any) {
        console.error('카페 위치 정보 불러오기 오류:', err);
        setError(err.message || '카페 위치 정보를 불러오는데 실패했습니다');
        setLocations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return { locations, isLoading, error };
};