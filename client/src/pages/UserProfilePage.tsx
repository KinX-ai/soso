import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import LoadingSpinner, { PageLoader } from "@/components/LoadingSpinner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Helmet } from "react-helmet";

const profileSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ"),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function UserProfilePage() {
  const { user, isLoading: authLoading, updateUserData } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const { toast } = useToast();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      bankAccount: user?.bankAccount || "",
      bankName: user?.bankName || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update form values when user data is loaded
  if (user && !profileForm.formState.isDirty) {
    profileForm.reset({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      bankAccount: user.bankAccount || "",
      bankName: user.bankName || "",
    });
  }

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      setIsProfileUpdating(true);
      const res = await apiRequest("PUT", "/api/users/profile", data);
      const updatedUser = await res.json();
      
      updateUserData(updatedUser);
      
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin cá nhân của bạn đã được cập nhật",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Cập nhật thất bại",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        variant: "destructive",
      });
    } finally {
      setIsProfileUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      setIsPasswordUpdating(true);
      await apiRequest("PUT", "/api/users/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      passwordForm.reset();
      
      toast({
        title: "Đổi mật khẩu thành công",
        description: "Mật khẩu của bạn đã được cập nhật",
      });
    } catch (error) {
      console.error("Password update error:", error);
      toast({
        title: "Đổi mật khẩu thất bại",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        variant: "destructive",
      });
    } finally {
      setIsPasswordUpdating(false);
    }
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
              Vui lòng đăng nhập để xem thông tin tài khoản
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Tài khoản - Rồng Bạch Kim</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Tài khoản của bạn</h1>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>
                  Cập nhật thông tin cá nhân của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Họ tên</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isProfileUpdating} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} disabled={isProfileUpdating} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số điện thoại</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isProfileUpdating} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-medium mb-4">Thông tin ngân hàng (cho rút tiền)</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="bankAccount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số tài khoản</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={isProfileUpdating} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tên ngân hàng</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={isProfileUpdating} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit"
                      className="bg-[#0275d8] hover:bg-[#025aa5]"
                      disabled={isProfileUpdating || !profileForm.formState.isDirty}
                    >
                      {isProfileUpdating ? (
                        <LoadingSpinner size={20} text="" />
                      ) : (
                        "Cập nhật thông tin"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Đổi mật khẩu</CardTitle>
                <CardDescription>
                  Cập nhật mật khẩu tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu hiện tại</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              {...field} 
                              disabled={isPasswordUpdating} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu mới</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              {...field} 
                              disabled={isPasswordUpdating} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              {...field} 
                              disabled={isPasswordUpdating} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="bg-[#d9534f] hover:bg-[#c9302c]"
                      disabled={isPasswordUpdating}
                    >
                      {isPasswordUpdating ? (
                        <LoadingSpinner size={20} text="" />
                      ) : (
                        "Đổi mật khẩu"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
