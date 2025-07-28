// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'SmartReach',
    description: 'Client engagement platform',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <div className="flex h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white p-4 hidden md:block">
                <h2 className="text-xl font-bold mb-6">SmartReach</h2>
                <nav className="flex flex-col gap-4">
                    <a href="/dashboard" className="hover:text-blue-300">Dashboard</a>
                    <a href="/leads" className="hover:text-blue-300">Leads</a>
                    <a href="/email" className="hover:text-blue-300">Email</a>
                    <a href="/settings" className="hover:text-blue-300">Settings</a>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 bg-gray-100 overflow-auto">
                {/* Top Header */}
                <header className="mb-4">
                    <h1 className="text-2xl font-semibold text-gray-800">Welcome to SmartReach</h1>
                </header>

                {/* Page Content */}
                {children}
            </main>
        </div>
        </body>
        </html>
    )
}
