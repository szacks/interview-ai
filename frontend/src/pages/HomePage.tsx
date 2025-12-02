import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Code2, Sparkles, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="size-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">InterviewAI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
            <Sparkles className="size-4" />
            <span>AI-Powered Technical Interviews</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            Conduct technical interviews with real-time AI assistance
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Empower your hiring process with AI-assisted coding interviews. Watch candidates solve problems in real-time
            while AI provides intelligent support.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="text-base">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base bg-transparent">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Code2 className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Coding</h3>
            <p className="text-muted-foreground leading-relaxed">
              Multi-language support with live code execution. Watch candidates code in Java, Python, or JavaScript.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="size-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Sparkles className="size-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
            <p className="text-muted-foreground leading-relaxed">
              Candidates collaborate with AI to solve problems, revealing their problem-solving approach.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="size-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
              <BarChart3 className="size-6 text-chart-3" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Automated Scoring</h3>
            <p className="text-muted-foreground leading-relaxed">
              Instant test results and automated scoring combined with manual evaluation for complete assessment.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded bg-primary flex items-center justify-center">
                <Code2 className="size-4 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">InterviewAI</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 InterviewAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
