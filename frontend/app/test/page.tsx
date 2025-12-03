'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function TestPage() {
  const [token, setToken] = useState('xK9mPq2nR4vL')

  const testTokens = [
    'xK9mPq2nR4vL',
    'aB3cD4eF5gH6',
    'iJ7kL8mN9oP0',
    'qR1sT2uV3wX4',
  ]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Pages</h1>

        <div className="space-y-8">
          {/* Candidate Interview Page */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Candidate Interview Page</h2>
            <p className="text-muted-foreground mb-4">
              Access the candidate waiting screen and live interview interface.
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter interview token"
                  className="flex-1"
                />
                <Link href={`/i/${token}`}>
                  <Button>Visit</Button>
                </Link>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Or use a test token:</p>
                <div className="flex flex-wrap gap-2">
                  {testTokens.map((t) => (
                    <Link key={t} href={`/i/${t}`}>
                      <Button variant="outline" size="sm">
                        {t}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              These test tokens will try to fetch interview data from your backend. If backend is not
              available, the page will still show the waiting screen UI.
            </p>
          </div>

          {/* Interviewer Page */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Interviewer Page</h2>
            <p className="text-muted-foreground mb-4">
              Access the interviewer's live session view with code editor, chat, and test results.
            </p>

            <div className="space-y-3">
              <Link href="/interview/1">
                <Button>Interview #1</Button>
              </Link>
              <Link href="/interview/2">
                <Button variant="outline">Interview #2</Button>
              </Link>
            </div>
          </div>

          {/* Authentication Pages */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication</h2>
            <p className="text-muted-foreground mb-4">
              Test the login and signup pages connected to your backend.
            </p>

            <div className="flex gap-2">
              <Link href="/login">
                <Button>Login Page</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline">Signup Page</Button>
              </Link>
            </div>
          </div>

          {/* Dashboard */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
            <p className="text-muted-foreground mb-4">
              View the interview list and management dashboard.
            </p>

            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
