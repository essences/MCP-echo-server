#!/usr/bin/env node
/**
 * MCPサーバー実装の基本テンプレート
 *
 * 実装時の重要なポイント：
 * 1. ESモジュール形式を使用する（package.jsonでtype: "module"を設定）
 * 2. 適切な型定義をインポートする
 * 3. サーバーの基本情報（name, version）を設定
 * 4. ツールの入力スキーマを明確に定義
 * 5. エラーハンドリングを適切に実装
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, McpError, } from '@modelcontextprotocol/sdk/types.js';
// サーバーインスタンスの作成
const server = new Server({
    name: 'echo-server',
    version: '0.1.0',
}, {
    // 利用可能な機能を定義
    capabilities: {
        // リソースは使用しない
        resources: {},
        // ツールの定義
        tools: {
            echo: {
                name: 'echo',
                description: 'Returns the input text as-is',
                // 入力パラメータのスキーマ定義
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
        },
    },
});
// リクエストハンドラーの設定
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    // ツール名の検証
    if (request?.params?.name !== 'echo') {
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request?.params?.name}`);
    }
    // 入力パラメータの検証
    const text = request?.params?.arguments?.text;
    if (!text || typeof text !== 'string') {
        throw new McpError(ErrorCode.InvalidParams, 'Text parameter is required and must be a string');
    }
    // 結果を返却
    return {
        content: [{
                type: 'text',
                text: text,
            }],
    };
});
// エラーハンドラーの設定
server.onerror = (error) => {
    console.error('[MCP Error]', error);
};
// サーバーの起動
const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
    console.error('[MCP Server Error]', error);
});
console.error('Echo MCP server running on stdio');
