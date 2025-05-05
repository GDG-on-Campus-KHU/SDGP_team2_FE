import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Coffee,
  MapPin,
  Phone,
  Package,
  Calendar,
  Users,
  TrendingUp,
  Loader,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/apiClient";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// 카페 정보 타입 정의
interface CafeInfo {
  cafeId: number;
  memberId: number;
  name: string;
  address: string;
  detailAddress: string;
  latitude: number;
  longitude: number;
  phone: string;
  collectSchedule: string;
  openHours: string;
  description: string;
}

// 수거 요청 타입 정의 (API 응답 구조와 일치)
interface PickupRequest {
  requesterName: string;
  requestDate: string;
  pickupDate: string;
  beanName: string;
  amount: number;
  status: string;
}

const CafeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 상태 관리
  const [loading, setLoading] = useState<boolean>(true);
  const [cafeInfo, setCafeInfo] = useState<CafeInfo | null>(null);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 카페 통계 데이터 (실제로는 API에서 가져올 데이터)
  const cafeStats = {
    totalCollections: 34,
    totalGrounds: "85L",
    groundThisMonth: "15L",
    ecoContribution: 12.5, // CO2 절감량 (kg)
    lastGroundUpdate: "2023-12-01",
  };

  // 상태에 따른 UI 표시 클래스 매핑
  const getStatusClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 상태에 따른 한글 표시
  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "대기";
      case "ACCEPTED":
        return "수락";
      case "COMPLETED":
        return "완료";
      case "REJECTED":
        return "거절";
      default:
        return status;
    }
  };

  // 카페 정보 가져오기
  useEffect(() => {
    const fetchCafeInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(`/api/cafes/me`);

        console.log("[디버깅] 카페 정보 가져오기 성공:", response.data);

        if (response.data && response.data.data) {
          setCafeInfo(response.data.data);
        } else {
          setError("카페 정보를 가져오는데 실패했습니다.");
        }
      } catch (error: any) {
        console.error("[디버깅] 카페 정보 가져오기 오류:", error);

        toast({
          title: "카페 정보 로딩 실패",
          description: "카페 정보를 가져오는 중 오류가 발생했습니다.",
          variant: "destructive",
          duration: 3000,
        });

        setCafeInfo({
          cafeId: 2,
          memberId: 8,
          name: "스타벅스",
          address: "강남 테헤란구",
          detailAddress: "몰라",
          latitude: 37,
          longitude: 24,
          phone: "010-2260-7370",
          collectSchedule: "2시~5시",
          openHours: "오전 8시",
          description: "안녕하세요",
        });
      } finally {
        setLoading(false);
      }
    };

    // 카페에 요청된 픽업 현황 조회
    const fetchCafePickupList = async () => {
      try {
        const response = await apiClient.get("/api/cafe/pickups");

        console.log("[디버깅] 픽업 리스트 조회 성공:", response.data);

        if (response.data && response.data.data) {
          setPickupRequests(response.data.data);
        }
      } catch (error: any) {
        console.error("[디버깅] 픽업 리스트 조회 오류:", error);
        setPickupRequests([
          {
            requesterName: "혜미",
            requestDate: "2025-05-04",
            pickupDate: "2025-05-04",
            beanName: "에티오피아 어쩌구",
            amount: 10,
            status: "PENDING",
          },
        ]);

        toast({
          title: "픽업 리스트 정보 로딩 실패",
          description: "픽업 리스트 정보를 가져오지 못했습니다",
          variant: "destructive",
          duration: 3000,
        });
      }
    };

    fetchCafeInfo();
    fetchCafePickupList();
  }, []);

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 text-coffee animate-spin" />
        <span className="ml-2">카페 정보를 불러오는 중입니다...</span>
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Button
          onClick={() => navigate("/cafe/settings")}
          className="bg-coffee hover:bg-coffee-dark"
        >
          카페 정보 설정하기
        </Button>
      </div>
    );
  }

  // 최근 3개의 수거 요청만 표시
  const recentPickups = pickupRequests.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-coffee-dark">카페 대시보드</h2>
      </div>

      {/* 요약 카드 영역
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              이번 달 찌꺼기
            </CardTitle>
            <CardDescription>등록된 커피 찌꺼기 총량</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-coffee">
              {cafeStats.groundThisMonth}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              지난 달 대비 +23%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">총 수거 횟수</CardTitle>
            <CardDescription>수거 완료된 총 횟수</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-coffee">
              {cafeStats.totalCollections}회
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              지난 달 4회 완료
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">환경 기여도</CardTitle>
            <CardDescription>절감된 탄소 배출량</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-eco">
              {cafeStats.ecoContribution}kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              CO<sub>2</sub> 배출 감소량
            </p>
          </CardContent>
        </Card>
      </div> */}

      {/* 카페 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>내 카페 정보</CardTitle>
          <CardDescription>등록된 카페 기본 정보입니다</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-coffee" />
              <div>
                <p className="text-sm font-medium leading-none">카페명</p>
                <p className="text-sm text-muted-foreground">
                  {cafeInfo?.name || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-coffee" />
              <div>
                <p className="text-sm font-medium leading-none">주소</p>
                <p className="text-sm text-muted-foreground">
                  {cafeInfo?.address || "-"}{" "}
                  {cafeInfo?.detailAddress ? `(${cafeInfo.detailAddress})` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-coffee" />
              <div>
                <p className="text-sm font-medium leading-none">연락처</p>
                <p className="text-sm text-muted-foreground">
                  {cafeInfo?.phone || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Coffee className="h-5 w-5 text-coffee" />
              <div>
                <p className="text-sm font-medium leading-none">대표 원두</p>
                <p className="text-sm text-muted-foreground">
                  에티오피아 예가체프
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-coffee" />
              <div>
                <p className="text-sm font-medium leading-none">운영 시간</p>
                <p className="text-sm text-muted-foreground">
                  {cafeInfo?.openHours || "-"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 최근 수거 요청 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>최근 수거 요청</CardTitle>
            <CardDescription>
              최근에 들어온 수거 요청 내역입니다
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/cafe/requests")}
            className="border-coffee text-coffee hover:bg-coffee-cream/50"
          >
            모든 요청 보기
          </Button>
        </CardHeader>
        <CardContent>
          {recentPickups.length > 0 ? (
            <div className="space-y-5">
              {recentPickups.map((request, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-coffee-cream/30 p-2">
                      <Users className="h-5 w-5 text-coffee-dark" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {request.requesterName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.pickupDate} • {request.amount}L •{" "}
                        {request.beanName}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`
                      inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                      ${getStatusClass(request.status)}
                    `}
                    >
                      {getStatusText(request.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>최근 수거 요청이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CafeDashboard;
