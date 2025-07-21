import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Play Smart Cards - Casino Card Games',
  description: 'Learn casino-style card games and master your skills with interactive tutorials and gameplay',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-casino-felt">
          <header className="bg-casino-green shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <h1 className="text-2xl font-bold text-white">Play Smart Cards</h1>
                <p className="text-casino-gold text-sm">Master Casino Card Games</p>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-casino-darkgreen text-white text-center py-4">
            <p>&copy; 2024 Play Smart Cards. Have fun and good luck!</p>
          </footer>
        </div>
      </body>
    </html>
  )
}
