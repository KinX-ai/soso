import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export default function Layout({ children, hideFooter = false }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      {!hideFooter && <Footer />}
      <MobileNavigation />
    </div>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 sticky top-20">
              <h3 className="font-bold text-lg mb-4 border-b pb-2">Quản trị hệ thống</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/admin" className="block p-2 hover:bg-gray-100 rounded">Dashboard</a>
                </li>
                <li>
                  <a href="/admin/users" className="block p-2 hover:bg-gray-100 rounded">Quản lý người dùng</a>
                </li>
                <li>
                  <a href="/admin/transactions" className="block p-2 hover:bg-gray-100 rounded">Quản lý giao dịch</a>
                </li>
                <li>
                  <a href="/admin/lottery" className="block p-2 hover:bg-gray-100 rounded">Quản lý kết quả xổ số</a>
                </li>
                <li>
                  <a href="/admin/settings" className="block p-2 hover:bg-gray-100 rounded">Cài đặt hệ thống</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="lg:col-span-4">
            {children}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
