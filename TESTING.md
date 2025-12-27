# TrailRoom Testing Guide

## Overview

This document provides instructions for running tests in the TrailRoom platform.

## Test Structure

```
/app
├── backend/
│   └── tests/
│       ├── conftest.py           # Test configuration and fixtures
│       ├── test_auth.py          # Authentication tests
│       ├── test_credit_service.py # Credit service tests
│       ├── test_pricing_service.py # Pricing calculation tests
│       └── test_image_service.py  # Image validation tests
│
└── frontend/
    ├── jest.config.js             # Jest configuration
    ├── setupTests.js              # Test setup
    └── src/
        └── __tests__/
            ├── ImageUpload.test.js          # Component tests
            ├── ModeSelector.test.js         # Component tests
            ├── PricingCalculator.test.js    # Component tests
            └── Auth.integration.test.js     # Integration tests
```

## Backend Tests

### Setup

```bash
cd /app/backend
source venv/bin/activate  # If not already activated
pip install pytest pytest-asyncio pytest-cov
```

### Running Tests

**Run all tests:**
```bash
cd /app/backend
pytest
```

**Run with coverage:**
```bash
pytest --cov=. --cov-report=html
```

**Run specific test file:**
```bash
pytest tests/test_auth.py
```

**Run specific test:**
```bash
pytest tests/test_auth.py::TestPasswordUtils::test_hash_password
```

**Verbose output:**
```bash
pytest -v
```

### Test Files

#### 1. test_auth.py
Tests authentication services:
- Password hashing and verification
- JWT token generation and validation
- Token decoding

#### 2. test_credit_service.py
Tests credit management:
- Credit initialization
- Adding credits
- Deducting credits
- Insufficient balance handling
- Credit balance retrieval

#### 3. test_pricing_service.py
Tests pricing calculations:
- Discount calculation at various tiers
- Price calculation with discounts
- Linear interpolation for mid-range values

#### 4. test_image_service.py
Tests image processing:
- Base64 validation
- Base64 cleaning (removing data URL prefix)
- Image size extraction
- Size validation
- Format validation

### Expected Output

```
======== test session starts ========
platform linux -- Python 3.10.x
rootdir: /app/backend
collected 25 items

tests/test_auth.py ......          [ 24%]
tests/test_credit_service.py ..... [ 44%]
tests/test_pricing_service.py .... [ 60%]
tests/test_image_service.py ...... [100%]

======== 25 passed in 2.34s ========
```

---

## Frontend Tests

### Setup

```bash
cd /app/frontend
yarn install  # If not already installed
```

### Running Tests

**Run all tests:**
```bash
cd /app/frontend
yarn test
```

**Run in watch mode:**
```bash
yarn test --watch
```

**Run with coverage:**
```bash
yarn test --coverage
```

**Run specific test file:**
```bash
yarn test ImageUpload.test.js
```

**Update snapshots:**
```bash
yarn test -u
```

### Test Files

#### 1. ImageUpload.test.js
Tests ImageUpload component:
- Renders upload area
- Shows preview after selection
- Validates file size
- Accepts valid image formats

#### 2. ModeSelector.test.js
Tests ModeSelector component:
- Renders both mode options
- Displays credit cost
- Calls onSelect when mode selected
- Highlights selected mode

#### 3. PricingCalculator.test.js
Tests PricingCalculator component:
- Renders slider
- Displays credit amount
- Calculates price correctly
- Shows discount percentage
- Updates price when slider moves

#### 4. Auth.integration.test.js
Integration tests for authentication:
- Login form rendering and validation
- Registration form rendering and validation
- Form submission
- Password strength validation

### Expected Output

```
PASS  src/__tests__/ImageUpload.test.js
PASS  src/__tests__/ModeSelector.test.js
PASS  src/__tests__/PricingCalculator.test.js
PASS  src/__tests__/Auth.integration.test.js

Test Suites: 4 passed, 4 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        3.456 s
```

---

## End-to-End Testing

For comprehensive E2E testing, use the testing agents:

### Backend Testing

```bash
# Test backend APIs
deep_testing_backend_v2
```

The backend testing agent will:
- Test all API endpoints
- Verify authentication flows
- Test credit operations
- Validate payment processing
- Check try-on generation

### Frontend Testing

```bash
# Test UI flows
auto_frontend_testing_agent
```

The frontend testing agent will:
- Test user registration and login
- Verify dashboard navigation
- Test try-on generation flow
- Validate history page
- Test credit purchase flow

---

## Test Coverage Goals

### Backend
- **Target**: >80% coverage
- **Critical Services**: 100% coverage
  - Authentication
  - Credit management
  - Payment processing
  - Try-on generation

### Frontend
- **Target**: >70% coverage
- **Critical Components**: 100% coverage
  - Authentication forms
  - Try-on generation flow
  - Payment components

---

## Continuous Integration

### GitHub Actions (Template)

Create `.github/workflows/tests.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-asyncio pytest-cov
      - name: Run tests
        run: |
          cd backend
          pytest --cov=. --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          yarn install
      - name: Run tests
        run: |
          cd frontend
          yarn test --coverage
```

---

## Test Best Practices

### Backend Tests

1. **Use Fixtures**: Leverage pytest fixtures for common setup
2. **Async Tests**: Mark async tests with `@pytest.mark.asyncio`
3. **Mock External Services**: Mock AI APIs, payment gateways
4. **Clean Database**: Use test database that's cleaned before each test
5. **Test Edge Cases**: Include boundary conditions and error cases

### Frontend Tests

1. **Test User Behavior**: Focus on user interactions, not implementation
2. **Use Testing Library**: Prefer `getByRole`, `getByLabelText`
3. **Avoid Snapshots**: Use sparingly, prefer explicit assertions
4. **Mock API Calls**: Use `jest.mock` for axios
5. **Test Accessibility**: Ensure components are accessible

---

## Troubleshooting

### Backend Tests

**Issue**: Import errors
```bash
# Solution: Install package in editable mode
cd /app/backend
pip install -e .
```

**Issue**: MongoDB connection failed
```bash
# Solution: Use in-memory test database or mock
# Update conftest.py to use mongomock
```

**Issue**: Async tests hanging
```bash
# Solution: Check for missing await keywords
# Ensure event loop is properly configured
```

### Frontend Tests

**Issue**: Module not found
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules
yarn install
```

**Issue**: Tests timeout
```bash
# Solution: Increase timeout in jest.config.js
module.exports = {
  testTimeout: 10000
}
```

**Issue**: Enzyme vs Testing Library
```bash
# Solution: We use Testing Library (modern approach)
# Remove enzyme if present
```

---

## Manual Testing Checklist

Before deployment, manually verify:

### Authentication
- [ ] User can register with email/password
- [ ] User can login with email/password
- [ ] Google OAuth works
- [ ] JWT tokens are generated
- [ ] Protected routes require authentication

### Credits
- [ ] New users get 3 free credits
- [ ] Daily credits reset at midnight
- [ ] Credits can be purchased
- [ ] Credits are deducted on usage
- [ ] Transaction history is accurate

### Try-On Generation
- [ ] Can upload person image
- [ ] Can upload clothing images
- [ ] Top-only mode costs 1 credit
- [ ] Full-outfit mode costs 2 credits
- [ ] Generation completes successfully
- [ ] Result image displays correctly
- [ ] Failed jobs refund credits

### Payments
- [ ] Razorpay checkout opens
- [ ] Payment can be completed
- [ ] Credits are added after payment
- [ ] Invoice is generated
- [ ] Payment history is accurate

### UI/UX
- [ ] Dashboard loads correctly
- [ ] Navigation works
- [ ] Forms validate properly
- [ ] Error messages display
- [ ] Loading states work
- [ ] Responsive on mobile

---

## Performance Testing

### Load Testing

Use tools like:
- **Apache Bench**: `ab -n 1000 -c 10 http://localhost:8001/api/v1/auth/me`
- **Locust**: Python-based load testing
- **k6**: Modern load testing tool

### Benchmark Targets

- API response time: <200ms (p95)
- Page load time: <2s
- Try-on generation: <30s
- Database queries: <50ms

---

## Security Testing

### Checklist

- [ ] SQL injection prevention (MongoDB)
- [ ] XSS protection (input sanitization)
- [ ] CSRF protection (token validation)
- [ ] Authentication bypass attempts
- [ ] Authorization checks
- [ ] Rate limiting works
- [ ] API key validation
- [ ] Payment signature verification

### Tools

- **OWASP ZAP**: Web application security scanner
- **Bandit**: Python security linter
- **npm audit**: Frontend dependency vulnerabilities
- **Safety**: Python dependency vulnerabilities

---

## Monitoring in Production

### Metrics to Track

- Test coverage percentage
- Test execution time
- Flaky test rate
- Build success rate
- Deployment frequency

### Tools

- **Codecov**: Code coverage tracking
- **SonarQube**: Code quality and security
- **GitHub Actions**: CI/CD status
- **Sentry**: Error tracking in production

---

## Next Steps

After running tests:

1. **Fix Failing Tests**: Address any failures before deployment
2. **Improve Coverage**: Add tests for uncovered code
3. **Run E2E Tests**: Use testing agents for full flow validation
4. **Performance Test**: Load test with expected traffic
5. **Security Scan**: Run security checks
6. **Deploy**: Follow deployment guide

---

**Happy Testing! 🧪**

*Last Updated: December 2024*
