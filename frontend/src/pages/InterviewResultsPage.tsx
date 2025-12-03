import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Star, Download, Share2, ArrowLeft } from 'lucide-react';

interface EvaluationCriteria {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}

interface InterviewResult {
  interviewId: string;
  candidateName: string;
  role: string;
  questionTitle: string;
  duration: number;
  submittedAt: Date;
  overallScore: number;
  maxScore: number;
  criteria: EvaluationCriteria[];
  code: string;
  aiReview?: string;
}

export default function InterviewResultsPage() {
  const { interviewId } = useParams();
  const [result] = useState<InterviewResult>({
    interviewId: interviewId || '',
    candidateName: 'John Doe',
    role: 'Senior Developer',
    questionTitle: 'URL Shortener System',
    duration: 45,
    submittedAt: new Date('2025-01-25T14:30:00'),
    overallScore: 85,
    maxScore: 100,
    criteria: [
      {
        name: 'Problem Understanding',
        score: 9,
        maxScore: 10,
        feedback: 'Candidate demonstrated excellent understanding of requirements',
      },
      {
        name: 'Code Quality',
        score: 8,
        maxScore: 10,
        feedback: 'Well-structured code with minor style improvements possible',
      },
      {
        name: 'Algorithm Efficiency',
        score: 8,
        maxScore: 10,
        feedback: 'Good O(1) implementation, considered edge cases',
      },
      {
        name: 'Communication',
        score: 9,
        maxScore: 10,
        feedback: 'Clear explanation and good interaction with interviewer',
      },
      {
        name: 'Problem-Solving Approach',
        score: 7,
        maxScore: 10,
        feedback: 'Could have explored alternative solutions',
      },
    ],
    code: `function urlShortener() {
  const urlMap = new Map();
  let counter = 1;

  return {
    shorten: (url) => {
      const shortCode = \`short_\${counter++}\`;
      urlMap.set(shortCode, url);
      return shortCode;
    },
    expand: (shortCode) => urlMap.get(shortCode)
  };
}`,
    aiReview:
      'The candidate provided a solid implementation of a URL shortening service. The use of a Map data structure is appropriate for this use case. The code is clean and readable. Consider adding input validation and handling edge cases like duplicate URLs.',
  });

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return 'default';
    if (percentage >= 70) return 'secondary';
    if (percentage >= 50) return 'outline';
    return 'destructive';
  };

  const renderStars = (score: number, maxScore: number) => {
    const filledStars = Math.round((score / maxScore) * 5);
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < filledStars
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2">Interview Results</h1>
          <p className="text-muted-foreground">
            Comprehensive evaluation and feedback for the completed interview
          </p>
        </div>

        {/* Candidate Info */}
        <Card className="mb-6 p-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Candidate</div>
              <div className="font-semibold">{result.candidateName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Position</div>
              <div className="font-semibold">{result.role}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Question</div>
              <div className="font-semibold">{result.questionTitle}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Duration</div>
              <div className="font-semibold">{result.duration} minutes</div>
            </div>
          </div>
        </Card>

        {/* Overall Score */}
        <Card className="mb-6 p-8 text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <h2 className="text-lg text-muted-foreground mb-2">Overall Score</h2>
          <div
            className={`text-6xl font-bold mb-4 ${getScoreColor(
              result.overallScore,
              result.maxScore
            )}`}
          >
            {result.overallScore}/{result.maxScore}
          </div>
          <div className="flex justify-center mb-4">
            {renderStars(result.overallScore, result.maxScore)}
          </div>
          <Badge variant={getScoreBadgeVariant(result.overallScore, result.maxScore)}>
            {result.overallScore >= 85
              ? 'Excellent'
              : result.overallScore >= 70
              ? 'Good'
              : result.overallScore >= 50
              ? 'Fair'
              : 'Needs Improvement'}
          </Badge>
        </Card>

        {/* Evaluation Criteria */}
        <Card className="mb-6 p-6">
          <h3 className="text-2xl font-bold mb-6">Evaluation Breakdown</h3>
          <div className="space-y-6">
            {result.criteria.map((criterion, index) => (
              <div key={index} className="border-b border-border last:border-b-0 pb-6 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-lg">{criterion.name}</h4>
                  <Badge variant="outline">
                    {criterion.score}/{criterion.maxScore}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mb-4 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      criterion.score / criterion.maxScore >= 0.85
                        ? 'bg-green-500'
                        : criterion.score / criterion.maxScore >= 0.7
                        ? 'bg-blue-500'
                        : criterion.score / criterion.maxScore >= 0.5
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${(criterion.score / criterion.maxScore) * 100}%`,
                    }}
                  />
                </div>

                {/* Feedback */}
                <p className="text-sm text-muted-foreground">{criterion.feedback}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Code Submission */}
        <Card className="mb-6 p-6">
          <h3 className="text-2xl font-bold mb-4">Submitted Code</h3>
          <div className="bg-muted p-4 rounded-lg overflow-auto max-h-64">
            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
              {result.code}
            </pre>
          </div>
        </Card>

        {/* AI Review */}
        {result.aiReview && (
          <Card className="mb-6 p-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
            <h3 className="text-2xl font-bold mb-4">AI Review</h3>
            <p className="text-foreground leading-relaxed">{result.aiReview}</p>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share Results
          </Button>
          <Button className="gap-2">Send Feedback to Candidate</Button>
        </div>
      </div>
    </div>
  );
}
