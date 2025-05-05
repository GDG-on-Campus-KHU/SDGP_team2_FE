import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Loader } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import apiClient from "@/api/apiClient";

// 찌꺼기 등록 폼 검증 스키마 (date 필드 제거)
const groundFormSchema = z.object({
  amount: z
    .number({
      required_error: "양을 입력해주세요.",
      invalid_type_error: "양은 숫자여야 합니다.",
    })
    .min(0.5, {
      message: "최소 0.5L 이상이어야 합니다.",
    })
    .max(100, {
      message: "최대 100L까지 입력 가능합니다.",
    }),
  beanId: z.string({
    required_error: "원두 종류를 선택해주세요.",
  }),
  note: z
    .string()
    .max(200, {
      message: "메모는 최대 200자까지 입력 가능합니다.",
    })
    .optional(),
});

// 원두 타입 정의
interface Bean {
  beanId: number;
  name: string;
  origin: string;
  description: string;
}

// 찌꺼기 타입 정의
interface CoffeeGround {
  groundId: number;
  date: string;
  totalAmount: number;
  startDateTime: string;
  remainingAmount: number;
  note: string;
  status: string;
  cafeId: number;
  beanId: number;
}

// 원두 더미 데이터
const dummyBeans: Bean[] = [
  {
    beanId: 1,
    name: "에티오피아 예가체프",
    origin: "에티오피아",
    description: "과일향, 감귤류 산미가 특징인 원두",
  },
  {
    beanId: 2,
    name: "콜롬비아 수프리모",
    origin: "콜롬비아",
    description: "견과류 향과 초콜릿 풍미가 특징인 원두",
  },
  {
    beanId: 3,
    name: "브라질 산토스",
    origin: "브라질",
    description: "고소하고 달콤한 맛이 특징인 원두",
  },
  {
    beanId: 4,
    name: "과테말라 안티구아",
    origin: "과테말라",
    description: "스모키한 향과 중간 산미가 특징인 원두",
  },
];

// 찌꺼기 더미 데이터
const dummyGrounds: CoffeeGround[] = [
  {
    groundId: 1,
    date: new Date().toISOString(),
    totalAmount: 3.5,
    remainingAmount: 3.5,
    note: "아침 영업 후 수거, 습도 적당함",
    status: "WAITING",
    cafeId: 1,
    beanId: 1,
  },
  {
    groundId: 2,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 전
    totalAmount: 4.2,
    remainingAmount: 2.0,
    note: "오후 3시경 수거",
    status: "WAITING",
    cafeId: 1,
    beanId: 2,
  },
  {
    groundId: 3,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 전
    totalAmount: 2.8,
    remainingAmount: 0,
    note: "",
    status: "COLLECTED",
    cafeId: 1,
    beanId: 3,
  },
];

const CafeGroundsPage = () => {
  const { toast } = useToast();
  const [grounds, setGrounds] = useState<CoffeeGround[]>([]);
  const [beans, setBeans] = useState<Bean[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 폼 초기화
  const form = useForm<z.infer<typeof groundFormSchema>>({
    resolver: zodResolver(groundFormSchema),
    defaultValues: {
      amount: 1,
      beanId: "",
      note: "",
    },
  });

  // 원두 목록과 찌꺼기 목록 가져오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 원두 목록 가져오기
        let beansData: Bean[] = [];
        try {
          const beansResponse = await apiClient.get("/api/beans");
          console.log("[디버깅] 원두 목록 조회 성공:", beansResponse.data);

          if (beansResponse.data && beansResponse.data.data) {
            beansData = beansResponse.data.data;
          } else {
            console.warn(
              "[디버깅] 원두 목록 응답에 data가 없습니다. 더미 데이터를 사용합니다."
            );
            beansData = dummyBeans;
          }
        } catch (error) {
          console.error(
            "[디버깅] 원두 목록 조회 실패. 더미 데이터를 사용합니다:",
            error
          );
          beansData = dummyBeans;

          toast({
            title: "원두 목록 로딩 실패",
            description: "더미 데이터를 사용합니다.",
            duration: 3000,
          });
        }

        // 원두 데이터 설정
        setBeans(beansData);

        // 찌꺼기 목록 가져오기
        let groundsData: CoffeeGround[] = [];
        try {
          const groundsResponse = await apiClient.get(
            "/api/cafe/coffee_grounds"
          );
          console.log("[디버깅] 찌꺼기 목록 조회 성공:", groundsResponse.data);

          if (groundsResponse.data && groundsResponse.data.data) {
            groundsData = groundsResponse.data.data;
          } else {
            console.warn(
              "[디버깅] 찌꺼기 목록 응답에 data가 없습니다. 더미 데이터를 사용합니다."
            );
            groundsData = dummyGrounds;
          }
        } catch (error) {
          console.error(
            "[디버깅] 찌꺼기 목록 조회 실패. 더미 데이터를 사용합니다:",
            error
          );
          groundsData = dummyGrounds;

          toast({
            title: "찌꺼기 목록 로딩 실패",
            description: "더미 데이터를 사용합니다.",
            duration: 3000,
          });
        }

        // 찌꺼기 데이터 설정
        setGrounds(groundsData);
      } catch (error: any) {
        console.error("[디버깅] 데이터 조회 중 예상치 못한 오류:", error);

        // 모든 API가 실패한 경우에도 더미 데이터 사용
        setBeans(dummyBeans);
        setGrounds(dummyGrounds);

        const errorMessage =
          "데이터를 가져오는 중 오류가 발생했습니다. 더미 데이터를 사용합니다.";

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

    fetchData();
  }, [toast]);

  // 슬라이더 값 변경 처리
  const handleSliderChange = (value: number[]) => {
    form.setValue("amount", value[0]);
  };

  // 폼 제출 처리
  const onSubmit = async (values: z.infer<typeof groundFormSchema>) => {
    console.log("폼 제출 시작:", values);

    try {
      // API 요청 데이터 구성
      const groundData = {
        amount: values.amount,
        startDateTime: new Date().toISOString(),
        note: values.note || "",
        beanId: parseInt(values.beanId),
      };

      console.log("API 요청 데이터:", groundData);

      // API 호출
      let newGround: CoffeeGround;

      try {
        const response = await apiClient.post(
          "/api/coffee_grounds",
          groundData
        );
        console.log("[디버깅] 찌꺼기 등록 성공:", response.data);

        if (response.data && response.data.data) {
          newGround = response.data.data;
        } else {
          // API는 성공했지만 데이터가 없는 경우 더미 데이터 생성
          console.warn(
            "[디버깅] 찌꺼기 등록 응답에 data가 없습니다. 더미 데이터를 생성합니다."
          );
          newGround = {
            groundId: Date.now(),
            date: new Date().toISOString(),
            totalAmount: values.amount,
            remainingAmount: values.amount,
            note: values.note || "",
            status: "WAITING",
            cafeId: 1,
            beanId: parseInt(values.beanId),
          };
        }
      } catch (error) {
        console.error(
          "[디버깅] 찌꺼기 등록 API 실패. 더미 데이터를 생성합니다:",
          error
        );

        // API 실패 시 더미 데이터 생성
        newGround = {
          groundId: Date.now(),
          date: new Date().toISOString(),
          totalAmount: values.amount,
          remainingAmount: values.amount,
          note: values.note || "",
          status: "WAITING",
          cafeId: 1,
          beanId: parseInt(values.beanId),
        };

        toast({
          title: "API 연결 실패",
          description: "API 연결에 실패했지만 더미 데이터로 처리합니다.",
          duration: 3000,
        });
      }

      // 새로 등록된 찌꺼기를 목록에 추가
      setGrounds([newGround, ...grounds]);

      toast({
        title: "찌꺼기 등록 완료",
        description: `${values.amount}L의 찌꺼기가 등록되었습니다.`,
        duration: 3000,
      });

      // 폼 리셋
      form.reset({
        amount: 1,
        beanId: "",
        note: "",
      });
    } catch (error: any) {
      console.error("[디버깅] 찌꺼기 등록 처리 중 예상치 못한 오류:", error);

      let errorMessage = "찌꺼기 등록 중 오류가 발생했습니다.";

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }

      toast({
        title: "찌꺼기 등록 실패",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // 찌꺼기 삭제 처리
  const handleDelete = async (groundId: number) => {
    try {
      await apiClient.delete(`/api/coffee_grounds/${groundId}`);
      console.log("[디버깅] 찌꺼기 삭제 성공:", groundId);

      // 성공 시에도 UI에서 항목 삭제
      setGrounds(grounds.filter((ground) => ground.groundId !== groundId));
    } catch (error) {
      console.error(
        "[디버깅] 찌꺼기 삭제 API 실패. 클라이언트에서만 삭제합니다:",
        error
      );

      toast({
        title: "API 연결 실패",
        description: "서버에서 삭제하지 못했지만 화면에서 항목을 제거합니다.",
        duration: 3000,
      });

      // 삭제된 찌꺼기를 목록에서 제거
      setGrounds(grounds.filter((ground) => ground.groundId !== groundId));

      toast({
        title: "삭제 완료",
        description: "선택한 찌꺼기 등록이 삭제되었습니다.",
        duration: 3000,
      });
    }
  };

  // 상태에 따른 UI 클래스
  const getStatusClass = (status: string) => {
    switch (status) {
      case "WAITING":
        return "bg-yellow-500";
      case "COLLECTED":
        return "bg-green-500";
      case "EXPIRED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // 상태에 따른 한글 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case "WAITING":
        return "수거 대기";
      case "COLLECTED":
        return "수거 완료";
      case "EXPIRED":
        return "기간 만료";
      default:
        return status;
    }
  };

  // 원두 ID로 원두 이름 찾기
  const getBeanNameById = (beanId: number) => {
    const bean = beans.find((bean) => bean.beanId === beanId);
    return bean ? bean.name : `원두 ID: ${beanId}`;
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 text-coffee animate-spin" />
        <span className="ml-2">데이터를 불러오는 중입니다...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-coffee-dark">찌꺼기 등록</h2>

      {/* 등록 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>새 찌꺼기 등록</CardTitle>
          <CardDescription>
            오늘 발생한 커피 찌꺼기를 등록해주세요. 등록된 정보는 수거 신청시
            사용됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* 원두 종류 필드 */}
                <FormField
                  control={form.control}
                  name="beanId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>원두 종류</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="원두 종류 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {beans.length > 0 ? (
                            beans.map((bean) => (
                              <SelectItem
                                key={bean.beanId}
                                value={bean.beanId.toString()}
                              >
                                {bean.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              등록된 원두가 없습니다
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        등록하지 않은 원두는 원두 관리 페이지에서 먼저
                        등록해주세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 찌꺼기 양 필드 */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>찌꺼기 양 (L)</FormLabel>
                      <div className="space-y-4">
                        <Slider
                          defaultValue={[field.value]}
                          max={10}
                          min={0.5}
                          step={0.5}
                          onValueChange={handleSliderChange}
                          className="py-4"
                        />
                        <div className="flex justify-between items-center">
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                              className="w-20"
                              step={0.5}
                              min={0.5}
                              max={100}
                            />
                          </FormControl>
                          <div className="text-coffee-dark">리터 (L)</div>
                        </div>
                      </div>
                      <FormDescription>
                        일반적으로 에스프레소 한 잔에는 약 20g의 원두가
                        사용되며, 1L 용량의 찌꺼기는 약 50잔에 해당합니다.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 메모 필드 */}
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>메모 (선택사항)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="특이사항이 있다면 메모해주세요."
                          className="resize-none min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        찌꺼기의 상태나 보관 정보 등 특이사항을 메모할 수
                        있습니다.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-eco hover:bg-eco-dark">
                찌꺼기 등록하기
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 등록된 찌꺼기 목록 */}
      <h3 className="text-xl font-semibold text-coffee-dark mt-8">
        등록된 찌꺼기 목록
      </h3>
      <div className="space-y-4">
        {grounds.length > 0 ? (
          grounds.map((ground) => (
            <Card key={ground.groundId} className="relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full w-1 ${getStatusClass(
                  ground.status
                )}`}
              />
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-medium text-coffee-dark">
                        {ground.startDateTime.split("T")[0]}
                        {/* {format(new Date(ground.), "PPP", { locale: ko })} */}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          ground.status === "COLLECTED"
                            ? "bg-green-100 text-green-800"
                            : ground.status === "WAITING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {getStatusText(ground.status)}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium w-24">원두:</span>
                        <span className="text-sm text-muted-foreground">
                          {getBeanNameById(ground.beanId)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium w-24">총량:</span>
                        <span className="text-sm text-muted-foreground">
                          {ground.totalAmount}L
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium w-24">
                          남은 양:
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {ground.remainingAmount}L
                        </span>
                      </div>
                      {ground.note && (
                        <div className="flex items-start mt-2">
                          <span className="text-sm font-medium w-24">
                            메모:
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {ground.note}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(ground.groundId)}
                    disabled={ground.status === "COLLECTED"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>등록된 찌꺼기가 없습니다. 새로운 찌꺼기를 등록해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CafeGroundsPage;
