import React, { useState } from "react";
import { invokeLLM, PromptHistory } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Copy, ArrowRight, Wand2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import OptionsDrawer from "../components/prompt/OptionsDrawer";
import ResultDisplay from "../components/prompt/ResultDisplay";

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

以下のユーザーの質問を分析し、適切なカスタマイズオプションを生成してください。

ユーザーの質問：
${question}

以下のJSON形式で返してください：
{
  "persona": "最適なペルソナ",
  "method": "推奨される回答手法",
  "key_points": ["重要ポイント1", "ポイント2"],
  "context": "質問の背景",
  "question_type": "質問タイプ",
  "custom_options": [
    {
      "key": "logic_structure",
      "label": "論理構造",
      "description": "説明の構成方法",
      "values": [
        {"value": "conclusion_first", "label": "結論→理由→例"},
        {"value": "three_points", "label": "3ポイント整理"},
        {"value": "not_specified", "label": "指定しない"},
        {"value": "other", "label": "その他"}
      ],
      "default": "conclusion_first",
      "recommended": "conclusion_first"
    }
  ]
}
`;

      const analysis = await invokeLLM({
        prompt: analysisPrompt,
        response_json_schema: { type: "object" },
      });

      setAnalysisData(analysis);
      setCustomOptions(analysis.custom_options);

      const initialOptions = {};
      analysis.custom_options.forEach((opt) => {
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
以下のユーザーの質問を分析してください。

ユーザーの質問：
${question}

以下のJSON形式で返してください：
{
  "persona": "最適なペルソナ",
  "method": "推奨される回答手法",
  "key_points": ["ポイント1", "ポイント2"],
  "context": "質問の背景",
  "question_type": "質問タイプ"
}
`;

      const analysis = await invokeLLM({
        prompt: analysisPrompt,
        response_json_schema: { type: "object" },
      });

      const optimizationPrompt = `
以下のユーザーの質問を、AIに対する高品質なプロンプトに変換してください。

【元の質問】
${question}

【分析結果】
- ペルソナ: ${analysis.persona}
- 手法: ${analysis.method}
- ポイント: ${analysis.key_points.join(", ")}

最適化されたプロンプトのみを返してください。
`;

      const result = await invokeLLM({ prompt: optimizationPrompt });

      setOptimizedPrompt(result);
      setAnalysisData(analysis);
      setStep("result");

      await PromptHistory.create({
        original_question: question,
        optimized_prompt: result,
        options: {},
        persona: analysis.persona,
        method: analysis.method,
      });

      toast.success("プロンプトを生成しました！");
    } catch (error) {
      console.error("Error:", error);
      toast.error("エラーが発生しました");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateWithOptions = async () => {
    setIsGenerating(true);
    setIsOptionsOpen(false);
    try {
      const optionsDesc = customOptions
        .map((opt) => {
          const val = options[opt.key];
          const label = opt.values.find((v) => v.value === val)?.label;
          return val !== "not_specified" ? `${opt.label}: ${label}` : null;
        })
        .filter(Boolean)
        .join(", ");

      const optimizationPrompt = `
以下の質問を最適化してください。

【質問】
${question}

【分析】
- ペルソナ: ${analysisData.persona}
- 手法: ${analysisData.method}

【ユーザー希望】
${optionsDesc}

最適化されたプロンプトを返してください。
`;

      const result = await invokeLLM({ prompt: optimizationPrompt });

      setOptimizedPrompt(result);
      setStep("result");

      await PromptHistory.create({
        original_question: question,
        optimized_prompt: result,
        options,
        persona: analysisData.persona,
        method: analysisData.method,
      });

      toast.success("プロンプトを生成しました！");
    } catch (error) {
      console.error("Error:", error);
      toast.error("エラーが発生しました");
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
                style={{
                  filter:
                    "invert(57%) sepia(82%) saturate(3000%) hue-rotate(175deg) brightness(95%) contrast(101%)",
                }}
              />
            </div>
            <span className="text-xs md:text-sm font-medium bg-gradient-to-r from-sky-900 to-blue-900 bg-clip-text text-transparent">
              Question Plus
            </span>
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
                  className="min-h-[140px] md:min-h-[180px] text-sm md:text-base resize-none"
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
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                          分析中...
                        </>
                      ) : (
                        <>
                          <SlidersHorizontal className="w-4 h-4" />
                          オプション
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleQuickGenerate}
                      disabled={isAnalyzing || isGenerating || !question.trim()}
                      className="bg-gradient-to-r from-sky-500 to-blue-600"
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
                <div className="w-10 h-10 md:w-12 md:h-12 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-sky-600" />
                </div>
                <h3 className="text-xs md:text-sm font-semibold text-slate-900 mb-1">
                  自動分析
                </h3>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <Wand2 className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <h3 className="text-xs md:text-sm font-semibold text-slate-900 mb-1">
                  プロ級変換
                </h3>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <Copy className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                </div>
                <h3 className="text-xs md:text-sm font-semibold text-slate-900 mb-1">
                  すぐ使える
                </h3>
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
