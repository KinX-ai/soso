import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAuth } from "../lib/auth.tsx";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Helmet } from "react-helmet";

const registerSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Xác nhận mật khẩu không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  fullName: z.string().min(1, "Họ tên không được để trống"),
  phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ"),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const [, navigate] = useLocation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      fullName: "",
      phoneNumber: "",
      bankAccount: "",
      bankName: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      // Remove confirmPassword since it's not needed in the API request
      const { confirmPassword, ...registerData } = data;
      await register(registerData);
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Đăng ký - Rồng Bạch Kim</title>
      </Helmet>

      <div className="flex justify-center items-center py-8">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Đăng ký tài khoản</CardTitle>
            <CardDescription className="text-center">
              Tạo tài khoản mới để bắt đầu chơi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên đăng nhập *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên đăng nhập" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ tên *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập họ tên" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Nhập email" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số điện thoại" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu *</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Nhập mật khẩu" 
                            {...field} 
                            disabled={isLoading} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xác nhận mật khẩu *</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Xác nhận mật khẩu" 
                            {...field} 
                            disabled={isLoading} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bankAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tài khoản ngân hàng</FormLabel>
                        <FormControl>
                          <Input placeholder="(Không bắt buộc)" {...field} disabled={isLoading} />
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
                        <FormLabel>Ngân hàng</FormLabel>
                        <FormControl>
                          <Input placeholder="(Không bắt buộc)" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="text-xs text-gray-500 mt-4">
                  * Trường bắt buộc
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#0275d8] hover:bg-[#025aa5]" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size={20} text="" />
                  ) : (
                    "Đăng ký"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="text-center text-sm">
            Đã có tài khoản?{" "}
            <Link href="/dang-nhap" className="text-[#0275d8] hover:underline">
              Đăng nhập ngay
            </Link>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
