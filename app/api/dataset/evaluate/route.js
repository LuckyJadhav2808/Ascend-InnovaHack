import { NextResponse } from "next/server";
import { evaluateAnswer } from "@/lib/geminiClient";

export async function POST(request) {
  try {
    const body = await request.json();
    const { question, answer, topic, referenceAnswer } = body;

    if (!answer || !question) {
      return NextResponse.json({ success: false, error: "Missing question or answer" }, { status: 400 });
    }

    const cleanAns = answer.toLowerCase().trim();
    const cleanQ = question.toLowerCase().trim();

    const unknownPatterns = [
      "i don't know",
      "i dont know",
      "dont know",
      "don't know",
      "idk",
      "no idea",
      "no concept",
      "pass",
      "skip",
      "dunno",
      "not sure",
      "haven't learned"
    ];

    // Check if response ends in a trailing preposition/conjunction/verb without explaining (e.g. "is", "a", "the")
    const trailingStops = ["is", "are", "a", "an", "the", "in", "of", "to", "for", "with", "and", "or", "that"];
    const wordsArr = cleanAns.split(/\s+/).filter(Boolean);
    const lastWord = wordsArr[wordsArr.length - 1] || "";
    const isTrailingCutoff = trailingStops.includes(lastWord) && wordsArr.length < 8;

    // Check if answer merely repeats question prompt
    const isQuestionRepeat = cleanAns.length > 5 && (cleanQ.includes(cleanAns) || cleanAns.includes(cleanQ));

    // Check if 75%+ of candidate's words are just echoed from question prompt
    const qWordsSet = new Set(cleanQ.split(/\s+/).map((w) => w.replace(/[^a-z0-9]/g, "")).filter((w) => w.length > 2));
    const ansWordsArr = cleanAns.split(/\s+/).map((w) => w.replace(/[^a-z0-9]/g, "")).filter((w) => w.length > 2);
    const echoedCount = ansWordsArr.filter((w) => qWordsSet.has(w)).length;
    const isQuestionEcho = ansWordsArr.length > 0 && (echoedCount / ansWordsArr.length) >= 0.75 && ansWordsArr.length < 10;

    const isUnknown = unknownPatterns.some((pattern) => cleanAns.includes(pattern)) || cleanAns.length < 8 || isTrailingCutoff || isQuestionRepeat || isQuestionEcho;

    if (isUnknown) {
      return NextResponse.json({
        success: true,
        evaluation: {
          score: 0,
          strengths: [],
          gaps: ["Incomplete response or insufficient detail provided."],
          feedback: `Your response was incomplete or ended mid-sentence (Score: 0/100). Please provide a complete technical explanation of ${topic || "this topic"} to earn XP.`,
          conceptsCovered: [],
          suggestedTopics: [topic || "General"]
        }
      });
    }

    let evaluation = null;

    if (process.env.GEMINI_API_KEY) {
      evaluation = await evaluateAnswer(question, answer, topic || "General", referenceAnswer || "");
    }

    // Dataset Reference Answer Fallback Evaluator if Gemini API is unavailable/offline
    if (!evaluation) {
      const stopWords = new Set(["what", "is", "the", "a", "an", "and", "or", "in", "of", "to", "for", "with", "that", "this", "can", "have", "has", "are", "be", "by", "as", "from", "at", "on", "it"]);

      const cleanRef = (referenceAnswer || "").toLowerCase();
      const refWords = cleanRef.split(/\s+/).map((w) => w.replace(/[^a-z0-9]/g, "")).filter((w) => w.length > 2 && !stopWords.has(w));

      const ansWords = cleanAns.split(/\s+/).map((w) => w.replace(/[^a-z0-9]/g, "")).filter((w) => w.length > 2 && !stopWords.has(w));
      const ansWordSet = new Set(ansWords);

      let matchedTerms = [];
      let missingTerms = [];

      if (refWords.length > 0) {
        matchedTerms = [...new Set(refWords.filter((w) => ansWordSet.has(w)))];
        missingTerms = [...new Set(refWords.filter((w) => !ansWordSet.has(w)))];
      }

      let score = 0;
      if (refWords.length > 0) {
        const matchRatio = matchedTerms.length / refWords.length;
        if (matchRatio >= 0.75) score = Math.min(95, 85 + Math.floor(matchRatio * 10));
        else if (matchRatio >= 0.5) score = Math.min(84, 70 + Math.floor(matchRatio * 15));
        else if (matchRatio >= 0.25) score = Math.min(69, 40 + Math.floor(matchRatio * 30));
        else score = 0;
      } else {
        const wordCount = ansWords.length;
        if (wordCount >= 20) score = 80;
        else if (wordCount >= 12) score = 65;
        else if (wordCount >= 8) score = 45;
        else score = 0;
      }

      const matchedListStr = matchedTerms.length > 0 ? matchedTerms.slice(0, 4).join(", ") : "";
      const missingListStr = missingTerms.length > 0 ? missingTerms.slice(0, 4).join(", ") : "";

      evaluation = {
        score,
        strengths: matchedTerms.length > 0
          ? [`Accurately referenced dataset concepts: ${matchedListStr}`]
          : score > 0 ? ["Provided a relevant response to the prompt"] : [],
        gaps: missingTerms.length > 0
          ? [`Target dataset concepts missed: ${missingListStr}`]
          : score === 0 ? ["Response lacked key technical terms from reference answer"] : ["Consider expanding on architectural trade-offs"],
        feedback: score > 0
          ? `Dataset Evaluation Score: ${score}/100. Your answer covered core dataset concepts (${matchedTerms.length}/${refWords.length || ansWords.length} key terms). ${missingListStr ? `To boost score, include: ${missingListStr}.` : ""}`
          : `Dataset Evaluation Score: 0/100. Your response was too brief or missed key reference concepts. Please write a complete explanation of ${topic || "this topic"}.`,
        conceptsCovered: matchedTerms,
        suggestedTopics: missingTerms.slice(0, 2)
      };
    }

    return NextResponse.json({ success: true, evaluation });
  } catch (error) {
    console.error("API /api/dataset/evaluate error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
