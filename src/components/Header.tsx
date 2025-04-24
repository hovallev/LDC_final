'use client'

import { Box, Container, Flex, Heading, Text } from '@chakra-ui/react'

export default function Header() {
  return (
    <Box 
      as="header" 
      bg="linear-gradient(90deg, #1a365d 0%, #2b6cb0 100%)" 
      py={4} 
      color="white"
      boxShadow="0 2px 10px rgba(0,0,0,0.1)"
    >
      <Container maxW="container.xl">
        <Flex justifyContent="center" alignItems="center">
          <Box textAlign="center">
            <Heading 
              as="h1" 
              size="lg" 
              fontWeight="bold"
              letterSpacing="tight"
            >
              Leading Disruptive Change
            </Heading>
            <Text 
              mt={1} 
              fontSize="md" 
              fontWeight="medium" 
              color="blue.100"
            >
              Integrative Assignment
            </Text>
          </Box>
        </Flex>
      </Container>
    </Box>
  )
} 