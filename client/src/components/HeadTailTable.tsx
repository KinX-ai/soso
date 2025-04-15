import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HeadTailTableProps {
  title?: string;
  data?: HeadTailData;
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

export default function HeadTailTable({ title = "Thứ Hai - 14/04/2025", data = defaultData }: HeadTailTableProps) {
  return (
    <Card>
      <CardHeader className="bg-[#0275d8] text-white font-condensed font-bold text-lg py-2 px-4 rounded-t-lg">
        <CardTitle>BẢNG ĐẦU ĐUÔI - {title}</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
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
                      <td className="py-1 px-1 text-center">{data.head[digit]}</td>
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
                      <td className="py-1 px-1 text-center">{data.tail[digit]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}