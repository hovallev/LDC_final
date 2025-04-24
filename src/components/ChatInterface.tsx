// src/components/ChatInterface.tsx

'use client'

import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
  useToast,
  Avatar,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface Source {
  filename: string
  relevanceScore: number
  snippet: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add welcome message when the component mounts
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Welcome to Banco BICE Copilot! I can help analyze Banco BICE documents and answer questions regarding mergers and banking information. How can I assist you today?'
      }
    ])
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/document-reader', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server responded with ${response.status}`)
      }

      const data = await response.json()

      setMessages((prev) => [
        ...prev, 
        { 
          role: 'assistant', 
          content: data.response,
          sources: data.sources || []
        }
      ])
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get response from AI'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box 
      p={6} 
      borderWidth="1px" 
      borderRadius="lg" 
      boxShadow="md"
      bg="white"
      borderColor="gray.200"
      height={{ base: "500px", md: "600px" }}
      display="flex"
      flexDirection="column"
    >
      <Heading 
        size="md" 
        color="blue.700" 
        mb={4}
        pb={2}
        borderBottom="2px solid"
        borderColor="blue.100"
      >
        Leadership Advisor
      </Heading>
      
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      )}

      <VStack
        spacing={4}
        align="stretch"
        flex="1"
        overflowY="auto"
        p={4}
        borderWidth="1px"
        borderRadius="md"
        bg="gray.50"
        mb={4}
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e0',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a0aec0',
          },
        }}
      >
        {messages.map((message, index) => (
          <Flex
            key={index}
            direction="column"
            alignItems={message.role === 'user' ? 'flex-end' : 'flex-start'}
            gap={2}
          >
            <Flex
              direction={message.role === 'user' ? 'row-reverse' : 'row'}
              align="flex-start"
              gap={3}
            >
              <Avatar
                size="sm"
                name={message.role === 'user' ? 'You' : 'AI'}
                bg={message.role === 'user' ? 'blue.500' : 'gray.500'}
              />
              <Box
                p={3}
                borderRadius="lg"
                bg={message.role === 'user' ? 'blue.50' : 'white'}
                borderWidth="1px"
                borderColor={message.role === 'user' ? 'blue.100' : 'gray.200'}
                maxW="80%"
                boxShadow="sm"
                {...(message.role === 'assistant' && {
                  bgGradient: "linear(to-br, white, blue.50)",
                  borderColor: "blue.100"
                })}
              >
                {message.role === 'user' ? (
                  <Text color="gray.700">{message.content}</Text>
                ) : (
                  <Box className="markdown-content" color="gray.700">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <Heading as="h1" size="lg" color="blue.700" mt={4} mb={2} {...props} />,
                        h2: ({node, ...props}) => <Heading as="h2" size="md" color="blue.600" mt={3} mb={2} {...props} />,
                        h3: ({node, ...props}) => <Heading as="h3" size="sm" fontWeight="bold" mt={2} mb={1} {...props} />,
                        p: ({node, ...props}) => <Text mb={2} {...props} />,
                        ul: ({node, ...props}) => <Box as="ul" pl={4} mb={2} {...props} />,
                        ol: ({node, ...props}) => <Box as="ol" pl={4} mb={2} {...props} />,
                        li: ({node, ...props}) => <Box as="li" mb={1} {...props} />,
                        strong: ({node, ...props}) => <Text as="strong" fontWeight="bold" {...props} />,
                        em: ({node, ...props}) => <Text as="em" fontStyle="italic" {...props} />,
                        code: ({node, children, className, ...props}: any) => {
                          const match = /language-(\w+)/.exec(className || '')
                          const isInline = !match
                          return isInline ? (
                            <Text as="code" px={1} bg="gray.100" borderRadius="sm" fontSize="sm" {...props}>
                              {children}
                            </Text>
                          ) : (
                            <Box 
                              as="pre" 
                              p={2} 
                              bg="gray.100" 
                              borderRadius="md" 
                              fontSize="sm" 
                              my={2} 
                              overflow="auto"
                            >
                              <Text 
                                as="code" 
                                display="block" 
                                whiteSpace="pre" 
                                {...props}
                              >
                                {children}
                              </Text>
                            </Box>
                          )
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </Box>
                )}
              </Box>
            </Flex>
          </Flex>
        ))}
        <div ref={messagesEndRef} />
      </VStack>
      <Box as="form" onSubmit={handleSubmit}>
        <Stack direction="row" spacing={2}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about leadership, change management, or the LDC program..."
            disabled={isLoading}
            bg="white"
            borderColor="gray.300"
            _hover={{ borderColor: 'blue.300' }}
            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
          />
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            disabled={!input.trim()}
            px={6}
          >
            Send
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}