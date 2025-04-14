import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/Layout";
import LoadingSpinner, { PageLoader } from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, UserCog, AlertCircle } from "lucide-react";
import { Helmet } from "react-helmet";

export default function AdminUsersPage() {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editUser, setEditUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!isAdmin,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => 
      apiRequest("PUT", `/api/admin/users/${id}`, data),
    onSuccess: () => {
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin người dùng đã được cập nhật",
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

  // Filter users based on search term
  const filteredUsers = users
    ? users.filter((u: any) => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const openEditDialog = (user: any) => {
    setEditUser({
      ...user,
      isActive: user.isActive,
      role: user.role,
      balance: user.balance,
    });
    setDialogOpen(true);
  };

  const handleUserUpdate = () => {
    if (!editUser) return;
    
    updateUserMutation.mutate({
      id: editUser.id,
      data: {
        isActive: editUser.isActive,
        role: editUser.role,
        balance: parseFloat(editUser.balance)
      }
    });
  };

  if (authLoading || (!isAdmin && user)) {
    return <PageLoader />;
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Quản lý người dùng - Rồng Bạch Kim</title>
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        
        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tìm kiếm theo tên, email, username..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <LoadingSpinner />
            ) : users && users.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Số dư</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{new Intl.NumberFormat('vi-VN').format(user.balance)}đ</TableCell>
                        <TableCell>
                          <Badge className={user.role === "admin" ? "bg-purple-500" : "bg-blue-500"}>
                            {user.role === "admin" ? "Admin" : "User"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={user.isActive ? "bg-green-500" : "bg-red-500"}>
                            {user.isActive ? "Hoạt động" : "Bị khóa"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEditDialog(user)}
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Quản lý
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
                <p className="mt-2 text-gray-500">Không tìm thấy người dùng nào</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Quản lý người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin và quyền của người dùng
            </DialogDescription>
          </DialogHeader>
          
          {editUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="font-medium">Thông tin người dùng</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Username:</div>
                  <div>{editUser.username}</div>
                  <div className="font-medium">Họ tên:</div>
                  <div>{editUser.fullName}</div>
                  <div className="font-medium">Email:</div>
                  <div>{editUser.email}</div>
                  <div className="font-medium">Số điện thoại:</div>
                  <div>{editUser.phoneNumber}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="balance">Số dư (VND)</Label>
                <Input
                  id="balance"
                  type="number"
                  value={editUser.balance}
                  onChange={(e) => setEditUser({...editUser, balance: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select
                  value={editUser.role}
                  onValueChange={(value) => setEditUser({...editUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Người dùng</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={editUser.isActive}
                  onCheckedChange={(checked) => setEditUser({...editUser, isActive: checked})}
                />
                <Label htmlFor="active">Tài khoản đang hoạt động</Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button 
              onClick={handleUserUpdate}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
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
