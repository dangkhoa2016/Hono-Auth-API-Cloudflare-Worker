# test login
# invalid credentials
curl -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-user@example.com",
    "password": "password123"
  }'

# valid credentials
curl -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "eve@papant.local",
    "password": "password123"
  }'

# test with locale header
curl -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: vi" \
  -d '{
    "email": "eve@papant.local",
    "password": "password123"
  }'

curl -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: th-TH" \
  -d '{
    "email": "eve@papant.local",
    "password": "password123"
  }'

curl -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: vi-VN" \
  -d '{
    "email": "eve@papant.local",
    "password": "password123"
  }'

# Admin login
curl -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: vi-VN" \
  -d '{
    "email": "test-admin@example.com",
    "password": "password123"
  }'

# Super Admin login
curl -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: vi-VN" \
  -d '{
    "email": "test-superadmin@example.com",
    "password": "password123"
  }'

# test get profile
curl -X GET http://localhost:8788/api/user/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJmdWxsX25hbWUiOiJUZXN0IFJlZ3VsYXIgVXNlciIsImVtYWlsIjoidGVzdC11c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTM1MTkxMDksImV4cCI6MTc1MzUyMjcwOX0.9lj2hWy2wu_8tgsYT17XRf1iV0_VHlpxRUrKYrOBqn4" \
  -H "Accept-Language: de-DE"

curl -X GET http://localhost:8788/api/user/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJmdWxsX25hbWUiOiJUZXN0IFJlZ3VsYXIgVXNlciIsImVtYWlsIjoidGVzdC11c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTM1MTkxMDksImV4cCI6MTc1MzUyMjcwOX0.9lj2hWy2wu_8tgsYT17XRf1iV0_VHlpxRUrKYrOBqn4" \
  -H "Accept-Language: vi-VN"

curl -X GET http://localhost:8788/api \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJmdWxsX25hbWUiOiJUZXN0IFJlZ3VsYXIgVXNlciIsImVtYWlsIjoidGVzdC11c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTMwNTkyNDQsImV4cCI6MTc1MzA2Mjg0NH0.dLu17vURfzH7iDnJ31BUXUyZMhhciG_hvEHQRPyotn4" \
  -H "Accept-Language: vi-VN"

curl -X GET http://localhost:8788/route-metadata \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJmdWxsX25hbWUiOiJUZXN0IFJlZ3VsYXIgVXNlciIsImVtYWlsIjoidGVzdC11c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTMwNTkyNDQsImV4cCI6MTc1MzA2Mjg0NH0.dLu17vURfzH7iDnJ31BUXUyZMhhciG_hvEHQRPyotn4" \
  -H "Accept-Language: vi-VN"
