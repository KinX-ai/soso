import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db, pool } from './db';
import * as schema from '../shared/schema';
import { eq, sql } from 'drizzle-orm';
import { 
  users, 
  settings,
  numberStats
} from '../shared/schema';
import bcrypt from 'bcryptjs';

/**
 * Khởi tạo dữ liệu mẫu cho thống kê số
 */
async function setupNumberStats() {
  console.log('Đang kiểm tra dữ liệu thống kê số...');
  
  const today = new Date();
  
  // Kiểm tra xem đã có dữ liệu thống kê số chưa
  const existingStats = await db.select({
    count: sql`count(*)`
  }).from(numberStats);
  
  if (Number(existingStats[0].count) > 0) {
    console.log('Dữ liệu thống kê số đã tồn tại.');
    return;
  }
  
  console.log('Đang tạo dữ liệu thống kê số mẫu...');
  
  // Tạo dữ liệu thống kê số thường xuất hiện
  const frequentNumbers = [
    { number: '27', occurrences: 5 },
    { number: '53', occurrences: 3 },
    { number: '68', occurrences: 4 },
    { number: '44', occurrences: 2 },
    { number: '18', occurrences: 1 },
    { number: '72', occurrences: 6 },
    { number: '90', occurrences: 3 },
    { number: '33', occurrences: 4 },
    { number: '66', occurrences: 5 },
    { number: '02', occurrences: 2 },
  ];
  
  // Thêm mỗi số với dữ liệu thống kê
  for (const numData of frequentNumbers) {
    await db.insert(numberStats).values({
      number: numData.number,
      date: today,
      region: 'mienbac',
      occurrences: numData.occurrences,
      isPresent: true
    });
  }
  
  // Tạo dữ liệu lô gan
  const absentNumbers = [
    { number: '00', daysAgo: 100 },
    { number: '01', daysAgo: 58 },
    { number: '07', daysAgo: 45 },
    { number: '11', daysAgo: 35 },
    { number: '25', daysAgo: 25 },
    { number: '37', daysAgo: 17 },
    { number: '49', daysAgo: 13 },
    { number: '55', daysAgo: 9 },
    { number: '78', daysAgo: 6 },
    { number: '99', daysAgo: 4 },
  ];
  
  // Thêm dữ liệu lô gan với ngày xuất hiện cuối cùng
  for (const numData of absentNumbers) {
    const lastDate = new Date();
    lastDate.setDate(today.getDate() - numData.daysAgo);
    
    await db.insert(numberStats).values({
      number: numData.number,
      date: lastDate,
      region: 'mienbac',
      occurrences: 0,
      isPresent: false
    });
  }
  
  console.log('Đã tạo dữ liệu thống kê số mẫu thành công.');
}

/**
 * Tạo tài khoản admin mặc định nếu chưa tồn tại
 */
async function setupAdminAccount() {
  console.log('Đang kiểm tra tài khoản admin...');
  
  // Kiểm tra xem đã có tài khoản admin chưa
  const existingAdmin = await db.select()
    .from(users)
    .where(eq(users.role, 'admin'))
    .limit(1);
  
  if (existingAdmin.length > 0) {
    console.log('Tài khoản admin đã tồn tại.');
    return;
  }
  
  console.log('Đang tạo tài khoản admin mặc định...');
  
  // Mật khẩu mặc định: admin123
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Tạo tài khoản admin mặc định
  await db.insert(users).values({
    username: 'admin',
    email: 'admin@example.com',
    password: hashedPassword,
    fullName: 'Quản trị viên',
    phoneNumber: '0987654321',
    role: 'admin',
    isActive: true,
    balance: 1000000 // Số dư mặc định: 1 triệu VND
  });
  
  console.log('Đã tạo tài khoản admin mặc định thành công.');
  console.log('Tên đăng nhập: admin');
  console.log('Mật khẩu: admin123');
}

/**
 * Tạo các thiết lập mặc định cho hệ thống
 */
async function setupDefaultSettings() {
  console.log('Đang kiểm tra thiết lập hệ thống...');
  
  // Kiểm tra xem đã có thiết lập nào chưa
  const existingSettings = await db.select({
    count: sql`count(*)`
  }).from(settings);
  
  if (Number(existingSettings[0].count) > 0) {
    console.log('Thiết lập hệ thống đã tồn tại.');
    return;
  }
  
  console.log('Đang tạo thiết lập hệ thống mặc định...');
  
  // Thiết lập mặc định
  const defaultSettings = [
    {
      key: 'min_bet_amount',
      value: 10000,
      description: 'Số tiền cược tối thiểu (VND)'
    },
    {
      key: 'min_deposit_amount',
      value: 50000,
      description: 'Số tiền nạp tối thiểu (VND)'
    },
    {
      key: 'min_withdraw_amount',
      value: 100000,
      description: 'Số tiền rút tối thiểu (VND)'
    },
    {
      key: 'site_name',
      value: 'Rồng Bạch Kim',
      description: 'Tên trang web'
    },
    {
      key: 'betting_rates',
      value: JSON.stringify({
        lo: 80,     // Lô: 1 ăn 80
        de: 80,     // Đề: 1 ăn 80
        '3cang': 700,  // 3 càng: 1 ăn 700
        'lo_xien_2': 15,  // Lô xiên 2: 1 ăn 15
        'lo_xien_3': 50,  // Lô xiên 3: 1 ăn 50
        'lo_xien_4': 150  // Lô xiên 4: 1 ăn 150
      }),
      description: 'Tỷ lệ trả thưởng'
    },
    {
      key: 'bank_accounts',
      value: JSON.stringify([
        {
          bank_name: 'BIDV',
          account_number: '123456789',
          account_name: 'CÔNG TY RỒNG BẠCH KIM'
        },
        {
          bank_name: 'Vietcombank',
          account_number: '987654321',
          account_name: 'CÔNG TY RỒNG BẠCH KIM'
        }
      ]),
      description: 'Danh sách tài khoản ngân hàng nhận nạp tiền'
    },
    {
      key: 'e_wallets',
      value: JSON.stringify([
        {
          name: 'MoMo',
          phone: '0987654321',
          owner: 'RỒNG BẠCH KIM'
        },
        {
          name: 'ZaloPay',
          phone: '0123456789',
          owner: 'RỒNG BẠCH KIM'
        }
      ]),
      description: 'Danh sách ví điện tử nhận nạp tiền'
    }
  ];
  
  // Thêm từng thiết lập
  for (const setting of defaultSettings) {
    await db.insert(settings).values({
      key: setting.key,
      value: setting.value,
      description: setting.description
    });
  }
  
  console.log('Đã tạo thiết lập hệ thống mặc định thành công.');
}

/**
 * Hàm thiết lập và khởi tạo cơ sở dữ liệu
 */
export async function setupDatabase() {
  console.log('Bắt đầu thiết lập cơ sở dữ liệu...');
  
  try {
    // Đẩy các thay đổi schema vào cơ sở dữ liệu
    console.log('Đang cập nhật cấu trúc cơ sở dữ liệu...');
    
    // Tạo các bảng nếu chưa tồn tại
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        "fullName" TEXT NOT NULL,
        "phoneNumber" TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        balance DOUBLE PRECISION NOT NULL DEFAULT 0,
        "bankAccount" TEXT,
        "bankName" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        "userId" INTEGER NOT NULL REFERENCES users(id),
        amount DOUBLE PRECISION NOT NULL,
        method TEXT NOT NULL,
        "bankAccount" TEXT,
        "bankName" TEXT,
        reference TEXT,
        notes TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS lottery_results (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP NOT NULL,
        region TEXT NOT NULL,
        special TEXT NOT NULL,
        first TEXT NOT NULL,
        second TEXT[] NOT NULL,
        third TEXT[] NOT NULL,
        fourth TEXT[] NOT NULL,
        fifth TEXT[] NOT NULL,
        sixth TEXT[] NOT NULL,
        seventh TEXT[] NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(date, region)
      );
      
      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        "userId" INTEGER NOT NULL REFERENCES users(id),
        amount DOUBLE PRECISION NOT NULL,
        numbers JSONB NOT NULL,
        multiplier DOUBLE PRECISION NOT NULL DEFAULT 1,
        payout DOUBLE PRECISION,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "settledAt" TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        description TEXT,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS number_stats (
        number TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        region TEXT NOT NULL,
        occurrences INTEGER NOT NULL DEFAULT 1,
        is_present BOOLEAN NOT NULL DEFAULT true,
        PRIMARY KEY (number, date, region)
      );
    `);
    
    console.log('Cấu trúc cơ sở dữ liệu đã được cập nhật.');
    
    // Thiết lập dữ liệu ban đầu
    await setupDefaultSettings();
    await setupAdminAccount();
    await setupNumberStats();
    await setupSampleLotteryResults();
    
    console.log('Thiết lập cơ sở dữ liệu hoàn tất.');
  } catch (error) {
    console.error('Lỗi khi thiết lập cơ sở dữ liệu:', error);
    throw error;
  }
}

async function setupSampleLotteryResults() {
  console.log('Đang kiểm tra dữ liệu xổ số mẫu...');
  
  const existingResults = await db.select().from(lotteryResults).limit(1);
  
  if (existingResults.length > 0) {
    console.log('Dữ liệu xổ số mẫu đã tồn tại.');
    return;
  }

  console.log('Đang tạo dữ liệu xổ số mẫu...');
  
  const today = new Date();
  const regions = ['mienbac', 'mientrung', 'miennam'];

  for (const region of regions) {
    await db.insert(lotteryResults).values({
      date: today,
      region,
      special: '12345',
      first: '54321',
      second: ['11111', '22222'],
      third: ['33333', '44444'],
      fourth: ['55555', '66666'],
      fifth: ['77777', '88888'],
      sixth: ['99999', '00000'],
      seventh: ['12121', '23232']
    });
  }

  console.log('Đã tạo dữ liệu xổ số mẫu thành công.');
}

async function setupDatabase() {
  console.log('Bắt đầu thiết lập cơ sở dữ liệu...');
  
  try {
    // Đẩy các thay đổi schema vào cơ sở dữ liệu
    console.log('Đang cập nhật cấu trúc cơ sở dữ liệu...');
    
    // Tạo các bảng nếu chưa tồn tại
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        "fullName" TEXT NOT NULL,
        "phoneNumber" TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        balance DOUBLE PRECISION NOT NULL DEFAULT 0,
        "bankAccount" TEXT,
        "bankName" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        "userId" INTEGER NOT NULL REFERENCES users(id),
        amount DOUBLE PRECISION NOT NULL,
        method TEXT NOT NULL,
        "bankAccount" TEXT,
        "bankName" TEXT,
        reference TEXT,
        notes TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS lottery_results (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP NOT NULL,
        region TEXT NOT NULL,
        special TEXT NOT NULL,
        first TEXT NOT NULL,
        second TEXT[] NOT NULL,
        third TEXT[] NOT NULL,
        fourth TEXT[] NOT NULL,
        fifth TEXT[] NOT NULL,
        sixth TEXT[] NOT NULL,
        seventh TEXT[] NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(date, region)
      );
      
      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        "userId" INTEGER NOT NULL REFERENCES users(id),
        amount DOUBLE PRECISION NOT NULL,
        numbers JSONB NOT NULL,
        multiplier DOUBLE PRECISION NOT NULL DEFAULT 1,
        payout DOUBLE PRECISION,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "settledAt" TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        description TEXT,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS number_stats (
        number TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        region TEXT NOT NULL,
        occurrences INTEGER NOT NULL DEFAULT 1,
        is_present BOOLEAN NOT NULL DEFAULT true,
        PRIMARY KEY (number, date, region)
      );
    `);
    
    console.log('Cấu trúc cơ sở dữ liệu đã được cập nhật.');
    
    // Thiết lập dữ liệu ban đầu
    await setupDefaultSettings();
    await setupAdminAccount();
    await setupNumberStats();
    await setupSampleLotteryResults();
    
    console.log('Thiết lập cơ sở dữ liệu hoàn tất.');
  } catch (error) {
    console.error('Lỗi khi thiết lập cơ sở dữ liệu:', error);
    throw error;
  }
  // Không đóng kết nối pool ở đây vì server vẫn cần sử dụng nó
}

// Hàm này dùng khi chạy script độc lập, sẽ đóng kết nối sau khi hoàn tất
export async function setupDatabaseAndClose() {
  try {
    await setupDatabase();
    console.log('Hoàn tất thiết lập cơ sở dữ liệu.');
    // Đóng kết nối sau khi hoàn tất
    await pool.end();
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
}

// Chạy thiết lập nếu được gọi trực tiếp
// Cách kiểm tra nếu file được chạy trực tiếp trong môi trường ESM
if (import.meta.url.endsWith(process.argv[1])) {
  setupDatabaseAndClose()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}