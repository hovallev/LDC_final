import { Inter } from 'next/font/google'
import { ChakraProvider, Box, Flex } from '@chakra-ui/react'
import './globals.css'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LDC Copilot',
  description: 'AI-powered advisory tool for bank mergers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChakraProvider>
          <Flex direction="column" minHeight="100vh">
            <Header />
            <Box flex="1">
              {children}
            </Box>
            <Footer />
          </Flex>
        </ChakraProvider>
      </body>
    </html>
  )
} 