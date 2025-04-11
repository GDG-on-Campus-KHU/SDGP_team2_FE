
import React, { useState } from 'react';
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
  Coffee,
  Leaf,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserNavbar from '@/components/UserNavbar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 수거 신청 타입 정의
interface CollectionRequest {
  id: number;
  cafeId: string;
  cafeName: string;
  cafeAvatar?: string;
  date: Date;
  requestDate: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  amount: number;
  message?: string;
  beanType: string;
}

// 모의 수거 신청 데이터
const mockRequests: CollectionRequest[] = [
  {
    id: 1,
    cafeId: 'cafe1',
    cafeName: '스타벅스 강남점',
    cafeAvatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=cafe1',
    date: new Date(2023, 11, 10),
    requestDate: new Date(2023, 11, 5),
    status: 'pending',
    amount: 3.5,
    message: '오전 10시에 방문할 예정입니다.',
    beanType: '에티오피아 예가체프'
  },
  {
    id: 2,
    cafeId: 'cafe2',
    cafeName: '커피빈 선릉점',
    cafeAvatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=cafe2',
    date: new Date(2023, 11, 8),
    requestDate: new Date(2023, 11, 4),
    status: 'accepted',
    amount: 2.0,
    beanType: '콜롬비아 수프리모'
  },
  {
    id: 3,
    cafeId: 'cafe3',
    cafeName: '블루보틀 삼청점',
    cafeAvatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=cafe3',
    date: new Date(2023, 11, 3),
    requestDate: new Date(2023, 11, 1),
    status: 'completed',
    amount: 4.0,
    message: '방향제 만들기 위해 수거했습니다.',
    beanType: '브라질 산토스'
  },
  {
    id: 4,
    cafeId: 'cafe4',
    cafeName: '이디야 서초점',
    cafeAvatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=cafe4',
    date: new Date(2023, 10, 25),
    requestDate: new Date(2023, 10, 20),
    status: 'rejected',
    amount: 5.0,
    message: '학교 프로젝트에 활용하고 싶습니다.',
    beanType: '에티오피아 예가체프'
  },
  {
    id: 5,
    cafeId: 'cafe5',
    cafeName: '그린 카페',
    cafeAvatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=cafe5',
    date: new Date(2023, 10, 20),
    requestDate: new Date(2023, 10, 18),
    status: 'completed',
    amount: 2.5,
    beanType: '과테말라 안티구아'
  },
];

// 환경 리포트 데이터
const ecoReport = {
  totalCollections: 3,
  totalAmount: 9.5,
  carbonSaved: 5.7,
  level: '그린 레벨 2',
  levelProgress: 65,
  monthlyContribution: 3.2,
  lastMonth: 2.5,
  badges: [
    { name: '첫 수거 완료', icon: <Coffee className="h-5 w-5" />, earned: true },
    { name: '5L 달성', icon: <Leaf className="h-5 w-5" />, earned: true },
    { name: '10L 달성', icon: <Leaf className="h-5 w-5" />, earned: false },
  ]
};

const UserMyPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<CollectionRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<CollectionRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 상태별 요청 필터링
  const pendingRequests = requests.filter(req => req.status === 'pending');
  const acceptedRequests = requests.filter(req => req.status === 'accepted');
  const completedRequests = requests.filter(req => req.status === 'completed');
  const rejectedRequests = requests.filter(req => req.status === 'rejected');

  // 요청 취소 처리
  const handleCancelRequest = (id: number) => {
    setRequests(requests.filter(req => req.id !== id));
    
    toast({
      title: "신청 취소 완료",
      description: "수거 신청이 취소되었습니다.",
      duration: 3000,
    });
    
    setIsDialogOpen(false);
  };

  // 요청 상세 보기
  const handleViewRequest = (request: CollectionRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  // 상태 배지 렌더링
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">대기 중</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">수락됨</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-700">완료됨</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="border-red-500 text-red-700">거절됨</Badge>;
      default:
        return null;
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
        
        {/* 사용자 대시보드 요약 */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">이번 달 기여량</CardTitle>
              <CardDescription>수거한 커피 찌꺼기</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-coffee">{ecoReport.monthlyContribution}L</div>
              <p className="text-xs text-muted-foreground mt-1">
                {ecoReport.lastMonth > 0 
                  ? `지난 달 대비 +${((ecoReport.monthlyContribution - ecoReport.lastMonth) / ecoReport.lastMonth * 100).toFixed(0)}%` 
                  : '첫 기여 달!'
                }
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">절약 탄소량</CardTitle>
              <CardDescription>CO2 배출 감소량</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-eco">{ecoReport.carbonSaved}kg</div>
              <p className="text-xs text-muted-foreground mt-1">
                커피 찌꺼기 1L당 약 0.6kg의 CO2 절감 효과
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">환경 기여 레벨</CardTitle>
              <CardDescription>{ecoReport.level}</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={ecoReport.levelProgress} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                다음 레벨까지 {(100 - ecoReport.levelProgress).toFixed(0)}% 남았습니다
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* 탭 영역 */}
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
                      <Card key={request.id} className="overflow-hidden">
                        <div className="bg-yellow-50 p-4 flex justify-between items-center border-b">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <h3 className="font-medium">대기 중인 수거 신청</h3>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            신청일: {format(request.requestDate, 'PPP', { locale: ko })}
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <div className="flex justify-between">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={request.cafeAvatar} alt={request.cafeName} />
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
                                  <div className="text-sm">{format(request.date, 'PPP', { locale: ko })}</div>
                                  
                                  <div className="text-sm font-medium">원두 종류:</div>
                                  <div className="text-sm">{request.beanType}</div>
                                  
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
                              onClick={() => handleCancelRequest(request.id)}
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
                  카페에서 수락한 찌꺼기 수거 신청입니다. 예정된 날짜에 방문하거나 배송을 확인하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {acceptedRequests.length > 0 ? (
                  <div className="space-y-4">
                    {acceptedRequests.map(request => (
                      <Card key={request.id} className="overflow-hidden">
                        <div className="bg-blue-50 p-4 flex justify-between items-center border-b">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            <h3 className="font-medium">수락된 수거 신청</h3>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            수거일: {format(request.date, 'PPP', { locale: ko })}
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={request.cafeAvatar} alt={request.cafeName} />
                                <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                                  {request.cafeName.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{request.cafeName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {request.beanType} {request.amount}L
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
                      <Card key={request.id} className="overflow-hidden">
                        <div className="bg-green-50 p-4 flex justify-between items-center border-b">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <h3 className="font-medium">완료된 수거</h3>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            완료일: {format(request.date, 'PPP', { locale: ko })}
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={request.cafeAvatar} alt={request.cafeName} />
                                <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                                  {request.cafeName.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{request.cafeName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {request.beanType} {request.amount}L
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
                      <Card key={request.id} className="overflow-hidden">
                        <div className="bg-red-50 p-4 flex justify-between items-center border-b">
                          <div className="flex items-center gap-3">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <h3 className="font-medium">거절된 신청</h3>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            신청일: {format(request.requestDate, 'PPP', { locale: ko })}
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={request.cafeAvatar} alt={request.cafeName} />
                                <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                                  {request.cafeName.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{request.cafeName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {request.beanType} {request.amount}L
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
        
        {/* 환경 배지 섹션 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>획득한 환경 배지</CardTitle>
            <CardDescription>
              찌꺼기 수거 활동을 통해 획득한 환경 기여 배지입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {ecoReport.badges.map((badge, index) => (
              <div 
                key={index}
                className={`flex flex-col items-center justify-center w-24 h-24 rounded-lg p-3 ${
                  badge.earned 
                    ? 'bg-eco-light border-2 border-eco' 
                    : 'bg-gray-100 border-2 border-gray-200 opacity-50'
                }`}
              >
                <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 ${
                  badge.earned ? 'bg-eco text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {badge.icon}
                </div>
                <span className="text-xs text-center font-medium">
                  {badge.name}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
      
      {/* 요청 상세 정보 대화상자 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedRequest && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>수거 신청 상세 정보</DialogTitle>
              <DialogDescription>
                {format(selectedRequest.requestDate, 'PPP', { locale: ko })}에 신청됨
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedRequest.cafeAvatar} alt={selectedRequest.cafeName} />
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
                <div className="text-sm">{format(selectedRequest.date, 'PPP', { locale: ko })}</div>
                
                <div className="text-sm font-medium">원두 종류:</div>
                <div className="text-sm">{selectedRequest.beanType}</div>
                
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
              
              {selectedRequest.status === 'pending' && (
                <Button 
                  variant="destructive"
                  onClick={() => handleCancelRequest(selectedRequest.id)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  신청 취소
                </Button>
              )}
              
              {selectedRequest.status === 'completed' && (
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
      
      <UserNavbar />
      <Footer />
    </div>
  );
};

export default UserMyPage;
