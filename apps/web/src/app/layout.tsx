import './globals.css'
import { ReactNode } from 'react'
import { Providers } from './providers'
import { Inter } from 'next/font/google'

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-geist-sans', // Using same variable name for compatibility
	display: 'swap',
})

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
			<body className="min-h-screen bg-background text-foreground font-sans">
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	)
}
