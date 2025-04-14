#!/bin/bash

# Script thiết lập và khởi tạo cơ sở dữ liệu
echo "Đang thiết lập cơ sở dữ liệu..."
# Tạo file tạm thời để chạy script
cat > setup-temp.js << 'EOL'
import { setupDatabaseAndClose } from './server/setup.ts';

setupDatabaseAndClose()
  .then(() => {
    console.log('Thiết lập hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Lỗi:', error);
    process.exit(1);
  });
EOL

# Chạy file tạm thời
npx tsx setup-temp.js

if [ $? -eq 0 ]; then
    echo "Thiết lập cơ sở dữ liệu hoàn tất!"
else
    echo "Lỗi khi thiết lập cơ sở dữ liệu."
    exit 1
fi