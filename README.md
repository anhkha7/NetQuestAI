# NetQuest AI 🌐🤖

> **Hệ thống học mạng máy tính và thi đấu CTF (Capture The Flag) tích hợp trí tuệ nhân tạo.**
> Luyện tập cấu hình mạng thực chiến, nhận phản hồi từ AI, và leo bảng xếp hạng toàn cầu.

---

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tech Stack](#tech-stack)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Database — Lưu ở đâu?](#database--lưu-ở-đâu)
- [Cài đặt & Chạy](#cài-đặt--chạy)
- [API Endpoints](#api-endpoints)
- [Biến môi trường & Cấu hình](#biến-môi-trường--cấu-hình)
- [Roadmap](#roadmap)

---

## Giới thiệu

**NetQuest AI** là nền tảng học và thi đấu bảo mật mạng kết hợp AI. Người dùng giải các thử thách CTF về cấu hình router, firewall, VLAN, BGP, IDS/IPS… và nhận phản hồi thông minh từ mô hình AI sau mỗi lần nộp bài.

**Tính năng chính:**
- 🏆 Hệ thống thử thách CTF phân cấp độ (Easy / Medium / Hard)
- 🤖 Phản hồi AI sau mỗi lần nộp flag (sẽ tích hợp giai đoạn 2)
- 🔐 Xác thực JWT + mã hóa mật khẩu bcrypt
- 📊 Bảng điểm & lịch sử nộp bài cá nhân
- 🚩 Flag được lưu dưới dạng SHA-256 hash — không bao giờ lộ plaintext

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| **Backend** | ASP.NET Core 10 Web API, Entity Framework Core 9 |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 |
| **Database** | SQLite *(dev)* · SQL Server *(production)* |
| **Auth** | JWT Bearer (HS256), BCrypt.Net |
| **State Management** | Zustand + localStorage |
| **HTTP Client** | Axios |
| **Routing** | React Router v7 |
| **API Docs** | Swagger / OpenAPI (Swashbuckle) |

---

## Cấu trúc dự án

```
NetQuestAI/
├── global.json                          # Ghim .NET SDK 10.0.201
├── .gitignore
├── README.md
│
├── backend/
│   ├── NetQuestAI.sln
│   └── src/
│       └── NetQuestAI.Api/
│           ├── NetQuestAI.Api.csproj
│           ├── Program.cs               # DI, JWT, CORS, Swagger, auto-migrate
│           ├── appsettings.json
│           ├── appsettings.Development.json
│           ├── Controllers/
│           │   ├── AuthController.cs        # POST /api/auth/register|login
│           │   ├── ChallengesController.cs  # GET|POST /api/challenges
│           │   └── SubmissionsController.cs # POST /api/submissions
│           ├── Data/
│           │   ├── AppDbContext.cs
│           │   └── Configurations/
│           │       ├── UserConfiguration.cs
│           │       ├── ChallengeConfiguration.cs
│           │       └── SubmissionConfiguration.cs
│           ├── Models/
│           │   ├── User.cs          # Id, Username, Email, PasswordHash, Role, TotalPoints
│           │   ├── Challenge.cs     # Id, Title, Description, Difficulty, Points, FlagHash
│           │   └── Submission.cs    # Id, UserId, ChallengeId, Score, AIFeedback, IsPassed
│           ├── DTOs/
│           │   ├── Auth/            # RegisterRequest, LoginRequest, AuthResponse
│           │   ├── Challenge/       # ChallengeDto, ChallengeSummaryDto
│           │   └── Submission/      # SubmitFlagRequest, SubmissionDto
│           ├── Services/
│           │   ├── TokenService.cs  # Tạo JWT
│           │   └── AuthService.cs   # Đăng ký / đăng nhập
│           └── Migrations/          # EF Core migrations (auto-generated)
│
└── frontend/
    ├── index.html
    ├── vite.config.ts
    ├── package.json
    └── src/
        ├── main.tsx
        ├── App.tsx                  # Router + routes
        ├── index.css                # Design system (cyberpunk dark theme)
        ├── api/
        │   └── client.ts            # Axios + JWT interceptor
        ├── store/
        │   └── authStore.ts         # Zustand auth state
        ├── types/
        │   └── index.ts             # TypeScript types (mirror DTOs)
        ├── components/
        │   ├── Navbar.tsx
        │   └── ProtectedRoute.tsx
        └── pages/
            ├── LandingPage.tsx
            ├── LoginPage.tsx
            ├── RegisterPage.tsx
            └── DashboardPage.tsx
```

---

## Database — Lưu ở đâu?

> **📌 Câu trả lời ngắn:** Database hiện tại là **SQLite**, file được lưu ngay trong thư mục project của backend.

### Vị trí file SQLite hiện tại

Khi chạy `dotnet run` với môi trường `Development` (mặc định), file database nằm tại:

```
e:\Do an\NetQuestAI\backend\src\NetQuestAI.Api\netquestai-dev.db
```

| File | Mô tả |
|------|-------|
| `netquestai-dev.db` | File database chính (SQLite) |
| `netquestai-dev.db-wal` | Write-Ahead Log — dùng cho ghi đồng thời |
| `netquestai-dev.db-shm` | Shared memory file |

Connection string được định nghĩa trong:
- **Development:** `appsettings.Development.json` → `Data Source=netquestai-dev.db`
- **Production:** `appsettings.json` → `Data Source=netquestai.db`

---

### 🔄 Chuyển sang SQL Server (máy bạn đang dùng)

Vì máy bạn đã có **SQL Server**, làm theo 3 bước sau:

#### Bước 1 — Thay NuGet package

Mở file `backend/src/NetQuestAI.Api/NetQuestAI.Api.csproj`, thay `Sqlite` bằng `SqlServer`:

```xml
<!-- XÓA dòng này -->
<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="9.0.*" />

<!-- THÊM dòng này -->
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="9.0.*" />
```

Sau đó chạy:
```powershell
dotnet restore backend/src/NetQuestAI.Api/NetQuestAI.Api.csproj
```

#### Bước 2 — Cập nhật connection string

Sửa `appsettings.Development.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=NetQuestAI_Dev;Trusted_Connection=True;TrustServerCertificate=True"
}
```

Hoặc nếu dùng SQL Server cục bộ đầy đủ:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=NetQuestAI_Dev;Integrated Security=True;TrustServerCertificate=True"
}
```

#### Bước 3 — Sửa `Program.cs`

Mở `Program.cs`, thay `UseSqlite` bằng `UseSqlServer`:

```csharp
// Thay dòng này:
options.UseSqlite(...)

// Thành:
options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
```

#### Bước 4 — Tạo lại migration & apply

```powershell
# Xóa migration cũ (nếu muốn tạo lại sạch)
dotnet ef migrations remove --project backend/src/NetQuestAI.Api/NetQuestAI.Api.csproj

# Tạo migration mới
dotnet ef migrations add InitialCreate --project backend/src/NetQuestAI.Api/NetQuestAI.Api.csproj --output-dir Migrations

# Apply vào SQL Server
dotnet ef database update --project backend/src/NetQuestAI.Api/NetQuestAI.Api.csproj
```

---

## Cài đặt & Chạy

### Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---------|---------------------|
| .NET SDK | 10.0.x |
| Node.js | 18+ |
| npm | 9+ |
| SQL Server / SQLite | Tùy chọn (xem bên trên) |

### Clone & Cài đặt

```powershell
git clone <repo-url>
cd NetQuestAI
```

### Chạy Backend

```powershell
cd backend/src/NetQuestAI.Api

# Restore packages
dotnet restore

# Chạy server (tự động migrate database khi khởi động)
dotnet run --urls http://localhost:5000
```

> 🟢 Backend chạy tại: **http://localhost:5000**
> 📖 Swagger UI tại: **http://localhost:5000/swagger**

### Chạy Frontend

```powershell
cd frontend

# Cài packages lần đầu
npm install

# Chạy dev server
npm run dev
```

> 🟢 Frontend chạy tại: **http://localhost:5173**

### Build Production (Frontend)

```powershell
npm run build --prefix frontend
```

---

## API Endpoints

> **Base URL:** `http://localhost:5000/api`
> Các endpoint có 🔒 yêu cầu header: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/auth/register` | Đăng ký tài khoản mới |
| `POST` | `/auth/login` | Đăng nhập, nhận JWT token |

**Register body:**
```json
{
  "username": "operator_one",
  "email": "you@example.com",
  "password": "Str0ng@Pass!"
}
```

**Login body:**
```json
{
  "usernameOrEmail": "operator_one",
  "password": "Str0ng@Pass!"
}
```

### Challenges 🔒

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/challenges` | Danh sách thử thách (phân trang) |
| `GET` | `/challenges/{id}` | Chi tiết một thử thách |
| `POST` | `/challenges` | Tạo thử thách mới *(Admin only)* |

**Query params (GET /challenges):** `?difficulty=Easy&page=1&pageSize=20`

### Submissions 🔒

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/submissions` | Nộp flag cho thử thách |
| `GET` | `/submissions/my` | Xem lịch sử nộp bài của bản thân |

**Submit flag body:**
```json
{
  "challengeId": "guid-of-challenge",
  "flag": "NQ{your_flag_here}",
  "submittedConfig": "{}"
}
```

---

## Biến môi trường & Cấu hình

### `appsettings.Development.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=netquestai-dev.db"
  },
  "JwtSettings": {
    "SecretKey": "Dev-Only-Secret-Key-Min-32-Chars-For-HS256-Safety!",
    "Issuer": "NetQuestAI-Dev",
    "Audience": "NetQuestAI-Client",
    "ExpiryDays": "7"
  }
}
```

> ⚠️ **Lưu ý bảo mật:** Thay `SecretKey` bằng chuỗi ngẫu nhiên ≥ 256-bit trước khi deploy production. Không commit secret thật lên Git.

---

## Roadmap

### Giai đoạn 1 — Hoàn thành ✅
- [x] Backend ASP.NET Core 10 với JWT Auth
- [x] EF Core + SQLite (sẵn sàng chuyển SQL Server)
- [x] Domain models: User, Challenge, Submission
- [x] API: Auth, Challenges, Submissions
- [x] Frontend React + Vite + Tailwind CSS v4
- [x] Trang Landing, Login, Register, Dashboard
- [x] Zustand state management + Axios interceptor

### Giai đoạn 2 — Kế hoạch
- [ ] Tích hợp AI feedback (Google Gemini / OpenAI)
- [ ] Trang admin quản lý thử thách
- [ ] Bảng xếp hạng (Leaderboard) real-time
- [ ] Trực quan hóa topology mạng (network graph)
- [ ] WebSocket thông báo sự kiện live
- [ ] Chuyển sang SQL Server cho production
- [ ] Docker Compose cho toàn bộ stack

---

## Bảo mật

| Cơ chế | Chi tiết |
|--------|---------|
| Mật khẩu | BCrypt hash (cost factor 10) |
| Flag | SHA-256 hash — không lưu plaintext |
| Token | JWT HS256, hết hạn sau 7 ngày |
| CORS | Chỉ cho phép `localhost:5173` và `localhost:5174` |

---

## License

MIT License — xem file `LICENSE` để biết thêm chi tiết.

---

<div align="center">
  Built with ❤️ for the next generation of network security engineers.
</div>
