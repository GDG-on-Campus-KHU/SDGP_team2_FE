
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Coffee, 
  MapPin, 
  Phone, 
  Package, 
  Calendar, 
  Users, 
  TrendingUp 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const CafeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const cafeInfo = {
    name: user?.name || '카페명',
    address: '서울시 강남구 테헤란로 101',
    contact: '02-1234-5678',
    mainBean: '에티오피아 예가체프',
    openHours: '매일 07:00 - 22:00',
    lastGroundUpdate: '2023-12-01',
    totalCollections: 34,
    totalGrounds: '85L',
    groundThisMonth: '15L',
    ecoContribution: 12.5, // CO2 절감량 (kg)
  };
  
  const recentRequests = [
    { id: 1, name: '김환경', date: '2023-12-05', amount: '5L', status: '대기' },
    { id: 2, name: '이그린', date: '2023-12-04', amount: '3L', status: '수락' },
    { id: 3, name: '박에코', date: '2023-12-01', amount: '7L', status: '완료' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-coffee-dark">카페 대시보드</h2>
        <Button 
          onClick={() => navigate('/cafe/settings')}
          variant="outline" 
          className="border-coffee text-coffee hover:bg-coffee-cream/50"
        >
          카페 정보 수정
        </Button>
      </div>
      
      {/* 요약 카드 영역 */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">이번 달 찌꺼기</CardTitle>
            <CardDescription>등록된 커피 찌꺼기 총량</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-coffee">{cafeInfo.groundThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              지난 달 대비 +23%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">총 수거 횟수</CardTitle>
            <CardDescription>수거 완료된 총 횟수</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-coffee">{cafeInfo.totalCollections}회</div>
            <p className="text-xs text-muted-foreground mt-1">
              지난 달 4회 완료
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">환경 기여도</CardTitle>
            <CardDescription>절감된 탄소 배출량</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-eco">{cafeInfo.ecoContribution}kg</div>
            <p className="text-xs text-muted-foreground mt-1">
              CO<sub>2</sub> 배출 감소량
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* 카페 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>내 카페 정보</CardTitle>
          <CardDescription>등록된 카페 기본 정보입니다</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-coffee" />
              <div>
                <p className="text-sm font-medium leading-none">카페명</p>
                <p className="text-sm text-muted-foreground">{cafeInfo.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-coffee" />
              <div>
                <p className="text-sm font-medium leading-none">주소</p>
                <p className="text-sm text-muted-foreground">{cafeInfo.address}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-coffee" />
              <div>
                <p className="text-sm font-medium leading-none">연락처</p>
                <p className="text-sm text-muted-foreground">{cafeInfo.contact}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Coffee className="h-5 w-5 text-coffee" />
              <div>
                <p className="text-sm font-medium leading-none">대표 원두</p>
                <p className="text-sm text-muted-foreground">{cafeInfo.mainBean}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-coffee" />
              <div>
                <p className="text-sm font-medium leading-none">운영 시간</p>
                <p className="text-sm text-muted-foreground">{cafeInfo.openHours}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Package className="h-5 w-5 text-coffee" />
              <div>
                <p className="text-sm font-medium leading-none">마지막 찌꺼기 등록일</p>
                <p className="text-sm text-muted-foreground">{cafeInfo.lastGroundUpdate}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 최근 수거 요청 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>최근 수거 요청</CardTitle>
            <CardDescription>최근에 들어온 수거 요청 내역입니다</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/cafe/requests')}
            className="border-coffee text-coffee hover:bg-coffee-cream/50"
          >
            모든 요청 보기
          </Button>
        </CardHeader>
        <CardContent>
          {recentRequests.length > 0 ? (
            <div className="space-y-5">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-coffee-cream/30 p-2">
                      <Users className="h-5 w-5 text-coffee-dark" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{request.name}</p>
                      <p className="text-xs text-muted-foreground">{request.date} • {request.amount}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`
                      inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                      ${request.status === '대기' ? 'bg-yellow-100 text-yellow-800' : 
                        request.status === '수락' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'}
                    `}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>최근 수거 요청이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 빠른 액션 버튼들 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button 
          onClick={() => navigate('/cafe/beans')}
          className="bg-coffee hover:bg-coffee-dark py-6"
        >
          <Coffee className="mr-2 h-5 w-5" />
          원두 등록하기
        </Button>
        <Button 
          onClick={() => navigate('/cafe/grounds')}
          className="bg-eco hover:bg-eco-dark py-6"
        >
          <Package className="mr-2 h-5 w-5" />
          찌꺼기 등록하기
        </Button>
        <Button 
          onClick={() => navigate('/cafe/requests')}
          variant="outline" 
          className="border-coffee text-coffee hover:bg-coffee-cream/50 py-6"
        >
          <Users className="mr-2 h-5 w-5" />
          수거 요청 관리
        </Button>
      </div>
    </div>
  );
};

export default CafeDashboard;
