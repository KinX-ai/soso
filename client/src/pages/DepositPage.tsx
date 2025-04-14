import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import LoadingSpinner, { PageLoader } from "@/components/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Helmet } from "react-helmet";

const depositSchema = z.object({
  amount: z.string()
    .min(1, "Số tiền không được để trống")
    .refine(val => !isNaN(parseFloat(val)), {
      message: "Số tiền phải là số",
    })
    .refine(val => parseFloat(val) >= 50000, {
      message: "Số tiền nạp tối thiểu là 50,000đ",
    }),
  method: z.string().min(1, "Vui lòng chọn phương thức thanh toán"),
  reference: z.string().min(1, "Mã giao dịch không được để trống"),
});

type DepositFormValues = z.infer<typeof depositSchema>;

export default function DepositPage() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("bank_transfer");

  // Fetch user's recent deposit history
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
    enabled: !!user,
  });

  // Filter for pending and recent deposits
  const pendingDeposits = transactions
    ? transactions.filter((tx: any) => tx.type === "deposit" && tx.status === "pending")
    : [];
  
  const recentDeposits = transactions
    ? transactions
        .filter((tx: any) => tx.type === "deposit")
        .slice(0, 5)
    : [];

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: "",
      method: "bank_transfer",
      reference: "",
    },
  });

  // Update method when tab changes
  const onTabChange = (value: string) => {
    setActiveTab(value);
    form.setValue("method", value);
  };

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/transactions/deposit", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      form.reset({
        amount: "",
        method: activeTab,
        reference: "",
      });
      toast({
        title: "Yêu cầu nạp tiền thành công",
        description: "Yêu cầu của bạn đã được ghi nhận và đang chờ xử lý",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Nạp tiền thất bại",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DepositFormValues) => {
    const depositData = {
      amount: parseFloat(data.amount),
      method: data.method,
      reference: data.reference,
      notes: `Nạp tiền qua ${data.method === "bank_transfer" ? "chuyển khoản ngân hàng" : "ví điện tử"}`,
    };
    
    depositMutation.mutate(depositData);
  };

  if (authLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Chưa đăng nhập</AlertTitle>
            <AlertDescription>
              Vui lòng đăng nhập để sử dụng chức năng nạp tiền
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Nạp tiền - Rồng Bạch Kim</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Nạp tiền</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Tạo lệnh nạp tiền</CardTitle>
                <CardDescription>
                  Vui lòng chọn phương thức và nhập thông tin nạp tiền
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={activeTab} onValueChange={onTabChange}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="bank_transfer">Chuyển khoản ngân hàng</TabsTrigger>
                    <TabsTrigger value="e_wallet">Ví điện tử</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="bank_transfer">
                    <div className="mt-4 mb-6">
                      <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>Thông tin chuyển khoản</AlertTitle>
                        <AlertDescription className="space-y-2">
                          <p>Vui lòng chuyển khoản đến tài khoản ngân hàng sau:</p>
                          <div className="bg-gray-100 p-3 rounded space-y-1">
                            <p><span className="font-medium">Ngân hàng:</span> BIDV</p>
                            <p><span className="font-medium">Số tài khoản:</span> 123456789</p>
                            <p><span className="font-medium">Tên tài khoản:</span> CÔNG TY RỒNG BẠCH KIM</p>
                            <p><span className="font-medium">Nội dung:</span> {user.username} nap tien</p>
                          </div>
                          <p>Sau khi chuyển khoản thành công, vui lòng điền thông tin bên dưới.</p>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="e_wallet">
                    <div className="mt-4 mb-6">
                      <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>Thông tin chuyển tiền qua ví điện tử</AlertTitle>
                        <AlertDescription className="space-y-2">
                          <p>Vui lòng chuyển tiền đến ví điện tử sau:</p>
                          <div className="bg-gray-100 p-3 rounded space-y-1">
                            <p><span className="font-medium">Ví Momo:</span> 0987654321</p>
                            <p><span className="font-medium">Tên tài khoản:</span> RỒNG BẠCH KIM</p>
                            <p><span className="font-medium">Nội dung:</span> {user.username} nap tien</p>
                          </div>
                          <p>Sau khi chuyển tiền thành công, vui lòng điền thông tin bên dưới.</p>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số tiền nạp (VND)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Nhập số tiền" 
                              {...field} 
                              disabled={depositMutation.isPending} 
                            />
                          </FormControl>
                          <FormDescription>
                            Số tiền nạp tối thiểu là 50,000đ
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="method"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Phương thức thanh toán</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                              disabled={depositMutation.isPending}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="bank_transfer" id="bank" />
                                <Label htmlFor="bank">Chuyển khoản ngân hàng</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="e_wallet" id="wallet" />
                                <Label htmlFor="wallet">Ví điện tử</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="reference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã giao dịch / Mã tham chiếu</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nhập mã giao dịch" 
                              {...field} 
                              disabled={depositMutation.isPending} 
                            />
                          </FormControl>
                          <FormDescription>
                            Mã giao dịch này giúp chúng tôi xác nhận giao dịch của bạn
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#5cb85c] hover:bg-[#449d44]" 
                      disabled={depositMutation.isPending}
                    >
                      {depositMutation.isPending ? (
                        <LoadingSpinner size={20} text="" />
                      ) : (
                        "Gửi yêu cầu nạp tiền"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin tài khoản</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Số dư hiện tại</p>
                    <p className="text-xl font-bold">
                      {new Intl.NumberFormat('vi-VN').format(user.balance)} đ
                    </p>
                  </div>
                  
                  {pendingDeposits.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Nạp tiền đang xử lý</p>
                      {pendingDeposits.map((tx: any) => (
                        <div key={tx.id} className="bg-amber-50 border border-amber-200 rounded p-2 mb-2 text-sm">
                          <div className="flex justify-between">
                            <span>Số tiền:</span>
                            <span className="font-medium">{new Intl.NumberFormat('vi-VN').format(tx.amount)} đ</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Trạng thái:</span>
                            <span className="text-amber-600">Đang xử lý</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {transactionsLoading ? (
                    <LoadingSpinner size={20} text="Đang tải..." />
                  ) : recentDeposits.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium mb-2">Lịch sử nạp tiền gần đây</p>
                      {recentDeposits.map((tx: any) => (
                        <div key={tx.id} className={`border rounded p-2 mb-2 text-sm ${
                          tx.status === "completed" ? "bg-green-50 border-green-200" : 
                          tx.status === "rejected" ? "bg-red-50 border-red-200" :
                          "bg-amber-50 border-amber-200"
                        }`}>
                          <div className="flex justify-between">
                            <span>Số tiền:</span>
                            <span className="font-medium">{new Intl.NumberFormat('vi-VN').format(tx.amount)} đ</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Trạng thái:</span>
                            <span className={`${
                              tx.status === "completed" ? "text-green-600" : 
                              tx.status === "rejected" ? "text-red-600" :
                              "text-amber-600"
                            }`}>
                              {tx.status === "completed" ? "Thành công" : 
                               tx.status === "rejected" ? "Bị từ chối" :
                               "Đang xử lý"}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Ngày:</span>
                            <span>{new Date(tx.createdAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Chưa có lịch sử nạp tiền
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
