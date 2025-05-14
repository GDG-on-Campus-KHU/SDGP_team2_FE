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
import { useTranslation } from "react-i18next";

// 찌꺼기 등록 폼 검증 스키마 (date 필드 제거)

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
const CafeGroundsPage = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [grounds, setGrounds] = useState<CoffeeGround[]>([]);
  const [beans, setBeans] = useState<Bean[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const groundFormSchema = z.object({
    amount: z
      .number({
        required_error: t("grounds.validation.amount_required"),
        invalid_type_error: t("grounds.validation.amount_number"),
      })
      .min(0.5, {
        message: t("grounds.validation.amount_min"),
      })
      .max(100, {
        message: t("grounds.validation.amount_max"),
      }),
    beanId: z.string({
      required_error: t("grounds.validation.bean_required"),
    }),
    note: z
      .string()
      .max(200, {
        message: t("grounds.validation.note_max"),
      })
      .optional(),
  });
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

          if (beansResponse.data && beansResponse.data.data) {
            beansData = beansResponse.data.data;
          }
        } catch (error) {
          toast({
            title: t("grounds.beans_loading_failure"),
            description: t("grounds.using_dummy_data"),
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

          if (groundsResponse.data && groundsResponse.data.data) {
            groundsData = groundsResponse.data.data;
          }
        } catch (error) {
          toast({
            title: t("grounds.loading_failure"),
            description: t("grounds.using_dummy_data"),
            duration: 3000,
          });
        }

        // 찌꺼기 데이터 설정
        setGrounds(groundsData);
      } catch (error: unknown) {
        const errorMessage = t("grounds.data_fetch_error");

        setError(errorMessage);

        toast({
          title: t("error.generic_error"),
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
    try {
      // API 요청 데이터 구성
      const groundData = {
        amount: values.amount,
        startDateTime: new Date().toISOString(),
        note: values.note || "",
        beanId: parseInt(values.beanId),
      };

      // API 호출
      let newGround: CoffeeGround;

      try {
        const response = await apiClient.post(
          "/api/coffee_grounds",
          groundData
        );

        if (response.data && response.data.data) {
          newGround = response.data.data;
        }
      } catch (error) {
        toast({
          title: t("grounds.api_connection_failure"),
          description: t("grounds.dummy_data_processing"),
          duration: 3000,
        });
      }

      // 새로 등록된 찌꺼기를 목록에 추가
      setGrounds([newGround, ...grounds]);

      toast({
        title: t("grounds.register_success"),
        description: t("grounds.register_success_desc", {
          amount: values.amount,
        }),
        duration: 3000,
      });

      // 폼 리셋
      form.reset({
        amount: 1,
        beanId: "",
        note: "",
      });
    } catch (error: unknown) {
      toast({
        title: t("grounds.register_failure"),
        description: t("grounds.register_failure_desc"),
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // 찌꺼기 삭제 처리
  const handleDelete = async (groundId: number) => {
    try {
      await apiClient.delete(`/api/coffee_grounds/${groundId}`);

      // 성공 시에도 UI에서 항목 삭제
      setGrounds(grounds.filter((ground) => ground.groundId !== groundId));
    } catch (error) {
      toast({
        title: t("grounds.api_connection_failure"),
        description: t("grounds.server_delete_failure"),
        duration: 3000,
      });

      // 삭제된 찌꺼기를 목록에서 제거
      setGrounds(grounds.filter((ground) => ground.groundId !== groundId));

      toast({
        title: t("grounds.delete_success"),
        description: t("grounds.delete_success_desc"),
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
        return t("grounds.status_waiting");
      case "COLLECTED":
        return t("grounds.status_collected");
      case "EXPIRED":
        return t("grounds.status_expired");
      default:
        return status;
    }
  };

  // 원두 ID로 원두 이름 찾기
  const getBeanNameById = (beanId: number) => {
    const bean = beans.find((bean) => bean.beanId === beanId);
    return bean ? bean.name : t("grounds.bean_id", { id: beanId });
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 text-coffee animate-spin" />
        <span className="ml-2">{t("common.loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-coffee-dark">
        {t("grounds.title")}
      </h2>

      {/* 등록 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>{t("grounds.register_new")}</CardTitle>
          <CardDescription>{t("grounds.register_desc")}</CardDescription>
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
                      <FormLabel>{t("grounds.bean_type")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("grounds.select_bean")}
                            />
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
                              {t("grounds.no_beans")}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t("grounds.bean_register_first")}
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
                      <FormLabel>{t("grounds.amount")}</FormLabel>
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
                          <div className="text-coffee-dark">
                            {t("grounds.liter")}
                          </div>
                        </div>
                      </div>
                      <FormDescription>
                        {t("grounds.espresso_info")}
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
                      <FormLabel>{t("grounds.memo")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("grounds.memo_placeholder")}
                          className="resize-none min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("grounds.memo_desc")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-eco hover:bg-eco-dark">
                {t("grounds.register_button")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 등록된 찌꺼기 목록 */}
      <h3 className="text-xl font-semibold text-coffee-dark mt-8">
        {t("grounds.registered_list")}
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
                          ground?.status === "COLLECTED"
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
                        <span className="text-sm font-medium w-24">
                          {t("grounds.bean")}:
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {getBeanNameById(ground.beanId)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium w-24">
                          {t("grounds.total_amount")}:
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {ground.totalAmount}L
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium w-24">
                          {t("grounds.remaining")}:
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {ground.remainingAmount}L
                        </span>
                      </div>
                      {ground.note && (
                        <div className="flex items-start mt-2">
                          <span className="text-sm font-medium w-24">
                            {t("grounds.memo")}:
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
            <p>{t("grounds.no_grounds")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CafeGroundsPage;
