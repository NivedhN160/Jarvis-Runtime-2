# MAT-CHA.AI MCP Server Architecture

## Overview

The MAT-CHA.AI MCP (Model Context Protocol) server exposes the platform's AI-powered matchmaking capabilities as standardized tools that can be consumed by AI assistants like Claude, Kiro, and other MCP-compatible clients.

## High-Level Architecture

```mermaid
graph TB
    subgraph "AI Assistants"
        Claude[Claude Desktop]
        Kiro[Kiro IDE]
        Other[Other MCP Clients]
    end
    
    subgraph "MCP Server Layer"
        MCP[MAT-CHA.AI MCP Server<br/>Node.js + TypeScript]
        Tools[10 MCP Tools]
        Validation[Zod Schema Validation]
    end
    
    subgraph "MAT-CHA.AI Platform"
        API[FastAPI Backend]
        Bedrock[Amazon Bedrock<br/>AI Engine]
        Chroma[(ChromaDB<br/>Vector Store)]
        Mongo[(MongoDB Atlas)]
        S3[(Amazon S3)]
    end
    
    Claude -->|stdio| MCP
    Kiro -->|stdio| MCP
    Other -->|stdio| MCP
    
    MCP --> Tools
    Tools --> Validation
    Validation --> API
    
    API --> Bedrock
    API --> Chroma
    API --> Mongo
    API --> S3
    
    style MCP fill:#4A90E2
    style Tools fill:#7ED321
    style API fill:#F5A623
```

## MCP Tool Architecture

```mermaid
graph LR
    subgraph "Creator Management Tools"
        T1[create_creator_profile]
        T2[find_matching_creators]
    end
    
    subgraph "Brand Management Tools"
        T3[create_collaboration_request]
        T4[generate_roi_analysis]
    end
    
    subgraph "Collaboration Workflow Tools"
        T5[express_interest]
        T6[create_chat_window]
        T7[send_message]
        T8[confirm_deal]
    end
    
    subgraph "Content & Analytics Tools"
        T9[generate_contract]
        T10[get_analytics]
    end
    
    T1 --> EmbedGen[Embedding Generator]
    T2 --> VectorSearch[Vector Search]
    T3 --> EmbedGen
    T4 --> AIAnalysis[AI Analysis]
    T6 --> Timer[48h Timer]
    T9 --> ContractGen[Contract Generator]
    
    EmbedGen --> Bedrock[Amazon Bedrock]
    VectorSearch --> ChromaDB[(ChromaDB)]
    AIAnalysis --> Bedrock
    ContractGen --> Bedrock
    
    style T1 fill:#E8F5E9
    style T2 fill:#E8F5E9
    style T3 fill:#FFF3E0
    style T4 fill:#FFF3E0
    style T5 fill:#E3F2FD
    style T6 fill:#E3F2FD
    style T7 fill:#E3F2FD
    style T8 fill:#E3F2FD
    style T9 fill:#F3E5F5
    style T10 fill:#F3E5F5
```

## Tool Interaction Flow

```mermaid
sequenceDiagram
    participant AI as AI Assistant
    participant MCP as MCP Server
    participant Val as Validator
    participant API as Platform API
    participant Bedrock as Amazon Bedrock
    participant DB as Data Stores
    
    AI->>MCP: list_tools()
    MCP-->>AI: Return 10 available tools
    
    AI->>MCP: call_tool(create_creator_profile, args)
    MCP->>Val: Validate with Zod schema
    
    alt Validation Success
        Val->>API: POST /api/profiles
        API->>Bedrock: Generate embeddings
        Bedrock-->>API: Return vector
        API->>DB: Store profile + embedding
        DB-->>API: Confirm storage
        API-->>MCP: Success response
        MCP-->>AI: Profile created
    else Validation Failure
        Val-->>MCP: Schema error
        MCP-->>AI: Error response
    end
```

## Semantic Matching Flow

```mermaid
sequenceDiagram
    participant Brand as Brand (via AI)
    participant MCP as MCP Server
    participant API as Platform API
    participant Chroma as ChromaDB
    participant Bedrock as Amazon Bedrock
    
    Brand->>MCP: create_collaboration_request(details)
    MCP->>API: POST /api/requests
    API->>Bedrock: Generate request embedding
    Bedrock-->>API: Vector embedding
    API->>Chroma: Store embedding
    Chroma-->>API: Indexed
    API-->>MCP: Request created
    
    Brand->>MCP: find_matching_creators(requestId)
    MCP->>API: GET /api/match/creators
    API->>Chroma: Vector similarity search
    Chroma-->>API: Top matches with scores
    API-->>MCP: Ranked creator list
    MCP-->>Brand: Matches (92%, 87%, 81%)
    
    Brand->>MCP: generate_roi_analysis(creatorId, requestId)
    MCP->>API: POST /api/analysis/roi
    API->>Bedrock: Generate analysis with LLM
    Bedrock-->>API: Detailed ROI explanation
    API-->>MCP: Analysis result
    MCP-->>Brand: ROI insights
```

## Collaboration Workflow

```mermaid
stateDiagram-v2
    [*] --> ProfileCreated: create_creator_profile
    [*] --> RequestPosted: create_collaboration_request
    
    ProfileCreated --> Matched: find_matching_creators
    RequestPosted --> Matched: find_matching_creators
    
    Matched --> InterestExpressed: express_interest
    InterestExpressed --> ChatActive: create_chat_window
    
    ChatActive --> Messaging: send_message
    Messaging --> Messaging: continuous exchange
    
    Messaging --> DealProposed: confirm_deal (party 1)
    DealProposed --> DealConfirmed: confirm_deal (party 2)
    
    DealConfirmed --> ContractGenerated: generate_contract
    ContractGenerated --> [*]
    
    ChatActive --> Expired: 48 hours elapsed
    Expired --> [*]
```

## Data Flow Architecture

```mermaid
graph TD
    subgraph "Input Layer"
        UserInput[User Input via AI]
    end
    
    subgraph "MCP Server"
        ToolRouter[Tool Router]
        SchemaVal[Schema Validator]
        ErrorHandler[Error Handler]
    end
    
    subgraph "Processing Layer"
        ProfileProc[Profile Processor]
        MatchProc[Matching Processor]
        ChatProc[Chat Processor]
        DealProc[Deal Processor]
    end
    
    subgraph "AI Services"
        EmbedSvc[Embedding Service]
        ROISvc[ROI Analysis Service]
        ContractSvc[Contract Service]
    end
    
    subgraph "Storage Layer"
        VectorDB[(Vector Store)]
        DocDB[(Document Store)]
        ObjectStore[(Object Store)]
    end
    
    UserInput --> ToolRouter
    ToolRouter --> SchemaVal
    SchemaVal --> ProfileProc
    SchemaVal --> MatchProc
    SchemaVal --> ChatProc
    SchemaVal --> DealProc
    
    ProfileProc --> EmbedSvc
    MatchProc --> EmbedSvc
    MatchProc --> ROISvc
    DealProc --> ContractSvc
    
    EmbedSvc --> VectorDB
    ProfileProc --> DocDB
    ChatProc --> DocDB
    DealProc --> DocDB
    ContractSvc --> ObjectStore
    
    SchemaVal -.->|Validation Error| ErrorHandler
    ErrorHandler -.-> UserInput
```

## Tool Categories and Capabilities

```mermaid
mindmap
  root((MAT-CHA.AI<br/>MCP Server))
    Creator Tools
      create_creator_profile
        Bio & Portfolio
        Niche Tags
        Languages
        Vector Embedding
      Profile Management
        Update Profile
        Portfolio Upload
        Semantic Indexing
    Brand Tools
      create_collaboration_request
        Requirements
        Budget & Timeline
        Deliverables
        Vector Embedding
      Discovery
        find_matching_creators
        Semantic Search
        Filter & Rank
    AI Analysis
      generate_roi_analysis
        Content Alignment
        Audience Fit
        Reach Estimation
        Success Probability
      generate_contract
        AI-Generated Terms
        Multilingual Support
        Legal Sections
    Collaboration
      express_interest
        Interest Tracking
        Notifications
      create_chat_window
        48-Hour Expiry
        Ephemeral Messaging
      send_message
        Real-time Chat
        Message Delivery
      confirm_deal
        Mutual Confirmation
        Deal Recording
    Analytics
      get_analytics
        Performance Metrics
        Conversion Rates
        Engagement Stats
```

## Security and Validation Flow

```mermaid
graph TB
    Request[Tool Call Request]
    
    Request --> Auth{Authentication<br/>Valid?}
    Auth -->|No| Reject1[Reject: Unauthorized]
    Auth -->|Yes| Schema{Schema<br/>Valid?}
    
    Schema -->|No| Reject2[Reject: Invalid Input]
    Schema -->|Yes| RateLimit{Rate Limit<br/>OK?}
    
    RateLimit -->|No| Reject3[Reject: Rate Limited]
    RateLimit -->|Yes| Permission{Has<br/>Permission?}
    
    Permission -->|No| Reject4[Reject: Forbidden]
    Permission -->|Yes| Process[Process Request]
    
    Process --> Sanitize[Sanitize Input]
    Sanitize --> Execute[Execute Tool Logic]
    Execute --> Validate[Validate Output]
    Validate --> Response[Return Response]
    
    style Auth fill:#FFE082
    style Schema fill:#FFE082
    style RateLimit fill:#FFE082
    style Permission fill:#FFE082
    style Process fill:#81C784
    style Response fill:#81C784
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Client Environments"
        Desktop[Claude Desktop]
        IDE[Kiro IDE]
        Custom[Custom Clients]
    end
    
    subgraph "MCP Server Deployment"
        Node[Node.js Process]
        Stdio[Stdio Transport]
        Tools[Tool Handlers]
    end
    
    subgraph "AWS Infrastructure"
        AppRunner[AWS App Runner<br/>FastAPI Backend]
        Bedrock[Amazon Bedrock<br/>AI Models]
        
        subgraph "Data Layer"
            MongoDB[(MongoDB Atlas)]
            ChromaDB[(ChromaDB<br/>EKS/Fargate)]
            S3[(Amazon S3)]
        end
        
        subgraph "Security"
            Secrets[AWS Secrets Manager]
            IAM[AWS IAM]
        end
        
        subgraph "Monitoring"
            CloudWatch[AWS CloudWatch]
        end
    end
    
    Desktop -->|stdio| Node
    IDE -->|stdio| Node
    Custom -->|stdio| Node
    
    Node --> Stdio
    Stdio --> Tools
    Tools -->|HTTPS| AppRunner
    
    AppRunner --> Bedrock
    AppRunner --> MongoDB
    AppRunner --> ChromaDB
    AppRunner --> S3
    AppRunner --> Secrets
    
    IAM -.->|Access Control| AppRunner
    AppRunner -->|Logs & Metrics| CloudWatch
    
    style Node fill:#4A90E2
    style AppRunner fill:#FF9900
    style Bedrock fill:#FF9900
```

## Tool Response Format

```mermaid
graph LR
    ToolCall[Tool Call] --> Process[Process Request]
    
    Process --> Success{Success?}
    
    Success -->|Yes| SuccessResp[Success Response]
    Success -->|No| ErrorResp[Error Response]
    
    SuccessResp --> JSON1[JSON Structure]
    ErrorResp --> JSON2[JSON Structure]
    
    JSON1 --> Fields1["success: true<br/>data: {...}<br/>message: string<br/>metadata: {...}"]
    
    JSON2 --> Fields2["success: false<br/>error: string<br/>code: string<br/>details: {...}"]
    
    style SuccessResp fill:#81C784
    style ErrorResp fill:#E57373
```

## Integration Points

```mermaid
graph TB
    subgraph "MCP Server"
        Server[MCP Server Core]
    end
    
    subgraph "External Integrations"
        Bedrock[Amazon Bedrock API]
        MongoDB[MongoDB Atlas API]
        ChromaDB[ChromaDB API]
        S3[Amazon S3 API]
        SES[AWS SES]
    end
    
    subgraph "Internal Services"
        Auth[Authentication Service]
        Match[Matching Service]
        Chat[Chat Service]
        Deal[Deal Service]
        Analytics[Analytics Service]
    end
    
    Server --> Auth
    Server --> Match
    Server --> Chat
    Server --> Deal
    Server --> Analytics
    
    Auth --> MongoDB
    Match --> ChromaDB
    Match --> Bedrock
    Chat --> MongoDB
    Deal --> MongoDB
    Deal --> S3
    Analytics --> MongoDB
    
    Server -.->|Notifications| SES
    
    style Server fill:#4A90E2
    style Bedrock fill:#FF9900
    style MongoDB fill:#13AA52
    style ChromaDB fill:#7B68EE
    style S3 fill:#FF9900
```

## Performance Optimization

```mermaid
graph TD
    Request[Tool Request]
    
    Request --> Cache{Cache<br/>Available?}
    Cache -->|Yes| Return1[Return Cached]
    Cache -->|No| Process[Process Request]
    
    Process --> Parallel{Can<br/>Parallelize?}
    Parallel -->|Yes| Multi[Parallel Execution]
    Parallel -->|No| Serial[Serial Execution]
    
    Multi --> Combine[Combine Results]
    Serial --> Result[Generate Result]
    Combine --> Result
    
    Result --> Store[Store in Cache]
    Store --> Return2[Return Result]
    
    Return1 --> End[Response]
    Return2 --> End
    
    style Cache fill:#FFE082
    style Multi fill:#81C784
    style Store fill:#64B5F6
```

## Error Handling Strategy

```mermaid
graph TB
    Error[Error Occurs]
    
    Error --> Type{Error Type}
    
    Type -->|Validation| Val[Schema Validation Error]
    Type -->|Auth| Auth[Authentication Error]
    Type -->|Network| Net[Network Error]
    Type -->|Service| Svc[Service Error]
    Type -->|Unknown| Unk[Unknown Error]
    
    Val --> Log1[Log Error]
    Auth --> Log2[Log Error]
    Net --> Retry{Retry?}
    Svc --> Retry
    Unk --> Log3[Log Error]
    
    Retry -->|Yes| Backoff[Exponential Backoff]
    Retry -->|No| Log4[Log Error]
    
    Backoff --> Success{Success?}
    Success -->|Yes| Return1[Return Result]
    Success -->|No| Log4
    
    Log1 --> Format1[Format Error Response]
    Log2 --> Format1
    Log3 --> Format1
    Log4 --> Format1
    
    Format1 --> Return2[Return Error]
    
    style Error fill:#E57373
    style Retry fill:#FFE082
    style Return1 fill:#81C784
```

## Key Features

### 1. Semantic Matching
- Vector embeddings via Amazon Bedrock
- Cosine similarity scoring (0-100)
- Multi-language support

### 2. Ephemeral Communication
- 48-hour auto-expiring chat windows
- Real-time message delivery
- Countdown timers

### 3. AI-Powered Insights
- ROI analysis generation
- Contract template creation
- Success probability prediction

### 4. Mutual Confirmation
- Two-party deal confirmation
- Status tracking (pending/confirmed)
- Automated workflow transitions

### 5. Analytics & Reporting
- Performance metrics
- Conversion tracking
- Engagement analytics

## Technology Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **MCP SDK**: @modelcontextprotocol/sdk
- **Validation**: Zod
- **Transport**: stdio
- **Backend**: FastAPI (Python)
- **AI**: Amazon Bedrock
- **Vector DB**: ChromaDB
- **Database**: MongoDB Atlas
- **Storage**: Amazon S3

## Configuration

The MCP server can be configured in:

### Kiro IDE
```json
{
  "mcpServers": {
    "mat-cha-ai": {
      "command": "node",
      "args": ["path/to/dist/index.js"],
      "disabled": false,
      "autoApprove": ["get_analytics"]
    }
  }
}
```

### Claude Desktop
```json
{
  "mcpServers": {
    "mat-cha-ai": {
      "command": "node",
      "args": ["path/to/dist/index.js"]
    }
  }
}
```

## Future Enhancements

1. **WebSocket Support**: Real-time bidirectional communication
2. **Batch Operations**: Process multiple requests efficiently
3. **Webhook Integration**: Event-driven notifications
4. **Advanced Caching**: Redis integration for distributed caching
5. **Rate Limiting**: Per-user and per-tool rate limits
6. **Audit Logging**: Comprehensive activity tracking
7. **Multi-tenancy**: Support for multiple platform instances
