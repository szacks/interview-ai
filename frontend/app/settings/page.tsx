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
import { agentService, type AgentTemplate } from "@/services/agentService"

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

  const visibleSections = sections.filter((s) => s.roles.includes(currentUser.role))

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
            {activeSection === "team" && <TeamManagementSection />}
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
  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">Personal Information</h2>
          <p className="text-sm text-muted-foreground mb-6">Update your personal details</p>

          <div className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-border/50">
              <div className="flex-1">
                <Label htmlFor="fullName" className="text-sm font-medium mb-2 block">
                  Full Name
                </Label>
                <Input id="fullName" defaultValue="John Smith" className="h-10" />
              </div>
            </div>

            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input id="email" defaultValue="john@acme.com" disabled className="h-10 bg-muted/30" />
                <p className="text-xs text-muted-foreground">Contact support to change your email address</p>
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-medium">Role</Label>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-medium">
                    Admin
                  </Badge>
                  <span className="text-xs text-muted-foreground">Managed by team administrators</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-muted/20 border-t border-border/50 flex justify-end">
          <Button size="sm">Save Changes</Button>
        </div>
      </Card>

      <Card className="border-border/50">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">Security</h2>
          <p className="text-sm text-muted-foreground mb-6">Manage your password and authentication settings</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div>
                <p className="text-sm font-medium mb-0.5">Password</p>
                <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
              </div>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function InterviewDefaultsSection() {
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null)
  const [showRunTests, setShowRunTests] = useState(true)
  const [agents, setAgents] = useState<AgentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedAgents = await agentService.getAllAgents()
      setAgents(fetchedAgents)
      // Set the first system agent as default
      const defaultAgent = fetchedAgents.find((a) => a.isSystem)
      if (defaultAgent) {
        setSelectedAgentId(defaultAgent.id)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load agents"
      setError(errorMessage)
      console.error("Error fetching agents:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAgentCreated = (newAgent: AgentTemplate) => {
    setAgents((prev) => [...prev, newAgent])
    // Auto-select the newly created agent
    setSelectedAgentId(newAgent.id)
  }

  const systemAgents = agents.filter((a) => a.isSystem)
  const customAgents = agents.filter((a) => !a.isSystem)

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">Candidate Experience</h2>
          <p className="text-sm text-muted-foreground mb-6">Configure default settings for interview sessions</p>

          <div className="space-y-6">
            <div className="flex items-center justify-between py-3">
              <div className="flex-1 pr-4">
                <Label htmlFor="runTests" className="text-sm font-medium mb-1 block">
                  Show "Run Tests" Button to Candidates
                </Label>
                <p className="text-xs text-muted-foreground">Allow candidates to run test cases during the interview</p>
              </div>
              <Switch id="runTests" checked={showRunTests} onCheckedChange={setShowRunTests} />
            </div>
          </div>
        </div>
      </Card>

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
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-muted/20 border-t border-border/50 flex justify-end">
          <Button size="sm">Save Changes</Button>
        </div>
      </Card>

      <CreateAgentModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleAgentCreated}
      />
    </div>
  )
}

function AgentCard({
  agent,
  selected,
  onSelect,
}: {
  agent: AgentTemplate
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        selected ? "border-primary bg-primary/5" : "border-border/50 hover:border-border hover:bg-muted/30"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-medium text-sm">{agent.name}</span>
            <Badge variant={agent.isSystem ? "outline" : "secondary"} className="text-xs font-normal">
              {agent.isSystem ? "System" : "Custom"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{agent.description}</p>
        </div>
        <div
          className={`size-5 rounded-full border-2 flex-shrink-0 ml-3 mt-0.5 flex items-center justify-center ${
            selected ? "border-primary" : "border-border"
          }`}
        >
          {selected && <div className="size-2.5 rounded-full bg-primary" />}
        </div>
      </div>
    </button>
  )
}

interface ScoringProps {
  companyId: number
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
      console.error("Company ID not found")
      return
    }

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
        console.log("Settings saved successfully")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
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

function TeamManagementSection() {
  const teamMembers = [
    {
      id: 1,
      name: "John Smith",
      email: "john@acme.com",
      role: "Admin",
      lastLogin: "Today, 2:30 PM",
      interviews: 45,
      isCurrentUser: true,
      status: "active",
    },
    {
      id: 2,
      name: "Jane Doe",
      email: "jane@acme.com",
      role: "Interviewer",
      lastLogin: "Yesterday, 5:15 PM",
      interviews: 23,
      isCurrentUser: false,
      status: "active",
    },
    {
      id: 3,
      name: "Bob Wilson",
      email: "bob@acme.com",
      role: "Lead Interviewer",
      lastLogin: "3 days ago",
      interviews: 67,
      isCurrentUser: false,
      status: "active",
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice@acme.com",
      role: "Pending",
      lastLogin: null,
      interviews: 0,
      isCurrentUser: false,
      status: "pending",
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Team Members</h2>
              <p className="text-sm text-muted-foreground">Manage your team and their permissions</p>
            </div>
            <Button size="sm">Invite Member</Button>
          </div>

          <div className="flex gap-3 mb-6">
            <Input placeholder="Search members..." className="flex-1 h-9" />
            <select className="h-9 px-3 text-sm border border-border rounded-md bg-background">
              <option>All roles</option>
              <option>Admin</option>
              <option>Lead Interviewer</option>
              <option>Interviewer</option>
            </select>
          </div>

          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
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
                        {member.status === "active" ? (
                          <>
                            <span>Last login: {member.lastLogin}</span>
                            <span>•</span>
                            <span>{member.interviews} interviews</span>
                          </>
                        ) : (
                          <span>Invite sent: Jan 14, 2025</span>
                        )}
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
                    <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 w-28">Lead Int.</th>
                    <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 w-28">
                      Interviewer
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { name: "Create interviews", admin: true, lead: true, int: true },
                    { name: "View own interviews", admin: true, lead: true, int: true },
                    { name: "View all interviews", admin: true, lead: true, int: false },
                    { name: "Submit evaluations", admin: true, lead: true, int: true },
                    { name: "Manage questions", admin: true, lead: true, int: false },
                    { name: "Change scoring settings", admin: true, lead: false, int: false },
                    { name: "Invite team members", admin: true, lead: false, int: false },
                    { name: "Manage roles", admin: true, lead: false, int: false },
                    { name: "Access billing", admin: true, lead: false, int: false },
                    { name: "Export company data", admin: true, lead: true, int: false },
                    { name: "View audit log", admin: true, lead: false, int: false },
                  ].map((perm, index) => (
                    <tr key={index} className={index !== 10 ? "border-b border-border/50" : ""}>
                      <td className="px-4 py-3 text-sm">{perm.name}</td>
                      <td className="text-center px-4 py-3">
                        <span className={perm.admin ? "text-primary" : "text-muted-foreground/30"}>
                          {perm.admin ? "✓" : "○"}
                        </span>
                      </td>
                      <td className="text-center px-4 py-3">
                        <span className={perm.lead ? "text-primary" : "text-muted-foreground/30"}>
                          {perm.lead ? "✓" : "○"}
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
    </div>
  )
}

function SecuritySection() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [dataRetention, setDataRetention] = useState("90")

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">Authentication</h2>
          <p className="text-sm text-muted-foreground mb-6">Manage authentication and access security</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div className="flex-1 pr-4">
                <Label htmlFor="2fa" className="text-sm font-medium mb-1 block">
                  Two-Factor Authentication
                </Label>
                <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Switch id="2fa" checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
            </div>

            <div className="py-3">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Session Timeout</Label>
              </div>
              <select className="w-full h-10 px-3 text-sm border border-border rounded-md bg-background">
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
                className="w-full h-10 px-3 text-sm border border-border rounded-md bg-background"
              >
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">6 months</option>
                <option value="365">1 year</option>
                <option value="forever">Forever</option>
              </select>
              <p className="text-xs text-muted-foreground mt-2">How long to keep completed interview data</p>
            </div>

            <div className="pt-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1">Export All Data</p>
                  <p className="text-xs text-muted-foreground">Download a copy of all your company data</p>
                </div>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-muted/20 border-t border-border/50 flex justify-end">
          <Button size="sm">Save Changes</Button>
        </div>
      </Card>

      <Card className="border-border/50 border-destructive/20">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1 text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-6">Irreversible actions</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div>
                <p className="text-sm font-medium mb-1">Delete All Interview Data</p>
                <p className="text-xs text-muted-foreground">Permanently remove all interview records</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent"
              >
                Delete Data
              </Button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium mb-1">Close Account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent"
              >
                Close Account
              </Button>
            </div>
          </div>
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
