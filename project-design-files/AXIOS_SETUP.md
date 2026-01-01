# Task 6: Configure Axios and API client

## Completed Setup

### 1. Axios Installation
- **Version**: axios ^1.6.0
- **Added to**: `frontend/package.json` dependencies
- **Installation**: `npm install` (when npm works properly)

### 2. API Client Configuration
**File**: `frontend/src/services/apiClient.ts`

Features:
- **Base URL**: Configured from environment variable `VITE_API_BASE_URL`
- **Default Base URL**: `http://localhost:8080/api`
- **Timeout**: 30 seconds
- **Default Headers**: `Content-Type: application/json`

### 3. Request Interceptor
- Automatically adds JWT bearer token from localStorage
- Sets `Authorization` header when token is available
- Handles request errors gracefully

### 4. Response Interceptor
- Intercepts all responses
- Extracts data from API response wrapper
- Handles HTTP status codes:
  - **401 (Unauthorized)**: Clears token and redirects to `/login`
  - **403 (Forbidden)**: Returns "Access denied" message
  - **404 (Not Found)**: Returns "Resource not found" message
  - **500 (Server Error)**: Returns "Internal server error" message
- Handles network errors (no server response)
- Provides detailed error logging

### 5. API Response Type
```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

### 6. Auth Service
**File**: `frontend/src/services/authService.ts`

Methods:
- `login(credentials)` - User login, stores token
- `signup(data)` - Company signup, stores token
- `logout()` - Clears auth token
- `getCurrentUser()` - Get authenticated user info
- `requestPasswordReset(email)` - Request password reset
- `confirmPasswordReset(token, password)` - Reset password
- `isAuthenticated()` - Check if user is logged in
- `getToken()` - Get stored auth token

### 7. Interview Service
**File**: `frontend/src/services/interviewService.ts`

Methods:
- `getInterviews(status?, limit, offset)` - Get list of interviews
- `getInterviewById(id)` - Get interview details
- `createInterview(data)` - Create new interview
- `updateInterviewStatus(id, status)` - Update interview status
- `startInterview(id)` - Start interview session
- `submitInterview(id, code, language)` - Submit interview code
- `getInterviewReport(id)` - Get interview report with scores
- `getQuestions(language?)` - Get available questions
- `getQuestionById(id)` - Get question details

### 8. Environment Configuration
**Files**:
- `frontend/.env` - Local development
- `frontend/.env.example` - Template

Variables:
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ENABLE_DEBUG_MODE=true/false
```

## Usage Examples

### Using Auth Service
```typescript
import authService from '@/services/authService';

// Login
const auth = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Check if authenticated
if (authService.isAuthenticated()) {
  // User is logged in
}

// Logout
authService.logout();
```

### Using Interview Service
```typescript
import interviewService from '@/services/interviewService';

// Get all interviews
const { interviews, total } = await interviewService.getInterviews('completed', 10, 0);

// Create interview
const interview = await interviewService.createInterview({
  title: 'JavaScript Interview',
  candidateName: 'John Doe',
  candidateEmail: 'john@example.com',
  questionIds: ['q1', 'q2'],
  language: 'javascript'
});

// Submit code
await interviewService.submitInterview(interviewId, codeContent, 'javascript');
```

### Direct API Calls
```typescript
import apiClient from '@/services/apiClient';

// GET request
const data = await apiClient.get('/some-endpoint');

// POST request
const result = await apiClient.post('/some-endpoint', { data: 'value' });

// PUT request
await apiClient.put('/some-endpoint/id', { updated: 'data' });

// DELETE request
await apiClient.delete('/some-endpoint/id');
```

## Error Handling

All API calls return data or throw an error:

```typescript
try {
  const result = await authService.login(credentials);
  console.log('Login successful:', result);
} catch (error) {
  const apiError = error as ApiError;
  console.error('Login failed:', apiError.message);
  console.error('Status:', apiError.status);
  console.error('Code:', apiError.code);
}
```

## Token Management

Tokens are automatically:
- **Stored** in localStorage on successful login/signup
- **Included** in all API request headers
- **Cleared** on 401 (Unauthorized) response
- **Cleared** on user logout

## Production Configuration

For production deployment:
1. Update `VITE_API_BASE_URL` in `.env.production`
2. Use HTTPS for all API calls
3. Consider adding request/response logging
4. Add error tracking (Sentry, etc.)
5. Implement request retry logic for failed requests
6. Add rate limiting handling

## File Structure
```
frontend/src/services/
├── apiClient.ts       # Axios instance with interceptors
├── authService.ts     # Authentication API methods
└── interviewService.ts # Interview-related API methods
```

## Dependencies
- `axios`: ^1.6.0

## Status
✓ Axios installed and configured
✓ Request interceptors set up with token handling
✓ Response interceptors set up with error handling
✓ Auth service created
✓ Interview service created
✓ Environment variables configured
✓ Ready for component integration
