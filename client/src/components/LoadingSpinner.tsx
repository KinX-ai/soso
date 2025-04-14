import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ 
  size = 24, 
  className = "", 
  text = "Đang tải..." 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <Loader2 className="animate-spin text-[#d9534f]" size={size} />
      {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <LoadingSpinner size={40} text="Đang tải trang..." />
    </div>
  );
}
