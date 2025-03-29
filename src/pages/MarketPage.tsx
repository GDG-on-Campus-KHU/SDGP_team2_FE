
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Filter, Heart, Search, MapPin, Plus, Send, User, Clock, MessageSquare, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserNavbar from '@/components/UserNavbar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 상품 타입 정의
interface Product {
  id: string;
  title: string;
  price: number | 'free';
  type: 'share' | 'sell';
  category: string;
  location: string;
  distance: number;
  description: string;
  images: string[];
  timestamp: Date;
  seller: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  likes: number;
  isLiked?: boolean;
}

// 모의 상품 데이터
const mockProducts: Product[] = [
  {
    id: '1',
    title: '커피 찌꺼기로 만든 방향제 (3개입)',
    price: 15000,
    type: 'sell',
    category: 'fragrance',
    location: '서울시 강남구',
    distance: 1.2,
    description: '커피 찌꺼기로 직접 만든 수제 방향제입니다. 천연 재료만 사용했으며, 은은한 커피향이 특징입니다. 냉장고, 신발장 등 다양한 곳에 사용 가능합니다. 3개 세트로 판매합니다.',
    images: [
      'https://picsum.photos/seed/coffee-fragrance-1/400/400',
      'https://picsum.photos/seed/coffee-fragrance-2/400/400',
      'https://picsum.photos/seed/coffee-fragrance-3/400/400',
    ],
    timestamp: new Date(2023, 11, 5),
    seller: {
      id: 'user1',
      name: '김환경',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
      rating: 4.8,
    },
    likes: 12,
    isLiked: false,
  },
  {
    id: '2',
    title: '커피 찌꺼기 비료 나눔합니다',
    price: 'free',
    type: 'share',
    category: 'fertilizer',
    location: '서울시 서초구',
    distance: 2.5,
    description: '화분용 커피 찌꺼기 비료 나눔합니다. 약 500g 정도이며, 실내 화분이나 텃밭에 사용하기 좋습니다. 질소, 인, 칼륨 등 식물 영양소가 풍부합니다. 직접 수령 가능하신 분만 신청해주세요.',
    images: [
      'https://picsum.photos/seed/coffee-fertilizer-1/400/400',
    ],
    timestamp: new Date(2023, 11, 4),
    seller: {
      id: 'user2',
      name: '박에코',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
      rating: 4.5,
    },
    likes: 8,
    isLiked: false,
  },
  {
    id: '3',
    title: '수제 커피 스크럽 비누 (2개입)',
    price: 8000,
    type: 'sell',
    category: 'soap',
    location: '서울시 용산구',
    distance: 3.1,
    description: '커피 찌꺼기를 활용한 수제 스크럽 비누입니다. 각질 제거와 피부 탄력에 좋으며, 천연 글리세린과 에센셜 오일을 사용했습니다. 2개 세트로 판매합니다.',
    images: [
      'https://picsum.photos/seed/coffee-soap-1/400/400',
      'https://picsum.photos/seed/coffee-soap-2/400/400',
    ],
    timestamp: new Date(2023, 11, 3),
    seller: {
      id: 'user3',
      name: '이그린',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
      rating: 4.7,
    },
    likes: 15,
    isLiked: true,
  },
  {
    id: '4',
    title: '커피 찌꺼기 화분 만들기 키트',
    price: 12000,
    type: 'sell',
    category: 'craft',
    location: '서울시 마포구',
    distance: 4.8,
    description: '커피 찌꺼기를 활용한 친환경 화분 만들기 키트입니다. 키트에는 건조된 커피 찌꺼기, 종이 펄프, 접착제, 몰드가 포함되어 있습니다. 어린이와 함께하기 좋은 DIY 프로젝트입니다.',
    images: [
      'https://picsum.photos/seed/coffee-pot-1/400/400',
      'https://picsum.photos/seed/coffee-pot-2/400/400',
    ],
    timestamp: new Date(2023, 11, 2),
    seller: {
      id: 'user4',
      name: '최업사이클',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4',
      rating: 4.9,
    },
    likes: 7,
    isLiked: false,
  },
  {
    id: '5',
    title: '커피 캔들 나눔해요',
    price: 'free',
    type: 'share',
    category: 'candle',
    location: '서울시 동작구',
    distance: 5.2,
    description: '커피 찌꺼기를 활용해 만든 소이 캔들 나눔합니다. 직접 만든 수제품으로, 천연 소이 왁스와 커피 찌꺼기로만 제작했습니다. 방향제로도 좋고 인테리어 소품으로도 좋습니다.',
    images: [
      'https://picsum.photos/seed/coffee-candle-1/400/400',
      'https://picsum.photos/seed/coffee-candle-2/400/400',
    ],
    timestamp: new Date(2023, 11, 1),
    seller: {
      id: 'user5',
      name: '정제로웨이스트',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5',
      rating: 4.6,
    },
    likes: 20,
    isLiked: false,
  },
  {
    id: '6',
    title: '커피 찌꺼기 스크럽 만들기 클래스',
    price: 25000,
    type: 'sell',
    category: 'class',
    location: '서울시 종로구',
    distance: 6.7,
    description: '커피 찌꺼기를 활용한 바디 스크럽 만들기 클래스를 개설합니다. 12월 15일 토요일 오후 2시, 종로구 인사동에서 진행됩니다. 재료비 포함이며, 완성품 3종을 가져가실 수 있습니다.',
    images: [
      'https://picsum.photos/seed/coffee-class-1/400/400',
    ],
    timestamp: new Date(2023, 10, 28),
    seller: {
      id: 'user6',
      name: '한클래스',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user6',
      rating: 5.0,
    },
    likes: 30,
    isLiked: true,
  },
];

// 카테고리 옵션
const categoryOptions = [
  { value: 'all', label: '전체 카테고리' },
  { value: 'fragrance', label: '방향제' },
  { value: 'fertilizer', label: '비료/퇴비' },
  { value: 'soap', label: '비누/스크럽' },
  { value: 'candle', label: '캔들' },
  { value: 'craft', label: '공예품' },
  { value: 'class', label: '클래스/강좌' },
];

// 정렬 옵션
const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'closest', label: '가까운순' },
  { value: 'lowPrice', label: '낮은 가격순' },
  { value: 'highPrice', label: '높은 가격순' },
  { value: 'likes', label: '인기순' },
];

const MarketPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 필터 상태
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [maxDistance, setMaxDistance] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 채팅 상태
  const [chatMessage, setChatMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // 필터링된 상품 목록
  const getFilteredProducts = () => {
    let filtered = [...products];
    
    // 탭 필터링
    if (activeTab === 'sell') {
      filtered = filtered.filter(p => p.type === 'sell');
    } else if (activeTab === 'share') {
      filtered = filtered.filter(p => p.type === 'share');
    }
    
    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // 거리 필터링
    filtered = filtered.filter(p => p.distance <= maxDistance);
    
    // 검색어 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
      );
    }
    
    // 정렬
    switch (selectedSort) {
      case 'latest':
        filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        break;
      case 'closest':
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case 'lowPrice':
        filtered.sort((a, b) => {
          if (a.price === 'free') return -1;
          if (b.price === 'free') return 1;
          return a.price - b.price;
        });
        break;
      case 'highPrice':
        filtered.sort((a, b) => {
          if (a.price === 'free') return 1;
          if (b.price === 'free') return -1;
          return b.price - a.price;
        });
        break;
      case 'likes':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
    }
    
    return filtered;
  };

  // 상품 상세 보기
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setIsDetailOpen(true);
  };

  // 채팅 메시지 전송
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    toast({
      title: "메시지 전송 완료",
      description: "판매자에게 메시지가 전송되었습니다.",
      duration: 3000,
    });
    
    setChatMessage('');
    setIsChatOpen(false);
  };

  // 좋아요 토글
  const handleToggleLike = (productId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "로그인 필요",
        description: "좋아요 기능을 사용하려면 로그인이 필요합니다.",
        duration: 3000,
      });
      return;
    }
    
    setProducts(products.map(p => {
      if (p.id === productId) {
        const newIsLiked = !p.isLiked;
        return {
          ...p,
          isLiked: newIsLiked,
          likes: newIsLiked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    }));
  };

  // 이미지 슬라이더 제어
  const handlePrevImage = () => {
    if (!selectedProduct) return;
    setCurrentImageIndex(prevIndex => 
      prevIndex === 0 ? selectedProduct.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    if (!selectedProduct) return;
    setCurrentImageIndex(prevIndex => 
      prevIndex === selectedProduct.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pb-16 md:pb-0 container px-4 py-8">
        <div className="mb-8 space-y-2">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-coffee-dark">업사이클링 마켓</h1>
            {isAuthenticated && (
              <Button 
                className="bg-coffee hover:bg-coffee-dark"
                onClick={() => toast({
                  title: "준비 중",
                  description: "글쓰기 기능은 현재 개발 중입니다.",
                  duration: 3000,
                })}
              >
                <Plus className="mr-2 h-4 w-4" />
                글쓰기
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">
            커피 찌꺼기를 활용한 다양한 업사이클링 제품을 거래하고 나눔해보세요.
          </p>
        </div>
        
        {/* 검색 바 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10 pr-4 py-2 w-full"
              placeholder="찾고 싶은 상품을 검색해보세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* 탭 및 필터 영역 */}
        <div className="mb-6 space-y-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="sell">판매</TabsTrigger>
                <TabsTrigger value="share">나눔</TabsTrigger>
              </TabsList>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    필터
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>상품 필터링</DialogTitle>
                    <DialogDescription>
                      원하는 조건에 맞게 상품을 필터링하세요.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">카테고리</h4>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">정렬 방식</h4>
                      <Select value={selectedSort} onValueChange={setSelectedSort}>
                        <SelectTrigger>
                          <SelectValue placeholder="정렬 방식 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">최대 거리</h4>
                        <span className="text-sm text-muted-foreground">{maxDistance}km</span>
                      </div>
                      <Slider
                        defaultValue={[maxDistance]}
                        max={20}
                        min={1}
                        step={1}
                        onValueChange={(values) => setMaxDistance(values[0])}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedSort('latest');
                        setMaxDistance(10);
                      }}
                    >
                      필터 초기화
                    </Button>
                    <Button type="submit">적용하기</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Tabs>
          
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div>
              총 <span className="font-medium text-coffee-dark">{getFilteredProducts().length}개</span>의 상품
            </div>
            <div className="flex items-center space-x-2">
              <span>정렬:</span>
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="h-8 w-32 border-none">
                  <SelectValue placeholder="정렬 방식" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map(category => (
              <Badge
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                className={`cursor-pointer ${
                  selectedCategory === category.value 
                    ? 'bg-coffee text-white' 
                    : 'bg-transparent hover:bg-coffee-cream/20'
                }`}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* 상품 목록 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {getFilteredProducts().map((product) => (
            <Card 
              key={product.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewProduct(product)}
            >
              <div className="relative h-48 bg-gray-100">
                <img 
                  src={product.images[0]} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-md cursor-pointer"
                  onClick={(e) => handleToggleLike(product.id, e)}
                >
                  <Heart 
                    className={`h-5 w-5 ${product.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                  />
                </div>
                {product.type === 'share' && (
                  <div className="absolute top-2 left-2 bg-eco text-white px-2 py-1 text-xs font-medium rounded">
                    나눔
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-muted-foreground flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {product.location} • {product.distance}km
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(product.timestamp, 'PP', { locale: ko })}
                  </div>
                </div>
                <h3 className="font-medium text-lg mb-1 truncate">{product.title}</h3>
                <div className="font-bold text-coffee-dark mb-2">
                  {product.price === 'free' ? '무료나눔' : `${product.price.toLocaleString()}원`}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              </CardContent>
              <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between">
                <div className="flex items-center text-sm">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={product.seller.avatar} />
                    <AvatarFallback className="bg-coffee-cream text-coffee-dark text-xs">
                      {product.seller.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{product.seller.name}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Heart className="h-4 w-4 mr-1" />
                  <span>{product.likes}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* 검색 결과 없음 */}
        {getFilteredProducts().length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">검색 결과가 없습니다</p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setActiveTab('all');
              }}
            >
              필터 초기화
            </Button>
          </div>
        )}
      </main>
      
      {/* 상품 상세 대화상자 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {selectedProduct && (
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedProduct.title}</DialogTitle>
              <DialogDescription>
                {selectedProduct.timestamp.toLocaleDateString()} 등록
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* 이미지 슬라이더 */}
              <div className="relative h-64 md:h-80 bg-gray-100 rounded-md overflow-hidden">
                <img 
                  src={selectedProduct.images[currentImageIndex]} 
                  alt={selectedProduct.title} 
                  className="w-full h-full object-cover"
                />
                
                {selectedProduct.images.length > 1 && (
                  <>
                    <button 
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {selectedProduct.images.map((_, index) => (
                        <div 
                          key={index}
                          className={`h-1.5 w-1.5 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                {selectedProduct.type === 'share' && (
                  <div className="absolute top-2 left-2 bg-eco text-white px-2 py-1 text-xs font-medium rounded">
                    나눔
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-medium">{selectedProduct.title}</h3>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        <span>{selectedProduct.location} • {selectedProduct.distance}km</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => handleToggleLike(selectedProduct.id, e)}
                      className="h-8 w-8"
                    >
                      <Heart 
                        className={`h-5 w-5 ${selectedProduct.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                      />
                    </Button>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="text-2xl font-bold text-coffee-dark">
                    {selectedProduct.price === 'free' ? '무료나눔' : `${selectedProduct.price.toLocaleString()}원`}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">상품 설명</h4>
                  <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">카테고리</h4>
                  <Badge className="bg-coffee-cream/20 text-coffee-dark border-coffee-cream">
                    {categoryOptions.find(c => c.value === selectedProduct.category)?.label || selectedProduct.category}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={selectedProduct.seller.avatar} />
                      <AvatarFallback className="bg-coffee-cream text-coffee-dark">
                        {selectedProduct.seller.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{selectedProduct.seller.name}</div>
                      <div className="text-sm text-muted-foreground">
                        평점: {selectedProduct.seller.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-coffee hover:bg-coffee-dark"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    채팅하기
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* 채팅 대화상자 */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={selectedProduct?.seller.avatar} />
                <AvatarFallback className="bg-coffee-cream text-coffee-dark text-xs">
                  {selectedProduct?.seller.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              {selectedProduct?.seller.name}에게 메시지 보내기
            </DialogTitle>
          </DialogHeader>
          
          <div className="bg-gray-50 rounded-md p-3 mb-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-12 h-12">
                <img 
                  src={selectedProduct?.images[0]} 
                  alt={selectedProduct?.title} 
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div>
                <h4 className="font-medium text-sm">{selectedProduct?.title}</h4>
                <p className="text-sm font-bold text-coffee-dark">
                  {selectedProduct?.price === 'free' ? '무료나눔' : `${(selectedProduct?.price as number).toLocaleString()}원`}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-shrink-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-coffee-cream text-coffee-dark text-xs">
                  {user?.name.substring(0, 2) || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 relative">
              <textarea
                className="w-full border rounded-lg resize-none p-3 pr-10 min-h-20 focus:ring-1 focus:ring-coffee focus:outline-none"
                placeholder="메시지를 입력하세요..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <div className="absolute bottom-3 right-3 flex space-x-1">
                <button className="text-gray-400 hover:text-gray-600">
                  <Image className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>보통 몇 시간 내에 응답함</span>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsChatOpen(false)}
            >
              취소
            </Button>
            <Button 
              onClick={handleSendMessage}
              className="bg-coffee hover:bg-coffee-dark"
              disabled={!chatMessage.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              보내기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <UserNavbar />
      <Footer />
    </div>
  );
};

export default MarketPage;
