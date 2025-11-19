# Question Plus (Q+)

AIから最高の答えを引き出す - 質問をプロフェッショナルなプロンプトに変換

## 🚀 デプロイ

### Vercelへのデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/question-plus)

1. 上のボタンをクリック、またはVercelダッシュボードから手動でデプロイ
2. 環境変数を設定（オプション）:
   - `VITE_ANTHROPIC_API_KEY`: Anthropic APIキー（なくてもデモモードで動作します）

## 💻 ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## ⚙️ 環境変数

`.env`ファイルを作成（オプション）:

```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

**注意**: APIキーがない場合でも、デモモードで動作します。

## 🎯 機能

- **自動分析**: 質問内容から最適なペルソナと手法を自動選択
- **カスタマイズ可能**: 論理構造、トーン、文体などを細かく調整
- **履歴管理**: 過去の変換結果を保存・検索
- **レスポンシブ**: PC・スマートフォン両対応

## 🛠 技術スタック

- **フレームワーク**: React 18 + Vite
- **ルーティング**: React Router v7
- **UI**: Tailwind CSS + shadcn/ui
- **アイコン**: Lucide React
- **通知**: Sonner
- **日付**: date-fns
- **AI**: Anthropic Claude API (オプション)

## 📝 使い方

1. **質問を入力**: テキストエリアに質問を入力
2. **生成方法を選択**:
   - **生成ボタン**: すぐに最適化されたプロンプトを生成
   - **カスタマイズオプション**: 詳細設定を行ってから生成
3. **結果をコピー**: 生成されたプロンプトをコピーしてAIチャットボットに貼り付け

## 🔒 データ保存

- すべてのデータはブラウザのローカルストレージに保存されます
- サーバーにデータは送信されません（APIキー使用時を除く）
- プライバシーとセキュリティを重視した設計

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

Issue、Pull Requestは歓迎します！

---

© 2024 Question Plus (Q+). All rights reserved.
