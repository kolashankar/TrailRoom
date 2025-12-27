# 🏗️ TrailRoom - Complete System Architecture

## 📐 7-Level Nested Architecture

---

## LEVEL 1: SYSTEM OVERVIEW

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        TrailRoom Platform                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │   Frontend   │◄──►│   Backend    │◄──►│   Database   │    │
│  │   (React)    │    │  (FastAPI)   │    │  (MongoDB)   │    │
│  └──────────────┘    └──────────────┘    └──────────────┘    │
│         │                    │                                  │
│         │                    │                                  │
│         ▼                    ▼                                  │
│  ┌──────────────┐    ┌──────────────┐                         │
│  │   Browser    │    │   External   │                         │
│  │   Storage    │    │   Services   │                         │
│  └──────────────┘    └──────────────┘                         │
│                       • OpenAI API                              │
│                       • Razorpay                                │
│                       • Email Service                           │
└─────────────────────────────────────────────────────────────────┘
```

### Core Components
1. **Frontend Application** (React SPA)
2. **Backend API** (FastAPI)
3. **Database Layer** (MongoDB)
4. **External Integrations** (OpenAI, Razorpay)
5. **Authentication System** (JWT + OAuth)
6. **File Storage** (Local/S3)

---

## LEVEL 2: APPLICATION LAYERS

### 2.1 Frontend Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │                 Presentation Layer                     │    │
│  │  • Pages • Components • Layouts • Assets               │    │
│  └───────────────────────────────────────────────────────┘    │
│                          │                                      │
│  ┌───────────────────────────────────────────────────────┐    │
│  │               Application Logic Layer                  │    │
│  │  • State Management • Routing • Context • Hooks        │    │
│  └───────────────────────────────────────────────────────┘    │
│                          │                                      │
│  ┌───────────────────────────────────────────────────────┐    │
│  │                 Service Layer                          │    │
│  │  • API Calls • Auth Service • Utils • Helpers          │    │
│  └───────────────────────────────────────────────────────┘    │
│                          │                                      │
│  ┌───────────────────────────────────────────────────────┐    │
│  │                 Infrastructure                         │    │
│  │  • HTTP Client • Storage • Error Handling              │    │
│  └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Backend Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │                  API Layer (Routes)                    │    │
│  │  • Public Routes • Protected Routes • Admin Routes     │    │
│  └───────────────────────────────────────────────────────┘    │
│                          │                                      │
│  ┌───────────────────────────────────────────────────────┐    │
│  │                 Middleware Layer                       │    │
│  │  • Auth • CORS • Rate Limiting • Error Handling        │    │
│  └───────────────────────────────────────────────────────┘    │
│                          │                                      │
│  ┌───────────────────────────────────────────────────────┐    │
│  │                 Business Logic (Services)              │    │
│  │  • User Service • Credit Service • TryOn Service       │    │
│  └───────────────────────────────────────────────────────┘    │
│                          │                                      │
│  ┌───────────────────────────────────────────────────────┐    │
│  │                  Data Layer (Models)                   │    │
│  │  • User Model • Transaction Model • Job Model          │    │
│  └───────────────────────────────────────────────────────┘    │
│                          │                                      │
│  ┌───────────────────────────────────────────────────────┐    │
│  │                Database Connection                     │    │
│  │  • MongoDB Client • Connection Pool • Indexes          │    │
│  └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## LEVEL 3: MODULE BREAKDOWN

### 3.1 Frontend Module Structure
```
frontend/
│
├── public/                          # Static assets
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
│       ├── images/
│       └── icons/
│
├── src/
│   │
│   ├── pages/                       # Page components
│   │   ├── Landing.js               # Landing page
│   │   ├── Login.js                 # Login page
│   │   ├── Register.js              # Registration page
│   │   ├── Dashboard.js             # Dashboard home
│   │   ├── GenerateTryon.js         # Try-on generation
│   │   ├── History.js               # Image history
│   │   ├── ApiPlayground.js         # API playground
│   │   ├── Usage.js                 # Usage analytics
│   │   ├── Billing.js               # Billing management
│   │   ├── Webhooks.js              # Webhook management
│   │   ├── Settings.js              # User settings
│   │   └── admin/                   # Admin pages
│   │       ├── AdminDashboard.js
│   │       ├── Users.js
│   │       ├── Jobs.js
│   │       ├── Payments.js
│   │       ├── Prompts.js
│   │       └── Security.js
│   │
│   ├── components/                  # Reusable components
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Modal.js
│   │   │   ├── Card.js
│   │   │   ├── Loader.js
│   │   │   └── ErrorBoundary.js
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.js
│   │   │   ├── TopBar.js
│   │   │   ├── Footer.js
│   │   │   └── ProfileDropdown.js
│   │   │
│   │   ├── auth/
│   │   │   ├── GoogleOAuthButton.js
│   │   │   └── ProtectedRoute.js
│   │   │
│   │   ├── tryon/
│   │   │   ├── ImageUpload.js
│   │   │   ├── ModeSelector.js
│   │   │   ├── GenerationProgress.js
│   │   │   └── ResultDisplay.js
│   │   │
│   │   └── admin/
│   │       ├── UserTable.js
│   │       ├── JobMonitor.js
│   │       └── PromptEditor.js
│   │
│   ├── layouts/                     # Page layouts
│   │   ├── DashboardLayout.js
│   │   ├── AdminLayout.js
│   │   └── PublicLayout.js
│   │
│   ├── context/                     # React Context
│   │   ├── AuthContext.js
│   │   ├── ThemeContext.js
│   │   └── CreditContext.js
│   │
│   ├── hooks/                       # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   ├── useTheme.js
│   │   └── useDebounce.js
│   │
│   ├── services/                    # API services
│   │   ├── authService.js
│   │   ├── tryonService.js
│   │   ├── creditService.js
│   │   ├── paymentService.js
│   │   └── adminService.js
│   │
│   ├── utils/                       # Utility functions
│   │   ├── api.js                   # Axios instance
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── imageHelpers.js
│   │
│   ├── styles/                      # Global styles
│   │   ├── index.css
│   │   ├── themes.js
│   │   └── tailwind.css
│   │
│   ├── App.js                       # Root component
│   ├── index.js                     # Entry point
│   └── routes.js                    # Route configuration
│
├── .env                             # Environment variables
├── package.json                     # Dependencies
├── tailwind.config.js               # Tailwind config
└── postcss.config.js                # PostCSS config
```

### 3.2 Backend Module Structure
```
backend/
│
├── models/                          # Database models
│   ├── user_model.py
│   ├── credit_transaction_model.py
│   ├── api_key_model.py
│   ├── tryon_job_model.py
│   ├── payment_model.py
│   ├── invoice_model.py
│   ├── webhook_model.py
│   ├── prompt_model.py
│   └── audit_log_model.py
│
├── routes/                          # API endpoints
│   ├── auth_routes.py               # Authentication
│   ├── user_routes.py               # User management
│   ├── credit_routes.py             # Credit operations
│   ├── api_key_routes.py            # API key management
│   ├── tryon_routes.py              # Try-on generation
│   ├── payment_routes.py            # Payments
│   ├── webhook_routes.py            # Webhooks
│   ├── analytics_routes.py          # Analytics
│   └── admin/                       # Admin routes
│       ├── user_routes.py
│       ├── job_routes.py
│       ├── payment_routes.py
│       ├── prompt_routes.py
│       └── security_routes.py
│
├── services/                        # Business logic
│   ├── auth_service.py
│   ├── user_service.py
│   ├── credit_service.py
│   ├── api_key_service.py
│   ├── tryon_service.py
│   ├── image_service.py
│   ├── payment_service.py
│   ├── invoice_service.py
│   ├── webhook_service.py
│   ├── email_service.py
│   ├── pricing_service.py
│   ├── analytics_service.py
│   └── abuse_detection_service.py
│
├── middleware/                      # Request middleware
│   ├── auth_middleware.py           # JWT validation
│   ├── api_key_middleware.py        # API key validation
│   ├── admin_middleware.py          # Admin authorization
│   ├── rate_limit_middleware.py     # Rate limiting
│   ├── cors_middleware.py           # CORS handling
│   └── audit_middleware.py          # Audit logging
│
├── auth/                            # Authentication
│   ├── oauth_handler.py             # Google OAuth
│   ├── jwt_handler.py               # JWT tokens
│   └── password_utils.py            # Password hashing
│
├── utils/                           # Utilities
│   ├── image_utils.py               # Image processing
│   ├── validators.py                # Input validation
│   ├── formatters.py                # Data formatting
│   ├── error_handlers.py            # Error handling
│   └── helpers.py                   # Helper functions
│
├── schedulers/                      # Background tasks
│   ├── daily_reset_scheduler.py     # Daily credit reset
│   └── cleanup_scheduler.py         # Data cleanup
│
├── config.py                        # Configuration
├── database.py                      # Database connection
├── server.py                        # FastAPI app
├── requirements.txt                 # Python dependencies
└── .env                             # Environment variables
```

---

## LEVEL 4: DATA MODELS & SCHEMAS

### 4.1 User Model
```python
User {
    id: UUID (Primary Key)
    email: String (Unique, Indexed)
    password_hash: String (Nullable)
    auth_provider: Enum ["email", "google"]
    role: Enum ["free", "paid", "admin"]
    
    # Credit system
    credits: Integer (Default: 0)
    daily_free_credits: Integer (Default: 3)
    last_free_credit_reset: DateTime
    
    # Profile
    first_name: String (Optional)
    last_name: String (Optional)
    profile_picture: String (URL, Optional)
    
    # Status
    is_active: Boolean (Default: True)
    is_email_verified: Boolean (Default: False)
    is_suspended: Boolean (Default: False)
    
    # Timestamps
    created_at: DateTime
    updated_at: DateTime
    last_login: DateTime
    
    # Relationships
    api_keys: [APIKey]
    credit_transactions: [CreditTransaction]
    tryon_jobs: [TryOnJob]
    payments: [Payment]
}
```

### 4.2 Credit Transaction Model
```python
CreditTransaction {
    id: UUID (Primary Key)
    user_id: UUID (Foreign Key, Indexed)
    
    # Transaction details
    type: Enum ["usage", "purchase", "free", "refund", "admin_adjustment"]
    credits: Integer
    balance_after: Integer
    description: String
    
    # Reference
    reference_id: UUID (Optional) # Job ID or Payment ID
    reference_type: String (Optional) # "tryon_job" or "payment"
    
    # Metadata
    metadata: JSON (Optional)
    created_at: DateTime
}
```

### 4.3 API Key Model
```python
APIKey {
    id: UUID (Primary Key)
    user_id: UUID (Foreign Key, Indexed)
    
    # Key details
    key_hash: String (Unique, Indexed)
    key_prefix: String # First 8 chars for display
    name: String (Default: "Default API Key")
    
    # Usage
    last_used: DateTime (Nullable)
    usage_count: Integer (Default: 0)
    
    # Status
    is_active: Boolean (Default: True)
    
    # Timestamps
    created_at: DateTime
    expires_at: DateTime (Nullable)
}
```

### 4.4 TryOn Job Model
```python
TryOnJob {
    id: UUID (Primary Key)
    user_id: UUID (Foreign Key, Indexed)
    
    # Input
    user_image_url: String
    top_image_url: String
    bottom_image_url: String (Nullable)
    mode: Enum ["top", "full"]
    
    # Processing
    status: Enum ["queued", "processing", "completed", "failed"]
    prompt_used: Text
    
    # Output
    output_image_url: String (Nullable)
    output_image_base64: Text (Nullable)
    
    # Billing
    credits_used: Integer
    
    # Error handling
    error_message: String (Nullable)
    retry_count: Integer (Default: 0)
    
    # Performance
    processing_time_ms: Integer (Nullable)
    
    # Timestamps
    created_at: DateTime
    started_at: DateTime (Nullable)
    completed_at: DateTime (Nullable)
}
```

### 4.5 Payment Model
```python
Payment {
    id: UUID (Primary Key)
    user_id: UUID (Foreign Key, Indexed)
    
    # Razorpay details
    razorpay_order_id: String (Unique, Indexed)
    razorpay_payment_id: String (Nullable)
    razorpay_signature: String (Nullable)
    
    # Amount
    credits_purchased: Integer
    base_amount: Float # In INR
    discount_percentage: Float
    discount_amount: Float
    final_amount: Float
    
    # Status
    status: Enum ["created", "pending", "completed", "failed", "refunded"]
    
    # Metadata
    payment_method: String (Nullable)
    failure_reason: String (Nullable)
    
    # Invoice
    invoice_id: UUID (Foreign Key, Nullable)
    
    # Timestamps
    created_at: DateTime
    completed_at: DateTime (Nullable)
}
```

### 4.6 Webhook Model
```python
Webhook {
    id: UUID (Primary Key)
    user_id: UUID (Foreign Key, Indexed)
    
    # Configuration
    url: String
    events: [String] # ["tryon.completed", "tryon.failed", ...]
    secret: String # For signature verification
    
    # Status
    is_active: Boolean (Default: True)
    
    # Delivery tracking
    delivery_count: Integer (Default: 0)
    failure_count: Integer (Default: 0)
    last_delivery_at: DateTime (Nullable)
    last_failure_at: DateTime (Nullable)
    
    # Timestamps
    created_at: DateTime
    updated_at: DateTime
}
```

### 4.7 Prompt Model
```python
Prompt {
    id: UUID (Primary Key)
    
    # Prompt details
    name: String
    type: Enum ["system", "top_only", "full_outfit"]
    content: Text
    version: Integer
    
    # Status
    is_active: Boolean (Default: False)
    
    # Metadata
    created_by: UUID (Admin user)
    notes: Text (Optional)
    
    # Timestamps
    created_at: DateTime
    activated_at: DateTime (Nullable)
}
```

### 4.8 Audit Log Model
```python
AuditLog {
    id: UUID (Primary Key)
    
    # Actor
    admin_id: UUID (Foreign Key)
    admin_email: String
    
    # Action
    action: String # "user.credits.add", "prompt.update", etc.
    entity_type: String # "user", "prompt", "payment", etc.
    entity_id: UUID
    
    # Changes
    old_value: JSON (Optional)
    new_value: JSON (Optional)
    
    # Context
    ip_address: String
    user_agent: String
    
    # Timestamp
    created_at: DateTime
}
```

---

## LEVEL 5: API ENDPOINTS SPECIFICATION

### 5.1 Authentication API
```
┌──────────────────────────────────────────────────────────────────┐
│                      Authentication Routes                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /api/v1/auth/register                                      │
│  ├─ Body: { email, password, first_name, last_name }            │
│  └─ Response: { user, access_token, refresh_token }             │
│                                                                  │
│  POST /api/v1/auth/login                                         │
│  ├─ Body: { email, password }                                   │
│  └─ Response: { user, access_token, refresh_token }             │
│                                                                  │
│  GET /api/v1/auth/google                                         │
│  └─ Redirect: Google OAuth consent screen                       │
│                                                                  │
│  GET /api/v1/auth/google/callback                                │
│  ├─ Query: { code, state }                                      │
│  └─ Response: { user, access_token, refresh_token }             │
│                                                                  │
│  POST /api/v1/auth/refresh                                       │
│  ├─ Body: { refresh_token }                                     │
│  └─ Response: { access_token }                                  │
│                                                                  │
│  POST /api/v1/auth/logout                                        │
│  ├─ Headers: Authorization: Bearer {token}                      │
│  └─ Response: { message: "Logged out successfully" }            │
│                                                                  │
│  GET /api/v1/auth/me                                             │
│  ├─ Headers: Authorization: Bearer {token}                      │
│  └─ Response: { user }                                          │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Try-On API
```
┌──────────────────────────────────────────────────────────────────┐
│                        Try-On Routes                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /api/v1/tryon                                              │
│  ├─ Headers: Authorization: Bearer {token} OR x-api-key         │
│  ├─ Body: {                                                     │
│  │    user_image: "url or base64",                              │
│  │    top_image: "url or base64",                               │
│  │    bottom_image: "url or base64" (optional),                 │
│  │    mode: "top" | "full"                                      │
│  │  }                                                            │
│  └─ Response: { job_id, status, credits_used }                  │
│                                                                  │
│  GET /api/v1/tryon/:jobId                                        │
│  ├─ Headers: Authorization: Bearer {token} OR x-api-key         │
│  └─ Response: {                                                 │
│       job_id, status, output_image_url, credits_used,           │
│       created_at, completed_at                                  │
│     }                                                            │
│                                                                  │
│  GET /api/v1/tryon/:jobId/base64                                 │
│  ├─ Headers: Authorization: Bearer {token} OR x-api-key         │
│  └─ Response: { image_base64 }                                  │
│                                                                  │
│  GET /api/v1/tryon/history                                       │
│  ├─ Headers: Authorization: Bearer {token}                      │
│  ├─ Query: { page, limit, mode, status }                       │
│  └─ Response: { jobs: [], total, page, limit }                 │
│                                                                  │
│  DELETE /api/v1/tryon/:jobId                                     │
│  ├─ Headers: Authorization: Bearer {token}                      │
│  └─ Response: { message: "Job deleted" }                        │
└──────────────────────────────────────────────────────────────────┘
```

### 5.3 Credits API
```
┌──────────────────────────────────────────────────────────────────┐
│                         Credit Routes                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GET /api/v1/credits                                             │
│  ├─ Headers: Authorization: Bearer {token}                      │
│  └─ Response: {                                                 │
│       credits, daily_free_credits, total_used                   │
│     }                                                            │
│                                                                  │
│  GET /api/v1/credits/transactions                                │
│  ├─ Headers: Authorization: Bearer {token}                      │
│  ├─ Query: { page, limit, type, date_from, date_to }           │
│  └─ Response: { transactions: [], total, page, limit }         │
└──────────────────────────────────────────────────────────────────┘
```

### 5.4 Payment API
```
┌──────────────────────────────────────────────────────────────────┐
│                        Payment Routes                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /api/v1/payments/create-order                              │
│  ├─ Headers: Authorization: Bearer {token}                      │
│  ├─ Body: { credits }                                           │
│  └─ Response: {                                                 │
│       order_id, amount, currency, razorpay_key                  │
│     }                                                            │
│                                                                  │
│  POST /api/v1/payments/verify                                    │
│  ├─ Headers: Authorization: Bearer {token}                      │
│  ├─ Body: {                                                     │
│  │    razorpay_order_id,                                        │
│  │    razorpay_payment_id,                                      │
│  │    razorpay_signature                                        │
│  │  }                                                            │
│  └─ Response: { success, credits_added, new_balance }           │
│                                                                  │
│  POST /api/v1/payments/webhook                                   │
│  ├─ Headers: x-razorpay-signature                               │
│  ├─ Body: { Razorpay webhook payload }                         │
│  └─ Response: { status: "ok" }                                  │
│                                                                  │
│  GET /api/v1/payments/history                                    │
│  ├─ Headers: Authorization: Bearer {token}                      │
│  └─ Response: { payments: [] }                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 5.5 API Key Management
```
┌──────────────────────────────────────────────────────────────────┐
│                      API Key Routes                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /api/v1/api-keys/generate                                  │
│  ├─ Headers: Authorization: Bearer {token}                      │
│  ├─ Body: { name }                                              │
│  └─ Response: { api_key, key_id, name }                        │
│                                                                  │
│  GET /api/v1/api-keys                                            │
│  ├─ Headers: Authorization: Bearer {token}                      │
│  └─ Response: { keys: [{ id, name, prefix, created_at }] }     │
│                                                                  │
│  DELETE /api/v1/api-keys/:keyId                                  │
│  ├─ Headers: Authorization: Bearer {token}                      │
│  └─ Response: { message: "API key deleted" }                    │
│                                                                  │
│  POST /api/v1/api-keys/:keyId/regenerate                         │
│  ├─ Headers: Authorization: Bearer {token}                      │
│  └─ Response: { api_key, key_id }                               │
└──────────────────────────────────────────────────────────────────┘
```

### 5.6 Admin API (Abbreviated)
```
┌──────────────────────────────────────────────────────────────────┐
│                        Admin Routes                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GET /api/v1/admin/users                                         │
│  GET /api/v1/admin/users/:userId                                 │
│  POST /api/v1/admin/users/:userId/credits                        │
│  PUT /api/v1/admin/users/:userId/role                            │
│  POST /api/v1/admin/users/:userId/suspend                        │
│                                                                  │
│  GET /api/v1/admin/jobs                                          │
│  POST /api/v1/admin/jobs/:jobId/retry                            │
│  POST /api/v1/admin/jobs/:jobId/refund                           │
│                                                                  │
│  GET /api/v1/admin/prompts                                       │
│  POST /api/v1/admin/prompts                                      │
│  PUT /api/v1/admin/prompts/:promptId                             │
│                                                                  │
│  GET /api/v1/admin/analytics/dashboard                           │
│  GET /api/v1/admin/analytics/revenue                             │
│  GET /api/v1/admin/analytics/usage                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## LEVEL 6: SERVICE INTERACTION FLOW

### 6.1 User Registration Flow
```
┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐
│ Client  │         │  API    │         │ Service │         │Database │
└────┬────┘         └────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │                   │
     │ POST /register    │                   │                   │
     ├──────────────────►│                   │                   │
     │                   │                   │                   │
     │                   │ Validate input    │                   │
     │                   ├──────────────────►│                   │
     │                   │                   │                   │
     │                   │                   │ Check email exists│
     │                   │                   ├──────────────────►│
     │                   │                   │                   │
     │                   │                   │ Email available   │
     │                   │                   │◄──────────────────┤
     │                   │                   │                   │
     │                   │                   │ Hash password     │
     │                   │                   │                   │
     │                   │                   │ Create user       │
     │                   │                   ├──────────────────►│
     │                   │                   │                   │
     │                   │                   │ User created      │
     │                   │                   │◄──────────────────┤
     │                   │                   │                   │
     │                   │                   │ Initialize credits│
     │                   │                   ├──────────────────►│
     │                   │                   │                   │
     │                   │                   │ Generate API key  │
     │                   │                   ├──────────────────►│
     │                   │                   │                   │
     │                   │ User + tokens     │                   │
     │                   │◄──────────────────┤                   │
     │                   │                   │                   │
     │ 201 Created       │                   │                   │
     │◄──────────────────┤                   │                   │
     │                   │                   │                   │
```

### 6.2 Try-On Generation Flow
```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Client  │  │  API    │  │ TryOn   │  │ OpenAI  │  │Database │
└────┬────┘  └────┬────┘  │ Service │  │   API   │  └────┬────┘
     │            │        └────┬────┘  └────┬────┘       │
     │ POST       │             │            │            │
     │ /tryon     │             │            │            │
     ├───────────►│             │            │            │
     │            │             │            │            │
     │            │ Validate    │            │            │
     │            │ auth        │            │            │
     │            │             │            │            │
     │            │ Check       │            │            │
     │            │ credits     │            │            │
     │            ├────────────►│            │            │
     │            │             │            │            │
     │            │             │ Query user │            │
     │            │             ├───────────────────────►│
     │            │             │            │            │
     │            │             │ User data  │            │
     │            │             │◄───────────────────────┤
     │            │             │            │            │
     │            │ Credits OK  │            │            │
     │            │◄────────────┤            │            │
     │            │             │            │            │
     │            │ Create job  │            │            │
     │            ├────────────►│            │            │
     │            │             │            │            │
     │            │             │ Save job   │            │
     │            │             ├───────────────────────►│
     │            │             │            │            │
     │ 202        │             │            │            │
     │ Accepted   │             │            │            │
     │◄───────────┤             │            │            │
     │            │             │            │            │
     │            │             │ Process    │            │
     │            │             │ images     │            │
     │            │             │            │            │
     │            │             │ Call       │            │
     │            │             │ OpenAI     │            │
     │            │             ├───────────►│            │
     │            │             │            │            │
     │            │             │            │ Generate   │
     │            │             │            │ image      │
     │            │             │            │            │
     │            │             │ Image      │            │
     │            │             │ (base64)   │            │
     │            │             │◄───────────┤            │
     │            │             │            │            │
     │            │             │ Update job │            │
     │            │             ├───────────────────────►│
     │            │             │            │            │
     │            │             │ Deduct     │            │
     │            │             │ credits    │            │
     │            │             ├───────────────────────►│
     │            │             │            │            │
     │ GET        │             │            │            │
     │ /tryon/:id │             │            │            │
     ├───────────►│             │            │            │
     │            │             │            │            │
     │            │ Get job     │            │            │
     │            ├────────────►│            │            │
     │            │             │            │            │
     │            │             │ Query job  │            │
     │            │             ├───────────────────────►│
     │            │             │            │            │
     │            │             │ Job data   │            │
     │            │             │◄───────────────────────┤
     │            │             │            │            │
     │            │ Job result  │            │            │
     │            │◄────────────┤            │            │
     │            │             │            │            │
     │ 200 OK     │             │            │            │
     │ + image    │             │            │            │
     │◄───────────┤             │            │            │
```

### 6.3 Payment Flow
```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Client  │  │  API    │  │ Payment │  │Razorpay │  │Database │
└────┬────┘  └────┬────┘  │ Service │  └────┬────┘  └────┬────┘
     │            │        └────┬────┘       │            │
     │ Select     │             │            │            │
     │ credits    │             │            │            │
     │            │             │            │            │
     │ POST       │             │            │            │
     │ /create    │             │            │            │
     │ -order     │             │            │            │
     ├───────────►│             │            │            │
     │            │             │            │            │
     │            │ Calculate   │            │            │
     │            │ price       │            │            │
     │            ├────────────►│            │            │
     │            │             │            │            │
     │            │             │ Create     │            │
     │            │             │ Razorpay   │            │
     │            │             │ order      │            │
     │            │             ├───────────►│            │
     │            │             │            │            │
     │            │             │ Order ID   │            │
     │            │             │◄───────────┤            │
     │            │             │            │            │
     │            │             │ Save       │            │
     │            │             │ payment    │            │
     │            │             ├───────────────────────►│
     │            │             │            │            │
     │            │ Order       │            │            │
     │            │ details     │            │            │
     │            │◄────────────┤            │            │
     │            │             │            │            │
     │ Order data │             │            │            │
     │◄───────────┤             │            │            │
     │            │             │            │            │
     │ Open       │             │            │            │
     │ Razorpay   │             │            │            │
     │ checkout   │             │            │            │
     │            │             │            │            │
     │───────────────────────────────────────►            │
     │            │             │            │            │
     │            User completes payment     │            │
     │            │             │            │            │
     │◄───────────────────────────────────────            │
     │            │             │            │            │
     │ POST       │             │            │            │
     │ /verify    │             │            │            │
     ├───────────►│             │            │            │
     │            │             │            │            │
     │            │ Verify      │            │            │
     │            │ signature   │            │            │
     │            ├────────────►│            │            │
     │            │             │            │            │
     │            │             │ Validate   │            │
     │            │             │            │            │
     │            │             │ Add        │            │
     │            │             │ credits    │            │
     │            │             ├───────────────────────►│
     │            │             │            │            │
     │            │             │ Update     │            │
     │            │             │ payment    │            │
     │            │             ├───────────────────────►│
     │            │             │            │            │
     │            │ Success     │            │            │
     │            │◄────────────┤            │            │
     │            │             │            │            │
     │ 200 OK     │             │            │            │
     │ + credits  │             │            │            │
     │◄───────────┤             │            │            │
```

---

## LEVEL 7: DEPLOYMENT & INFRASTRUCTURE

### 7.1 Container Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Environment                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │                  Supervisor                            │    │
│  │  ┌─────────────────┐        ┌─────────────────┐      │    │
│  │  │   Frontend      │        │    Backend      │      │    │
│  │  │   (React)       │        │   (FastAPI)     │      │    │
│  │  │   Port: 3000    │        │   Port: 8001    │      │    │
│  │  └─────────────────┘        └─────────────────┘      │    │
│  └───────────────────────────────────────────────────────┘    │
│                              │                                  │
│  ┌───────────────────────────────────────────────────────┐    │
│  │               MongoDB (External)                       │    │
│  │               Port: 27017                              │    │
│  └───────────────────────────────────────────────────────┘    │
│                              │                                  │
│  ┌───────────────────────────────────────────────────────┐    │
│  │            File Storage (Local/S3)                     │    │
│  │            /app/storage/images/                        │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Network Architecture
```
                      ┌─────────────┐
                      │   Client    │
                      │  (Browser)  │
                      └──────┬──────┘
                             │
                             │ HTTPS
                             │
                      ┌──────▼──────┐
                      │   Load      │
                      │  Balancer   │
                      └──────┬──────┘
                             │
               ┌─────────────┼─────────────┐
               │                           │
        ┌──────▼──────┐             ┌──────▼──────┐
        │  Frontend   │             │   Backend   │
        │  (Port 3000)│             │ (Port 8001) │
        └──────┬──────┘             └──────┬──────┘
               │                           │
               │                           │
               └──────────┬────────────────┘
                          │
                   ┌──────▼──────┐
                   │   MongoDB   │
                   │  (External) │
                   └─────────────┘

External Services:
  ├─ OpenAI API (gpt-image-1)
  ├─ Razorpay API (payments)
  └─ Email Service (notifications)
```

### 7.3 Environment Configuration
```
┌─────────────────────────────────────────────────────────────────┐
│                  Environment Variables                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Backend (.env):                                                │
│  ├─ MONGO_URL=mongodb://...                                    │
│  ├─ JWT_SECRET=...                                             │
│  ├─ OPENAI_API_KEY=...                                         │
│  ├─ RAZORPAY_KEY_ID=...                                        │
│  ├─ RAZORPAY_KEY_SECRET=...                                    │
│  ├─ GOOGLE_CLIENT_ID=...                                       │
│  ├─ GOOGLE_CLIENT_SECRET=...                                   │
│  └─ EMAIL_SERVICE_KEY=...                                      │
│                                                                 │
│  Frontend (.env):                                               │
│  ├─ REACT_APP_BACKEND_URL=http://...                           │
│  ├─ REACT_APP_GOOGLE_CLIENT_ID=...                             │
│  └─ REACT_APP_RAZORPAY_KEY=...                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 Scaling Strategy
```
┌─────────────────────────────────────────────────────────────────┐
│                    Horizontal Scaling                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1: Single Instance (MVP)                                │
│  ├─ 1 Backend instance                                         │
│  ├─ 1 Frontend instance                                        │
│  └─ Shared MongoDB                                             │
│                                                                 │
│  Phase 2: Load Balanced (100+ users)                           │
│  ├─ 2-3 Backend instances                                      │
│  ├─ 2 Frontend instances                                       │
│  ├─ Redis for session/cache                                    │
│  └─ MongoDB replica set                                        │
│                                                                 │
│  Phase 3: Microservices (1000+ users)                          │
│  ├─ Separate services:                                         │
│  │   ├─ Auth service                                           │
│  │   ├─ TryOn service (with queue)                            │
│  │   ├─ Payment service                                        │
│  │   └─ Admin service                                          │
│  ├─ Message queue (RabbitMQ/Redis)                            │
│  ├─ CDN for static assets                                      │
│  └─ MongoDB sharding                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.5 Database Indexes
```python
# Critical indexes for performance

Users:
  - email (unique, ascending)
  - role (ascending)
  - created_at (descending)

CreditTransactions:
  - user_id (ascending)
  - created_at (descending)
  - type (ascending)
  - compound: (user_id, created_at)

APIKeys:
  - key_hash (unique, ascending)
  - user_id (ascending)
  - is_active (ascending)

TryOnJobs:
  - user_id (ascending)
  - status (ascending)
  - created_at (descending)
  - compound: (user_id, status)
  - compound: (user_id, created_at)

Payments:
  - user_id (ascending)
  - razorpay_order_id (unique, ascending)
  - status (ascending)
  - created_at (descending)

Webhooks:
  - user_id (ascending)
  - is_active (ascending)

AuditLogs:
  - admin_id (ascending)
  - entity_type (ascending)
  - created_at (descending)
  - compound: (entity_type, entity_id)
```

### 7.6 Security Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Layers                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: Network Security                                      │
│  ├─ SSL/TLS encryption                                         │
│  ├─ HTTPS enforcement                                           │
│  └─ Firewall rules                                              │
│                                                                 │
│  Layer 2: Authentication                                        │
│  ├─ JWT with short expiry (15 min)                            │
│  ├─ Refresh tokens (7 days)                                   │
│  ├─ API key hashing (SHA-256)                                 │
│  └─ OAuth 2.0 (Google)                                         │
│                                                                 │
│  Layer 3: Authorization                                         │
│  ├─ Role-based access control                                  │
│  ├─ Resource ownership validation                              │
│  └─ Admin-only routes                                           │
│                                                                 │
│  Layer 4: Input Validation                                      │
│  ├─ Pydantic models (backend)                                  │
│  ├─ Schema validation                                           │
│  ├─ Sanitization                                                │
│  └─ File type checking                                          │
│                                                                 │
│  Layer 5: Rate Limiting                                         │
│  ├─ Per IP: 100 req/min                                        │
│  ├─ Per API key: 1000 req/hour                                │
│  └─ Per user: 50 generations/day                               │
│                                                                 │
│  Layer 6: Data Protection                                       │
│  ├─ Password hashing (bcrypt)                                  │
│  ├─ Sensitive data encryption                                   │
│  ├─ Database connection encryption                             │
│  └─ Secure secret storage                                       │
│                                                                 │
│  Layer 7: Monitoring                                            │
│  ├─ Audit logging                                               │
│  ├─ Anomaly detection                                           │
│  ├─ Failed auth tracking                                        │
│  └─ Error reporting                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.7 Monitoring & Observability
```
┌─────────────────────────────────────────────────────────────────┐
│                     Monitoring Stack                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Application Metrics:                                           │
│  ├─ API response times                                         │
│  ├─ Error rates                                                │
│  ├─ Request counts                                             │
│  ├─ Credit consumption                                          │
│  └─ Job completion rates                                        │
│                                                                 │
│  Infrastructure Metrics:                                        │
│  ├─ CPU usage                                                  │
│  ├─ Memory usage                                               │
│  ├─ Disk I/O                                                   │
│  ├─ Network throughput                                         │
│  └─ Database connections                                        │
│                                                                 │
│  Business Metrics:                                              │
│  ├─ Daily active users                                         │
│  ├─ Signup conversion                                          │
│  ├─ Payment success rate                                       │
│  ├─ Average credits per user                                   │
│  └─ Revenue per day                                             │
│                                                                 │
│  Logging:                                                       │
│  ├─ Application logs (supervisor)                              │
│  ├─ Access logs                                                │
│  ├─ Error logs                                                 │
│  └─ Audit logs                                                  │
│                                                                 │
│  Alerts:                                                        │
│  ├─ High error rate (>5%)                                      │
│  ├─ Slow response time (>1s)                                   │
│  ├─ Payment failures                                            │
│  ├─ High credit abuse                                           │
│  └─ Service downtime                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Architecture Summary

This 7-level nested architecture provides:

1. **Level 1**: System overview and core components
2. **Level 2**: Application layer breakdown (Frontend & Backend)
3. **Level 3**: Detailed module and file structure
4. **Level 4**: Complete data models and schemas
5. **Level 5**: Comprehensive API endpoint specifications
6. **Level 6**: Service interaction flows and communication
7. **Level 7**: Deployment, infrastructure, and operational concerns

### Key Architectural Decisions

✅ **Monolithic MVP** → Microservices ready
✅ **API-first design** → Consistent interface
✅ **JWT + API keys** → Flexible authentication
✅ **Credit-based billing** → Simple, scalable
✅ **Base64 images** → No CORS issues
✅ **MongoDB** → Flexible schema, fast queries
✅ **Supervisor** → Simple process management
✅ **React Context** → Lightweight state management
✅ **FastAPI** → High performance, auto-docs

---

**This architecture supports the complete TrailRoom platform from MVP to enterprise scale.**