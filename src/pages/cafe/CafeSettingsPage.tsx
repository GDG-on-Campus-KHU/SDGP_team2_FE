
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, ImagePlus, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import * as z from 'zod';

// 카페 정보 검증 스키마
const cafeFormSchema = z.object({
  name: z.string().min(2, {
    message: '카페 이름은 최소 2자 이상이어야 합니다.',
  }),
  address: z.string().min(5, {
    message: '주소는 최소 5자 이상이어야 합니다.',
  }),
  detailAddress: z.string().optional(),
  phone: z.string().min(10, {
    message: '연락처는 최소 10자 이상이어야 합니다.',
  }),
  openHours: z.string().min(2, {
    message: '운영 시간을 입력해주세요.',
  }),
  description: z.string().max(500, {
    message: '설명은 최대 500자까지 입력 가능합니다.',
  }).optional(),
  collectMethod: z.string({
    required_error: '수거 방법을 선택해주세요.'
  }),
  collectSchedule: z.string().min(2, {
    message: '수거 가능 일정을 입력해주세요.',
  }),
});

const CafeSettingsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [logoPreview, setLogoPreview] = React.useState<string | null>('https://api.dicebear.com/7.x/shapes/svg?seed=cafe');
  
  // 폼 초기화
  const form = useForm<z.infer<typeof cafeFormSchema>>({
    resolver: zodResolver(cafeFormSchema),
    defaultValues: {
      name: user?.name || '',
      address: '서울시 강남구 테헤란로 101',
      detailAddress: '2층',
      phone: '02-1234-5678',
      openHours: '매일 07:00 - 22:00',
      description: '친환경 컨셉의 카페입니다. 에티오피아, 콜롬비아 원두를 주로 사용하며 지속 가능한 커피 문화를 만들어갑니다.',
      collectMethod: 'pickup',
      collectSchedule: '매일 오전 10시 ~ 12시, 오후 3시 ~ 5시',
    },
  });

  // 로고 이미지 업로드 처리
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 폼 제출 처리
  const onSubmit = (values: z.infer<typeof cafeFormSchema>) => {
    console.log('Updated cafe information:', values);
    
    toast({
      title: "설정 저장 완료",
      description: "카페 정보가 성공적으로 저장되었습니다.",
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-coffee-dark">카페 설정</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>카페 정보 관리</CardTitle>
          <CardDescription>
            카페의 기본 정보를 설정해주세요. 이 정보는 지도와 수거 신청 화면에 표시됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* 기본 정보 섹션 */}
              <div>
                <h3 className="text-lg font-medium text-coffee-dark mb-4">기본 정보</h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {/* 로고 업로드 */}
                  <div className="md:col-span-2 flex flex-col md:flex-row gap-6 items-start md:items-center mb-4">
                    <div className="relative h-32 w-32 rounded-md overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="카페 로고" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-12 w-12 text-gray-400" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleLogoUpload}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                        <ImagePlus className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">카페 로고</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        지도와 프로필에 표시될 카페 로고를 업로드해주세요.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                      >
                        <UploadCloud className="mr-2 h-4 w-4" />
                        이미지 업로드
                      </Button>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>카페 이름</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 커피 그라운드 카페" {...field} />
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
                        <FormLabel>연락처</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 02-1234-5678" {...field} />
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
                        <FormLabel>주소</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 서울시 강남구 테헤란로 101" {...field} />
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
                  
                  <FormField
                    control={form.control}
                    name="openHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>운영 시간</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 매일 07:00 - 22:00" {...field} />
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
                          카페의 특징, 사용하는 원두, 지속가능한 활동 등을 소개해주세요.
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
                <h3 className="text-lg font-medium text-coffee-dark mb-4">찌꺼기 수거 설정</h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="collectMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>선호하는 수거 방법</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="수거 방법 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pickup">방문 수거 (사용자가 직접 방문)</SelectItem>
                            <SelectItem value="delivery">배송 (카페에서 발송)</SelectItem>
                            <SelectItem value="both">모두 가능</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          사용자가 커피 찌꺼기를 수거하는 방법을 선택해주세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="collectSchedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>수거 가능 시간</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 매일 오전 10시 ~ 12시, 오후 3시 ~ 5시" {...field} />
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
              
              <Button type="submit" className="w-full bg-coffee hover:bg-coffee-dark">
                설정 저장하기
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CafeSettingsPage;
