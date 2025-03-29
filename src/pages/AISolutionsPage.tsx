
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Leaf, ExternalLink, Coffee, Sparkles, Bot, Filter } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserNavbar from '@/components/UserNavbar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// AI 추천 결과 타입
interface AiRecommendation {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  time: string;
  link?: string;
  materials: string[];
  steps: string[];
}

// 활용 목적 유형
const purposeOptions = [
  { value: 'all', label: '전체' },
  { value: 'scrub', label: '스크럽/각질제거' },
  { value: 'fertilizer', label: '비료/퇴비' },
  { value: 'fragrance', label: '방향제' },
  { value: 'craft', label: '공예품' },
  { value: 'soap', label: '비누/화장품' },
];

// 모의 AI 추천 데이터
const mockRecommendations: AiRecommendation[] = [
  {
    id: '1',
    title: '커피 스크럽 비누',
    description: '커피 찌꺼기를 재활용하여 각질 제거와 피부 탄력에 좋은 스크럽 비누를 만들어보세요.',
    image: 'https://picsum.photos/seed/coffee-soap/400/300',
    tags: ['스크럽', '비누', '각질제거'],
    difficulty: 'easy',
    time: '30분',
    link: 'https://example.com/coffee-soap',
    materials: [
      '커피 찌꺼기 1/2컵 (말린 것)',
      '글리세린 비누 베이스 200g',
      '에센셜 오일 10방울 (선택사항)',
      '올리브 오일 1큰술'
    ],
    steps: [
      '커피 찌꺼기를 완전히 말려주세요.',
      '비누 베이스를 전자레인지나 중탕으로 녹여주세요.',
      '녹인 비누 베이스에 말린 커피 찌꺼기를 넣고 잘 섞어주세요.',
      '에센셜 오일과 올리브 오일을 넣고 섞어주세요.',
      '비누 몰드에 부어 1-2시간 굳혀주세요.',
      '완전히 굳으면 몰드에서 꺼내 사용하세요.'
    ]
  },
  {
    id: '2',
    title: '커피 방향제 만들기',
    description: '자연스러운 커피향으로 집안에 은은한 향기를 더해보세요. 탈취 효과도 뛰어납니다.',
    image: 'https://picsum.photos/seed/coffee-fragrance/400/300',
    tags: ['방향제', '탈취', '인테리어'],
    difficulty: 'easy',
    time: '15분',
    link: 'https://example.com/coffee-fragrance',
    materials: [
      '말린 커피 찌꺼기 1컵',
      '베이킹 소다 1/2컵',
      '작은 유리병',
      '장식용 리본 (선택사항)'
    ],
    steps: [
      '커피 찌꺼기를 완전히 말려 습기를 제거합니다.',
      '말린 커피 찌꺼기와 베이킹 소다를 잘 섞습니다.',
      '혼합물을 작은 유리병에 담습니다.',
      '작은 구멍이 있는 뚜껑을 닫거나, 천으로 덮고 리본으로 묶어줍니다.',
      '냉장고, 신발장, 옷장 등 냄새 제거가 필요한 곳에 놓아둡니다.',
      '2-3주마다 커피 찌꺼기를 새것으로 교체해줍니다.'
    ]
  },
  {
    id: '3',
    title: '커피 찌꺼기 화분 퇴비',
    description: '질소, 인, 칼륨이 풍부한 커피 찌꺼기로 식물 성장에 도움이 되는 퇴비를 만들어보세요.',
    image: 'https://picsum.photos/seed/coffee-fertilizer/400/300',
    tags: ['퇴비', '비료', '가드닝'],
    difficulty: 'medium',
    time: '1주일',
    link: 'https://example.com/coffee-fertilizer',
    materials: [
      '커피 찌꺼기 2컵',
      '말린 낙엽 또는 신문지 조각 2컵',
      '달걀 껍데기 (선택사항)',
      '설탕 1큰술'
    ],
    steps: [
      '커피 찌꺼기가 완전히 말랐는지 확인합니다.',
      '커피 찌꺼기와 말린 낙엽을 1:1 비율로 섞습니다.',
      '원한다면 곱게 갈은 달걀 껍데기를 추가합니다.',
      '섞은 재료에 설탕물을 약간 뿌려 미생물 활동을 촉진합니다.',
      '그늘진 곳에서 1주일간 발효시킵니다.',
      '실내 화분이나 정원의 흙에 5:1 비율로 섞어 사용합니다.'
    ]
  },
  {
    id: '4',
    title: '커피 찌꺼기 캔들',
    description: '커피 찌꺼기로 만든 천연 캔들로 실내 공기를 정화하고 은은한 커피향을 즐겨보세요.',
    image: 'https://picsum.photos/seed/coffee-candle/400/300',
    tags: ['캔들', '인테리어', '공예'],
    difficulty: 'medium',
    time: '1시간',
    link: 'https://example.com/coffee-candle',
    materials: [
      '말린 커피 찌꺼기 1/4컵',
      '소이 왁스 200g',
      '심지',
      '유리 용기',
      '에센셜 오일 (선택사항)'
    ],
    steps: [
      '커피 찌꺼기를 완전히 말려 준비합니다.',
      '유리 용기 중앙에 심지를 고정합니다.',
      '소이 왁스를 중탕으로 녹입니다.',
      '녹인 왁스의 온도가 약 70도일 때 말린 커피 찌꺼기를 넣고 섞어줍니다.',
      '원하는 경우 에센셜 오일을 몇 방울 떨어뜨립니다.',
      '혼합물을 유리 용기에 부어 완전히 굳을 때까지 기다립니다.',
      '왁스가 굳으면 심지를 적당한 길이로 잘라 사용합니다.'
    ]
  },
  {
    id: '5',
    title: '커피 각질 제거 스크럽',
    description: '얼굴과 바디를 위한 자연스러운 스크럽으로 매끄러운 피부를 가꿔보세요.',
    image: 'https://picsum.photos/seed/coffee-scrub/400/300',
    tags: ['스크럽', '바디케어', '각질제거'],
    difficulty: 'easy',
    time: '10분',
    link: 'https://example.com/coffee-scrub',
    materials: [
      '커피 찌꺼기 1/2컵',
      '코코넛 오일 1/4컵',
      '흑설탕 1/4컵',
      '바닐라 에센셜 오일 몇 방울 (선택사항)'
    ],
    steps: [
      '커피 찌꺼기를 완전히 말립니다.',
      '말린 커피 찌꺼기, 흑설탕, 코코넛 오일을 볼에 넣고 잘 섞어줍니다.',
      '원하는 경우 바닐라 에센셜 오일을 몇 방울 첨가합니다.',
      '깨끗한 용기에 담아 보관합니다.',
      '사용 시 젖은 피부에 부드럽게 마사지하듯 문지른 후 물로 씻어냅니다.',
      '일주일에 1-2회 사용을 권장합니다.'
    ]
  },
  {
    id: '6',
    title: '커피 지우개 크레용',
    description: '어린이와 함께 만드는 친환경 미술 도구, 커피 지우개 크레용으로 창의력을 키워보세요.',
    image: 'https://picsum.photos/seed/coffee-crayons/400/300',
    tags: ['공예', '어린이', '미술'],
    difficulty: 'hard',
    time: '2시간',
    link: 'https://example.com/coffee-crayons',
    materials: [
      '커피 찌꺼기 1/2컵',
      '물 1컵',
      '밀가루 1컵',
      '소금 1/2컵',
      '식용유 1큰술'
    ],
    steps: [
      '냄비에 물을 끓이고 커피 찌꺼기를 넣어 약 5분간 끓입니다.',
      '커피물을 체로 걸러 찌꺼기는 따로 보관합니다.',
      '냄비에 밀가루, 소금, 커피물, 식용유를 넣고 잘 섞어줍니다.',
      '약불에서 덩어리가 생길 때까지 저어줍니다.',
      '반죽이 식으면 원하는 모양으로 성형합니다.',
      '24시간 동안 완전히 말립니다.',
      '건조된 크레용을 종이에 문질러 사용합니다.'
    ]
  }
];

const AISolutionsPage = () => {
  const [selectedPurpose, setSelectedPurpose] = useState('all');
  const [selectedBeanType, setSelectedBeanType] = useState('all');
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const [selectedRecommendation, setSelectedRecommendation] = useState<AiRecommendation | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // 원두 종류 목록 (실제로는 API에서 가져올 수 있음)
  const beanTypes = [
    { value: 'all', label: '모든 원두' },
    { value: 'ethiopia', label: '에티오피아 예가체프' },
    { value: 'colombia', label: '콜롬비아 수프리모' },
    { value: 'brazil', label: '브라질 산토스' },
    { value: 'guatemala', label: '과테말라 안티구아' },
  ];

  // 활용 목적에 따른 필터링
  const handleFilterChange = (purpose: string) => {
    setSelectedPurpose(purpose);
    
    if (purpose === 'all') {
      setRecommendations(mockRecommendations);
      return;
    }
    
    // 목적에 따른 태그 필터링 (실제로는 API 호출로 대체될 수 있음)
    const filteredResults = mockRecommendations.filter(rec => 
      rec.tags.some(tag => 
        (purpose === 'scrub' && ['스크럽', '각질제거'].includes(tag)) ||
        (purpose === 'fertilizer' && ['퇴비', '비료'].includes(tag)) ||
        (purpose === 'fragrance' && ['방향제', '탈취'].includes(tag)) ||
        (purpose === 'craft' && ['공예', '인테리어'].includes(tag)) ||
        (purpose === 'soap' && ['비누', '바디케어'].includes(tag))
      )
    );
    
    setRecommendations(filteredResults);
  };

  // 원두 종류에 따른 필터링 (실제 구현에서는 API 호출)
  const handleBeanTypeChange = (beanType: string) => {
    setSelectedBeanType(beanType);
    // 실제로는 beanType을 API로 전송하여 맞춤형 결과를 받아올 수 있음
    // 여기서는 단순히 표시만 하고 목업 데이터를 그대로 사용
  };

  // 선택한 추천 상세 보기
  const handleViewDetails = (recommendation: AiRecommendation) => {
    setSelectedRecommendation(recommendation);
  };

  // 난이도 배지 렌더링
  const renderDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge className="bg-green-500">쉬움</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">보통</Badge>;
      case 'hard':
        return <Badge className="bg-red-500">어려움</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pb-16 md:pb-0 container px-4 py-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-coffee-dark">AI 업사이클링 솔루션</h1>
          <p className="text-muted-foreground">
            커피 찌꺼기의 특성과 원두 종류를 고려한 맞춤형 활용법을 AI가 추천해드립니다.
          </p>
        </div>
        
        {/* 필터 섹션 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5 text-coffee" />
              활용 목적 선택
            </CardTitle>
            <CardDescription>
              어떤 용도로 커피 찌꺼기를 활용하고 싶으신가요?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">활용 목적</p>
                <Select value={selectedPurpose} onValueChange={handleFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="활용 목적 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {purposeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">원두 종류</p>
                <Select value={selectedBeanType} onValueChange={handleBeanTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="원두 종류 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {beanTypes.map(bean => (
                      <SelectItem key={bean.value} value={bean.value}>
                        {bean.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <p className="text-sm font-medium mb-2">AI 추천 레벨</p>
                <div className="bg-coffee-cream/30 text-coffee-dark p-3 rounded-md flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-coffee" />
                  <div className="text-sm">
                    {user 
                      ? '맞춤형 추천 활성화' 
                      : '로그인하면 더 정확한 추천을 제공받을 수 있습니다'}
                  </div>
                </div>
              </div>
            </div>
            
            {selectedBeanType !== 'all' && (
              <div className="bg-blue-50 p-3 rounded-md flex items-center text-sm text-blue-800">
                <Bot className="h-5 w-5 mr-2 text-blue-600" />
                <p>
                  <span className="font-medium">{beanTypes.find(b => b.value === selectedBeanType)?.label}</span>는 
                  {selectedBeanType === 'ethiopia' ? ' 과일향과 꽃향이 풍부하여 방향제로 활용하기 좋습니다.' :
                   selectedBeanType === 'colombia' ? ' 균형 잡힌 바디감으로 스크럽과 비누 제작에 적합합니다.' :
                   selectedBeanType === 'brazil' ? ' 고소한 견과류 향이 있어 화분 퇴비로 사용하기 좋습니다.' :
                   ' 스모키한 향이 있어 공예품이나 탈취제로 사용하기 적합합니다.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* AI 추천 결과 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-coffee-dark flex items-center mb-4">
            <Sparkles className="mr-2 h-5 w-5 text-coffee" />
            AI 추천 업사이클링 방법
          </h2>
          
          {recommendations.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map(recommendation => (
                <Card key={recommendation.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={recommendation.image} 
                      alt={recommendation.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                      {renderDifficultyBadge(recommendation.difficulty)}
                    </div>
                    <CardDescription className="line-clamp-2">{recommendation.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {recommendation.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="bg-coffee-cream/20 border-coffee-cream text-coffee-dark">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      소요 시간: {recommendation.time}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 mt-auto">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="border-coffee text-coffee hover:bg-coffee-cream/50 w-full"
                          onClick={() => handleViewDetails(recommendation)}
                        >
                          상세 보기
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>{recommendation.title}</DialogTitle>
                          <DialogDescription>
                            {recommendation.description}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <img 
                              src={recommendation.image} 
                              alt={recommendation.title} 
                              className="w-full rounded-md"
                            />
                            <div className="mt-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                  {recommendation.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="bg-coffee-cream/20 border-coffee-cream text-coffee-dark">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                {renderDifficultyBadge(recommendation.difficulty)}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">소요 시간:</span> {recommendation.time}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-coffee-dark mb-2">필요한 재료</h4>
                              <ul className="space-y-1 list-disc pl-5">
                                {recommendation.materials.map((material, index) => (
                                  <li key={index} className="text-sm">{material}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h4 className="font-medium text-coffee-dark mb-2">만드는 방법</h4>
                              <ol className="space-y-2 list-decimal pl-5">
                                {recommendation.steps.map((step, index) => (
                                  <li key={index} className="text-sm">{step}</li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          {recommendation.link && (
                            <Button 
                              className="bg-coffee hover:bg-coffee-dark"
                              onClick={() => window.open(recommendation.link, '_blank')}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              상세 튜토리얼 보기
                            </Button>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                선택한 필터에 맞는 추천 결과가 없습니다.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedPurpose('all');
                  handleFilterChange('all');
                }}
              >
                모든 결과 보기
              </Button>
            </Card>
          )}
        </div>
        
        {/* 환경 기여도 카드 */}
        <Card className="bg-eco-light border-eco mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-eco-dark">
              <Leaf className="mr-2 h-5 w-5 text-eco" />
              내 환경 기여도
            </CardTitle>
            <CardDescription>
              지금까지의 커피 찌꺼기 재활용 활동을 통한 환경 기여도입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <div className="text-sm text-muted-foreground mb-1">총 수거량</div>
                  <div className="text-2xl font-bold text-eco-dark">9.5L</div>
                  <div className="text-xs text-muted-foreground mt-1">최근 3개월 동안</div>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <div className="text-sm text-muted-foreground mb-1">탄소 절감량</div>
                  <div className="text-2xl font-bold text-eco-dark">5.7kg</div>
                  <div className="text-xs text-muted-foreground mt-1">CO<sub>2</sub> 배출 감소량</div>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <div className="text-sm text-muted-foreground mb-1">환경 기여 레벨</div>
                  <div className="text-2xl font-bold text-eco-dark">그린 레벨 2</div>
                  <div className="text-xs text-muted-foreground mt-1">다음 레벨까지 35%</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  로그인하면 내 환경 기여도를 확인할 수 있습니다.
                </p>
                <Button 
                  className="bg-eco hover:bg-eco-dark"
                  onClick={() => navigate('/login')}
                >
                  로그인하기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 팁 섹션 */}
        <div className="bg-coffee-cream/30 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-coffee-dark mb-3 flex items-center">
            <Coffee className="mr-2 h-5 w-5 text-coffee" />
            커피 찌꺼기 보관 및 활용 팁
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h4 className="font-medium text-coffee-dark mb-2">올바른 보관 방법</h4>
              <p className="text-sm text-muted-foreground">
                커피 찌꺼기는 습기에 취약해 곰팡이가 피기 쉬우므로, 활용 전에 완전히 말려 밀폐 용기에 보관하세요.
                오븐에서 120°C로 약 20분간 구워 살균 효과를 높일 수도 있습니다.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h4 className="font-medium text-coffee-dark mb-2">효과적인 활용 시점</h4>
              <p className="text-sm text-muted-foreground">
                커피 찌꺼기는 추출 후 24시간 이내에 활용하거나 즉시 건조하는 것이 좋습니다.
                습한 상태로 오래 방치할 경우 효능이 떨어지고 곰팡이가 발생할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <UserNavbar />
      <Footer />
    </div>
  );
};

export default AISolutionsPage;
