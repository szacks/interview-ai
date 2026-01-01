# Task 8: Set up Zustand stores

## Completed Setup

### 1. Zustand Installation
- **Version**: zustand ^4.4.0
- **Added to**: `frontend/package.json` dependencies
- **Why Zustand**: Lightweight state management, minimal boilerplate, TypeScript support

### 2. Auth Store
**File**: `frontend/src/stores/authStore.ts`

**State**:
- `user` - Current logged-in user (User | null)
- `token` - JWT authentication token (string | null)
- `isLoading` - Loading state for auth operations
- `error` - Error message if any
- `isAuthenticated` - Boolean flag for auth status

**User Interface**:
```typescript
interface User {
  id: string;
  email: string;
  companyName?: string;
  role: string;
  avatar?: string;
}
```

**Actions**:
- `setUser(user)` - Set user data
- `setToken(token)` - Set auth token
- `setLoading(isLoading)` - Set loading state
- `setError(error)` - Set error message
- `setAuthenticated(authenticated)` - Set auth status
- `login(user, token)` - Combined login action
- `logout()` - Clear all auth data
- `updateUser(userData)` - Update user partial data
- `clearError()` - Clear error message

**Persistence**:
- Uses `persist` middleware
- Stores: user, token, isAuthenticated
- Storage key: 'auth-storage'
- Persists to localStorage automatically

### 3. Interview Store
**File**: `frontend/src/stores/interviewStore.ts`

**State**:
- `interviews` - List of all interviews
- `isLoadingInterviews` - Loading state for interviews
- `interviewsError` - Error for interviews list
- `currentInterview` - Currently selected interview
- `isLoadingCurrent` - Loading state for current interview
- `currentError` - Error for current interview
- `currentSession` - Active interview session
- `isSessionActive` - Session active flag
- `timeRemaining` - Countdown timer (seconds)

**Interfaces**:
```typescript
interface Interview {
  id: string;
  title: string;
  candidateName: string;
  candidateEmail: string;
  status: 'pending' | 'in_progress' | 'completed';
  language: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface InterviewSession {
  interviewId: string;
  candidateId: string;
  code: string;
  language: string;
  startedAt: string;
  messages: Array<{
    id: string;
    sender: 'user' | 'ai';
    content: string;
    timestamp: string;
  }>;
}
```

**Actions - List Management**:
- `setInterviews(interviews)` - Set all interviews
- `addInterview(interview)` - Add new interview to list
- `updateInterview(id, updates)` - Update interview by ID
- `removeInterview(id)` - Remove interview from list
- `setLoadingInterviews(loading)` - Set loading state
- `setInterviewsError(error)` - Set error message

**Actions - Current Interview**:
- `setCurrentInterview(interview)` - Set current interview
- `setLoadingCurrent(loading)` - Set loading state
- `setCurrentError(error)` - Set error message

**Actions - Session Management**:
- `startSession(session)` - Start interview session
- `endSession()` - End current session
- `updateCode(code)` - Update code in session
- `addMessage(sender, content)` - Add chat message
- `setTimeRemaining(time)` - Set countdown time
- `decrementTime()` - Decrement time by 1 second

**Actions - Utilities**:
- `reset()` - Reset all state to initial
- `clearErrors()` - Clear both error messages

### 4. Store Types
**File**: `frontend/src/types/store.ts`

Central export point for all store types:
- `AuthState`, `User`
- `InterviewState`, `Interview`, `InterviewSession`

## Usage Examples

### Using Auth Store

```typescript
import { useAuthStore } from '@/stores/authStore';

function LoginComponent() {
  const { login, logout, user, isAuthenticated, error } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      login(response.user, response.token);
    } catch (err) {
      // Error is caught and can be displayed
    }
  };

  return (
    <>
      {isAuthenticated && <p>Welcome, {user?.email}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={() => logout()}>Logout</button>
    </>
  );
}
```

### Using Interview Store

```typescript
import { useInterviewStore } from '@/stores/interviewStore';

function InterviewList() {
  const {
    interviews,
    isLoadingInterviews,
    setInterviews,
    addInterview
  } = useInterviewStore();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await interviewService.getInterviews();
        setInterviews(data.interviews);
      } catch (err) {
        // Handle error
      }
    };
    fetchInterviews();
  }, []);

  return (
    <>
      {isLoadingInterviews && <p>Loading...</p>}
      {interviews.map(interview => (
        <div key={interview.id}>{interview.title}</div>
      ))}
    </>
  );
}
```

### Managing Interview Session

```typescript
import { useInterviewStore } from '@/stores/interviewStore';

function InterviewRoom() {
  const {
    currentSession,
    timeRemaining,
    updateCode,
    addMessage,
    decrementTime,
    endSession
  } = useInterviewStore();

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      decrementTime();
    }, 1000);
    return () => clearInterval(interval);
  }, [decrementTime]);

  const handleCodeChange = (newCode: string) => {
    updateCode(newCode);
  };

  const handleSendMessage = (content: string) => {
    addMessage('user', content);
    // Send to AI and get response
  };

  return (
    <>
      <div>Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</div>
      <textarea value={currentSession?.code} onChange={(e) => handleCodeChange(e.target.value)} />
      {/* Chat UI */}
    </>
  );
}
```

## Store Architecture

### Separation of Concerns
- **authStore**: Handles all authentication-related state
- **interviewStore**: Manages interview data and session state
- Types are properly organized in `types/store.ts`

### Middleware
- **Auth Store**: Uses `persist` middleware for localStorage persistence
- **Interview Store**: No persistence (session-specific data)

### Selective Persistence
Auth store only persists:
- `user` - Keep user info
- `token` - Keep authentication token
- `isAuthenticated` - Keep auth flag

Excludes:
- `isLoading` - Not needed after reload
- `error` - Not needed after reload

## Best Practices Implemented

1. **Immutability**: All state updates create new objects
2. **Type Safety**: Full TypeScript support with interfaces
3. **Modular**: Separate stores for separate concerns
4. **Reusable**: Export types for use in components
5. **Performant**: Zustand ensures minimal re-renders
6. **Persistent**: Auth data survives page refreshes

## Integration with Services

Stores are designed to work with API services:

```typescript
// In components
const { setLoading, setError, setInterviews } = useInterviewStore();

const fetchInterviews = async () => {
  setLoading(true);
  try {
    const data = await interviewService.getInterviews();
    setInterviews(data.interviews);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

## File Structure
```
frontend/src/stores/
├── authStore.ts       # Authentication state management
└── interviewStore.ts  # Interview and session state

frontend/src/types/
└── store.ts          # Centralized store type exports
```

## Next Steps

1. Integrate stores with components
2. Create custom hooks for common store operations
3. Add error handling in components
4. Implement store devtools for debugging
5. Add loading skeletons based on loading states

## Status
✓ Zustand installed
✓ Auth store created with persistence
✓ Interview store created
✓ Types properly organized
✓ Ready for component integration
