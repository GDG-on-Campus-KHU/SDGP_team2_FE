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
import { useTranslation } from "react-i18next";

const CafeRegistrationPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  type CafeFormValues = z.infer<typeof cafeFormSchema>;

  const cafeFormSchema = z.object({
    name: z.string().min(2, {
      message: t("cafe_register.validation.name_min"),
    }),
    address: z.string().min(5, {
      message: t("cafe_register.validation.address_min"),
    }),
    detailAddress: z.string().optional(),
    phone: z.string().min(10, {
      message: t("cafe_register.validation.phone_min"),
    }),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    openHours: z.string().min(2, {
      message: t("cafe_register.validation.hours_required"),
    }),
    description: z
      .string()
      .max(500, {
        message: t("cafe_register.validation.description_max"),
      })
      .optional(),
    collectSchedule: z.string().min(2, {
      message: t("cafe_register.validation.collection_hours_required"),
    }),
  });
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
      openHours: t("cafe_register.default_hours"),
      description: "",
      collectSchedule: t("cafe_register.default_collection_hours"),
    },
  });

  // Try to get current location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      toast({
        title: t("cafe_register.location_checking"),
        description: t("cafe_register.location_checking_desc"),
        duration: 3000,
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("latitude", position.coords.latitude);
          form.setValue("longitude", position.coords.longitude);

          toast({
            title: t("cafe_register.location_success"),
            description: t("cafe_register.location_success_desc"),
            duration: 3000,
          });
        },
        (error) => {
          toast({
            title: t("cafe_register.location_failure"),
            description: t("cafe_register.location_failure_desc"),
            variant: "destructive",
            duration: 3000,
          });
          console.error(t("cafe_register.location_error"), error);
        }
      );
    } else {
      toast({
        title: t("cafe_register.location_unsupported"),
        description: t("cafe_register.location_unsupported_desc"),
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
        throw new Error(t("error.no_token"));
      }
      // Make API call
      const response = await apiClient.post("/api/cafes", values);

      console.log("[디버깅] 카페 등록 성공:", response.data);

      toast({
        title: t("cafe_register.register_success"),
        description: t("cafe_register.register_success_desc"),
        duration: 3000,
      });

      // Redirect to the cafe dashboard
      navigate("/cafe/dashboard");
    } catch (error: unknown) {
      console.error("[디버깅] 카페 등록 오류:", error);

      toast({
        title: t("cafe_register.register_failure"),
        description: t("cafe_register.register_failure_desc"),
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
            <h1 className="text-3xl font-bold text-coffee-dark">
              {t("cafe_register.title")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("cafe_register.subtitle")}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("cafe_register.info_input")}</CardTitle>
              <CardDescription>{t("cafe_register.info_desc")}</CardDescription>
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
                      {t("cafe_register.basic_info")}
                    </h3>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Logo Upload */}

                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("cafe_register.cafe_name")}
                            </FormLabel>
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
                            <FormLabel>{t("cafe_register.phone")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t(
                                  "cafe_register.phone_placeholder"
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
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("cafe_register.address")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t(
                                  "cafe_register.address_placeholder"
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
                        name="detailAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("cafe_register.detail_address")}
                            </FormLabel>
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

                      <div className="md:col-span-2 flex items-end gap-4">
                        <FormField
                          control={form.control}
                          name="latitude"
                          render={({ field: { value, onChange, ...rest } }) => (
                            <FormItem className="flex-1">
                              <FormLabel>
                                {t("cafe_register.latitude")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="any"
                                  placeholder={t("cafe_register.latitude")}
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
                              <FormLabel>
                                {t("cafe_register.longitude")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="any"
                                  placeholder={t("cafe_register.longitude")}
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
                          {t("cafe_register.get_current_location")}
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name="openHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("cafe_register.hours")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t(
                                  "cafe_register.hours_placeholder"
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
                        name="description"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>
                              {t("cafe_register.description")}
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t(
                                  "cafe_register.description_placeholder"
                                )}
                                className="resize-none min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              {t("cafe_register.description_hint")}
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
                      {t("cafe_register.collection_settings")}
                    </h3>

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="collectSchedule"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>
                              {t("cafe_register.collection_hours")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t(
                                  "cafe_register.collection_hours_placeholder"
                                )}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              {t("cafe_register.collection_hours_hint")}
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
                      {isLoading
                        ? t("cafe_register.registering")
                        : t("cafe_register.register_button")}
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
