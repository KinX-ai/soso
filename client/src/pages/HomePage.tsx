import { useState } from "react";
import { Link } from "wouter";
import { vi } from "date-fns/locale";
import { format as formatDate } from "date-fns";
import Layout from "@/components/Layout";
import LotteryResult, { LotteryResultTabs } from "@/components/LotteryResult";
import QuickStats from "@/components/QuickStats";
import TodayPredictions from "@/components/TodayPredictions";
import BettingOptions from "@/components/BettingOptions";
import AccountSummary from "@/components/AccountSummary";
import StatisticsBox from "@/components/StatisticsBox";
import MostFrequentPairs from "@/components/MostFrequentPairs";
import Resources from "@/components/Resources";
import HeadTailTable from "@/components/HeadTailTable";
import { Helmet } from "react-helmet";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";

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
          {/* Latest Results and Head-Tail Table Section */}
          <div className="w-full md:w-8/12">
            <div className="mb-4">
              <Tabs defaultValue="mienbac" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white">
                  <TabsTrigger value="mienbac" className="rounded">Miền Bắc</TabsTrigger>
                  <TabsTrigger value="mientrung" className="rounded">Miền Trung</TabsTrigger>
                  <TabsTrigger value="miennam" className="rounded">Miền Nam</TabsTrigger>
                </TabsList>
                <TabsContent value="mienbac" className="mt-4">
                  <HeadTailTable 
                    title={formatDate(date, "EEEE - dd/MM/yyyy", { locale: vi })} 
                  />
                </TabsContent>
                <TabsContent value="mientrung" className="mt-4">
                  <HeadTailTable 
                    title={formatDate(date, "EEEE - dd/MM/yyyy", { locale: vi })} 
                  />
                </TabsContent>
                <TabsContent value="miennam" className="mt-4">
                  <HeadTailTable 
                    title={formatDate(date, "EEEE - dd/MM/yyyy", { locale: vi })} 
                  />
                </TabsContent>
              </Tabs>
            </div>
            <div className="mt-2 text-right">
              <Link href="/ket-qua">
                <Button variant="ghost" className="text-[#d9534f] hover:text-[#d9534f] hover:bg-red-50">
                  Xem tất cả kết quả
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Quick Stats Card */}
          <div className="w-full md:w-4/12">
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
