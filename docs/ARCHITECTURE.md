# TrailRoom Architecture Documentation

## System Overview

TrailRoom is an API-first virtual try-on platform built with a modern microservices-inspired architecture. The system enables e-commerce businesses and developers to integrate AI-powered clothing try-on capabilities into their applications.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
├──────────────────────┬──────────────────────┬───────────────────┤
│   React Frontend     │  Admin Dashboard     │   External APIs   │
│   (Port 3000)        │  (React)             │   (API Keys)      │
└──────────┬───────────┴──────────┬───────────┴─────────┬─────────┘
           │                      │                      │
           └──────────────────────┴──────────────────────┘
                                  │
                                  ▼
           ┌─────────────────────────────────────────────┐
           │         Nginx Reverse Proxy                 │
           │         (Port 80/443)                       │
           └─────────────────────┬───────────────────────┘
                                  │
                                  ▼
           ┌─────────────────────────────────────────────┐
           │        FastAPI Backend (Port 8001)          │
           ├─────────────────────────────────────────────┤
           │  ┌────────────┐  ┌────────────────────┐    │
           │  │  Auth      │  │  Try-On Service    │    │
           │  │  Middleware│  │  (Gemini AI)       │    │
           │  └────────────┘  └────────────────────┘    │
           │  ┌────────────┐  ┌────────────────────┐    │
           │  │  Payment   │  │  Credit System     │    │
           │  │  (Razorpay)│  │                    │    │
           │  └────────────┘  └────────────────────┘    │
           │  ┌────────────┐  ┌────────────────────┐    │
           │  │  API Keys  │  │  Webhooks          │    │
           │  │  Manager   │  │                    │    │
           │  └────────────┘  └────────────────────┘    │
           └─────────────────────┬───────────────────────┘
                                  │
                                  ▼
           ┌─────────────────────────────────────────────┐
           │        MongoDB Database                     │
           │        (Port 27017)                         │
           ├─────────────────────────────────────────────┤
           │  Collections:                               │
           │  • users                                    │
           │  • tryon_jobs                               │
           │  • credit_transactions                      │
           │  • payments                                 │
           │  • invoices                                 │
           │  • api_keys                                 │
           │  • webhooks                                 │
           │  • audit_logs                               │
           └─────────────────────────────────────────────┘

           ┌─────────────────────────────────────────────┐
           │        External Services                    │
           ├─────────────────────────────────────────────┤
           │  • Google Gemini 2.0 Flash (AI)            │
           │  • Razorpay (Payments)                      │
           │  • Google OAuth 2.0 (Auth)                  │
           └─────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: MongoDB 6.0+ (Motor async driver)
- **Authentication**: JWT tokens, Google OAuth 2.0
- **Payment Gateway**: Razorpay
- **AI Service**: Google Gemini 2.0 Flash (via emergentintegrations)
- **Task Scheduling**: APScheduler
- **Process Management**: Supervisor

### Frontend
- **Framework**: React 19
- **Routing**: React Router v7
- **State Management**: React Context + Hooks
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI + Custom Components
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker
- **Process Management**: Supervisor
- **Web Server**: Nginx (reverse proxy)
- **Version Control**: Git

## Core Components

### 1. Authentication System

**Location**: `/app/backend/auth/`

**Components**:
- `jwt_handler.py`: JWT token generation and validation
- `oauth_handler.py`: Google OAuth 2.0 integration
- `password_utils.py`: Password hashing and verification (bcrypt)

**Features**:
- Email/password authentication
- Google OAuth 2.0 login
- JWT access and refresh tokens
- Role-based access control (user, admin, super_admin)
- Session management

**Flow**:
1. User submits credentials (email/password or OAuth)
2. Backend validates credentials
3. JWT tokens generated (access + refresh)
4. Tokens stored in frontend (localStorage)
5. Subsequent requests include JWT in Authorization header
6. Middleware validates token on each request

### 2. Credit System

**Location**: `/app/backend/services/credit_service.py`

**Features**:
- Free daily credits (3 per day for free users)
- Credit purchase system
- Credit deduction on usage
- Transaction logging
- Balance tracking
- Daily credit reset scheduler

**Credit Costs**:
- Top-only try-on: 1 credit
- Full-outfit try-on: 2 credits

**Transaction Types**:
- `free`: Daily free credits
- `purchase`: Paid credits
- `usage`: Credit deduction for try-on generation
- `refund`: Credit refund for failed jobs
- `admin_adjustment`: Manual admin adjustments

### 3. Virtual Try-On Service

**Location**: `/app/backend/services/tryon_service.py`

**AI Integration**: Google Gemini 2.0 Flash (gemini-2.5-flash-image-preview)

**Process Flow**:
1. User uploads person image and clothing image(s)
2. System validates images (format, size)
3. Credit check (1 or 2 credits based on mode)
4. Job created with status "queued"
5. Async processing begins:
   - Convert base64 images to PIL format
   - Generate AI prompt based on mode
   - Call Gemini API with images and prompt
   - Receive generated try-on image
6. Job status updated to "completed" or "failed"
7. Credits deducted on success, refunded on failure
8. Result stored in database

**Modes**:
- **Top Only**: Try on only upper garments (tops, shirts, jackets)
- **Full Outfit**: Try on complete outfit (top + bottom)

### 4. Payment System

**Location**: `/app/backend/services/payment_service.py`

**Payment Gateway**: Razorpay

**Flow**:
1. User selects credit package
2. Backend calculates price with discount
3. Razorpay order created
4. Frontend opens Razorpay checkout
5. User completes payment
6. Razorpay sends callback with payment details
7. Backend verifies signature
8. Credits added to user account
9. Invoice generated
10. Webhook notification sent (optional)

**Security**:
- Server-side price calculation (never trust frontend)
- Signature verification for all callbacks
- Idempotency check (prevent double processing)
- Webhook signature verification

### 5. Pricing Engine

**Location**: `/app/backend/services/pricing_service.py`

**Dynamic Discount Formula**:
```python
if credits < 2100:
    discount = 0%
elif credits == 2100:
    discount = 10%
elif credits > 2100 and credits < 50000:
    # Linear interpolation from 10% to 25%
    discount = 10 + ((credits - 2100) / (50000 - 2100)) * 15
else:  # credits >= 50000
    discount = 25%  # Maximum discount
```

**Pricing Tiers**:
- Base price: ₹1 per credit
- Minimum purchase: 300 credits
- Recommended: 2100 credits (10% discount)
- Maximum discount: 25% at 50,000+ credits

### 6. API Key Management

**Location**: `/app/backend/services/api_key_service.py`

**Features**:
- Cryptographically secure key generation
- API key hashing (SHA-256)
- Key regeneration
- Usage tracking
- Rate limiting per key
- Multiple keys per user

**API Key Format**: `tr_live_xxxxxxxxxxxxxxxxxxxx` (32 characters)

### 7. Admin Panel

**Location**: `/app/admin-frontend/`

**Features**:
- User management (search, filter, modify)
- Credit management (add/deduct/refund)
- Payment oversight
- Job monitoring (real-time)
- AI prompt control
- System analytics
- Abuse detection
- Audit logs

**Admin Roles**:
- `super_admin`: Full system access
- `support_admin`: User support, credits
- `finance_admin`: Payments, billing

### 8. Webhook System

**Location**: `/app/backend/services/webhook_service.py`

**Events**:
- `tryon.completed`: Try-on generation completed
- `tryon.failed`: Try-on generation failed
- `payment.completed`: Payment successful
- `credits.low`: User credit balance low (<10)

**Delivery**:
- HTTP POST to registered webhook URLs
- Retry logic: 3 attempts with exponential backoff
- Signature verification (HMAC-SHA256)
- Delivery logs and status tracking

## Database Schema

### Users Collection
```javascript
{
  id: UUID,
  email: String (unique, indexed),
  password_hash: String,
  auth_provider: "email" | "google",
  role: "user" | "admin" | "super_admin",
  credits: Number,
  daily_free_credits: Number,
  daily_free_reset_at: DateTime,
  created_at: DateTime,
  updated_at: DateTime,
  is_active: Boolean
}
```

### TryOn Jobs Collection
```javascript
{
  id: UUID,
  user_id: UUID (indexed),
  mode: "top_only" | "full_outfit",
  status: "queued" | "processing" | "completed" | "failed",
  person_image: String (base64),
  clothing_images: Array<String> (base64),
  result_image: String (base64),
  error_message: String,
  credits_used: Number,
  created_at: DateTime (indexed),
  completed_at: DateTime
}
```

### Credit Transactions Collection
```javascript
{
  id: UUID,
  user_id: UUID (indexed),
  type: "free" | "purchase" | "usage" | "refund" | "admin_adjustment",
  credits: Number,
  description: String,
  reference_id: UUID (payment_id or job_id),
  created_at: DateTime (indexed)
}
```

### Payments Collection
```javascript
{
  id: UUID,
  user_id: UUID (indexed),
  razorpay_order_id: String (unique, indexed),
  razorpay_payment_id: String (unique, indexed),
  amount: Number,
  credits: Number,
  discount_percentage: Number,
  status: "created" | "completed" | "failed" | "refunded",
  created_at: DateTime (indexed),
  completed_at: DateTime
}
```

## Security Considerations

### Authentication
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with expiration (access: 1 hour, refresh: 7 days)
- HTTPS required for all API calls
- OAuth 2.0 state parameter for CSRF protection

### API Security
- Rate limiting per IP and API key
- Request validation (Pydantic models)
- SQL injection prevention (MongoDB query sanitization)
- XSS protection (input sanitization)
- CORS configuration

### Payment Security
- Server-side price calculation
- Razorpay signature verification
- Idempotency checks
- PCI DSS compliance (via Razorpay)
- Webhook signature verification

### Data Protection
- Environment variables for secrets
- API keys hashed in database
- Sensitive data not logged
- Regular security audits
- User data encryption at rest (MongoDB)

## Performance Optimization

### Backend
- Database indexing on frequently queried fields
- Connection pooling (MongoDB Motor)
- Async/await for I/O operations
- Caching strategy for static data
- Query optimization

### Frontend
- Code splitting with React.lazy
- Lazy loading for routes
- Image optimization
- Suspense boundaries
- Memoization for expensive computations

### Database
- Indexes on:
  - `users.email`
  - `users.id`
  - `tryon_jobs.user_id`
  - `tryon_jobs.created_at`
  - `credit_transactions.user_id`
  - `credit_transactions.created_at`
  - `payments.user_id`
  - `payments.razorpay_order_id`

## Scalability

### Horizontal Scaling
- Stateless backend (JWT tokens)
- Load balancing ready
- Database replica sets
- CDN for static assets

### Vertical Scaling
- Async I/O operations
- Connection pooling
- Efficient algorithms
- Resource monitoring

## Monitoring & Observability

### Logging
- Structured logging (JSON format)
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Log aggregation ready
- Request/response logging

### Metrics
- API response times
- Database query performance
- Job completion rates
- Error rates
- Credit usage patterns

### Alerts
- High error rates
- Slow API responses
- Failed payments
- Low credit balances
- System resource usage

## Deployment Architecture

### Development
```
Local Machine
├── Backend (localhost:8001)
├── Frontend (localhost:3000)
└── MongoDB (localhost:27017)
```

### Production
```
Cloud Infrastructure
├── Load Balancer
│   └── SSL Termination
├── Application Servers (N instances)
│   ├── Backend (FastAPI)
│   └── Frontend (Static files)
├── Database Cluster
│   ├── Primary MongoDB
│   └── Secondary replicas
└── External Services
    ├── Gemini AI
    └── Razorpay
```

## API Rate Limits

### Free Users
- 3 generations per day
- 10 API requests per minute
- Burst: 20 requests

### Paid Users
- Unlimited generations (based on credits)
- 60 API requests per minute
- Burst: 100 requests

## Data Retention

### Try-On Images
- Stored for 30 days after generation
- Auto-deletion after retention period
- User can delete anytime

### Transaction Records
- Permanent retention
- Audit trail requirement

### Logs
- Application logs: 7 days
- Audit logs: 1 year
- Error logs: 30 days

## Disaster Recovery

### Backup Strategy
- Daily MongoDB backups
- 30-day retention
- Point-in-time recovery
- Geo-redundant storage

### Recovery Procedures
- Database restoration
- Service failover
- Data validation

---

**Last Updated**: December 2024
**Version**: 1.0
