import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Helmet } from "react-helmet";

export default function LotteryStatsPage() {
  const [selectedRegion, setSelectedRegion] = useState("mienbac");

  return (
    <Layout>
      <Helmet>
        <title>Thống kê xổ số - Rồng Bạch Kim</title>
      </Helmet>

      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Thống kê xổ số</h1>

        <Tabs defaultValue="mienbac">
          <TabsList>
            <TabsTrigger value="mienbac">Miền Bắc</TabsTrigger>
            <TabsTrigger value="mientrung">Miền Trung</TabsTrigger>
            <TabsTrigger value="miennam">Miền Nam</TabsTrigger>
          </TabsList>

          <TabsContent value="mienbac">
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-4">Thống kê Miền Bắc</h2>
              <LoGanStats region={selectedRegion} />
              <LoVeNhieuStats region={selectedRegion} />
              <DauDuoiStats region={selectedRegion} />
            </div>
          </TabsContent>

          <TabsContent value="mientrung">
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-4">Thống kê Miền Trung</h2>
              <LoGanStats region={"mientrung"} />
              <LoVeNhieuStats region={"mientrung"} />
              <DauDuoiStats region={"mientrung"} />
            </div>
          </TabsContent>

          <TabsContent value="miennam">
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-4">Thống kê Miền Nam</h2>
              <LoGanStats region={"miennam"} />
              <LoVeNhieuStats region={"miennam"} />
              <DauDuoiStats region={"miennam"} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function LoGanStats({ region }: { region: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/stats/absence/${region}?limit=20`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-500">
          Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = data.slice(0, 10).map((item: any) => ({
    number: item.number,
    days: item.days
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Top 10 lô gan lâu nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="number" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="days" fill="#d9534f" name="Số ngày" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lô gan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Cặp số</TableHead>
                <TableHead>Số ngày gan</TableHead>
                <TableHead>Ngày về gần nhất</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item: any, index: number) => {
                // Calculate the last appearance date
                const lastDate = new Date();
                lastDate.setDate(lastDate.getDate() - item.days);
                const formattedDate = format(lastDate, "dd/MM/yyyy", { locale: vi });

                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.number}</TableCell>
                    <TableCell>{item.days}</TableCell>
                    <TableCell>{formattedDate}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function LoVeNhieuStats({ region }: { region: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/stats/frequent/${region}?limit=20`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-500">
          Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = data.slice(0, 10).map((item: any) => ({
    number: item.number,
    occurrences: item.occurrences
  }));

  // Custom colors for pie chart
  const COLORS = ['#d9534f', '#f0ad4e', '#5cb85c', '#0275d8', '#5bc0de', '#292b2c', '#868e96', '#FF8042', '#FFBB28', '#00C49F'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Top 10 lô về nhiều nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ number, percent }) => `${number} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="occurrences"
                  nameKey="number"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lô về nhiều</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Cặp số</TableHead>
                <TableHead>Số lần xuất hiện</TableHead>
                <TableHead>Tỷ lệ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item: any, index: number) => {
                // Calculate percentage based on total occurrences
                const totalOccurrences = data.reduce((sum: number, curr: any) => sum + curr.occurrences, 0);
                const percentage = ((item.occurrences / totalOccurrences) * 100).toFixed(2);

                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.number}</TableCell>
                    <TableCell>{item.occurrences}</TableCell>
                    <TableCell>{percentage}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function DauDuoiStats({ region }: { region: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/stats/frequent/${region}?limit=100`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-500">
          Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.
        </CardContent>
      </Card>
    );
  }

  // Group by first digit (đầu)
  const dauStats: any = {};
  // Group by second digit (đuôi)
  const duoiStats: any = {};

  // Process data
  data.forEach((item: any) => {
    const dau = item.number.charAt(0);
    const duoi = item.number.charAt(1);

    if (!dauStats[dau]) dauStats[dau] = 0;
    if (!duoiStats[duoi]) duoiStats[duoi] = 0;

    dauStats[dau] += item.occurrences;
    duoiStats[duoi] += item.occurrences;
  });

  // Convert to array for chart
  const dauChartData = Object.entries(dauStats).map(([key, value]) => ({
    digit: key,
    occurrences: value
  })).sort((a, b) => b.occurrences - a.occurrences);

  const duoiChartData = Object.entries(duoiStats).map(([key, value]) => ({
    digit: key,
    occurrences: value
  })).sort((a, b) => b.occurrences - a.occurrences);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thống kê đầu số</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dauChartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="digit" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="occurrences" fill="#0275d8" name="Số lần xuất hiện" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê đuôi số</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={duoiChartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="digit" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="occurrences" fill="#5cb85c" name="Số lần xuất hiện" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bảng thống kê đầu số</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đầu số</TableHead>
                  <TableHead>Số lần xuất hiện</TableHead>
                  <TableHead>Tỷ lệ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dauChartData.map((item: any, index: number) => {
                  // Calculate percentage
                  const totalOccurrences = dauChartData.reduce((sum, curr) => sum + curr.occurrences, 0);
                  const percentage = ((item.occurrences / totalOccurrences) * 100).toFixed(2);

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.digit}</TableCell>
                      <TableCell>{item.occurrences}</TableCell>
                      <TableCell>{percentage}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bảng thống kê đuôi số</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đuôi số</TableHead>
                  <TableHead>Số lần xuất hiện</TableHead>
                  <TableHead>Tỷ lệ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {duoiChartData.map((item: any, index: number) => {
                  // Calculate percentage
                  const totalOccurrences = duoiChartData.reduce((sum, curr) => sum + curr.occurrences, 0);
                  const percentage = ((item.occurrences / totalOccurrences) * 100).toFixed(2);

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.digit}</TableCell>
                      <TableCell>{item.occurrences}</TableCell>
                      <TableCell>{percentage}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}