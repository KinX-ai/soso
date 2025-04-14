import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/Layout";
import LoadingSpinner, { PageLoader } from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Users, 
  DollarSign, 
  Ticket, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity
} from "lucide-react";
import { Helmet } from "react-helmet";

// Dashboard stats card component
function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  trendValue 
}: { 
  title: string; 
  value: string; 
  description: string; 
  icon: React.ReactNode; 
  trend: "up" | "down" | "neutral"; 
  trendValue: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
        {trend !== "neutral" && (
          <div className={`flex items-center mt-2 text-xs ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}>
            {trend === "up" ? 
              <ArrowUpRight className="h-3 w-3 mr-1" /> : 
              <ArrowDownRight className="h-3 w-3 mr-1" />
            }
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Fetch users for admin
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!isAdmin,
  });

  // Fetch transactions for admin
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/admin/transactions'],
    enabled: !!isAdmin,
  });

  // Fetch all settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    enabled: !!isAdmin,
  });

  if (authLoading || (!isAdmin && user)) {
    return <PageLoader />;
  }

  // Prepare data for charts
  const getChartData = () => {
    if (!transactions) return [];
    
    // Group transactions by date
    const depositsMap = new Map();
    const withdrawalsMap = new Map();
    
    transactions.forEach((tx: any) => {
      if (tx.status !== "completed") return;
      
      const date = new Date(tx.createdAt).toLocaleDateString('vi-VN');
      
      if (tx.type === "deposit") {
        depositsMap.set(date, (depositsMap.get(date) || 0) + tx.amount);
      } else if (tx.type === "withdrawal") {
        withdrawalsMap.set(date, (withdrawalsMap.get(date) || 0) + tx.amount);
      }
    });
    
    // Convert to array format for charts
    const dates = Array.from(new Set([...depositsMap.keys(), ...withdrawalsMap.keys()])).sort();
    
    return dates.map(date => ({
      date,
      deposits: depositsMap.get(date) || 0,
      withdrawals: withdrawalsMap.get(date) || 0,
      balance: (depositsMap.get(date) || 0) - (withdrawalsMap.get(date) || 0)
    }));
  };

  const transactionStatusData = () => {
    if (!transactions) return [];
    
    const statusCounts = {
      completed: 0,
      pending: 0,
      rejected: 0
    };
    
    transactions.forEach((tx: any) => {
      if (statusCounts[tx.status as keyof typeof statusCounts] !== undefined) {
        statusCounts[tx.status as keyof typeof statusCounts]++;
      }
    });
    
    return [
      { name: 'Hoàn thành', value: statusCounts.completed },
      { name: 'Đang xử lý', value: statusCounts.pending },
      { name: 'Bị từ chối', value: statusCounts.rejected }
    ];
  };

  // Calculate stats
  const getTotalDeposits = () => {
    if (!transactions) return 0;
    return transactions
      .filter((tx: any) => tx.type === "deposit" && tx.status === "completed")
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);
  };

  const getTotalWithdrawals = () => {
    if (!transactions) return 0;
    return transactions
      .filter((tx: any) => tx.type === "withdrawal" && tx.status === "completed")
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);
  };

  const getPendingTransactions = () => {
    if (!transactions) return 0;
    return transactions.filter((tx: any) => tx.status === "pending").length;
  };

  const getActiveUsers = () => {
    if (!users) return 0;
    return users.filter((user: any) => user.isActive).length;
  };

  // Colors for pie chart
  const COLORS = ['#0088FE', '#FFBB28', '#FF8042'];

  const chartData = getChartData();
  const pieData = transactionStatusData();
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Admin Dashboard - Rồng Bạch Kim</title>
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Tổng người dùng"
            value={usersLoading ? "..." : `${users?.length || 0}`}
            description="Số lượng tài khoản"
            icon={<Users className="h-4 w-4" />}
            trend="up"
            trendValue="10% so với tháng trước"
          />
          
          <StatsCard 
            title="Tổng nạp tiền"
            value={transactionsLoading ? "..." : `${new Intl.NumberFormat('vi-VN').format(getTotalDeposits())}đ`}
            description="Tổng tiền nạp vào hệ thống"
            icon={<DollarSign className="h-4 w-4" />}
            trend="up"
            trendValue="15% so với tháng trước"
          />
          
          <StatsCard 
            title="Tổng rút tiền"
            value={transactionsLoading ? "..." : `${new Intl.NumberFormat('vi-VN').format(getTotalWithdrawals())}đ`}
            description="Tổng tiền đã rút"
            icon={<DollarSign className="h-4 w-4" />}
            trend="down"
            trendValue="5% so với tháng trước"
          />
          
          <StatsCard 
            title="Giao dịch chờ xử lý"
            value={transactionsLoading ? "..." : `${getPendingTransactions()}`}
            description="Nạp/rút tiền đang chờ"
            icon={<Ticket className="h-4 w-4" />}
            trend="neutral"
            trendValue=""
          />
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Biểu đồ giao dịch</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <LoadingSpinner />
              ) : chartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + "đ"} />
                      <Line type="monotone" dataKey="deposits" name="Nạp tiền" stroke="#5cb85c" />
                      <Line type="monotone" dataKey="withdrawals" name="Rút tiền" stroke="#d9534f" />
                      <Line type="monotone" dataKey="balance" name="Cân đối" stroke="#0275d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Không có dữ liệu</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Transaction Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái giao dịch</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <LoadingSpinner />
              ) : transactions && transactions.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Không có dữ liệu</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin hệ thống</CardTitle>
          </CardHeader>
          <CardContent>
            {settingsLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2" /> Người dùng
                  </h3>
                  <ul className="space-y-1 text-sm">
                    <li>Tổng số: {users?.length || 0}</li>
                    <li>Đang hoạt động: {getActiveUsers()}</li>
                    <li>Bị khóa: {(users?.length || 0) - getActiveUsers()}</li>
                    <li>Admin: {users?.filter((u: any) => u.role === "admin").length || 0}</li>
                  </ul>
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" /> Cấu hình thanh toán
                  </h3>
                  <ul className="space-y-1 text-sm">
                    <li>Min cược: {settings?.find((s: any) => s.key === "min_bet_amount")?.value.toLocaleString('vi-VN')}đ</li>
                    <li>Max cược: {settings?.find((s: any) => s.key === "max_bet_amount")?.value.toLocaleString('vi-VN')}đ</li>
                    <li>Mở thưởng: {settings?.find((s: any) => s.key === "lottery_schedule")?.value.time}</li>
                  </ul>
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Activity className="h-4 w-4 mr-2" /> Tỷ lệ cược
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {settings?.find((s: any) => s.key === "betting_rates")?.value && (
                      Object.entries(settings?.find((s: any) => s.key === "betting_rates")?.value).map(([key, value]: [string, any]) => (
                        <li key={key}>{key}: 1 ăn {value}</li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
