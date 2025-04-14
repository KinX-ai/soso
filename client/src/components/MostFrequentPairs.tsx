import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

export default function MostFrequentPairs() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/stats/frequent/mienbac?limit=5'],
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Cặp lô về nhiều</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="border border-gray-200 p-2 rounded text-center">
                <Skeleton className="h-6 w-10 mx-auto mb-1" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </div>
            ))
          ) : error ? (
            <div className="col-span-5 text-center text-red-500 p-4">
              Không thể tải dữ liệu
            </div>
          ) : data && data.length > 0 ? (
            data.map((item: { number: string; occurrences: number }, index: number) => (
              <div key={index} className="border border-gray-200 p-2 rounded text-center">
                <div className="font-bold">{item.number}</div>
                <div className="text-xs text-gray-600">{item.occurrences} lần</div>
              </div>
            ))
          ) : (
            <div className="col-span-5 text-center text-gray-500 p-4">
              Không có dữ liệu
            </div>
          )}
        </div>
        <div className="text-right">
          <Link href="/thong-ke-lo-ve-nhieu">
            <a className="text-[#0275d8] hover:underline text-sm">Xem thêm →</a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
