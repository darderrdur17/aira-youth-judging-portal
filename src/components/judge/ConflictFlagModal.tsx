'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Flag, AlertTriangle } from 'lucide-react'

interface ConflictFlagModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
}

export function ConflictFlagModal({ open, onOpenChange, onConfirm }: ConflictFlagModalProps) {
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    onConfirm(reason.trim())
    setReason('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Flag size={16} className="text-amber-600" />
            </div>
            <DialogTitle className="text-[#1A2B3C]">Flag Conflict of Interest</DialogTitle>
          </div>
          <DialogDescription className="text-gray-500 text-sm leading-relaxed">
            If you have a personal, professional, or financial relationship with this team or
            organisation, you must flag it. The organiser will be notified and may reassign
            the project to a backup judge.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              You may still submit scores if the organiser instructs you to do so. Flagging
              does <strong>not</strong> automatically disqualify your scores.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#1A2B3C]">
              Reason (optional but recommended)
            </label>
            <Textarea
              placeholder="e.g. I know one of the team members, or I am affiliated with their university..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-sm resize-none border-gray-200"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
            >
              <Flag size={13} />
              Confirm Flag
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
