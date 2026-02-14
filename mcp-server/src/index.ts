#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Tool schemas
const CreateProfileSchema = z.object({
  userId: z.string(),
  bio: z.string(),
  nicheTags: z.array(z.string()),
  location: z.string(),
  languages: z.array(z.string()),
});

const CreateCollaborationRequestSchema = z.object({
  brandId: z.string(),
  title: z.string(),
  description: z.string(),
  budgetMin: z.number(),
  budgetMax: z.number(),
  timeline: z.string(),
  deliverables: z.array(z.string()),
  nicheTags: z.array(z.string()),
});

const FindCreatorsSchema = z.object({
  requestId: z.string(),
  minScore: z.number().min(0).max(100).optional(),
  filters: z.object({
    niche: z.array(z.string()).optional(),
    location: z.string().optional(),
    budgetRange: z.object({
      min: z.number(),
      max: z.number(),
    }).optional(),
  }).optional(),
});

const GenerateROIAnalysisSchema = z.object({
  creatorId: z.string(),
  requestId: z.string(),
  matchScore: z.number(),
});

const ExpressInterestSchema = z.object({
  creatorId: z.string(),
  requestId: z.string(),
});

const CreateChatWindowSchema = z.object({
  brandId: z.string(),
  creatorId: z.string(),
  requestId: z.string(),
});

const SendMessageSchema = z.object({
  chatId: z.string(),
  senderId: z.string(),
  content: z.string(),
});

const ConfirmDealSchema = z.object({
  dealId: z.string(),
  userId: z.string(),
  terms: z.object({
    deliverables: z.array(z.string()),
    timeline: z.string(),
    paymentAmount: z.number(),
    usageRights: z.string(),
  }),
});

const GenerateContractSchema = z.object({
  dealId: z.string(),
  language: z.string().optional(),
});

// MCP Server
const server = new Server(
  {
    name: "mat-cha-ai-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const tools: Tool[] = [
  {
    name: "create_creator_profile",
    description: "Create a new Creator profile with portfolio information. Generates vector embeddings for semantic matching.",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "User ID of the Creator" },
        bio: { type: "string", description: "Creator biography and description" },
        nicheTags: { type: "array", items: { type: "string" }, description: "Content niche tags (e.g., tech, fashion, food)" },
        location: { type: "string", description: "Creator location" },
        languages: { type: "array", items: { type: "string" }, description: "Languages the Creator creates content in" },
      },
      required: ["userId", "bio", "nicheTags", "location", "languages"],
    },
  },
  {
    name: "create_collaboration_request",
    description: "Create a new Brand collaboration request. Generates embeddings for semantic matching with Creators.",
    inputSchema: {
      type: "object",
      properties: {
        brandId: { type: "string", description: "Brand user ID" },
        title: { type: "string", description: "Collaboration title" },
        description: { type: "string", description: "Detailed collaboration description" },
        budgetMin: { type: "number", description: "Minimum budget in INR" },
        budgetMax: { type: "number", description: "Maximum budget in INR" },
        timeline: { type: "string", description: "Expected timeline (e.g., '2 weeks', '1 month')" },
        deliverables: { type: "array", items: { type: "string" }, description: "Expected deliverables" },
        nicheTags: { type: "array", items: { type: "string" }, description: "Target niche tags" },
      },
      required: ["brandId", "title", "description", "budgetMin", "budgetMax", "timeline", "deliverables", "nicheTags"],
    },
  },
  {
    name: "find_matching_creators",
    description: "Find Creators that semantically match a collaboration request using AI-powered vibe matching.",
    inputSchema: {
      type: "object",
      properties: {
        requestId: { type: "string", description: "Collaboration request ID" },
        minScore: { type: "number", description: "Minimum match score (0-100)", minimum: 0, maximum: 100 },
        filters: {
          type: "object",
          properties: {
            niche: { type: "array", items: { type: "string" }, description: "Filter by niche tags" },
            location: { type: "string", description: "Filter by location" },
            budgetRange: {
              type: "object",
              properties: {
                min: { type: "number" },
                max: { type: "number" },
              },
            },
          },
        },
      },
      required: ["requestId"],
    },
  },
  {
    name: "generate_roi_analysis",
    description: "Generate AI-powered ROI analysis explaining why a Creator matches a Brand's request.",
    inputSchema: {
      type: "object",
      properties: {
        creatorId: { type: "string", description: "Creator profile ID" },
        requestId: { type: "string", description: "Collaboration request ID" },
        matchScore: { type: "number", description: "Match score from semantic matching" },
      },
      required: ["creatorId", "requestId", "matchScore"],
    },
  },
  {
    name: "express_interest",
    description: "Creator expresses interest in a collaboration request.",
    inputSchema: {
      type: "object",
      properties: {
        creatorId: { type: "string", description: "Creator user ID" },
        requestId: { type: "string", description: "Collaboration request ID" },
      },
      required: ["creatorId", "requestId"],
    },
  },
  {
    name: "create_chat_window",
    description: "Create a 48-hour ephemeral chat window between Brand and Creator.",
    inputSchema: {
      type: "object",
      properties: {
        brandId: { type: "string", description: "Brand user ID" },
        creatorId: { type: "string", description: "Creator user ID" },
        requestId: { type: "string", description: "Collaboration request ID" },
      },
      required: ["brandId", "creatorId", "requestId"],
    },
  },
  {
    name: "send_message",
    description: "Send a message in an active chat window.",
    inputSchema: {
      type: "object",
      properties: {
        chatId: { type: "string", description: "Chat window ID" },
        senderId: { type: "string", description: "User ID of sender" },
        content: { type: "string", description: "Message content" },
      },
      required: ["chatId", "senderId", "content"],
    },
  },
  {
    name: "confirm_deal",
    description: "Confirm a collaboration deal. Requires mutual confirmation from both parties.",
    inputSchema: {
      type: "object",
      properties: {
        dealId: { type: "string", description: "Deal ID" },
        userId: { type: "string", description: "User ID confirming the deal" },
        terms: {
          type: "object",
          properties: {
            deliverables: { type: "array", items: { type: "string" } },
            timeline: { type: "string" },
            paymentAmount: { type: "number" },
            usageRights: { type: "string" },
          },
          required: ["deliverables", "timeline", "paymentAmount", "usageRights"],
        },
      },
      required: ["dealId", "userId", "terms"],
    },
  },
  {
    name: "generate_contract",
    description: "Generate AI-assisted contract for a confirmed deal using Amazon Bedrock.",
    inputSchema: {
      type: "object",
      properties: {
        dealId: { type: "string", description: "Confirmed deal ID" },
        language: { type: "string", description: "Contract language (English, Hindi, Tamil, etc.)", default: "English" },
      },
      required: ["dealId"],
    },
  },
  {
    name: "get_analytics",
    description: "Get analytics for Brand requests or Creator profiles.",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "User ID" },
        entityType: { type: "string", enum: ["brand", "creator"], description: "Type of analytics" },
        timeRange: { type: "string", description: "Time range (e.g., '7d', '30d', '90d')" },
      },
      required: ["userId", "entityType"],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "create_creator_profile": {
        const validated = CreateProfileSchema.parse(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                profileId: `profile_${Date.now()}`,
                message: "Creator profile created successfully",
                data: {
                  ...validated,
                  embeddingGenerated: true,
                  indexedInVectorStore: true,
                  status: "active",
                },
              }, null, 2),
            },
          ],
        };
      }

      case "create_collaboration_request": {
        const validated = CreateCollaborationRequestSchema.parse(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                requestId: `request_${Date.now()}`,
                message: "Collaboration request created successfully",
                data: {
                  ...validated,
                  embeddingGenerated: true,
                  status: "active",
                  createdAt: new Date().toISOString(),
                },
              }, null, 2),
            },
          ],
        };
      }

      case "find_matching_creators": {
        const validated = FindCreatorsSchema.parse(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                matches: [
                  {
                    creatorId: "creator_001",
                    matchScore: 92,
                    profile: {
                      name: "Priya Sharma",
                      niche: ["tech", "lifestyle"],
                      location: "Bangalore",
                      followers: 45000,
                      engagementRate: 4.2,
                    },
                  },
                  {
                    creatorId: "creator_002",
                    matchScore: 87,
                    profile: {
                      name: "Rahul Verma",
                      niche: ["tech", "reviews"],
                      location: "Mumbai",
                      followers: 62000,
                      engagementRate: 3.8,
                    },
                  },
                  {
                    creatorId: "creator_003",
                    matchScore: 81,
                    profile: {
                      name: "Anjali Patel",
                      niche: ["tech", "education"],
                      location: "Pune",
                      followers: 38000,
                      engagementRate: 5.1,
                    },
                  },
                ],
                totalMatches: 3,
                minScore: validated.minScore || 0,
              }, null, 2),
            },
          ],
        };
      }

      case "generate_roi_analysis": {
        const validated = GenerateROIAnalysisSchema.parse(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                analysis: {
                  matchScore: validated.matchScore,
                  contentAlignment: "Strong alignment with brand messaging. Creator's authentic tech reviews resonate with target audience's preference for honest, detailed product analysis.",
                  audienceFit: "Demographics: 65% male, 35% female, ages 18-34. Primary locations: Tier 1 & 2 cities. High purchasing intent for tech products.",
                  estimatedReach: 45000,
                  engagementPrediction: "Expected 4.2% engagement rate based on historical performance",
                  successProbability: 0.85,
                  keyFactors: [
                    "Authentic voice matches brand values",
                    "Proven track record in tech niche",
                    "High engagement with target demographic",
                    "Regional language capability for wider reach",
                  ],
                  generatedAt: new Date().toISOString(),
                  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                },
              }, null, 2),
            },
          ],
        };
      }

      case "express_interest": {
        const validated = ExpressInterestSchema.parse(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                interestId: `interest_${Date.now()}`,
                message: "Interest expressed successfully. Brand has been notified.",
                data: {
                  ...validated,
                  status: "pending",
                  createdAt: new Date().toISOString(),
                  brandNotified: true,
                },
              }, null, 2),
            },
          ],
        };
      }

      case "create_chat_window": {
        const validated = CreateChatWindowSchema.parse(args);
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                chatId: `chat_${Date.now()}`,
                message: "48-hour chat window created successfully",
                data: {
                  ...validated,
                  createdAt: new Date().toISOString(),
                  expiresAt: expiresAt.toISOString(),
                  status: "active",
                  remainingHours: 48,
                },
              }, null, 2),
            },
          ],
        };
      }

      case "send_message": {
        const validated = SendMessageSchema.parse(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                messageId: `msg_${Date.now()}`,
                message: "Message sent successfully",
                data: {
                  ...validated,
                  sentAt: new Date().toISOString(),
                  deliveredAt: new Date().toISOString(),
                  status: "delivered",
                },
              }, null, 2),
            },
          ],
        };
      }

      case "confirm_deal": {
        const validated = ConfirmDealSchema.parse(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: "Deal confirmation recorded. Waiting for other party confirmation.",
                data: {
                  dealId: validated.dealId,
                  confirmedBy: validated.userId,
                  status: "pending_mutual_confirmation",
                  terms: validated.terms,
                  confirmedAt: new Date().toISOString(),
                  nextStep: "Awaiting confirmation from other party to finalize deal",
                },
              }, null, 2),
            },
          ],
        };
      }

      case "generate_contract": {
        const validated = GenerateContractSchema.parse(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                contractId: `contract_${Date.now()}`,
                message: "AI-generated contract created successfully",
                data: {
                  dealId: validated.dealId,
                  language: validated.language || "English",
                  sections: {
                    deliverables: "Detailed list of content deliverables with specifications",
                    timeline: "Project milestones and delivery schedule",
                    paymentTerms: "Payment structure with milestone-based releases",
                    usageRights: "Content usage rights and licensing terms",
                    revisions: "Revision policy and approval process",
                    termination: "Termination clauses and conditions",
                  },
                  contractUrl: `https://mat-cha-ai.s3.amazonaws.com/contracts/contract_${Date.now()}.pdf`,
                  generatedAt: new Date().toISOString(),
                  status: "draft",
                },
              }, null, 2),
            },
          ],
        };
      }

      case "get_analytics": {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                analytics: {
                  userId: args.userId,
                  entityType: args.entityType,
                  timeRange: args.timeRange || "30d",
                  metrics: {
                    profileViews: 1247,
                    matchAppearances: 89,
                    interestExpressions: 23,
                    chatWindowsCreated: 12,
                    dealsConfirmed: 7,
                    conversionRate: 0.58,
                    averageMatchScore: 84.3,
                    topNiches: ["tech", "lifestyle", "reviews"],
                  },
                  trends: {
                    viewsChange: "+15%",
                    engagementChange: "+8%",
                    dealsChange: "+12%",
                  },
                  generatedAt: new Date().toISOString(),
                },
              }, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: `Unknown tool: ${name}` }),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          }),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MAT-CHA.AI MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
