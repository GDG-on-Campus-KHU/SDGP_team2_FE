
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCircle2, Clock, MoreHorizontal, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 수거 요청 타입 정의
interface CollectionRequest {
  id: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  date: Date;
  requestDate: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  amount: number;
  message?: string;
  contact: string;
  beanType: string;
}

// 모의 수거 요청 데이터
const mockRequests: CollectionRequest[] = [
  {
    id: 1,
    userId: 'user1',
    userName: '김환경',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    date: new Date(2023, 11, 10),
    requestDate: new Date(2023, 11, 5),
    status: 'pending',
    amount: 3.5,
    message: '오전 10시에 수거 가능할까요? 환경 프로젝트에 활용하려고 합니다.',
    contact: '010-1234-5678',
    beanType: '에티오피아 예가체프'
  },
  {
    id: 2,
    userId: 'user2',
    userName: '이그린',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    date: new Date(2023, 11, 8),
    requestDate: new Date(2023, 11, 4),
    status: 'accepted',
    amount: 2.0,
    contact: '010-2345-6789',
    beanType: '콜롬비아 수프리모'
  },
  {
    id: 3,
    userId: 'user3',
    userName: '박에코',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
    date: new Date(2023, 11, 3),
    requestDate: new Date(2023, 11, 1),
    status: 'completed',
    amount: 4.0,
    message: '방향제 만들기 위해 수거합니다. 감사합니다!',
    contact: '010-3456-7890',
    beanType: '브라질 산토스'
  },
  {
    id: 4,
    userId: 'user4',
    userName: '정재활',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4',
    date: new Date(2023, 11, 2),
    requestDate: new Date(2023, 10, 30),
    status: 'rejected',
    amount: 5.0,
    message: '대량으로 퇴비로 활용하려고 합니다.',
    contact: '010-4567-8901',
    beanType: '에티오피아 예가체프'
  },
];

const CafeRequestsPage = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<CollectionRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<CollectionRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // 요청 상태별 필터링
  const pendingRequests = requests.filter(req => req.status === 'pending');
  const acceptedRequests = requests.filter(req => req.status === 'accepted');
  const completedRequests = requests.filter(req => req.status === 'completed');
  const rejectedRequests = requests.filter(req => req.status === 'rejected');
  
  // 수거 요청 상세 보기
  const handleViewRequest = (request: CollectionRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };
  
  // 요청 상태 변경 처리
  const updateRequestStatus = (id: number, newStatus: 'pending' | 'accepted' | 'rejected' | 'completed') => {
    setRequests(
      requests.map(req => 
        req.id === id ? { ...req, status: newStatus } : req
      )
    );
    
    const statusText = 
      newStatus === 'accepted' ? '수락됨' :
      newStatus === 'rejected' ? '거절됨' :
      newStatus === 'completed' ? '완료됨' : '대기 중';
    
    toast({
      title: "상태 변경 완료",
      description: `수거 요청이 ${statusText}으로 변경되었습니다.`,
      duration: 3000,
    });
    
    setIsDialogOpen(false);
  };
  
  // 상태 배지 렌더링
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">대기 중</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">수락됨</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">완료됨</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">거절됨</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-coffee-dark">수거 요청 관리</h2>
        <div className="flex space-x-2">
          <Badge className="bg-yellow-500">{pendingRequests.length} 대기</Badge>
          <Badge className="bg-blue-500">{acceptedRequests.length} 수락</Badge>
          <Badge className="bg-green-500">{completedRequests.length} 완료</Badge>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full max-w-md mb-4">
          <TabsTrigger value="all" className="flex-1">전체</TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">대기 중</TabsTrigger>
          <TabsTrigger value="accepted" className="flex-1">수락됨</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">완료됨</TabsTrigger>
        </TabsList>
        
        {/* 전체 요청 탭 */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>모든 수거 요청</CardTitle>
              <CardDescription>
                모든 수거 요청 내역을 확인하고 관리할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>요청자</TableHead>
                    <TableHead>신청일</TableHead>
                    <TableHead>수거 희망일</TableHead>
                    <TableHead>원두 종류</TableHead>
                    <TableHead>요청량</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map(request => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={request.userAvatar} alt={request.userName} />
                            <AvatarFallback className="bg-coffee-cream text-coffee-dark text-xs">
                              {request.userName.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {request.userName}
                        </div>
                      </TableCell>
                      <TableCell>{format(request.requestDate, 'PP', { locale: ko })}</TableCell>
                      <TableCell>{format(request.date, 'PP', { locale: ko })}</TableCell>
                      <TableCell>{request.beanType}</TableCell>
                      <TableCell>{request.amount}L</TableCell>
                      <TableCell>{renderStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewRequest(request)}>
                              상세 보기
                            </DropdownMenuItem>
                            {request.status === 'pending' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => updateRequestStatus(request.id, 'accepted')}
                                  className="text-blue-600"
                                >
                                  수락하기
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateRequestStatus(request.id, 'rejected')}
                                  className="text-red-600"
                                >
                                  거절하기
                                </DropdownMenuItem>
                              </>
                            )}
                            {request.status === 'accepted' && (
                              <DropdownMenuItem 
                                onClick={() => updateRequestStatus(request.id, 'completed')}
                                className="text-green-600"
                              >
                                완료 처리
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 대기 중 요청 탭 */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>대기 중인 요청</CardTitle>
              <CardDescription>
                처리 대기 중인 수거 요청입니다. 수락 또는 거절을 선택해주세요.
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
                          <h3 className="font-medium">대기 중인 수거 요청</h3>
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
                                <AvatarImage src={request.userAvatar} alt={request.userName} />
                                <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                                  {request.userName.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{request.userName}</div>
                                <div className="text-sm text-muted-foreground">{request.contact}</div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm font-medium">수거 희망일:</div>
                                <div className="text-sm">{format(request.date, 'PPP', { locale: ko })}</div>
                                
                                <div className="text-sm font-medium">원두 종류:</div>
                                <div className="text-sm">{request.beanType}</div>
                                
                                <div className="text-sm font-medium">요청량:</div>
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
                            onClick={() => updateRequestStatus(request.id, 'rejected')}
                          >
                            <X className="mr-1 h-4 w-4" />
                            거절하기
                          </Button>
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => updateRequestStatus(request.id, 'accepted')}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            수락하기
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>대기 중인 수거 요청이 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 수락됨 요청 탭 */}
        <TabsContent value="accepted">
          <Card>
            <CardHeader>
              <CardTitle>수락된 요청</CardTitle>
              <CardDescription>
                수락된 수거 요청 목록입니다. 수거가 완료되면 완료 처리해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {acceptedRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>요청자</TableHead>
                      <TableHead>수거 희망일</TableHead>
                      <TableHead>요청량</TableHead>
                      <TableHead>연락처</TableHead>
                      <TableHead>관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acceptedRequests.map(request => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={request.userAvatar} alt={request.userName} />
                              <AvatarFallback className="bg-coffee-cream text-coffee-dark text-xs">
                                {request.userName.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            {request.userName}
                          </div>
                        </TableCell>
                        <TableCell>{format(request.date, 'PP', { locale: ko })}</TableCell>
                        <TableCell>{request.amount}L</TableCell>
                        <TableCell>{request.contact}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateRequestStatus(request.id, 'completed')}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            완료 처리
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>수락된 수거 요청이 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 완료된 요청 탭 */}
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>완료된 요청</CardTitle>
              <CardDescription>
                수거가 완료된 요청 목록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>요청자</TableHead>
                      <TableHead>수거일</TableHead>
                      <TableHead>원두 종류</TableHead>
                      <TableHead>요청량</TableHead>
                      <TableHead className="text-right">상세</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedRequests.map(request => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={request.userAvatar} alt={request.userName} />
                              <AvatarFallback className="bg-coffee-cream text-coffee-dark text-xs">
                                {request.userName.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            {request.userName}
                          </div>
                        </TableCell>
                        <TableCell>{format(request.date, 'PP', { locale: ko })}</TableCell>
                        <TableCell>{request.beanType}</TableCell>
                        <TableCell>{request.amount}L</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                          >
                            상세보기
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>완료된 수거 요청이 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* 요청 상세 정보 대화상자 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedRequest && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>수거 요청 상세 정보</DialogTitle>
              <DialogDescription>
                {format(selectedRequest.requestDate, 'PPP', { locale: ko })}에 신청된 요청입니다.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedRequest.userAvatar} alt={selectedRequest.userName} />
                  <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                    {selectedRequest.userName.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedRequest.userName}</div>
                  <div className="text-sm text-muted-foreground">{selectedRequest.contact}</div>
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
            
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                닫기
              </Button>
              
              {selectedRequest.status === 'pending' && (
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    거절하기
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => updateRequestStatus(selectedRequest.id, 'accepted')}
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    수락하기
                  </Button>
                </div>
              )}
              
              {selectedRequest.status === 'accepted' && (
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => updateRequestStatus(selectedRequest.id, 'completed')}
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  완료 처리
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default CafeRequestsPage;
