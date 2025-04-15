import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { LotteryResultTabs } from "@/components/LotteryResult";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function LotteryResultsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [displayFormat, setDisplayFormat] = useState<string>("today");

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center">
          <Link href="/" className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-3xl font-bold">Kết Quả Xổ Số</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="bg-[#d9534f] text-white font-bold py-2 px-4 rounded-t-lg">
                <CardTitle>Lịch Xổ Số</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Tabs defaultValue="calendar" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="calendar" onClick={() => setDisplayFormat("calendar")}>
                      Theo Lịch
                    </TabsTrigger>
                    <TabsTrigger value="today" onClick={() => setDisplayFormat("today")}>
                      Hôm Nay
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="calendar" className="space-y-4">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      locale={vi}
                      className="rounded-md border"
                    />
                    <div className="text-center text-sm">
                      Ngày xem: {date ? format(date, "dd/MM/yyyy", { locale: vi }) : "Chưa chọn"}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="today">
                    <div className="space-y-2">
                      <div className="rounded-lg bg-gray-100 p-4 text-center">
                        <p className="text-lg font-bold">Kết quả xổ số hôm nay</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(), "EEEE, dd/MM/yyyy", { locale: vi })}
                        </p>
                      </div>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Miền Bắc:</span>
                          <span>18:15</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Miền Trung:</span>
                          <span>17:15</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="font-medium">Miền Nam:</span>
                          <span>16:15</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader className="bg-[#5cb85c] text-white font-bold py-2 px-4 rounded-t-lg">
                <CardTitle>Tra Cứu Nhanh</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="#" className="py-2 px-3 bg-blue-50 hover:bg-blue-100 rounded text-center">
                      Hôm qua
                    </Link>
                    <Link href="#" className="py-2 px-3 bg-blue-50 hover:bg-blue-100 rounded text-center">
                      Tuần trước
                    </Link>
                    <Link href="#" className="py-2 px-3 bg-blue-50 hover:bg-blue-100 rounded text-center">
                      Tháng trước
                    </Link>
                    <Link href="#" className="py-2 px-3 bg-blue-50 hover:bg-blue-100 rounded text-center">
                      Thống kê
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <LotteryResultTabs />
          </div>
        </div>
      </div>
    </Layout>
  );
}