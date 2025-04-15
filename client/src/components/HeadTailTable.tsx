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

export default function HeadTailTable({ title = "Lô tô miền Bắc", data = defaultData }: HeadTailTableProps) {
  return (
    <Card>
      <CardHeader className="bg-[#d9534f] text-white font-bold text-center py-2 px-4 rounded-t-lg">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 py-2 px-3 text-center font-medium text-red-600 w-1/12">Đầu</th>
                <th className="border border-gray-300 py-2 px-3 text-center font-medium text-red-600 w-5/12">Lô Tô</th>
                <th className="border border-gray-300 py-2 px-3 text-center font-medium text-red-600 w-1/12">Đuôi</th>
                <th className="border border-gray-300 py-2 px-3 text-center font-medium text-red-600 w-5/12">Lô Tô</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }, (_, i) => i.toString()).map(digit => (
                <tr key={digit} className={parseInt(digit) % 2 === 0 ? '' : 'bg-gray-50'}>
                  <td className="border border-gray-300 py-2 px-3 text-center font-medium">{digit}</td>
                  <td className="border border-gray-300 py-2 px-3 text-center">{data.head[digit]}</td>
                  <td className="border border-gray-300 py-2 px-3 text-center font-medium">{digit}</td>
                  <td className="border border-gray-300 py-2 px-3 text-center">{data.tail[digit]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}