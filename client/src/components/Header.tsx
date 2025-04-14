import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth.tsx";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User, Settings, CreditCard, History } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.fullName) return "U";
    
    const nameParts = user.fullName.split(" ");
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-[#d9534f] font-bold text-2xl font-condensed">RỒNG BẠCH KIM</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink href="/" currentPath={location} text="Trang chủ" />
            <NavLink href="/du-doan" currentPath={location} text="Dự đoán" />
            <NavLink href="/thong-ke" currentPath={location} text="Thống kê" />
            <NavLink href="/soi-cau" currentPath={location} text="Soi cầu" />
            <NavLink href="/choi" currentPath={location} text="Đặt cược" highlight />
          </nav>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {!user ? (
              <>
                <Link href="/dang-nhap" className="hidden md:block">
                  <Button className="bg-[#d9534f] text-white hover:bg-[#c9302c]">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/dang-ky" className="hidden md:block">
                  <Button className="bg-[#0275d8] text-white hover:bg-[#025aa5]">
                    Đăng ký
                  </Button>
                </Link>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right mr-2">
                  <div className="text-sm font-medium">{user.fullName}</div>
                  <div className="text-xs text-gray-500">{new Intl.NumberFormat('vi-VN').format(user.balance)} đ</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarFallback className="bg-[#d9534f] text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/tai-khoan" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Tài khoản</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/nap-tien" className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Nạp tiền</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/rut-tien" className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Rút tiền</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/lich-su-giao-dich" className="cursor-pointer">
                        <History className="mr-2 h-4 w-4" />
                        <span>Lịch sử giao dịch</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Quản trị</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <MobileNavLink href="/" text="Trang chủ" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/du-doan" text="Dự đoán" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/thong-ke" text="Thống kê" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/soi-cau" text="Soi cầu" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink 
              href="/choi" 
              text="Đặt cược" 
              highlight
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {!user ? (
              <div className="mt-3 pt-3 border-t border-gray-200 flex space-x-3">
                <Link href="/dang-nhap" className="block px-3 py-2 bg-[#d9534f] text-white rounded flex-1 text-center"
                  onClick={() => setMobileMenuOpen(false)}>
                  Đăng nhập
                </Link>
                <Link href="/dang-ky" className="block px-3 py-2 bg-[#0275d8] text-white rounded flex-1 text-center"
                  onClick={() => setMobileMenuOpen(false)}>
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                <div className="flex justify-between items-center px-3 py-2">
                  <span className="font-medium">{user.fullName}</span>
                  <span className="text-sm">{new Intl.NumberFormat('vi-VN').format(user.balance)} đ</span>
                </div>
                <MobileNavLink href="/tai-khoan" text="Tài khoản" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/nap-tien" text="Nạp tiền" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/rut-tien" text="Rút tiền" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/lich-su-giao-dich" text="Lịch sử giao dịch" onClick={() => setMobileMenuOpen(false)} />
                
                {isAdmin && (
                  <MobileNavLink href="/admin" text="Quản trị hệ thống" onClick={() => setMobileMenuOpen(false)} />
                )}
                
                <div 
                  className="block px-3 py-2 text-red-600 rounded hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Đăng xuất
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

interface NavLinkProps {
  href: string;
  currentPath: string;
  text: string;
  highlight?: boolean;
}

function NavLink({ href, currentPath, text, highlight }: NavLinkProps) {
  const isActive = currentPath === href || (href !== "/" && currentPath.startsWith(href));
  
  return (
    <Link
      href={href}
      className={`
        ${highlight 
          ? "text-[#d9534f] font-medium" 
          : isActive 
            ? "text-[#d9534f] font-medium" 
            : "text-gray-800 hover:text-[#d9534f] font-medium"
        }
      `}
    >
      {text}
    </Link>
  );
}

interface MobileNavLinkProps {
  href: string;
  text: string;
  highlight?: boolean;
  onClick: () => void;
}

function MobileNavLink({ href, text, highlight, onClick }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        block px-3 py-2 rounded 
        ${highlight 
          ? "bg-[#d9534f] text-white" 
          : "text-gray-800 hover:bg-gray-100"
        }
      `}
    >
      {text}
    </Link>
  );
}
