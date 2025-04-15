import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface HeadTailTableProps {
  title?: string;
  data?: HeadTailData;
  region?: string;
}

interface HeadTailData {
  head: { [key: string]: string };
  tail: { [key: string]: string };
}

const defaultData: HeadTailData = {
  head: {
    "0": "2,4,7",
    "1": "7",
    "2": "1,1,8",
    "3": "7,7,9",
    "4": "2,5",
    "5": "0,0,1,4,5",
    "6": "1,2,2,3,6",
    "7": "2,5,8",
    "8": "-",
    "9": "0,5"
  },
  tail: {
    "0": "5,5,9",
    "1": "2,2,5,6",
    "2": "0,4,6,6,7",
    "3": "6",
    "4": "0,5",
    "5": "4,5,7,9",
    "6": "6",
    "7": "0,1,3,3",
    "8": "2,7",
    "9": "3"
  }
};

export default function HeadTailTable({ 
  title = format(new Date(), "EEEE - dd/MM/yyyy", { locale: vi }),
  data = defaultData
}: HeadTailTableProps) {
  const [currentRegion, setCurrentRegion] = useState("mienbac");
  const [headTailData, setHeadTailData] = useState<HeadTailData>(defaultData);

  // Fetch lottery result for the selected region
  const { data: lotteryResult, isLoading } = useQuery({
    queryKey: [`/api/lottery/latest/${currentRegion}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Generate head/tail data from lottery result
  useEffect(() => {
    if (!lotteryResult) return;
    
    const headData: {[key: string]: string[]} = {"0":[],"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[],"8":[],"9":[]};
    const tailData: {[key: string]: string[]} = {"0":[],"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[],"8":[],"9":[]};
    
    // Function to add number to head/tail
    const processNumber = (num: string) => {
      if (num && num.length >= 2) {
        const head = num.charAt(0);
        const tail = num.charAt(num.length - 1);
        
        if (headData[head]) headData[head].push(num);
        if (tailData[tail]) tailData[tail].push(num);
      }
    };
    
    // Process all numbers from the lottery result
    if (lotteryResult.special) processNumber(lotteryResult.special);
    if (lotteryResult.first) processNumber(lotteryResult.first);
    
    const processArray = (arr: string[]) => {
      if (Array.isArray(arr)) {
        arr.forEach(num => processNumber(num));
      }
    };
    
    processArray(lotteryResult.second || []);
    processArray(lotteryResult.third || []);
    processArray(lotteryResult.fourth || []);
    processArray(lotteryResult.fifth || []);
    processArray(lotteryResult.sixth || []);
    processArray(lotteryResult.seventh || []);
    
    // Convert arrays to string
    const headResult: {[key: string]: string} = {};
    const tailResult: {[key: string]: string} = {};
    
    Object.keys(headData).forEach(key => {
      headResult[key] = headData[key].length > 0 ? headData[key].join(", ") : "-";
    });
    
    Object.keys(tailData).forEach(key => {
      tailResult[key] = tailData[key].length > 0 ? tailData[key].join(", ") : "-";
    });
    
    setHeadTailData({
      head: headResult,
      tail: tailResult
    });
  }, [lotteryResult]);

  // Handle region change
  const handleRegionChange = (value: string) => {
    setCurrentRegion(value);
  };
  return (
    <Card>
      <CardHeader className="bg-[#0275d8] text-white font-condensed font-bold text-lg py-2 px-4 rounded-t-lg">
        <CardTitle>BẢNG ĐẦU ĐUÔI - {title}</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <Tabs 
          defaultValue="mienbac" 
          value={currentRegion}
          onValueChange={handleRegionChange}
          className="mb-2"
        >
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="mienbac" className="text-xs">Miền Bắc</TabsTrigger>
            <TabsTrigger value="mientrung" className="text-xs">Miền Trung</TabsTrigger>
            <TabsTrigger value="miennam" className="text-xs">Miền Nam</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col text-sm">
          <div className="flex w-full">
            <div className="w-1/2 bg-[#ffdfba] p-1 font-bold text-center border border-gray-300">
              Đầu
            </div>
            <div className="w-1/2 bg-[#ffe6f2] p-1 font-bold text-center border border-gray-300">
              Đuôi
            </div>
          </div>
          
          <div className="flex w-full">
            {/* Bảng Đầu */}
            <div className="w-1/2">
              <table className="w-full border-collapse text-xs md:text-sm">
                <tbody>
                  {Array.from({ length: 10 }, (_, i) => i.toString()).map(digit => (
                    <tr key={`head-${digit}`} className="border border-gray-300">
                      <td className="py-1 px-1 w-1/5 font-bold text-center border-r border-gray-300">{digit}</td>
                      <td className="py-1 px-1 text-center">{headTailData.head[digit] || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Bảng Đuôi */}
            <div className="w-1/2">
              <table className="w-full border-collapse text-xs md:text-sm">
                <tbody>
                  {Array.from({ length: 10 }, (_, i) => i.toString()).map(digit => (
                    <tr key={`tail-${digit}`} className="border border-gray-300">
                      <td className="py-1 px-1 w-1/5 font-bold text-center border-r border-gray-300">{digit}</td>
                      <td className="py-1 px-1 text-center">{headTailData.tail[digit] || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {isLoading && (
            <div className="text-center py-2 text-gray-500 text-xs">
              Đang tải dữ liệu...
            </div>
          )}
          
          <div className="text-center py-1 text-gray-500 text-xs">
            Dữ liệu từ kết quả xổ số {currentRegion === "mienbac" ? "Miền Bắc" : currentRegion === "mientrung" ? "Miền Trung" : "Miền Nam"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}