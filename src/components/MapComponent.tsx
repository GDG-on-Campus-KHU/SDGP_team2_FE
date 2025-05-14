import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, Search } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
// 마커 이미지 import
import coffeeMarkerIcon from "@/assets/coffee_marker.png";
// API 클라이언트 추가
import apiClient from "@/api/apiClient";
import { useTranslation } from "react-i18next";

// API 서버 기본 URL
const API_BASE_URL = "http://34.64.59.141:8080";
// 기존 : https://34.64.59.141.nip.io

interface Location {
  id: number;
  name: string;
  type: "cafe" | "collection" | "business";
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
  const { t } = useTranslation();
  const [filterValue, setFilterValue] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate(); // useNavigate 훅 추가
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const cafeMarkersRef = useRef<google.maps.Marker[]>([]);

  // 지도 초기화 상태
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // 픽업 관련 상태
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [message, setMessage] = useState(""); // 메시지 입력을 위한 상태 추가
  const [selectedLocationForPickup, setSelectedLocationForPickup] =
    useState<Location | null>(null);
  const [requestAmount, setRequestAmount] = useState<number>(1);
  const [timeError, setTimeError] = useState<string | null>(null);

  const fetchCafes = async () => {
    try {
      setIsLoading(true);
      // 프록시 대신 전체 URL 사용
      const response = await axios.get(`${API_BASE_URL}/api/cafes`);

      // 응답 객체 구조 검증
      if (response.data && response.data.data && response.data.data.content) {
        const cafes = response.data.data.content;

        // API 응답을 Location 인터페이스에 맞게 변환
        const cafeLocations = cafes.map((cafe) => {
          // 영업시간 파싱 (예: "매일 07:00 - 22:00" → "07:00", "22:00")
          let openingTime = "09:00";
          let closingTime = "18:00";

          const hoursMatch = (cafe.openHours || "").match(
            /(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/
          );
          if (hoursMatch && hoursMatch.length >= 3) {
            openingTime = hoursMatch[1];
            closingTime = hoursMatch[2];
          }

          return {
            id: cafe.cafeId,
            name: cafe.name,
            type: "cafe" as const,
            address: `${cafe.address} ${cafe.detailAddress || ""}`,
            hours: cafe.openHours || t("map.no_info"),
            openingTime,
            closingTime,
            available: true,
            lat: Number(cafe.latitude),
            lng: Number(cafe.longitude),
            description:
              cafe.description ||
              `${t("map.collection_schedule")}: ${
                cafe.collectSchedule || t("map.no_info")
              }`,
          };
        });

        setLocations(cafeLocations);
        toast({
          title: t("map.cafes_load_success"),
          description: t("map.cafes_found", { count: cafeLocations.length }),
        });
      } else {
        toast({
          variant: "destructive",
          title: t("map.data_format_error"),
          description: t("map.data_format_error_desc"),
        });
        // 응답 형식 오류 시 기본 데이터 사용
        setLocations(MOCK_LOCATIONS);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("map.data_loading_failure"),
        description: t("map.data_loading_failure_desc"),
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
    cafeMarkersRef.current.forEach((marker) => {
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
            scaledSize: new google.maps.Size(60, 60),
          },
        });

        // 일반 click 이벤트 사용
        marker.addListener("click", () => {
          console.log("마커 클릭됨:", loc);
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
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserLocation(coords);
          toast({
            title: t("map.location_confirmation"),
            description: t("map.location_based_map"),
          });
        },
        (error) => {
          setLocationError(t("map.location_error_permissions"));
          toast({
            variant: "destructive",
            title: t("map.location_error"),
            description: t("map.location_fetch_error"),
          });
          // 위치 정보를 가져올 수 없는 경우 기본 위치 설정 (서울)
          setUserLocation({ lat: 37.5665, lng: 126.978 });
        }
      );
    } else {
      setLocationError(t("map.browser_location_unsupported"));
      toast({
        variant: "destructive",
        title: t("map.location_service_unsupported"),
        description: t("map.browser_location_unsupported"),
      });
      // 위치 서비스를 지원하지 않는 경우 기본 위치 설정 (서울)
      setUserLocation({ lat: 37.5665, lng: 126.978 });
    }

    // 카페 데이터 가져오기
    fetchCafes();
  }, []);

  // 맵 초기화
  useEffect(() => {
    if (!userLocation || mapRef.current || !mapDivRef.current || isLoading)
      return;

    const initMap = async () => {
      try {
        // Google Maps API 로드
        await google.maps.importLibrary("maps");

        // 맵 인스턴스 생성
        const mapInstance = new google.maps.Map(mapDivRef.current!, {
          center: userLocation!,
          zoom: 12,
          mapId: "DEMO_MAP_ID",
        });

        // 사용자 위치 마커
        const userMarker = new google.maps.Marker({
          map: mapInstance,
          title: t("map.current_location"),
          position: userLocation!,
        });

        // 사용자 마커 참조 저장
        userMarkerRef.current = userMarker;
        mapRef.current = mapInstance;
        setIsMapInitialized(true);
      } catch (error) {
        console.error(t("map.map_init_error"), error);
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
      setTimeError(t("map.cafe_hours_missing"));
      return false;
    }

    // 시간 비교
    if (selectedTime < openingTime || selectedTime > closingTime) {
      setTimeError(
        t("map.hours_selection_error", { openingTime, closingTime })
      );
      return false;
    }

    setTimeError(null);
    return true;
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    toast({
      title: t("map.filter_applied"),
      description:
        value === "all"
          ? t("map.all_places")
          : value === "cafe"
          ? t("map.cafe")
          : value === "collection"
          ? t("map.collection")
          : t("map.business"),
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        variant: "destructive",
        title: t("map.search_error"),
        description: t("map.enter_search_term"),
      });
      return;
    }

    toast({
      title: t("map.searching"),
      description: t("map.search_results", { query: searchQuery }),
    });
  };

  const getFilteredLocations = () => {
    let filtered = locations;
    if (filterValue !== "all")
      filtered = filtered.filter((loc) => loc.type === filterValue);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.address.toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const handleMarkerClick = (location: Location) => {
    console.log("마커 클릭됨:", location);
    setSelectedLocation(location);
  };

  const closePopup = () => setSelectedLocation(null);

  const handleOpenPickupModal = (location: Location) => {
    console.log("픽업 모달 열기:", location);
    setSelectedLocationForPickup(location);
    setRequestAmount(1);
    setMessage(""); // 메시지 필드 초기화
    setTimeError(null);

    // 현재 시간을 기본값으로 설정 (영업 시간 내로)
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
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
        setSelectedDate(tomorrow.toISOString().split("T")[0]);
      } else {
        setSelectedTime(currentTime);
      }
    } else {
      setSelectedTime(currentTime);
    }

    setIsPickupModalOpen(true);
  };

  // 수정된 수거 신청 함수
  const handleApplyForCollection = async () => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: t("error.login_required"),
        description: t("map.login_for_collection"),
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
        variant: "destructive",
        title: t("map.cafe_selection_error"),
        description: t("map.cafe_info_missing"),
      });
      return;
    }

    try {
      setIsLoading(true);

      // 날짜 및 시간 포맷 (예: 2023-05-08)
      const pickupDate = selectedDate;

      // 픽업 요청 데이터 생성
      const pickupRequest = {
        amount: requestAmount,
        message: message || "",
        pickupDate: pickupDate,
      };

      // API 호출로 수거 요청 생성
      const response = await apiClient.post(
        `/api/pickups/${selectedLocationForPickup.id}`,
        pickupRequest
      );

      toast({
        title: t("map.request_success"),
        description: t("map.request_success_detail", {
          cafeName: selectedLocationForPickup.name,
          amount: requestAmount,
        }),
      });

      // 마이페이지로 이동 - refresh 플래그와 함께
      navigate("/mypage", { state: { refresh: true } });

      setIsPickupModalOpen(false);
      setSelectedLocation(null);
    } catch (error) {
      console.error(t("map.collection_request_error"), error);
      toast({
        variant: "destructive",
        title: t("map.request_failure"),
        description: t("map.request_failure_desc"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMyLocationClick = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setCenter(userLocation);
      toast({
        title: t("map.current_location"),
        description: t("map.move_to_current_location"),
      });
    } else {
      toast({
        variant: "destructive",
        title: t("map.no_location_info"),
        description: t("map.location_fetch_error"),
      });
    }
  };

  // 백업 모의 데이터 - API 연결 실패 시 사용
  const MOCK_LOCATIONS: Location[] = [
    {
      id: 1,
      name: "스타벅스 강남점",
      type: "cafe",
      address: "서울시 강남구 테헤란로 101",
      hours: "매일 07:00 - 22:00",
      openingTime: "07:00",
      closingTime: "22:00",
      available: true,
      lat: 37.508,
      lng: 127.062,
      description: "매일 오전 수거 가능, 약 5L의 찌꺼기 배출",
    },
    {
      id: 2,
      name: "커피빈 선릉점",
      type: "cafe",
      address: "서울시 강남구 선릉로 423",
      hours: "매일 08:00 - 21:00",
      openingTime: "08:00",
      closingTime: "21:00",
      available: true,
      lat: 37.504,
      lng: 127.049,
      description: "에티오피아 예가체프 원두 사용",
    },
    {
      id: 3,
      name: "투썸플레이스 역삼점",
      type: "cafe",
      address: "서울시 강남구 역삼로 123",
      hours: "매일 08:00 - 23:00",
      openingTime: "08:00",
      closingTime: "23:00",
      available: true,
      lat: 37.498,
      lng: 127.027,
      description: "브라질 산토스 원두 사용, 일평균 3kg 배출",
    },
    {
      id: 4,
      name: "BEAN 커피",
      type: "cafe",
      address: "서울시 서초구 서초대로 333",
      hours: "매일 07:30 - 21:00",
      openingTime: "07:30",
      closingTime: "21:00",
      available: true,
      lat: 37.491,
      lng: 127.031,
      description: "다양한 종류의 원두 사용, 수거는 매주 월/수/금 가능",
    },
  ];

  return (
    <div className="relative h-full">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} />
      <div
        ref={mapDivRef}
        className="map-container bg-gray-100 relative overflow-hidden rounded-xl shadow-inner"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
            <div className="text-white">{t("map.loading_map")}</div>
          </div>
        )}

        {selectedLocation && (
          <div
            className="marker-popup absolute z-20 animate-fade-in"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -80%)",
            }}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closePopup}
              aria-label={t("common.close")}
            >
              ✕
            </button>
            <h3 className="font-bold text-lg mb-1 text-coffee-dark">
              {selectedLocation.name}
            </h3>
            <div className="inline-flex items-center mb-2">
              <span
                className={`badge ${
                  selectedLocation.type === "cafe"
                    ? "bg-coffee text-white"
                    : selectedLocation.type === "business"
                    ? "bg-eco-dark text-white"
                    : "bg-eco text-white"
                } px-2 py-1 rounded-full text-xs`}
              >
                {selectedLocation.type === "cafe"
                  ? t("map.cafe")
                  : selectedLocation.type === "business"
                  ? t("map.business")
                  : t("map.collection")}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {selectedLocation.address}
            </p>
            <p className="text-sm mb-2">
              <span className="font-medium">{t("map.operating_hours")}:</span>{" "}
              {selectedLocation.hours}
            </p>
            <p className="text-sm mb-3">
              <span className="font-medium">
                {t("map.coffee_grounds_collection")}:
              </span>
              {selectedLocation.available ? (
                <span className="text-eco-dark ml-1">{t("map.available")}</span>
              ) : (
                <span className="text-red-500 ml-1">
                  {t("map.unavailable")}
                </span>
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
                {t("map.request_collection")}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 픽업 모달 - 간소화된 버전 */}
      <Dialog open={isPickupModalOpen} onOpenChange={setIsPickupModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("map.request_collection")}</DialogTitle>
            <DialogDescription>
              {t("map.request_collection_desc", {
                cafeName: selectedLocationForPickup?.name,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              {/* 수거량 설정 */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="amount-slider">
                    {t("map.pickup_amount")}
                  </Label>
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
                <Label htmlFor="pickup-date">{t("map.pickup_date")}</Label>
                <Input
                  id="pickup-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full"
                />
              </div>

              {/* 픽업 시간 */}
              <div className="space-y-2">
                <Label htmlFor="pickup-time">{t("map.pickup_time")}</Label>
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
                    <AlertTitle className="text-xs">
                      {t("map.time_error")}
                    </AlertTitle>
                    <AlertDescription className="text-xs">
                      {timeError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* 메시지 필드 */}
              <div className="space-y-2">
                <Label htmlFor="message">{t("map.message")}</Label>
                <Textarea
                  id="message"
                  placeholder={t("map.message_placeholder")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="text-sm text-muted-foreground mt-2">
                <p>
                  * {t("map.cafe_operating_hours")}:{" "}
                  {selectedLocationForPickup?.hours}
                </p>
                <p>* {t("map.pickup_hours")}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPickupModalOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="bg-coffee hover:bg-coffee-dark"
              onClick={handleApplyForCollection}
              disabled={
                !selectedDate ||
                !selectedTime ||
                requestAmount <= 0 ||
                !!timeError
              }
            >
              {t("common.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="absolute bottom-4 right-4 z-10">
        <Button
          onClick={handleMyLocationClick}
          className="bg-coffee hover:bg-coffee-dark shadow-lg"
        >
          {t("map.current_location")}
        </Button>
      </div>
    </div>
  );
};

export default MapComponent;
