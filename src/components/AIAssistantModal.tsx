'use client'

import { useState, useEffect } from 'react'
import { HiSparkles } from 'react-icons/hi2'

interface AIAssistantModalProps {
    isOpen: boolean
    onClose: () => void
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
    const [prompt, setPrompt] = useState('')
    const [generatedEmail, setGeneratedEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleGenerate = async () => {
        setLoading(true)
        setGeneratedEmail('')

        try {
            const response = await fetch('/api/generate-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            })

            const data = await response.json()
            setGeneratedEmail(data.email || 'No response received.')
        } catch (error) {
            setGeneratedEmail('Something went wrong. Try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!mounted || !isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl">
                    &times;
                </button>

                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <HiSparkles className="text-blue-500" /> Ask AI Assistant
                </h2>

                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Send a welcome email to a new lead..."
                    className="w-full border border-gray-300 rounded p-3 mb-4 min-h-[100px] focus:ring-2 focus:ring-blue-500"
                />

                <button
                    onClick={handleGenerate}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate Email'}
                </button>

                {generatedEmail && (
                    <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded text-sm whitespace-pre-line">
                        <strong>Generated Email:</strong>
                        <p className="mt-2">{generatedEmail}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
