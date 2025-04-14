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
import { InfoIcon, AlertTriangle, AlertCircle } from "lucide-react";
import { Helmet } from "react-helmet";

const withdrawSchema = z.object({
  amount: z.string()
    .min(1, "Số tiền không được để trống")
    .refine(val => !isNaN(parseFloat(val)), {
      message: "Số tiền phải là số",
    })
    .refine(val => parseFloat(val) >= 100000, {
      message: "Số tiền rút tối thiểu là 100,000đ",
    }),
  method: z.string().min(1, "Vui lòng chọn phương thức thanh toán"),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
});

type WithdrawFormValues = z.infer<typeof withdrawSchema>;

export default function WithdrawPage() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("bank_transfer");

  // Fetch user's recent withdrawal history
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
    enabled: !!user,
  });

  // Filter for pending and recent withdrawals
  const pendingWithdrawals = transactions
    ? transactions.filter((tx: any) => tx.type === "withdrawal" && tx.status === "pending")
    : [];
  
  const recentWithdrawals = transactions
    ? transactions
        .filter((tx: any) => tx.type === "withdrawal")
        .slice(0, 5)
    : [];

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: "",
      method: "bank_transfer",
      bankAccount: user?.bankAccount || "",
      bankName: user?.bankName || "",
    },
  });

  // Update form values when user data is loaded
  if (user && !form.formState.isDirty) {
    form.setValue("bankAccount", user.bankAccount || "");
    form.setValue("bankName", user.bankName || "");
  }

  // Update method when tab changes
  const onTabChange = (value: string) => {
    setActiveTab(value);
    form.setValue("method", value);
  };

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/transactions/withdraw", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      form.reset({
        amount: "",
        method: activeTab,
        bankAccount: user?.bankAccount || "",
        bankName: user?.bankName || "",
      });
      toast({
        title: "Yêu cầu rút tiền thành công",
        description: "Yêu cầu của bạn đã được ghi nhận và đang chờ xử lý",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Rút tiền thất bại",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WithdrawFormValues) => {
    const amount = parseFloat(data.amount);
    
    // Check if user has enough balance
    if (amount > (user?.balance || 0)) {
      toast({
        title: "Số dư không đủ",
        description: "Số dư của bạn không đủ để thực hiện yêu cầu rút tiền này",
        variant: "destructive",
      });
      return;
    }
    
    const withdrawData = {
      amount,
      method: data.method,
      bankAccount: data.bankAccount,
      bankName: data.bankName,
    };
    
    withdrawMutation.mutate(withdrawData);
  };

  if (authLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Chưa đăng nhập</AlertTitle>
            <AlertDescription>
              Vui lòng đăng nhập để sử dụng chức năng rút tiền
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Rút tiền - Rồng Bạch Kim</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Rút tiền</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Tạo lệnh rút tiền</CardTitle>
                <CardDescription>
                  Vui lòng nhập thông tin rút tiền
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
                        <AlertTitle>Thông tin rút tiền qua ngân hàng</AlertTitle>
                        <AlertDescription>
                          <p>Vui lòng điền đầy đủ thông tin tài khoản ngân hàng để nhận tiền.</p>
                          <p className="mt-2">Thời gian xử lý: 1-24 giờ làm việc sau khi yêu cầu được duyệt.</p>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="e_wallet">
                    <div className="mt-4 mb-6">
                      <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>Thông tin rút tiền qua ví điện tử</AlertTitle>
                        <AlertDescription>
                          <p>Vui lòng điền số điện thoại đăng ký ví điện tử để nhận tiền.</p>
                          <p className="mt-2">Thời gian xử lý: 5-60 phút sau khi yêu cầu được duyệt.</p>
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
                          <FormLabel>Số tiền rút (VND)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Nhập số tiền" 
                              {...field} 
                              disabled={withdrawMutation.isPending} 
                            />
                          </FormControl>
                          <FormDescription>
                            Số tiền rút tối thiểu là 100,000đ. Số dư hiện tại: {new Intl.NumberFormat('vi-VN').format(user.balance)}đ
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
                          <FormLabel>Phương thức nhận tiền</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                              disabled={withdrawMutation.isPending}
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
                    
                    {activeTab === "bank_transfer" && (
                      <>
                        <FormField
                          control={form.control}
                          name="bankAccount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số tài khoản</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Nhập số tài khoản" 
                                  {...field} 
                                  disabled={withdrawMutation.isPending} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tên ngân hàng</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Nhập tên ngân hàng" 
                                  {...field} 
                                  disabled={withdrawMutation.isPending} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    
                    {activeTab === "e_wallet" && (
                      <FormField
                        control={form.control}
                        name="bankAccount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số điện thoại ví điện tử</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Nhập số điện thoại" 
                                {...field} 
                                disabled={withdrawMutation.isPending} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Lưu ý quan trọng</AlertTitle>
                      <AlertDescription>
                        <p>Vui lòng kiểm tra thông tin rút tiền chính xác trước khi gửi yêu cầu.</p>
                        <p>Mọi sai sót trong thông tin có thể dẫn đến việc không nhận được tiền.</p>
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#f0ad4e] hover:bg-[#ec971f]" 
                      disabled={withdrawMutation.isPending}
                    >
                      {withdrawMutation.isPending ? (
                        <LoadingSpinner size={20} text="" />
                      ) : (
                        "Gửi yêu cầu rút tiền"
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
                  
                  {pendingWithdrawals.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Rút tiền đang xử lý</p>
                      {pendingWithdrawals.map((tx: any) => (
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
                  ) : recentWithdrawals.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium mb-2">Lịch sử rút tiền gần đây</p>
                      {recentWithdrawals.map((tx: any) => (
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
                      Chưa có lịch sử rút tiền
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
