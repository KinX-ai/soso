import { useState } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import LotteryResult from "@/components/LotteryResult";
import QuickStats from "@/components/QuickStats";
import TodayPredictions from "@/components/TodayPredictions";
import BettingOptions from "@/components/BettingOptions";
import AccountSummary from "@/components/AccountSummary";
import StatisticsBox from "@/components/StatisticsBox";
import MostFrequentPairs from "@/components/MostFrequentPairs";
import Resources from "@/components/Resources";
import { Helmet } from "react-helmet";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [date] = useState(new Date());

  return (
    <Layout>
      <Helmet>
        <title>Rồng Bạch Kim - Dự đoán xổ số, Soi cầu lô đề</title>
        <meta name="description" content="Rồng Bạch Kim - Trang web dự đoán xổ số, soi cầu lô đề và cung cấp thống kê xổ số miền Bắc hàng ngày." />
      </Helmet>

      {/* Hero section with latest results and quick stats */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/* Latest Result Card */}
          <div className="w-full md:w-1/2 lg:w-7/12">
            <LotteryResult region="mienbac" useExternalApi={true} />
            <div className="mt-4 text-right">
              <Link href="/ket-qua">
                <Button variant="ghost" className="text-[#d9534f] hover:text-[#d9534f] hover:bg-red-50">
                  Xem tất cả kết quả
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Quick Stats Card */}
          <div className="w-full md:w-1/2 lg:w-5/12">
            <QuickStats />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Predictions & Betting */}
        <div className="lg:col-span-2">
          {/* Predictions */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <TodayPredictions />
          </div>
          
          {/* Betting Options */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <BettingOptions />
          </div>
        </div>
        
        {/* Right Column - Stats & Sidebar */}
        <div className="lg:col-span-1">
          {/* Account Summary */}
          <div className="mb-6">
            <AccountSummary />
          </div>
          
          {/* Statistics Box */}
          <div className="mb-6">
            <StatisticsBox />
          </div>
          
          {/* Most Frequent Pairs */}
          <div className="mb-6">
            <MostFrequentPairs />
          </div>
          
          {/* Resources */}
          <div>
            <Resources />
          </div>
        </div>
      </div>
    </Layout>
  );
}
