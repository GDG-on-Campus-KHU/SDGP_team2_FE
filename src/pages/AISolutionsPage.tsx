import React, { useState, useRef, useEffect, useTransition } from "react";
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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: t("ai_solutions.chat_purpose"),
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
          content: t("ai_solutions.chat_purpose"),
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
        content: t("ai_solutions.chat_bean"),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setConversationState(ConversationState.ASKING_BEAN_TYPE);
    }, 500);
  };

  // 원두 종류 입력 처리
  const handleBeanTypeInput = async (input: string) => {
    let beanTypeValue = "";

    beanTypeValue = input.trim();

    setSelectedBeanType(beanTypeValue);

    // 로딩 메시지 추가
    const loadingId = generateId();
    setMessages((prev:any) => [
      ...prev,
      {
        id: loadingId,
        role: "system",
        content: t("ai_solutions.generating"),
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
          content: t("ai_solutions.chat_purpose"),
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
          content: t("ai_solutions.generating"),
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
          content: `${selectedAltSolution.title} \n\n${selectedAltSolution.description}`,
          timestamp: new Date(),
          solution: selectedAltSolution,
          options: [
            {
              id: "view-details",
              text: t("ai_solutions.solution_detail"),
              action: "none",
            },
            {
              id: "generate-more",
              text: t("ai_solutions.other_recommendations"),
              action: "generate",
            },
            {
              id: "restart",
              text: t("ai_solutions.restart"),
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
      } else if (response.data && response.data.data) {
        // 데이터가 단일 객체로 오는 경우
        solution = response.data.data;
      } else {
        // 폴백 솔루션 사용

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
          text: t("ai_solutions.solution_detail"),
          action: "none",
        },
        {
          id: "generate-more",
          text: t("ai_solutions.other_recommendations"),
          action: "generate",
        },
        {
          id: "restart",
          text: t("ai_solutions.restart"),
          action: "restart",
        }
      );

      // 응답 메시지 생성
      const assistantMessage: ChatMessage = {
        id: loadingId, // 로딩 메시지를 교체
        role: "assistant",
        content: `[${solution.title}] \n\n${solution.description}`,
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
      // 오류 메시지 표시
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                role: "assistant",
                content: t("error.generic_error" + "error.try_again"),
                options: [
                  {
                    id: "retry",
                    text: t("error.try_again"),
                    action: "generate",
                  },
                  {
                    id: "restart",
                    text: t("ai_solutions.restart"),
                    action: "restart",
                  },
                ],
              }
            : msg
        )
      );

      toast({
        title: t("error.generic_error"),
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
        return (
          <Badge className="bg-green-500">
            {t("ai_solutions.difficulty_easy")}
          </Badge>
        );
      case "medium":
      case "보통":
        return (
          <Badge className="bg-yellow-500">
            {t("ai_solutions.difficulty_medium")}
          </Badge>
        );
      case "hard":
      case "어려움":
        return (
          <Badge className="bg-red-500">
            {t("ai_solutions.difficulty_hard")}
          </Badge>
        );
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
            {t("ai_solutions.title")}
          </h1>
          <p className="text-muted-foreground">{t("ai_solutions.subtitle")}</p>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* 왼쪽 사이드바 - 활용 팁 */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Coffee className="mr-2 h-5 w-5 text-coffee" />
                  {t("ai_solutions.usage_tips")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-coffee shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">
                        {t("ai_solutions.usage_tips")}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {t("ai_solutions.tip_dry_desc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Leaf className="h-5 w-5 text-coffee shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">
                        {" "}
                        {t("ai_solutions.tip_store")}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {t("ai_solutions.tip_store_desc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Recycle className="h-5 w-5 text-coffee shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">
                        {t("ai_solutions.tip_bean")}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {t("ai_solutions.tip_bean_desc")}
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
                  {t("ai_solutions.ai_method")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-4">
                  <p>{t("ai_solutions.ai_method_desc1")}</p>
                  <p>{t("ai_solutions.ai_method_desc2")}</p>
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
                  {t("ai_solutions.ai_assistant")}
                </CardTitle>
                <CardDescription>
                  {t("ai_solutions.ai_assistant_desc")}
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
                              <span className="font-medium">Eco-Bean AI</span>
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
                                {t("ai_solutions.solution_detail")}
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
                        ? t("ai_solutions.chat_purpose")
                        : conversationState ===
                          ConversationState.ASKING_BEAN_TYPE
                        ? t("ai_solutions.chat_bean")
                        : t("ai_solutions.chat_message")
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
                  <span className="font-medium">
                    {t("ai_solutions.duration")}
                  </span>{" "}
                  {selectedSolution.duration}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-coffee-dark mb-2">
                    {t("ai_solutions.materials")}
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
                    {t("ai_solutions.steps")}
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
                {t("common.close")}
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
