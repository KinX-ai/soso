#!/bin/bash

# Script thiết lập và khởi tạo cơ sở dữ liệu
echo "Đang thiết lập cơ sở dữ liệu..."
npx tsx server/setup.ts

if [ $? -eq 0 ]; then
    echo "Thiết lập cơ sở dữ liệu hoàn tất!"
else
    echo "Lỗi khi thiết lập cơ sở dữ liệu."
    exit 1
fi