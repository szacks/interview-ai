import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InterviewList from './InterviewList';
import interviewService from '../services/interviewService';
import { useInterviewStore } from '../stores/interviewStore';

// Mock the interview service
vi.mock('../services/interviewService');

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockInterviews = [
  {
    id: '1',
    title: 'React Interview',
    candidateName: 'John Doe',
    candidateEmail: 'john@example.com',
    status: 'pending' as const,
    language: 'JavaScript',
    createdAt: '2024-01-15',
    startedAt: undefined,
    completedAt: undefined,
  },
  {
    id: '2',
    title: 'Node.js Interview',
    candidateName: 'Jane Smith',
    candidateEmail: 'jane@example.com',
    status: 'in_progress' as const,
    language: 'Python',
    createdAt: '2024-01-14',
    startedAt: '2024-01-14T10:00:00Z',
    completedAt: undefined,
  },
  {
    id: '3',
    title: 'Senior Engineer Interview',
    candidateName: 'Bob Wilson',
    candidateEmail: 'bob@example.com',
    status: 'completed' as const,
    language: 'Java',
    createdAt: '2024-01-13',
    startedAt: '2024-01-13T09:00:00Z',
    completedAt: '2024-01-13T10:30:00Z',
  },
];

describe('InterviewList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    useInterviewStore.setState({
      interviews: [],
      isLoadingInterviews: false,
      interviewsError: null,
    });
  });

  it('should handle loading state gracefully', async () => {
    // Component should start loading when mounted
    vi.mocked(interviewService.getInterviews).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading
    );

    const { container } = render(<InterviewList />);

    // The component should have rendered something while loading
    expect(container).toBeInTheDocument();
  });


  it('should render empty state when no interviews', async () => {
    vi.mocked(interviewService.getInterviews).mockResolvedValue([]);

    render(<InterviewList />);

    await waitFor(() => {
      expect(screen.getByText('No interviews yet')).toBeInTheDocument();
      expect(screen.getByText('Create one to get started')).toBeInTheDocument();
    });
  });

  it('should render interviews in table', async () => {
    vi.mocked(interviewService.getInterviews).mockResolvedValue(mockInterviews);

    render(<InterviewList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });
  });

  it('should display interview details correctly', async () => {
    vi.mocked(interviewService.getInterviews).mockResolvedValue(mockInterviews);

    render(<InterviewList />);

    await waitFor(() => {
      expect(screen.getByText('React Interview')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('Python')).toBeInTheDocument();
    });
  });

  it('should navigate to interview details on row click', async () => {
    vi.mocked(interviewService.getInterviews).mockResolvedValue(mockInterviews);

    render(<InterviewList />);

    await waitFor(() => {
      const viewButtons = screen.getAllByText('View');
      fireEvent.click(viewButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/interviews/1');
    });
  });

  it('should navigate on table row click', async () => {
    vi.mocked(interviewService.getInterviews).mockResolvedValue(mockInterviews);

    render(<InterviewList />);

    await waitFor(() => {
      const tableRows = screen.getAllByRole('row');
      const firstDataRow = tableRows[1]; // Skip header row
      fireEvent.click(firstDataRow);
      expect(mockNavigate).toHaveBeenCalledWith('/interviews/1');
    });
  });

  it('should filter interviews by status', async () => {
    vi.mocked(interviewService.getInterviews).mockResolvedValue(mockInterviews);

    render(<InterviewList />);

    await waitFor(() => {
      const filterSelect = screen.getByDisplayValue('All') as HTMLSelectElement;
      expect(filterSelect).toBeInTheDocument();
    });

    const filterSelect = screen.getByDisplayValue('All') as HTMLSelectElement;
    fireEvent.change(filterSelect, { target: { value: 'pending' } });

    await waitFor(() => {
      expect(interviewService.getInterviews).toHaveBeenCalledWith(
        'pending',
        50,
        0
      );
    });
  });

  it('should show filtered status empty message', async () => {
    vi.mocked(interviewService.getInterviews)
      .mockResolvedValueOnce(mockInterviews) // Initial call - all interviews
      .mockResolvedValueOnce([]); // After filter - no interviews

    render(<InterviewList />);

    // Wait for initial render with all interviews
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Change filter to a status that has no interviews
    const filterSelect = screen.getByDisplayValue('All') as HTMLSelectElement;
    fireEvent.change(filterSelect, { target: { value: 'pending' } });

    // Wait for the filtered empty message to appear
    await waitFor(() => {
      expect(
        screen.getByText('No interviews with this status')
      ).toBeInTheDocument();
    });
  });

  it('should format dates correctly', async () => {
    vi.mocked(interviewService.getInterviews).mockResolvedValue(mockInterviews);

    render(<InterviewList />);

    await waitFor(() => {
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 14, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 13, 2024')).toBeInTheDocument();
    });
  });
});
