// src/app/chat/page.tsx

import { Box, Container, Flex, VStack } from '@chakra-ui/react'
import ChatInterface from '@/components/ChatInterface'
import CompanyInfo from '@/components/CompanyInfo'

export default function ChatPage() {
  return (
    <Container maxW="container.xl" py={6}>
      <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
        <Box w={{ base: '100%', md: '300px' }}>
          <CompanyInfo />
        </Box>
        
        <Box flex="1">
          <ChatInterface />
        </Box>
      </Flex>
    </Container>
  )
}