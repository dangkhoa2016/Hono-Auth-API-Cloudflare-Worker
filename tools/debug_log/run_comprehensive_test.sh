#!/bin/bash

# Comprehensive Debug Test Runner / Chạy Test Debug Tổng hợp
# Runs the consolidated debug test suite / Chạy bộ test debug đã tổng hợp

echo "🧪 Starting Comprehensive Debug System Test... / Bắt đầu Test Hệ thống Debug Tổng hợp..."
echo "================================================"

# Change to the project directory / Chuyển đến thư mục dự án
cd "$(dirname "$0")/../.."

# Set the environment for testing / Thiết lập môi trường test
export NODE_ENV=test

# Run the comprehensive debug test / Chạy test debug tổng hợp
node tools/debug_log/comprehensive_debug_test.js

echo ""
echo "================================================"
echo "🏁 Debug test suite completed! / Bộ test debug hoàn thành!"
echo ""

# Information about the consolidated test suite / Thông tin về bộ test tổng hợp
echo "📝 This comprehensive test suite validates the debug system functionality."
echo "📝 Bộ test tổng hợp này xác thực chức năng của hệ thống debug."
echo "   It tests colors, patterns, performance, environment support, and more."
echo "   Nó test màu sắc, patterns, hiệu suất, hỗ trợ môi trường, và nhiều hơn nữa."
echo ""
echo "To run again / Để chạy lại:"
echo "  npm run test:debug"
echo "  bash tools/debug_log/run_comprehensive_test.sh"
echo ""
echo "📖 Documentation / Tài liệu:"
echo "  English: tools/debug_log/README.md"
echo "  Tiếng Việt: tools/debug_log/README_vi.md"
