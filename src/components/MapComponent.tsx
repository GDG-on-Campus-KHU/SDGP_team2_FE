import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, Search } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
// 마커 이미지 import
import coffeeMarkerIcon from '@/assets/coffee_marker.png';

// API 서버 기본 URL
const API_BASE_URL = "http://34.64.59.141:8080";

interface Location {
  id: number;
  name: string;
  type: 'cafe' | 'collection' | 'business';
  address: string;
  hours: string;
  available: boolean;
  lat: number;
  lng: number;
  description?: string;
  openingTime?: string; // 영업 시작 시간 (HH:MM 형식)
  closingTime?: string; // 영업 종료 시간 (HH:MM 형식)
}

const MapComponent = () => {
  const [filterValue, setFilterValue] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const cafeMarkersRef = useRef<google.maps.Marker[]>([]);
  
  // 지도 초기화 상태
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  
  // 픽업 관련 상태
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState(''); // 메시지 입력을 위한 상태 추가
  const [selectedLocationForPickup, setSelectedLocationForPickup] = useState<Location | null>(null);
  const [requestAmount, setRequestAmount] = useState<number>(1);
  const [timeError, setTimeError] = useState<string | null>(null);

  // 백엔드 API에서 카페 목록 가져오기
  const fetchCafes = async () => {
    try {
      setIsLoading(true);
      // 프록시 대신 전체 URL 사용
      const response = await axios.get(`${API_BASE_URL}/api/cafes`);
      
      // 응답 객체 구조 검증
      if (response.data && response.data.data && response.data.data.content) {
        const cafes = response.data.data.content;
        
        // API 응답을 Location 인터페이스에 맞게 변환
        const cafeLocations = cafes.map(cafe => {
          // 영업시간 파싱 (예: "매일 07:00 - 22:00" → "07:00", "22:00")
          let openingTime = "09:00";
          let closingTime = "18:00";
          
          const hoursMatch = (cafe.openHours || "").match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
          if (hoursMatch && hoursMatch.length >= 3) {
            openingTime = hoursMatch[1];
            closingTime = hoursMatch[2];
          }
          
          return {
            id: cafe.cafeId,
            name: cafe.name,
            type: 'cafe' as const,
            address: `${cafe.address} ${cafe.detailAddress || ''}`,
            hours: cafe.openHours || '정보 없음',
            openingTime,
            closingTime,
            available: true,
            lat: Number(cafe.latitude),
            lng: Number(cafe.longitude),
            description: cafe.description || `수거 일정: ${cafe.collectSchedule || '정보 없음'}`,
          };
        });
        
        setLocations(cafeLocations);
        toast({ title: '카페 정보 로드 완료', description: `${cafeLocations.length}개의 카페를 찾았습니다.` });
      } else {
        toast({ 
          variant: 'destructive', 
          title: '데이터 형식 오류', 
          description: 'API 응답 형식이 예상과 다릅니다. 기본 데이터를 표시합니다.' 
        });
        // 응답 형식 오류 시 기본 데이터 사용
        setLocations(MOCK_LOCATIONS);
      }
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: '데이터 로딩 실패', 
        description: '카페 정보를 가져오는데 실패했습니다. 기본 데이터를 표시합니다.' 
      });
      // 오류 발생 시 기본 데이터 사용
      setLocations(MOCK_LOCATIONS);
    } finally {
      setIsLoading(false);
    }
  };

  // 지도에 마커 추가하는 함수
  const addMarkersToMap = () => {
    if (!mapRef.current || !locations.length) return;
    
    // 기존 마커 제거
    cafeMarkersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    cafeMarkersRef.current = [];
    
    // 일반 마커 생성
    locations.forEach((loc) => {
      try {
        // 유효한 좌표 확인
        if (isNaN(loc.lat) || isNaN(loc.lng)) return;
        
        // 마커 생성 - import한 이미지 사용
        const marker = new google.maps.Marker({
          map: mapRef.current,
          title: loc.name,
          position: { lat: loc.lat, lng: loc.lng },
          icon: {
            url: coffeeMarkerIcon,
            scaledSize: new google.maps.Size(32, 32)
          }
        });
        
        // 일반 click 이벤트 사용
        marker.addListener('click', () => {
          console.log('마커 클릭됨:', loc);
          handleMarkerClick(loc);
        });
        
        // 마커 참조 저장
        cafeMarkersRef.current.push(marker);
      } catch (error) {
        console.error(`마커 생성 실패:`, error);
      }
    });
  };

  // 사용자 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          toast({ title: '위치 확인', description: '현재 위치를 기반으로 지도를 표시합니다.' });
        },
        (error) => {
          setLocationError('위치 정보를 가져오는데 실패했습니다. 설정에서 위치 권한을 확인해주세요.');
          toast({
            variant: 'destructive',
            title: '위치 오류',
            description: '위치 정보를 가져오는데 실패했습니다.',
          });
          // 위치 정보를 가져올 수 없는 경우 기본 위치 설정 (서울)
          setUserLocation({ lat: 37.5665, lng: 126.9780 });
        }
      );
    } else {
      setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      toast({
        variant: 'destructive',
        title: '위치 서비스 미지원',
        description: '이 브라우저는 위치 서비스를 지원하지 않습니다.',
      });
      // 위치 서비스를 지원하지 않는 경우 기본 위치 설정 (서울)
      setUserLocation({ lat: 37.5665, lng: 126.9780 });
    }
    
    // 카페 데이터 가져오기
    fetchCafes();
  }, []);

  // 맵 초기화
  useEffect(() => {
    if (!userLocation || mapRef.current || !mapDivRef.current || isLoading) return;

    const initMap = async () => {
      try {
        // Google Maps API 로드
        await google.maps.importLibrary('maps');
        
        // 맵 인스턴스 생성
        const mapInstance = new google.maps.Map(mapDivRef.current!, {
          center: userLocation!,
          zoom: 12,
          mapId: 'DEMO_MAP_ID',
        });
      
        // 사용자 위치 마커
        const userMarker = new google.maps.Marker({
          map: mapInstance,
          title: '현재 위치',
          position: userLocation!,
        });
        
        // 사용자 마커 참조 저장
        userMarkerRef.current = userMarker;
        mapRef.current = mapInstance;
        setIsMapInitialized(true);
      
      } catch (error) {
        console.error('맵 초기화 오류:', error);
      }
    };
    
    initMap();
  }, [userLocation, isLoading]);
  
  // 지도 초기화된 후 또는 locations 변경될 때 마커 추가
  useEffect(() => {
    if (isMapInitialized && locations.length > 0) {
      addMarkersToMap();
    }
  }, [isMapInitialized, locations]);

  // 선택한 시간이 카페 영업시간 내인지 확인
  const validatePickupTime = () => {
    if (!selectedLocationForPickup || !selectedTime) {
      setTimeError(null);
      return false;
    }
    
    const { openingTime, closingTime } = selectedLocationForPickup;
    if (!openingTime || !closingTime) {
      setTimeError('카페 영업 시간 정보가 없습니다.');
      return false;
    }
    
    // 시간 비교
    if (selectedTime < openingTime || selectedTime > closingTime) {
      setTimeError(`영업 시간(${openingTime} - ${closingTime}) 내에 픽업 시간을 선택해주세요.`);
      return false;
    }
    
    setTimeError(null);
    return true;
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    toast({
      title: '필터 적용',
      description: value === 'all' ? '모든 장소' : value === 'cafe' ? '카페' : value === 'collection' ? '수거소' : '기업',
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({ variant: 'destructive', title: '검색어 오류', description: '검색어를 입력해주세요.' });
      return;
    }

    toast({ title: '검색 중', description: `"${searchQuery}" 검색 결과를 표시합니다.` });
  };

  const getFilteredLocations = () => {
    let filtered = locations;
    if (filterValue !== 'all') filtered = filtered.filter(loc => loc.type === filterValue);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(loc => loc.name.toLowerCase().includes(q) || loc.address.toLowerCase().includes(q));
    }
    return filtered;
  };

  const handleMarkerClick = (location: Location) => {
    console.log('마커 클릭됨:', location);
    setSelectedLocation(location);
  };
  
  const closePopup = () => setSelectedLocation(null);

  const handleOpenPickupModal = (location: Location) => {
    console.log('픽업 모달 열기:', location);
    setSelectedLocationForPickup(location);
    setRequestAmount(1);
    setMessage(''); // 메시지 필드 초기화
    setTimeError(null);
    
    // 현재 시간을 기본값으로 설정 (영업 시간 내로)
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    // 기본 시간이 영업 시간 내에 있도록 조정
    if (location.openingTime && location.closingTime) {
      if (currentTime < location.openingTime) {
        setSelectedTime(location.openingTime);
      } else if (currentTime > location.closingTime) {
        // 오늘은 영업 시간이 지났으므로 내일 영업 시작 시간으로 설정하고 날짜를 하루 뒤로
        setSelectedTime(location.openingTime);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().split('T')[0]);
      } else {
        setSelectedTime(currentTime);
      }
    } else {
      setSelectedTime(currentTime);
    }
    
    setIsPickupModalOpen(true);
  };

  // 수정된 수거 신청 함수 - 직접 수거 요청만 가능하도록 단순화
  const handleApplyForCollection = async () => {
    if (!isAuthenticated) {
      toast({
        variant: 'destructive',
        title: '로그인 필요',
        description: '수거 신청을 위해 로그인이 필요합니다.',
      });
      return;
    }
    
    // 픽업 시간 검증
    const isTimeValid = validatePickupTime();
    
    if (!isTimeValid) {
      return;
    }
    
    // selectedLocationForPickup이 없을 경우 처리
    if (!selectedLocationForPickup) {
      toast({
        variant: 'destructive',
        title: '카페 선택 오류',
        description: '카페 정보를 찾을 수 없습니다.',
      });
      return;
    }
    
    try {
      // 픽업 요청 데이터 생성
      const pickupRequest = {
        cafeId: selectedLocationForPickup.id,  // 카페 ID
        amount: requestAmount,
        message: message || '',
        pickupDate: selectedDate,
        requestTime: selectedTime
      };
      
      console.log(`[디버깅] 수거 요청 데이터:`, pickupRequest);
      
      // 성공 알림 (실제 API 연동 전 테스트용)
      toast({ 
        title: "요청 성공", 
        description: `${selectedLocationForPickup.name}에 ${requestAmount}L 수거 신청이 완료되었습니다. 마이페이지에서 확인하세요.` 
      });
      
      setIsPickupModalOpen(false);
      setSelectedLocation(null);
    } catch (error) {
      console.error('수거 신청 오류:', error);
      toast({
        variant: 'destructive',
        title: '신청 실패',
        description: '수거 신청 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    }
  };

  const handleMyLocationClick = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setCenter(userLocation);
      toast({ title: '현재 위치', description: '지도를 현재 위치로 이동합니다.' });
    } else {
      toast({ variant: 'destructive', title: '위치 정보 없음', description: '위치 정보를 가져올 수 없습니다.' });
    }
  };

  // 백업 모의 데이터 - API 연결 실패 시 사용
  const MOCK_LOCATIONS: Location[] = [
    { 
      id: 1, 
      name: '스타벅스 강남점', 
      type: 'cafe', 
      address: '서울시 강남구 테헤란로 101', 
      hours: '매일 07:00 - 22:00', 
      openingTime: '07:00',
      closingTime: '22:00',
      available: true,
      lat: 37.508, 
      lng: 127.062,
      description: '매일 오전 수거 가능, 약 5L의 찌꺼기 배출'
    },
    { 
      id: 2, 
      name: '커피빈 선릉점', 
      type: 'cafe', 
      address: '서울시 강남구 선릉로 423', 
      hours: '매일 08:00 - 21:00', 
      openingTime: '08:00',
      closingTime: '21:00',
      available: true,
      lat: 37.504, 
      lng: 127.049,
      description: '에티오피아 예가체프 원두 사용'
    },
    { 
      id: 3, 
      name: '투썸플레이스 역삼점', 
      type: 'cafe', 
      address: '서울시 강남구 역삼로 123', 
      hours: '매일 08:00 - 23:00', 
      openingTime: '08:00',
      closingTime: '23:00',
      available: true,
      lat: 37.498, 
      lng: 127.027,
      description: '브라질 산토스 원두 사용, 일평균 3kg 배출'
    },
    { 
      id: 4, 
      name: 'BEAN 커피', 
      type: 'cafe', 
      address: '서울시 서초구 서초대로 333', 
      hours: '매일 07:30 - 21:00', 
      openingTime: '07:30',
      closingTime: '21:00',
      available: true,
      lat: 37.491, 
      lng: 127.031,
      description: '다양한 종류의 원두 사용, 수거는 매주 월/수/금 가능'
    }
  ];

  return (
    <div className="relative h-full">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} />
      <div ref={mapDivRef} className="map-container bg-gray-100 relative overflow-hidden rounded-xl shadow-inner">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
            <div className="text-white">지도 로딩 중...</div>
          </div>
        )}
        
        {selectedLocation && (
          <div 
            className="marker-popup absolute z-20 animate-fade-in"
            style={{ 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -130%)' 
            }}
          >
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closePopup}
              aria-label="닫기"
            >
              ✕
            </button>
            <h3 className="font-bold text-lg mb-1 text-coffee-dark">{selectedLocation.name}</h3>
            <div className="inline-flex items-center mb-2">
              <span className={`badge ${
                selectedLocation.type === 'cafe' ? 'bg-coffee text-white' : 
                selectedLocation.type === 'business' ? 'bg-eco-dark text-white' : 
                'bg-eco text-white'
              } px-2 py-1 rounded-full text-xs`}>
                {selectedLocation.type === 'cafe' ? '카페' : 
                selectedLocation.type === 'business' ? '기업' : '수거소'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{selectedLocation.address}</p>
            <p className="text-sm mb-2">
              <span className="font-medium">운영시간:</span> {selectedLocation.hours}
            </p>
            <p className="text-sm mb-3">
              <span className="font-medium">찌꺼기 수거:</span> 
              {selectedLocation.available ? (
                <span className="text-eco-dark ml-1">가능</span>
              ) : (
                <span className="text-red-500 ml-1">불가능</span>
              )}
            </p>
            {selectedLocation.description && (
              <p className="text-sm mb-3 text-gray-600 italic bg-coffee-cream/20 p-2 rounded">
                "{selectedLocation.description}"
              </p>
            )}
            {selectedLocation.available && (
              <Button 
                className="w-full bg-coffee hover:bg-coffee-dark transition-colors"
                onClick={() => handleOpenPickupModal(selectedLocation)}
              >
                수거 신청하기
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 픽업 모달 - 간소화된 버전 */}
      <Dialog open={isPickupModalOpen} onOpenChange={setIsPickupModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>수거 신청하기</DialogTitle>
            <DialogDescription>
              {selectedLocationForPickup?.name}에서 커피 찌꺼기를 수거하기 위한 정보를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              {/* 수거량 설정 */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="amount-slider">수거량 (L)</Label>
                  <span className="text-sm font-medium">{requestAmount}L</span>
                </div>
                <Slider
                  id="amount-slider"
                  value={[requestAmount]}
                  min={0.5}
                  max={5}
                  step={0.5}
                  onValueChange={(values) => setRequestAmount(values[0])}
                />
              </div>

              {/* 픽업 날짜 */}
              <div className="space-y-2">
                <Label htmlFor="pickup-date">픽업 날짜</Label>
                <Input
                  id="pickup-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>

              {/* 픽업 시간 */}
              <div className="space-y-2">
                <Label htmlFor="pickup-time">픽업 시간</Label>
                <Input
                  id="pickup-time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => {
                    setSelectedTime(e.target.value);
                    validatePickupTime();
                  }}
                  className="w-full"
                  step="3600"
                />
                {timeError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-xs">시간 오류</AlertTitle>
                    <AlertDescription className="text-xs">
                      {timeError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              {/* 메시지 필드 */}
              <div className="space-y-2">
                <Label htmlFor="message">메시지 (선택사항)</Label>
                <Textarea
                  id="message"
                  placeholder="카페 사장님에게 전달할 메시지나 요청사항을 입력해주세요."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div className="text-sm text-muted-foreground mt-2">
                <p>* 카페 운영 시간: {selectedLocationForPickup?.hours}</p>
                <p>* 픽업 가능 시간대 내에서 선택해주세요.</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPickupModalOpen(false)}
            >
              취소
            </Button>
            <Button 
              className="bg-coffee hover:bg-coffee-dark"
              onClick={handleApplyForCollection}
              disabled={!selectedDate || !selectedTime || requestAmount <= 0 || !!timeError}
            >
              신청하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="absolute bottom-4 right-4 z-10">
        <Button onClick={handleMyLocationClick} className="bg-coffee hover:bg-coffee-dark shadow-lg">
          내 위치로
        </Button>
      </div>
    </div>
  );
};

export default MapComponent;