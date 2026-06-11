'use client'

import { useState } from 'react'
import { FraudReportModal } from '@/components/colleges/FraudReportModal'
import { Flag } from 'lucide-react'

interface Props {
  collegeId: string
  collegeName: string
}

export function FraudReportModalTrigger({ collegeId, collegeName }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-semibold text-danger border border-danger/30 px-4 py-2 rounded-lg hover:bg-danger/10 transition"
      >
        <Flag className="w-4 h-4" />
        Report an Issue
      </button>
      {open && (
        <FraudReportModal
          collegeId={collegeId}
          collegeName={collegeName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
