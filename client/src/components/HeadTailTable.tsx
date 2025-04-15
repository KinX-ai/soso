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
    <div className="flex flex-col text-sm">
      <div className="flex w-full">
        <div className="w-1/3 bg-[#cce5ff] p-1 font-bold text-center border border-gray-300">
          {title}
        </div>
        <div className="w-1/3 bg-[#ffdfba] p-1 font-bold text-center border border-gray-300">
          Đầu
        </div>
        <div className="w-1/3 bg-[#ffe6f2] p-1 font-bold text-center border border-gray-300">
          Đuôi
        </div>
      </div>
      
      <div className="flex w-full">
        <div className="w-1/3">
          <table className="w-full border-collapse text-xs md:text-sm">
            <tbody>
              <tr className="border border-gray-300">
                <td className="py-1 px-1 w-1/4 font-bold text-center text-blue-800 border-r border-gray-300">ĐB</td>
                <td className="py-1 px-1 text-center text-red-600 font-bold">46935</td>
              </tr>
              <tr className="border border-gray-300">
                <td className="py-1 px-1 font-bold text-center text-blue-800 border-r border-gray-300">Nhất</td>
                <td className="py-1 px-1 text-center">76071</td>
              </tr>
              <tr className="border border-gray-300">
                <td className="py-1 px-1 font-bold text-center text-blue-800 border-r border-gray-300" rowSpan={2}>Nhì</td>
                <td className="py-1 px-1 text-center">08866</td>
              </tr>
              <tr className="border border-gray-300">
                <td className="py-1 px-1 text-center">77399</td>
              </tr>
              <tr className="border border-gray-300">
                <td className="py-1 px-1 font-bold text-center text-blue-800 border-r border-gray-300" rowSpan={6}>Ba</td>
                <td className="py-1 px-1 text-center">28854</td>
              </tr>
              <tr className="border border-gray-300">
                <td className="py-1 px-1 text-center">16105</td>
              </tr>
              <tr className="border border-gray-300">
                <td className="py-1 px-1 text-center">81240</td>
              </tr>
              <tr className="border border-gray-300">
                <td className="py-1 px-1 text-center">42422</td>
              </tr>
              <tr className="border border-gray-300">
                <td className="py-1 px-1 text-center">16899</td>
              </tr>
              <tr className="border border-gray-300">
                <td className="py-1 px-1 text-center">38673</td>
              </tr>
              {/* Thêm các giải còn lại... */}
            </tbody>
          </table>
        </div>
        
        {/* Bảng Đầu */}
        <div className="w-1/3">
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
        <div className="w-1/3">
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
  );
}