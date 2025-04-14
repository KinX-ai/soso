import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LotteryResultProps {
  region?: string;
  date?: Date;
}

export default function LotteryResult({ region = "mienbac", date }: LotteryResultProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");
  
  // Format the date for display
  useEffect(() => {
    if (date) {
      setFormattedDate(format(date, "dd/MM/yyyy", { locale: vi }));
    } else {
      setFormattedDate(format(new Date(), "dd/MM/yyyy", { locale: vi }));
    }
  }, [date]);

  // Fetch lottery result
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/lottery/latest/${region}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return <LotteryResultSkeleton />;
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader className="bg-red-500 text-white font-condensed font-bold text-lg rounded-t-lg py-2 px-4">
          <CardTitle className="flex justify-between items-center">
            <span>KẾT QUẢ XỔ SỐ MIỀN BẮC</span>
            <div className="text-sm font-normal bg-white text-red-500 rounded px-2 py-1">
              Mở thưởng 18:15
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-500">Không thể tải kết quả xổ số. Vui lòng thử lại sau.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get display date from result or use current date
  const displayDate = data.date 
    ? format(new Date(data.date), "dd/MM/yyyy", { locale: vi }) 
    : formattedDate;

  return (
    <Card>
      <CardHeader className="bg-[#d9534f] text-white font-condensed font-bold text-lg py-2 px-4 rounded-t-lg">
        <CardTitle className="flex justify-between items-center text-base md:text-lg">
          <span>KẾT QUẢ XỔ SỐ MIỀN BẮC - NGÀY {displayDate}</span>
          <div className="text-xs md:text-sm font-normal bg-white text-[#d9534f] rounded px-2 py-1">
            Mở thưởng 18:15
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-center">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 px-1 w-24 font-medium text-left">Đặc biệt</td>
                <td className="py-2 px-1">
                  <span className="text-xl font-bold text-[#d9534f]">{data.special}</span>
                </td>
              </tr>
              
              <tr className="border-b border-gray-200">
                <td className="py-2 px-1 font-medium text-left">Giải nhất</td>
                <td className="py-2 px-1">{data.first}</td>
              </tr>
              
              <tr className="border-b border-gray-200">
                <td className="py-2 px-1 font-medium text-left">Giải nhì</td>
                <td className="py-2 px-1">
                  <div className="grid grid-cols-2 gap-2">
                    {data.second.map((number: string, index: number) => (
                      <div key={`second-${index}`}>{number}</div>
                    ))}
                  </div>
                </td>
              </tr>
              
              <tr className="border-b border-gray-200">
                <td className="py-2 px-1 font-medium text-left">Giải ba</td>
                <td className="py-2 px-1">
                  <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {data.third.map((number: string, index: number) => (
                      <div key={`third-${index}`}>{number}</div>
                    ))}
                  </div>
                </td>
              </tr>
              
              <tr className="border-b border-gray-200">
                <td className="py-2 px-1 font-medium text-left">Giải tư</td>
                <td className="py-2 px-1">
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    {data.fourth.map((number: string, index: number) => (
                      <div key={`fourth-${index}`}>{number}</div>
                    ))}
                  </div>
                </td>
              </tr>
              
              <tr className="border-b border-gray-200">
                <td className="py-2 px-1 font-medium text-left">Giải năm</td>
                <td className="py-2 px-1">
                  <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {data.fifth.map((number: string, index: number) => (
                      <div key={`fifth-${index}`}>{number}</div>
                    ))}
                  </div>
                </td>
              </tr>
              
              <tr className="border-b border-gray-200">
                <td className="py-2 px-1 font-medium text-left">Giải sáu</td>
                <td className="py-2 px-1">
                  <div className="grid grid-cols-3 gap-2">
                    {data.sixth.map((number: string, index: number) => (
                      <div key={`sixth-${index}`}>{number}</div>
                    ))}
                  </div>
                </td>
              </tr>
              
              <tr>
                <td className="py-2 px-1 font-medium text-left">Giải bảy</td>
                <td className="py-2 px-1">
                  <div className="grid grid-cols-4 gap-2">
                    {data.seventh.map((number: string, index: number) => (
                      <div key={`seventh-${index}`}>{number}</div>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function LotteryResultSkeleton() {
  return (
    <Card>
      <CardHeader className="bg-[#d9534f] text-white font-condensed font-bold text-lg rounded-t-lg py-2 px-4">
        <CardTitle className="flex justify-between items-center">
          <span>KẾT QUẢ XỔ SỐ MIỀN BẮC</span>
          <div className="text-sm font-normal bg-white text-[#d9534f] rounded px-2 py-1">
            Mở thưởng 18:15
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center border-b border-gray-200 pb-2">
            <div className="w-24 font-medium">Đặc biệt</div>
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex items-center border-b border-gray-200 pb-2">
            <div className="w-24 font-medium">Giải nhất</div>
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-center border-b border-gray-200 pb-2">
            <div className="w-24 font-medium">Giải nhì</div>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
          <div className="flex items-center border-b border-gray-200 pb-2">
            <div className="w-24 font-medium">Giải ba</div>
            <div className="grid grid-cols-3 gap-2 w-full">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
