import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function TodayPredictions() {
  const today = format(new Date(), "dd/MM", { locale: vi });
  const tomorrow = format(new Date(new Date().setDate(new Date().getDate() + 1)), "dd/MM", { locale: vi });

  return (
    <Card>
      <CardHeader className="text-xl font-condensed font-bold border-b border-gray-200 pb-2 mb-4">
        <CardTitle>SỐ ĐẸP HÔM NAY</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-200 rounded p-3">
            <div className="font-bold mb-1">Dự đoán XSMB ngày {tomorrow}</div>
            <p className="text-sm mb-2">Cầu lô đẹp: 28, 67, 90, 41, 73</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-[#d9534f] text-white hover:bg-[#d9534f]">Đặc biệt: 90</Badge>
              <Badge className="bg-[#0275d8] text-white hover:bg-[#0275d8]">Song thủ: 28 - 67</Badge>
              <Badge className="bg-[#5cb85c] text-white hover:bg-[#5cb85c]">Bạch thủ: 41</Badge>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded p-3">
            <div className="font-bold mb-1">Cầu lô 3 miền</div>
            <div className="space-y-2 text-sm">
              <div>- Miền Bắc: 34, 56, 78, 25, 63</div>
              <div>- Miền Trung: 41, 87, 62, 90, 37</div>
              <div>- Miền Nam: 19, 38, 51, 72, 64</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <div className="font-bold mb-2">Phân tích chuyên sâu</div>
          <p className="text-sm mb-2">
            Theo thống kê, bộ số 28-67-90 có tần suất xuất hiện cao trong 10 ngày qua. Đặc biệt, cặp 28-67 về cùng nhau 3 lần trong 7 ngày.
          </p>
          <div className="flex justify-end">
            <Link href="/du-doan-chi-tiet" className="text-[#0275d8] hover:underline text-sm">
              Xem phân tích đầy đủ →
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
