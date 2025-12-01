import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Interview } from '../stores/interviewStore';
import { useInterviewStore } from '../stores/interviewStore';
import interviewService from '../services/interviewService';
import Spinner from './common/Spinner';
import Card from './common/Card';

type StatusFilter = 'all' | 'pending' | 'in_progress' | 'completed';

export default function InterviewList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const {
    interviews,
    isLoadingInterviews,
    interviewsError,
    setInterviews,
    setLoadingInterviews,
    setInterviewsError,
  } = useInterviewStore();

  // Fetch interviews on mount
  useEffect(() => {
    const fetchInterviews = async () => {
      setLoadingInterviews(true);
      try {
        const data = await interviewService.getInterviews(
          statusFilter === 'all' ? undefined : statusFilter,
          50,
          0
        );
        setInterviews(Array.isArray(data) ? data : data.interviews || []);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to fetch interviews';
        setInterviewsError(message);
      }
    };

    fetchInterviews();
  }, [statusFilter, setInterviews, setLoadingInterviews, setInterviewsError]);

  const handleViewInterview = (interviewId: string) => {
    navigate(`/interviews/${interviewId}`);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (isLoadingInterviews) {
    return (
      <Card variant="elevated" padding="md">
        <div className="flex justify-center items-center py-12">
          <Spinner />
        </div>
      </Card>
    );
  }

  if (interviewsError) {
    return (
      <Card variant="elevated" padding="md">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error loading interviews</p>
          <p className="text-red-600 text-sm mt-1">{interviewsError}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="md">
      {/* Status Filter */}
      <div className="mb-6 flex gap-2">
        <label className="text-sm font-medium text-gray-700 self-center">
          Filter by status:
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Content */}
      {interviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📋</div>
          <p className="text-gray-600 font-medium">No interviews yet</p>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter === 'all'
              ? 'Create one to get started'
              : 'No interviews with this status'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Candidate
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Title
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Language
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Created
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((interview: Interview) => (
                <tr
                  key={interview.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewInterview(interview.id)}
                >
                  <td className="px-4 py-3 text-gray-900">{interview.candidateName}</td>
                  <td className="px-4 py-3 text-gray-600">{interview.title}</td>
                  <td className="px-4 py-3 text-gray-600">{interview.language}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        interview.status
                      )}`}
                    >
                      {getStatusLabel(interview.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(interview.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewInterview(interview.id);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
