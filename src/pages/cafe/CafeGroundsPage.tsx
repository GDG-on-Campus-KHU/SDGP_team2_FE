
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// 찌꺼기 등록 폼 검증 스키마
const groundFormSchema = z.object({
  date: z.date({
    required_error: "날짜를 선택해주세요.",
  }),
  amount: z.number({
    required_error: "양을 입력해주세요.",
    invalid_type_error: "양은 숫자여야 합니다.",
  }).min(0.5, {
    message: "최소 0.5L 이상이어야 합니다.",
  }).max(100, {
    message: "최대 100L까지 입력 가능합니다.",
  }),
  beanType: z.string().min(1, {
    message: "원두 종류를 선택해주세요.",
  }),
  note: z.string().max(200, {
    message: "메모는 최대 200자까지 입력 가능합니다.",
  }).optional(),
});

// 모의 원두 목록 데이터
const mockBeans = [
  { id: 1, name: '에티오피아 예가체프' },
  { id: 2, name: '콜롬비아 수프리모' },
  { id: 3, name: '브라질 산토스' },
  { id: 4, name: '과테말라 안티구아' },
];

// 모의 등록된 찌꺼기 데이터
const mockGrounds = [
  { 
    id: 1, 
    date: new Date('2023-11-29'), 
    amount: 3.5, 
    beanType: '에티오피아 예가체프',
    note: '아침 영업 후 수거, 습도 적당함',
    status: '수거 대기'
  },
  { 
    id: 2, 
    date: new Date('2023-11-27'), 
    amount: 4.2, 
    beanType: '콜롬비아 수프리모',
    note: '오후 3시경 수거',
    status: '수거 완료'
  },
  { 
    id: 3, 
    date: new Date('2023-11-25'), 
    amount: 2.8, 
    beanType: '브라질 산토스',
    note: '',
    status: '수거 완료'
  },
];

const CafeGroundsPage = () => {
  const { toast } = useToast();
  const [grounds, setGrounds] = useState(mockGrounds);
  
  // 폼 초기화
  const form = useForm<z.infer<typeof groundFormSchema>>({
    resolver: zodResolver(groundFormSchema),
    defaultValues: {
      date: new Date(),
      amount: 1,
      beanType: '',
      note: '',
    },
  });

  // 슬라이더 값 변경 처리
  const handleSliderChange = (value: number[]) => {
    form.setValue('amount', value[0]);
  };

  // 폼 제출 처리
  const onSubmit = (values: z.infer<typeof groundFormSchema>) => {
    const newGround = {
      id: Date.now(),
      ...values,
      status: '수거 대기'
    };
    
    setGrounds([newGround, ...grounds]);
    
    toast({
      title: "찌꺼기 등록 완료",
      description: `${format(values.date, 'PPP', { locale: ko })}에 ${values.amount}L의 찌꺼기가 등록되었습니다.`,
      duration: 3000,
    });
    
    // 폼 리셋 (날짜는 오늘로 유지)
    form.reset({
      date: new Date(),
      amount: 1,
      beanType: '',
      note: '',
    });
  };

  // 찌꺼기 삭제 처리
  const handleDelete = (id: number) => {
    setGrounds(grounds.filter(ground => ground.id !== id));
    
    toast({
      title: "삭제 완료",
      description: "선택한 찌꺼기 등록이 삭제되었습니다.",
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-coffee-dark">찌꺼기 등록</h2>
      
      {/* 등록 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>새 찌꺼기 등록</CardTitle>
          <CardDescription>
            오늘 발생한 커피 찌꺼기를 등록해주세요. 등록된 정보는 수거 신청시 사용됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>날짜</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: ko })
                              ) : (
                                <span>날짜 선택</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date('2023-01-01')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="beanType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>원두 종류</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="원두 종류 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockBeans.map(bean => (
                            <SelectItem key={bean.id} value={bean.name}>
                              {bean.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        등록하지 않은 원두는 원두 관리 페이지에서 먼저 등록해주세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
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
                              onChange={e => field.onChange(parseFloat(e.target.value))}
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
                        일반적으로 에스프레소 한 잔에는 약 20g의 원두가 사용되며, 1L 용량의 찌꺼기는 약 50잔에 해당합니다.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                        찌꺼기의 상태나 보관 정보 등 특이사항을 메모할 수 있습니다.
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
      <h3 className="text-xl font-semibold text-coffee-dark mt-8">등록된 찌꺼기 목록</h3>
      <div className="space-y-4">
        {grounds.length > 0 ? (
          grounds.map((ground) => (
            <Card key={ground.id} className="relative overflow-hidden">
              <div 
                className={`absolute top-0 left-0 h-full w-1 ${
                  ground.status === '수거 완료' ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-medium text-coffee-dark">
                        {format(ground.date, 'PPP', { locale: ko })}
                      </div>
                      <span 
                        className={`px-2 py-1 text-xs rounded-full ${
                          ground.status === '수거 완료' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {ground.status}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium w-24">원두:</span>
                        <span className="text-sm text-muted-foreground">{ground.beanType}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium w-24">양:</span>
                        <span className="text-sm text-muted-foreground">{ground.amount}L</span>
                      </div>
                      {ground.note && (
                        <div className="flex items-start mt-2">
                          <span className="text-sm font-medium w-24">메모:</span>
                          <span className="text-sm text-muted-foreground">{ground.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(ground.id)}
                    disabled={ground.status === '수거 완료'}
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
