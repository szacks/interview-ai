# Task 48: Build AI Chat Interface with shadcn/ui - Implementation Plan

## Current State Analysis

### Frontend - What Exists
- ✅ Chat UI components already built in both interview pages:
  - Candidate page (`/app/i/[token]/page.tsx`): Full chat sidebar (lines 294-357)
  - Interviewer page (`/app/interview/[id]/page.tsx`): Chat sidebar display
- ✅ shadcn/ui components already in use: Button, Input, Badge, Select, Textarea
- ✅ Mock chat data with timestamps and role differentiation
- ✅ Message input with "Enter key send" functionality
- ✅ Visual styling: role-based colors, icons (Terminal for candidate, MessageSquare for AI)
- ✅ State management: Zustand (authStore.ts)
- ✅ HTTP client: Axios (apiClient.ts)
- ✅ Monaco Editor for code display

### Backend - What Exists
- ✅ WebSocket infrastructure configured
- ✅ ChatMessageDTO for message structure
- ✅ MessageController with @MessageMapping for chat routing
- ✅ Claude API integration (ClaudeService.java) - currently only for post-interview evaluation
- ✅ WebSocket topics: `/topic/interview/{interviewId}/chat`
- ✅ STOMP endpoints configured

### What's Missing (Task 48 Scope)

1. **Frontend Chat Service** (`services/aiChatService.ts`)
   - Service to send chat messages to backend
   - Service to handle AI response reception
   - Real-time message synchronization

2. **Frontend Chat Store** (`stores/chatStore.ts`)
   - Zustand store for chat state management
   - Chat history management
   - Loading states for AI responses
   - Message persistence per interview

3. **Backend AI Response Handler**
   - New endpoint or service to handle real-time chat with Claude
   - Integration with ClaudeService for live chat (not just evaluation)
   - Convert chat message to Claude API call and stream/return response
   - Message storage/persistence

4. **WebSocket Chat Integration (Frontend)**
   - Connect to WebSocket on interview page mount
   - Subscribe to chat topic
   - Publish messages to backend
   - Display AI responses in real-time

5. **API Endpoint (Backend)**
   - REST endpoint: `POST /api/ai/chat` (from MVP.md line 578)
   - Takes candidate question, returns AI response
   - Uses Claude Haiku 4.5 model
   - Integrates with interview context

6. **Enhanced shadcn/ui Components**
   - Scroll Area for message container
   - Skeleton loader for loading messages
   - Toast notifications for connection status
   - Avatar component for sender identification

## Implementation Strategy

### Phase 1: Backend AI Chat Service
1. Create `ChatService.java` with method to handle live chat messages
2. Add Claude integration for candidate questions (not just post-interview)
3. Create `POST /api/ai/chat` REST endpoint
4. Add chat message persistence (if needed)
5. Implement message broadcasting via WebSocket

### Phase 2: Frontend Services & Stores
1. Create `aiChatService.ts` - HTTP client for chat API
2. Create `chatStore.ts` - Zustand store for chat state
3. Types definition for chat messages
4. Error handling and retry logic

### Phase 3: WebSocket Integration
1. Create `webSocketService.ts` for real-time communication
2. Implement subscription to chat topics
3. Handle message publishing
4. Connection lifecycle management

### Phase 4: Frontend UI Enhancement
1. Refactor chat components to use new services and stores
2. Integrate shadcn/ui Scroll Area for better UX
3. Add loading states with Skeleton components
4. Add connection status indicators
5. Implement message timestamp formatting

### Phase 5: Testing & Polish
1. Test real-time message flow
2. Test error scenarios and reconnection
3. Verify AI responses are properly formatted
4. UI polish and accessibility

## Key Design Decisions

### Architecture Pattern
- **Store**: Zustand for client-side state (messages, loading, etc.)
- **Service**: Axios for REST API calls
- **Real-time**: WebSocket STOMP for message broadcasting
- **UI**: shadcn/ui components with Tailwind CSS

### Message Flow
1. Candidate types message in UI
2. Frontend sends to `POST /api/ai/chat` endpoint
3. Backend calls Claude API
4. Response sent back to candidate + broadcast to interviewer via WebSocket
5. Frontend updates chat store and re-renders

### Error Handling
- Network error recovery
- Claude API timeout handling
- WebSocket reconnection logic
- User-friendly error messages with toast notifications

### Performance Considerations
- Message pagination for long conversations
- Virtual scrolling for large message lists
- Debounced message input (if needed)
- Lazy load chat history

## Files to Create/Modify

### Create (New)
- `/frontend/services/aiChatService.ts` - AI chat HTTP service
- `/frontend/stores/chatStore.ts` - Chat state management
- `/frontend/services/webSocketService.ts` - WebSocket wrapper
- `/frontend/types/chat.ts` - Chat type definitions
- `/backend/src/main/java/.../service/ChatService.java` - Backend chat service
- `/backend/src/main/java/.../controller/ChatController.java` - Chat REST endpoint
- `/backend/src/main/java/.../dto/ChatResponse.java` - Response DTO

### Modify (Existing)
- `/frontend/app/i/[token]/page.tsx` - Wire chat to store/services
- `/frontend/app/interview/[id]/page.tsx` - Wire chat to store/services
- `/backend/src/main/java/.../config/WebSocketConfig.java` - Ensure proper configuration

## shadcn/ui Components to Leverage
- Button - for send button
- Input - for message input
- Textarea - for multi-line messages (optional)
- Scroll Area - for message container
- Skeleton - for loading states
- Toast/Toaster - for notifications
- Avatar - for sender indication
- Badge - for message status

## Dependencies Already Available
✅ axios (HTTP client)
✅ zustand (State management)
✅ socket.io-client (WebSocket - version 4.6.0 in package.json)
✅ shadcn/ui components (all available)
✅ lucide-react (Icons)
✅ TypeScript (Type safety)

## Success Criteria
1. Users can send messages to AI assistant
2. AI responds with helpful suggestions/clarifications
3. Both candidate and interviewer see the conversation in real-time
4. Messages are timestamped and properly attributed
5. UI handles loading, error, and connection states gracefully
6. Conversation persists for interview session
7. Responsive on all screen sizes

## Estimated Complexity
- **Frontend**: Medium (stores, services, WebSocket integration)
- **Backend**: Medium (Claude integration for chat, endpoint, message handling)
- **Total Effort**: ~4-6 hours for complete implementation

