import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Copy, ArrowRight, Wand2, Settings, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import OptionsDrawer from "../components/prompt/OptionsDrawer";
import ResultDisplay from "../components/prompt/ResultDisplay";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [step, setStep] = useState("input");
  const [options, setOptions] = useState(null);
  const [customOptions, setCustomOptions] = useState(null);
  const [optimizedPrompt, setOptimizedPrompt] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const handleAnalyze = async () => {
    if (!question.trim()) {
      toast.error("質問を入力してください");
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisPrompt = `
【重要な制約】
- 質問の内容のみに基づいて分析すること
- 推測や仮定は一切行わないこと
- 確実に判断できる情報のみを使用すること
- 不明な点がある場合は汎用的な選択肢を提供すること

以下のユーザーの質問を分析し、適切なカスタマイズオプションを生成してください。

ユーザーの質問：
${question}

【質問の目的を特定】
まず、この質問の主な目的を特定してください：
- アイデア出し：新しいアイデアや選択肢を求めている
- 情報収集：事実やデータ、知識を求めている
- 文章作成：レポート、記事、投稿文などを作成したい
- 意見を求める：判断や評価、アドバイスがほしい
- 説明してほしい：概念や仕組みを理解したい
- 比較検討：複数の選択肢を比較したい
- 問題解決：課題の解決策を探している
- その他

【目的別の最適なカスタマイズオプション】
質問の目的に応じて、本当に必要なオプションのみを3〜6個選んでください：

アイデア出し向け：
- アイデアの個数（3個/5個/10個/できるだけ多く/指定しない/その他）
- 創造性（現実的/バランス/斬新/突飛/指定しない/その他）
- 論理構造（必須）

情報収集向け：
- 視点（中立的/肯定的/否定的/両面から/指定しない/その他）
- 情報の深さ（概要のみ/標準/詳細/専門的/指定しない/その他）
- 論理構造（必須）

文章作成向け（特に学校レポート・課題の場合は下記の推奨設定を含める）：
- 分量（短め/普通/長め/その他（文字数指定など））
- 文体（カジュアル/標準/フォーマル/AIが書いたとバレないように/指定しない/その他）
- トーン（優しい/中立/厳しい/大学レポート風/指定しない/その他）
- 対象読者（一般/専門家/初心者/大学教授/指定しない/その他）
- 論理構造（必須）

意見を求める向け：
- スタンス（批判的/中立的/肯定的/バランス/指定しない/その他）
- 厳しさ（優しめ/標準/厳しめ/本音でズバッと/指定しない/その他）
- 論理構造（必須）

説明してほしい向け：
- わかりやすさ（小学生向け/中高生向け/初心者向け/専門用語あり/指定しない/その他）
- 専門性（基礎/中級/上級/指定しない/その他）
- 具体例の量（少なめ/適度/多め/指定しない/その他）
- 論理構造（必須）

【重要】論理構造カテゴリーは必ず含め、質問に最も適した論理構造を自動推奨する（defaultとrecommendedに設定）

【学校レポート・課題の検出と推奨設定】
質問に「レポート」「課題」「論文」「提出」「授業」「大学」などが含まれる、または学術的文脈の場合：
- 文体のrecommended → 「AIが書いたとバレないように」
- トーンのrecommended → 「大学レポート風」
- 対象読者のrecommended → 「大学教授」
を設定してください

以下のJSON形式で返してください：
{
  "persona": "最適なペルソナ",
  "method": "推奨される回答手法",
  "key_points": ["重要ポイント1", "ポイント2", "ポイント3"],
  "context": "質問の背景や意図",
  "question_type": "質問のカテゴリー",
  "custom_options": [
    {
      "key": "logic_structure",
      "label": "論理構造",
      "description": "説明の構成方法",
      "values": [
        {"value": "conclusion_first", "label": "結論→理由→例"},
        {"value": "three_points", "label": "3ポイント整理"},
        {"value": "pros_cons", "label": "メリデメ比較"},
        {"value": "step_by_step", "label": "ステップ形式"},
        {"value": "not_specified", "label": "指定しない"},
        {"value": "other", "label": "その他"}
      ],
      "default": "conclusion_first",
      "recommended": "conclusion_first"
    },
    {
      "key": "writing_style",
      "label": "文体",
      "description": "どんな文体で書いてほしいか",
      "values": [
        {"value": "casual", "label": "カジュアル"},
        {"value": "standard", "label": "標準"},
        {"value": "formal", "label": "フォーマル"},
        {"value": "natural_ai", "label": "AIが書いたとバレないように"},
        {"value": "not_specified", "label": "指定しない"},
        {"value": "other", "label": "その他"}
      ],
      "default": "not_specified",
      "recommended": "natural_ai"
    },
    {
      "key": "tone",
      "label": "トーン",
      "description": "どんなトーンで書いてほしいか",
      "values": [
        {"value": "friendly", "label": "優しい"},
        {"value": "neutral", "label": "中立"},
        {"value": "strict", "label": "厳しい"},
        {"value": "academic", "label": "大学レポート風"},
        {"value": "not_specified", "label": "指定しない"},
        {"value": "other", "label": "その他"}
      ],
      "default": "not_specified",
      "recommended": "academic"
    },
    {
      "key": "target_reader",
      "label": "対象読者",
      "description": "誰に向けて書くか",
      "values": [
        {"value": "general", "label": "一般"},
        {"value": "expert", "label": "専門家"},
        {"value": "beginner", "label": "初心者"},
        {"value": "professor", "label": "大学教授"},
        {"value": "not_specified", "label": "指定しない"},
        {"value": "other", "label": "その他"}
      ],
      "default": "not_specified",
      "recommended": "professor"
    },
    {
      "key": "length",
      "label": "分量",
      "description": "どのくらいの長さにするか",
      "values": [
        {"value": "short", "label": "短め"},
        {"value": "medium", "label": "普通"},
        {"value": "long", "label": "長め"},
        {"value": "not_specified", "label": "指定しない"},
        {"value": "other", "label": "その他（文字数指定など）"}
      ],
      "default": "not_specified"
    }
  ]
  
  【重要】上記は学校レポート用の例です。質問の目的を分析し、その目的に本当に適したオプションのみを3〜6個生成してください。
  レポート・課題でない場合は、適切なオプションに変更してください。
}

重要：
- テンプレートはあくまで参考。質問に本当に適したオプションを柔軟に生成する
- 長さは相対的表現（短め/普通/長め/その他（文字数指定など））
- 視点・テンションは「中立的/批判的/肯定的/両方の角度から」など
- 必ず「指定しない」と「その他」または「その他（〇〇）」を各オプションに含める
- 【重要】論理構造カテゴリーは必須。質問に最適な論理構造を選び、defaultとrecommendedに設定する
- 論理構造以外のdefaultは"not_specified"
- recommendedフィールドで推奨選択肢を明示（論理構造以外も推奨がある場合は設定可能）
- 【学校レポート検出】質問に「レポート」「課題」「論文」「提出」などが含まれる、または学術的文脈の場合：
  文体→「AIが書いたとバレないように」、トーン→「大学レポート風」、対象読者→「大学教授」をrecommendedに設定
`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            persona: { type: "string" },
            method: { type: "string" },
            key_points: { type: "array", items: { type: "string" } },
            context: { type: "string" },
            question_type: { type: "string" },
            custom_options: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: { type: "string" },
                  label: { type: "string" },
                  description: { type: "string" },
                  values: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        value: { type: "string" },
                        label: { type: "string" }
                      }
                    }
                  },
                  default: { type: "string" },
                  recommended: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAnalysisData(analysis);
      setCustomOptions(analysis.custom_options);
      
      const initialOptions = {};
      analysis.custom_options.forEach(opt => {
        initialOptions[opt.key] = opt.default || "not_specified";
      });
      setOptions(initialOptions);
      
      setIsOptionsOpen(true);
      toast.success("質問を分析しました！");
    } catch (error) {
      console.error("Error analyzing question:", error);
      toast.error("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickGenerate = async () => {
    setIsGenerating(true);
    try {
      const analysisPrompt = `
【重要な制約】
- 質問の内容のみに基づいて分析すること
- 推測や仮定は一切行わないこと  
- 確実に判断できる情報のみを使用すること

以下のユーザーの質問を分析してください。

ユーザーの質問：
${question}

以下のJSON形式で返してください：
{
  "persona": "最適なペルソナ（例：戦略コンサルタント、UXデザイナー、心理カウンセラー、技術アーキテクトなど）",
  "method": "推奨される回答手法（例：PREP法、デザイン思考、5Why分析、SWOT分析など）",
  "key_points": ["考慮すべき重要ポイント1", "ポイント2", "ポイント3"],
  "context": "質問の背景や意図",
  "question_type": "質問のカテゴリー"
}
`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            persona: { type: "string" },
            method: { type: "string" },
            key_points: { type: "array", items: { type: "string" } },
            context: { type: "string" },
            question_type: { type: "string" }
          }
        }
      });

      const optimizationPrompt = `
以下のユーザーの質問を、AIに対する高品質なプロンプトに変換してください。

【元の質問】
${question}

【分析結果】
- 質問タイプ: ${analysis.question_type}
- 推奨ペルソナ: ${analysis.persona}
- 推奨手法: ${analysis.method}
- 重要ポイント: ${analysis.key_points.join(", ")}
- 文脈: ${analysis.context}

【プロンプト最適化の原則】
1. ペルソナを明確に：「${analysis.persona}として回答してください」
2. 出力構造を指定：${analysis.method}に基づいた構成（結論→理由→例→まとめなど）
3. 禁止事項を明記：「一般論でまとめない」「抽象的な表現で逃げない」「推測や憶測で答えない」「知らないことは知らないと言う」など
4. 曖昧語を定義：「わかりやすく＝具体例を必ず入れる」など
5. 反対視点も要求：メリット・デメリット、成功例・失敗例など両面を
6. ノイズを削除：余計な前置きや挨拶なし、必要な情報のみ
7. 出力の幅を限定：抽象度や専門性のレベルを明示
8. 思考ステップを強制：「まず〜、次に〜、最後に〜」のように段階指定
9. 強度を指定：主張・批判・感情表現の強さを調整
10. 前提の世界を与える：「誰に対して、どんな状況で使う回答か」を明示
11. 【ハルシネーション防止】「確実な情報のみを提供すること」「不確実な場合は明示すること」「推測で補わないこと」を必ず含める

上記を踏まえ、以下の要素を含む最適化されたプロンプトを作成：
• ペルソナ指定（${analysis.persona}として）
• 出力構造の明示（${analysis.method}の形式で）
• 具体的な禁止事項（曖昧な回答をしない、推測しない、知らないことは知らないと言う、など）
• ハルシネーション防止策（「確実な情報のみ提供」「不確実な場合は明示」「事実に基づいて回答」を明記）
• 考慮すべきポイント（${analysis.key_points.join(", ")}）
• 元の質問内容

最適化されたプロンプトのみを返してください。前置きや説明は不要です。
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: optimizationPrompt
      });

      setOptimizedPrompt(result);
      setAnalysisData(analysis);
      setStep("result");

      await base44.entities.PromptHistory.create({
        original_question: question,
        optimized_prompt: result,
        options: {},
        persona: analysis.persona,
        method: analysis.method
      });

      toast.success("プロンプトを生成しました！");
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast.error("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateWithOptions = async () => {
    setIsGenerating(true);
    setIsOptionsOpen(false);
    try {
      const optionsInstructions = customOptions.map(opt => {
        const selectedValue = options[opt.key];
        const selectedLabel = opt.values.find(v => v.value === selectedValue)?.label || selectedValue;
        
        if (selectedValue === 'not_specified' || selectedLabel === '指定しない') {
          return null;
        }
        
        // 具体的な指示に変換
        let instruction = `- ${opt.label}: ${selectedLabel}`;
        
        // 特別な処理が必要なオプション
        if (opt.key === 'writing_style' && selectedValue === 'natural_ai') {
          instruction += '\n  【重要】人間らしい自然な文体で書くこと。完璧すぎる文章、機械的な表現、定型的なフレーズを避け、多少のゆらぎや個性を含めること。';
        }
        
        if (opt.key === 'length' && selectedValue.startsWith('other:')) {
          const customLength = selectedValue.replace('other:', '');
          instruction = `- 文字数制限: ${customLength}\n  【厳守】必ず指定された文字数を守ること。文字数を数えながら執筆し、超過も不足も許されない。`;
        }
        
        return instruction;
      }).filter(Boolean).join('\n');
      
      const optionsDescription = optionsInstructions;

      const optimizationPrompt = `
以下のユーザーの質問を、AIに対する高品質なプロンプトに変換してください。

【元の質問】
${question}

【分析結果】
- 質問タイプ: ${analysisData.question_type}
- ペルソナ: ${analysisData.persona}
- 回答手法: ${analysisData.method}
- 重要ポイント: ${analysisData.key_points.join(", ")}
- 文脈: ${analysisData.context}

${optionsDescription ? `【ユーザーの希望】\n${optionsDescription}` : ''}

【プロンプト最適化の原則】
1. ペルソナを明確に：「${analysisData.persona}として回答してください」
2. 出力構造を指定：${analysisData.method}に基づいた構成（結論→理由→例→まとめなど）
3. 禁止事項を明記：「一般論でまとめない」「抽象的な表現で逃げない」など
4. 曖昧語を定義：「わかりやすく＝具体例を必ず入れる」など
5. 反対視点も要求：メリット・デメリット、成功例・失敗例など両面を
6. ノイズを削除：余計な前置きや挨拶なし、必要な情報のみ
7. 出力の幅を限定：抽象度や専門性のレベルを明示
8. 思考ステップを強制：「まず〜、次に〜、最後に〜」のように段階指定
9. 強度を指定：主張・批判・感情表現の強さを調整
10. 前提の世界を与える：「誰に対して、どんな状況で使う回答か」を明示
11. 【文字数指定がある場合】「必ず〇〇文字以内/〇〇文字程度に収めること」を明記し、厳守を強調
12. 【人間らしい文体の場合】「完璧すぎる文章を避け、自然な表現とゆらぎを含める」ことを明記

上記を踏まえ、以下の要素を含む最適化されたプロンプトを作成：
• ペルソナ指定（${analysisData.persona}として）
• 出力構造の明示（${analysisData.method}の形式で）
• 具体的な禁止事項（曖昧な回答をしない、推測しない、知らないことは知らないと言う、など）
• ハルシネーション防止策（「確実な情報のみ提供」「不確実な場合は明示」「事実に基づいて回答」を明記）
• ユーザーの希望条件を具体的な指示に変換して反映（特に文体や文字数は強調）
• 考慮すべきポイント（${analysisData.key_points.join(", ")}）
• 元の質問内容

最適化されたプロンプトのみを返してください。前置きや説明は不要です。
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: optimizationPrompt
      });

      setOptimizedPrompt(result);
      setStep("result");

      await base44.entities.PromptHistory.create({
        original_question: question,
        optimized_prompt: result,
        options: options,
        persona: analysisData.persona,
        method: analysisData.method
      });

      toast.success("プロンプトを生成しました！");
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast.error("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setQuestion("");
    setStep("input");
    setOptions(null);
    setCustomOptions(null);
    setOptimizedPrompt(null);
    setAnalysisData(null);
  };

  const handleBackToInput = () => {
    setStep("input");
    setOptimizedPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-sky-100 to-blue-100 rounded-full mb-3 md:mb-4">
            <div className="w-5 h-5 flex items-center justify-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691b2d7a553ce20461470bd8/9c02490eb_icon_code_brackets.png" 
                alt="Q+" 
                className="w-5 h-5"
                style={{ filter: 'invert(57%) sepia(82%) saturate(3000%) hue-rotate(175deg) brightness(95%) contrast(101%)' }}
              />
            </div>
            <span className="text-xs md:text-sm font-medium bg-gradient-to-r from-sky-900 to-blue-900 bg-clip-text text-transparent">Question Plus</span>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-2 md:mb-3">
            AIの力を、最大限に引き出す
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto px-4">
            質問をプロフェッショナルなプロンプトに変換して、AIから最高の回答を
          </p>
        </div>

        {step === "input" && (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-none bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-100 pb-3 md:pb-4">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Wand2 className="w-4 h-4 md:w-5 md:h-5 text-sky-600" />
                  質問を入力してください
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 md:pt-5">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="例：上司にアイデアを提案したいけど、どう説明したらいい？"
                  className="min-h-[140px] md:min-h-[180px] text-sm md:text-base resize-none border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                />
                <div className="mt-3 md:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <span className="text-xs md:text-sm text-slate-500">
                    {question.length} 文字
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || isGenerating || !question.trim()}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                          分析中...
                        </>
                      ) : (
                        <>
                          <SlidersHorizontal className="w-4 h-4" />
                          カスタマイズオプション
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleQuickGenerate}
                      disabled={isAnalyzing || isGenerating || !question.trim()}
                      className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          生成中...
                        </>
                      ) : (
                        <>
                          生成
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 md:mt-12 grid grid-cols-3 gap-4 md:gap-6">
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-sky-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-sky-600" />
                </div>
                <h3 className="text-xs md:text-sm font-semibold text-slate-900 mb-1">自動分析</h3>
                <p className="text-xs text-slate-600 hidden md:block">
                  質問内容から最適な<br />ペルソナと手法を選択
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <Wand2 className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <h3 className="text-xs md:text-sm font-semibold text-slate-900 mb-1">プロ級変換</h3>
                <p className="text-xs text-slate-600 hidden md:block">
                  誰でも使えるのに<br />結果は高品質
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <Copy className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                </div>
                <h3 className="text-xs md:text-sm font-semibold text-slate-900 mb-1">すぐ使える</h3>
                <p className="text-xs text-slate-600 hidden md:block">
                  コピーしてそのまま<br />AIに質問できる
                </p>
              </div>
            </div>
          </div>
        )}

        {step === "result" && (
          <ResultDisplay
            originalQuestion={question}
            optimizedPrompt={optimizedPrompt}
            analysisData={analysisData}
            options={options}
            customOptions={customOptions}
            onReset={handleReset}
            onBackToOptions={handleBackToInput}
          />
        )}
      </div>

      <OptionsDrawer
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        options={options}
        setOptions={setOptions}
        customOptions={customOptions}
        onGenerate={handleGenerateWithOptions}
        isProcessing={isGenerating}
      />
    </div>
  );
}