import React, { useState } from 'react';
import { Book, Search, Code, Key, Webhook, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Highlight, themes } from 'prism-react-renderer';

const Docs = () => {
  const [selectedDoc, setSelectedDoc] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const docSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Book size={18} />,
      content: `# Getting Started

Welcome to TrailRoom API! This guide will help you get started with virtual try-on integration.

## Quick Start

1. **Sign Up**: Create an account at TrailRoom
2. **Get API Key**: Generate your API key from the settings page
3. **Make Your First Request**: Use our API Playground to test endpoints

## Authentication

All API requests require authentication using either:
- Bearer token (JWT)
- API Key in the Authorization header

\`\`\`bash
curl -X POST "https://api.trailroom.com/api/v1/tryon" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"
\`\`\`

## Credits

Each API call consumes credits based on the operation:
- Try-On Generation: 1 credit
- History Retrieval: 0 credits

Free users get 3 credits per day. Paid plans offer more credits and features.
`
    },
    {
      id: 'authentication',
      title: 'Authentication',
      icon: <Key size={18} />,
      content: `# Authentication

TrailRoom API uses API keys to authenticate requests. You can view and manage your API keys in the dashboard.

## API Keys

Generate an API key from your dashboard:

1. Go to Settings → API Keys
2. Click "Generate New Key"
3. Copy and store your key securely (it won't be shown again)

## Using API Keys

Include your API key in the Authorization header:

\`\`\`bash
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Example Request

\`\`\`python
import requests

url = "https://api.trailroom.com/api/v1/tryon"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "mode": "top_only",
    "person_image": "base64_encoded_image",
    "clothing_image": "base64_encoded_image"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())
\`\`\`

## Security Best Practices

- Never share your API keys
- Rotate keys regularly
- Use environment variables to store keys
- Delete unused keys
`
    },
    {
      id: 'endpoints',
      title: 'API Endpoints',
      icon: <Code size={18} />,
      content: `# API Endpoints

## Try-On Endpoints

### Create Try-On Job

\`POST /api/v1/tryon\`

Create a new virtual try-on job.

**Request Body:**
\`\`\`json
{
  "mode": "top_only",
  "person_image": "base64_encoded_image",
  "clothing_image": "base64_encoded_image"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "job-123",
  "status": "processing",
  "created_at": "2025-01-01T12:00:00Z"
}
\`\`\`

### Get Job Status

\`GET /api/v1/tryon/:jobId\`

Retrieve the status and result of a try-on job.

**Response:**
\`\`\`json
{
  "id": "job-123",
  "status": "completed",
  "result": "base64_encoded_result_image",
  "created_at": "2025-01-01T12:00:00Z",
  "completed_at": "2025-01-01T12:00:30Z"
}
\`\`\`

### Get History

\`GET /api/v1/tryon/history/list\`

Retrieve list of all try-on jobs.

### Delete Job

\`DELETE /api/v1/tryon/:jobId\`

Delete a try-on job and its results.

## Credit Endpoints

### Get Credits

\`GET /api/v1/credits\`

Get current credit balance.

### Get Transactions

\`GET /api/v1/credits/transactions\`

Get credit transaction history.

## Webhook Endpoints

See the Webhooks section for webhook management.
`
    },
    {
      id: 'webhooks',
      title: 'Webhooks',
      icon: <Webhook size={18} />,
      content: `# Webhooks

Webhooks allow you to receive real-time notifications when events occur in your account.

## Supported Events

- \`tryon.completed\`: Triggered when a try-on job completes successfully
- \`tryon.failed\`: Triggered when a try-on job fails
- \`credits.low\`: Triggered when credits fall below threshold
- \`payment.completed\`: Triggered when a payment is processed

## Creating a Webhook

\`POST /api/v1/webhooks\`

\`\`\`json
{
  "url": "https://your-domain.com/webhook",
  "name": "My Webhook",
  "events": ["tryon.completed", "tryon.failed"]
}
\`\`\`

## Webhook Payload

When an event occurs, we'll send a POST request to your webhook URL:

\`\`\`json
{
  "event": "tryon.completed",
  "timestamp": "2025-01-01T12:00:00Z",
  "data": {
    "job_id": "job-123",
    "user_id": "user-456",
    "status": "completed"
  }
}
\`\`\`

## Verifying Webhooks

Each webhook includes a signature in the \`X-Webhook-Signature\` header. Verify it using your webhook secret:

\`\`\`python
import hmac
import hashlib

def verify_signature(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)
\`\`\`

## Retry Logic

If your webhook endpoint fails, we'll retry with exponential backoff:
- 1st retry: 1 minute
- 2nd retry: 5 minutes
- 3rd retry: 15 minutes
- 4th retry: 1 hour
- 5th retry: 2 hours (final attempt)
`
    },
    {
      id: 'errors',
      title: 'Error Handling',
      icon: <FileText size={18} />,
      content: `# Error Handling

TrailRoom API uses conventional HTTP response codes to indicate success or failure.

## Status Codes

- \`200 OK\`: Request succeeded
- \`201 Created\`: Resource created successfully
- \`400 Bad Request\`: Invalid request parameters
- \`401 Unauthorized\`: Invalid or missing API key
- \`403 Forbidden\`: Insufficient permissions
- \`404 Not Found\`: Resource not found
- \`429 Too Many Requests\`: Rate limit exceeded
- \`500 Internal Server Error\`: Server error

## Error Response Format

\`\`\`json
{
  "error": {
    "code": "invalid_request",
    "message": "Missing required parameter: person_image",
    "param": "person_image"
  }
}
\`\`\`

## Common Errors

### Insufficient Credits

\`\`\`json
{
  "error": {
    "code": "insufficient_credits",
    "message": "You don't have enough credits. Current balance: 0"
  }
}
\`\`\`

### Invalid Image Format

\`\`\`json
{
  "error": {
    "code": "invalid_image",
    "message": "Image must be base64 encoded"
  }
}
\`\`\`

## Rate Limiting

API requests are rate limited to prevent abuse:
- Free users: 10 requests/minute
- Paid users: 100 requests/minute

Rate limit info is included in response headers:
- \`X-RateLimit-Limit\`: Maximum requests per minute
- \`X-RateLimit-Remaining\`: Remaining requests
- \`X-RateLimit-Reset\`: Time when limit resets
`
    }
  ];

  const filteredSections = searchQuery
    ? docSections.filter(
        (section) =>
          section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : docSections;

  const currentDoc = docSections.find((doc) => doc.id === selectedDoc);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 sticky top-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white mb-4">Documentation</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            <nav className="space-y-1">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedDoc(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedDoc === section.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {section.icon}
                  <span className="font-medium">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-8">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <Highlight
                        theme={themes.nightOwl}
                        code={String(children).replace(/\n$/, '')}
                        language={match[1]}
                      >
                        {({ style, tokens, getLineProps, getTokenProps }) => (
                          <pre
                            style={style}
                            className="rounded-lg p-4 overflow-x-auto"
                          >
                            {tokens.map((line, i) => (
                              <div key={i} {...getLineProps({ line })}>
                                {line.map((token, key) => (
                                  <span key={key} {...getTokenProps({ token })} />
                                ))}
                              </div>
                            ))}
                          </pre>
                        )}
                      </Highlight>
                    ) : (
                      <code className={`${className} bg-gray-900 px-1.5 py-0.5 rounded`} {...props}>
                        {children}
                      </code>
                    );
                  },
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-white mb-4">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold text-white mt-6 mb-3">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="text-gray-300 mb-4 list-disc list-inside">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="text-gray-300 mb-4 list-decimal list-inside">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="mb-2">{children}</li>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-purple-400 hover:text-purple-300 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {currentDoc?.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
