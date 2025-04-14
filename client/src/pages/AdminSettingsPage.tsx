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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InfoIcon, Save, Settings, TimerIcon, DollarSign } from "lucide-react";
import { Helmet } from "react-helmet";

export default function AdminSettingsPage() {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("betting_rates");
  const [editDialog, setEditDialog] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<any>(null);
  const [editedValue, setEditedValue] = useState<any>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Fetch all settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    enabled: !!isAdmin,
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value, description }: { key: string, value: any, description?: string }) =>
      apiRequest("PUT", `/api/admin/settings/${key}`, { value, description }),
    onSuccess: () => {
      setEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: "Cập nhật thành công",
        description: "Cài đặt đã được cập nhật",
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

  // Get settings based on key
  const getSetting = (key: string) => {
    return settings?.find((s: any) => s.key === key);
  };

  // Betting rates settings
  const bettingRatesSetting = getSetting("betting_rates");
  const bettingRates = bettingRatesSetting?.value || {};
  
  // Bet amount settings
  const minBetSetting = getSetting("min_bet_amount");
  const maxBetSetting = getSetting("max_bet_amount");
  
  // Lottery schedule settings
  const lotteryScheduleSetting = getSetting("lottery_schedule");

  // Open edit dialog for different setting types
  const openEditDialog = (key: string) => {
    const setting = getSetting(key);
    if (!setting) return;
    
    setSelectedSetting(setting);
    setEditedValue(JSON.parse(JSON.stringify(setting.value))); // Deep clone
    setEditDialog(true);
  };

  // Save edited setting
  const saveSettings = () => {
    if (!selectedSetting) return;
    
    updateSettingMutation.mutate({
      key: selectedSetting.key,
      value: editedValue,
      description: selectedSetting.description
    });
  };

  if (authLoading || (!isAdmin && user)) {
    return <PageLoader />;
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Cài đặt hệ thống - Rồng Bạch Kim</title>
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="betting_rates">Tỷ lệ cược</TabsTrigger>
            <TabsTrigger value="bet_amounts">Hạn mức đặt cược</TabsTrigger>
            <TabsTrigger value="lottery_schedule">Lịch mở thưởng</TabsTrigger>
          </TabsList>
          
          <TabsContent value="betting_rates">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tỷ lệ cược</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openEditDialog("betting_rates")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Cài đặt tỷ lệ
                </Button>
              </CardHeader>
              <CardContent>
                {settingsLoading ? (
                  <LoadingSpinner />
                ) : bettingRatesSetting ? (
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Loại cược</TableHead>
                          <TableHead>Tỷ lệ</TableHead>
                          <TableHead>Mô tả</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Lô</TableCell>
                          <TableCell>1 ăn {bettingRates.lo}</TableCell>
                          <TableCell>Cược lô (2 số cuối trong các giải)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Đề</TableCell>
                          <TableCell>1 ăn {bettingRates.de}</TableCell>
                          <TableCell>Cược đề (2 số cuối giải đặc biệt)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">3 Càng</TableCell>
                          <TableCell>1 ăn {bettingRates["3cang"]}</TableCell>
                          <TableCell>Cược 3 càng (3 số cuối giải đặc biệt)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Lô Xiên 2</TableCell>
                          <TableCell>1 ăn {bettingRates.lo_xien_2}</TableCell>
                          <TableCell>Cược 2 số lô về cùng ngày</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Lô Xiên 3</TableCell>
                          <TableCell>1 ăn {bettingRates.lo_xien_3}</TableCell>
                          <TableCell>Cược 3 số lô về cùng ngày</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Lô Xiên 4</TableCell>
                          <TableCell>1 ăn {bettingRates.lo_xien_4}</TableCell>
                          <TableCell>Cược 4 số lô về cùng ngày</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    
                    <Alert className="mt-4">
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Lưu ý về tỷ lệ cược</AlertTitle>
                      <AlertDescription>
                        Tỷ lệ cược là số tiền nhận được khi đặt cược 1 đơn vị tiền tệ. Ví dụ: Tỷ lệ 1 ăn 99 nghĩa là đặt 10,000đ sẽ nhận được 990,000đ nếu thắng.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy cài đặt tỷ lệ cược
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bet_amounts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Hạn mức đặt cược</CardTitle>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openEditDialog("min_bet_amount")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Cược tối thiểu
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openEditDialog("max_bet_amount")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Cược tối đa
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {settingsLoading ? (
                  <LoadingSpinner />
                ) : (minBetSetting && maxBetSetting) ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Tiền cược tối thiểu
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-2">
                            {new Intl.NumberFormat('vi-VN').format(minBetSetting.value)} đ
                          </div>
                          <div className="text-sm text-gray-500">
                            Cập nhật: {new Date(minBetSetting.updatedAt).toLocaleString('vi-VN')}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Tiền cược tối đa
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-2">
                            {new Intl.NumberFormat('vi-VN').format(maxBetSetting.value)} đ
                          </div>
                          <div className="text-sm text-gray-500">
                            Cập nhật: {new Date(maxBetSetting.updatedAt).toLocaleString('vi-VN')}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Lưu ý về hạn mức cược</AlertTitle>
                      <AlertDescription>
                        Các hạn mức này áp dụng cho tất cả loại cược. Người dùng sẽ không thể đặt cược thấp hơn mức tối thiểu hoặc cao hơn mức tối đa.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy cài đặt hạn mức cược
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="lottery_schedule">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lịch mở thưởng</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openEditDialog("lottery_schedule")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Cài đặt lịch
                </Button>
              </CardHeader>
              <CardContent>
                {settingsLoading ? (
                  <LoadingSpinner />
                ) : lotteryScheduleSetting ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <TimerIcon className="h-4 w-4 mr-2" />
                          Thời gian mở thưởng hàng ngày
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold mb-2">
                          {lotteryScheduleSetting.value.time}
                        </div>
                        <div className="text-sm text-gray-500">
                          Cập nhật: {new Date(lotteryScheduleSetting.updatedAt).toLocaleString('vi-VN')}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Lưu ý về lịch mở thưởng</AlertTitle>
                      <AlertDescription>
                        Thời gian mở thưởng là thời điểm hệ thống sẽ xử lý các lệnh đặt cược và xác định thắng/thua. Cược đặt sau thời gian này sẽ được tính cho ngày tiếp theo.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy cài đặt lịch mở thưởng
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Setting Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa cài đặt</DialogTitle>
            <DialogDescription>
              Điều chỉnh giá trị cho cài đặt "{selectedSetting?.description}"
            </DialogDescription>
          </DialogHeader>
          
          {selectedSetting && (
            <div className="space-y-4 py-4">
              {selectedSetting.key === "betting_rates" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lô</label>
                      <Input
                        type="number"
                        value={editedValue.lo}
                        onChange={(e) => setEditedValue({...editedValue, lo: parseFloat(e.target.value)})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Đề</label>
                      <Input
                        type="number"
                        value={editedValue.de}
                        onChange={(e) => setEditedValue({...editedValue, de: parseFloat(e.target.value)})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">3 Càng</label>
                      <Input
                        type="number"
                        value={editedValue["3cang"]}
                        onChange={(e) => setEditedValue({...editedValue, "3cang": parseFloat(e.target.value)})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lô Xiên 2</label>
                      <Input
                        type="number"
                        value={editedValue.lo_xien_2}
                        onChange={(e) => setEditedValue({...editedValue, lo_xien_2: parseFloat(e.target.value)})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lô Xiên 3</label>
                      <Input
                        type="number"
                        value={editedValue.lo_xien_3}
                        onChange={(e) => setEditedValue({...editedValue, lo_xien_3: parseFloat(e.target.value)})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lô Xiên 4</label>
                      <Input
                        type="number"
                        value={editedValue.lo_xien_4}
                        onChange={(e) => setEditedValue({...editedValue, lo_xien_4: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Lưu ý</AlertTitle>
                    <AlertDescription>
                      Thay đổi tỷ lệ sẽ ảnh hưởng đến tất cả các lệnh đặt cược mới. Các lệnh đã đặt không bị ảnh hưởng.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              {(selectedSetting.key === "min_bet_amount" || selectedSetting.key === "max_bet_amount") && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {selectedSetting.key === "min_bet_amount" ? "Tiền cược tối thiểu (VND)" : "Tiền cược tối đa (VND)"}
                    </label>
                    <Input
                      type="number"
                      value={editedValue}
                      onChange={(e) => setEditedValue(parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Lưu ý</AlertTitle>
                    <AlertDescription>
                      {selectedSetting.key === "min_bet_amount" 
                        ? "Nếu đặt giá trị quá cao có thể làm giảm số lượng người tham gia cược."
                        : "Nếu đặt giá trị quá cao có thể gây rủi ro tài chính cho hệ thống."}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              {selectedSetting.key === "lottery_schedule" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Thời gian mở thưởng (HH:MM)</label>
                    <Input
                      type="time"
                      value={editedValue.time}
                      onChange={(e) => setEditedValue({...editedValue, time: e.target.value})}
                    />
                  </div>
                  
                  <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Lưu ý</AlertTitle>
                    <AlertDescription>
                      Thời gian mở thưởng cần phù hợp với lịch công bố kết quả xổ số chính thức. Thay đổi thời gian này sẽ ảnh hưởng đến thời hạn đặt cược.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Hủy</Button>
            <Button 
              onClick={saveSettings}
              disabled={updateSettingMutation.isPending}
            >
              {updateSettingMutation.isPending ? (
                <LoadingSpinner size={16} text="" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu cài đặt
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
