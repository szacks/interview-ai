'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { agentService, type AgentTemplate } from '@/services/agentService'

interface CreateAgentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (agent: AgentTemplate) => void
}

export function CreateAgentModal({ open, onOpenChange, onSuccess }: CreateAgentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    systemPrompt: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Agent name is required')
      return false
    }
    if (!formData.systemPrompt.trim()) {
      setError('System prompt is required')
      return false
    }
    if (formData.name.length > 100) {
      setError('Agent name must be less than 100 characters')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const newAgent = await agentService.createAgent({
        name: formData.name.trim(),
        systemPrompt: formData.systemPrompt.trim(),
      })

      onSuccess(newAgent)
      setFormData({
        name: '',
        systemPrompt: '',
      })
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create agent'
      setError(errorMessage)
      console.error('Error creating agent:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({
        name: '',
        systemPrompt: '',
      })
      setError(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Custom AI Agent</DialogTitle>
          <DialogDescription>
            Define a custom AI behavior for your interviews
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              AI Helper Name *
            </Label>
            <Input
              id="name"
              placeholder="Name for your custom AI helper"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
              className="mt-1 h-10"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Give your custom AI helper a name (will be saved to your profile)
            </p>
          </div>

          <div>
            <Label htmlFor="systemPrompt" className="text-sm font-medium">
              Custom AI Prompt *
            </Label>
            <Textarea
              id="systemPrompt"
              className="min-h-[250px] font-mono text-sm mt-1"
              placeholder={`You are a helpful coding assistant for a rate limiter problem.

BEHAVIOR:
- Provide code snippets when asked
- Explain concepts clearly
- Guide the candidate step-by-step
- Be encouraging and supportive

IMPORTANT RESTRICTIONS:
- Never provide complete solutions
- Intentionally provide weak implementations when first asked
- Only improve when explicitly questioned
- Encourage the candidate to think through problems`}
              value={formData.systemPrompt}
              onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Include instructions for intentional weaknesses or specific guidance for the AI
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Agent'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
