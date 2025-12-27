# TrailRoom API Reference

## Base URL

```
Production: https://api.trailroom.com
Development: http://localhost:8001
```

## Authentication

All API requests (except auth endpoints) require authentication via:

**Option 1: JWT Token**
```http
Authorization: Bearer <access_token>
```

**Option 2: API Key**
```http
X-API-Key: <your_api_key>
```

## Response Format

All responses follow this structure:

**Success Response**:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { /* additional error context */ }
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT token expired |
| `AUTH_UNAUTHORIZED` | 403 | Insufficient permissions |
| `CREDITS_INSUFFICIENT` | 402 | Not enough credits |
| `IMAGE_INVALID_FORMAT` | 400 | Invalid image format |
| `IMAGE_TOO_LARGE` | 400 | Image exceeds size limit |
| `PAYMENT_FAILED` | 402 | Payment processing failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Authentication Endpoints

### POST /api/v1/auth/register

Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "credits": 3,
      "role": "user"
    },
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi..."
  }
}
```

### POST /api/v1/auth/login

Login with email and password.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "credits": 10,
      "role": "user"
    },
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi..."
  }
}
```

### GET /api/v1/auth/google

Initiate Google OAuth 2.0 login flow.

**Response**: Redirects to Google OAuth consent page

### GET /api/v1/auth/google/callback

Google OAuth callback endpoint.

**Query Parameters**:
- `code`: OAuth authorization code
- `state`: CSRF protection token

**Response**: Redirects to frontend with tokens

### POST /api/v1/auth/refresh

Refresh access token.

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOi..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi..."
  }
}
```

### GET /api/v1/auth/me

Get current user information.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "credits": 10,
      "role": "user",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

## Try-On Generation Endpoints

### POST /api/v1/tryon

Create a new virtual try-on job.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "mode": "top_only",
  "person_image": "base64_encoded_image",
  "clothing_images": [
    "base64_encoded_image"
  ]
}
```

**Parameters**:
- `mode`: `"top_only"` or `"full_outfit"`
- `person_image`: Base64 encoded person image
- `clothing_images`: Array of base64 encoded clothing images

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "status": "queued",
    "credits_used": 1,
    "estimated_completion": "30 seconds"
  }
}
```

### GET /api/v1/tryon/:jobId

Get try-on job status and result.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "status": "completed",
    "mode": "top_only",
    "person_image": "base64_encoded_image",
    "clothing_images": ["base64_encoded_image"],
    "result_image": "base64_encoded_result",
    "credits_used": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "completed_at": "2024-01-01T00:00:25Z"
  }
}
```

**Status Values**:
- `queued`: Job is waiting in queue
- `processing`: AI generation in progress
- `completed`: Generation successful
- `failed`: Generation failed

### GET /api/v1/tryon/history/list

Get user's try-on history.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by status (optional)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "job_id": "uuid",
        "status": "completed",
        "mode": "top_only",
        "result_image": "base64_encoded_thumbnail",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### DELETE /api/v1/tryon/:jobId

Delete a try-on job and its images.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

## Credit Management Endpoints

### GET /api/v1/credits

Get current credit balance.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "credits": 42,
    "daily_free_credits": 3,
    "next_free_reset": "2024-01-02T00:00:00Z"
  }
}
```

### GET /api/v1/credits/transactions

Get credit transaction history.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `type`: Filter by type (optional)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "usage",
        "credits": -1,
        "description": "Try-on generation",
        "created_at": "2024-01-01T12:00:00Z"
      },
      {
        "id": "uuid",
        "type": "purchase",
        "credits": 100,
        "description": "Credit purchase",
        "created_at": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15
    }
  }
}
```

---

## Pricing Endpoints

### GET /api/v1/pricing/calculate

Calculate price for credits with discount.

**Query Parameters**:
- `credits`: Number of credits (required)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "credits": 2100,
    "base_price": 2100.00,
    "discount_percentage": 10,
    "discount_amount": 210.00,
    "final_price": 1890.00,
    "price_per_credit": 0.90,
    "currency": "INR"
  }
}
```

### GET /api/v1/pricing/plans

Get predefined pricing plans.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "name": "Starter",
        "credits": 300,
        "price": 300.00,
        "discount": 0,
        "popular": false
      },
      {
        "name": "Recommended",
        "credits": 2100,
        "price": 1890.00,
        "discount": 10,
        "popular": true
      },
      {
        "name": "Business",
        "credits": 10000,
        "price": 8500.00,
        "discount": 15,
        "popular": false
      }
    ]
  }
}
```

---

## Payment Endpoints

### POST /api/v1/payments/create-order

Create a Razorpay payment order.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "credits": 2100
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "order_id": "order_xxxxx",
    "amount": 189000,
    "currency": "INR",
    "credits": 2100,
    "razorpay_key": "rzp_xxxxx"
  }
}
```

### POST /api/v1/payments/verify

Verify payment completion.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "payment_verified": true,
    "credits_added": 2100,
    "new_balance": 2142,
    "invoice_id": "uuid"
  }
}
```

### POST /api/v1/payments/webhook

Razorpay webhook endpoint (server-to-server).

**Headers**: 
- `X-Razorpay-Signature`: Webhook signature

**Request Body**: Razorpay webhook payload

**Response** (200 OK):
```json
{
  "success": true
}
```

### GET /api/v1/payments/history

Get payment history.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "uuid",
        "amount": 1890.00,
        "credits": 2100,
        "discount": 10,
        "status": "completed",
        "created_at": "2024-01-01T10:00:00Z"
      }
    ]
  }
}
```

---

## Invoice Endpoints

### GET /api/v1/invoices

Get list of invoices.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "uuid",
        "invoice_number": "INV-2024-001",
        "amount": 1890.00,
        "credits": 2100,
        "created_at": "2024-01-01T10:00:00Z"
      }
    ]
  }
}
```

### GET /api/v1/invoices/:invoiceId

Get invoice details.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "invoice_number": "INV-2024-001",
    "amount": 1890.00,
    "credits": 2100,
    "discount_percentage": 10,
    "user_email": "user@example.com",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

### GET /api/v1/invoices/:invoiceId/download

Download invoice as text file.

**Headers**: `Authorization: Bearer <token>`

**Response**: Text file download

---

## API Key Management Endpoints

### POST /api/v1/api-keys/generate

Generate a new API key.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "Production API Key"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "api_key": "tr_live_xxxxxxxxxxxxxxxxxx",
    "name": "Production API Key",
    "created_at": "2024-01-01T10:00:00Z"
  },
  "message": "Store this key securely. It won't be shown again."
}
```

### GET /api/v1/api-keys

List all API keys.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "api_keys": [
      {
        "id": "uuid",
        "name": "Production API Key",
        "key_preview": "tr_live_xxxx...xxxx",
        "last_used": "2024-01-01T12:00:00Z",
        "created_at": "2024-01-01T10:00:00Z",
        "is_active": true
      }
    ]
  }
}
```

### DELETE /api/v1/api-keys/:keyId

Revoke an API key.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

---

## Rate Limits

### Free Users
- 10 requests per minute
- 100 requests per hour
- 1000 requests per day

### Paid Users
- 60 requests per minute
- 1000 requests per hour
- 10000 requests per day

**Rate Limit Headers**:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1609459200
```

---

## Code Examples

### Python
```python
import requests

api_key = "tr_live_xxxxxxxxxx"
base_url = "https://api.trailroom.com"

headers = {
    "X-API-Key": api_key,
    "Content-Type": "application/json"
}

# Create try-on job
response = requests.post(
    f"{base_url}/api/v1/tryon",
    headers=headers,
    json={
        "mode": "top_only",
        "person_image": "base64_image...",
        "clothing_images": ["base64_image..."]
    }
)

job = response.json()["data"]
job_id = job["job_id"]

# Poll for result
import time
while True:
    response = requests.get(
        f"{base_url}/api/v1/tryon/{job_id}",
        headers=headers
    )
    job = response.json()["data"]
    
    if job["status"] == "completed":
        result_image = job["result_image"]
        break
    elif job["status"] == "failed":
        print("Generation failed")
        break
    
    time.sleep(5)
```

### JavaScript (Node.js)
```javascript
const axios = require('axios');

const apiKey = 'tr_live_xxxxxxxxxx';
const baseURL = 'https://api.trailroom.com';

const client = axios.create({
  baseURL,
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  }
});

// Create try-on job
const response = await client.post('/api/v1/tryon', {
  mode: 'top_only',
  person_image: 'base64_image...',
  clothing_images: ['base64_image...']
});

const jobId = response.data.data.job_id;

// Poll for result
const pollJob = async (jobId) => {
  while (true) {
    const response = await client.get(`/api/v1/tryon/${jobId}`);
    const job = response.data.data;
    
    if (job.status === 'completed') {
      return job.result_image;
    } else if (job.status === 'failed') {
      throw new Error('Generation failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
};

const resultImage = await pollJob(jobId);
```

### cURL
```bash
# Create try-on job
curl -X POST https://api.trailroom.com/api/v1/tryon \
  -H "X-API-Key: tr_live_xxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "top_only",
    "person_image": "base64_image...",
    "clothing_images": ["base64_image..."]
  }'

# Get job status
curl -X GET https://api.trailroom.com/api/v1/tryon/job_id \
  -H "X-API-Key: tr_live_xxxxxxxxxx"
```

---

**Last Updated**: December 2024
**API Version**: 1.0
