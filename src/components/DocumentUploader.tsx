'use client'

import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react'

export default function DocumentUploader() {
  const [files, setFiles] = useState<FileList | null>(null)
  const toast = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files)
    }
  }

  const handleUpload = async () => {
    if (!files) return

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      toast({
        title: 'Upload successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <Stack spacing={4}>
        <Heading size="md">Upload Documents</Heading>
        <Text>Upload PDFs or PPTs (will be converted to PDF)</Text>
        <Input
          type="file"
          multiple
          accept=".pdf,.ppt,.pptx"
          onChange={handleFileChange}
          p={1}
        />
        <Button
          colorScheme="blue"
          isDisabled={!files}
          onClick={handleUpload}
        >
          Upload Files
        </Button>
      </Stack>
    </Box>
  )
} 