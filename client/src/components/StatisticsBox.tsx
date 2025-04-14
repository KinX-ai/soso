import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function StatisticsBox() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/stats/absence/mienbac?limit=5'],
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Thống kê lô gan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 p-2">Cặp số</th>
                <th className="border border-gray-200 p-2">Số ngày</th>
                <th className="border border-gray-200 p-2">Lần về gần nhất</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="border border-gray-200 p-2 text-center">
                      <Skeleton className="h-4 w-8 mx-auto" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <Skeleton className="h-4 w-6 mx-auto" />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={3} className="border border-gray-200 p-2 text-center text-red-500">
                    Không thể tải dữ liệu
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((item: { number: string; days: number }, index: number) => {
                  // Calculate the last appearance date from days
                  const lastDate = new Date();
                  lastDate.setDate(lastDate.getDate() - item.days);
                  const formattedDate = format(lastDate, "dd/MM/yyyy", { locale: vi });

                  return (
                    <tr key={index}>
                      <td className="border border-gray-200 p-2 text-center font-medium">{item.number}</td>
                      <td className="border border-gray-200 p-2 text-center">{item.days}</td>
                      <td className="border border-gray-200 p-2 text-center">{formattedDate}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="border border-gray-200 p-2 text-center">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="text-right">
          <Link href="/thong-ke-lo-gan">
            <a className="text-[#0275d8] hover:underline text-sm">Xem thêm →</a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
