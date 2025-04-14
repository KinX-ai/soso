import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export default function AccountSummary() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded p-3 text-center">
            <p className="mb-3">Đăng nhập để theo dõi lịch sử cược và tham gia chơi</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dang-nhap">
                <Button className="w-full bg-[#d9534f] hover:bg-[#c9302c] text-white">Đăng nhập</Button>
              </Link>
              <Link href="/dang-ky">
                <Button className="w-full bg-[#0275d8] hover:bg-[#025aa5] text-white">Đăng ký</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Tài khoản của bạn</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-gray-500">Xin chào</span>
            <span className="font-medium">{user.fullName}</span>
          </div>
          
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-gray-500">Số dư</span>
            <span className="font-bold text-lg text-[#d9534f]">
              {new Intl.NumberFormat('vi-VN').format(user.balance)} đ
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Link href="/nap-tien">
              <Button className="w-full bg-[#5cb85c] hover:bg-[#449d44] text-white">Nạp tiền</Button>
            </Link>
            <Link href="/rut-tien">
              <Button className="w-full bg-[#f0ad4e] hover:bg-[#ec971f] text-white">Rút tiền</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Link href="/lich-su-giao-dich">
              <Button variant="outline" className="w-full">Lịch sử giao dịch</Button>
            </Link>
            <Link href="/tai-khoan">
              <Button variant="outline" className="w-full">Thiết lập tài khoản</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
