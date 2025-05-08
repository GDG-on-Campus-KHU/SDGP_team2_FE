import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Trash2,
  XCircle,
  Loader,
  RefreshCcw,
  Plus,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserNavbar from '@/components/UserNavbar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import apiClient from '@/api/apiClient';

// 수거 신청 타입 정의 - 정확한 API 응답 구조에 맞게 수정
interface PickupRequest {
  pickupId: number;
  cafeName: string;
  pickupDate: string;
  requestDate: string;
  beanName: string;
  amount: number;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED';
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
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<number | null>(null);
  
  // 환경 기여도 상태
  const [envReport, setEnvReport] = useState<EnvReportData>({
    totalCollected: 0,
    carbonSaved: '0',
    reportCount: 0
  });

  // 새로운 수거 요청 관련 상태 추가
  const [newRequestDialog, setNewRequestDialog] = useState(false);
  const [availableCafes, setAvailableCafes] = useState<Cafe[]>([]);
  const [availableGrounds, setAvailableGrounds] = useState<CoffeeGround[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<number | null>(null);
  const [selectedGround, setSelectedGround] = useState<number | null>(null);
  const [pickupAmount, setPickupAmount] = useState<number>(1);
  const [pickupDate, setPickupDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [pickupMessage, setPickupMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 환경 기여도 조회 함수
  const fetchEnvironmentalReport = async () => {
    try {
      console.log('[디버깅] 환경 기여도 조회 시작...');
      
      const response = await apiClient.get('/api/members/me/report');
      console.log('[디버깅] 환경 기여도 조회 성공:', response.data);
      
      if (response.data && response.data.data) {
        setEnvReport(response.data.data);
      } else {
        console.log('[디버깅] API 응답 형식이 예상과 다릅니다.');
      }
    } catch (error) {
      console.error('[디버깅] 환경 기여도 조회 오류:', error);
      
      // 오류 상세 정보 출력
      if (error.response) {
        console.error('응답 데이터:', error.response.data);
        console.error('응답 상태:', error.response.status);
      }
    }
  };

  // 수거 요청 목록 조회 함수
  const fetchPickupRequests = async () => {
    try {
      setIsLoading(true);
      
      console.log('[디버깅] 수거 요청 목록 조회 시작...');
      
      // API에 맞게 정확한 엔드포인트를 사용
      const response = await apiClient.get('/api/mypage/pickups');
      console.log('[디버깅] 수거 요청 목록 조회 성공:', response.data);
      
      if (response.data && response.data.data) {
        // API 응답 구조에 맞게 데이터 설정
        setRequests(response.data.data);
        
        if (response.data.data.length === 0) {
          console.log('[디버깅] API 응답이 비어있습니다.');
          setRequests([]);
        }
      } else {
        console.log('[디버깅] API 응답 형식이 예상과 다릅니다.');
        setRequests([]);
      }
    } catch (error) {
      console.error('[디버깅] 수거 요청 목록 조회 오류:', error);
      setRequests([]);
      
      toast({
        title: '데이터 로딩 실패',
        description: '수거 요청 목록을 가져오는데 실패했습니다.',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 카페 목록 조회 함수 (새로 추가)
  const fetchAvailableCafes = async () => {
    try {
      console.log('[디버깅] 카페 목록 조회 시작...');
      
      const response = await apiClient.get('/api/cafes');
      console.log('[디버깅] 카페 목록 조회 성공:', response.data);
      
      if (response.data && response.data.data && Array.isArray(response.data.data.content)) {
        setAvailableCafes(response.data.data.content);
      } else {
        console.log('[디버깅] API 응답 형식이 예상과 다릅니다.');
        // 임시 데이터로 테스트
        setAvailableCafes([
          { cafeId: 1, name: '에코빈 카페', address: '서울시 강남구', openHours: '09:00-22:00' },
          { cafeId: 2, name: '그린 커피', address: '서울시 서초구', openHours: '08:00-20:00' },
        ]);
      }
    } catch (error) {
      console.error('[디버깅] 카페 목록 조회 오류:', error);
      
      // 임시 데이터로 테스트
      setAvailableCafes([
        { cafeId: 1, name: '에코빈 카페', address: '서울시 강남구', openHours: '09:00-22:00' },
        { cafeId: 2, name: '그린 커피', address: '서울시 서초구', openHours: '08:00-20:00' },
      ]);
    }
  };

  // 커피 찌꺼기 목록 조회 함수 (새로 추가)
  const fetchAvailableGrounds = async (cafeId: number) => {
    try {
      console.log(`[디버깅] 커피 찌꺼기 목록 조회 시작 (카페 ID: ${cafeId})...`);
      
      const response = await apiClient.get(`/api/cafes/${cafeId}/grounds`);
      console.log('[디버깅] 커피 찌꺼기 목록 조회 성공:', response.data);
      
      if (response.data && response.data.data) {
        setAvailableGrounds(response.data.data);
      } else {
        console.log('[디버깅] API 응답 형식이 예상과 다릅니다.');
        // 임시 데이터로 테스트
        setAvailableGrounds([
          { groundId: 1, beanName: '에티오피아 예가체프', remainingAmount: 5, cafeId, cafeName: '에코빈 카페' },
          { groundId: 2, beanName: '콜롬비아 수프리모', remainingAmount: 3, cafeId, cafeName: '에코빈 카페' },
        ]);
      }
    } catch (error) {
      console.error('[디버깅] 커피 찌꺼기 목록 조회 오류:', error);
      
      // 임시 데이터로 테스트
      setAvailableGrounds([
        { groundId: 1, beanName: '에티오피아 예가체프', remainingAmount: 5, cafeId, cafeName: '에코빈 카페' },
        { groundId: 2, beanName: '콜롬비아 수프리모', remainingAmount: 3, cafeId, cafeName: '에코빈 카페' },
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
      console.log('[디버깅] 새로고침 플래그 감지, 데이터 새로고침 시작');
      fetchPickupRequests();
      fetchEnvironmentalReport();
      
      // state 초기화 (이전 state 값 제거)
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, isAuthenticated, navigate, location.pathname]);

  // 상태별 요청 필터링
  const pendingRequests = requests.filter(req => req.status === 'PENDING');
  const acceptedRequests = requests.filter(req => req.status === 'ACCEPTED');
  const completedRequests = requests.filter(req => req.status === 'COMPLETED');
  const rejectedRequests = requests.filter(req => req.status === 'REJECTED');

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
      
      console.log(`[디버깅] 수거 요청 삭제 시작: ID=${requestToDelete}`);
      
      // 정확한 API 엔드포인트 사용 - DELETE 메서드로 /api/pickups/{pickupId}
      await apiClient.delete(`/api/pickups/${requestToDelete}`);
      
      console.log(`[디버깅] 수거 요청 삭제 성공: ID=${requestToDelete}`);
      
      // 요청 목록에서 삭제된 요청 제거
      setRequests(requests.filter(req => req.pickupId !== requestToDelete));
      
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
      console.error('[디버깅] 수거 요청 삭제 오류:', error);
      
      // 오류 상세 정보 출력
      if (error.response) {
        console.error('응답 데이터:', error.response.data);
        console.error('응답 상태:', error.response.status);
      }
      
      toast({
        title: "신청 취소 실패",
        description: "수거 신청 취소 중 오류가 발생했습니다. 다시 시도해주세요.",
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
    setPickupDate(new Date().toISOString().split('T')[0]);
    setPickupMessage('');
  };

  // 카페 선택 처리 (새로 추가)
  const handleCafeSelect = (cafeId: number) => {
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
      
      console.log('[디버깅] 수거 요청 생성 시작...');
      console.log('[디버깅] 요청 데이터:', requestData);
      
      // API 호출
      const response = await apiClient.post(`/api/pickups/${selectedGround}`, requestData);
      
      console.log('[디버깅] 수거 요청 생성 성공:', response.data);
      
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
      console.error('[디버깅] 수거 요청 생성 오류:', error);
      
      if (error.response) {
        console.error('응답 데이터:', error.response.data);
        console.error('응답 상태:', error.response.status);
      }
      
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
      case 'PENDING':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">대기 중</Badge>;
      case 'ACCEPTED':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">수락됨</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="border-green-500 text-green-700">완료됨</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="border-red-500 text-red-700">거절됨</Badge>;
      default:
        return null;
    }
  };

  // 상태 텍스트 변환
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기 중';
      case 'ACCEPTED':
        return '수락됨';
      case 'COMPLETED':
        return '완료됨';
      case 'REJECTED':
        return '거절됨';
      default:
        return status;
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP', { locale: ko });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return dateString;
    }
  };

  // API 재조회 함수
  const refreshData = () => {
    console.log('[디버깅] 수동 새로고침 시작');
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
            <h1 className="text-3xl font-bold text-coffee-dark">마이페이지</h1>
            <p className="text-muted-foreground">나의 수거 내역 및 환경 기여도를 확인해보세요.</p>
          </div>
          
          <div className="flex gap-2">
            {/* 새 수거 요청 버튼 추가 */}
            <Button 
              className="bg-coffee hover:bg-coffee-dark"
              onClick={handleOpenNewRequestDialog}
            >
              <Plus className="mr-2 h-4 w-4" />
              새 수거 신청
            </Button>
            
            {/* 새로고침 버튼 */}
            <Button 
              variant="outline" 
              onClick={refreshData}
              className="border-coffee text-coffee hover:bg-coffee-cream/50"
              disabled={isLoading}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              새로고침
            </Button>
          </div>
        </div>
        
        {/* 사용자 대시보드 요약 - API에서 받은 환경 기여도 정보 표시 */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">이번 달 기여량</CardTitle>
              <CardDescription>수거한 커피 찌꺼기</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-coffee">{envReport.totalCollected}L</div>
              <p className="text-xs text-muted-foreground mt-1">
                지난 달 대비 +28%
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">절약 탄소량</CardTitle>
              <CardDescription>CO2 배출 감소량</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-eco">{envReport.carbonSaved}kg</div>
              <p className="text-xs text-muted-foreground mt-1">
                커피 찌꺼기 1L당 약 0.6kg의 CO2 절감 효과
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">완료된 수거</CardTitle>
              <CardDescription>성공적으로
                수거 완료한 횟수</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-coffee-dark">{envReport.reportCount}회</div>
              <p className="text-xs text-muted-foreground mt-1">
                꾸준한 활동으로 환경을 보호해요
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* 로딩 상태 표시 */}
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin h-10 w-10 text-coffee" />
            <span className="ml-3 text-coffee-dark">데이터를 불러오는 중...</span>
          </div>
        )}
        
        {/* 탭 영역 */}
        {!isLoading && (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="w-full max-w-md mb-4">
              <TabsTrigger value="pending" className="flex-1">대기 중 ({pendingRequests.length})</TabsTrigger>
              <TabsTrigger value="accepted" className="flex-1">수락됨 ({acceptedRequests.length})</TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">완료됨 ({completedRequests.length})</TabsTrigger>
              <TabsTrigger value="rejected" className="flex-1">거절됨 ({rejectedRequests.length})</TabsTrigger>
            </TabsList>
            
            {/* 대기 중 탭 */}
            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>대기 중인 신청</CardTitle>
                  <CardDescription>
                    카페에서 수락 대기 중인 찌꺼기 수거 신청입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                      {pendingRequests.map(request => (
                        <Card key={request.pickupId} className="overflow-hidden">
                          <div className="bg-yellow-50 p-4 flex justify-between items-center border-b">
                            <div className="flex items-center gap-3">
                              <Clock className="h-5 w-5 text-yellow-600" />
                              <h3 className="font-medium">대기 중인 수거 신청</h3>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              신청일: {formatDate(request.requestDate)}
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
                                    <div className="font-medium">{request.cafeName}</div>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="text-sm font-medium">수거 희망일:</div>
                                    <div className="text-sm">{formatDate(request.pickupDate)}</div>
                                    
                                    <div className="text-sm font-medium">원두 종류:</div>
                                    <div className="text-sm">{request.beanName || "혼합 원두"}</div>
                                    
                                    <div className="text-sm font-medium">수거량:</div>
                                    <div className="text-sm">{request.amount}L</div>
                                  </div>
                                  
                                  {request.message && (
                                    <div className="mt-4">
                                      <div className="text-sm font-medium">메시지:</div>
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
                                onClick={() => handleConfirmDelete(request.pickupId)}
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                                신청 취소
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => handleViewRequest(request)}
                              >
                                상세 보기
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>대기 중인 수거 신청이 없습니다.</p>
                      <Button 
                        className="mt-4 bg-coffee hover:bg-coffee-dark"
                        onClick={handleOpenNewRequestDialog}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        새 수거 신청하기
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 수락됨 탭 */}
            <TabsContent value="accepted">
              <Card>
                <CardHeader>
                  <CardTitle>수락된 신청</CardTitle>
                  <CardDescription>
                    카페에서 수락한 찌꺼기 수거 신청입니다. 예정된 날짜에 방문하세요.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {acceptedRequests.length > 0 ? (
                    <div className="space-y-4">
                      {acceptedRequests.map(request => (
                        <Card key={request.pickupId} className="overflow-hidden">
                          <div className="bg-blue-50 p-4 flex justify-between items-center border-b">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-blue-600" />
                              <h3 className="font-medium">수락된 수거 신청</h3>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              수거일: {formatDate(request.pickupDate)}
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
                                  <div className="font-medium">{request.cafeName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {request.beanName || "혼합 원두"} {request.amount}L
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewRequest(request)}
                              >
                                상세 보기
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>수락된 수거 신청이 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 완료됨 탭 */}
            <TabsContent value="completed">
              <Card>
                <CardHeader>
                  <CardTitle>완료된 신청</CardTitle>
                  <CardDescription>
                    성공적으로 완료된 찌꺼기 수거 내역입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {completedRequests.length > 0 ? (
                    <div className="space-y-4">
                      {completedRequests.map(request => (
                        <Card key={request.pickupId} className="overflow-hidden">
                          <div className="bg-green-50 p-4 flex justify-between items-center border-b">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <h3 className="font-medium">완료된 수거</h3>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              완료일: {formatDate(request.pickupDate)}
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
                                  <div className="font-medium">{request.cafeName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {request.beanName || "혼합 원두"} {request.amount}L
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewRequest(request)}
                                >
                                  상세 보기
                                </Button>
                                <Button 
                                  className="bg-green-600 hover:bg-green-700"
                                  size="sm"
                                  onClick={() => navigate('/eco-report')}
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
                      <p>완료된 수거 내역이 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 거절됨 탭 */}
            <TabsContent value="rejected">
              <Card>
                <CardHeader>
                  <CardTitle>거절된 신청</CardTitle>
                  <CardDescription>
                    카페 사정으로 거절된 수거 신청입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rejectedRequests.length > 0 ? (
                    <div className="space-y-4">
                      {rejectedRequests.map(request => (
                        <Card key={request.pickupId} className="overflow-hidden">
                          <div className="bg-red-50 p-4 flex justify-between items-center border-b">
                            <div className="flex items-center gap-3">
                              <XCircle className="h-5 w-5 text-red-600" />
                              <h3 className="font-medium">거절된 신청</h3>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              신청일: {formatDate(request.requestDate)}
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
                                  <div className="font-medium">{request.cafeName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {request.beanName || "혼합 원두"} {request.amount}L
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewRequest(request)}
                              >
                                상세 보기
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>거절된 수거 신청이 없습니다.</p>
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
              <DialogTitle>수거 신청 상세 정보</DialogTitle>
              <DialogDescription>
                {formatDate(selectedRequest.requestDate)}에 신청됨
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
                <div className="text-sm font-medium">상태:</div>
                <div>{renderStatusBadge(selectedRequest.status)}</div>
                
                <div className="text-sm font-medium">수거 희망일:</div>
                <div className="text-sm">{formatDate(selectedRequest.pickupDate)}</div>
                
                <div className="text-sm font-medium">원두 종류:</div>
                <div className="text-sm">{selectedRequest.beanName || "혼합 원두"}</div>
                
                <div className="text-sm font-medium">요청량:</div>
                <div className="text-sm">{selectedRequest.amount}L</div>
              </div>
              
              {selectedRequest.message && (
                <div className="pt-2">
                  <div className="text-sm font-medium">메시지:</div>
                  <div className="text-sm bg-gray-50 p-3 rounded mt-1 italic">
                    "{selectedRequest.message}"
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                닫기
              </Button>
              
              {selectedRequest.status === 'PENDING' && (
                <Button 
                  variant="destructive"
                  onClick={() => handleConfirmDelete(selectedRequest.pickupId)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  신청 취소
                </Button>
              )}
              
              {selectedRequest.status === 'COMPLETED' && (
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => navigate('/eco-report')}
                >
                  <BarChart3 className="mr-1 h-4 w-4" />
                  환경 리포트 보기
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
            <DialogTitle>새 수거 신청</DialogTitle>
            <DialogDescription>
              카페에서 배출된 커피 찌꺼기 수거를 신청합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* 카페 선택 */}
            <div>
              <Label className="font-medium mb-2 block">카페 선택</Label>
              <div className="grid gap-3 md:grid-cols-2">
                {availableCafes.map(cafe => (
                  <Card 
                    key={cafe.cafeId} 
                    className={`cursor-pointer transition-all ${
                      selectedCafe === cafe.cafeId 
                        ? 'border-coffee ring-2 ring-coffee ring-opacity-50'
                        : 'hover:border-coffee hover:border-opacity-50'
                    }`}
                    onClick={() => handleCafeSelect(cafe.cafeId)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium text-coffee-dark">{cafe.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{cafe.address}</p>
                      <p className="text-xs text-muted-foreground mt-1">영업시간: {cafe.openHours}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* 커피 찌꺼기 선택 */}
            {selectedCafe && (
              <div>
                <Label className="font-medium mb-2 block">수거할 커피 찌꺼기 선택</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {availableGrounds.map(ground => (
                    <Card 
                      key={ground.groundId} 
                      className={`cursor-pointer transition-all ${
                        selectedGround === ground.groundId 
                          ? 'border-coffee ring-2 ring-coffee ring-opacity-50'
                          : 'hover:border-coffee hover:border-opacity-50'
                      }`}
                      onClick={() => setSelectedGround(ground.groundId)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-medium text-coffee-dark">{ground.beanName}</h4>
                        <p className="text-xs text-muted-foreground mt-1">남은 양: {ground.remainingAmount}L</p>
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
                    <Label className="font-medium">수거량 (L)</Label>
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
                  <Label className="font-medium mb-2 block">수거 희망일</Label>
                  <Input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                {/* 메시지 입력 (선택사항) */}
                <div>
                  <Label className="font-medium mb-2 block">메시지 (선택사항)</Label>
                  <Textarea
                    placeholder="카페 사장님에게 전달할 메시지나 요청사항을 입력해주세요."
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
              취소
            </Button>
            <Button 
              className="bg-coffee hover:bg-coffee-dark"
              onClick={handleSubmitPickupRequest}
              disabled={!selectedGround || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  신청하기
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 삭제 확인 대화상자 */}
      <Dialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>수거 신청 취소</DialogTitle>
            <DialogDescription>
              이 수거 신청을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteDialog(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelRequest}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  신청 취소
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