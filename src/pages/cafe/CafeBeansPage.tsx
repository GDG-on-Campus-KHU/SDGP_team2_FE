
import React, { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Coffee, ImagePlus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// 원두 정보 검증 스키마
const beanFormSchema = z.object({
  name: z.string().min(2, {
    message: '원두 이름은 최소 2자 이상이어야 합니다.',
  }),
  origin: z.string().min(2, {
    message: '원산지는 최소 2자 이상이어야 합니다.',
  }),
  roastLevel: z.string().min(1, {
    message: '로스팅 레벨을 선택해주세요.',
  }),
  description: z.string().max(500, {
    message: '설명은 최대 500자까지 입력 가능합니다.',
  }),
  characteristics: z.string().max(200, {
    message: '특징은 최대 200자까지 입력 가능합니다.',
  }),
});

// 모의 기존 원두 데이터
const mockBeans = [
  {
    id: 1,
    name: '에티오피아 예가체프',
    origin: '에티오피아',
    roastLevel: 'medium',
    description: '꽃향기와 감귤류의 산미가 특징인 에티오피아 예가체프입니다. 밝은 산미와 달콤한 과일향이 조화롭게 어우러집니다.',
    characteristics: '꽃향기, 감귤류 산미, 달콤한 애프터테이스트',
    image: 'https://api.dicebear.com/7.x/shapes/svg?seed=bean1'
  },
  {
    id: 2,
    name: '콜롬비아 수프리모',
    origin: '콜롬비아',
    roastLevel: 'medium-dark',
    description: '견과류의 고소함과 초콜릿 풍미가 특징인 콜롬비아 수프리모입니다. 균형 잡힌 바디감과 부드러운 산미를 가집니다.',
    characteristics: '견과류, 초콜릿, 캐러멜',
    image: 'https://api.dicebear.com/7.x/shapes/svg?seed=bean2'
  },
];

const CafeBeansPage = () => {
  const { toast } = useToast();
  const [beans, setBeans] = useState(mockBeans);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // 폼 초기화
  const form = useForm<z.infer<typeof beanFormSchema>>({
    resolver: zodResolver(beanFormSchema),
    defaultValues: {
      name: '',
      origin: '',
      roastLevel: '',
      description: '',
      characteristics: '',
    },
  });

  // 이미지 업로드 처리
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 폼 제출 처리
  const onSubmit = (values: z.infer<typeof beanFormSchema>) => {
    const newBean = {
      id: Date.now(),
      ...values,
      image: imagePreview || `https://api.dicebear.com/7.x/shapes/svg?seed=bean${Date.now()}`
    };
    
    setBeans([...beans, newBean]);
    
    // 폼 초기화
    form.reset();
    setImagePreview(null);
    
    toast({
      title: "원두 등록 완료",
      description: `${values.name} 원두가 성공적으로 등록되었습니다.`,
      duration: 3000,
    });
  };

  // 원두 삭제 처리
  const handleDelete = (id: number) => {
    setBeans(beans.filter(bean => bean.id !== id));
    toast({
      title: "원두 삭제 완료",
      description: "선택한 원두가 삭제되었습니다.",
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-coffee-dark">원두 관리</h2>
      
      {/* 원두 등록 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>새 원두 등록</CardTitle>
          <CardDescription>
            카페에서 사용하는 원두 정보를 등록해주세요. 등록된 원두 정보는 수거 신청 시 함께 제공됩니다.
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
                          <Input placeholder="예: 에티오피아 예가체프" {...field} />
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
                  
                  <FormField
                    control={form.control}
                    name="roastLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>로스팅 레벨</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="로스팅 레벨 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">라이트 로스트</SelectItem>
                            <SelectItem value="medium">미디엄 로스트</SelectItem>
                            <SelectItem value="medium-dark">미디엄-다크 로스트</SelectItem>
                            <SelectItem value="dark">다크 로스트</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="characteristics"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>특징 (간략히)</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 과일향, 초콜릿향, 견과류" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
              
              {/* 이미지 업로드 영역 */}
              <div className="space-y-4">
                <FormLabel>원두 이미지</FormLabel>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-48 bg-gray-50 relative overflow-hidden">
                    {imagePreview ? (
                      <>
                        <img 
                          src={imagePreview} 
                          alt="원두 미리보기" 
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setImagePreview(null)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <ImagePlus className="h-10 w-10 mb-2" />
                        <p className="text-sm">이미지를 업로드하세요</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (최대 5MB)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                    />
                  </div>
                  
                  <div className="flex flex-col justify-center">
                    <FormDescription>
                      원두 이미지는 선택사항입니다. 이미지가 없어도 등록이 가능합니다.
                      등록된 원두 이미지는 사용자가 수거 신청 시 원두의 특성을 파악하는데 도움이 됩니다.
                    </FormDescription>
                  </div>
                </div>
              </div>
              
              <Button type="submit" className="bg-coffee hover:bg-coffee-dark w-full">
                원두 등록하기
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* 등록된 원두 목록 */}
      <h3 className="text-xl font-semibold text-coffee-dark mt-8">등록된 원두 목록</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {beans.map((bean) => (
          <Card key={bean.id} className="overflow-hidden">
            <div className="h-40 bg-gray-100 relative">
              <img 
                src={bean.image} 
                alt={bean.name} 
                className="h-full w-full object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleDelete(bean.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Coffee className="h-5 w-5 text-coffee" />
                <CardTitle className="text-lg">{bean.name}</CardTitle>
              </div>
              <CardDescription>{bean.origin} | {bean.roastLevel === 'light' ? '라이트' : 
                bean.roastLevel === 'medium' ? '미디엄' : 
                bean.roastLevel === 'medium-dark' ? '미디엄-다크' : '다크'} 로스트</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{bean.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {bean.characteristics.split(',').map((characteristic, index) => (
                  <span 
                    key={index} 
                    className="text-xs bg-coffee-cream text-coffee-dark px-2 py-1 rounded-full"
                  >
                    {characteristic.trim()}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CafeBeansPage;
