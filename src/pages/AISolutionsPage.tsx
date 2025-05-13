import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ExternalLink,
  Coffee,
  Sparkles,
  Bot,
  Leaf,
  Loader,
  Recycle,
  Send,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserNavbar from "@/components/UserNavbar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/apiClient";

// AI 추천 결과 타입
interface AiRecommendation {
  id: number;
  title: string;
  description: string;
  tags: string[];
  difficulty: string;
  duration: string;
  materials: string[];
  steps: string[];
}

// 채팅 메시지 타입
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  solution?: AiRecommendation;
  options?: ChatOption[];
  additionalSolutions?: AiRecommendation[];
}

// 채팅 옵션 타입
interface ChatOption {
  id: string;
  text: string;
  purpose?: string;
  beanType?: string;
  action?:
    | "purpose"
    | "beanType"
    | "generate"
    | "restart"
    | "view-alt-solution"
    | "none";
  solutionIndex?: number;
}

// 활용 목적 유형
const purposeOptions = [
  { value: "scrub", label: "스크럽/각질제거" },
  { value: "fertilizer", label: "비료/퇴비" },
  { value: "fragrance", label: "방향제" },
  { value: "craft", label: "공예품" },
  { value: "soap", label: "비누/화장품" },
];

// 원두 종류 목록
const beanTypes = [
  { value: "ethiopia", label: "에티오피아 예가체프" },
  { value: "colombia", label: "콜롬비아 수프리모" },
  { value: "brazil", label: "브라질 산토스" },
  { value: "guatemala", label: "과테말라 안티구아" },
  { value: "general", label: "원두 종류 상관없음" },
];

// 대화 상태
enum ConversationState {
  START,
  ASKING_PURPOSE,
  ASKING_BEAN_TYPE,
  GENERATING_SOLUTION,
  SOLUTION_READY,
}

const AISolutionsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "안녕하세요! 커피 찌꺼기를 활용한 다양한 업사이클링 방법을 알려드릴게요. 어떤 용도로 활용하고 싶으신지 알려주세요. (예: 스크럽, 비료, 방향제, 공예품, 비누 등)",
      timestamp: new Date(),
    },
  ]);

  const [conversationState, setConversationState] = useState<ConversationState>(
    ConversationState.ASKING_PURPOSE
  );
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [selectedBeanType, setSelectedBeanType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSolution, setSelectedSolution] =
    useState<AiRecommendation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 스크롤을 항상 아래로 유지
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 포커스 관리
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [conversationState]);

  // 해시 ID 생성 함수
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // 사용자 메시지 처리
  const handleUserMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // 현재 대화 상태에 따른 처리
    if (conversationState === ConversationState.ASKING_PURPOSE) {
      await handlePurposeInput(inputMessage);
    } else if (conversationState === ConversationState.ASKING_BEAN_TYPE) {
      await handleBeanTypeInput(inputMessage);
    } else if (conversationState === ConversationState.SOLUTION_READY) {
      // 솔루션 이미 생성된 상태에서 사용자가 새 메시지를 보내면 새로운 질문으로 간주
      resetConversation();

      // 새 메시지에 대한 답변
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content:
            "다른 업사이클링 방법을 찾아볼까요? 어떤 용도로 활용하고 싶으신지 알려주세요. (예: 스크럽, 비료, 방향제, 공예품, 비누 등)",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setConversationState(ConversationState.ASKING_PURPOSE);
      }, 500);
    }
  };

  // 용도 입력 처리
  const handlePurposeInput = async (input: string) => {
    let purposeValue = "";

    // 입력 텍스트를 기반으로 용도 추출
    for (const purpose of purposeOptions) {
      if (
        input.toLowerCase().includes(purpose.label.toLowerCase()) ||
        input.toLowerCase().includes(purpose.value.toLowerCase())
      ) {
        purposeValue = purpose.value;
        break;
      }
    }

    // 매칭되는 용도가 없는 경우 사용자 입력을 그대로 사용
    if (!purposeValue) {
      purposeValue = input.trim();
    }

    setSelectedPurpose(purposeValue);

    // 원두 종류 질문
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content:
          "어떤 원두 찌꺼기를 활용하실 건가요? 특정 원두 종류가 있으시면 알려주세요. 원두 종류가 상관없다면 '상관없음'이라고 말씀해주세요.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setConversationState(ConversationState.ASKING_BEAN_TYPE);
    }, 500);
  };

  // 원두 종류 입력 처리
  const handleBeanTypeInput = async (input: string) => {
    let beanTypeValue = "";

    // '상관없음' 또는 유사한 응답 처리
    if (
      input.includes("상관없") ||
      input.includes("상관 없") ||
      input.includes("아무거나") ||
      input.includes("모르") ||
      input.includes("어떤 것이든")
    ) {
      beanTypeValue = "general";
    } else {
      // 입력 텍스트를 기반으로 원두 종류 추출
      for (const bean of beanTypes) {
        if (
          input.toLowerCase().includes(bean.label.toLowerCase()) ||
          input.toLowerCase().includes(bean.value.toLowerCase())
        ) {
          beanTypeValue = bean.value;
          break;
        }
      }

      // 매칭되는 원두 종류가 없는 경우 사용자 입력을 그대로 사용
      if (!beanTypeValue) {
        beanTypeValue = input.trim();
      }
    }

    setSelectedBeanType(beanTypeValue);

    // 로딩 메시지 추가
    const loadingId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: "system",
        content: "솔루션을 생성 중입니다...",
        timestamp: new Date(),
      },
    ]);

    setConversationState(ConversationState.GENERATING_SOLUTION);

    // 솔루션 생성 요청
    await generateSolution(loadingId, selectedPurpose!, beanTypeValue);
  };

  // 채팅 옵션 선택 처리
  const handleOptionSelect = async (option: ChatOption) => {
    // 사용자 선택 메시지 추가
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: option.text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // 액션에 따른 처리
    if (option.action === "restart") {
      // 대화 재시작
      resetConversation();

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content:
            "새로운 업사이클링 방법을 찾아볼까요? 어떤 용도로 활용하고 싶으신지 알려주세요. (예: 스크럽, 비료, 방향제, 공예품, 비누 등)",
          timestamp: new Date(),
        },
      ]);

      setConversationState(ConversationState.ASKING_PURPOSE);
    } else if (option.action === "generate") {
      // 다른 솔루션 생성
      const loadingId = generateId();
      setMessages((prev) => [
        ...prev,
        {
          id: loadingId,
          role: "system",
          content: "다른 솔루션을 생성 중입니다...",
          timestamp: new Date(),
        },
      ]);

      await generateSolution(loadingId, selectedPurpose!, selectedBeanType!);
    } else if (
      option.action === "view-alt-solution" &&
      option.solutionIndex !== undefined
    ) {
      // 최신 메시지에서 추가 솔루션 찾기
      const latestMessage = [...messages]
        .reverse()
        .find((m) => m.additionalSolutions && m.additionalSolutions.length > 0);

      if (
        latestMessage &&
        latestMessage.additionalSolutions &&
        option.solutionIndex < latestMessage.additionalSolutions.length
      ) {
        const selectedAltSolution =
          latestMessage.additionalSolutions[option.solutionIndex];

        // 선택된 대체 솔루션 표시
        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: `${selectedAltSolution.title} 방법을 선택하셨습니다!\n\n${selectedAltSolution.description}`,
          timestamp: new Date(),
          solution: selectedAltSolution,
          options: [
            {
              id: "view-details",
              text: "상세 보기",
              action: "none",
            },
            {
              id: "generate-more",
              text: "다른 방법 추천",
              action: "generate",
            },
            {
              id: "restart",
              text: "처음부터 다시",
              action: "restart",
            },
          ],
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    }
  };

  // 대화 상태 초기화
  const resetConversation = () => {
    setSelectedPurpose(null);
    setSelectedBeanType(null);
    setConversationState(ConversationState.ASKING_PURPOSE);
  };

  // 솔루션 생성 API 호출
  const generateSolution = async (
    loadingId: string,
    purpose: string,
    beanType: string
  ) => {
    setIsGenerating(true);

    try {
      console.log(`목적: ${purpose}, 원두 종류: ${beanType}`);

      // API 호출
      const response = await apiClient.post("/api/solutions/generate", {
        purpose: purpose, // 실제 선택된 용도 값
        beanType: beanType, // 실제 선택된 원두 종류 값
      });

      console.log("API 전체 응답:", response);

      // 응답 데이터 처리
      let solution: AiRecommendation;
      let additionalSolutions: AiRecommendation[] = [];

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        // 데이터가 배열 형태로 오는 경우
        solution = response.data.data[0]; // 첫 번째 항목을 주요 솔루션으로 사용

        // 나머지 솔루션은 추가 옵션으로 저장
        if (response.data.data.length > 1) {
          additionalSolutions = response.data.data.slice(1);
        }

        console.log("선택된 주요 솔루션:", solution);
        console.log("추가 솔루션 옵션:", additionalSolutions);
      } else if (response.data && response.data.data) {
        // 데이터가 단일 객체로 오는 경우
        solution = response.data.data;
        console.log("선택된 솔루션:", solution);
      } else {
        // 폴백 솔루션 사용
        console.warn(
          "API에서 유효한 데이터를 받지 못했습니다. 폴백 솔루션을 사용합니다."
        );
        solution = {
          id: Math.floor(Math.random() * 1000),
          title: `${
            beanTypes.find((b) => b.value === beanType)?.label || beanType
          } 찌꺼기 ${
            purposeOptions.find((p) => p.value === purpose)?.label || purpose
          }`,
          description: `${
            beanTypes.find((b) => b.value === beanType)?.label || beanType
          } 찌꺼기를 사용한 ${
            purposeOptions.find((p) => p.value === purpose)?.label || purpose
          } 방법을 안내해드립니다.`,
          tags: [
            purposeOptions.find((p) => p.value === purpose)?.label || purpose,
          ],
          difficulty: ["쉬움", "보통", "어려움"][Math.floor(Math.random() * 3)],
          duration: `${Math.floor(Math.random() * 60) + 10}분`,
          materials: ["말린 커피 찌꺼기", "물", "용기"],
          steps: [
            "커피 찌꺼기를 완전히 말립니다.",
            "다른 재료와 혼합합니다.",
            "원하는 형태로 만들어 사용합니다.",
          ],
        };
      }

      // 옵션 생성
      const options = [];

      // 추가 솔루션이 있는 경우 선택 옵션 추가
      if (additionalSolutions.length > 0) {
        additionalSolutions.forEach((sol, index) => {
          options.push({
            id: `solution-${sol.id}`,
            text: `${sol.title}`,
            action: "view-alt-solution",
            solutionIndex: index,
          });
        });
      }

      // 항상 기본 옵션 추가
      options.push(
        {
          id: "view-details",
          text: "상세 보기",
          action: "none",
        },
        {
          id: "generate-more",
          text: "다른 방법 추천",
          action: "generate",
        },
        {
          id: "restart",
          text: "처음부터 다시",
          action: "restart",
        }
      );

      // 응답 메시지 생성
      const assistantMessage: ChatMessage = {
        id: loadingId, // 로딩 메시지를 교체
        role: "assistant",
        content: `${solution.title} 방법을 찾았어요!\n\n${solution.description}`,
        timestamp: new Date(),
        solution: solution,
        options: options.filter((opt) => opt.id !== "view-details"), // "view-details" 옵션 제외
        additionalSolutions: additionalSolutions,
      };

      // 로딩 메시지 교체
      setMessages((prev) =>
        prev.map((msg) => (msg.id === loadingId ? assistantMessage : msg))
      );

      setConversationState(ConversationState.SOLUTION_READY);
    } catch (error) {
      console.error("솔루션 생성 오류:", error);

      // 오류 메시지 표시
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                role: "assistant",
                content:
                  "죄송합니다. 솔루션을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.",
                options: [
                  {
                    id: "retry",
                    text: "다시 시도",
                    action: "generate",
                  },
                  {
                    id: "restart",
                    text: "처음부터 다시",
                    action: "restart",
                  },
                ],
              }
            : msg
        )
      );

      toast({
        title: "솔루션 생성 실패",
        description: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
        duration: 3000,
      });

      setConversationState(ConversationState.SOLUTION_READY);
    } finally {
      setIsGenerating(false);
    }
  };

  // 솔루션 상세 보기
  const handleViewSolutionDetails = (solution: AiRecommendation) => {
    setSelectedSolution(solution);
    setIsDetailOpen(true);
  };

  // 난이도 배지 렌더링
  const renderDifficultyBadge = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
      case "쉬움":
        return <Badge className="bg-green-500">쉬움</Badge>;
      case "medium":
      case "보통":
        return <Badge className="bg-yellow-500">보통</Badge>;
      case "hard":
      case "어려움":
        return <Badge className="bg-red-500">어려움</Badge>;
      default:
        return <Badge className="bg-blue-500">{difficulty}</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pb-16 md:pb-0 container px-4 py-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-coffee-dark">
            AI 업사이클링 솔루션
          </h1>
          <p className="text-muted-foreground">
            커피 찌꺼기의 특성과 원두 종류를 고려한 맞춤형 활용법을 AI가
            추천해드립니다.
          </p>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* 왼쪽 사이드바 - 활용 팁 */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Coffee className="mr-2 h-5 w-5 text-coffee" />
                  커피 찌꺼기 활용 팁
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-coffee shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">완전히 말리기</h4>
                      <p className="text-xs text-muted-foreground">
                        커피 찌꺼기는 습기에 취약하므로 완전히 말려 사용하세요.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Leaf className="h-5 w-5 text-coffee shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">밀폐 보관</h4>
                      <p className="text-xs text-muted-foreground">
                        밀폐 용기에 넣어 서늘하고 건조한 곳에 보관하세요.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Recycle className="h-5 w-5 text-coffee shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">원두 종류별 특성</h4>
                      <p className="text-xs text-muted-foreground">
                        다크 로스팅된 원두는 향이 진하고, 라이트 로스팅은 산미가
                        살아있어요.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-coffee" />
                  AI 추천 방식
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-4">
                  <p>
                    에코빈의 AI는 커피 찌꺼기의 특성과 원두 종류를 분석하여
                    최적의 업사이클링 방법을 추천합니다.
                  </p>
                  <p>
                    채팅 창에서 사용 목적과 원두 종류를 입력하면 맞춤형 솔루션을
                    제공해드려요.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽 메인 영역 - 채팅 인터페이스 */}
          <div className="md:col-span-3">
            <Card className="h-[calc(100vh-13rem)] flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-eco" />
                  에코빈 AI 어시스턴트
                </CardTitle>
                <CardDescription>
                  원하는 용도와 원두 종류를 입력하여 맞춤형 업사이클링 솔루션을
                  받아보세요.
                </CardDescription>
              </CardHeader>

              {/* 채팅 영역 */}
              <CardContent
                className="flex-1 overflow-auto p-4"
                ref={chatContainerRef}
              >
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : message.role === "system"
                          ? "justify-center"
                          : "justify-start"
                      }`}
                    >
                      {message.role === "system" ? (
                        <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
                          <Loader className="h-4 w-4 animate-spin mr-2" />
                          <span>{message.content}</span>
                        </div>
                      ) : (
                        <div
                          className={`rounded-lg p-4 max-w-[90%] ${
                            message.role === "user"
                              ? "bg-coffee text-white"
                              : "bg-coffee-cream/30 text-coffee-dark"
                          }`}
                        >
                          {message.role === "assistant" && (
                            <div className="flex items-center mb-2">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src="/ai-assistant.png" />
                                <AvatarFallback className="bg-eco text-white">
                                  AI
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">에코빈 AI</span>
                            </div>
                          )}

                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>

                          {message.solution && (
                            <div className="mt-4">
                              <Button
                                className="bg-coffee/80 hover:bg-coffee text-white"
                                onClick={() =>
                                  handleViewSolutionDetails(message.solution!)
                                }
                              >
                                상세 보기
                              </Button>
                            </div>
                          )}

                          {message.options && message.options.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {message.options
                                .filter(
                                  (option) =>
                                    option.action !== "none" &&
                                    option.id !== "view-details"
                                )
                                .map((option) => (
                                  <Button
                                    key={option.id}
                                    variant="outline"
                                    className="border-coffee text-coffee hover:bg-coffee-cream/20"
                                    onClick={() => handleOptionSelect(option)}
                                  >
                                    {option.text}
                                  </Button>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* 입력 영역 */}
              <CardFooter className="p-4 pt-0">
                <form
                  onSubmit={handleUserMessageSubmit}
                  className="w-full flex gap-2"
                >
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      conversationState === ConversationState.ASKING_PURPOSE
                        ? "어떤 용도로 활용하고 싶으신가요? (예: 스크럽, 비료, 방향제...)"
                        : conversationState ===
                          ConversationState.ASKING_BEAN_TYPE
                        ? "어떤 원두를 사용하시나요? (상관없으면 '상관없음'이라고 입력하세요)"
                        : "메시지를 입력하세요..."
                    }
                    disabled={
                      isGenerating ||
                      conversationState ===
                        ConversationState.GENERATING_SOLUTION
                    }
                    className="border-coffee-cream focus:border-coffee"
                  />
                  <Button
                    type="submit"
                    className="bg-coffee hover:bg-coffee-dark"
                    disabled={
                      isGenerating ||
                      conversationState ===
                        ConversationState.GENERATING_SOLUTION
                    }
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      {/* 솔루션 상세 대화상자 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {selectedSolution && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedSolution.title}</DialogTitle>
              <DialogDescription>
                {selectedSolution.description}
              </DialogDescription>
            </DialogHeader>

            <div className="gap-6">
              <div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      {selectedSolution.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-coffee-cream/20 border-coffee-cream text-coffee-dark"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {renderDifficultyBadge(selectedSolution.difficulty)}
                  </div>
                </div>
                <div className="text-sm text-right mb-6">
                  <span className="font-medium">소요 시간:</span>{" "}
                  {selectedSolution.duration}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-coffee-dark mb-2">
                    필요한 재료
                  </h4>
                  <ul className="space-y-1 list-disc pl-5">
                    {selectedSolution.materials.map((material, index) => (
                      <li key={index} className="text-sm">
                        {material}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-coffee-dark mb-2">
                    만드는 방법
                  </h4>
                  <ol className="space-y-2 pl-5">
                    {selectedSolution.steps.map((step, index) => (
                      <li key={index} className="text-sm">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                className="bg-coffee hover:bg-coffee-dark"
                onClick={() => setIsDetailOpen(false)}
              >
                닫기
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <UserNavbar />
      <Footer />
    </div>
  );
};

export default AISolutionsPage;
