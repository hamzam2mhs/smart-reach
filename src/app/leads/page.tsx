'use client'

import { useState } from 'react'

export default function LeadsPage() {
    const [leads, setLeads] = useState<any[]>([]) // Replace `any` with Lead type later
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [type, setType] = useState('new')
    const [query, setQuery] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const newLead = { name, email, type, query }
        setLeads([...leads, newLead])

        setName('')
        setEmail('')
        setType('new')
        setQuery('')
        setShowForm(false)
    }

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            console.log('CSV Uploaded:', file.name)
            // Later: parse and add to leads list
        }
    }

    return (
        <div className="p-6 text-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Leads Directory</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    {showForm ? 'Cancel' : 'Add a Lead'}
                </button>
            </div>

            {/* Table of Leads */}
            <div className="overflow-x-auto border rounded-lg shadow-sm mb-8">
                <table className="min-w-full bg-white border border-gray-200 text-sm">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-left">Query / Last Service</th>
                    </tr>
                    </thead>
                    <tbody>
                    {leads.length === 0 ? (
                        <tr>
                            <td className="p-4 text-gray-500 italic" colSpan={4}>No leads yet.</td>
                        </tr>
                    ) : (
                        leads.map((lead, idx) => (
                            <tr key={idx} className="border-t">
                                <td className="p-3">{lead.name}</td>
                                <td className="p-3">{lead.email}</td>
                                <td className="p-3 capitalize">{lead.type}</td>
                                <td className="p-3">{lead.query}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Conditional Form/Upload UI */}
            {showForm && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold text-gray-900">Add a New Lead</h2>

                        <div>
                            <label className="block mb-1 text-sm font-medium">Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                                   className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"/>
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                   className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"/>
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium">Lead Type</label>
                            <select value={type} onChange={(e) => setType(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md">
                                <option value="new">New</option>
                                <option value="returning">Returning</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium">
                                {type === 'new' ? 'Query or Interest' : 'Last Service Provided'}
                            </label>
                            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} required
                                   className="w-full px-4 py-2 border rounded-md"/>
                        </div>

                        <button type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                            Submit Lead
                        </button>
                    </form>

                    {/* OR separator */}
                    <div className="my-6 flex items-center">
                        <hr className="flex-grow border-gray-300"/>
                        <span className="mx-4 text-gray-500 font-medium">OR</span>
                        <hr className="flex-grow border-gray-300"/>
                    </div>

                    {/* CSV Upload */}
                    <div className="text-center">
                        <label htmlFor="csvUpload"
                               className="inline-flex items-center gap-2 cursor-pointer px-5 py-3 border border-gray-300 bg-white rounded hover:bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 className="h-5 w-5 text-blue-600"
                                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M4 4v16h16V4H4zm8 4v4m0 0v4m0-4h4m-4 0H8"/>
                            </svg>
                            Upload CSV
                        </label>
                        <input type="file" id="csvUpload" accept=".csv" onChange={handleCSVUpload} className="hidden"/>
                    </div>
                </div>
            )}
        </div>
    )
}