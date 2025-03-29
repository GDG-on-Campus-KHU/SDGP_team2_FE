
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Share2, Download, BarChart3, TrendingUp, Leaf, Coffee, Award, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserNavbar from '@/components/UserNavbar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

// 차트를 위한 데이터
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// 월별 기여 데이터
const monthlyData = [
  { name: '1월', amount: 0 },
  { name: '2월', amount: 0 },
  { name: '3월', amount: 0 },
  { name: '4월', amount: 0 },
  { name: '5월', amount: 0 },
  { name: '6월', amount: 0.5 },
  { name: '7월', amount: 0.8 },
  { name: '8월', amount: 1.2 },
  { name: '9월', amount: 1.7 },
  { name: '10월', amount: 2.5 },
  { name: '11월', amount: 2.8 },
  { name: '12월', amount: 0 },
];

// 원두 활용 유형 데이터
const usageTypeData = [
  { name: '스크럽/비누', value: 40 },
  { name: '방향제', value: 25 },
  { name: '퇴비/비료', value: 20 },
  { name: '공예품', value: 15 },
];

// 지역별 기여도 데이터
const regionData = [
  { name: '서울', amount: 95.3 },
  { name: '경기', amount: 87.2 },
  { name: '인천', amount: 82.5 },
  { name: '부산', amount: 78.4 },
  { name: '대구', amount: 76.9 },
  { name: '대전', amount: 75.2 },
];

// 색상 팔레트
const COLORS = ['#795548', '#A1887F', '#BCAAA4', '#D7CCC8'];

const EcoReportPage = () => {
  const { user } = useAuth();
  
  // 모의 환경 리포트 데이터
  const ecoReport = {
    totalCollections: 8,
    totalAmount: 9.5,
    carbonSaved: 5.7,
    waterSaved: 285,
    level: 2,
    levelName: '그린 비기너',
    levelProgress: 65,
    nextLevelName: '그린 익스플로러',
    amountNeeded: 5.5,
    regionRank: 3,
    regionPercentile: 85,
    totalUsers: 1243,
  };
  
  // SVG 경로 데이터 (환경 배지용)
  const badgeSvgPath = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z";
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pb-16 md:pb-0 container px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-coffee-dark">환경 기여도 리포트</h1>
            <p className="text-muted-foreground">
              커피 찌꺼기 재활용을 통한 당신의 환경 기여도를 확인하세요.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-eco text-eco">
              <Share2 className="mr-2 h-4 w-4" />
              공유하기
            </Button>
            <Button variant="outline" className="border-eco text-eco">
              <Download className="mr-2 h-4 w-4" />
              PDF 저장
            </Button>
          </div>
        </div>
        
        {/* 종합 요약 카드 */}
        <Card className="mb-8 bg-eco-light border-eco">
          <CardHeader>
            <CardTitle className="text-eco-dark">환경 기여 요약</CardTitle>
            <CardDescription>
              2023년 기준 총 환경 기여도와 달성 레벨입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="bg-white p-5 rounded-md shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                  <Coffee className="mr-1 h-4 w-4 text-coffee" />
                  총 수거량
                </h3>
                <div className="text-3xl font-bold text-coffee-dark">{ecoReport.totalAmount}L</div>
                <div className="text-xs text-muted-foreground mt-1">총 {ecoReport.totalCollections}회 수거</div>
              </div>
              
              <div className="bg-white p-5 rounded-md shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                  <Leaf className="mr-1 h-4 w-4 text-eco" />
                  절약된 탄소량
                </h3>
                <div className="text-3xl font-bold text-eco">{ecoReport.carbonSaved}kg</div>
                <div className="text-xs text-muted-foreground mt-1">CO<sub>2</sub> 배출 감소량</div>
              </div>
              
              <div className="bg-white p-5 rounded-md shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                  <Award className="mr-1 h-4 w-4 text-yellow-500" />
                  환경 기여 레벨
                </h3>
                <div className="text-3xl font-bold text-coffee-dark">Lv.{ecoReport.level}</div>
                <div className="text-xs text-muted-foreground mt-1">{ecoReport.levelName}</div>
              </div>
              
              <div className="bg-white p-5 rounded-md shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                  <MapPin className="mr-1 h-4 w-4 text-red-500" />
                  지역 내 순위
                </h3>
                <div className="text-3xl font-bold text-coffee-dark">{ecoReport.regionRank}위</div>
                <div className="text-xs text-muted-foreground mt-1">상위 {ecoReport.regionPercentile}% 기여자</div>
              </div>
            </div>
            
            <div className="mt-6 bg-white p-5 rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-medium text-coffee-dark">다음 레벨까지</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-eco">{ecoReport.amountNeeded}L</strong> 더 모으면 <strong>{ecoReport.nextLevelName}</strong> 레벨이 됩니다!
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-eco">{ecoReport.levelProgress}%</Badge>
                </div>
              </div>
              <Progress value={ecoReport.levelProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        {/* 월별 추이 차트 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-coffee" />
              월별 기여 추이
            </CardTitle>
            <CardDescription>
              지난 1년간 커피 찌꺼기 수거량 변화 추이입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}L`, '수거량']}
                  labelFormatter={(label) => `${label} 기여량`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="커피 찌꺼기 수거량 (L)"
                  stroke="#795548"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* 활용 유형 및 지역 비교 */}
        <div className="grid gap-8 mb-8 md:grid-cols-2">
          {/* 활용 유형 분석 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-coffee" />
                원두 활용 유형별 비율
              </CardTitle>
              <CardDescription>
                어떤 용도로 커피 찌꺼기를 재활용했는지 비율입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usageTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {usageTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, '비율']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* 지역별 비교 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-red-500" />
                지역별 평균 기여도 비교
              </CardTitle>
              <CardDescription>
                다른 지역과 비교한 나의 기여도 (상위 %)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regionData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, '상위 기여도']}
                    labelFormatter={(label) => `${label} 지역`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="amount" 
                    name="상위 기여도 (%)" 
                    fill="#A1887F" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* 환경 영향 섹션 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="mr-2 h-5 w-5 text-eco" />
              환경 영향 분석
            </CardTitle>
            <CardDescription>
              당신의 커피 찌꺼기 재활용이 미친 환경적 영향입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-eco-light p-5 rounded-md">
                <h3 className="font-medium text-eco-dark mb-3">탄소 배출 감소</h3>
                <div className="text-3xl font-bold text-eco-dark mb-1">{ecoReport.carbonSaved}kg</div>
                <p className="text-sm text-muted-foreground">
                  이는 약 <strong>{Math.round(ecoReport.carbonSaved * 4.3)}km</strong>의 자동차 주행으로 발생하는 
                  이산화탄소량과 동일합니다.
                </p>
              </div>
              
              <div className="bg-blue-50 p-5 rounded-md">
                <h3 className="font-medium text-blue-800 mb-3">물 사용량 절약</h3>
                <div className="text-3xl font-bold text-blue-800 mb-1">{ecoReport.waterSaved}L</div>
                <p className="text-sm text-muted-foreground">
                  이는 약 <strong>{Math.round(ecoReport.waterSaved / 150)}</strong>일 동안의 
                  일반 가정 물 사용량과 동일합니다.
                </p>
              </div>
              
              <div className="bg-amber-50 p-5 rounded-md">
                <h3 className="font-medium text-amber-800 mb-3">퇴비 전환량</h3>
                <div className="text-3xl font-bold text-amber-800 mb-1">{Math.round(ecoReport.totalAmount * 0.8)}kg</div>
                <p className="text-sm text-muted-foreground">
                  이는 약 <strong>{Math.round(ecoReport.totalAmount * 0.2)}</strong>개의 
                  식물을 키울 수 있는 양입니다.
                </p>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="bg-green-50 p-5 rounded-md">
              <h3 className="font-medium text-green-800 mb-3 flex items-center">
                <Award className="mr-2 h-5 w-5 text-yellow-500" />
                총 환경 기여 점수
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-4xl font-bold text-green-800 mb-2">{Math.round(ecoReport.totalAmount * 10)}점</div>
                  <p className="text-sm text-muted-foreground">
                    전체 사용자 <strong>{ecoReport.totalUsers}명</strong> 중 상위 <strong>{ecoReport.regionPercentile}%</strong>
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <p className="text-sm text-green-800 mb-3">
                    귀하는 {ecoReport.totalAmount}L의 커피 찌꺼기를 재활용하여 {ecoReport.carbonSaved}kg의 이산화탄소 발생을 
                    억제하고, {ecoReport.waterSaved}L의 물 사용을 절약하는데 기여했습니다. 
                    이는 나무 {Math.round(ecoReport.carbonSaved / 0.5)}그루를 심는 것과 동일한 효과입니다.
                  </p>
                  
                  <div className="flex gap-3">
                    <Button className="bg-eco hover:bg-eco-dark">다음 레벨 달성 팁</Button>
                    <Button variant="outline" className="border-eco text-eco hover:bg-eco-light/50">친구에게 공유하기</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 획득한 배지 섹션 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-yellow-500" />
              획득한 환경 배지
            </CardTitle>
            <CardDescription>
              당신의 환경 활동을 인정하는 배지들입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {/* 획득한 배지 */}
              <div className="flex flex-col items-center bg-eco-light p-4 rounded-md">
                <div className="w-16 h-16 rounded-full bg-eco text-white flex items-center justify-center mb-3">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                    <path d={badgeSvgPath} />
                  </svg>
                </div>
                <h4 className="font-medium text-eco-dark text-center">첫 수거 완료</h4>
                <p className="text-xs text-center mt-1 text-muted-foreground">2023.08.15 획득</p>
              </div>
              
              <div className="flex flex-col items-center bg-eco-light p-4 rounded-md">
                <div className="w-16 h-16 rounded-full bg-eco text-white flex items-center justify-center mb-3">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                    <path d={badgeSvgPath} />
                  </svg>
                </div>
                <h4 className="font-medium text-eco-dark text-center">5L 달성</h4>
                <p className="text-xs text-center mt-1 text-muted-foreground">2023.10.02 획득</p>
              </div>
              
              {/* 잠긴 배지 */}
              <div className="flex flex-col items-center bg-gray-100 p-4 rounded-md opacity-60">
                <div className="w-16 h-16 rounded-full bg-gray-300 text-white flex items-center justify-center mb-3">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                    <path d={badgeSvgPath} />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-600 text-center">10L 달성</h4>
                <p className="text-xs text-center mt-1 text-muted-foreground">잠금 상태</p>
              </div>
              
              <div className="flex flex-col items-center bg-gray-100 p-4 rounded-md opacity-60">
                <div className="w-16 h-16 rounded-full bg-gray-300 text-white flex items-center justify-center mb-3">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                    <path d={badgeSvgPath} />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-600 text-center">3개월 연속 수거</h4>
                <p className="text-xs text-center mt-1 text-muted-foreground">잠금 상태</p>
              </div>
              
              <div className="flex flex-col items-center bg-gray-100 p-4 rounded-md opacity-60">
                <div className="w-16 h-16 rounded-full bg-gray-300 text-white flex items-center justify-center mb-3">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                    <path d={badgeSvgPath} />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-600 text-center">지역 1위 달성</h4>
                <p className="text-xs text-center mt-1 text-muted-foreground">잠금 상태</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <UserNavbar />
      <Footer />
    </div>
  );
};

export default EcoReportPage;
