import { useState, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { LotteryResultTabs } from "@/components/LotteryResult";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import HeadTailTable from "@/components/HeadTailTable";

// Thông tin tỉ lệ cược cho các loại cược khác nhau
const BettingRates = () => {
  const [rates, setRates] = useState<any>({
    lo: 80,
    de: 80,
    '3cang': 700,
    'lo_xien_2': 15,
    'lo_xien_3': 50,
    'lo_xien_4': 150
  });
  const [minBet, setMinBet] = useState<number>(10000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy dữ liệu tỉ lệ cược từ API
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.bettingRates) {
          try {
            const parsedRates = typeof data.bettingRates === 'string' 
              ? JSON.parse(data.bettingRates) 
              : data.bettingRates;
            setRates(parsedRates);
          } catch (err) {
            console.error('Error parsing betting rates:', err);
          }
        }
        
        if (data.minBetAmount) {
          setMinBet(Number(data.minBetAmount));
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching betting rates:', err);
        setLoading(false);
      });
  }, []);

  // Định dạng số tiền để hiển thị
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  return (
    <Card className="mt-6">
      <CardHeader className="bg-[#428bca] text-white font-bold py-2 px-4 rounded-t-lg">
        <CardTitle>Tỉ lệ cược</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 text-center">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 py-2 px-3 text-center font-medium">Loại cược</th>
                  <th className="border border-gray-300 py-2 px-3 text-center font-medium">Tỉ lệ</th>
                  <th className="border border-gray-300 py-2 px-3 text-center font-medium">Mức cược tối thiểu</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 py-2 px-3">Đề</td>
                  <td className="border border-gray-300 py-2 px-3 text-center">1 ăn {rates.de}</td>
                  <td className="border border-gray-300 py-2 px-3 text-center">{formatCurrency(minBet)}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 py-2 px-3">Lô</td>
                  <td className="border border-gray-300 py-2 px-3 text-center">1 ăn {rates.lo}</td>
                  <td className="border border-gray-300 py-2 px-3 text-center">{formatCurrency(minBet)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 py-2 px-3">3 càng</td>
                  <td className="border border-gray-300 py-2 px-3 text-center">1 ăn {rates['3cang']}</td>
                  <td className="border border-gray-300 py-2 px-3 text-center">{formatCurrency(minBet)}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 py-2 px-3">Lô xiên 2</td>
                  <td className="border border-gray-300 py-2 px-3 text-center">1 ăn {rates['lo_xien_2']}</td>
                  <td className="border border-gray-300 py-2 px-3 text-center">{formatCurrency(minBet)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 py-2 px-3">Lô xiên 3</td>
                  <td className="border border-gray-300 py-2 px-3 text-center">1 ăn {rates['lo_xien_3']}</td>
                  <td className="border border-gray-300 py-2 px-3 text-center">{formatCurrency(minBet)}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 py-2 px-3">Lô xiên 4</td>
                  <td className="border border-gray-300 py-2 px-3 text-center">1 ăn {rates['lo_xien_4']}</td>
                  <td className="border border-gray-300 py-2 px-3 text-center">{formatCurrency(minBet)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-3">
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
            
            {/* Bảng tỉ lệ cược */}
            <BettingRates />
          </div>
          
          {/* Kết quả xổ số */}
          <div className="md:col-span-5">
            <LotteryResultTabs />
          </div>
          
          {/* Bảng Đầu-Đuôi */}
          <div className="md:col-span-4">
            <HeadTailTable />
          </div>
        </div>
      </div>
    </Layout>
  );
}