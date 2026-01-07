'use client'

import { useState, useEffect } from 'react'
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

interface EditAgentModalProps {
  open: boolean
  agent: AgentTemplate | null
  onOpenChange: (open: boolean) => void
  onSuccess: (agent: AgentTemplate) => void
  onDelete?: (agentId: number) => void
}

export function EditAgentModal({ open, agent, onOpenChange, onSuccess, onDelete }: EditAgentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    systemPrompt: '',
  })
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (agent && open) {
      setFormData({
        name: agent.name,
        systemPrompt: agent.systemPrompt,
      })
      setError(null)
    }
  }, [agent, open])

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
    if (!agent || !validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const updatedAgent = await agentService.updateAgent(agent.id, {
        name: formData.name.trim(),
        systemPrompt: formData.systemPrompt.trim(),
      })

      onSuccess(updatedAgent)
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update agent'
      setError(errorMessage)
      console.error('Error updating agent:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!agent || !confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    setError(null)

    try {
      await agentService.deleteAgent(agent.id)
      onDelete?.(agent.id)
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete agent'
      setError(errorMessage)
      console.error('Error deleting agent:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit AI Agent</DialogTitle>
          <DialogDescription>
            Modify your custom AI agent configuration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name" className="text-sm font-medium">
              AI Helper Name *
            </Label>
            <Input
              id="edit-name"
              placeholder="Name for your custom AI helper"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading || deleting}
              className="mt-1 h-10"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Give your custom AI helper a name (will be saved to your profile)
            </p>
          </div>

          <div>
            <Label htmlFor="edit-systemPrompt" className="text-sm font-medium">
              Custom AI Prompt *
            </Label>
            <Textarea
              id="edit-systemPrompt"
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
              disabled={loading || deleting}
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

        <DialogFooter className="flex gap-3 justify-between">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Agent'}
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading || deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || deleting}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
