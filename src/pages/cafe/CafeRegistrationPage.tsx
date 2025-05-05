// src/pages/cafe/CafeRegistrationPage.tsx
import React, { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Coffee, ImagePlus, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import apiClient from "@/api/apiClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Cafe registration validation schema
const cafeFormSchema = z.object({
  name: z.string().min(2, {
    message: "카페 이름은 최소 2자 이상이어야 합니다.",
  }),
  address: z.string().min(5, {
    message: "주소는 최소 5자 이상이어야 합니다.",
  }),
  detailAddress: z.string().optional(),
  phone: z.string().min(10, {
    message: "연락처는 최소 10자 이상이어야 합니다.",
  }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  openHours: z.string().min(2, {
    message: "운영 시간을 입력해주세요.",
  }),
  description: z
    .string()
    .max(500, {
      message: "설명은 최대 500자까지 입력 가능합니다.",
    })
    .optional(),
  collectSchedule: z.string().min(2, {
    message: "수거 가능 일정을 입력해주세요.",
  }),
});

type CafeFormValues = z.infer<typeof cafeFormSchema>;

const CafeRegistrationPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form
  const form = useForm<CafeFormValues>({
    resolver: zodResolver(cafeFormSchema),
    defaultValues: {
      name: user?.name || "",
      address: "",
      detailAddress: "",
      phone: "",
      latitude: 0,
      longitude: 0,
      openHours: "매일 07:00 - 22:00",
      description: "",
      collectSchedule: "매일 오전 10시 ~ 12시, 오후 3시 ~ 5시",
    },
  });

  // Try to get current location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      toast({
        title: "위치 확인 중",
        description: "현재 위치를 확인하고 있습니다...",
        duration: 3000,
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("latitude", position.coords.latitude);
          form.setValue("longitude", position.coords.longitude);

          toast({
            title: "위치 확인 완료",
            description: "현재 위치가 저장되었습니다.",
            duration: 3000,
          });
        },
        (error) => {
          toast({
            title: "위치 확인 실패",
            description: "위치를 확인할 수 없습니다. 수동으로 입력해주세요.",
            variant: "destructive",
            duration: 3000,
          });
          console.error("위치 가져오기 오류:", error);
        }
      );
    } else {
      toast({
        title: "위치 서비스 미지원",
        description: "브라우저가 위치 서비스를 지원하지 않습니다.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Form submission handler
  const onSubmit = async (values: CafeFormValues) => {
    console.log("[디버깅] 카페 등록 요청 시작:", values);
    setIsLoading(true);

    try {
      // Get the user token
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
      }

      // Prepare the request data
      const cafeData = {
        ...values,
        // Include member ID from user context
        memberId: user?.id,
        // Add the logo image if available
      };

      // Make API call
      const response = await apiClient.post("/api/cafes", cafeData);

      console.log("[디버깅] 카페 등록 성공:", response.data);

      toast({
        title: "카페 등록 완료",
        description: "카페 정보가 성공적으로 등록되었습니다.",
        duration: 3000,
      });

      // Redirect to the cafe dashboard
      navigate("/cafe/dashboard");
    } catch (error: any) {
      console.error("[디버깅] 카페 등록 오류:", error);

      let errorMessage = "카페 등록 중 오류가 발생했습니다.";

      if (error.response) {
        // Server responded with an error
        errorMessage = error.response.data?.message || errorMessage;
        console.error("[디버깅] 서버 응답:", error.response.data);
      }

      toast({
        title: "카페 등록 실패",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-coffee-dark">카페 등록</h1>
            <p className="text-muted-foreground mt-2">
              커피 찌꺼기 관리를 위한 카페 정보를 등록해주세요.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>카페 정보 입력</CardTitle>
              <CardDescription>
                정확한 정보를 입력하면 사용자들이 더 쉽게 카페를 찾고 찌꺼기를
                수거할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  {/* Basic Information Section */}
                  <div>
                    <h3 className="text-lg font-medium text-coffee-dark mb-4">
                      기본 정보
                    </h3>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Logo Upload */}

                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>카페 이름 *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="예: 커피 그라운드 카페"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>연락처 *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="예: 02-1234-5678"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>주소 *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="예: 서울시 강남구 테헤란로 101"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="detailAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>상세 주소</FormLabel>
                            <FormControl>
                              <Input placeholder="예: 2층 201호" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="md:col-span-2 flex items-end gap-4">
                        <FormField
                          control={form.control}
                          name="latitude"
                          render={({ field: { value, onChange, ...rest } }) => (
                            <FormItem className="flex-1">
                              <FormLabel>위도</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="any"
                                  placeholder="위도"
                                  value={value || ""}
                                  onChange={(e) =>
                                    onChange(
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : 0
                                    )
                                  }
                                  {...rest}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="longitude"
                          render={({ field: { value, onChange, ...rest } }) => (
                            <FormItem className="flex-1">
                              <FormLabel>경도</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="any"
                                  placeholder="경도"
                                  value={value || ""}
                                  onChange={(e) =>
                                    onChange(
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : 0
                                    )
                                  }
                                  {...rest}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          className="border-coffee text-coffee hover:bg-coffee-cream/50 mb-[2px]"
                          onClick={handleGetLocation}
                        >
                          현재 위치 가져오기
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name="openHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>운영 시간 *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="예: 매일 07:00 - 22:00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>카페 소개</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="카페에 대한 간략한 소개를 입력해주세요."
                                className="resize-none min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              카페의 특징, 사용하는 원두, 지속가능한 활동 등을
                              소개해주세요.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Coffee Grounds Collection Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-coffee-dark mb-4">
                      찌꺼기 수거 설정
                    </h3>

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="collectSchedule"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>수거 가능 시간 *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="예: 매일 오전 10시 ~ 12시, 오후 3시 ~ 5시"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              찌꺼기 수거가 가능한 시간대를 입력해주세요.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-coffee hover:bg-coffee-dark"
                      disabled={isLoading}
                    >
                      {isLoading ? "등록 중..." : "카페 등록하기"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CafeRegistrationPage;
