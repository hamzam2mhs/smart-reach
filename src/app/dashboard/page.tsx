'use client'

import { useState } from 'react'
import { AIAssistantModal } from '@/components/AIAssistantModal'

export default function DashboardPage() {
    const [isAIModalOpen, setAIModalOpen] = useState(false)

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

            <button
                onClick={() => setAIModalOpen(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
            >
                Ask AI Assistant
            </button>

            <AIAssistantModal
                isOpen={isAIModalOpen}
                onClose={() => setAIModalOpen(false)}
            />
        </div>
    )
}
