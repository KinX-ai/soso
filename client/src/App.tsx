import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import BettingPage from "@/pages/BettingPage";
import LotteryStatsPage from "@/pages/LotteryStatsPage";
import PredictionsPage from "@/pages/PredictionsPage";
import UserProfilePage from "@/pages/UserProfilePage";
import DepositPage from "@/pages/DepositPage";
import WithdrawPage from "@/pages/WithdrawPage";
import TransactionHistoryPage from "@/pages/TransactionHistoryPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import AdminTransactionsPage from "@/pages/AdminTransactionsPage";
import AdminSettingsPage from "@/pages/AdminSettingsPage";
import AdminLotteryPage from "./pages/AdminLotteryPage";
import { AuthProvider } from "./lib/auth.tsx";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/dang-nhap" component={LoginPage} />
      <Route path="/dang-ky" component={RegisterPage} />
      <Route path="/choi/:type?" component={BettingPage} />
      <Route path="/thong-ke" component={LotteryStatsPage} />
      <Route path="/du-doan" component={PredictionsPage} />
      <Route path="/tai-khoan" component={UserProfilePage} />
      <Route path="/nap-tien" component={DepositPage} />
      <Route path="/rut-tien" component={WithdrawPage} />
      <Route path="/lich-su-giao-dich" component={TransactionHistoryPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/transactions" component={AdminTransactionsPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route path="/admin/lottery" component={AdminLotteryPage} />
      <Route path="/soi-cau" component={LotteryStatsPage} /> {/* Added based on user message */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;