'use client'

import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import { AddLeadModal } from '@/components/AddLeadModal'

export default function LeadsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [leads, setLeads] = useState<any[]>([])

    useEffect(() => {
        fetch('/leads.csv')
            .then(res => res.text())
            .then(text => {
                Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setLeads(results.data)
                    }
                })
            })
    }, [])

    return (
        <div className="p-6 text-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Leads</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Add a Lead
                </button>
            </div>

            <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-md overflow-hidden">
                <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Query</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                {leads.map((lead, idx) => (
                    <tr key={idx}>
                        <td className="px-6 py-4">{lead.name}</td>
                        <td className="px-6 py-4">{lead.email}</td>
                        <td className="px-6 py-4">{lead.type}</td>
                        <td className="px-6 py-4">{lead.query}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <AddLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    )
}
