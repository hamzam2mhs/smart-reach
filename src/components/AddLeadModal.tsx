'use client'

import React, { useState } from 'react'
import { HiUpload } from 'react-icons/hi'

interface AddLeadModalProps {
    isOpen: boolean
    onClose: () => void
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [type, setType] = useState('new')
    const [query, setQuery] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Lead Submitted:', { name, email, type, query })
        setName('')
        setEmail('')
        setType('new')
        setQuery('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-semibold mb-6">Add a New Lead</h2>

                {/* Lead Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 border border-gray-200 p-6 rounded-xl shadow-sm"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g., John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g., john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lead Type</label>
                        <select
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="new">New</option>
                            <option value="returning">Returning</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {type === 'new' ? 'Query or Interest' : 'Last Service Provided'}
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder={type === 'new' ? 'e.g., Website Design' : 'e.g., Shopify Store Setup'}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white w-full py-2 rounded-md font-medium hover:bg-blue-700 transition"
                    >
                        Add Lead
                    </button>
                </form>

                {/* OR Separator */}
                <div className="my-6 text-center text-sm text-gray-500">OR</div>

                {/* Upload CSV */}
                <div className="text-center">
                    <button className="flex items-center gap-2 justify-center bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition text-gray-700">
                        <HiUpload className="text-lg" />
                        Upload CSV
                    </button>
                </div>
            </div>
        </div>
    )
}