"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserCircle2, Clock } from "lucide-react"

interface CandidateAcceptModalProps {
  isOpen: boolean
  interview: any
  onAccept: () => void
  onReject: () => void
  isLoading?: boolean
}

export function CandidateAcceptModal({
  isOpen,
  interview,
  onAccept,
  onReject,
  isLoading = false,
}: CandidateAcceptModalProps) {
  if (!interview) return null

  return (
    <Dialog open={isOpen}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 size-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle2 className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Candidate Requesting Entry</DialogTitle>
          <DialogDescription className="text-center">
            A candidate is waiting to join the interview session
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-sm text-muted-foreground">Candidate:</span>
              <span className="text-sm font-medium text-right">{interview?.candidate?.name || "Loading..."}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm text-muted-foreground">Language:</span>
              <span className="text-sm font-medium text-right capitalize">{interview?.language || "Loading..."}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="secondary" className="text-xs">
                <Clock className="size-3 mr-1" />
                Waiting
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={onAccept}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Accepting..." : "Accept"}
          </Button>
          <Button
            onClick={onReject}
            variant="outline"
            className="w-full bg-transparent"
            disabled={isLoading}
          >
            Decline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
