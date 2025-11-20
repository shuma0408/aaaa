// シンプルなローカルストレージベースのAPI実装
// 実際のプロダクションでは、バックエンドAPIを使用してください

const STORAGE_KEY = 'question_plus_history';

// ローカルストレージからデータを取得
const getStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Storage error:', error);
    return [];
  }
};

// ローカルストレージにデータを保存
const setStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Storage error:', error);
  }
};

// Claude APIを呼び出す（環境変数がある場合）
export const invokeLLM = async ({ prompt, response_json_schema }) => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  
  // APIキーがない場合はデモモード
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.warn('Using demo mode - add VITE_ANTHROPIC_API_KEY to enable real AI');
    return generateDemoResponse(prompt, response_json_schema);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content[0].text;

    // JSONスキーマが指定されている場合はパース
    if (response_json_schema) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return text;
  } catch (error) {
    console.error('LLM error:', error);
    // エラー時はデモモードにフォールバック
    return generateDemoResponse(prompt, response_json_schema);
  }
};

// デモレスポンスを生成（APIキーがない場合）
const generateDemoResponse = (prompt, response_json_schema) => {
  if (response_json_schema) {
    // 分析レスポンス
    if (prompt.includes('カスタマイズオプション')) {
      return {
        persona: '問題解決コンサルタント',
        method: 'PREP法（結論→理由→例→結論）',
        key_points: ['具体的な状況の把握', '目的の明確化', '実行可能な提案'],
        context: 'ビジネスコミュニケーションにおける効果的なプレゼンテーション',
        question_type: '提案・説得',
        custom_options: [
          {
            key: 'logic_structure',
            label: '論理構造',
            description: '説明の構成方法',
            values: [
              { value: 'conclusion_first', label: '結論→理由→例' },
              { value: 'three_points', label: '3ポイント整理' },
              { value: 'pros_cons', label: 'メリデメ比較' },
              { value: 'not_specified', label: '指定しない' },
              { value: 'other', label: 'その他' },
            ],
            default: 'conclusion_first',
            recommended: 'conclusion_first',
          },
          {
            key: 'tone',
            label: 'トーン',
            description: 'どんなトーンで説明するか',
            values: [
              { value: 'friendly', label: '優しい' },
              { value: 'neutral', label: '中立' },
              { value: 'strict', label: '厳しい' },
              { value: 'not_specified', label: '指定しない' },
              { value: 'other', label: 'その他' },
            ],
            default: 'not_specified',
          },
        ],
      };
    } else {
      // クイック分析レスポンス
      return {
        persona: '戦略コンサルタント',
        method: 'PREP法',
        key_points: ['論理的な構成', '具体例の提示', '説得力の強化'],
        context: '効果的なコミュニケーション',
        question_type: '一般的な質問',
      };
    }
  }

  // プロンプト最適化レスポンス
  return `以下のように説明すると効果的です：

【あなたの役割】
戦略コンサルタントとして、ビジネスシーンでの提案方法をアドバイスしてください。

【回答の構成】
1. まず結論を明確に述べる
2. その理由を2-3点挙げる
3. 具体的な例や実践方法を示す
4. 最後にもう一度結論を強調する

【重要な制約】
- 一般論で終わらせず、具体的なアクションまで示すこと
- 曖昧な表現を避け、明確な言葉を使うこと
- 相手の立場や状況を考慮した提案をすること

【元の質問】
${prompt.match(/【元の質問】\n(.+?)\n/)?.[1] || '上司にアイデアを提案する方法'}

上記を踏まえて、具体的で実践的なアドバイスをお願いします。`;
};

// 履歴管理API
export const PromptHistory = {
  list: async () => {
    return getStorage().sort((a, b) => 
      new Date(b.created_date) - new Date(a.created_date)
    );
  },

  create: async (data) => {
    const history = getStorage();
    const newItem = {
      id: Date.now().toString(),
      ...data,
      created_date: new Date().toISOString(),
    };
    history.push(newItem);
    setStorage(history);
    return newItem;
  },

  delete: async (id) => {
    const history = getStorage();
    const filtered = history.filter((item) => item.id !== id);
    setStorage(filtered);
    return { success: true };
  },
};
