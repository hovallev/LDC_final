// src/components/CompanySelector.tsx

'use client'

import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Image,
  Radio,
  RadioGroup,
  Stack,
  Flex,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CompanySelector() {
  const [selectedCompany, setSelectedCompany] = useState('banco-bice')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()

  const handleCompanySelect = () => {
    setIsLoading(true)
    
    // In a real app, you might want to set this in a global state or context
    localStorage.setItem('selectedCompany', selectedCompany)
    
    // Navigate to the chat interface
    router.push('/chat')
  }

  return (
    <Box 
      p={8} 
      borderWidth="1px" 
      borderRadius="lg" 
      boxShadow="lg"
      bg="white"
    >
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center" color="blue.700">
          Which company do you work for?
        </Heading>
        
        <RadioGroup value={selectedCompany} onChange={setSelectedCompany}>
          <Stack spacing={4}>
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="md"
              borderColor="blue.200"
              bg="blue.50"
              _hover={{ borderColor: 'blue.400' }}
            >
              <Radio value="banco-bice" colorScheme="blue" size="lg">
                <Flex align="center" ml={2}>
                  <Image
                    src="/banco-bice-logo.svg"
                    alt="Banco BICE Logo"
                    height="40px"
                    mr={4}
                  />
                  <Text fontWeight="bold">Banco BICE</Text>
                </Flex>
              </Radio>
            </Box>
            
            {/* These options are disabled for the MVP */}
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="md"
              borderColor="gray.200"
              bg="gray.50"
              opacity={0.6}
              cursor="not-allowed"
            >
              <Radio value="other" isDisabled colorScheme="blue" size="lg">
                <Text ml={2} color="gray.500">Other companies coming soon...</Text>
              </Radio>
            </Box>
          </Stack>
        </RadioGroup>
        
        <Button 
          colorScheme="blue" 
          size="lg" 
          mt={4} 
          onClick={handleCompanySelect}
          isLoading={isLoading}
        >
          Continue
        </Button>
      </VStack>
    </Box>
  )
}