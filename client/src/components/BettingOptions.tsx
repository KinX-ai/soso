import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function BettingOptions() {
  // Fetch betting rates and limits
  const { data, isLoading } = useQuery({
    queryKey: ['/api/settings/public'],
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  const minBet = data?.minBetAmount || 10000;
  const getPayoutRate = (type: string) => {
    if (isLoading || !data || !data.bettingRates) return "---";
    const rates = data.bettingRates;
    return rates[type] || "---";
  };

  return (
    <Card>
      <CardHeader className="text-xl font-condensed font-bold border-b border-gray-200 pb-2 mb-4">
        <CardTitle className="flex justify-between items-center">
          <span>CHƠI NGAY</span>
          <span className="text-sm font-normal text-gray-600">Kết quả xổ số 18:15 hàng ngày</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <BettingOptionCard
            title="Đánh Lô"
            description="Chọn các cặp số 2 chữ số (00-99) từ kết quả xổ số"
            payoutRate={isLoading ? <Skeleton className="h-5 w-16 inline-block" /> : `1 ăn ${getPayoutRate('lo')}`}
            minBet={isLoading ? <Skeleton className="h-5 w-24 inline-block" /> : `${new Intl.NumberFormat('vi-VN').format(minBet)}đ`}
            href="/choi/lo"
            primary
            popular
          />
          
          <BettingOptionCard
            title="Đánh Đề"
            description="Chọn 2 chữ số cuối của giải Đặc biệt XSMB"
            payoutRate={isLoading ? <Skeleton className="h-5 w-16 inline-block" /> : `1 ăn ${getPayoutRate('de')}`}
            minBet={isLoading ? <Skeleton className="h-5 w-24 inline-block" /> : `${new Intl.NumberFormat('vi-VN').format(minBet)}đ`}
            href="/choi/de"
          />
          
          <BettingOptionCard
            title="Lô Xiên"
            description="Chọn từ 2-4 cặp số và cả bộ phải về trong ngày"
            payoutRate={isLoading ? <Skeleton className="h-5 w-16 inline-block" /> : `Xiên 2: 1 ăn ${getPayoutRate('lo_xien_2')}; Xiên 3: 1 ăn ${getPayoutRate('lo_xien_3')}; Xiên 4: 1 ăn ${getPayoutRate('lo_xien_4')}`}
            minBet={isLoading ? <Skeleton className="h-5 w-24 inline-block" /> : `${new Intl.NumberFormat('vi-VN').format(minBet)}đ`}
            href="/choi/lo-xien"
          />
          
          <BettingOptionCard
            title="3 Càng"
            description="Chọn 3 chữ số cuối của giải Đặc biệt XSMB"
            payoutRate={isLoading ? <Skeleton className="h-5 w-16 inline-block" /> : `1 ăn ${getPayoutRate('3cang')}`}
            minBet={isLoading ? <Skeleton className="h-5 w-24 inline-block" /> : `${new Intl.NumberFormat('vi-VN').format(minBet)}đ`}
            href="/choi/3cang"
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface BettingOptionCardProps {
  title: string;
  description: string;
  payoutRate: React.ReactNode;
  minBet: React.ReactNode;
  href: string;
  primary?: boolean;
  popular?: boolean;
}

function BettingOptionCard({
  title,
  description,
  payoutRate,
  minBet,
  href,
  primary = false,
  popular = false
}: BettingOptionCardProps) {
  return (
    <div className={`border ${primary ? 'border-[#d9534f]' : 'border-gray-200'} rounded p-4 relative shadow-sm`}>
      {popular && (
        <div className="absolute top-0 right-0 bg-[#d9534f] text-white text-xs px-2 py-1 rounded-bl">Phổ biến</div>
      )}
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm mb-3">{description}</p>
      <div className="text-sm mb-3">
        <div><span className="font-medium">Tỷ lệ:</span> {payoutRate}</div>
        <div><span className="font-medium">Cược tối thiểu:</span> {minBet}</div>
      </div>
      <Link href={href}>
        <a className={`block ${primary ? 'bg-[#d9534f]' : 'bg-[#0275d8]'} text-white text-center py-2 rounded hover:bg-opacity-90 transition`}>
          Chơi ngay
        </a>
      </Link>
    </div>
  );
}
