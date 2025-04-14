import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "../lib/auth.tsx";
import { queryClient } from "@/lib/queryClient";
import { vi } from "date-fns/locale";

interface LotteryResult {
  id: number;
  date: string;
  region: string;
  special: string;
  first: string;
  second: string[];
  third: string[];
  fourth: string[];
  fifth: string[];
  sixth: string[];
  seventh: string[];
}

export default function AdminLotteryPage() {
  const { isAdmin } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if not admin
    if (isAdmin === false) {
      window.location.href = "/";
    }
  }, [isAdmin]);

  const { data: lotteryResults, isLoading } = useQuery({
    queryKey: ['/api/lottery/date', selectedDate?.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!selectedDate) return [];
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/lottery/date/${dateStr}`);
      if (!response.ok) throw new Error("Không thể tải kết quả xổ số");
      return response.json();
    },
    enabled: !!selectedDate,
  });

  const crawlMutation = useMutation({
    mutationFn: async () => {
      const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      return apiRequest("POST", "/api/admin/crawler/lottery", { date: dateStr });
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã cập nhật kết quả xổ số mới nhất",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/lottery/date'] });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật kết quả xổ số",
        variant: "destructive",
      });
    },
  });

  const handleCrawl = () => {
    crawlMutation.mutate();
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý kết quả xổ số</h1>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "dd/MM/yyyy", { locale: vi })
                  ) : (
                    "Chọn ngày"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button 
              onClick={handleCrawl} 
              disabled={crawlMutation.isPending}
            >
              {crawlMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật kết quả"
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="mienbac">
          <TabsList className="mb-4">
            <TabsTrigger value="mienbac">Miền Bắc</TabsTrigger>
            <TabsTrigger value="mientrung">Miền Trung</TabsTrigger>
            <TabsTrigger value="miennam">Miền Nam</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Đang tải kết quả...</span>
            </div>
          ) : (
            <>
              <TabsContent value="mienbac">
                <LotteryResultPanel 
                  region="mienbac" 
                  results={lotteryResults?.filter((r: LotteryResult) => r.region === "mienbac") || []} 
                />
              </TabsContent>
              <TabsContent value="mientrung">
                <LotteryResultPanel 
                  region="mientrung" 
                  results={lotteryResults?.filter((r: LotteryResult) => r.region === "mientrung") || []} 
                />
              </TabsContent>
              <TabsContent value="miennam">
                <LotteryResultPanel 
                  region="miennam" 
                  results={lotteryResults?.filter((r: LotteryResult) => r.region === "miennam") || []} 
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  );
}

interface LotteryResultPanelProps {
  region: string;
  results: LotteryResult[];
}

function LotteryResultPanel({ region, results }: LotteryResultPanelProps) {
  const regionText = region === "mienbac" ? "Miền Bắc" : region === "mientrung" ? "Miền Trung" : "Miền Nam";

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{regionText}</CardTitle>
          <CardDescription>Không có kết quả xổ số cho ngày này</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Chưa có dữ liệu. Vui lòng nhấn nút "Cập nhật kết quả" để cập nhật kết quả xổ số mới nhất.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result) => (
        <Card key={result.id}>
          <CardHeader>
            <CardTitle>{regionText}</CardTitle>
            <CardDescription>
              {new Date(result.date).toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2">Giải đặc biệt</h3>
                <div className="text-2xl font-bold text-primary">{result.special}</div>
              </div>
              <Separator />
              <div>
                <h3 className="font-bold mb-2">Giải nhất</h3>
                <div className="text-xl">{result.first}</div>
              </div>
              <Separator />
              <div>
                <h3 className="font-bold mb-2">Giải nhì</h3>
                <div className="grid grid-cols-2 gap-2">
                  {result.second.map((num, idx) => (
                    <div key={idx} className="p-2 border rounded text-center">{num}</div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-bold mb-2">Giải ba</h3>
                <div className="grid grid-cols-3 gap-2">
                  {result.third.map((num, idx) => (
                    <div key={idx} className="p-2 border rounded text-center">{num}</div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-bold mb-2">Giải tư</h3>
                <div className="grid grid-cols-2 gap-2">
                  {result.fourth.map((num, idx) => (
                    <div key={idx} className="p-2 border rounded text-center">{num}</div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-bold mb-2">Giải năm</h3>
                <div className="grid grid-cols-3 gap-2">
                  {result.fifth.map((num, idx) => (
                    <div key={idx} className="p-2 border rounded text-center">{num}</div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-bold mb-2">Giải sáu</h3>
                <div className="grid grid-cols-3 gap-2">
                  {result.sixth.map((num, idx) => (
                    <div key={idx} className="p-2 border rounded text-center">{num}</div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-bold mb-2">Giải bảy</h3>
                <div className="grid grid-cols-4 gap-2">
                  {result.seventh.map((num, idx) => (
                    <div key={idx} className="p-2 border rounded text-center">{num}</div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Cập nhật lúc: {new Date(result.date).toLocaleTimeString("vi-VN")}
            </p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}