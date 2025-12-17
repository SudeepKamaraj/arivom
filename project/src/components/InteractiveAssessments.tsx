import React, { useState, useEffect } from 'react';
import { Code, Upload, CheckCircle, Users, Play, Pause, RotateCcw, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface InteractiveAssessment {
  id: string;
  title: string;
  type: 'coding' | 'project' | 'peer-review' | 'live-coding' | 'presentation';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // minutes
  points: number;
  description: string;
  requirements: string[];
  testCases?: TestCase[];
  submissionFormat: string;
  allowedLanguages?: string[];
  peerReviewRequired: boolean;
  maxSubmissions: number;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface Submission {
  id: string;
  assessmentId: string;
  userId: string;
  code?: string;
  files?: File[];
  submittedAt: Date;
  status: 'pending' | 'passed' | 'failed' | 'reviewing';
  score: number;
  feedback: string;
  testResults?: TestResult[];
  peerReviews?: PeerReview[];
}

interface TestResult {
  testCase: TestCase;
  passed: boolean;
  actualOutput: string;
  executionTime: number;
}

interface PeerReview {
  reviewerId: string;
  reviewerName: string;
  rating: number;
  feedback: string;
  submittedAt: Date;
}

const InteractiveAssessments: React.FC<{ courseId: string }> = ({ courseId }) => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<InteractiveAssessment[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<InteractiveAssessment | null>(null);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    loadAssessments();
    loadSubmissions();
  }, [courseId]);

  // Timer logic
  useEffect(() => {
    let interval: number;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isRunning) {
      handleAutoSubmit();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  const loadAssessments = () => {
    const mockAssessments: InteractiveAssessment[] = [
      {
        id: '1',
        title: 'Algorithm Challenge: Binary Search',
        type: 'coding',
        difficulty: 'medium',
        timeLimit: 60,
        points: 100,
        description: 'Implement a binary search algorithm that finds the target element in a sorted array.',
        requirements: [
          'Time complexity must be O(log n)',
          'Handle edge cases (empty array, element not found)',
          'Return the index of the target element or -1 if not found'
        ],
        testCases: [
          { input: '[1,2,3,4,5], 3', expectedOutput: '2', isHidden: false },
          { input: '[1,2,3,4,5], 6', expectedOutput: '-1', isHidden: false },
          { input: '[], 1', expectedOutput: '-1', isHidden: true }
        ],
        submissionFormat: 'code',
        allowedLanguages: ['javascript', 'python', 'java', 'cpp'],
        peerReviewRequired: false,
        maxSubmissions: 3
      },
      {
        id: '2',
        title: 'React Component Project',
        type: 'project',
        difficulty: 'hard',
        timeLimit: 180,
        points: 200,
        description: 'Build a complete React todo application with advanced features.',
        requirements: [
          'Use React hooks (useState, useEffect, custom hooks)',
          'Implement CRUD operations',
          'Add drag-and-drop functionality',
          'Include local storage persistence',
          'Write unit tests for components'
        ],
        submissionFormat: 'files',
        allowedLanguages: ['javascript', 'typescript'],
        peerReviewRequired: true,
        maxSubmissions: 2
      },
      {
        id: '3',
        title: 'Live Coding Interview Simulation',
        type: 'live-coding',
        difficulty: 'hard',
        timeLimit: 45,
        points: 150,
        description: 'Solve coding problems in a simulated interview environment with AI interviewer.',
        requirements: [
          'Think out loud while coding',
          'Explain your approach before coding',
          'Handle follow-up questions',
          'Optimize your solution'
        ],
        submissionFormat: 'live',
        allowedLanguages: ['javascript', 'python'],
        peerReviewRequired: false,
        maxSubmissions: 1
      }
    ];
    setAssessments(mockAssessments);
  };

  const loadSubmissions = () => {
    // Load user's previous submissions
    const mockSubmissions: Submission[] = [
      {
        id: '1',
        assessmentId: '1',
        userId: (user as any)?.id || 'user1',
        code: 'function binarySearch(arr, target) { /* implementation */ }',
        submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'passed',
        score: 85,
        feedback: 'Good implementation! Consider adding more comments.',
        testResults: []
      }
    ];
    setSubmissions(mockSubmissions);
  };

  const startAssessment = (assessment: InteractiveAssessment) => {
    setActiveAssessment(assessment);
    setTimeRemaining(assessment.timeLimit * 60);
    setIsRunning(true);
    setCode(getStarterCode(assessment));
  };

  const getStarterCode = (assessment: InteractiveAssessment) => {
    if (assessment.type === 'coding') {
      switch (selectedLanguage) {
        case 'javascript':
          return `// ${assessment.title}\n// ${assessment.description}\n\nfunction solution() {\n    // Your code here\n}\n\n// Test your solution\nconsole.log(solution());`;
        case 'python':
          return `# ${assessment.title}\n# ${assessment.description}\n\ndef solution():\n    # Your code here\n    pass\n\n# Test your solution\nprint(solution())`;
        default:
          return '// Start coding here...';
      }
    }
    return '';
  };

  const runCode = async () => {
    if (!activeAssessment) return;

    // Simulate code execution
    const mockResults: TestResult[] = activeAssessment.testCases?.map(testCase => ({
      testCase,
      passed: Math.random() > 0.3, // 70% pass rate for demo
      actualOutput: testCase.expectedOutput,
      executionTime: Math.random() * 100
    })) || [];

    setTestResults(mockResults);
  };

  const submitAssessment = async () => {
    if (!activeAssessment) return;

    const submission: Submission = {
      id: Date.now().toString(),
      assessmentId: activeAssessment.id,
      userId: (user as any)?.id || 'user1',
      code,
      submittedAt: new Date(),
      status: 'pending',
      score: 0,
      feedback: '',
      testResults
    };

    // Simulate submission processing
    setTimeout(() => {
      const passedTests = testResults.filter(r => r.passed).length;
      const totalTests = testResults.length;
      const score = Math.round((passedTests / totalTests) * activeAssessment.points);
      
      submission.status = score >= activeAssessment.points * 0.7 ? 'passed' : 'failed';
      submission.score = score;
      submission.feedback = score >= activeAssessment.points * 0.7 
        ? 'Excellent work! All test cases passed.' 
        : 'Some test cases failed. Please review and try again.';
      
      setSubmissions(prev => [...prev, submission]);
      setActiveAssessment(null);
      setIsRunning(false);
    }, 2000);
  };

  const handleAutoSubmit = () => {
    if (activeAssessment) {
      submitAssessment();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'coding': return <Code className="w-5 h-5" />;
      case 'project': return <Upload className="w-5 h-5" />;
      case 'peer-review': return <Users className="w-5 h-5" />;
      case 'live-coding': return <Play className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  if (activeAssessment) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-isabelline min-h-screen">
        {/* Assessment Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{activeAssessment.title}</h1>
              <p className="text-gray-600">{activeAssessment.description}</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold mb-1 ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-gray-600">Time Remaining</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <span className={`px-2 py-1 rounded-full font-medium ${getDifficultyColor(activeAssessment.difficulty)}`}>
              {activeAssessment.difficulty}
            </span>
            <span className="text-gray-600">{activeAssessment.points} points</span>
            <span className="text-gray-600">Max {activeAssessment.maxSubmissions} submissions</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Code Editor</h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    {activeAssessment.allowedLanguages?.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                  <button
                    onClick={runCode}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <Play className="w-4 h-4" />
                    <span>Run</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 font-mono text-sm border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Write your solution here..."
              />
            </div>
          </div>

          {/* Test Cases & Requirements */}
          <div className="space-y-6">
            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Requirements</h3>
              <ul className="space-y-2">
                {activeAssessment.requirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Test Cases */}
            {activeAssessment.testCases && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Test Cases</h3>
                <div className="space-y-3">
                  {activeAssessment.testCases.filter(tc => !tc.isHidden).map((testCase, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 mb-1">Test Case {index + 1}</div>
                        <div className="text-gray-600">
                          <span className="font-medium">Input:</span> {testCase.input}
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">Expected:</span> {testCase.expectedOutput}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Test Results</h3>
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className={`flex items-center justify-between p-2 rounded-lg ${
                      result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {result.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">Test Case {index + 1}</span>
                      </div>
                      <span className="text-xs text-gray-600">{result.executionTime.toFixed(2)}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? 'Pause' : 'Resume'}</span>
              </button>
              <button
                onClick={() => setCode(getStarterCode(activeAssessment))}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveAssessment(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Save & Exit
              </button>
              <button
                onClick={submitAssessment}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                Submit Solution
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-isabelline min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-gunmetal mb-2">Interactive Assessments</h1>
        <p className="text-dark-gunmetal/70">Hands-on coding challenges and project-based evaluations</p>
      </div>

      {/* Assessment Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assessments.map((assessment) => {
          const userSubmission = submissions.find(s => s.assessmentId === assessment.id);
          
          return (
            <div key={assessment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    {getTypeIcon(assessment.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{assessment.title}</h3>
                    <span className="text-sm text-purple-600 capitalize">{assessment.type.replace('-', ' ')}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(assessment.difficulty)}`}>
                  {assessment.difficulty}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{assessment.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Time Limit:</span>
                  <span className="font-medium">{assessment.timeLimit} minutes</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Points:</span>
                  <span className="font-medium text-purple-600">{assessment.points}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Submissions:</span>
                  <span className="font-medium">{userSubmission ? '1' : '0'}/{assessment.maxSubmissions}</span>
                </div>
              </div>

              {userSubmission && (
                <div className={`p-3 rounded-lg mb-4 ${
                  userSubmission.status === 'passed' ? 'bg-green-50 border border-green-200' :
                  userSubmission.status === 'failed' ? 'bg-red-50 border border-red-200' :
                  'bg-yellow-50 border border-yellow-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {userSubmission.status === 'passed' ? '✅ Passed' :
                       userSubmission.status === 'failed' ? '❌ Failed' : '⏳ Reviewing'}
                    </span>
                    <span className="text-sm font-bold">{userSubmission.score}/{assessment.points}</span>
                  </div>
                </div>
              )}

              {assessment.peerReviewRequired && (
                <div className="flex items-center space-x-2 text-sm text-orange-600 mb-4">
                  <Users className="w-4 h-4" />
                  <span>Peer review required</span>
                </div>
              )}

              <button
                onClick={() => startAssessment(assessment)}
                disabled={userSubmission?.status === 'passed'}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  userSubmission?.status === 'passed'
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                {userSubmission?.status === 'passed' ? 'Completed' : 
                 userSubmission ? 'Retake Assessment' : 'Start Assessment'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Previous Submissions */}
      {submissions.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-dark-gunmetal mb-6">Your Submissions</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {submissions.map((submission) => {
                const assessment = assessments.find(a => a.id === submission.assessmentId);
                return (
                  <div key={submission.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{assessment?.title}</h3>
                        <p className="text-sm text-gray-600">
                          Submitted {submission.submittedAt.toLocaleDateString()} at {submission.submittedAt.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">{submission.score}/{assessment?.points}</div>
                        <div className={`text-sm font-medium ${
                          submission.status === 'passed' ? 'text-green-600' :
                          submission.status === 'failed' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {submission.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    {submission.feedback && (
                      <p className="text-sm text-gray-600 mt-2">{submission.feedback}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveAssessments;
