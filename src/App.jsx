import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App
```

### 3. ファイル構造を確認

プロジェクトの構造が以下のようになっていることを確認してください：
```
question-plus/
├── src/
│   ├── api/              # この古いフォルダは削除してOK
│   ├── components/
│   │   ├── prompt/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   │   ├── api.js       # ← この新しいファイルを作成
│   │   └── utils.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── History.jsx
│   │   ├── Layout.jsx
│   │   └── index.jsx
│   ├── utils/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── .env.example
