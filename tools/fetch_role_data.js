/**
 * fetch_role_data.js
 * 
 * ENGLISH:
 * This script automates the process of fetching API metadata and route information for different user roles.
 * It performs the following steps for each role (regular, admin, super_admin):
 * 1. Authenticates (logs in) to get a valid JWT token.
 * 2. Fetches the `/route-metadata` endpoint (Admin/Super Admin only).
 * 3. Fetches the `/api` endpoint to get available API info for that role.
 * 4. Saves the responses as JSON files in `tools/data-by-roles/` for analysis or frontend generation.
 * 
 * Usage: node tools/fetch_role_data.js
 * Note: Ensure the worker server is running at http://localhost:8788 before running this script.
 * 
 * VIETNAMESE:
 * Script này tự động hóa quá trình lấy dữ liệu metadata của API và thông tin route cho các vai trò người dùng khác nhau.
 * Nó thực hiện các bước sau cho mỗi vai trò (regular, admin, super_admin):
 * 1. Xác thực (đăng nhập) để lấy JWT token hợp lệ.
 * 2. Gọi endpoint `/route-metadata` (chỉ dành cho Admin/Super Admin).
 * 3. Gọi endpoint `/api` để lấy thông tin API có sẵn cho vai trò đó.
 * 4. Lưu phản hồi dưới dạng file JSON trong `tools/data-by-roles/` để phân tích hoặc tạo frontend.
 * 
 * Cách dùng: node tools/fetch_role_data.js
 * Lưu ý: Đảm bảo server worker đang chạy tại http://localhost:8788 trước khi chạy script này.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEST_USERS } from '../tests/config/testConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:8788';
const OUTPUT_DIR = path.join(__dirname, 'data-by-roles');

async function login(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        // Try fallback to /login if /api/auth/login fails (just in case)
        const response2 = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (response2.ok) {
            const data = await response2.json();
            return data.data?.token || data.token;
        }

        console.error(`Login failed for ${email}: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error('Response:', text);
        return null;
    }

    const data = await response.json();
    return data.data?.access_token || data.access_token || data.data?.token || data.token;
  } catch (error) {
    console.error(`Login error for ${email}:`, error);
    return null;
  }
}

async function fetchData(url, token) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    return { status: 500, error: error.message };
  }
}

async function saveToFile(filename, data) {
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`Saved ${filename}`);
}

async function processUser(roleName) {
  const user = TEST_USERS[roleName];
  if (roleName == 'regular')
    roleName = 'regular-user';
  else if (roleName == 'super_admin')
    roleName = 'super-admin';
  console.log(`Processing ${roleName}...`);

  // 1. Login
  const token = await login(user.email, user.password);
  if (!token) {
    console.error(`Skipping ${roleName} due to login failure`);
    return;
  }
  console.log(`Got token for ${roleName}`);

  // 2. Fetch /route-metadata
  // Note: Regular user might fail this, which is expected
  const routeMetaUrl = `${BASE_URL}/route-metadata`;
  const routeMetaData = await fetchData(routeMetaUrl, token);
  
  if (routeMetaData.status === 403) {
      console.log(`Info: ${roleName} received 403 on /route-metadata (Expected for regular users)`);
  } else if (routeMetaData.status !== 200) {
      console.warn(`Warning: ${roleName} received ${routeMetaData.status} on /route-metadata`);
  }

  // Create file even if error (to capture the error response)
  await saveToFile(`${roleName}+route-metadata.json`, routeMetaData.data);

  // 3. Fetch /api
  const apiUrl = `${BASE_URL}/api`;
  const apiData = await fetchData(apiUrl, token);
  
  if (apiData.status !== 200) {
      console.warn(`Warning: ${roleName} received ${apiData.status} on /api`);
  }
  
  await saveToFile(`${roleName}+api.json`, apiData.data);
}

async function main() {
  // Ensure output directory exists (although tool likely created it)
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  await processUser('regular');
  await processUser('admin');
  await processUser('super_admin');
}

main();
