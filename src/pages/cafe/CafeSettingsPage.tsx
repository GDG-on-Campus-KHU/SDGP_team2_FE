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
import { Building2, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import * as z from "zod";
import apiClient from "@/api/apiClient";
import { useTranslation } from "react-i18next";

const CafeSettingsPage = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cafeId, setCafeId] = useState(2); // Default value, could be set based on user or context
  const cafeFormSchema = z.object({
    name: z.string().min(2, {
      message: t("settings.validation.name_min"),
    }),
    address: z.string().min(5, {
      message: t("settings.validation.address_min"),
    }),
    detailAddress: z.string().optional(),
    phone: z.string().min(10, {
      message: t("settings.validation.phone_min"),
    }),
    openHours: z.string().min(2, {
      message: t("settings.validation.hours_required"),
    }),
    description: z
      .string()
      .max(500, {
        message: t("settings.validation.description_max"),
      })
      .optional(),
    collectSchedule: z.string().min(2, {
      message: t("settings.validation.collection_hours_required"),
    }),
  });
  // 폼 초기화
  const form = useForm<z.infer<typeof cafeFormSchema>>({
    resolver: zodResolver(cafeFormSchema),
    defaultValues: {
      name: "",
      address: "",
      detailAddress: "",
      phone: "",
      openHours: "",
      description: "",
      collectSchedule: "",
    },
  });

  // Fetch cafe data when component mounts
  useEffect(() => {
    const fetchCafeData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/api/cafes/me`);
        console.log("[디버깅] 카페 정보 조회 성공:", response.data);

        if (response.data && response.data.data) {
          const cafeData = response.data.data;

          // Reset form with fetched data
          form.reset({
            name: cafeData.name || "",
            address: cafeData.address || "",
            detailAddress: cafeData.detailAddress || "",
            phone: cafeData.phone || "",
            openHours: cafeData.openHours || "",
            description: cafeData.description || "",
            collectSchedule: cafeData.collectSchedule || "",
          });
        }
      } catch (error: unknown) {
        console.error("[디버깅] 카페 정보 조회 오류:", error);

        toast({
          title: t("settings.load_failure"),
          description: t("settings.load_failure_desc"),
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCafeData();
  }, [cafeId, toast, form, user?.name]);

  // 폼 제출 처리
  const onSubmit = async (values: z.infer<typeof cafeFormSchema>) => {
    try {
      console.log("[디버깅] 카페 정보 업데이트 요청:", values);

      const response = await apiClient.put(`/api/cafes`, values);
      console.log("[디버깅] 카페 정보 업데이트 성공:", response.data);

      toast({
        title: t("settings.save_success"),
        description: t("settings.save_success_desc"),
        duration: 3000,
      });
    } catch (error: unknown) {
      console.error("[디버깅] 카페 정보 업데이트 오류:", error);

      toast({
        title: t("settings.save_failure"),
        description: t("settings.save_failure_desc"),
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 text-coffee animate-spin" />
        <span className="ml-2">{t("settings.loading_info")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-coffee-dark">
        {t("settings.title")}
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.manage_info")}</CardTitle>
          <CardDescription>{t("settings.manage_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* 기본 정보 섹션 */}
              <div>
                <h3 className="text-lg font-medium text-coffee-dark mb-4">
                  {t("settings.basic_info")}
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("settings.cafe_name")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              "cafe_register.cafe_name_placeholder"
                            )}
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
                        <FormLabel>{t("settings.phone")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("cafe_register.phone_placeholder")}
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
                        <FormLabel>{t("settings.address")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("cafe_register.address_placeholder")}
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
                        <FormLabel>{t("settings.detail_address")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              "cafe_register.detail_address_placeholder"
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="openHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("settings.hours")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("cafe_register.hours_placeholder")}
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
                        <FormLabel>{t("settings.description")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("settings.description_placeholder")}
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("settings.description_hint")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* 찌꺼기 수거 설정 */}
              <div>
                <h3 className="text-lg font-medium text-coffee-dark mb-4">
                  {t("settings.collection_settings")}
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="collectSchedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("settings.collection_hours")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              "cafe_register.collection_hours_placeholder"
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("settings.collection_hours_hint")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-coffee hover:bg-coffee-dark"
              >
                {t("settings.save_settings")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CafeSettingsPage;
