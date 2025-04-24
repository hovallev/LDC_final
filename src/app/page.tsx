// src/app/page.tsx

import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react'
import CompanySelector from '@/components/CompanySelector'

export default function Home() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" mb={8}>
          <Heading as="h1" size="2xl" mb={4} color="blue.700">
            LDC Copilot
          </Heading>
          <Text fontSize="xl" color="gray.600">
            AI-powered advisory tool for bank mergers
          </Text>
        </Box>

        <Box maxW="md" mx="auto">
          <CompanySelector />
        </Box>
      </VStack>
    </Container>
  )
}