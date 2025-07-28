// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SidebarLayout from './SidebarLayout'
import { Poppins } from 'next/font/google'
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600'] })


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
        <body className={poppins.className}>
        <SidebarLayout>{children}</SidebarLayout>
        </body>
        </html>
    )
}
