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
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Trash2,
  XCircle,
  Loader,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserNavbar from '@/components/UserNavbar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import apiClient from '@/api/apiClient';

// 수거 신청 타입 정의 (백엔드 API 응답 구조와 맞춤)
interface PickupRequest {
  pickupId: number;
  cafeName: string;
  cafeId: number;
  cafeProfileImage?: string;
  requestDate: string;
  pickupDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED';
  amount: number;
  message?: string;
  beanType: string;
}

// 테스트용 더미 데이터 추가
const mockRequests: PickupRequest[] = [
  {
    pickupId: 1,
    cafeName: '스타벅스 강남점',
    cafeId: 3,
    cafeProfileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=스타벅스',
    requestDate: '2025-05-07T10:30:00',
    pickupDate: '2025-05-08',
    status: 'PENDING',
    amount: 2.5,
    message: '방문 전에 연락 부탁드립니다.',
    beanType: '에티오피아 예가체프'
  },
  {
    pickupId: 2,
    cafeName: '커피빈 선릉점',
    cafeId: 4,
    cafeProfileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=커피빈',
    requestDate: '2025-05-06T15:20:00',
    pickupDate: '2025-05-10',
    status: 'PENDING',
    amount: 3.0,
    message: '오전 시간대에 방문하겠습니다.',
    beanType: '콜롬비아 수프리모'
  }
];

const UserMyPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<number | null>(null);

  // 수거 요청 목록 조회 함수
  const fetchPickupRequests = async () => {
    try {
      setIsLoading(true);
      
      // 사용자의 수거 요청 목록 조회 API 호출
      const response = await apiClient.get('/api/mypage/pickups');
      console.log('[디버깅] 수거 요청 목록 조회 성공:', response.data);
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        setRequests(response.data.data);
      } else {
        // 데이터가 없는 경우 개발 환경에서는 테스트 데이터 사용
        console.log('[디버깅] API 응답이 비어있어 테스트 데이터를 사용합니다.');
        setRequests(mockRequests);
      }
    } catch (error) {
      console.error('[디버깅] 수거 요청 목록 조회 오류:', error);
      
      // 오류 발생 시 테스트 데이터 사용
      console.log('[디버깅] 오류로 인해 테스트 데이터를 사용합니다.');
      setRequests(mockRequests);
      
      toast({
        title: '데이터 로딩 실패',
        description: '테스트 데이터를 사용합니다.',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 로드 시 수거 요청 목록 조회
  useEffect(() => {
    if (isAuthenticated) {
      fetchPickupRequests();
    }
  }, [isAuthenticated]);

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
      
      // API 호출로 수거 요청 삭제
      await apiClient.delete(`/api/pickups/${requestToDelete}`);
      
      // 요청 목록에서 삭제된 요청 제거
      setRequests(requests.filter(req => req.pickupId !== requestToDelete));
      
      toast({
        title: "신청 취소 완료",
        description: "수거 신청이 취소되었습니다.",
        duration: 3000,
      });
    } catch (error) {
      console.error('[디버깅] 수거 요청 삭제 오류:', error);
      
      toast({
        title: "신청 취소 실패",
        description: "수거 신청 취소 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setConfirmDeleteDialog(false);
      setIsDialogOpen(false);
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pb-16 md:pb-0 container px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-coffee-dark">마이페이지</h1>
            <p className="text-muted-foreground">나의 수거 내역 및 환경 기여도를 확인해보세요.</p>
          </div>
        </div>
        
        {/* 사용자 대시보드 요약 - 환경 기여도 등은 향후 구현 */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">이번 달 기여량</CardTitle>
              <CardDescription>수거한 커피 찌꺼기</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-coffee">3.2L</div>
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
              <div className="text-3xl font-bold text-eco">5.7kg</div>
              <p className="text-xs text-muted-foreground mt-1">
                커피 찌꺼기 1L당 약 0.6kg의 CO2 절감 효과
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
                                      src={request.cafeProfileImage || 
                                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.cafeName}`} 
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
                                    <div className="text-sm">{request.beanType || "혼합 원두"}</div>
                                    
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
                                    src={request.cafeProfileImage || 
                                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.cafeName}`} 
                                    alt={request.cafeName} 
                                  />
                                  <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                                    {request.cafeName.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{request.cafeName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {request.beanType || "혼합 원두"} {request.amount}L
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
                                    src={request.cafeProfileImage || 
                                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.cafeName}`} 
                                    alt={request.cafeName} 
                                  />
                                  <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                                    {request.cafeName.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{request.cafeName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {request.beanType || "혼합 원두"} {request.amount}L
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
                                    src={request.cafeProfileImage || 
                                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.cafeName}`} 
                                    alt={request.cafeName} 
                                  />
                                  <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                                    {request.cafeName.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{request.cafeName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {request.beanType || "혼합 원두"} {request.amount}L
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
                    src={selectedRequest.cafeProfileImage || 
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedRequest.cafeName}`} 
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
                <div className="text-sm">{selectedRequest.beanType || "혼합 원두"}</div>
                
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