import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Trash2,
  XCircle,
  Loader,
  RefreshCcw,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserNavbar from "@/components/UserNavbar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import apiClient from "@/api/apiClient";
import { useTranslation } from "react-i18next";

// 수거 신청 타입 정의 - 정확한 API 응답 구조에 맞게 수정
interface PickupRequest {
  pickupId: number;
  cafeName: string;
  pickupDate: string;
  requestDate: string;
  beanName: string;
  amount: number;
  status: "PENDING" | "ACCEPTED" | "COMPLETED" | "REJECTED";
  message?: string;
}

// 환경 기여도 인터페이스
interface EnvReportData {
  totalCollected: number;
  carbonSaved: string;
  reportCount: number;
}

// 수거 요청 생성 인터페이스 - 정확한 API 요청 구조에 맞게 정의
interface PickupRequestData {
  amount: number;
  message?: string;
  pickupDate: string;
}

// 카페 정보 인터페이스
interface Cafe {
  cafeId: number;
  name: string;
  address: string;
  openHours: string;
}

// 커피 찌꺼기 정보 인터페이스
interface CoffeeGround {
  groundId: number;
  beanName: string;
  remainingAmount: number;
  cafeId: number;
  cafeName: string;
}

const UserMyPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<number | null>(null);

  // 환경 기여도 상태
  const [envReport, setEnvReport] = useState<EnvReportData>({
    totalCollected: 0,
    carbonSaved: "0",
    reportCount: 0,
  });

  // 새로운 수거 요청 관련 상태 추가
  const [newRequestDialog, setNewRequestDialog] = useState(false);
  const [availableCafes, setAvailableCafes] = useState<Cafe[]>([]);
  const [availableGrounds, setAvailableGrounds] = useState<CoffeeGround[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<number | null>(null);
  const [selectedGround, setSelectedGround] = useState<number | null>(null);
  const [pickupAmount, setPickupAmount] = useState<number>(1);
  const [pickupDate, setPickupDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [pickupMessage, setPickupMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { t } = useTranslation();

  // 환경 기여도 조회 함수
  const fetchEnvironmentalReport = async () => {
    try {
      const response = await apiClient.get("/api/members/me/report");

      if (response.data && response.data.data) {
        setEnvReport(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 수거 요청 목록 조회 함수
  const fetchPickupRequests = async () => {
    try {
      setIsLoading(true);

      // API에 맞게 정확한 엔드포인트를 사용
      const response = await apiClient.get("/api/mypage/pickups");

      if (response.data && response.data.data) {
        // API 응답 구조에 맞게 데이터 설정
        setRequests(response.data.data);

        if (response.data.data.length === 0) {
          setRequests([]);
        }
      } else {
        setRequests([]);
      }
    } catch (error) {
      setRequests([]);

      toast({
        title: "데이터 로딩 실패",
        description: "수거 요청 목록을 가져오는데 실패했습니다.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 카페 목록 조회 함수 (새로 추가)
  const fetchAvailableCafes = async () => {
    try {
      const response = await apiClient.get("/api/cafes");

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.content)
      ) {
        setAvailableCafes(response.data.data.content);
      } else {
        // 임시 데이터로 테스트
        setAvailableCafes([
          {
            cafeId: 1,
            name: "에코빈 카페",
            address: "서울시 강남구",
            openHours: "09:00-22:00",
          },
          {
            cafeId: 2,
            name: "그린 커피",
            address: "서울시 서초구",
            openHours: "08:00-20:00",
          },
        ]);
      }
    } catch (error) {
      // 임시 데이터로 테스트
      setAvailableCafes([
        {
          cafeId: 1,
          name: "에코빈 카페",
          address: "서울시 강남구",
          openHours: "09:00-22:00",
        },
        {
          cafeId: 2,
          name: "그린 커피",
          address: "서울시 서초구",
          openHours: "08:00-20:00",
        },
      ]);
    }
  };

  // 커피 찌꺼기 목록 조회 함수 (새로 추가)
  const fetchAvailableGrounds = async (cafeId: number) => {
    try {
      const response = await apiClient.get(
        `/api/coffee_grounds/cafe/${cafeId}`
      );

      if (response.data && response.data.data) {
        setAvailableGrounds(response.data.data);
      } else {
        // 임시 데이터로 테스트
        setAvailableGrounds([
          {
            groundId: 1,
            beanName: "에티오피아 예가체프",
            remainingAmount: 5,
            cafeId,
            cafeName: "에코빈 카페",
          },
          {
            groundId: 2,
            beanName: "콜롬비아 수프리모",
            remainingAmount: 3,
            cafeId,
            cafeName: "에코빈 카페",
          },
        ]);
      }
    } catch (error) {
      // 임시 데이터로 테스트
      setAvailableGrounds([
        {
          groundId: 1,
          beanName: "에티오피아 예가체프",
          remainingAmount: 5,
          cafeId,
          cafeName: "에코빈 카페",
        },
        {
          groundId: 2,
          beanName: "콜롬비아 수프리모",
          remainingAmount: 3,
          cafeId,
          cafeName: "에코빈 카페",
        },
      ]);
    }
  };

  // 컴포넌트 로드 시 수거 요청 목록과 환경 기여도 조회
  useEffect(() => {
    if (isAuthenticated) {
      fetchPickupRequests();
      fetchEnvironmentalReport();
    }
  }, [isAuthenticated]);

  // 다른 페이지에서 새로고침 플래그와 함께 넘어온 경우 데이터 새로고침
  useEffect(() => {
    if (location.state?.refresh && isAuthenticated) {
      fetchPickupRequests();
      fetchEnvironmentalReport();

      // state 초기화 (이전 state 값 제거)
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, isAuthenticated, navigate, location.pathname]);

  // 상태별 요청 필터링
  const pendingRequests = requests.filter((req) => req.status === "PENDING");
  const acceptedRequests = requests.filter((req) => req.status === "ACCEPTED");
  const completedRequests = requests.filter(
    (req) => req.status === "COMPLETED"
  );
  const rejectedRequests = requests.filter((req) => req.status === "REJECTED");

  // 요청 취소 확인 창 열기
  const handleConfirmDelete = (id: number) => {
    setRequestToDelete(id);
    setConfirmDeleteDialog(true);
  };

  // 요청 취소 처리
  const handleCancelRequest = async () => {
    if (!requestToDelete) return;

    try {
      setIsLoading(true);

      // 정확한 API 엔드포인트 사용 - DELETE 메서드로 /api/pickups/{pickupId}
      await apiClient.delete(`/api/pickups/${requestToDelete}`);

      // 요청 목록에서 삭제된 요청 제거
      setRequests(requests.filter((req) => req.pickupId !== requestToDelete));

      toast({
        title: "신청 취소 완료",
        description: "수거 신청이 취소되었습니다.",
        duration: 3000,
      });

      // 모달 닫기
      setConfirmDeleteDialog(false);
      setIsDialogOpen(false);

      // 환경 기여도 갱신
      fetchEnvironmentalReport();
    } catch (error) {
      toast({
        title: "신청 취소 실패",
        description:
          "수거 신청 취소 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 새 수거 요청 대화상자 열기 처리 (새로 추가)
  const handleOpenNewRequestDialog = () => {
    fetchAvailableCafes();
    setNewRequestDialog(true);
    setSelectedCafe(null);
    setSelectedGround(null);
    setPickupAmount(1);
    setPickupDate(new Date().toISOString().split("T")[0]);
    setPickupMessage("");
  };

  // 카페 선택 처리 (새로 추가)
  const handleCafeSelect = (cafeId: number) => {
    console.log(cafeId);
    setSelectedCafe(cafeId);
    fetchAvailableGrounds(cafeId);
  };

  // 수거 요청 제출 처리 (새로 추가)
  const handleSubmitPickupRequest = async () => {
    if (!selectedGround) {
      toast({
        title: "선택 오류",
        description: "수거할 커피 찌꺼기를 선택해주세요.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // API 요청 데이터 구성
      const requestData: PickupRequestData = {
        amount: pickupAmount,
        message: pickupMessage.trim() || undefined,
        pickupDate: pickupDate,
      };

      console.log("[디버깅] 수거 요청 생성 시작...");
      console.log("[디버깅] 요청 데이터:", requestData);

      // API 호출
      const response = await apiClient.post(
        `/api/pickups/${selectedGround}`,
        requestData
      );

      console.log("[디버깅] 수거 요청 생성 성공:", response.data);

      if (response.data && response.data.data) {
        // 성공 알림
        toast({
          title: "수거 신청 완료",
          description: "커피 찌꺼기 수거 신청이 완료되었습니다.",
          duration: 3000,
        });

        // 대화상자 닫기
        setNewRequestDialog(false);

        // 최신 데이터로 목록 갱신
        fetchPickupRequests();
      }
    } catch (error) {
      toast({
        title: "수거 신청 실패",
        description: "수거 신청 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 요청 상세 보기
  const handleViewRequest = (request: PickupRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  // 상태 배지 렌더링
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-700"
          >
            {t("mypage.pending")}
          </Badge>
        );
      case "ACCEPTED":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            {t("mypage.accepted")}
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            {t("mypage.completed")}
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="border-red-500 text-red-700">
            {t("mypage.rejected")}
          </Badge>
        );
      default:
        return null;
    }
  };

  // 상태 텍스트 변환
  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return t("mypage.pending");
      case "ACCEPTED":
        return t("mypage.accepted");
      case "COMPLETED":
        return t("mypage.completed");
      case "REJECTED":
        return t("mypage.rejected");
      default:
        return status;
    }
  };
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP", { locale: ko });
    } catch (error) {
      return dateString;
    }
  };

  // API 재조회 함수
  const refreshData = () => {
    fetchPickupRequests();
    fetchEnvironmentalReport();

    toast({
      title: "새로고침 중",
      description: "최신 수거 신청 정보를 불러오고 있습니다.",
      duration: 2000,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pb-16 md:pb-0 container px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-coffee-dark">
              {t("mypage.title")}
            </h1>
            <p className="text-muted-foreground">{t("mypage.subtitle")}</p>
          </div>

          <div className="flex gap-2">
            {/* 새 수거 요청 버튼 추가 */}
            <Button
              className="bg-coffee hover:bg-coffee-dark"
              onClick={handleOpenNewRequestDialog}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("mypage.new_request")}
            </Button>

            {/* 새로고침 버튼 */}
            <Button
              variant="outline"
              onClick={refreshData}
              className="border-coffee text-coffee hover:bg-coffee-cream/50"
              disabled={isLoading}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              {t("common.refresh")}
            </Button>
          </div>
        </div>

        {/* 사용자 대시보드 요약 - API에서 받은 환경 기여도 정보 표시 */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                {t("mypage.monthly_contribution")}
              </CardTitle>
              <CardDescription>{t("mypage.collected_grounds")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-coffee">
                {envReport.totalCollected}L
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("mypage.carbon_reduction_per_liter")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                {t("mypage.carbon_saved")}
              </CardTitle>
              <CardDescription>{t("mypage.carbon_reduction")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-eco">
                {envReport.carbonSaved}kg
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                커피 찌꺼기 1L당 약 0.6kg의 CO2 절감 효과
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                {t("mypage.completed_collection")}
              </CardTitle>
              <CardDescription>{t("mypage.completed_count")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-coffee-dark">
                {envReport.reportCount}회
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("mypage.environmental_impact")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 로딩 상태 표시 */}
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin h-10 w-10 text-coffee" />
            <span className="ml-3 text-coffee-dark">
              {t("mypage.loading_data")}
            </span>
          </div>
        )}

        {/* 탭 영역 */}
        {!isLoading && (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="w-full max-w-md mb-4">
              <TabsTrigger value="pending" className="flex-1">
                {t("mypage.pending")} ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="accepted" className="flex-1">
                {t("mypage.accepted")} ({acceptedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">
                {t("mypage.completed")} ({completedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex-1">
                {t("mypage.rejected")} ({rejectedRequests.length})
              </TabsTrigger>
            </TabsList>

            {/* 대기 중 탭 */}
            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>{t("mypage.pending_requests")}</CardTitle>
                  <CardDescription>{t("mypage.pending_desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <Card
                          key={request.pickupId}
                          className="overflow-hidden"
                        >
                          <div className="bg-yellow-50 p-4 flex justify-between items-center border-b">
                            <div className="flex items-center gap-3">
                              <Clock className="h-5 w-5 text-yellow-600" />
                              <h3 className="font-medium">
                                {t("mypage.pending_requests")}
                              </h3>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t("cafe.request_date")}:{" "}
                              {formatDate(request.requestDate)}
                            </div>
                          </div>
                          <CardContent className="p-5">
                            <div className="flex justify-between">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.cafeName}`}
                                      alt={request.cafeName}
                                    />
                                    <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                                      {request.cafeName.substring(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {request.cafeName}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="text-sm font-medium">
                                      {t("mypage.pickup_date")}:
                                    </div>
                                    <div className="text-sm">
                                      {formatDate(request.pickupDate)}
                                    </div>

                                    <div className="text-sm font-medium">
                                      {t("mypage.bean_type")}:
                                    </div>
                                    <div className="text-sm">
                                      {request.beanName ||
                                        t("mypage.mixed_beans")}
                                    </div>

                                    <div className="text-sm font-medium">
                                      {t("mypage.amount")}:
                                    </div>
                                    <div className="text-sm">
                                      {request.amount}L
                                    </div>
                                  </div>

                                  {request.message && (
                                    <div className="mt-4">
                                      <div className="text-sm font-medium">
                                        {t("mypage.message")}:
                                      </div>
                                      <div className="text-sm bg-gray-50 p-3 rounded mt-1 italic">
                                        "{request.message}"
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                              <Button
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                                onClick={() =>
                                  handleConfirmDelete(request.pickupId)
                                }
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                                {t("mypage.cancel_request")}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleViewRequest(request)}
                              >
                                {t("mypage.view_detail")}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>{t("mypage.no_accepted")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 수락됨 탭 */}
            <TabsContent value="completed">
              <Card>
                <CardHeader>
                  <CardTitle>{t("mypage.completed_requests")}</CardTitle>
                  <CardDescription>
                    {t("mypage.completed_desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {completedRequests.length > 0 ? (
                    <div className="space-y-4">
                      {completedRequests.map((request) => (
                        <Card
                          key={request.pickupId}
                          className="overflow-hidden"
                        >
                          <div className="bg-green-50 p-4 flex justify-between items-center border-b">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <h3 className="font-medium">
                                {t("mypage.completed")}
                              </h3>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t("mypage.completed")}:{" "}
                              {formatDate(request.pickupDate)}
                            </div>
                          </div>
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.cafeName}`}
                                    alt={request.cafeName}
                                  />
                                  <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                                    {request.cafeName.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {request.cafeName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {request.beanName ||
                                      t("mypage.mixed_beans")}{" "}
                                    {request.amount}L
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewRequest(request)}
                                >
                                  {t("mypage.view_detail")}
                                </Button>
                                <Button
                                  className="bg-green-600 hover:bg-green-700"
                                  size="sm"
                                  onClick={() => navigate("/eco-report")}
                                >
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>{t("mypage.no_completed")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 완료됨 탭 */}
            <TabsContent value="completed">
              <Card>
                <CardHeader>
                  <CardTitle>{t("mypage.completed_requests")}</CardTitle>
                  <CardDescription>
                    {t("mypage.completed_desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {completedRequests.length > 0 ? (
                    <div className="space-y-4">
                      {completedRequests.map((request) => (
                        <Card
                          key={request.pickupId}
                          className="overflow-hidden"
                        >
                          <div className="bg-green-50 p-4 flex justify-between items-center border-b">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <h3 className="font-medium">
                                {t("mypage.completed")}
                              </h3>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t("mypage.completed")}:{" "}
                              {formatDate(request.pickupDate)}
                            </div>
                          </div>
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.cafeName}`}
                                    alt={request.cafeName}
                                  />
                                  <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                                    {request.cafeName.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {request.cafeName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {request.beanName ||
                                      t("mypage.mixed_beans")}{" "}
                                    {request.amount}L
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewRequest(request)}
                                >
                                  {t("mypage.view_detail")}
                                </Button>
                                <Button
                                  className="bg-green-600 hover:bg-green-700"
                                  size="sm"
                                  onClick={() => navigate("/eco-report")}
                                >
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>{t("mypage.no_completed")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 거절됨 탭 */}
            <TabsContent value="rejected">
              <Card>
                <CardHeader>
                  <CardTitle>{t("mypage.rejected_requests")}</CardTitle>
                  <CardDescription>{t("mypage.rejected_desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {rejectedRequests.length > 0 ? (
                    <div className="space-y-4">
                      {rejectedRequests.map((request) => (
                        <Card
                          key={request.pickupId}
                          className="overflow-hidden"
                        >
                          <div className="bg-red-50 p-4 flex justify-between items-center border-b">
                            <div className="flex items-center gap-3">
                              <XCircle className="h-5 w-5 text-red-600" />
                              <h3 className="font-medium">
                                {t("mypage.rejected")}
                              </h3>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t("cafe.request_date")}:{" "}
                              {formatDate(request.requestDate)}
                            </div>
                          </div>
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.cafeName}`}
                                    alt={request.cafeName}
                                  />
                                  <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                                    {request.cafeName.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {request.cafeName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {request.beanName || "혼합 원두"}{" "}
                                    {request.amount}L
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewRequest(request)}
                              >
                                {t("mypage.view_detail")}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>{t("mypage.no_rejected")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* 요청 상세 정보 대화상자 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedRequest && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("mypage.request_detail")}</DialogTitle>
              <DialogDescription>
                {t("mypage.requested_on", {
                  date: formatDate(selectedRequest.requestDate),
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedRequest.cafeName}`}
                    alt={selectedRequest.cafeName}
                  />
                  <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                    {selectedRequest.cafeName.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedRequest.cafeName}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="text-sm font-medium">{t("mypage.status")}:</div>
                <div>{renderStatusBadge(selectedRequest.status)}</div>

                <div className="text-sm font-medium">
                  {t("mypage.pickup_date")}:
                </div>
                <div className="text-sm">
                  {formatDate(selectedRequest.pickupDate)}
                </div>

                <div className="text-sm font-medium">
                  {t("mypage.bean_type")}:
                </div>
                <div className="text-sm">
                  {selectedRequest.beanName || t("mypage.mixed_beans")}
                </div>

                <div className="text-sm font-medium">{t("mypage.amount")}:</div>
                <div className="text-sm">{selectedRequest.amount}L</div>
              </div>

              {selectedRequest.message && (
                <div className="pt-2">
                  <div className="text-sm font-medium">
                    {t("mypage.message")}:
                  </div>
                  <div className="text-sm bg-gray-50 p-3 rounded mt-1 italic">
                    "{selectedRequest.message}"
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex sm:justify-between">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t("common.close")}
              </Button>

              {selectedRequest.status === "PENDING" && (
                <Button
                  variant="destructive"
                  onClick={() => handleConfirmDelete(selectedRequest.pickupId)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  {t("mypage.cancel_request")}
                </Button>
              )}

              {selectedRequest.status === "COMPLETED" && (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => navigate("/eco-report")}
                >
                  <BarChart3 className="mr-1 h-4 w-4" />
                  {t("mypage.view_eco_report")}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* 새 수거 요청 대화상자 */}
      <Dialog open={newRequestDialog} onOpenChange={setNewRequestDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("mypage.new_request_title")}</DialogTitle>
            <DialogDescription>
              {t("mypage.new_request_desc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 카페 선택 */}
            <div>
              <Label className="font-medium mb-2 block">
                {t("mypage.select_cafe")}
              </Label>
              <div className="grid gap-3 md:grid-cols-2">
                {availableCafes.map((cafe) => (
                  <Card
                    key={cafe.cafeId}
                    className={`cursor-pointer transition-all ${
                      selectedCafe === cafe.cafeId
                        ? "border-coffee ring-2 ring-coffee ring-opacity-50"
                        : "hover:border-coffee hover:border-opacity-50"
                    }`}
                    onClick={() => handleCafeSelect(cafe.cafeId)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium text-coffee-dark">
                        {cafe.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cafe.address}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("map.operating_hours")}: {cafe.openHours}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 커피 찌꺼기 선택 */}
            {selectedCafe && (
              <div>
                <Label className="font-medium mb-2 block">
                  {t("mypage.select_grounds")}
                </Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {availableGrounds.map((ground) => (
                    <Card
                      key={ground.groundId}
                      className={`cursor-pointer transition-all ${
                        selectedGround === ground.groundId
                          ? "border-coffee ring-2 ring-coffee ring-opacity-50"
                          : "hover:border-coffee hover:border-opacity-50"
                      }`}
                      onClick={() => setSelectedGround(ground.groundId)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-medium text-coffee-dark">
                          {ground.beanName}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("mypage.remaining_amount", {
                            amount: ground.remainingAmount,
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 수거량 설정 */}
            {selectedGround && (
              <>
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="font-medium">
                      {t("mypage.pickup_amount")}
                    </Label>
                    <span className="text-sm font-medium">{pickupAmount}L</span>
                  </div>
                  <Slider
                    value={[pickupAmount]}
                    min={0.5}
                    max={5}
                    step={0.5}
                    onValueChange={(values) => setPickupAmount(values[0])}
                  />
                </div>

                {/* 수거 날짜 선택 */}
                <div>
                  <Label className="font-medium mb-2 block">
                    {t("mypage.desired_pickup_date")}
                  </Label>
                  <Input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                {/* 메시지 입력 (선택사항) */}
                <div>
                  <Label className="font-medium mb-2 block">
                    {t("mypage.message_optional")}
                  </Label>
                  <Textarea
                    placeholder={t("map.message_placeholder")}
                    value={pickupMessage}
                    onChange={(e) => setPickupMessage(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewRequestDialog(false)}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="bg-coffee hover:bg-coffee-dark"
              onClick={handleSubmitPickupRequest}
              disabled={!selectedGround || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>{t("common.submit")}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 대화상자 */}
      <Dialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("mypage.cancel_request")}</DialogTitle>
            <DialogDescription>{t("mypage.cancel_confirm")}</DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteDialog(false)}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelRequest}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("mypage.cancel_request")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UserNavbar />
      <Footer />
    </div>
  );
};

export default UserMyPage;
