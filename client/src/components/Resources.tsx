import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  TrendingUp, 
  History, 
  Wallet, 
  Headphones 
} from "lucide-react";

export default function Resources() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Tài nguyên</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/huong-dan-choi">
              <a className="flex items-center hover:text-[#d9534f]">
                <BookOpen className="h-4 w-4 mr-2 text-[#d9534f]" /> Hướng dẫn chơi
              </a>
            </Link>
          </li>
          <li>
            <Link href="/cach-soi-cau">
              <a className="flex items-center hover:text-[#d9534f]">
                <TrendingUp className="h-4 w-4 mr-2 text-[#d9534f]" /> Cách soi cầu hiệu quả
              </a>
            </Link>
          </li>
          <li>
            <Link href="/lich-su-kqxs">
              <a className="flex items-center hover:text-[#d9534f]">
                <History className="h-4 w-4 mr-2 text-[#d9534f]" /> Lịch sử kết quả xổ số
              </a>
            </Link>
          </li>
          <li>
            <Link href="/nap-tien">
              <a className="flex items-center hover:text-[#d9534f]">
                <Wallet className="h-4 w-4 mr-2 text-[#d9534f]" /> Hướng dẫn nạp/rút tiền
              </a>
            </Link>
          </li>
          <li>
            <Link href="/lien-he">
              <a className="flex items-center hover:text-[#d9534f]">
                <Headphones className="h-4 w-4 mr-2 text-[#d9534f]" /> Liên hệ hỗ trợ
              </a>
            </Link>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
