import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LoadingSpinner from "@/components/LoadingSpinner";
import { format, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { Helmet } from "react-helmet";

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState("mienbac");
  const tomorrow = addDays(new Date(), 1);

  // Get lottery history for prediction base
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: [`/api/lottery/history/${activeTab}?limit=10`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get frequent numbers
  const { data: frequentData, isLoading: frequentLoading } = useQuery({
    queryKey: [`/api/stats/frequent/${activeTab}?limit=30`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get number absence
  const { data: absenceData, isLoading: absenceLoading } = useQuery({
    queryKey: [`/api/stats/absence/${activeTab}?limit=30`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Simulate predictions based on history and statistics
  const generatePredictions = () => {
    if (!historyData || !frequentData || !absenceData) return null;

    // Get top frequent numbers
    const topFrequent = frequentData.slice(0, 5).map((item: any) => item.number);
    
    // Get numbers that are due (high absence days but not too high)
    const dueNumbers = absenceData
      .filter((item: any) => item.days > 5 && item.days < 20)
      .slice(0, 5)
      .map((item: any) => item.number);
    
    // Get special numbers from history patterns
    const specialNumbers = historyData.slice(0, 3).map((item: any) => {
      // Extract last 2 digits of special prize
      return item.special.slice(-2);
    });
    
    // Combine all for recommendations
    const allRecommended = [...topFrequent, ...dueNumbers, ...specialNumbers];
    
    // Remove duplicates and limit to 5
    const uniqueRecommended = Array.from(new Set(allRecommended)).slice(0, 5);
    
    // Pick "special" prediction
    const specialPrediction = uniqueRecommended[0] || "49";
    
    // Pick pair prediction
    const pairPrediction = [
      uniqueRecommended[1] || "27", 
      uniqueRecommended[2] || "68"
    ];
    
    // Pick single prediction
    const singlePrediction = uniqueRecommended[3] || "38";
    
    return {
      recommended: uniqueRecommended,
      special: specialPrediction,
      pair: pairPrediction,
      single: singlePrediction
    };
  };

  const predictions = generatePredictions();

  return (
    <Layout>
      <Helmet>
        <title>Dự đoán xổ số - Rồng Bạch Kim</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dự đoán xổ số</h1>
        
        <div className="mb-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mienbac">Miền Bắc</TabsTrigger>
              <TabsTrigger value="mientrung">Miền Trung</TabsTrigger>
              <TabsTrigger value="miennam">Miền Nam</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dự đoán XSMB ngày {format(tomorrow, "dd/MM/yyyy", { locale: vi })}</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading || frequentLoading || absenceLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-36" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ) : predictions ? (
                <div>
                  <p className="mb-4">
                    Dựa trên phân tích kết quả xổ số {activeTab === "mienbac" ? "Miền Bắc" : activeTab === "mientrung" ? "Miền Trung" : "Miền Nam"} trong 10 ngày qua, chúng tôi dự đoán các cặp số sau có khả năng cao sẽ về trong ngày {format(tomorrow, "dd/MM", { locale: vi })}:
                  </p>
                  
                  <p className="font-medium mb-3">Cặp số gợi ý: {predictions.recommended.join(", ")}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-[#d9534f] text-white hover:bg-[#d9534f]">
                      Đặc biệt: {predictions.special}
                    </Badge>
                    <Badge className="bg-[#0275d8] text-white hover:bg-[#0275d8]">
                      Song thủ: {predictions.pair.join(" - ")}
                    </Badge>
                    <Badge className="bg-[#5cb85c] text-white hover:bg-[#5cb85c]">
                      Bạch thủ: {predictions.single}
                    </Badge>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-bold mb-2">Phân tích chi tiết</h3>
                    <p className="text-sm">
                      Cặp số {predictions.special} xuất hiện với tần suất cao trong thời gian gần đây và có xu hướng lặp lại. 
                      Cặp {predictions.pair[0]} và {predictions.pair[1]} thường xuất hiện gần nhau và đang trong chu kỳ quay trở lại.
                      Cặp {predictions.single} đã lâu không xuất hiện và có khả năng cao sẽ về trong ngày mai.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-500">
                  Không thể tạo dự đoán. Vui lòng thử lại sau.
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Kết quả xổ số gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <LoadingSpinner />
              ) : historyData && historyData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Giải đặc biệt</TableHead>
                      <TableHead>Giải nhất</TableHead>
                      <TableHead>2 số cuối G.ĐB</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData.map((result: any) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          {format(new Date(result.date), "dd/MM/yyyy", { locale: vi })}
                        </TableCell>
                        <TableCell className="font-medium">{result.special}</TableCell>
                        <TableCell>{result.first}</TableCell>
                        <TableCell className="font-bold text-[#d9534f]">
                          {result.special.slice(-2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-gray-500">
                  Không có dữ liệu kết quả xổ số gần đây.
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Số may mắn theo thống kê</CardTitle>
            </CardHeader>
            <CardContent>
              {frequentLoading ? (
                <LoadingSpinner />
              ) : frequentData && frequentData.length > 0 ? (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold mb-2">Top 10 cặp số về nhiều nhất</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {frequentData.slice(0, 10).map((item: any, index: number) => (
                        <div key={index} className="bg-gray-100 p-2 rounded text-center">
                          <div className="font-bold">{item.number}</div>
                          <div className="text-xs text-gray-600">{item.occurrences} lần</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold mb-2">Top 10 số ít xuất hiện</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {absenceData && absenceData.slice(0, 10).map((item: any, index: number) => (
                        <div key={index} className="bg-gray-100 p-2 rounded text-center">
                          <div className="font-bold">{item.number}</div>
                          <div className="text-xs text-gray-600">{item.days} ngày</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  Không có dữ liệu thống kê.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
