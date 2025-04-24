// src/components/CompanyInfo.tsx
'use client'

import {
  Box,
  Heading,
  Text,
  Image,
  VStack,
  Skeleton,
  Flex,
  useToast,
  Spinner,
  HeadingProps,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

export default function CompanyInfo() {
  const [companyDescription, setCompanyDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    // Fetch company description using AI
    const fetchCompanyDescription = async () => {
      try {
        setIsLoading(true);
        
        // Generate company description using AI
        const descriptionResponse = await fetch('/api/document-reader', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: 'Provide a concise description of Banco BICE, including its main business focus, services, and what makes it unique. Format the response as plain text with bold section titles (using ** for bold) followed by short paragraphs. Don\'t use any special Markdown formatting other than bold for section titles. Keep section titles and content aligned with no indentation. Make each section brief and to the point.'
              }
            ],
          }),
        });

        if (!descriptionResponse.ok) {
          throw new Error('Failed to generate company description');
        }

        const descriptionData = await descriptionResponse.json();
        
        // Set the description with AI-generated content
        setCompanyDescription(descriptionData.response);
        
      } catch (error) {
        console.error('Error generating company information:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate company information',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        
        // Fallback description
        setCompanyDescription('**Overview**\n\nBanco BICE is a Chilean bank that provides financial services to individuals and businesses, focusing on high-quality customer service and innovative financial solutions.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyDescription();
  }, [toast]);

  // Clean up and standardize Markdown text
  const processMarkdownText = (text: string): string => {
    if (!text) return '';
    
    // Remove any # characters from the beginning of lines
    let processed = text.replace(/^#+ /gm, '**');
    
    // Ensure each section has proper spacing
    processed = processed.replace(/\*\*(.*?)\*\*/g, '**$1**\n');
    
    // Remove any double line breaks
    processed = processed.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return processed;
  };

  return (
    <Box 
      p={6} 
      borderWidth="1px" 
      borderRadius="lg" 
      boxShadow="md"
      bg="white"
      borderColor="gray.200"
      height={{ base: "auto", md: "600px" }}
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <VStack spacing={4} align="flex-start" h="100%" w="100%">
        <Flex w="100%" justify="center" mb={2}>
          <Image
            src="/banco-bice-logo.svg"
            alt="Banco BICE Logo"
            height="80px"
            objectFit="contain"
          />
        </Flex>

        <Text fontWeight="bold" color="blue.700" fontSize="md" alignSelf="flex-start">
          Company Profile
        </Text>
        
        <Box 
          flex="1" 
          overflowY="auto" 
          w="100%" 
          pl={0} 
          pr={0}
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
        >
          {isLoading ? (
            <VStack spacing={4} align="flex-start" width="100%" p={0}>
              <Flex justify="flex-start" direction="column" align="flex-start" mb={3}>
                <Box position="relative" h="50px" w="50px" mb={2}>
                  <Spinner 
                    size="lg" 
                    color="blue.500" 
                    thickness="3px"
                    speed="0.8s"
                    position="absolute"
                    left="0"
                    right="0"
                    top="0"
                    bottom="0"
                    margin="auto"
                  />
                  <Spinner 
                    size="md" 
                    color="blue.300" 
                    thickness="3px"
                    speed="0.5s"
                    position="absolute"
                    left="0"
                    right="0"
                    top="0"
                    bottom="0"
                    margin="auto"
                  />
                </Box>
                <Text color="blue.600" fontSize="sm" fontWeight="medium">
                  Analyzing bank data with AI
                </Text>
              </Flex>
              <Skeleton height="20px" width="100%" startColor="blue.50" endColor="blue.100" />
              <Skeleton height="20px" width="100%" />
              <Skeleton height="20px" width="100%" />
              <Skeleton height="20px" width="100%" />
              <Skeleton height="20px" width="100%" />
              <Skeleton height="20px" width="100%" />
              <Skeleton height="10px" width="75%" startColor="blue.50" endColor="gray.200" />
            </VStack>
          ) : (
            <Box 
              className="markdown-content" 
              width="100%" 
              pl={0} 
              pr={0}
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
            >
              <Box width="100%">
                {companyDescription.split('\n\n').map((paragraph, idx) => {
                  // Check if paragraph starts with a bold section (title)
                  if (paragraph.startsWith('**') && paragraph.includes('**')) {
                    const titleEnd = paragraph.indexOf('**', 2);
                    const title = paragraph.substring(2, titleEnd);
                    const content = paragraph.substring(titleEnd + 2).trim();
                    
                    return (
                      <Box key={idx} mb={4} width="100%" textAlign="left">
                        <Text 
                          color="blue.700" 
                          fontSize="md" 
                          fontWeight="bold" 
                          mb={1}
                          textAlign="left"
                        >
                          {title}
                        </Text>
                        <Text 
                          fontSize="sm" 
                          color="gray.700" 
                          lineHeight="1.6"
                          textAlign="left"
                          pl={0}
                        >
                          {content}
                        </Text>
                      </Box>
                    );
                  } else {
                    // Regular paragraph
                    return (
                      <Text 
                        key={idx} 
                        fontSize="sm" 
                        color="gray.700" 
                        lineHeight="1.6" 
                        mb={2}
                        textAlign="left"
                        pl={0}
                      >
                        {paragraph}
                      </Text>
                    );
                  }
                })}
              </Box>
              
              <Box
                mt={4}
                px={2}
                py={1}
                borderRadius="md"
                bg="blue.50"
                fontSize="xs"
                color="blue.600"
                width="100%"
                textAlign="center"
              >
                <Text fontSize="xs">AI-Generated Information</Text>
              </Box>
            </Box>
          )}
        </Box>
      </VStack>
    </Box>
  )
}