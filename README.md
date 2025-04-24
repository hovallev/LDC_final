# LDC Copilot - Bank Merger Advisory Tool

An AI-powered advisory tool that analyzes Banco BICE documentation and provides insights for merger scenarios using GPT-4o/GPT-4.1 and text analysis.

## Features

- Company selection (Banco BICE for MVP)
- Interactive chat interface for asking questions
- AI-powered responses based on document context
- Document source citations for transparency

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ldc-copilot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Make sure your PDF documents are in the `documents` directory:
```bash
# Verify documents exist
ls documents
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. Select Banco BICE as your company on the initial screen
2. Use the chat interface to ask questions about Banco BICE
3. Receive AI-generated insights based on the pre-loaded documents
4. View document sources for transparency

## Logo Setup

The Banco BICE logo is included as an SVG file. Make sure it's placed in:
```
public/banco-bice-logo.svg
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts
│   │   └── company-description/
│   │       └── route.ts
│   ├── chat/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ChatInterface.tsx
│   ├── CompanyInfo.tsx
│   └── CompanySelector.tsx
└── documents/
    └── (your Banco BICE PDF files here)
public/
    └── banco-bice-logo.svg
```

## Deployment

The application can be deployed to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel
```

## Future Enhancements

- Adding support for multiple banks
- Document uploading interface
- Fine-tuning the AI model for financial domain
- Comparison tools for different merger scenarios