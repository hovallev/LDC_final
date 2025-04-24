'use client'

import { Box, Container, Flex, Text, Link } from '@chakra-ui/react'

export default function Footer() {
  return (
    <Box 
      as="footer" 
      py={4} 
      borderTop="1px solid"
      borderColor="gray.200"
      bg="gray.50"
      mt="auto"
    >
      <Container maxW="container.xl">
        <Flex 
          justifyContent="space-between" 
          alignItems="center"
          direction={{ base: 'column', sm: 'row' }}
          gap={{ base: 2, sm: 0 }}
        >
          <Text color="gray.600" fontSize="sm" fontWeight="medium">
            Tuck School of Business at Dartmouth
          </Text>
          <Text color="gray.600" fontSize="sm">
            Hernan Ovalle Valdes
          </Text>
        </Flex>
      </Container>
    </Box>
  )
} 