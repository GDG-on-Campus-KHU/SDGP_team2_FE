
import React, { useEffect, useState } from 'react';
import { MapPin, Coffee, Building2, Filter, Search, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';

// 수거소 데이터 타입
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

// 모의 수거소 데이터
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
  const [selectedLocation, setSelectedLocation] = useState<null | Location>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { isAuthenticated, userType } = useAuth();
  
  // 컴포넌트 마운트 시 사용자 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "위치 확인",
            description: "현재 위치를 기반으로 지도를 표시합니다.",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("위치 정보를 가져오는데 실패했습니다. 설정에서 위치 권한을 확인해주세요.");
          toast({
            variant: "destructive",
            title: "위치 오류",
            description: "위치 정보를 가져오는데 실패했습니다.",
          });
        }
      );
    } else {
      setLocationError("이 브라우저는 위치 서비스를 지원하지 않습니다.");
      toast({
        variant: "destructive",
        title: "위치 서비스 미지원",
        description: "이 브라우저는 위치 서비스를 지원하지 않습니다.",
      });
    }
    
    // 실제 구현에서는 지도 API 초기화
    console.log('지도 초기화 (카카오/네이버 지도 API)');
  }, []);

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    console.log(`필터 변경: ${value}`);
    toast({
      title: "필터 적용",
      description: `${
        value === 'all' ? '모든 장소' : 
        value === 'cafe' ? '카페' : 
        value === 'collection' ? '수거소' : '기업'
      }만 표시합니다.`,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        variant: "destructive",
        title: "검색어 오류",
        description: "검색어를 입력해주세요.",
      });
      return;
    }
    
    console.log(`검색: ${searchQuery}`);
    toast({
      title: "검색 중",
      description: `"${searchQuery}" 검색 결과를 표시합니다.`,
    });
    // 실제 구현에서는 지도의 마커를 필터링
  };

  const getFilteredLocations = () => {
    let filtered = MOCK_LOCATIONS;
    
    // 유형 필터 적용
    if (filterValue !== 'all') {
      filtered = filtered.filter(location => location.type === filterValue);
    }
    
    // 검색어 필터 적용
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(location => 
        location.name.toLowerCase().includes(query) || 
        location.address.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const handleMarkerClick = (location: Location) => {
    setSelectedLocation(location);
  };

  const closePopup = () => {
    setSelectedLocation(null);
  };

  const handleApplyForCollection = (locationId: number) => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "로그인 필요",
        description: "수거 신청을 위해 로그인이 필요합니다.",
      });
      return;
    }
    
    console.log(`수거 신청: 위치 ID ${locationId}`);
    toast({
      title: "신청 완료",
      description: "수거 신청이 완료되었습니다. 마이페이지에서 확인하세요.",
    });
    
    setSelectedLocation(null);
  };

  const handleMyLocationClick = () => {
    if (userLocation) {
      console.log(`현재 위치로 지도 이동: ${userLocation.lat}, ${userLocation.lng}`);
      toast({
        title: "현재 위치",
        description: "지도를 현재 위치로 이동합니다.",
      });
      // 실제 구현에서는 지도를 사용자 위치로 이동
    } else {
      toast({
        variant: "destructive",
        title: "위치 정보 없음",
        description: "위치 정보를 가져올 수 없습니다.",
      });
    }
  };

  return (
    <div className="relative h-full">
      {/* 지도 영역 */}
      <div className="map-container bg-gray-100 relative overflow-hidden rounded-xl shadow-inner">
        {locationError && (
          <Alert variant="destructive" className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 max-w-md">
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}
        
        {/* 지도 플레이스홀더 (실제 구현에서는 카카오/네이버 지도) */}
        <div className="h-full w-full flex items-center justify-center bg-coffee-cream/10">
          <p className="text-coffee-dark bg-white/80 p-4 rounded-lg shadow">여기에 실제 지도가 로드됩니다 (카카오/네이버 지도 API)</p>
        </div>
        
        {/* 필터 버튼 */}
        <div className="absolute top-4 right-4 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white shadow-md border-coffee-light/20 hover:bg-coffee-cream/50">
                <Filter className="mr-2 h-4 w-4 text-coffee" /> 필터
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 bg-white border-coffee-light/20">
              <DropdownMenuRadioGroup value={filterValue} onValueChange={handleFilterChange}>
                <DropdownMenuRadioItem value="all" className="text-coffee-dark focus:bg-coffee-cream/30 focus:text-coffee-dark">전체</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="cafe" className="text-coffee-dark focus:bg-coffee-cream/30 focus:text-coffee-dark">카페</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="collection" className="text-coffee-dark focus:bg-coffee-cream/30 focus:text-coffee-dark">수거소</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="business" className="text-coffee-dark focus:bg-coffee-cream/30 focus:text-coffee-dark">기업</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* 내 위치 버튼 */}
        <div className="absolute top-4 left-4 z-10">
          <Button 
            variant="outline" 
            className="bg-white shadow-md border-coffee-light/20 hover:bg-coffee-cream/50"
            onClick={handleMyLocationClick}
            disabled={!userLocation}
          >
            <Navigation className="h-4 w-4 mr-2 text-coffee" />
            내 위치
          </Button>
        </div>
        
        {/* 모의 마커들 */}
        <div className="absolute inset-0 pointer-events-none">
          {getFilteredLocations().map((location) => (
            <button
              key={location.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto hover:scale-110 transition-transform"
              style={{ 
                top: `${Math.random() * 60 + 20}%`, 
                left: `${Math.random() * 60 + 20}%` 
              }}
              onClick={() => handleMarkerClick(location)}
              aria-label={`${location.name} 마커`}
            >
              {location.type === 'cafe' ? (
                <Coffee className="h-8 w-8 text-coffee p-1 bg-white rounded-full shadow-lg" />
              ) : location.type === 'business' ? (
                <Building2 className="h-8 w-8 text-eco-dark p-1 bg-white rounded-full shadow-lg" />
              ) : (
                <MapPin className="h-8 w-8 text-eco p-1 bg-white rounded-full shadow-lg" />
              )}
            </button>
          ))}
        </div>
        
        {/* 사용자 위치 마커 */}
        {userLocation && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 animate-pulse"
            style={{ 
              top: '50%', 
              left: '50%'
            }}
          >
            <div className="h-4 w-4 rounded-full bg-blue-500 ring-4 ring-blue-300"></div>
          </div>
        )}
        
        {/* 위치 정보 팝업 */}
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
                onClick={() => handleApplyForCollection(selectedLocation.id)}
              >
                바로 신청하기
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
