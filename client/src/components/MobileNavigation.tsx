import { Link, useLocation } from "wouter";
import { Home, TrendingUp, Dice5, BarChart2, User } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();

  // Check if current location matches the nav item
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-5 text-center">
        <NavItem 
          href="/" 
          icon={<Home className="h-5 w-5 mx-auto" />} 
          label="Trang chủ" 
          active={isActive("/")}
        />
        <NavItem 
          href="/du-doan" 
          icon={<TrendingUp className="h-5 w-5 mx-auto" />} 
          label="Dự đoán" 
          active={isActive("/du-doan")}
        />
        <NavItem 
          href="/choi" 
          icon={<Dice5 className="h-5 w-5 mx-auto" />} 
          label="Đặt cược" 
          active={isActive("/choi")}
        />
        <NavItem 
          href="/thong-ke" 
          icon={<BarChart2 className="h-5 w-5 mx-auto" />} 
          label="Thống kê" 
          active={isActive("/thong-ke")}
        />
        <NavItem 
          href="/tai-khoan" 
          icon={<User className="h-5 w-5 mx-auto" />} 
          label="Tài khoản" 
          active={isActive("/tai-khoan")}
        />
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link href={href} className={`p-2 ${active ? "text-[#d9534f]" : "text-gray-600"}`}>
      {icon}
      <div className="text-xs">{label}</div>
    </Link>
  );
}
