import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import LoadingSpinner, { PageLoader } from "@/components/LoadingSpinner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AlertCircle, AlertTriangle, Check } from "lucide-react";
import { Helmet } from "react-helmet";

// Schema for number input with validation
const numberInputSchema = z.object({
  numbers: z.string().min(1, "Vui lòng nhập số"),
  amount: z.string().min(1, "Vui lòng nhập số tiền cược"),
});

type NumberInputValues = z.infer<typeof numberInputSchema>;

export default function BettingPage() {
  const { type = "lo" } = useParams();
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(type);
  const [betDate, setBetDate] = useState<Date>(new Date());

  // Get betting settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/settings/public'],
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Update URL when tab changes
  useEffect(() => {
    navigate(`/choi/${activeTab}`, { replace: true });
  }, [activeTab, navigate]);

  // Set bet date to next 18:15
  useEffect(() => {
    const now = new Date();
    const today1815 = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      18, 15, 0
    );

    // If it's past 18:15, set for tomorrow
    if (now > today1815) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 15, 0, 0);
      setBetDate(tomorrow);
    } else {
      setBetDate(today1815);
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để đặt cược",
        variant: "destructive",
      });
      navigate("/dang-nhap");
    }
  }, [user, authLoading, navigate, toast]);

  // Show loading if auth is loading or user is not logged in
  if (authLoading || !user) {
    return <PageLoader />;
  }

  return (
    <Layout>
      <Helmet>
        <title>Đặt cược - Rồng Bạch Kim</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Đặt cược</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Chọn loại cược</CardTitle>
            <CardDescription>
              Ngày mở thưởng: {format(betDate, "dd/MM/yyyy", { locale: vi })} - 18:15
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="lo">Lô</TabsTrigger>
                <TabsTrigger value="de">Đề</TabsTrigger>
                <TabsTrigger value="3cang">3 Càng</TabsTrigger>
                <TabsTrigger value="lo-xien">Lô Xiên</TabsTrigger>
              </TabsList>
              
              <TabsContent value="lo">
                <BettingTabContent 
                  title="Đánh Lô"
                  description="Chọn các cặp số 2 chữ số (00-99) từ kết quả xổ số"
                  instructions="Nhập các cặp số cách nhau bởi dấu phẩy hoặc khoảng trắng (vd: 23,45,67)"
                  betType="lo"
                  betDate={betDate}
                  settings={settings}
                  isLoading={settingsLoading}
                />
              </TabsContent>
              
              <TabsContent value="de">
                <BettingTabContent 
                  title="Đánh Đề"
                  description="Chọn 2 chữ số cuối của giải Đặc biệt XSMB"
                  instructions="Nhập các cặp số cách nhau bởi dấu phẩy hoặc khoảng trắng (vd: 23,45,67)"
                  betType="de"
                  betDate={betDate}
                  settings={settings}
                  isLoading={settingsLoading}
                />
              </TabsContent>
              
              <TabsContent value="3cang">
                <BettingTabContent 
                  title="3 Càng"
                  description="Chọn 3 chữ số cuối của giải Đặc biệt XSMB"
                  instructions="Nhập các bộ 3 số cách nhau bởi dấu phẩy hoặc khoảng trắng (vd: 123,456,789)"
                  betType="3cang"
                  betDate={betDate}
                  settings={settings}
                  isLoading={settingsLoading}
                />
              </TabsContent>
              
              <TabsContent value="lo-xien">
                <LoxienTabContent 
                  betDate={betDate}
                  settings={settings}
                  isLoading={settingsLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

interface BettingTabContentProps {
  title: string;
  description: string;
  instructions: string;
  betType: string;
  betDate: Date;
  settings: any;
  isLoading: boolean;
}

function BettingTabContent({
  title,
  description,
  instructions,
  betType,
  betDate,
  settings,
  isLoading
}: BettingTabContentProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [parsedNumbers, setParsedNumbers] = useState<string[]>([]);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);

  const form = useForm<NumberInputValues>({
    resolver: zodResolver(numberInputSchema),
    defaultValues: {
      numbers: "",
      amount: "",
    },
  });

  // Bet mutation
  const betMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/bets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      form.reset();
      setParsedNumbers([]);
      setBetAmount(0);
      setPayoutAmount(0);
      toast({
        title: "Đặt cược thành công",
        description: "Đặt cược của bạn đã được ghi nhận",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Đặt cược thất bại",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        variant: "destructive",
      });
    },
  });

  // Parse input when input changes
  const handleNumbersChange = (value: string) => {
    // Split by commas or spaces and filter out empty strings
    const numbers = value.split(/[,\s]+/).filter(Boolean);
    
    // Validate each number based on bet type
    let validNumbers: string[] = [];
    
    if (betType === "3cang") {
      validNumbers = numbers.filter(num => /^\d{3}$/.test(num));
    } else {
      validNumbers = numbers.filter(num => /^\d{2}$/.test(num));
    }
    
    setParsedNumbers(validNumbers);
  };

  // Calculate potential payout
  const calculatePayout = (amount: string) => {
    if (!settings || !amount) {
      setBetAmount(0);
      setPayoutAmount(0);
      return;
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      setBetAmount(0);
      setPayoutAmount(0);
      return;
    }
    
    setBetAmount(numAmount);
    
    // Get rate for bet type
    const rates = settings.bettingRates;
    const rate = rates[betType === "3cang" ? "3cang" : betType];
    
    if (rate) {
      // Calculate payout for each number
      const totalPayout = numAmount * rate * parsedNumbers.length;
      setPayoutAmount(totalPayout);
    }
  };

  const onSubmit = async (data: NumberInputValues) => {
    if (parsedNumbers.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập ít nhất một số hợp lệ",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Lỗi",
        description: "Số tiền cược không hợp lệ",
        variant: "destructive",
      });
      return;
    }

    if (amount > (user?.balance || 0)) {
      toast({
        title: "Số dư không đủ",
        description: "Vui lòng nạp thêm tiền để đặt cược",
        variant: "destructive",
      });
      return;
    }

    if (settings?.minBetAmount && amount < settings.minBetAmount) {
      toast({
        title: "Lỗi",
        description: `Số tiền cược tối thiểu là ${new Intl.NumberFormat('vi-VN').format(settings.minBetAmount)}đ`,
        variant: "destructive",
      });
      return;
    }

    if (settings?.maxBetAmount && amount > settings.maxBetAmount) {
      toast({
        title: "Lỗi",
        description: `Số tiền cược tối đa là ${new Intl.NumberFormat('vi-VN').format(settings.maxBetAmount)}đ`,
        variant: "destructive",
      });
      return;
    }

    // Submit bet
    betMutation.mutate({
      type: betType,
      numbers: parsedNumbers,
      amount,
      date: betDate.toISOString(),
      multiplier: settings?.bettingRates?.[betType] || 0
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="numbers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nhập số</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={`Ví dụ: ${betType === "3cang" ? "123,456" : "01,23,45"}`} 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      handleNumbersChange(e.target.value);
                    }}
                    disabled={betMutation.isPending} 
                  />
                </FormControl>
                <FormDescription>
                  {instructions}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {parsedNumbers.length > 0 && (
            <div className="bg-gray-100 p-3 rounded">
              <p className="font-medium mb-2">Các số đã chọn ({parsedNumbers.length}):</p>
              <div className="flex flex-wrap gap-1">
                {parsedNumbers.map((num, index) => (
                  <Badge key={index} variant="outline">{num}</Badge>
                ))}
              </div>
            </div>
          )}
          
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số tiền cược (VND)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Nhập số tiền cược" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      calculatePayout(e.target.value);
                    }}
                    min={settings?.minBetAmount || 10000}
                    max={settings?.maxBetAmount || 10000000}
                    disabled={betMutation.isPending} 
                  />
                </FormControl>
                <FormDescription>
                  {isLoading ? (
                    <LoadingSpinner size={16} text="Đang tải..." />
                  ) : (
                    <>
                      Cược tối thiểu: {new Intl.NumberFormat('vi-VN').format(settings?.minBetAmount || 10000)}đ, 
                      Tối đa: {new Intl.NumberFormat('vi-VN').format(settings?.maxBetAmount || 10000000)}đ
                    </>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {betAmount > 0 && parsedNumbers.length > 0 && (
            <div className="bg-gray-100 p-3 rounded space-y-2">
              <div className="flex justify-between">
                <span>Tỷ lệ:</span>
                <span className="font-medium">1 ăn {settings?.bettingRates?.[betType] || "---"}</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng tiền cược:</span>
                <span className="font-medium">{new Intl.NumberFormat('vi-VN').format(betAmount)} đ</span>
              </div>
              <div className="flex justify-between">
                <span>Tiền thắng tối đa:</span>
                <span className="font-medium text-[#d9534f]">{new Intl.NumberFormat('vi-VN').format(payoutAmount)} đ</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Số dư hiện tại:</span>
                <span className="font-medium">{new Intl.NumberFormat('vi-VN').format(user?.balance || 0)} đ</span>
              </div>
              <div className="flex justify-between">
                <span>Số dư sau cược:</span>
                <span className="font-medium">{new Intl.NumberFormat('vi-VN').format((user?.balance || 0) - betAmount)} đ</span>
              </div>
            </div>
          )}
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lưu ý</AlertTitle>
            <AlertDescription>
              Kết quả xổ số được xác định vào lúc 18:15 hàng ngày. Nếu đặt cược sau 18:15, cược của bạn sẽ được tính cho ngày hôm sau.
            </AlertDescription>
          </Alert>
          
          <Button 
            type="submit" 
            className="w-full bg-[#d9534f] hover:bg-[#c9302c]" 
            disabled={betMutation.isPending || parsedNumbers.length === 0 || betAmount <= 0}
          >
            {betMutation.isPending ? (
              <LoadingSpinner size={20} text="Đang xử lý..." />
            ) : (
              "Đặt cược"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

function LoxienTabContent({ betDate, settings, isLoading }: { betDate: Date, settings: any, isLoading: boolean }) {
  const [activeXienType, setActiveXienType] = useState("lo_xien_2");
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Lô Xiên</h2>
      <p className="text-gray-600 mb-4">Chọn từ 2-4 cặp số và cả bộ phải về trong ngày</p>
      
      <Tabs defaultValue="lo_xien_2" onValueChange={setActiveXienType}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="lo_xien_2">Xiên 2</TabsTrigger>
          <TabsTrigger value="lo_xien_3">Xiên 3</TabsTrigger>
          <TabsTrigger value="lo_xien_4">Xiên 4</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lo_xien_2">
          <BettingTabContent 
            title="Lô Xiên 2"
            description="Chọn 2 cặp số để đánh xiên"
            instructions="Nhập 2 cặp số cách nhau bởi dấu phẩy (vd: 23,45)"
            betType="lo_xien_2"
            betDate={betDate}
            settings={settings}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="lo_xien_3">
          <BettingTabContent 
            title="Lô Xiên 3"
            description="Chọn 3 cặp số để đánh xiên"
            instructions="Nhập 3 cặp số cách nhau bởi dấu phẩy (vd: 23,45,67)"
            betType="lo_xien_3"
            betDate={betDate}
            settings={settings}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="lo_xien_4">
          <BettingTabContent 
            title="Lô Xiên 4"
            description="Chọn 4 cặp số để đánh xiên"
            instructions="Nhập 4 cặp số cách nhau bởi dấu phẩy (vd: 23,45,67,89)"
            betType="lo_xien_4"
            betDate={betDate}
            settings={settings}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
