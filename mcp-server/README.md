# MAT-CHA.AI MCP Server

Model Context Protocol (MCP) server for the MAT-CHA.AI platform - an AI-powered matchmaking platform connecting Indian startups with content creators.

## Features

This MCP server exposes the following tools:

### Creator Management
- **create_creator_profile**: Create Creator profiles with semantic indexing
- **find_matching_creators**: AI-powered semantic matching for collaboration requests

### Brand Management
- **create_collaboration_request**: Post collaboration opportunities
- **generate_roi_analysis**: AI-generated match explanations and ROI predictions

### Collaboration Workflow
- **express_interest**: Creator interest expression
- **create_chat_window**: 48-hour ephemeral chat windows
- **send_message**: Real-time messaging
- **confirm_deal**: Mutual deal confirmation mechanism
- **generate_contract**: AI-assisted contract generation

### Analytics
- **get_analytics**: Platform analytics and insights

## Installation

```bash
cd mcp-server
npm install
npm run build
```

## Usage

### With Kiro

Add to your `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "mat-cha-ai": {
      "command": "node",
      "args": ["/path/to/Jarvis-Runtime-2/mcp-server/dist/index.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### With Claude Desktop

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "mat-cha-ai": {
      "command": "node",
      "args": ["/path/to/Jarvis-Runtime-2/mcp-server/dist/index.js"]
    }
  }
}
```

## Tool Examples

### Create a Creator Profile

```typescript
{
  "userId": "user_123",
  "bio": "Tech reviewer focusing on smartphones and gadgets. Creating content in Hindi and English for Indian audience.",
  "nicheTags": ["tech", "reviews", "gadgets"],
  "location": "Bangalore",
  "languages": ["English", "Hindi"]
}
```

### Find Matching Creators

```typescript
{
  "requestId": "request_456",
  "minScore": 75,
  "filters": {
    "niche": ["tech"],
    "location": "Bangalore",
    "budgetRange": {
      "min": 10000,
      "max": 50000
    }
  }
}
```

### Generate ROI Analysis

```typescript
{
  "creatorId": "creator_001",
  "requestId": "request_456",
  "matchScore": 92
}
```

### Create Chat Window

```typescript
{
  "brandId": "brand_789",
  "creatorId": "creator_001",
  "requestId": "request_456"
}
```

### Confirm Deal

```typescript
{
  "dealId": "deal_101",
  "userId": "brand_789",
  "terms": {
    "deliverables": ["2 Instagram reels", "1 YouTube video"],
    "timeline": "2 weeks",
    "paymentAmount": 25000,
    "usageRights": "Exclusive for 6 months"
  }
}
```

## Architecture

The MCP server provides a protocol layer over the MAT-CHA.AI platform, enabling:

- **Semantic Matching**: Vector embedding-based creator discovery
- **AI-Powered Insights**: ROI analysis and contract generation via Amazon Bedrock
- **Ephemeral Communication**: Time-bound 48-hour chat windows
- **Structured Workflows**: Mutual confirmation mechanisms
- **Multilingual Support**: Regional language support for Indian markets

## Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Start the server
npm start
```

## Tech Stack

- TypeScript
- @modelcontextprotocol/sdk
- Zod for schema validation
- Node.js

## Integration with MAT-CHA.AI Platform

This MCP server is designed to integrate with:
- **Backend**: FastAPI (Python) on AWS App Runner
- **AI Engine**: Amazon Bedrock (Claude/Llama 3)
- **Vector Store**: ChromaDB
- **Database**: MongoDB Atlas
- **Storage**: Amazon S3

## License

MIT
