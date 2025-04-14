import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/Layout";
import LoadingSpinner, { PageLoader } from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  Eye,
  ArrowDownCircle,
  ArrowUpCircle
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet";

export default function AdminTransactionsPage() {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [notes, setNotes] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/admin/transactions'],
    enabled: !!isAdmin,
  });

  // Fetch users for reference
  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!isAdmin,
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => 
      apiRequest("PUT", `/api/admin/transactions/${id}`, data),
    onSuccess: () => {
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Cập nhật thành công",
        description: "Trạng thái giao dịch đã được cập nhật",
      });
    },
    onError: (error) => {
      toast({
        title: "Cập nhật thất bại",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        variant: "destructive",
      });
    },
  });

  // Filter transactions based on active tab, search term and filter status
  const filterTransactions = () => {
    if (!transactions) return [];
    
    let filtered = transactions;
    
    // Filter by type
    if (activeTab === "deposits") {
      filtered = filtered.filter((tx: any) => tx.type === "deposit");
    } else if (activeTab === "withdrawals") {
      filtered = filtered.filter((tx: any) => tx.type === "withdrawal");
    }
    
    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((tx: any) => tx.status === filterStatus);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((tx: any) => {
        const user = users?.find((u: any) => u.id === tx.userId);
        return (
          tx.id.toString().includes(searchTerm) ||
          (user && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (tx.reference && tx.reference.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }
    
    return filtered;
  };

  const filteredTransactions = filterTransactions();

  // Find username by userId
  const getUsernameById = (userId: number) => {
    const user = users?.find((u: any) => u.id === userId);
    return user ? user.username : "Unknown";
  };

  const openTransactionDialog = (transaction: any) => {
    setSelectedTransaction(transaction);
    setStatusUpdate(transaction.status);
    setNotes(transaction.notes || "");
    setDialogOpen(true);
  };

  const handleUpdateTransaction = () => {
    if (!selectedTransaction) return;
    
    updateTransactionMutation.mutate({
      id: selectedTransaction.id,
      data: {
        status: statusUpdate,
        notes
      }
    });
  };

  // Status badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Hoàn thành</Badge>;
      case "pending":
        return <Badge className="bg-amber-500"><Clock className="h-3 w-3 mr-1" /> Đang xử lý</Badge>;
      case "rejected":
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" /> Bị từ chối</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Transaction type icon
  const getTransactionTypeIcon = (type: string) => {
    return type === "deposit" 
      ? <ArrowDownCircle className="h-4 w-4 text-green-500" /> 
      : <ArrowUpCircle className="h-4 w-4 text-orange-500" />;
  };

  if (authLoading || (!isAdmin && user)) {
    return <PageLoader />;
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Quản lý giao dịch - Rồng Bạch Kim</title>
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Quản lý giao dịch</h1>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="deposits">Nạp tiền</TabsTrigger>
              <TabsTrigger value="withdrawals">Rút tiền</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Tìm kiếm theo ID, username..."
                  className="pl-8 w-full sm:w-auto"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select defaultValue="all" onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Đang xử lý</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="rejected">Bị từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "deposits" ? "Danh sách nạp tiền" : 
                   activeTab === "withdrawals" ? "Danh sách rút tiền" : 
                   "Danh sách giao dịch"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <LoadingSpinner />
                ) : filteredTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead>Người dùng</TableHead>
                          <TableHead>Số tiền</TableHead>
                          <TableHead>Phương thức</TableHead>
                          <TableHead>Mã tham chiếu</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Ngày tạo</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((tx: any) => (
                          <TableRow key={tx.id}>
                            <TableCell className="font-medium">{tx.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {getTransactionTypeIcon(tx.type)}
                                <span>{tx.type === "deposit" ? "Nạp tiền" : "Rút tiền"}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getUsernameById(tx.userId)}</TableCell>
                            <TableCell className="font-medium">
                              {new Intl.NumberFormat('vi-VN').format(tx.amount)}đ
                            </TableCell>
                            <TableCell>
                              {tx.method === "bank_transfer" ? "Ngân hàng" : 
                               tx.method === "e_wallet" ? "Ví điện tử" : tx.method}
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate">{tx.reference || "—"}</TableCell>
                            <TableCell>{getStatusBadge(tx.status)}</TableCell>
                            <TableCell>{new Date(tx.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openTransactionDialog(tx)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Chi tiết
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-gray-500">Không tìm thấy giao dịch nào</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết giao dịch</DialogTitle>
            <DialogDescription>
              Xem chi tiết và cập nhật trạng thái giao dịch
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="font-medium">Thông tin giao dịch</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">ID:</div>
                  <div>#{selectedTransaction.id}</div>
                  <div className="font-medium">Loại giao dịch:</div>
                  <div className="flex items-center gap-1">
                    {getTransactionTypeIcon(selectedTransaction.type)}
                    <span>
                      {selectedTransaction.type === "deposit" ? "Nạp tiền" : "Rút tiền"}
                    </span>
                  </div>
                  <div className="font-medium">Người dùng:</div>
                  <div>{getUsernameById(selectedTransaction.userId)}</div>
                  <div className="font-medium">Số tiền:</div>
                  <div className="font-medium">
                    {new Intl.NumberFormat('vi-VN').format(selectedTransaction.amount)}đ
                  </div>
                  <div className="font-medium">Phương thức:</div>
                  <div>
                    {selectedTransaction.method === "bank_transfer" ? "Chuyển khoản ngân hàng" : 
                     selectedTransaction.method === "e_wallet" ? "Ví điện tử" : selectedTransaction.method}
                  </div>
                  {selectedTransaction.bankAccount && (
                    <>
                      <div className="font-medium">Tài khoản:</div>
                      <div>{selectedTransaction.bankAccount}</div>
                    </>
                  )}
                  {selectedTransaction.bankName && (
                    <>
                      <div className="font-medium">Ngân hàng:</div>
                      <div>{selectedTransaction.bankName}</div>
                    </>
                  )}
                  <div className="font-medium">Mã tham chiếu:</div>
                  <div>{selectedTransaction.reference || "—"}</div>
                  <div className="font-medium">Ngày tạo:</div>
                  <div>{new Date(selectedTransaction.createdAt).toLocaleString("vi-VN")}</div>
                  <div className="font-medium">Trạng thái:</div>
                  <div>{getStatusBadge(selectedTransaction.status)}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Cập nhật trạng thái</Label>
                <Select
                  value={statusUpdate}
                  onValueChange={setStatusUpdate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Đang xử lý</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="rejected">Từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  placeholder="Nhập ghi chú cho giao dịch này"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button 
              onClick={handleUpdateTransaction}
              disabled={updateTransactionMutation.isPending}
            >
              {updateTransactionMutation.isPending ? (
                <LoadingSpinner size={16} text="" />
              ) : (
                "Cập nhật"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
