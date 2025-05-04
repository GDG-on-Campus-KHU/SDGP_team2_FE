import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  Clock,
  MoreHorizontal,
  X,
  XCircle,
  Loader,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import apiClient from "@/api/apiClient";

// 수거 요청 타입 정의
interface PickupRequest {
  requesterName: string;
  requestDate: string;
  pickupDate: string;
  beanName: string;
  amount: number;
  status: string;
  pickupId?: number; // API에 없지만 클라이언트에서 필요한 고유 식별자
}

// 더미 데이터
const dummyRequests: PickupRequest[] = [
  {
    pickupId: 1,
    requesterName: "김환경",
    requestDate: "2025-05-01",
    pickupDate: "2025-05-10",
    beanName: "에티오피아 예가체프",
    amount: 3.5,
    status: "PENDING",
  },
  {
    pickupId: 2,
    requesterName: "이그린",
    requestDate: "2025-05-02",
    pickupDate: "2025-05-08",
    beanName: "콜롬비아 수프리모",
    amount: 2.0,
    status: "ACCEPTED",
  },
  {
    pickupId: 3,
    requesterName: "박에코",
    requestDate: "2025-04-28",
    pickupDate: "2025-05-03",
    beanName: "브라질 산토스",
    amount: 4.0,
    status: "COMPLETED",
  },
  {
    pickupId: 4,
    requesterName: "정재활",
    requestDate: "2025-04-25",
    pickupDate: "2025-05-02",
    beanName: "에티오피아 예가체프",
    amount: 5.0,
    status: "REJECTED",
  },
  {
    pickupId: 5,
    requesterName: "최친환",
    requestDate: "2025-05-03",
    pickupDate: "2025-05-12",
    beanName: "과테말라 안티구아",
    amount: 2.5,
    status: "PENDING",
  },
  {
    pickupId: 6,
    requesterName: "이재활",
    requestDate: "2025-05-02",
    pickupDate: "2025-05-09",
    beanName: "케냐 AA",
    amount: 3.0,
    status: "ACCEPTED",
  },
];

const CafeRequestsPage = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 요청 상태별 필터링
  const pendingRequests = requests.filter((req) => req.status === "PENDING");
  const acceptedRequests = requests.filter((req) => req.status === "ACCEPTED");
  const completedRequests = requests.filter(
    (req) => req.status === "COMPLETED"
  );
  const rejectedRequests = requests.filter((req) => req.status === "REJECTED");

  // 수거 요청 목록 가져오기
  useEffect(() => {
    const fetchPickupRequests = async () => {
      setLoading(true);
      setError(null);

      try {
        // 모든 상태의 요청 데이터를 병렬로 가져오기
        const statuses = ["PENDING", "ACCEPTED", "COMPLETED", "REJECTED"];

        // 모든 요청을 병렬로 실행
        const requestPromises = statuses.map((status) =>
          apiClient
            .get("/api/cafe/pickups")
            .then((response) => {
              console.log(`[디버깅] ${status} 요청 조회 성공:`, response.data);
              if (response.data && response.data.data) {
                // API에서 고유 ID를 제공하지 않으므로 임의의 ID 부여
                return response.data.data.map(
                  (item: PickupRequest, index: number) => ({
                    ...item,
                    pickupId: Date.now() + index, // 임시 ID 생성
                  })
                );
              }
              return [];
            })
            .catch((error) => {
              console.error(`[디버깅] ${status} 요청 조회 실패:`, error);
              return [];
            })
        );

        // 모든 요청 기다리기
        const results = await Promise.all(requestPromises);

        // 결과 합치기
        const allRequests = results.flat();

        if (allRequests.length > 0) {
          setRequests(allRequests);
        } else {
          // 모든 API 요청이 실패했거나 결과가 없는 경우 더미 데이터 사용
          console.warn(
            "[디버깅] 모든 API 요청이 실패했거나 결과가 없습니다. 더미 데이터를 사용합니다."
          );
          setRequests(dummyRequests);

          toast({
            title: "데이터 로딩 알림",
            description: "더미 데이터를 사용합니다.",
            duration: 3000,
          });
        }
      } catch (error: any) {
        console.error("[디버깅] 수거 요청 조회 중 예상치 못한 오류:", error);

        // API가 실패한 경우 더미 데이터 사용
        setRequests(dummyRequests);

        const errorMessage =
          "수거 요청을 가져오는 중 오류가 발생했습니다. 더미 데이터를 사용합니다.";

        setError(errorMessage);

        toast({
          title: "데이터 로딩 실패",
          description: errorMessage,
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPickupRequests();
  }, [toast]);

  // 수거 요청 상세 보기
  const handleViewRequest = (request: PickupRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  // 요청 상태 변경 처리
  const updateRequestStatus = async (
    pickupId: number | undefined,
    newStatus: string
  ) => {
    if (!pickupId) {
      console.error("[디버깅] 요청 ID가 없습니다.");
      return;
    }

    try {
      // 클라이언트 상태 업데이트 (미리 업데이트하여 UI 반응성 향상)
      setRequests(
        requests.map((req) =>
          req.pickupId === pickupId ? { ...req, status: newStatus } : req
        )
      );

      // API 호출하여 상태 변경
      try {
        // API 엔드포인트는 실제 백엔드 API에 맞게 수정 필요
        await apiClient.put(`/api/cafe/pickups/${pickupId}/status`, {
          status: newStatus,
        });

        console.log(
          `[디버깅] 요청 상태 변경 성공: ID=${pickupId}, 상태=${newStatus}`
        );
      } catch (error) {
        console.error(
          `[디버깅] 요청 상태 변경 API 실패: ID=${pickupId}, 상태=${newStatus}`,
          error
        );

        toast({
          title: "API 연결 실패",
          description:
            "서버에 상태 변경을 저장하지 못했지만 화면에는 반영되었습니다.",
          duration: 3000,
        });
      }

      const statusText =
        newStatus === "ACCEPTED"
          ? "수락됨"
          : newStatus === "REJECTED"
          ? "거절됨"
          : newStatus === "COMPLETED"
          ? "완료됨"
          : "대기 중";

      toast({
        title: "상태 변경 완료",
        description: `수거 요청이 ${statusText}으로 변경되었습니다.`,
        duration: 3000,
      });

      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("[디버깅] 요청 상태 변경 중 예상치 못한 오류:", error);

      const errorMessage = "요청 상태 변경 중 오류가 발생했습니다.";

      toast({
        title: "상태 변경 실패",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // 상태 배지 렌더링
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-700 bg-yellow-50"
          >
            대기 중
          </Badge>
        );
      case "ACCEPTED":
        return (
          <Badge
            variant="outline"
            className="border-blue-500 text-blue-700 bg-blue-50"
          >
            수락됨
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="border-green-500 text-green-700 bg-green-50"
          >
            완료됨
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="border-red-500 text-red-700 bg-red-50"
          >
            거절됨
          </Badge>
        );
      default:
        return null;
    }
  };

  // 상태에 따른 한글 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "대기 중";
      case "ACCEPTED":
        return "수락됨";
      case "COMPLETED":
        return "완료됨";
      case "REJECTED":
        return "거절됨";
      default:
        return status;
    }
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 text-coffee animate-spin" />
        <span className="ml-2">수거 요청을 불러오는 중입니다...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-coffee-dark">수거 요청 관리</h2>
        <div className="flex space-x-2">
          <Badge className="bg-yellow-500">{pendingRequests.length} 대기</Badge>
          <Badge className="bg-blue-500">{acceptedRequests.length} 수락</Badge>
          <Badge className="bg-green-500">
            {completedRequests.length} 완료
          </Badge>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full max-w-md mb-4">
          <TabsTrigger value="all" className="flex-1">
            전체
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">
            대기 중
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex-1">
            수락됨
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            완료됨
          </TabsTrigger>
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
                  {requests.map((request) => (
                    <TableRow key={request.pickupId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.requesterName}`}
                              alt={request.requesterName}
                            />
                            <AvatarFallback className="bg-coffee-cream text-coffee-dark text-xs">
                              {request.requesterName.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {request.requesterName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.requestDate), "PP", {
                          locale: ko,
                        })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.pickupDate), "PP", {
                          locale: ko,
                        })}
                      </TableCell>
                      <TableCell>{request.beanName}</TableCell>
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
                            <DropdownMenuItem
                              onClick={() => handleViewRequest(request)}
                            >
                              상세 보기
                            </DropdownMenuItem>
                            {request.status === "PENDING" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateRequestStatus(
                                      request.pickupId,
                                      "ACCEPTED"
                                    )
                                  }
                                  className="text-blue-600"
                                >
                                  수락하기
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateRequestStatus(
                                      request.pickupId,
                                      "REJECTED"
                                    )
                                  }
                                  className="text-red-600"
                                >
                                  거절하기
                                </DropdownMenuItem>
                              </>
                            )}
                            {request.status === "ACCEPTED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateRequestStatus(
                                    request.pickupId,
                                    "COMPLETED"
                                  )
                                }
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
                  {pendingRequests.map((request) => (
                    <Card key={request.pickupId} className="overflow-hidden">
                      <div className="bg-yellow-50 p-4 flex justify-between items-center border-b">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-yellow-600" />
                          <h3 className="font-medium">대기 중인 수거 요청</h3>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          신청일:{" "}
                          {format(new Date(request.requestDate), "PPP", {
                            locale: ko,
                          })}
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <div className="flex justify-between">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.requesterName}`}
                                  alt={request.requesterName}
                                />
                                <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                                  {request.requesterName.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {request.requesterName}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm font-medium">
                                  수거 희망일:
                                </div>
                                <div className="text-sm">
                                  {format(new Date(request.pickupDate), "PPP", {
                                    locale: ko,
                                  })}
                                </div>

                                <div className="text-sm font-medium">
                                  원두 종류:
                                </div>
                                <div className="text-sm">
                                  {request.beanName}
                                </div>

                                <div className="text-sm font-medium">
                                  요청량:
                                </div>
                                <div className="text-sm">{request.amount}L</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                          <Button
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() =>
                              updateRequestStatus(request.pickupId, "REJECTED")
                            }
                          >
                            <X className="mr-1 h-4 w-4" />
                            거절하기
                          </Button>
                          <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() =>
                              updateRequestStatus(request.pickupId, "ACCEPTED")
                            }
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
                      <TableHead>원두 종류</TableHead>
                      <TableHead>관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acceptedRequests.map((request) => (
                      <TableRow key={request.pickupId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.requesterName}`}
                                alt={request.requesterName}
                              />
                              <AvatarFallback className="bg-coffee-cream text-coffee-dark text-xs">
                                {request.requesterName.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            {request.requesterName}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.pickupDate), "PP", {
                            locale: ko,
                          })}
                        </TableCell>
                        <TableCell>{request.amount}L</TableCell>
                        <TableCell>{request.beanName}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              updateRequestStatus(request.pickupId, "COMPLETED")
                            }
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
              <CardDescription>수거가 완료된 요청 목록입니다.</CardDescription>
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
                    {completedRequests.map((request) => (
                      <TableRow key={request.pickupId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.requesterName}`}
                                alt={request.requesterName}
                              />
                              <AvatarFallback className="bg-coffee-cream text-coffee-dark text-xs">
                                {request.requesterName.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            {request.requesterName}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.pickupDate), "PP", {
                            locale: ko,
                          })}
                        </TableCell>
                        <TableCell>{request.beanName}</TableCell>
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
                {format(new Date(selectedRequest.requestDate), "PPP", {
                  locale: ko,
                })}
                에 신청된 요청입니다.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedRequest.requesterName}`}
                    alt={selectedRequest.requesterName}
                  />
                  <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                    {selectedRequest.requesterName.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {selectedRequest.requesterName}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="text-sm font-medium">상태:</div>
                <div>{renderStatusBadge(selectedRequest.status)}</div>

                <div className="text-sm font-medium">수거 희망일:</div>
                <div className="text-sm">
                  {format(new Date(selectedRequest.pickupDate), "PPP", {
                    locale: ko,
                  })}
                </div>

                <div className="text-sm font-medium">원두 종류:</div>
                <div className="text-sm">{selectedRequest.beanName}</div>

                <div className="text-sm font-medium">요청량:</div>
                <div className="text-sm">{selectedRequest.amount}L</div>
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                닫기
              </Button>

              {selectedRequest.status === "PENDING" && (
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() =>
                      updateRequestStatus(selectedRequest.pickupId, "REJECTED")
                    }
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    거절하기
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() =>
                      updateRequestStatus(selectedRequest.pickupId, "ACCEPTED")
                    }
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    수락하기
                  </Button>
                </div>
              )}

              {selectedRequest.status === "ACCEPTED" && (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() =>
                    updateRequestStatus(selectedRequest.pickupId, "COMPLETED")
                  }
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
