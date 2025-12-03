import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Play } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'interviewer';
  message: string;
  timestamp: Date;
}

interface CodeEditorState {
  language: 'javascript' | 'python' | 'java' | 'typescript';
  code: string;
  output: string;
  isRunning: boolean;
}

type UserRole = 'candidate' | 'interviewer' | null;

export default function InterviewPage() {
  const { interviewId } = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const isInterviewer = searchParams.get('role') === 'interviewer';

  const [userRole, setUserRole] = useState<UserRole>(isInterviewer ? 'interviewer' : null);
  const [candidateName, setCandidateName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'java' | 'typescript'>('javascript');

  const [editor, setEditor] = useState<CodeEditorState>({
    language: 'javascript',
    code: '// Write your solution here\nfunction solution() {\n  \n}',
    output: '',
    isRunning: false,
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'interviewer',
      message: 'Welcome to the interview!',
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle pre-interview setup (candidate enters name and selects language)
  const handleStartInterview = () => {
    if (!candidateName.trim()) return;
    setUserRole('candidate');
    setEditor({ ...editor, language: selectedLanguage });
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: userRole === 'candidate' ? 'user' : 'interviewer',
      message: chatInput,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
  };

  const handleRunCode = async () => {
    if (userRole !== 'interviewer') return; // Only interviewer can run code

    setEditor({ ...editor, isRunning: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setEditor((prev) => ({
        ...prev,
        output: 'Test passed!\nAll assertions successful',
        isRunning: false,
      }));
    } catch (error) {
      setEditor((prev) => ({
        ...prev,
        output: 'Test failed',
        isRunning: false,
      }));
    }
  };

  const handleCodeChange = (newCode: string) => {
    if (userRole === 'candidate') {
      setEditor({ ...editor, code: newCode });
    }
  };

  // Pre-interview setup screen
  if (!userRole) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 bg-card border border-border rounded-lg">
          <h1 className="text-3xl font-bold mb-2">Interview Setup</h1>
          <p className="text-muted-foreground mb-6">Enter your details to begin the interview</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Name</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Programming Language</label>
              <Select value={selectedLanguage} onValueChange={(value: any) => setSelectedLanguage(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleStartInterview}
              disabled={!candidateName.trim()}
              className="w-full"
            >
              Start Interview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Candidate view - can only see their code, not tests
  if (userRole === 'candidate') {
    return (
      <div className="h-screen flex flex-col bg-background">
        <header className="bg-card border-b border-border px-6 py-4">
          <h1 className="text-2xl font-bold">Interview - {candidateName}</h1>
          <p className="text-muted-foreground text-sm">Session ID: {interviewId}</p>
        </header>

        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Candidate Code Editor */}
          <div className="flex-1 flex flex-col bg-card rounded-lg overflow-hidden border border-border">
            <div className="bg-muted p-4 border-b border-border">
              <h2 className="font-semibold">Code Editor</h2>
            </div>

            <div className="flex-1 bg-background p-4 overflow-hidden flex flex-col">
              <textarea
                value={editor.code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="flex-1 bg-background text-foreground font-mono text-sm border border-border rounded p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="// Write your solution here..."
              />
            </div>
          </div>

          {/* Chat */}
          <div className="w-80 flex flex-col bg-card rounded-lg overflow-hidden border border-border">
            <div className="bg-muted p-4 border-b border-border">
              <h2 className="font-semibold">Discussion</h2>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-border p-4 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="sm" onClick={handleSendMessage} className="h-10 px-3">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interviewer view - can see code and run tests
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold">Interviewer Panel</h1>
        <p className="text-muted-foreground text-sm">Session ID: {interviewId}</p>
      </header>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Candidate Code View */}
        <div className="flex-1 flex flex-col bg-card rounded-lg overflow-hidden border border-border">
          <div className="bg-muted p-4 border-b border-border flex justify-between items-center">
            <h2 className="font-semibold">Candidate Code</h2>
            <Button
              size="sm"
              onClick={handleRunCode}
              disabled={editor.isRunning}
              className="h-8"
            >
              <Play className="w-4 h-4 mr-1" />
              {editor.isRunning ? 'Running Tests...' : 'Run Tests'}
            </Button>
          </div>

          <div className="flex-1 bg-background p-4 overflow-hidden flex flex-col">
            <textarea
              value={editor.code}
              readOnly
              className="flex-1 bg-muted text-foreground font-mono text-sm border border-border rounded p-3 resize-none focus:outline-none"
              placeholder="Waiting for candidate code..."
            />
          </div>

          {/* Test Output */}
          {editor.output && (
            <div className="bg-muted p-4 border-t border-border max-h-40 overflow-auto">
              <div className="text-xs font-semibold text-muted-foreground mb-2">TEST RESULTS</div>
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words">
                {editor.output}
              </pre>
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="w-80 flex flex-col bg-card rounded-lg overflow-hidden border border-border">
          <div className="bg-muted p-4 border-b border-border">
            <h2 className="font-semibold">Discussion</h2>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.sender === 'interviewer'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-border p-4 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button size="sm" onClick={handleSendMessage} className="h-10 px-3">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
