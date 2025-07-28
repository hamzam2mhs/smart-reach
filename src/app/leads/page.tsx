'use client'

import { useState } from 'react'
import { AddLeadModal } from '@/components/AddLeadModal'

export default function LeadsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="p-6 text-gray-800">
            {/* Header and Add Lead Button */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Leads</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    Add a Lead
                </button>
            </div>

            {/* Placeholder for Leads Table */}
            <div className="border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                    <tr>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Email</th>
                        <th className="px-6 py-3 text-left">Lead Type</th>
                        <th className="px-6 py-3 text-left">Query</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
                    {/* Placeholder rows */}
                    <tr>
                        <td className="px-6 py-4">John Doe</td>
                        <td className="px-6 py-4">john@example.com</td>
                        <td className="px-6 py-4">New</td>
                        <td className="px-6 py-4">Website Design</td>
                    </tr>
                    <tr>
                        <td className="px-6 py-4">Jane Smith</td>
                        <td className="px-6 py-4">jane@example.com</td>
                        <td className="px-6 py-4">Returning</td>
                        <td className="px-6 py-4">Shopify Setup</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            {/* Modal for Add Lead */}
            <AddLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    )
}
