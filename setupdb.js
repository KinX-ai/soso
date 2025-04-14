#!/usr/bin/env node

/**
 * File này dùng để thiết lập và khởi tạo cơ sở dữ liệu
 * Sử dụng: node setupdb.js
 */

import { exec } from 'child_process';

console.log('Đang thiết lập cơ sở dữ liệu...');

// Chạy file setup.ts bằng tsx
exec('npx tsx server/setup.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Lỗi khi thiết lập cơ sở dữ liệu: ${error.message}`);
    console.error(stderr);
    process.exit(1);
  }
  
  console.log(stdout);
  console.log('Thiết lập cơ sở dữ liệu hoàn tất!');
});