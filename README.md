## このMCPの仕様

- **仕様**: このMCPは、入力した内容がそのまま返ってくるシンプルな仕様です。この仕様は、ユーザーからの入力をそのまま返却することで、基本動作を確認するためのプロトタイプとなります.

- **役割**: 本仕様は、MCPサーバーのたたき台として提供され、今後の発展とカスタマイズのための基盤として利用されます.


# MCPサーバー開発ガイド

## 1. プロジェクトのセットアップ

```bash
# 1. プロジェクトディレクトリの作成
mkdir my-mcp-server && cd my-mcp-server

# 2. npmプロジェクトの初期化
npm init -y

# 3. 必要な依存関係のインストール
npm install @modelcontextprotocol/sdk typescript
npm install -D @types/node

# 4. TypeScript設定の初期化
npx tsc --init
```

## 2. 重要な設定ファイル

### package.json

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",  // ESモジュールを使用
  "main": "build/index.js",
  "scripts": {
    "build": "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\"",
    "start": "node build/index.js",
    "dev": "npm run build && npm start"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

## 3. 実装のポイント

### 基本構造
- サーバーインスタンスの作成
- 機能（capabilities）の定義
- リクエストハンドラーの実装
- エラーハンドリングの設定
- サーバーの起動

### 重要な注意点
1. **ESモジュール対応**
   - package.jsonで`"type": "module"`を設定
   - インポートパスに`.js`を含める（例：`sdk/server/index.js`）

2. **型定義の活用**
   - スキーマ定義による入力バリデーション
   - エラー型の適切な使用

3. **エラーハンドリング**
   - MCPエラー型の使用
   - エラーコードの適切な選択
   - 詳細なエラーメッセージの提供

4. **セキュリティ考慮**
   - 入力値の検証
   - 実行権限の設定
   - 環境変数の適切な管理

## 4. デプロイ手順

### Cline (Cursor)の設定
```json
// settings/cline_mcp_settings.json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/my-mcp-server/build/index.js"],
      "env": {},
      "disabled": false,
      "alwaysAllow": ["my_tool"]
    }
  }
}
```

### Claude Desktopの設定
```json
// claude_desktop_config.json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/my-mcp-server/build/index.js"],
      "env": {},
      "disabled": false,
      "alwaysAllow": ["my_tool"]
    }
  }
}
```

## 5. トラブルシューティング

1. **パーミッションエラー**
   - ビルドスクリプトで実行権限を付与する
   - `chmod +x build/index.js`を実行

2. **モジュール解決エラー**
   - パスに`.js`拡張子を含める
   - `moduleResolution`を適切に設定

3. **環境変数の問題**
   - 設定ファイルで適切に環境変数を定義
   - 実行時に環境変数が利用可能か確認

4. **セキュリティ制限**
   - `alwaysAllow`の設定を確認
   - 必要な権限が付与されているか確認

## 6. ベストプラクティス

1. **モジュール化**
   - 機能ごとにモジュールを分割
   - 再利用可能なコードの抽出

2. **エラー処理**
   - 詳細なエラーメッセージ
   - エラーの階層化
   - ログの適切な出力

3. **テスト**
   - ユニットテストの作成
   - 統合テストの実装
   - エッジケースの考慮

4. **ドキュメント**
   - コードコメントの充実
   - API仕様書の作成
   - 使用例の提供

## 7. よくある問題と対策

### SDK関連の問題

1. **SDKバージョンの不一致**
   - 問題: `No matching version found for @modelcontextprotocol/sdk@^x.x.x`
   - 原因: package.jsonで指定したバージョンが存在しない
   - 対策: 
     - 既存のMCPサーバーのpackage.jsonを確認
     - 動作確認済みのバージョン（現在は^1.5.0）を使用
     - バージョン指定は^（キャレット）を使用して互換性を確保

2. **モジュール解決の問題**
   - 問題: `Cannot find module '@modelcontextprotocol/sdk/server/index'`
   - 原因: ESモジュールとCommonJS混在による問題
   - 対策:
     - package.jsonに `"type": "module"` を追加
     - インポートパスに `.js` を付ける
     - tsconfig.jsonで `"module": "ES2020"` を指定

### ファイルシステム権限の問題

1. **実行権限エラー**
   - 問題: `Permission denied` や実行できない
   - 原因: ビルドされたファイルに実行権限がない
   - 対策:
     - ビルドスクリプトに chmod 追加
     ```json
     "build": "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\""
     ```

2. **ファイル書き込み権限**
   - 問題: `OSError: Read-only file system`
   - 原因: プロセスに書き込み権限がない
   - 対策:
     - 一時ディレクトリを使用
     - 適切な権限を持つディレクトリを指定
     - 必要な場合は sudo 権限で実行

### 設定ファイル関連

1. **設定ファイルの認識問題**
   - 問題: MCPサーバーが認識されない
   - 原因: 設定ファイルのパスや形式が不正
   - 対策:
     - 絶対パスを使用
     - alwaysAllowに適切なツール名を指定
     - 両方の設定ファイルを更新
       - Cline: `~/Library/Application Support/Cursor/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`
       - Claude: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. **環境変数の問題**
   - 問題: 環境変数が認識されない
   - 原因: 設定ファイルでの環境変数指定が不適切
   - 対策:
     - MCPサーバー設定の "env" セクションで明示的に指定
     - 機密情報は環境変数経由で渡す
     ```json
     "env": {
       "API_KEY": "your-api-key"
     }
     ```

### プロセス管理

1. **プロセスの重複起動**
   - 問題: 同じサーバーが複数起動
   - 原因: 前回のプロセスが終了していない
   - 対策:
     - 起動スクリプトで古いプロセスを終了
     ```bash
     pkill -f 'node build/index.js' || true
     ```
     - プロセス管理ツール（pm2など）の使用を検討

2. **終了処理の問題**
   - 問題: プロセスが正常終了しない
   - 原因: シグナルハンドリング未実装
   - 対策:
     - SIGINTなどのシグナルハンドラーを実装
     ```typescript
     process.on('SIGINT', async () => {
       await server.close();
       process.exit(0);
     });
     ```

## 8. 開発チェックリスト

1. プロジェクト設定
   - [ ] package.jsonの"type": "module"設定
   - [ ] 適切なSDKバージョンの指定
   - [ ] TypeScript設定の確認

2. 実装
   - [ ] ESモジュール形式のインポート
   - [ ] エラーハンドリングの実装
   - [ ] 型定義の活用

3. ビルドと権限
   - [ ] ビルドスクリプトでの実行権限付与
   - [ ] 必要なディレクトリのアクセス権確認

4. 設定
   - [ ] Cline設定ファイルの更新
   - [ ] Claude Desktop設定ファイルの更新
   - [ ] 環境変数の適切な設定

5. テスト
   - [ ] 基本機能の動作確認
   - [ ] エラーケースのテスト
   - [ ] 複数環境での動作確認

## 9. 追加の重要な考慮事項

### リソース管理

1. **メモリリーク対策**
   - 問題: 長時間実行で徐々にメモリ使用量が増加
   - 原因: 
     - イベントリスナーの未解除
     - 一時ファイルの未削除
     - キャッシュの無限増加
   - 対策:
     - 定期的なメモリ使用量モニタリング
     - リソースのクリーンアップ処理の実装
     ```typescript
     let cleanupInterval = setInterval(() => {
       // クリーンアップ処理
       // - 古いキャッシュの削除
       // - 一時ファイルの削除
       // - 未使用のコネクションのクローズ
     }, 3600000); // 1時間ごと

     // プロセス終了時にインターバルをクリア
     process.on('SIGINT', () => {
       clearInterval(cleanupInterval);
       process.exit(0);
     });
     ```

### エラー回復

1. **接続断の自動リカバリ**
   - 問題: ネットワーク切断時にサーバーが復帰しない
   - 対策:
     ```typescript
     class ConnectionManager {
       private retryCount = 0;
       private readonly maxRetries = 5;
       private readonly retryDelay = 5000; // 5秒

       async connect() {
         try {
           await this.server.connect(transport);
         } catch (error) {
           if (this.retryCount < this.maxRetries) {
             this.retryCount++;
             console.error(`接続失敗。${this.retryCount}回目の再試行...`);
             setTimeout(() => this.connect(), this.retryDelay);
           } else {
             console.error('最大再試行回数を超過。サーバーを停止します。');
             process.exit(1);
           }
         }
       }
     }
     ```

2. **エラーの階層化と適切な対応**
   ```typescript
   enum ErrorSeverity {
     LOW = 'LOW',      // 警告のみ
     MEDIUM = 'MEDIUM', // リトライ可能
     HIGH = 'HIGH'     // 即時終了必要
   }

   class MCPServerError extends Error {
     constructor(
       message: string,
       public severity: ErrorSeverity,
       public recoverable: boolean
     ) {
       super(message);
     }
   }

   // エラーハンドラーでの使用例
   try {
     // 処理
   } catch (error) {
     if (error instanceof MCPServerError) {
       switch (error.severity) {
         case ErrorSeverity.LOW:
           console.warn(error.message);
           break;
         case ErrorSeverity.MEDIUM:
           if (error.recoverable) {
             // リトライロジック
           }
           break;
         case ErrorSeverity.HIGH:
           console.error('致命的エラー。サーバーを終了します。');
           process.exit(1);
       }
     }
   }
   ```

### パフォーマンス最適化

1. **大規模データ処理**
   - ストリーミング処理の実装
   - メモリ効率の良いバッファ管理
   ```typescript
   import { Transform } from 'stream';

   class DataProcessor extends Transform {
     constructor(options = {}) {
       super({
         ...options,
         objectMode: true,
         highWaterMark: 64 // バッファサイズの制御
       });
     }

     _transform(chunk, encoding, callback) {
       // データの変換処理
       callback(null, processedChunk);
     }
   }
   ```

2. **キャッシュ戦略**
   ```typescript
   class CacheManager {
     private cache = new Map<string, { data: any, timestamp: number }>();
     private readonly maxAge = 3600000; // 1時間

     set(key: string, value: any) {
       this.cache.set(key, {
         data: value,
         timestamp: Date.now()
       });
     }

     get(key: string) {
       const entry = this.cache.get(key);
       if (!entry) return null;
       
       if (Date.now() - entry.timestamp > this.maxAge) {
         this.cache.delete(key);
         return null;
       }
       
       return entry.data;
     }

     cleanup() {
       const now = Date.now();
       for (const [key, entry] of this.cache.entries()) {
         if (now - entry.timestamp > this.maxAge) {
           this.cache.delete(key);
         }
       }
     }
   }
   ```

### セキュリティ強化

1. **入力検証の強化**
   ```typescript
   class InputValidator {
     static validateToolInput(toolName: string, args: unknown): boolean {
       // ツール名の形式チェック
       if (!/^[a-z0-9_]+$/.test(toolName)) {
         throw new McpError(
           ErrorCode.InvalidParams,
           'Tool name must contain only lowercase letters, numbers, and underscores'
         );
       }

       // 引数の型チェック
       if (!args || typeof args !== 'object') {
         throw new McpError(
           ErrorCode.InvalidParams,
           'Arguments must be an object'
         );
       }

       // その他のバリデーション
       return true;
     }
   }
   ```

2. **レート制限の実装**
   ```typescript
   class RateLimiter {
     private requests = new Map<string, number[]>();
     private readonly windowMs = 60000; // 1分
     private readonly maxRequests = 100; // 1分あたり100リクエスト

     isAllowed(clientId: string): boolean {
       const now = Date.now();
       const windowStart = now - this.windowMs;
       
       // 古いリクエストを削除
       let requests = this.requests.get(clientId) || [];
       requests = requests.filter(time => time > windowStart);
       
       if (requests.length >= this.maxRequests) {
         return false;
       }
       
       requests.push(now);
       this.requests.set(clientId, requests);
       return true;
     }
   }
   ```

### 運用管理

1. **ログローテーション**
   ```typescript
   import { createWriteStream, rename } from 'fs/promises';
   import { format } from 'date-fns';

   class LogManager {
     private currentLogStream: WriteStream;
     private readonly maxSize = 10 * 1024 * 1024; // 10MB
     private currentSize = 0;

     constructor(private readonly logDir: string) {
       this.rotateIfNeeded();
     }

     async log(message: string) {
       const entry = `${new Date().toISOString()} ${message}\n`;
       this.currentSize += Buffer.byteLength(entry);
       
       if (this.currentSize >= this.maxSize) {
         await this.rotateLog();
       }
       
       this.currentLogStream.write(entry);
     }

     private async rotateLog() {
       const oldLog = `${this.logDir}/mcp-server.${format(new Date(), 'yyyyMMdd-HHmmss')}.log`;
       await rename(`${this.logDir}/mcp-server.log`, oldLog);
       this.currentLogStream = createWriteStream(`${this.logDir}/mcp-server.log`);
       this.currentSize = 0;
     }
   }
   ```

2. **ヘルスチェック機能**
   ```typescript
   class HealthCheck {
     private readonly checks = new Map<string, () => Promise<boolean>>();
     private status = {
       healthy: true,
       lastCheck: Date.now(),
       details: {} as Record<string, boolean>
     };

     addCheck(name: string, check: () => Promise<boolean>) {
       this.checks.set(name, check);
     }

     async runChecks() {
       for (const [name, check] of this.checks.entries()) {
         try {
           this.status.details[name] = await check();
         } catch (error) {
           this.status.details[name] = false;
         }
       }

       this.status.healthy = Object.values(this.status.details).every(Boolean);
       this.status.lastCheck = Date.now();
       
       return this.status;
     }
   }
   ```

### コード品質

1. **型の厳密な使用**
   ```typescript
   // 悪い例
   type AnyObject = { [key: string]: any };

   // 良い例
   interface ToolConfig {
     name: string;
     version: string;
     options?: {
       timeout?: number;
       retries?: number;
     };
   }
   ```

2. **テストカバレッジの向上**
   ```typescript
   // テストユーティリティ
   class TestUtils {
     static async createMockServer() {
       const server = new Server({
         name: 'test-server',
         version: '1.0.0'
       }, {
         capabilities: {
           tools: {},
           resources: {}
         }
       });

       // モックトランスポートの設定
       const mockTransport = new MockTransport();
       await server.connect(mockTransport);
       
       return { server, transport: mockTransport };
     }

     static generateTestCases() {
       return [
         // 正常系のテストケース
         { input: { text: 'test' }, expected: 'test' },
         // エラー系のテストケース
         { input: {}, expectedError: ErrorCode.InvalidParams },
         // エッジケース
         { input: { text: ''.padStart(1000000, 'a') }, expected: 'error' }
       ];
     }
   }
   ```

## 10. リリースチェックリスト

1. コード品質
   - [ ] すべてのテストが通過
   - [ ] コードレビューの完了
   - [ ] リンター/フォーマッターの実行
   - [ ] 型チェックの完了
   - [ ] 未使用コードの削除

2. セキュリティ
   - [ ] 依存関係の脆弱性チェック
   - [ ] 機密情報の漏洩チェック
   - [ ] 入力バリデーションの確認
   - [ ] エラーメッセージでの情報漏洩チェック

3. パフォーマンス
   - [ ] メモリリークのチェック
   - [ ] 負荷テストの実施
   - [ ] リソース使用量の確認
   - [ ] キャッシュ戦略の確認

4. 運用準備
   - [ ] ログ出力の確認
   - [ ] モニタリング設定
   - [ ] バックアップ戦略
   - [ ] 障害復旧手順の確認

5. ドキュメント
   - [ ] API仕様書の更新
   - [ ] 設定ファイルの説明
   - [ ] トラブルシューティングガイド
   - [ ] 変更履歴の記録
## 11. MCP仕様と開発雛形の役割

- **MCP仕様**: MCP (Model Context Protocol) は、各MCPサーバー間でツール、リソース、コンテキスト情報を統一的にやりとりするためのプロトコルです。これにより、異なるシステム間での連携が容易になり、柔軟な拡張が可能となります。

- **開発雛形の役割**: 本雛形は、MCPサーバー開発のための基本構造、依存関係の設定、スキーマ定義、エラーハンドリング、セキュリティ、およびパフォーマンス最適化に関するベストプラクティスを提供します。これにより、迅速なプロジェクト立ち上げと一貫性のある実装が実現できます。

- **利用手順**:
  1. 雛形の内容をもとにプロジェクトを初期化
  2. 必要な依存関係や設定をカスタマイズ
  3. 指定されたガイドラインに沿って開発を進め、運用環境に適用する

- **注意事項**: 雛形に記載された設定やコードは基本例であり、実際の運用環境や要件に応じたカスタマイズが必要です。各プロジェクトの目的に合わせ、適宜調整してください。