import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function QuickStats() {
  // Fetch frequent numbers
  const { data: frequentData, isLoading: frequentLoading } = useQuery({
    queryKey: ['/api/stats/frequent/mienbac'],
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch lottery history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/lottery/history/mienbac?limit=5'],
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch number absence (lô gan)
  const { data: absenceData, isLoading: absenceLoading } = useQuery({
    queryKey: ['/api/stats/absence/mienbac'],
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Get most frequent numbers by group
  const getFrequentDigits = (position: string) => {
    if (!frequentData || frequentLoading) return "---";
    
    const filtered = frequentData.filter((item: any) => {
      if (position === "head") {
        return item.number.charAt(0) !== "0";
      } else {
        return true;
      }
    });
    
    // Group by first or last digit
    const groupedDigits: { [key: string]: number } = {};
    
    filtered.forEach((item: any) => {
      const digit = position === "head" ? item.number.charAt(0) : item.number.charAt(1);
      if (!groupedDigits[digit]) {
        groupedDigits[digit] = 0;
      }
      groupedDigits[digit] += item.occurrences;
    });
    
    // Sort and get top 3
    const sorted = Object.entries(groupedDigits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(item => item[0]);
    
    return sorted.join(", ");
  };

  // Get lô gan
  const getAbsentNumbers = () => {
    if (!absenceData || absenceLoading) return "---";
    
    return absenceData.slice(0, 3).map((item: any) => item.number).join(", ");
  };

  // Get most frequent pairs
  const getFrequentPairs = () => {
    if (!frequentData || frequentLoading) return "---";
    
    return frequentData.slice(0, 3).map((item: any) => item.number).join(", ");
  };

  return (
    <Card className="h-full">
      <CardHeader className="bg-[#0275d8] text-white font-condensed font-bold text-lg py-2 px-4 rounded-t-lg">
        <CardTitle>THỐNG KÊ NHANH</CardTitle>
      </CardHeader>
      
      <CardContent className="p-3">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <StatCard
            title="Cặp lô về nhiều"
            value={frequentLoading ? <Skeleton className="h-6 w-20" /> : getFrequentPairs()}
          />
          <StatCard
            title="Lô gan"
            value={absenceLoading ? <Skeleton className="h-6 w-20" /> : getAbsentNumbers()}
          />
        </div>
        
        <div className="bg-[#d9534f] bg-opacity-10 p-3 rounded-lg border border-[#d9534f] border-opacity-30 mb-4">
          <div className="font-condensed font-bold text-center mb-2">THỐNG KÊ ĐẶC BIỆT TUẦN QUA</div>
          <div className="text-center text-sm space-y-1">
            {historyLoading ? (
              <>
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-5 w-full" />
              </>
            ) : historyData && historyData.length > 0 ? (
              historyData.map((result: any) => (
                <div key={result.id}>
                  {format(new Date(result.date), "dd/MM", { locale: vi })}: {" "}
                  <span className="font-medium">{result.special}</span>
                </div>
              ))
            ) : (
              <div>Không có dữ liệu</div>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <Link href="/choi">
            <Button className="bg-[#d9534f] hover:bg-[#c9302c] text-white px-5 py-2 rounded-full font-bold text-lg">
              ĐẶT CƯỢC NGAY
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: React.ReactNode;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="bg-gray-100 p-3 rounded">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="font-bold text-xl mt-1">{value}</div>
    </div>
  );
}
