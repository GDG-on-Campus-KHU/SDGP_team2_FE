import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Coffee, Building2, Filter, Search, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
}

const MOCK_LOCATIONS: Location[] = [
  { 
    id: 1, 
    name: '스타벅스 강남점', 
    type: 'cafe', 
    address: '서울시 강남구 테헤란로 101', 
    hours: '매일 07:00 - 22:00', 
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
    available: true,
    lat: 37.504, 
    lng: 127.049,
    description: '에티오피아 예가체프 원두 사용'
  },
  { 
    id: 3, 
    name: '서울숲 수거소', 
    type: 'collection', 
    address: '서울시 성동구 서울숲2길 32-14', 
    hours: '월-금 09:00 - 18:00', 
    available: true,
    lat: 37.547, 
    lng: 127.039,
    description: '지역 내 모든 종류의 커피 찌꺼기 수거'
  },
  { 
    id: 4, 
    name: '에코 솔루션즈', 
    type: 'business', 
    address: '서울시 마포구 월드컵북로 396', 
    hours: '월-금 09:00 - 17:00', 
    available: false,
    lat: 37.582, 
    lng: 126.908,
    description: '대량 수거 전문 (최소 50L)'
  },
  { 
    id: 5, 
    name: '그린 카페', 
    type: 'cafe', 
    address: '서울시 서초구 서초대로 411', 
    hours: '매일 08:30 - 20:00', 
    available: true,
    lat: 37.498, 
    lng: 127.024,
    description: '유기농 원두 전문점, 매주 목요일 대량 수거 가능'
  },
  { 
    id: 6, 
    name: '환경부 수거 센터', 
    type: 'collection', 
    address: '서울시 용산구 이촌로 74', 
    hours: '월-금 09:00 - 18:00, 토 09:00 - 13:00', 
    available: true,
    lat: 37.532, 
    lng: 126.977,
    description: '정부 공식 재활용 센터'
  },
  { 
    id: 7, 
    name: '블루보틀 삼청점', 
    type: 'cafe', 
    address: '서울시 종로구 삼청로 109', 
    hours: '매일 08:00 - 20:00', 
    available: true,
    lat: 37.582, 
    lng: 126.981,
    description: '특수 로스팅 원두 찌꺼기 제공'
  },
];

const MapComponent = () => {
  const [filterValue, setFilterValue] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  
  // 픽업 시간 관련 상태 추가
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // 오늘 날짜로 초기화
  const [selectedTime, setSelectedTime] = useState(''); // 빈 문자열로 초기화
  const [selectedLocationForPickup, setSelectedLocationForPickup] = useState<Location | null>(null);

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
        }
      );
    } else {
      setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      toast({
        variant: 'destructive',
        title: '위치 서비스 미지원',
        description: '이 브라우저는 위치 서비스를 지원하지 않습니다.',
      });
    }
  }, []);

  // 맵 초기화
  useEffect(() => {
    if (!userLocation || mapRef.current || !mapDivRef.current) return;

    const initMap = async () => {
      const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;
    
      const mapInstance = new Map(mapDivRef.current!, {
        center: userLocation!,
        zoom: 12,
        mapId: 'DEMO_MAP_ID',
      });
    
      // 사용자 위치 마커
      const userMarker = new AdvancedMarkerElement({
        map: mapInstance,
        title: '현재 위치',
        position: userLocation!,
      });
    
      // MOCK_LOCATIONS 마커 추가
      MOCK_LOCATIONS.forEach((loc) => {
        const marker = new AdvancedMarkerElement({
          map: mapInstance,
          title: loc.name,
          position: { lat: loc.lat, lng: loc.lng },
        });
    
        marker.addListener('click', () => {
          handleMarkerClick(loc);
        });
      });
    
      mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng && markerRef.current) {
          markerRef.current.position = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };
        }
      });
    
      mapRef.current = mapInstance;
      markerRef.current = userMarker;
    };
    
    initMap();
  }, [userLocation]);

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
    let filtered = MOCK_LOCATIONS;
    if (filterValue !== 'all') filtered = filtered.filter(loc => loc.type === filterValue);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(loc => loc.name.toLowerCase().includes(q) || loc.address.toLowerCase().includes(q));
    }
    return filtered;
  };

  const handleMarkerClick = (location: Location) => setSelectedLocation(location);
  const closePopup = () => setSelectedLocation(null);

  const handleOpenPickupModal = (location: Location) => {
    setSelectedLocationForPickup(location);
    setIsPickupModalOpen(true);
  };

  const handleApplyForCollection = () => {
    if (!isAuthenticated) {
      toast({
        variant: 'destructive',
        title: '로그인 필요',
        description: '수거 신청을 위해 로그인이 필요합니다.',
      });
      return;
    }
    
    // 날짜 포맷팅
    const dateObj = new Date(selectedDate);
    const formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
    
    // 시간 포맷팅
    const [hours, minutes] = selectedTime.split(':');
    const hour = parseInt(hours);
    const amPm = hour >= 12 ? '오후' : '오전';
    const formattedHour = hour > 12 ? hour - 12 : hour;
    const formattedTime = `${amPm} ${formattedHour}시${minutes !== '00' ? ` ${minutes}분` : ''}`;
    
    toast({ 
      title: "신청 완료", 
      description: `${formattedDate} ${formattedTime}에 수거 신청이 완료되었습니다. 마이페이지에서 확인하세요.` 
    });
    
    setIsPickupModalOpen(false);
    setSelectedLocation(null);
  };

  const handleMyLocationClick = () => {
    if (userLocation) {
      toast({ title: '현재 위치', description: '지도를 현재 위치로 이동합니다.' });
      // mapRef.current?.setCenter(userLocation); // 실제 지도 이동 로직
    } else {
      toast({ variant: 'destructive', title: '위치 정보 없음', description: '위치 정보를 가져올 수 없습니다.' });
    }
  };

  return (
    <div className="relative h-full">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} />
      <div ref={mapDivRef} className="map-container bg-gray-100 relative overflow-hidden rounded-xl shadow-inner">
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
              픽업 시간 설정하기
            </Button>
          )}
        </div>
      )}
      </div>

      <Dialog open={isPickupModalOpen} onOpenChange={setIsPickupModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>픽업 시간 설정</DialogTitle>
            <DialogDescription>
              {selectedLocationForPickup?.name}에서 커피 찌꺼기를 수거할 시간을 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="pickup-time">픽업 시간</Label>
                <Input
                  id="pickup-time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full"
                  step="3600"
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
              disabled={!selectedDate || !selectedTime}
            >
              신청하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapComponent;