const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-latest" });

  // 1. テンプレートファイルを特定する
  // カレントディレクトリから「Template」で始まり「.html」で終わるファイルを探す
  const files = fs.readdirSync("./");
  const templateFile = files.find(f => f.startsWith("Template") && f.endsWith(".html"));

  if (!templateFile) {
    console.error("エラー: Template[数字].html が見つかりません。");
    process.exit(1);
  }

  console.log(`使用するテンプレート: ${templateFile}`);

  // 2. ファイルの読み込み
  const hearingSheet = fs.readFileSync("HearingSheet.md", "utf8");
  const templateHtml = fs.readFileSync(templateFile, "utf8");

  // 3. AIへのプロンプト
  const prompt = `
    あなたは熟練のフロントエンドエンジニアです。
    提供された【HTMLテンプレート】のデザイン・構造・CSS・JSを一切壊さずに、
    【ヒアリングシート】の内容を反映させた新しいLPのHTMLを作成してください。

    【制約事項】
    - テンプレート内の画像パスやクラス名、スタイルは維持すること。
    - 出力は更新後のHTMLコードのみを返し、解説文やMarkdownのデコレーションは含めない。

    【ヒアリングシート】
    ${hearingSheet}

    【HTMLテンプレート（${templateFile}）】
    ${templateHtml}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let newHtml = response.text().replace(/```html|```/g, "").trim();

    // 4. index.html として出力（これが公開用ファイルになる）
    fs.writeFileSync("index.html", newHtml);
    console.log("Success: index.html has been generated from " + templateFile);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();
