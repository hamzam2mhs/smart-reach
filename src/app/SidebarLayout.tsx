'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sidebarLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Leads', href: '/leads' },
    { name: 'Emails', href: '/emails' },
    { name: 'Settings', href: '/settings' },
]

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white p-4 hidden md:block">
                <h2 className="text-xl font-bold mb-6">SmartReach</h2>
                <nav className="flex flex-col gap-2">
                    {sidebarLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`py-2 px-3 rounded-md transition-all duration-200 font-medium ${
                                pathname === link.href
                                    ? 'bg-blue-600 text-white shadow-sm border-l-4 border-blue-400 pl-2'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 bg-gradient-to-br from-gray-100 to-blue-50 overflow-auto">
                <header className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">SmartReach</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Welcome, Hamza</span>
                        <div
                            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            H
                        </div>
                    </div>
                </header>

                {children}
            </main>
        </div>
    )
}
