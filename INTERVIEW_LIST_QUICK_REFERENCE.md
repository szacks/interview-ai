# Interview List Component - Quick Reference

## Import
```typescript
import { InterviewListComponent } from "@/components/InterviewListComponent"
```

## Basic Usage
```typescript
<InterviewListComponent
  interviews={interviews}
/>
```

## With Custom Handlers
```typescript
<InterviewListComponent
  interviews={interviews}
  onCopyLink={(token) => console.log("Copied:", token)}
  onDeleteInterview={(id) => console.log("Delete:", id)}
/>
```

## Props Quick Lookup

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `interviews` | `Interview[]` | ✅ Yes | - |
| `onCopyLink` | `(token: string) => void` | ❌ No | Built-in |
| `onDeleteInterview` | `(id: number) => void` | ❌ No | None |
| `onEndInterview` | `(id: number) => void` | ❌ No | None |
| `onViewResults` | `(id: number) => void` | ❌ No | None |
| `isLoading` | `boolean` | ❌ No | `false` |
| `emptyMessage` | `string` | ❌ No | "No interviews to display" |

## Interview Type
```typescript
interface Interview {
  id: number
  candidateName: string
  role: string
  questionTitle: string
  status: "pending" | "live" | "ended"
  createdAt: string
  startedAt?: string
  endedAt?: string
  token: string
}
```

## Status Badge Styles

### Live Status
```
🔴 Live  (with pulse animation)
```
- Color: Accent (primary brand color)
- Icon: Animated dot
- Animation: Pulsing effect

### Pending Status
```
⏱️ Pending
```
- Color: Muted outline
- Icon: Clock
- Animation: None

### Ended Status
```
✓ Ended
```
- Color: Secondary
- Icon: Check circle
- Animation: None

## Action Buttons

### For Pending Interviews
```
[📋 Copy Link]  [▶️ Start]  [⋮]
```

### For Live Interviews
```
[👁️ View Live]  [⋮]
```

### For Ended Interviews
```
[👁️ View Results]
```

## Dropdown Menu Options

### Pending → Delete Option
```
Delete (destructive red text)
```

### Live → End Option
```
End Interview (destructive red text)
```

## Common Patterns

### Pattern 1: Display List with Default Behavior
```typescript
<InterviewListComponent
  interviews={mockInterviews}
/>
```

### Pattern 2: Dashboard with Filters
```typescript
<InterviewListComponent
  interviews={filteredInterviews}
  onCopyLink={copyToClipboard}
  emptyMessage={
    hasActiveFilters
      ? "No interviews match your filters"
      : "Create your first interview"
  }
/>
```

### Pattern 3: Admin Panel with Full Control
```typescript
<InterviewListComponent
  interviews={adminInterviews}
  onCopyLink={(token) => copyAndNotify(token)}
  onDeleteInterview={(id) => confirmDelete(id)}
  onEndInterview={(id) => endAndNotify(id)}
  onViewResults={(id) => navigate(`/results/${id}`)}
  isLoading={isLoading}
  emptyMessage="No interviews in the system"
/>
```

### Pattern 4: Read-Only View
```typescript
<InterviewListComponent
  interviews={candidateInterviews}
  emptyMessage="You haven't been assigned any interviews"
/>
```

### Pattern 5: With Loading State
```typescript
<InterviewListComponent
  interviews={interviews}
  isLoading={isFetching}
  emptyMessage="Loading interviews..."
/>
```

## CSS Classes Applied

### Card Container
```
rounded-lg border border-border bg-card p-4
hover:border-primary/50 transition-colors
```

### Candidate Name
```
font-semibold text-lg truncate
```

### Metadata
```
text-sm text-muted-foreground font-medium
```

### Status Badge
- Live: `bg-accent text-accent-foreground`
- Pending: `border-muted-foreground/30 text-muted-foreground`
- Ended: Secondary variant colors

## Icon Types (from lucide-react)

| Icon | Used For |
|------|----------|
| `Clock` | Pending status |
| `CheckCircle2` | Ended status |
| `Copy` | Copy link button |
| `Play` | Start interview button |
| `Eye` | View live/results button |
| `Trash2` | Delete option |
| `XCircle` | End interview option |
| `MoreVertical` | Dropdown menu trigger |
| `Zap` | Empty state icon |

## Responsive Behavior

### Mobile (<768px)
- Stack buttons vertically
- Full-width action buttons
- Proper touch target sizes (min 44px)

### Tablet (768px - 1024px)
- Horizontal button layout
- Optimized spacing
- Flexbox adapts automatically

### Desktop (>1024px)
- Full horizontal layout
- Maximum 6xl width constraint
- Optimized whitespace

## Event Handlers

### Copy Link Handler
```typescript
const handleCopyLink = (token: string) => {
  navigator.clipboard.writeText(`${window.location.origin}/i/${token}`)
}
```

### Delete Handler
```typescript
const handleDelete = async (id: number) => {
  const confirmed = confirm("Delete this interview?")
  if (confirmed) {
    await api.delete(`/interviews/${id}`)
  }
}
```

### End Interview Handler
```typescript
const handleEnd = async (id: number) => {
  await api.post(`/interviews/${id}/end`)
  showNotification("Interview ended")
}
```

### View Results Handler
```typescript
const handleViewResults = (id: number) => {
  navigate(`/interviews/${id}/results`)
}
```

## Error Handling Patterns

### With Error Boundary
```typescript
<ErrorBoundary fallback={<ErrorMessage />}>
  <InterviewListComponent interviews={interviews} />
</ErrorBoundary>
```

### With Try-Catch in Handler
```typescript
const handleDelete = async (id: number) => {
  try {
    await api.delete(`/interviews/${id}`)
    setInterviews(interviews.filter(i => i.id !== id))
  } catch (error) {
    showError("Failed to delete interview")
  }
}
```

## Styling Customization

### Modify Card Styling
Add custom className to parent container:
```typescript
<div className="bg-slate-50">
  <InterviewListComponent interviews={interviews} />
</div>
```

### Customize Empty State Icon
The component uses `Zap` icon. For different icon, you'd need to modify the component source.

## Performance Tips

1. **Memoize your data**:
   ```typescript
   const memoizedInterviews = useMemo(() => {
     return filterInterviews(interviews, filters)
   }, [interviews, filters])

   <InterviewListComponent interviews={memoizedInterviews} />
   ```

2. **Debounce filter changes**:
   ```typescript
   const debouncedSearch = useCallback(
     debounce((query) => setSearchQuery(query), 300),
     []
   )
   ```

3. **Virtual scrolling** (for large lists):
   ```typescript
   // Consider using react-window for 100+ items
   import { FixedSizeList } from 'react-window'
   ```

## Testing Examples

### Render Component
```typescript
render(<InterviewListComponent interviews={mockData} />)
```

### Test Badge Display
```typescript
expect(screen.getByText("Live")).toBeInTheDocument()
```

### Test Empty State
```typescript
render(<InterviewListComponent interviews={[]} />)
expect(screen.getByText(/no interviews/i)).toBeInTheDocument()
```

### Test Callback
```typescript
const mockCallback = jest.fn()
const { getByText } = render(
  <InterviewListComponent
    interviews={mockData}
    onDeleteInterview={mockCallback}
  />
)
userEvent.click(getByText("Delete"))
expect(mockCallback).toHaveBeenCalled()
```

## Accessibility Features

- ✅ Semantic HTML
- ✅ Proper heading hierarchy
- ✅ Icon + text combinations
- ✅ Keyboard navigation support
- ✅ ARIA labels where needed
- ✅ Color contrast WCAG 2.1 AA

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Android (latest)

## Troubleshooting

### Issue: Type errors with status
**Solution**: Ensure status is one of: `"pending" | "live" | "ended"`

### Issue: Buttons not responding
**Solution**: Verify callback functions are properly passed as props

### Issue: Empty state not showing
**Solution**: Ensure `interviews` array is truly empty `[]`

### Issue: Copy button not working
**Solution**: Check browser supports Clipboard API (all modern browsers do)

### Issue: Links not working
**Solution**: Ensure React Router is properly configured in parent app

## Related Documentation
- Full docs: `TASK_32_INTERVIEW_LIST_COMPONENT.md`
- Completion summary: `TASK_32_COMPLETION_SUMMARY.md`
- Component source: `frontend/src/components/InterviewListComponent.tsx`
- Dashboard usage: `frontend/src/pages/DashboardPage.tsx`

## Version Info
- **Created**: Task 32 Implementation
- **Framework**: React 18+
- **UI Library**: shadcn/ui
- **Icons**: lucide-react
- **Status**: Production Ready ✅
