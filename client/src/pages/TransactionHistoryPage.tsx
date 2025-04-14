import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Layout from "@/components/Layout";
import LoadingSpinner, { PageLoader } from "@/components/LoadingSpinner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Helmet } from "react-helmet";

// Status badge component
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-500 hover:bg-green-600">Thành công</Badge>;
    case "pending":
      return <Badge className="bg-amber-500 hover:bg-amber-600">Đang xử lý</Badge>;
    case "rejected":
      return <Badge className="bg-red-500 hover:bg-red-600">Bị từ chối</Badge>;
    default:
      return <Badge className="bg-gray-500">{status}</Badge>;
  }
}

// Transaction type badge component
function TransactionTypeBadge({ type }: { type: string }) {
  switch (type) {
    case "deposit":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Nạp tiền</Badge>;
    case "withdrawal":
      return <Badge className="bg-orange-500 hover:bg-orange-600">Rút tiền</Badge>;
    default:
      return <Badge className="bg-gray-500">{type}</Badge>;
  }
}

// Bet status badge component
function BetStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "won":
      return <Badge className="bg-green-500 hover:bg-green-600">Thắng</Badge>;
    case "lost":
      return <Badge className="bg-red-500 hover:bg-red-600">Thua</Badge>;
    case "pending":
      return <Badge className="bg-amber-500 hover:bg-amber-600">Đang chờ</Badge>;
    default:
      return <Badge className="bg-gray-500">{status}</Badge>;
  }
}

// Bet type badge component
function BetTypeBadge({ type }: { type: string }) {
  switch (type) {
    case "lo":
      return <Badge className="bg-purple-500 hover:bg-purple-600">Lô</Badge>;
    case "de":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Đề</Badge>;
    case "3cang":
      return <Badge className="bg-indigo-500 hover:bg-indigo-600">3 Càng</Badge>;
    case "lo_xien_2":
      return <Badge className="bg-cyan-500 hover:bg-cyan-600">Lô Xiên 2</Badge>;
    case "lo_xien_3":
      return <Badge className="bg-teal-500 hover:bg-teal-600">Lô Xiên 3</Badge>;
    case "lo_xien_4":
      return <Badge className="bg-emerald-500 hover:bg-emerald-600">Lô Xiên 4</Badge>;
    default:
      return <Badge className="bg-gray-500">{type}</Badge>;
  }
}

export default function TransactionHistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [betFilter, setBetFilter] = useState("all");

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
    enabled: !!user,
  });

  // Fetch bets
  const { data: bets, isLoading: betsLoading } = useQuery({
    queryKey: ['/api/bets'],
    enabled: !!user,
  });

  if (authLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Chưa đăng nhập</AlertTitle>
            <AlertDescription>
              Vui lòng đăng nhập để xem lịch sử giao dịch
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  // Filter transactions based on filter type
  const filteredTransactions = transactions
    ? transactions.filter((tx: any) => {
        if (transactionFilter === "all") return true;
        if (transactionFilter === "deposit" && tx.type === "deposit") return true;
        if (transactionFilter === "withdrawal" && tx.type === "withdrawal") return true;
        if (transactionFilter === "pending" && tx.status === "pending") return true;
        if (transactionFilter === "completed" && tx.status === "completed") return true;
        if (transactionFilter === "rejected" && tx.status === "rejected") return true;
        return false;
      })
    : [];

  // Filter bets based on filter type
  const filteredBets = bets
    ? bets.filter((bet: any) => {
        if (betFilter === "all") return true;
        if (betFilter === "won" && bet.status === "won") return true;
        if (betFilter === "lost" && bet.status === "lost") return true;
        if (betFilter === "pending" && bet.status === "pending") return true;
        if (["lo", "de", "3cang", "lo_xien_2", "lo_xien_3", "lo_xien_4"].includes(betFilter) && bet.type === betFilter) return true;
        return false;
      })
    : [];

  return (
    <Layout>
      <Helmet>
        <title>Lịch sử giao dịch - Rồng Bạch Kim</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Lịch sử giao dịch</h1>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
            <TabsTrigger value="bets">Cược</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Giao dịch gần đây</CardTitle>
                  <CardDescription>Lịch sử nạp/rút tiền</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <LoadingSpinner />
                  ) : transactions && transactions.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ngày</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Số tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.slice(0, 5).map((tx: any) => (
                            <TableRow key={tx.id}>
                              <TableCell>{new Date(tx.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                              <TableCell><TransactionTypeBadge type={tx.type} /></TableCell>
                              <TableCell className="font-medium">
                                {new Intl.NumberFormat('vi-VN').format(tx.amount)} đ
                              </TableCell>
                              <TableCell><StatusBadge status={tx.status} /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có giao dịch nào
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Cược gần đây</CardTitle>
                  <CardDescription>Lịch sử đặt cược</CardDescription>
                </CardHeader>
                <CardContent>
                  {betsLoading ? (
                    <LoadingSpinner />
                  ) : bets && bets.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ngày</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Số tiền</TableHead>
                            <TableHead>Kết quả</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bets.slice(0, 5).map((bet: any) => (
                            <TableRow key={bet.id}>
                              <TableCell>{new Date(bet.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                              <TableCell><BetTypeBadge type={bet.type} /></TableCell>
                              <TableCell className="font-medium">
                                {new Intl.NumberFormat('vi-VN').format(bet.amount)} đ
                              </TableCell>
                              <TableCell><BetStatusBadge status={bet.status} /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có cược nào
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Lịch sử giao dịch</CardTitle>
                  <CardDescription>Tất cả giao dịch nạp/rút tiền</CardDescription>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Select defaultValue="all" onValueChange={setTransactionFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Lọc giao dịch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="deposit">Nạp tiền</SelectItem>
                      <SelectItem value="withdrawal">Rút tiền</SelectItem>
                      <SelectItem value="pending">Đang xử lý</SelectItem>
                      <SelectItem value="completed">Thành công</SelectItem>
                      <SelectItem value="rejected">Bị từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <LoadingSpinner />
                ) : filteredTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã GD</TableHead>
                          <TableHead>Ngày</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead>Số tiền</TableHead>
                          <TableHead>Phương thức</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Ghi chú</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((tx: any) => (
                          <TableRow key={tx.id}>
                            <TableCell className="font-medium">#{tx.id}</TableCell>
                            <TableCell>{new Date(tx.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                            <TableCell><TransactionTypeBadge type={tx.type} /></TableCell>
                            <TableCell className="font-medium">
                              {new Intl.NumberFormat('vi-VN').format(tx.amount)} đ
                            </TableCell>
                            <TableCell>
                              {tx.method === "bank_transfer" ? "Ngân hàng" : 
                               tx.method === "e_wallet" ? "Ví điện tử" : tx.method}
                            </TableCell>
                            <TableCell><StatusBadge status={tx.status} /></TableCell>
                            <TableCell className="max-w-xs truncate">{tx.notes || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy giao dịch nào
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bets">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Lịch sử đặt cược</CardTitle>
                  <CardDescription>Tất cả các lệnh đặt cược</CardDescription>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Select defaultValue="all" onValueChange={setBetFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Lọc cược" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="pending">Đang chờ</SelectItem>
                      <SelectItem value="won">Thắng</SelectItem>
                      <SelectItem value="lost">Thua</SelectItem>
                      <SelectItem value="lo">Lô</SelectItem>
                      <SelectItem value="de">Đề</SelectItem>
                      <SelectItem value="3cang">3 Càng</SelectItem>
                      <SelectItem value="lo_xien_2">Lô Xiên 2</SelectItem>
                      <SelectItem value="lo_xien_3">Lô Xiên 3</SelectItem>
                      <SelectItem value="lo_xien_4">Lô Xiên 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {betsLoading ? (
                  <LoadingSpinner />
                ) : filteredBets.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã cược</TableHead>
                          <TableHead>Ngày cược</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead>Các số đã chọn</TableHead>
                          <TableHead>Số tiền</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Tiền thắng</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBets.map((bet: any) => (
                          <TableRow key={bet.id}>
                            <TableCell className="font-medium">#{bet.id}</TableCell>
                            <TableCell>{new Date(bet.date).toLocaleDateString("vi-VN")}</TableCell>
                            <TableCell><BetTypeBadge type={bet.type} /></TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate">
                                {Array.isArray(bet.numbers) ? bet.numbers.join(", ") : bet.numbers}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {new Intl.NumberFormat('vi-VN').format(bet.amount)} đ
                            </TableCell>
                            <TableCell><BetStatusBadge status={bet.status} /></TableCell>
                            <TableCell className={bet.status === "won" ? "text-green-600 font-medium" : ""}>
                              {bet.status === "won" && bet.payout ? 
                                `+${new Intl.NumberFormat('vi-VN').format(bet.payout)} đ` : 
                                "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy cược nào
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
