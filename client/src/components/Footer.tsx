import { Link } from "wouter";
import { Facebook, Twitter, Youtube, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h4 className="font-condensed font-bold text-lg mb-3">RỒNG BẠCH KIM</h4>
            <p className="text-gray-400 text-sm">
              Trang web dự đoán xổ số, soi cầu lô đề và cung cấp thống kê xổ số miền Bắc hàng ngày.
            </p>
            <div className="mt-3 flex space-x-3">
              <a href="#" className="text-white hover:text-[#d9534f]">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-[#d9534f]">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-[#d9534f]">
                <Youtube size={20} />
              </a>
              <a href="#" className="text-white hover:text-[#d9534f]">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-condensed font-bold text-lg mb-3">Dự đoán & Thống kê</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li><Link href="/du-doan" className="hover:text-[#d9534f]">Dự đoán hàng ngày</Link></li>
              <li><Link href="/thong-ke" className="hover:text-[#d9534f]">Thống kê lô gan</Link></li>
              <li><Link href="/thong-ke" className="hover:text-[#d9534f]">Thống kê đầu đuôi</Link></li>
              <li><Link href="/soi-cau" className="hover:text-[#d9534f]">Soi cầu bạch thủ</Link></li>
              <li><Link href="/soi-cau" className="hover:text-[#d9534f]">Soi cầu lô 3 càng</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-condensed font-bold text-lg mb-3">Trò chơi</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li><Link href="/choi/lo" className="hover:text-[#d9534f]">Đánh Lô</Link></li>
              <li><Link href="/choi/de" className="hover:text-[#d9534f]">Đánh Đề</Link></li>
              <li><Link href="/choi/3cang" className="hover:text-[#d9534f]">3 Càng</Link></li>
              <li><Link href="/choi/lo-xien" className="hover:text-[#d9534f]">Lô Xiên</Link></li>
              <li><Link href="/huong-dan-choi" className="hover:text-[#d9534f]">Hướng dẫn chơi</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-condensed font-bold text-lg mb-3">Tài khoản</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li><Link href="/dang-ky" className="hover:text-[#d9534f]">Đăng ký tài khoản</Link></li>
              <li><Link href="/dang-nhap" className="hover:text-[#d9534f]">Đăng nhập</Link></li>
              <li><Link href="/nap-tien" className="hover:text-[#d9534f]">Nạp tiền</Link></li>
              <li><Link href="/rut-tien" className="hover:text-[#d9534f]">Rút tiền</Link></li>
              <li><Link href="/lich-su-giao-dich" className="hover:text-[#d9534f]">Lịch sử giao dịch</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 pt-6 text-sm text-gray-400 text-center">
          <p className="mb-2">© 2023 Rồng Bạch Kim. Tất cả quyền được bảo lưu.</p>
          <p>Trang web chỉ dành cho người dùng trên 18 tuổi. Chúng tôi không khuyến khích cờ bạc.</p>
        </div>
      </div>
    </footer>
  );
}
