"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateAgentModal } from "@/components/CreateAgentModal"
import { EditAgentModal } from "@/components/EditAgentModal"
import { ChangePasswordModal } from "@/components/ChangePasswordModal"
import { agentService, type AgentTemplate } from "@/services/agentService"
import { userSettingsService } from "@/services/userSettingsService"
import userService, { type UserProfile } from "@/services/userService"
import apiClient from "@/services/apiClient"

type SettingsSection = "profile" | "interview-defaults" | "scoring" | "team" | "security" | "billing"

const currentUser = {
  role: "admin",
  name: "John Smith",
  email: "john@acme.com",
  profilePicture: null,
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile")

  const sections = [
    { id: "profile" as const, label: "Profile", icon: "user", roles: ["admin", "lead_interviewer", "interviewer"] },
    {
      id: "interview-defaults" as const,
      label: "Interview Defaults",
      icon: "settings",
      roles: ["admin", "lead_interviewer", "interviewer"],
    },
    { id: "scoring" as const, label: "Scoring", icon: "bar-chart", roles: ["admin"] },
    { id: "team" as const, label: "Team Management", icon: "users", roles: ["admin"] },
    { id: "security" as const, label: "Security", icon: "shield", roles: ["admin"] },
    { id: "billing" as const, label: "Billing", icon: "credit-card", roles: ["admin"] },
  ]

  // Filter out billing tab for now (hidden, not deleted)
  const visibleSections = sections.filter((s) => s.roles.includes(currentUser.role) && s.id !== "billing")

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account settings and preferences</p>
        </div>

        <div className="flex gap-8">
          <aside className="w-56 flex-shrink-0">
            <nav className="space-y-1 sticky top-8">
              {visibleSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="text-base">{getIconSymbol(section.icon)}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 max-w-3xl">
            {activeSection === "profile" && <ProfileSection />}
            {activeSection === "interview-defaults" && <InterviewDefaultsSection />}
            {activeSection === "scoring" && <ScoringSection companyId={1} />}
            {activeSection === "team" && <TeamManagementSection companyId={1} currentUser={{ id: 1, name: currentUser.name, email: currentUser.email }} />}
            {activeSection === "security" && <SecuritySection />}
            {activeSection === "billing" && <BillingSection />}
          </div>
        </div>
      </div>
    </div>
  )
}

function getIconSymbol(icon: string): string {
  const icons: Record<string, string> = {
    user: "○",
    settings: "⚙",
    "bar-chart": "▤",
    users: "⚏",
    shield: "◈",
    "credit-card": "▭",
  }
  return icons[icon] || "○"
}

function ProfileSection() {
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false)
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const userData = await userService.getCurrentUser()
      setUser(userData)
      setName(userData.name)
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      setSaveError("Name is required")
      return
    }

    try {
      setSaving(true)
      setSaveError(null)
      const updatedUser = await userService.updateProfile({ name: name.trim() })
      setUser(updatedUser)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error: any) {
      setSaveError(error.message || "Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChangeSuccess = () => {
    setPasswordChangeSuccess(true)
    setTimeout(() => setPasswordChangeSuccess(false), 3000)
  }

  const hasChanges = user && name !== user.name

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">Personal Information</h2>
          <p className="text-sm text-muted-foreground mb-6">Update your personal details</p>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-border/50">
                <div className="flex-1">
                  <Label htmlFor="fullName" className="text-sm font-medium mb-2 block">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setSaveError(null)
                    }}
                    className="h-10"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input id="email" value={user?.email || ""} disabled className="h-10 bg-muted/30" />
                  <p className="text-xs text-muted-foreground">Contact support to change your email address</p>
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Role</Label>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-medium capitalize">
                      {user?.role || "User"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Managed by team administrators</span>
                  </div>
                </div>
              </div>

              {saveSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-800 font-medium">Profile saved successfully!</p>
                </div>
              )}

              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{saveError}</p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-muted/20 border-t border-border/50 flex justify-end">
          <Button size="sm" onClick={handleSaveChanges} disabled={saving || loading || !hasChanges}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>

      <Card className="border-border/50">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">Security</h2>
          <p className="text-sm text-muted-foreground mb-6">Manage your password and authentication settings</p>

          {passwordChangeSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800 font-medium">Password changed successfully!</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div>
                <p className="text-sm font-medium mb-0.5">Password</p>
                <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChangePasswordModalOpen(true)}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <ChangePasswordModal
        open={changePasswordModalOpen}
        onOpenChange={setChangePasswordModalOpen}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  )
}

function InterviewDefaultsSection() {
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null)
  const [agents, setAgents] = useState<AgentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<AgentTemplate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savingError, setSavingError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchAgentsAndSettings()
  }, [])

  const fetchAgentsAndSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch agents
      const fetchedAgents = await agentService.getAllAgents()
      setAgents(fetchedAgents)

      // Fetch user settings
      const settings = await userSettingsService.getSettings()
      if (settings && settings.defaultAgentId) {
        setSelectedAgentId(settings.defaultAgentId)
      } else {
        // Set the first system agent as default if no preference exists
        const defaultAgent = fetchedAgents.find((a) => a.isSystem)
        if (defaultAgent) {
          setSelectedAgentId(defaultAgent.id)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load settings"
      setError(errorMessage)
      console.error("Error fetching settings:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!selectedAgentId) {
      setSavingError("Please select an AI assistant")
      return
    }

    try {
      setIsSaving(true)
      setSavingError(null)
      setSaveSuccess(false)

      await userSettingsService.updateSettings({
        defaultAgentId: selectedAgentId,
      })

      setSaveSuccess(true)
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save settings"
      setSavingError(errorMessage)
      console.error("Error saving settings:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAgentCreated = (newAgent: AgentTemplate) => {
    setAgents((prev) => [...prev, newAgent])
    // Auto-select the newly created agent
    setSelectedAgentId(newAgent.id)
  }

  const handleEditAgent = (agent: AgentTemplate) => {
    setEditingAgent(agent)
    setEditModalOpen(true)
  }

  const handleAgentUpdated = (updatedAgent: AgentTemplate) => {
    setAgents((prev) => prev.map((a) => (a.id === updatedAgent.id ? updatedAgent : a)))
  }

  const handleAgentDeleted = (agentId: number) => {
    setAgents((prev) => prev.filter((a) => a.id !== agentId))
    if (selectedAgentId === agentId) {
      setSelectedAgentId(null)
    }
  }

  const systemAgents = agents.filter((a) => a.isSystem)
  const customAgents = agents.filter((a) => !a.isSystem)

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">AI Assistant Configuration</h2>
              <p className="text-sm text-muted-foreground">Select the default AI behavior for new interviews</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(true)}>
              Create Custom
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-6">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Loading agents...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {systemAgents.length > 0 && (
                <>
                  <p className="text-xs font-medium text-muted-foreground mb-2">System Agents</p>
                  {systemAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      selected={selectedAgentId === agent.id}
                      onSelect={() => setSelectedAgentId(agent.id)}
                    />
                  ))}
                </>
              )}

              {customAgents.length > 0 && (
                <>
                  <div className="border-t border-border/50 my-4" />
                  <p className="text-xs font-medium text-muted-foreground mb-2">Custom Agents</p>
                  {customAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      selected={selectedAgentId === agent.id}
                      onSelect={() => setSelectedAgentId(agent.id)}
                      onEdit={() => handleEditAgent(agent)}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-muted/20 border-t border-border/50 flex items-center justify-between">
          <div className="flex-1">
            {savingError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 inline-block">
                <p className="text-sm text-destructive">{savingError}</p>
              </div>
            )}
            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 inline-block">
                <p className="text-sm text-green-700">Settings saved successfully</p>
              </div>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleSaveChanges}
            disabled={isSaving || loading}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>

      <CreateAgentModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleAgentCreated}
      />

      <EditAgentModal
        open={editModalOpen}
        agent={editingAgent}
        onOpenChange={setEditModalOpen}
        onSuccess={handleAgentUpdated}
        onDelete={handleAgentDeleted}
      />
    </div>
  )
}

function AgentCard({
  agent,
  selected,
  onSelect,
  onEdit,
}: {
  agent: AgentTemplate
  selected: boolean
  onSelect: () => void
  onEdit?: () => void
}) {
  return (
    <div
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        selected ? "border-primary bg-primary/5" : "border-border/50 hover:border-border hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <button
          onClick={onSelect}
          className="flex-1 text-left flex items-center gap-2"
        >
          <span className="font-medium text-sm">{agent.name}</span>
          <Badge variant={agent.isSystem ? "outline" : "secondary"} className="text-xs font-normal">
            {agent.isSystem ? "System" : "Custom"}
          </Badge>
        </button>
        <div className="flex items-center gap-2">
          {!agent.isSystem && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              ✎
            </Button>
          )}
          <div
            onClick={onSelect}
            className={`size-5 rounded-full border-2 flex-shrink-0 ml-1 flex items-center justify-center cursor-pointer ${
              selected ? "border-primary" : "border-border"
            }`}
          >
            {selected && <div className="size-2.5 rounded-full bg-primary" />}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ScoringProps {
  companyId: number
}

interface TeamManagementProps {
  companyId?: number
  currentUser?: {
    id: number
    name: string
    email: string
  }
}

function ScoringSection({ companyId }: ScoringProps) {
  const [autoWeight, setAutoWeight] = useState(40)
  const manualWeight = 100 - autoWeight
  const [showAddParameter, setShowAddParameter] = useState(false)
  const [newParameter, setNewParameter] = useState({
    name: "",
    description: "",
  })
  const [loading, setLoading] = useState(true)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [parameters, setParameters] = useState<Array<{
    id?: number
    name: string
    description?: string
    orderIndex?: number
    isDefault?: boolean
  }>>([])

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [paramToDelete, setParamToDelete] = useState<{ id?: number; name: string } | null>(null)

  // Fetch scoring settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        await fetchScoringSettings(companyId)
      } catch (error) {
        console.error("Error loading scoring settings:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [companyId])

  const fetchScoringSettings = async (cId: number) => {
    try {
      const response = await fetch(`/api/scoring-settings/company/${cId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.autoScoreWeight) {
          setAutoWeight(Math.round(data.autoScoreWeight * 100))
        }
        if (data.parameters && Array.isArray(data.parameters)) {
          setParameters(data.parameters)
        }
      }
    } catch (error) {
      console.error("Error fetching scoring settings:", error)
    }
  }

  const handleAddParameter = async () => {
    if (!newParameter.name.trim()) {
      console.error("Parameter name is required")
      return
    }

    if (!companyId) {
      console.error("Company ID not found")
      return
    }

    try {
      const response = await fetch(`/api/scoring-settings/company/${companyId}/parameters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newParameter.name,
          description: newParameter.description || "",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.parameters && Array.isArray(data.parameters)) {
          setParameters(data.parameters)
        }
        setNewParameter({
          name: "",
          description: "",
        })
        setShowAddParameter(false)
      } else {
        console.error("Failed to add parameter:", response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.error("Error details:", errorData)
      }
    } catch (error) {
      console.error("Error adding parameter:", error)
    }
  }

  const handleDeleteParameter = (param: { id?: number; name: string }) => {
    setParamToDelete(param)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!paramToDelete?.id || !companyId) {
      console.error("Parameter ID or Company ID not found")
      return
    }

    try {
      const response = await fetch(`/api/scoring-settings/company/${companyId}/parameters/${paramToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.parameters && Array.isArray(data.parameters)) {
          setParameters(data.parameters)
        }
        console.log("Parameter deleted successfully")
      } else {
        console.error("Failed to delete parameter:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error deleting parameter:", error)
    } finally {
      setDeleteConfirmOpen(false)
      setParamToDelete(null)
    }
  }

  const handleSaveChanges = async () => {
    if (!companyId) {
      setSaveError("Company ID not found")
      return
    }

    setSaveError(null)
    setSaveSuccess(false)

    try {
      const response = await fetch(`/api/scoring-settings/company/${companyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          autoScoreWeight: autoWeight / 100, // Convert percentage to decimal
          manualScoreWeight: manualWeight / 100,
          parameters: parameters.map((p) => ({
            name: p.name,
            description: p.description,
          })),
        }),
      })

      if (response.ok) {
        setSaveSuccess(true)
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        const errorData = await response.json().catch(() => ({ message: "Failed to save settings" }))
        setSaveError(errorData.message || "Failed to save settings")
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "An error occurred while saving settings")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">Score Distribution</h2>
          <p className="text-sm text-muted-foreground mb-6">Configure how the final score is calculated</p>

          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Auto Score (Test Results)</Label>
                  <span className="text-sm font-semibold tabular-nums">{autoWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={autoWeight}
                  onChange={(e) => setAutoWeight(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Manual Score (Interviewer Assessment)</Label>
                  <span className="text-sm font-semibold tabular-nums text-muted-foreground">{manualWeight}%</span>
                </div>
                <div className="h-2 bg-muted/50 rounded-lg"></div>
                <p className="text-xs text-muted-foreground mt-2">Automatically calculated</p>
              </div>
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Final Score Formula</p>
              <p className="text-sm font-mono">
                (Auto Score × {autoWeight}%) + (Manual Score × {manualWeight}%)
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-border/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Assessment Parameters</h2>
              <p className="text-sm text-muted-foreground">Define what interviewers evaluate manually</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAddParameter(true)}>
              Add Parameter
            </Button>
          </div>

          <div className="border border-border/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border/50">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Parameter</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.map((param, index) => (
                    <tr key={param.id} className={index !== parameters.length - 1 ? "border-b border-border/50" : ""}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm mb-0.5">{param.name}</div>
                        <div className="text-xs text-muted-foreground">{param.description}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              ⋯
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer"
                              onClick={() => handleDeleteParameter({ id: param.id, name: param.name })}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {saveSuccess && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-800 font-medium">Scoring settings saved successfully!</p>
          </div>
        )}
        {saveError && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{saveError}</p>
          </div>
        )}
        <div className="px-6 py-4 bg-muted/20 border-t border-border/50 flex justify-end">
          <Button size="sm" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </div>
      </Card>

      <Dialog open={showAddParameter} onOpenChange={setShowAddParameter}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Assessment Parameter</DialogTitle>
            <DialogDescription>Create a new assessment parameter for manual scoring</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="param-name">Parameter Name</Label>
              <Input
                id="param-name"
                placeholder="e.g., Code Quality"
                value={newParameter.name}
                onChange={(e) => setNewParameter({ ...newParameter, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="param-description">Description</Label>
              <Input
                id="param-description"
                placeholder="Brief description of what this evaluates"
                value={newParameter.description}
                onChange={(e) => setNewParameter({ ...newParameter, description: e.target.value })}
              />
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddParameter(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddParameter}>Add Parameter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Parameter</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{paramToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TeamManagementSection({ companyId, currentUser }: TeamManagementProps) {
  const [teamMembers, setTeamMembers] = useState<Array<{
    id: number
    name: string
    email: string
    role: string
    joinedAt?: string
    lastLogin?: string | null
    isCurrentUser: boolean
    status: "active" | "pending"
  }>>([])
  const [pendingInvitations, setPendingInvitations] = useState<Array<{
    id: number
    email: string
    invitedByName: string
    invitedAt: string
    expiresAt: string
  }>>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)

  // Fetch team members and pending invitations on mount
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true)
        // Fetch active team members
        try {
          const members = await apiClient.get('/teams/members')
          if (Array.isArray(members)) {
            const formattedMembers = members.map((member: any) => ({
              id: member.id,
              name: member.name,
              email: member.email,
              role: member.role === "INTERVIEWER" ? "Interviewer" : member.role,
              joinedAt: member.joinedAt,
              lastLogin: member.lastLogin,
              isCurrentUser: member.id === currentUser?.id,
              status: "active" as const,
            }))
            setTeamMembers(formattedMembers)
          }
        } catch (error) {
          console.error("Error fetching team members:", error)
        }

        // Fetch pending invitations
        try {
          const invitations = await apiClient.get('/teams/pending-invitations')
          if (Array.isArray(invitations)) {
            const formattedInvitations = invitations.map((inv: any) => ({
              id: inv.id,
              email: inv.email,
              invitedByName: inv.invitedByName,
              invitedAt: inv.invitedAt,
              expiresAt: inv.expiresAt,
            }))
            setPendingInvitations(formattedInvitations)
          }
        } catch (error) {
          console.error("Error fetching pending invitations:", error)
        }
      } finally {
        setLoading(false)
      }
    }

    loadTeamData()
  }, [currentUser?.id])

  const allMembers = [
    ...teamMembers.map((m) => ({ ...m, status: "active" as const })),
    ...pendingInvitations.map((inv) => ({
      id: inv.id,
      name: inv.email,
      email: inv.email,
      role: "Pending",
      joinedAt: inv.invitedAt,
      lastLogin: null,
      isCurrentUser: false,
      status: "pending" as const,
    })),
  ]

  const filteredMembers = allMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === "all" || member.role.toLowerCase().includes(selectedRole.toLowerCase())
    return matchesSearch && matchesRole
  })

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      setInviteError("Email is required")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      setInviteError("Please enter a valid email address")
      return
    }

    setInviteError(null)
    setInviteSuccess(false)
    setInviteLoading(true)

    try {
      await apiClient.post(`/teams/invite`, {
        email: inviteEmail.trim(),
        name: inviteName.trim() || undefined,
      })

      setInviteSuccess(true)
      setInviteEmail("")
      setInviteName("")
      // Refresh team data
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // Reload team members and invitations
      try {
        const members = await apiClient.get('/teams/members')
        if (Array.isArray(members)) {
          const formattedMembers = members.map((member: any) => ({
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role === "INTERVIEWER" ? "Interviewer" : member.role,
            joinedAt: member.joinedAt,
            lastLogin: member.lastLogin,
            isCurrentUser: member.id === currentUser?.id,
            status: "active" as const,
          }))
          setTeamMembers(formattedMembers)
        }
      } catch (error) {
        console.error("Error refreshing team members:", error)
      }

      try {
        const invitations = await apiClient.get('/teams/pending-invitations')
        if (Array.isArray(invitations)) {
          const formattedInvitations = invitations.map((inv: any) => ({
            id: inv.id,
            email: inv.email,
            invitedByName: inv.invitedByName,
            invitedAt: inv.invitedAt,
            expiresAt: inv.expiresAt,
          }))
          setPendingInvitations(formattedInvitations)
        }
      } catch (error) {
        console.error("Error refreshing pending invitations:", error)
      }

      setShowInviteDialog(false)
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'message' in error
          ? (error as any).message
          : "An error occurred while sending the invitation"
      setInviteError(errorMessage)
    } finally {
      setInviteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Team Members</h2>
              <p className="text-sm text-muted-foreground">Manage your team and their permissions</p>
            </div>
            <Button size="sm" onClick={() => setShowInviteDialog(true)}>
              Invite Member
            </Button>
          </div>

          <div className="flex gap-3 mb-6">
            <Input
              placeholder="Search members..."
              className="flex-1 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="h-9 px-3 text-sm border border-border rounded-md bg-background"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="interviewer">Interviewer</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Loading team members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No team members found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <div
                  key={`${member.status}-${member.id}`}
                  className="border border-border/50 rounded-lg p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="size-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border/50 flex-shrink-0">
                        <span className="text-sm text-muted-foreground">○</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{member.name}</span>
                          {member.isCurrentUser && <span className="text-xs text-muted-foreground">(you)</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{member.email}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {member.status === "active" && member.lastLogin ? (
                            <>
                              <span>Last login: {new Date(member.lastLogin).toLocaleDateString()}</span>
                            </>
                          ) : member.status === "pending" ? (
                            <span>Invite sent: {new Date(member.joinedAt!).toLocaleDateString()}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {member.status === "pending" ? (
                        <Badge variant="outline" className="text-xs">
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs font-medium">
                          {member.role}
                        </Badge>
                      )}
                      {!member.isCurrentUser && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          ⋯
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="border-border/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Roles & Permissions</h2>
              <p className="text-sm text-muted-foreground">Configure access levels for each role</p>
            </div>
          </div>

          <div className="border border-border/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border/50">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Permission</th>
                    <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 w-28">Admin</th>
                    <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 w-28">
                      Interviewer
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { name: "Create interviews", admin: true, int: true },
                    { name: "View own interviews", admin: true, int: true },
                    { name: "View all interviews", admin: true, int: false },
                    { name: "Submit evaluations", admin: true, int: true },
                    { name: "Manage questions", admin: true, int: false },
                    { name: "Change scoring settings", admin: true, int: false },
                    { name: "Invite team members", admin: true, int: false },
                    { name: "Manage roles", admin: true, int: false },
                    { name: "Access billing", admin: true, int: false },
                    { name: "View audit log", admin: true, int: false },
                  ].map((perm, index, arr) => (
                    <tr key={index} className={index !== arr.length - 1 ? "border-b border-border/50" : ""}>
                      <td className="px-4 py-3 text-sm">{perm.name}</td>
                      <td className="text-center px-4 py-3">
                        <span className={perm.admin ? "text-primary" : "text-muted-foreground/30"}>
                          {perm.admin ? "✓" : "○"}
                        </span>
                      </td>
                      <td className="text-center px-4 py-3">
                        <span className={perm.int ? "text-primary" : "text-muted-foreground/30"}>
                          {perm.int ? "✓" : "○"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation to join your team as an Interviewer</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {inviteSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800 font-medium">Invitation sent successfully!</p>
              </div>
            )}

            {inviteError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{inviteError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviteLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-name">Name (Optional)</Label>
              <Input
                id="invite-name"
                placeholder="John Doe"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                disabled={inviteLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)} disabled={inviteLoading}>
              Cancel
            </Button>
            <Button onClick={handleInviteMember} disabled={inviteLoading}>
              {inviteLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SecuritySection() {
  const [sessionTimeout, setSessionTimeout] = useState("120")
  const [dataRetention, setDataRetention] = useState("90")
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSecuritySettings()
  }, [])

  const fetchSecuritySettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const settings = await userSettingsService.getSettings()
      if (settings) {
        setSessionTimeout(settings.sessionTimeoutMinutes === -1 ? "never" : String(settings.sessionTimeoutMinutes))
        setDataRetention(settings.dataRetentionDays === -1 ? "forever" : String(settings.dataRetentionDays))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load security settings"
      setError(errorMessage)
      console.error("Error fetching security settings:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSaveSuccess(false)

      await userSettingsService.updateSettings({
        sessionTimeoutMinutes: sessionTimeout === "never" ? -1 : parseInt(sessionTimeout),
        dataRetentionDays: dataRetention === "forever" ? -1 : parseInt(dataRetention),
      })

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save security settings"
      setError(errorMessage)
      console.error("Error saving security settings:", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">Session Security</h2>
          <p className="text-sm text-muted-foreground mb-6">Configure session timeout settings</p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-6">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="py-3">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Session Timeout</Label>
              </div>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                disabled={loading}
                className="w-full h-10 px-3 text-sm border border-border rounded-md bg-background disabled:opacity-50"
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="240">4 hours</option>
                <option value="never">Never</option>
              </select>
              <p className="text-xs text-muted-foreground mt-2">Automatically log out inactive users</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-border/50">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">Data Management</h2>
          <p className="text-sm text-muted-foreground mb-6">Configure data retention and privacy settings</p>

          <div className="space-y-4">
            <div className="py-3">
              <Label className="text-sm font-medium mb-3 block">Interview Data Retention</Label>
              <select
                value={dataRetention}
                onChange={(e) => setDataRetention(e.target.value)}
                disabled={loading}
                className="w-full h-10 px-3 text-sm border border-border rounded-md bg-background disabled:opacity-50"
              >
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">6 months</option>
                <option value="365">1 year</option>
                <option value="forever">Forever</option>
              </select>
              <p className="text-xs text-muted-foreground mt-2">How long to keep completed interview data</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-muted/20 border-t border-border/50 flex items-center justify-between">
          <div className="flex-1">
            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 inline-block">
                <p className="text-sm text-green-700">Settings saved successfully</p>
              </div>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleSaveChanges}
            disabled={isSaving || loading}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  )
}

function BillingSection() {
  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">Current Plan</h2>
          <p className="text-sm text-muted-foreground mb-6">Manage your subscription and billing details</p>

          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">Professional</h3>
                <p className="text-sm text-muted-foreground">For growing teams</p>
              </div>
              <Badge variant="secondary" className="font-medium">
                Active
              </Badge>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Change Plan
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Cancel Subscription
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-muted-foreground">Billing cycle</span>
              <span className="font-medium">Monthly</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm border-t border-border/50">
              <span className="text-muted-foreground">Next billing date</span>
              <span className="font-medium">February 15, 2025</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm border-t border-border/50">
              <span className="text-muted-foreground">Payment method</span>
              <span className="font-medium">•••• 4242</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-border/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Usage This Month</h2>
              <p className="text-sm text-muted-foreground">Track your current usage and limits</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-muted-foreground">Interviews Conducted</span>
                <span className="font-medium tabular-nums">127 / 500</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "25.4%" }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-muted-foreground">Active Team Members</span>
                <span className="font-medium tabular-nums">8 / 15</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "53.3%" }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-muted-foreground">Storage Used</span>
                <span className="font-medium tabular-nums">2.4 GB / 10 GB</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "24%" }} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-border/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Billing History</h2>
              <p className="text-sm text-muted-foreground">View and download past invoices</p>
            </div>
          </div>

          <div className="border border-border/50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Description</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Amount</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 w-24">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "Jan 15, 2025", desc: "Professional Plan", amount: "$99.00", status: "Paid" },
                  { date: "Dec 15, 2024", desc: "Professional Plan", amount: "$99.00", status: "Paid" },
                  { date: "Nov 15, 2024", desc: "Professional Plan", amount: "$99.00", status: "Paid" },
                ].map((invoice, index) => (
                  <tr key={index} className={index !== 2 ? "border-b border-border/50" : ""}>
                    <td className="px-4 py-3 text-sm">{invoice.date}</td>
                    <td className="px-4 py-3 text-sm">{invoice.desc}</td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums font-medium">{invoice.amount}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}
