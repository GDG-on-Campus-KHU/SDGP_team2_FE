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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
        // 한 번만 API 호출
        const response = await apiClient.get("/api/cafe/pickups");

        console.log(`[디버깅] 요청 조회 성공:`, response.data);

        if (
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          setRequests(response.data.data);
        }
      } catch (error: unknown) {
        console.error("[디버깅] 수거 요청 조회 중 예상치 못한 오류:", error);

        toast({
          title: t("error.generic_error"),
          description: t("cafe.requests_loading_failure"),
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
        await apiClient.put(`/api/pickups/${pickupId}/status`, {
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
          title: t("cafe.api_connection_failure"),
          description: t("cafe.status_change_saved_ui"),
          duration: 3000,
        });
      }

      const statusText = getStatusText(newStatus);

      toast({
        title: t("cafe.status_change_success"),
        description: t("cafe.status_change_success_desc", {
          status: statusText,
        }),
        duration: 3000,
      });

      setIsDialogOpen(false);
    } catch (error: unknown) {
      console.error("[디버깅] 요청 상태 변경 중 예상치 못한 오류:", error);

      toast({
        title: t("cafe.status_change_failure"),
        description: t("cafe.status_change_failure_desc"),
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
            {t("mypage.pending")}
          </Badge>
        );
      case "ACCEPTED":
        return (
          <Badge
            variant="outline"
            className="border-blue-500 text-blue-700 bg-blue-50"
          >
            {t("mypage.accepted")}
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="border-green-500 text-green-700 bg-green-50"
          >
            {t("mypage.completed")}
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="border-red-500 text-red-700 bg-red-50"
          >
            {t("mypage.rejected")}
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

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 text-coffee animate-spin" />
        <span className="ml-2">{t("cafe.loading_requests")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-coffee-dark">
          {t("cafe.requests")}
        </h2>
        <div className="flex space-x-2">
          <Badge className="bg-yellow-500">
            {pendingRequests.length} {t("cafe.pending_count")}
          </Badge>
          <Badge className="bg-blue-500">
            {acceptedRequests.length} {t("cafe.accepted_count")}
          </Badge>
          <Badge className="bg-green-500">
            {completedRequests.length} {t("cafe.completed_count")}
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
            {t("market.all")}
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">
            {t("mypage.pending")}
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex-1">
            {t("mypage.accepted")}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            {t("mypage.completed")}
          </TabsTrigger>
        </TabsList>

        {/* 전체 요청 탭 */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>{t("cafe.all_requests")}</CardTitle>
              <CardDescription>{t("cafe.all_requests_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("cafe.requester")}</TableHead>
                    <TableHead>{t("cafe.request_date")}</TableHead>
                    <TableHead>{t("cafe.pickup_date")}</TableHead>
                    <TableHead>{t("cafe.bean_type")}</TableHead>
                    <TableHead>{t("cafe.amount")}</TableHead>
                    <TableHead>{t("cafe.status")}</TableHead>
                    <TableHead className="text-right">
                      {t("cafe.manage")}
                    </TableHead>
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
                              {t("cafe.view_detail")}
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
                                  {t("cafe.accept")}
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
                                  {t("cafe.reject")}
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
                                {t("cafe.complete")}
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
              <CardTitle>{t("cafe.pending_requests")}</CardTitle>
              <CardDescription>{t("cafe.pending_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.pickupId} className="overflow-hidden">
                      <div className="bg-yellow-50 p-4 flex justify-between items-center border-b">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-yellow-600" />
                          <h3 className="font-medium">
                            {t("cafe.pending_requests")}
                          </h3>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t("cafe.request_date")}:{" "}
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
                                  {t("cafe.pickup_date")}:
                                </div>
                                <div className="text-sm">
                                  {format(new Date(request.pickupDate), "PPP", {
                                    locale: ko,
                                  })}
                                </div>

                                <div className="text-sm font-medium">
                                  {t("cafe.bean_type")}:
                                </div>
                                <div className="text-sm">
                                  {request.beanName}
                                </div>

                                <div className="text-sm font-medium">
                                  {t("cafe.amount")}:
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
                            {t("cafe.reject")}
                          </Button>
                          <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() =>
                              updateRequestStatus(request.pickupId, "ACCEPTED")
                            }
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            {t("cafe.accept")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>{t("cafe.no_pending")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 수락됨 요청 탭 */}
        <TabsContent value="accepted">
          <Card>
            <CardHeader>
              <CardTitle>{t("cafe.accepted_requests")}</CardTitle>
              <CardDescription>{t("cafe.accepted_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {acceptedRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("cafe.requester")}</TableHead>
                      <TableHead>{t("cafe.pickup_date")}</TableHead>
                      <TableHead>{t("cafe.amount")}</TableHead>
                      <TableHead>{t("cafe.bean_type")}</TableHead>
                      <TableHead>{t("cafe.manage")}</TableHead>
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
                            {t("cafe.complete")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>{t("cafe.no_accepted")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 완료된 요청 탭 */}
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>{t("cafe.completed_requests")}</CardTitle>
              <CardDescription>{t("cafe.completed_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {completedRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("cafe.requester")}</TableHead>
                      <TableHead>{t("cafe.pickup_date")}</TableHead>
                      <TableHead>{t("cafe.bean_type")}</TableHead>
                      <TableHead>{t("cafe.amount")}</TableHead>
                      <TableHead className="text-right">
                        {t("cafe.view_detail")}
                      </TableHead>
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
                            {t("cafe.view_detail")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>{t("cafe.no_completed")}</p>
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
              <DialogTitle>{t("cafe.request_detail")}</DialogTitle>
              <DialogDescription>
                {t("cafe.requested_on", {
                  date: format(new Date(selectedRequest.requestDate), "PPP", {
                    locale: ko,
                  }),
                })}
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
                <div className="text-sm font-medium">{t("cafe.status")}:</div>
                <div>{renderStatusBadge(selectedRequest.status)}</div>

                <div className="text-sm font-medium">
                  {t("cafe.pickup_date")}:
                </div>
                <div className="text-sm">
                  {format(new Date(selectedRequest.pickupDate), "PPP", {
                    locale: ko,
                  })}
                </div>

                <div className="text-sm font-medium">
                  {t("cafe.bean_type")}:
                </div>
                <div className="text-sm">{selectedRequest.beanName}</div>

                <div className="text-sm font-medium">{t("cafe.amount")}:</div>
                <div className="text-sm">{selectedRequest.amount}L</div>
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t("common.close")}
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
                    {t("cafe.reject")}
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() =>
                      updateRequestStatus(selectedRequest.pickupId, "ACCEPTED")
                    }
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    {t("cafe.accept")}
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
                  {t("cafe.complete")}
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
