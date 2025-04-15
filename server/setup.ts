import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db, pool } from './db';
import * as schema from '../shared/schema';
import { eq, sql } from 'drizzle-orm';
import { 
  users, 
  settings,
  numberStats,
  lotteryResults
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
      "isPresent": true
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

  // Sử dụng thông tin từ biến môi trường hoặc giá trị mặc định
  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const phone = process.env.ADMIN_PHONE || '0987654321';

  // Hash mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  // Tạo tài khoản admin mặc định
  await db.execute(sql`
    INSERT INTO users (username, email, password, "fullName", "phoneNumber", role, "isActive", balance)
    VALUES (${username}, ${email}, ${hashedPassword}, 'Quan tri vien', ${phone}, 'admin', true, 1000000)
  `);

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

  // Thiết lập mặc định từ biến môi trường hoặc giá trị mặc định
  const minBet = process.env.MIN_BET_AMOUNT ? parseInt(process.env.MIN_BET_AMOUNT) : 10000;
  const minDeposit = process.env.MIN_DEPOSIT_AMOUNT ? parseInt(process.env.MIN_DEPOSIT_AMOUNT) : 50000;
  const minWithdraw = process.env.MIN_WITHDRAW_AMOUNT ? parseInt(process.env.MIN_WITHDRAW_AMOUNT) : 100000;
  const siteName = process.env.SITE_NAME || 'Rong Bach Kim';

  // Thiết lập mặc định
  const defaultSettings = [
    {
      key: 'min_bet_amount',
      value: minBet,
      description: 'So tien cuoc toi thieu (VND)'
    },
    {
      key: 'min_deposit_amount', 
      value: minDeposit,
      description: 'So tien nap toi thieu (VND)'
    },
    {
      key: 'min_withdraw_amount',
      value: minWithdraw,
      description: 'So tien rut toi thieu (VND)'
    },
    {
      key: 'site_name',
      value: JSON.stringify(siteName),
      description: 'Ten trang web'
    },
    {
      key: 'betting_rates',
      value: JSON.stringify({
        lo: process.env.LO_RATE ? parseInt(process.env.LO_RATE) : 80,
        de: process.env.DE_RATE ? parseInt(process.env.DE_RATE) : 80,
        '3cang': process.env.CANG3_RATE ? parseInt(process.env.CANG3_RATE) : 700,
        'lo_xien_2': process.env.LO_XIEN_2_RATE ? parseInt(process.env.LO_XIEN_2_RATE) : 15,
        'lo_xien_3': process.env.LO_XIEN_3_RATE ? parseInt(process.env.LO_XIEN_3_RATE) : 50,
        'lo_xien_4': process.env.LO_XIEN_4_RATE ? parseInt(process.env.LO_XIEN_4_RATE) : 150
      }),
      description: 'Ty le tra thuong'
    },
    {
      key: 'bank_accounts',
      value: JSON.stringify([
        {
          bank_name: process.env.BANK1_NAME || 'BIDV',
          account_number: process.env.BANK1_NUMBER || '123456789',
          account_name: process.env.BANK1_OWNER || 'CONG TY RONG BACH KIM'
        },
        {
          bank_name: process.env.BANK2_NAME || 'Vietcombank',
          account_number: process.env.BANK2_NUMBER || '987654321',
          account_name: process.env.BANK2_OWNER || 'CONG TY RONG BACH KIM'
        }
      ]),
      description: 'Danh sach tai khoan ngan hang nhan nap tien'
    },
    {
      key: 'e_wallets',
      value: JSON.stringify([
        {
          name: process.env.EWALLET1_NAME || 'MoMo',
          phone: process.env.EWALLET1_PHONE || '0987654321',
          owner: process.env.EWALLET1_OWNER || 'RONG BACH KIM'
        },
        {
          name: process.env.EWALLET2_NAME || 'ZaloPay',
          phone: process.env.EWALLET2_PHONE || '0123456789',
          owner: process.env.EWALLET2_OWNER || 'RONG BACH KIM'
        }
      ]),
      description: 'Danh sach vi dien tu nhan nap tien'
    }
  ];

  // Thêm từng thiết lập
  for (const setting of defaultSettings) {
    await db.execute(sql`
      INSERT INTO settings (key, value, description)
      VALUES (${setting.key}, ${setting.value}, ${setting.description})
    `);
  }

  console.log('Đã tạo thiết lập hệ thống mặc định thành công.');
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
    await db.execute(sql`
      INSERT INTO lottery_results 
      (date, region, special, first, second, third, fourth, fifth, sixth, seventh)
      VALUES 
      (
        ${today}, 
        ${region}, 
        '12345', 
        '54321', 
        '{"11111", "22222"}', 
        '{"33333", "44444"}', 
        '{"55555", "66666"}', 
        '{"77777", "88888"}', 
        '{"99999", "00000"}', 
        '{"12121", "23232"}'
      )
    `);
  }

  console.log('Đã tạo dữ liệu xổ số mẫu thành công.');
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
        "isPresent" BOOLEAN NOT NULL DEFAULT true,
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

// Chạy thiết lập nếu được gọi trực tiếp
// Cách kiểm tra nếu file được chạy trực tiếp trong môi trường ESM
if (import.meta.url.endsWith(process.argv[1])) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}