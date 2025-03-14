#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// 型定義
interface EchoArgs {
  text: string;
}

// バリデーション関数
const isValidEchoArgs = (args: any): args is EchoArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.text === 'string';

class EchoServer {
  private server: Server;

  constructor() {
    // サーバーインスタンスの作成
    this.server = new Server(
      {
        name: 'echo-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    // ハンドラーの設定
    this.setupToolHandlers();
    
    // エラーハンドリング
    this.server.onerror = (error) => console.error('[MCP Error]', error);

    // シグナルハンドリング
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // ツール一覧の提供
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'echo',
          description: 'Echoes back the input text',
          inputSchema: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'Text to echo back',
              },
            },
            required: ['text'],
          },
        },
      ],
    }));

    // ツールの実行ハンドラー
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'echo') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      if (!isValidEchoArgs(request.params.arguments)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Invalid arguments for echo tool'
        );
      }

      try {
        return {
          content: [
            {
              type: 'text',
              text: request.params.arguments.text,
            },
          ],
        };
      } catch (error) {
        if (error instanceof Error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
        throw error;
      }
    });

    // リソース関連のハンドラー（必要に応じて実装）
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [],
    }));

    this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
      resourceTemplates: [],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async () => ({
      contents: [],
    }));
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Echo MCP server running on stdio');
  }
}

// サーバーの起動
const server = new EchoServer();
server.run().catch(console.error);