import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Coffee, ImagePlus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import apiClient from "@/api/apiClient";

// 원두 정보 검증 스키마
const beanFormSchema = z.object({
  name: z.string().min(2, {
    message: "원두 이름은 최소 2자 이상이어야 합니다.",
  }),
  origin: z.string().min(2, {
    message: "원산지는 최소 2자 이상이어야 합니다.",
  }),
  description: z.string().max(500, {
    message: "설명은 최대 500자까지 입력 가능합니다.",
  }),
});

// 모의 기존 원두 데이터
const mockBeans = [
  {
    beanId: 1,
    name: "에티오피아 예가체프",
    origin: "에티오피아",
    description:
      "꽃향기와 감귤류의 산미가 특징인 에티오피아 예가체프입니다. 밝은 산미와 달콤한 과일향이 조화롭게 어우러집니다.",
  },
  {
    beanId: 2,
    name: "콜롬비아 수프리모",
    origin: "콜롬비아",
    description:
      "견과류의 고소함과 초콜릿 풍미가 특징인 콜롬비아 수프리모입니다. 균형 잡힌 바디감과 부드러운 산미를 가집니다.",
  },
];

const CafeBeansPage = () => {
  const { toast } = useToast();
  const [beans, setBeans] = useState([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 폼 초기화
  const form = useForm<z.infer<typeof beanFormSchema>>({
    resolver: zodResolver(beanFormSchema),
    defaultValues: {
      name: "",
      origin: "",
      description: "",
    },
  });

  // 폼 제출 처리
  const onSubmit = async (values: z.infer<typeof beanFormSchema>) => {
    try {
      console.log(values);
      const response = await apiClient.post("/api/beans", values);

      console.log("[디버깅] 원두 등록 성공 :", response.data);

      if (response.data && response.data.data) {
        setBeans((prevBeans) => [...prevBeans, response.data.data]);
      }
    } catch (error: any) {
      console.error("[디버깅] 픽업 리스트 조회 오류:", error);

      toast({
        title: "픽업 리스트 정보 로딩 실패",
        description: "픽업 리스트 정보를 가져오지 못했습니다",
        variant: "destructive",
        duration: 3000,
      });
    }
    // 폼 초기화
    form.reset();

    toast({
      title: "원두 등록 완료",
      description: `${values.name} 원두가 성공적으로 등록되었습니다.`,
      duration: 3000,
    });
  };

  // 원두 삭제 처리
  const handleDelete = async (id: number) => {
    //setBeans(beans.filter((bean) => bean.beanId !== id));

    try {
      const response = await apiClient.delete(`/api/beans/${id}`);

      console.log("[디버깅] 원두 삭제 성공 :", response.data);
      if (response.status == 200) {
        setBeans((prevBeans) => prevBeans.filter((bean) => bean.beanId !== id));
        toast({
          title: "원두 삭제 완료",
          description: "선택한 원두가 삭제되었습니다.",
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.log("[디버깅] 원두 삭제 오류 :", error);

      toast({
        title: "원두 삭제 실패",
        description: "선택한 원두 삭제에 실패하였습니다.",
        duration: 3000,
      });
    }
  };

  // 원두 조회
  useEffect(() => {
    const fetchBeans = async () => {
      try {
        const response = await apiClient.get("/api/beans");

        console.log("[디버깅] 원두 목록 조회 성공 :", response.data);

        if (response.data && response.data.data) {
          setBeans(response.data.data);
        }
      } catch (error: any) {
        console.error("[디버깅] 원두 리스트 조회 오류:", error);

        setBeans(mockBeans);

        toast({
          title: "원두 리스트 정보 로딩 실패",
          description: "원두 리스트 정보를 가져오지 못했습니다",
          variant: "destructive",
          duration: 3000,
        });
      }
    };

    fetchBeans();
  }, []);
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-coffee-dark">원두 관리</h2>

      {/* 원두 등록 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>새 원두 등록</CardTitle>
          <CardDescription>
            카페에서 사용하는 원두 정보를 등록해주세요. 등록된 원두 정보는 수거
            신청 시 함께 제공됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>원두 이름</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="예: 에티오피아 예가체프"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>원산지</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 에티오피아" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>상세 설명</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="원두의 맛과 향, 특징 등을 자세히 설명해주세요."
                            className="resize-none min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="bg-coffee hover:bg-coffee-dark w-full"
              >
                원두 등록하기
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 등록된 원두 목록 */}
      <h3 className="text-xl font-semibold text-coffee-dark mt-8">
        등록된 원두 목록
      </h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {beans.map((bean) => (
          <Card key={bean.beanId} className="overflow-hidden">
            <div className="h-40 bg-gray-100 relative">
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleDelete(bean.beanId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Coffee className="h-5 w-5 text-coffee" />
                <CardTitle className="text-lg">{bean.name}</CardTitle>
              </div>
              <CardDescription>{bean.origin} | </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {bean.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CafeBeansPage;
