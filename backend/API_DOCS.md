# InfluenceX API Documentation

## 🔐 Admin Endpoints

### Create Admin
`POST /api/admin`  
**Auth:** ADMIN Token  
**Body:**
{ "email": "admin@example.com", "password": "SecurePass123!" }


### Change Password
`POST /api/admin/change-password`  
**Auth:** ADMIN Token  
**Body:**
{ "currentPassword": "oldPass", "newPassword": "newPass" }


### Delete Admin
`DELETE /api/admin/:id`  
**Auth:** ADMIN Token

## 💼 Investment Endpoints

### Update Investment
`PATCH /api/investments/:id`  
**Auth:** ADMIN Token  
**Body:**
{ "status": "Completed", "profit": 1500 }

**Allowed Statuses:** `Pending`, `Active`, `Completed`, `Failed`

## 🌐 Public Endpoints

### Create Investment
`POST /api/investments`  
**Body:**
{ "amount": 10000, "contactId": "...", "fundId": "..." }


### Get All Investments
`GET /api/investments`
