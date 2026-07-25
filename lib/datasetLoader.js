/**
 * ASCEND — Server-Side Dataset Loader & Cache
 * 
 * Parses all CSV/JSON datasets from /data at first call,
 * caches in Node.js module scope for zero-cost subsequent reads.
 * 
 * IMPORTANT: This file uses `fs` and must only be imported in
 * server-side code (API routes, not client components).
 */

import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const DATA_DIR = path.join(process.cwd(), "data");

// Module-level cache
let _leetcodeProblems = null;
let _topicMapping = null;
let _topicStats = null;
let _placementQuiz = null;
let _softwareQuestions = null;
let _patterns = null;
let _antiPatterns = null;
let _decisionFrameworks = null;
let _companyFrequency = null;
let _techStackRecs = null;
let _yearlyTrends = null;
let _jobDataset = null;
let _atsResume = null;
let _studentPlacement = null;

// ─── CSV Parser Helper ────────────────────────────────────
function loadCSV(filename, options = {}) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`[DatasetLoader] File not found: ${filePath}`);
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return parse(raw, { columns: true, skip_empty_lines: true, relax_column_count: true, ...options });
}

function loadJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`[DatasetLoader] File not found: ${filePath}`);
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

// ─── LeetCode Problems (3,978 rows) ──────────────────────
export function getLeetcodeProblems() {
  if (!_leetcodeProblems) {
    _leetcodeProblems = loadCSV("leetcode_dataset/problems.csv");
  }
  return _leetcodeProblems;
}

// ─── LeetCode Topic Mapping (12,172 rows) ────────────────
export function getTopicMapping() {
  if (!_topicMapping) {
    _topicMapping = loadCSV("leetcode_dataset/problem_topic_mapping.csv");
  }
  return _topicMapping;
}

// ─── LeetCode Topic Statistics (74 topics) ───────────────
export function getTopicStats() {
  if (!_topicStats) {
    _topicStats = loadCSV("leetcode_dataset/topic_statistics.csv");
  }
  return _topicStats;
}

// ─── Placement Interview Quiz Questions (5,787 MCQs) ─────
export function getPlacementQuiz() {
  if (!_placementQuiz) {
    _placementQuiz = loadCSV("Placement_Interview_Quiz_Questions.csv");
  }
  return _placementQuiz;
}

// ─── Software Questions (200 open-ended Q&A) ─────────────
export function getSoftwareQuestions() {
  if (!_softwareQuestions) {
    _softwareQuestions = loadCSV("Software Questions.csv");
  }
  return _softwareQuestions;
}

// ─── ML System Design Patterns ───────────────────────────
export function getPatterns() {
  if (!_patterns) {
    _patterns = loadJSON("patterns.json");
  }
  return _patterns;
}

// ─── ML System Design Anti-Patterns ──────────────────────
export function getAntiPatterns() {
  if (!_antiPatterns) {
    _antiPatterns = loadJSON("anti_patterns.json");
  }
  return _antiPatterns;
}

// ─── Decision Frameworks (31 architecture decisions) ─────
export function getDecisionFrameworks() {
  if (!_decisionFrameworks) {
    _decisionFrameworks = loadCSV("decision_frameworks.csv");
  }
  return _decisionFrameworks;
}

// ─── Company Frequency (company → topic frequency) ───────
export function getCompanyFrequency() {
  if (!_companyFrequency) {
    _companyFrequency = loadCSV("company_frequency.csv");
  }
  return _companyFrequency;
}

// ─── Tech Stack Recommendations ──────────────────────────
export function getTechStackRecommendations() {
  if (!_techStackRecs) {
    _techStackRecs = loadCSV("tech_stack_recommendations.csv");
  }
  return _techStackRecs;
}

// ─── Yearly Trends ───────────────────────────────────────
export function getYearlyTrends() {
  if (!_yearlyTrends) {
    _yearlyTrends = loadCSV("yearly_trends.csv");
  }
  return _yearlyTrends;
}

// ─── Job Dataset (1,068 job roles with skills) ───────────
export function getJobDataset() {
  if (!_jobDataset) {
    _jobDataset = loadCSV("job_dataset.csv");
  }
  return _jobDataset;
}

// ─── ATS Resume Dataset (~5,000 resumes) ─────────────────
export function getATSResumes() {
  if (!_atsResume) {
    _atsResume = loadCSV("ats_resume_dataset_elite_v3.csv");
  }
  return _atsResume;
}

// ─── Student Placement & Career Success (~20K students) ──
export function getStudentPlacement() {
  if (!_studentPlacement) {
    _studentPlacement = loadCSV("student_placement_career_success_dataset.csv");
  }
  return _studentPlacement;
}

// ─── Derived: Get unique track categories from Job Dataset ─
export function getAvailableTracks() {
  const jobs = getJobDataset();

  // Group jobs by Title (role), pick unique roles
  const roleMap = new Map();
  jobs.forEach((job) => {
    const title = (job.Title || "").trim();
    if (!title || roleMap.has(title)) return;

    const skills = (job.Skills || "").split(";").map((s) => s.trim()).filter(Boolean);
    const keywords = (job.Keywords || "").split(";").map((k) => k.trim()).filter(Boolean);

    roleMap.set(title, {
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title,
      experienceLevel: job.ExperienceLevel || "Fresher",
      skills,
      keywords,
      responsibilities: job.Responsibilities || ""
    });
  });

  // Deduplicate by base role title (e.g., ".NET Developer" appears multiple times for different levels)
  const baseRoles = new Map();
  roleMap.forEach((role) => {
    // Extract base title without experience-level variations
    const baseTitle = role.title;
    if (!baseRoles.has(baseTitle)) {
      baseRoles.set(baseTitle, role);
    } else {
      // Merge skills from multiple experience levels
      const existing = baseRoles.get(baseTitle);
      const mergedSkills = [...new Set([...existing.skills, ...role.skills])];
      baseRoles.set(baseTitle, { ...existing, skills: mergedSkills });
    }
  });

  return Array.from(baseRoles.values());
}

// ─── Derived: Build dynamic skill graph for a track ───────
export function buildSkillGraphForTrack(trackId, customTopics = []) {
  const topicStats = getTopicStats();
  const jobs = getJobDataset();
  const topicMapping = getTopicMapping();

  // For standard job-dataset tracks, extract skills from matching job roles
  let relevantSkills = [];

  if (customTopics.length > 0) {
    // Custom track: use provided topics directly
    relevantSkills = customTopics;
  } else {
    // Find matching job role
    const matchingJob = jobs.find((j) => {
      const jobId = (j.Title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return jobId === trackId || jobId.includes(trackId);
    });

    if (matchingJob) {
      const skills = (matchingJob.Skills || "").split(";").map((s) => s.trim()).filter(Boolean);
      const keywords = (matchingJob.Keywords || "").split(";").map((k) => k.trim()).filter(Boolean);
      relevantSkills = [...new Set([...skills, ...keywords])];
    }
  }

  // If no matching skills found, fallback to top LeetCode topics
  if (relevantSkills.length === 0) {
    relevantSkills = topicStats
      .filter((t) => t.topic && t.topic.trim())
      .sort((a, b) => parseInt(b.problem_count) - parseInt(a.problem_count))
      .slice(0, 8)
      .map((t) => t.topic);
  }

  // Cap to 10 nodes for clean graph
  const graphSkills = relevantSkills.slice(0, 10);

  // Build nodes
  const nodes = graphSkills.map((skill, idx) => {
    // Find problem count from topic stats for weight
    const stat = topicStats.find((t) =>
      t.topic && skill && t.topic.toLowerCase().includes(skill.toLowerCase().substring(0, 6))
    );
    const weight = stat ? parseInt(stat.problem_count) : 50;

    return {
      id: `node-${idx}`,
      topic: skill,
      mastery: 0,
      status: "weak",
      category: categorizeSkill(skill),
      weight
    };
  });

  // Build edges (chain topology + cross-links for related skills)
  const edges = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({ from: nodes[i].id, to: nodes[i + 1].id });
  }

  return { nodes, edges };
}

// ─── Derived: Get questions for a track (open-ended) ──────
export function getQuestionsForTrack(trackId, count = 10, skillGraph = null) {
  const leetcode = getLeetcodeProblems();
  const softwareQs = getSoftwareQuestions();
  const placementQuiz = getPlacementQuiz();
  const topicMapping = getTopicMapping();

  const nodes = skillGraph?.nodes || [];

  if (nodes.length > 0) {
    // Generate questions directly targeting each node topic in the candidate's skill graph
    const topicQuestions = nodes.map((node, idx) => {
      const nodeTopic = node.topic.toLowerCase();

      // 1. Search Software Questions dataset for matches
      const matchedSQs = softwareQs.filter((q) => {
        const qCat = (q.Category || "").toLowerCase();
        const qText = (q.Question || "").toLowerCase();
        return qCat.includes(nodeTopic.substring(0, 4)) || qText.includes(nodeTopic.substring(0, 4));
      });

      if (matchedSQs.length > 0) {
        // Pick a random matching question from software dataset
        const randomSQ = matchedSQs[Math.floor(Math.random() * matchedSQs.length)];
        return {
          id: `sq_${node.id || idx}_${Math.random().toString(36).substring(7)}`,
          source: "software_matched",
          topic: node.topic,
          difficulty: randomSQ.Difficulty || "Medium",
          prompt: randomSQ.Question,
          referenceAnswer: randomSQ.Answer || ""
        };
      }

      // 2. Search Placement Quiz dataset for matches
      const matchedQuiz = placementQuiz.filter((q) => {
        const qTopic = (q.topic || "").toLowerCase();
        const qSec = (q.section || "").toLowerCase();
        const qText = (q.question || "").toLowerCase();
        return qTopic.includes(nodeTopic.substring(0, 4)) || qSec.includes(nodeTopic.substring(0, 4)) || qText.includes(nodeTopic.substring(0, 4));
      });

      if (matchedQuiz.length > 0) {
        const randomQuiz = matchedQuiz[Math.floor(Math.random() * matchedQuiz.length)];
        return {
          id: `quiz_${node.id || idx}_${Math.random().toString(36).substring(7)}`,
          source: "quiz_matched",
          topic: node.topic,
          difficulty: randomQuiz.difficulty || "Medium",
          prompt: `${randomQuiz.question} Explain your reasoning and technical approach in detail.`,
          referenceAnswer: randomQuiz.answer || ""
        };
      }

      // 3. Generate precise track-specific open-ended prompt
      const promptVariations = [
        `How would you design, evaluate, and optimize ${node.topic} in a production application? What core architectural trade-offs and edge cases would you balance under peak load?`,
        `Explain your approach to implementing ${node.topic} in a high-concurrency production environment. What key bottlenecks and performance metrics must be monitored?`,
        `Describe a real-world scenario where ${node.topic} failed or created a bottleneck. How would you diagnose, fix, and prevent recurrence of that issue?`
      ];
      const randomPrompt = promptVariations[Math.floor(Math.random() * promptVariations.length)];

      return {
        id: `topic_gen_${node.id || idx}_${Math.random().toString(36).substring(7)}`,
        source: "track_specific",
        topic: node.topic,
        difficulty: idx % 3 === 0 ? "Medium" : idx % 3 === 1 ? "Hard" : "Easy",
        prompt: randomPrompt
      };
    });

    // Randomize final question sequence order
    const shuffled = [...topicQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Fallback if no skill graph: map by trackId keywords across Software Qs & Placement Quiz
  const trackTokens = trackId.toLowerCase().split(/[^a-z0-9]+/g).filter((t) => t.length > 2);

  const matchedSQs = softwareQs.filter((q) => {
    const cat = (q.Category || "").toLowerCase();
    const qText = (q.Question || "").toLowerCase();
    return trackTokens.some((tok) => cat.includes(tok) || qText.includes(tok));
  });

  if (matchedSQs.length > 0) {
    const shuffledSQs = [...matchedSQs].sort(() => Math.random() - 0.5);
    return shuffledSQs.slice(0, count).map((q, idx) => ({
      id: `sq_track_${idx}_${Math.random().toString(36).substring(7)}`,
      source: "software",
      topic: q.Category || trackId,
      difficulty: q.Difficulty || "Medium",
      prompt: q.Question,
      referenceAnswer: q.Answer || ""
    }));
  }

  // Search Placement Quiz dataset by track tokens
  const matchedQuiz = placementQuiz.filter((q) => {
    const qTopic = (q.topic || "").toLowerCase();
    const qSec = (q.section || "").toLowerCase();
    const qText = (q.question || "").toLowerCase();
    return trackTokens.some((tok) => qTopic.includes(tok) || qSec.includes(tok) || qText.includes(tok));
  });

  if (matchedQuiz.length > 0) {
    const shuffledQuiz = [...matchedQuiz].sort(() => Math.random() - 0.5);
    return shuffledQuiz.slice(0, count).map((q, idx) => ({
      id: `quiz_track_${idx}_${Math.random().toString(36).substring(7)}`,
      source: "quiz",
      topic: q.topic || q.section || trackId,
      difficulty: q.difficulty || "Medium",
      prompt: `${q.question} Explain your technical approach and architectural trade-offs in detail.`,
      referenceAnswer: q.answer || ""
    }));
  }

  // Default track-specific generated prompts for any custom track
  return [
    {
      id: "gen_track_1",
      source: "track_custom",
      topic: trackId.toUpperCase(),
      difficulty: "Senior",
      prompt: `How would you design and implement a high-scale production architecture for ${trackId}? What core technical trade-offs, state management, and API design choices would you enforce?`,
      referenceAnswer: `Core architecture for ${trackId} involves modular system design, clear data contracts, caching layers, and fault tolerance.`
    },
    {
      id: "gen_track_2",
      source: "track_custom",
      topic: trackId.toUpperCase(),
      difficulty: "Senior",
      prompt: `In a production ${trackId} environment under peak load, what primary data bottlenecks, latency spikes, or memory limits do you anticipate, and how would you resolve them?`,
      referenceAnswer: `Address bottlenecks in ${trackId} using asynchronous processing, indexing, connection pooling, and performance profiling.`
    }
  ];
}

// ─── Derived: Build roadmap from datasets ─────────────────
export function buildRoadmapForTrack(trackId, weakNodes = [], skillGraph = null) {
  const patterns = getPatterns();
  const antiPatterns = getAntiPatterns();
  const frameworks = getDecisionFrameworks();
  const trends = getYearlyTrends();
  const companyFreq = getCompanyFrequency();

  // Sort weak nodes (lowest mastery first)
  const sortedWeak = weakNodes.length > 0
    ? weakNodes
    : (skillGraph?.nodes || [])
        .sort((a, b) => (a.mastery || 0) - (b.mastery || 0))
        .map((n) => n.topic);

  // Get trending topics (2024-2025)
  const recentTrends = trends
    .filter((t) => parseInt(t.year) >= 2024)
    .sort((a, b) => parseInt(b.problem_count) - parseInt(a.problem_count))
    .slice(0, 5);

  // Get top companies asking about these topics
  const relevantCompanies = companyFreq
    .filter((cf) => {
      const cfTopic = (cf.topic || "").toLowerCase();
      return sortedWeak.some((w) => cfTopic.includes(w.toLowerCase().substring(0, 5)));
    })
    .sort((a, b) => parseInt(b.frequency) - parseInt(a.frequency))
    .slice(0, 5);

  // Build 4-day plan
  const days = [];
  for (let i = 0; i < 4; i++) {
    const topic = sortedWeak[i] || sortedWeak[0] || "General Programming";
    const isLastDay = i === 3;

    // Match relevant patterns
    const relPatterns = patterns
      .filter((p) => {
        const pCat = (p.category || "").toLowerCase();
        return topic.toLowerCase().includes(pCat.substring(0, 4)) || pCat.includes(topic.toLowerCase().substring(0, 4));
      })
      .slice(0, 2);

    // Match anti-patterns
    const relAntiPatterns = antiPatterns
      .filter((ap) => ap.severity === "critical" || ap.severity === "high")
      .slice(0, 1);

    // Match frameworks
    const relFrameworks = frameworks
      .filter((f) => (f.category || "").toLowerCase().includes(topic.toLowerCase().substring(0, 4)))
      .slice(0, 1);

    days.push({
      day: i + 1,
      focusTopic: isLastDay ? "Mock Interview & Final Review" : topic,
      badge: i === 0 ? "Weakest Node" : isLastDay ? "Final Push" : `Target #${i + 1}`,
      patterns: relPatterns,
      antiPatterns: relAntiPatterns,
      frameworks: relFrameworks,
      trendingTopics: recentTrends.slice(i, i + 2),
      companies: relevantCompanies.slice(0, 3),
      tasks: isLastDay
        ? [
            { title: `Complete 5 adaptive practice questions across all topics`, done: false },
            { title: `Review anti-patterns: ${relAntiPatterns.map((ap) => ap.anti_pattern_name).join(", ") || "Common pitfalls"}`, done: false },
            { title: `Final mock interview simulation`, done: false }
          ]
        : [
            { title: `Deep-dive into ${topic} core concepts & architecture`, done: false },
            { title: `Solve 3 open-ended scenario questions on ${topic}`, done: false },
            { title: relPatterns.length > 0 ? `Study pattern: ${relPatterns[0].pattern_name}` : `Study recommended architecture references`, done: false }
          ]
    });
  }

  return { days, trendingTopics: recentTrends, topCompanies: relevantCompanies };
}

// ─── Derived: Resume skill gap analysis ───────────────────
export function analyzeResumeSkillGap(extractedSkills = []) {
  const atsData = getATSResumes();
  const jobs = getJobDataset();

  // Find best matching job roles based on extracted skills
  const skillSet = new Set(extractedSkills.map((s) => s.toLowerCase()));
  
  const jobMatches = jobs.map((job) => {
    const jobSkills = (job.Skills || "").split(";").map((s) => s.trim().toLowerCase()).filter(Boolean);
    const matchCount = jobSkills.filter((js) => 
      skillSet.has(js) || [...skillSet].some((es) => js.includes(es) || es.includes(js))
    ).length;
    const matchScore = jobSkills.length > 0 ? matchCount / jobSkills.length : 0;

    return {
      title: job.Title,
      experienceLevel: job.ExperienceLevel,
      matchScore: Math.round(matchScore * 100),
      matchedSkills: jobSkills.filter((js) => 
        skillSet.has(js) || [...skillSet].some((es) => js.includes(es) || es.includes(js))
      ),
      missingSkills: jobSkills.filter((js) => 
        !skillSet.has(js) && ![...skillSet].some((es) => js.includes(es) || es.includes(js))
      )
    };
  });

  // Sort by match score descending
  jobMatches.sort((a, b) => b.matchScore - a.matchScore);

  return {
    topMatches: jobMatches.slice(0, 5),
    skillGaps: jobMatches[0]?.missingSkills?.slice(0, 8) || [],
    overallMatchScore: jobMatches[0]?.matchScore || 0
  };
}

// ─── Derived: Get Placement Benchmarks (20,000 student dataset) ─
export function getPlacementBenchmarks() {
  const students = getStudentPlacement();
  if (!students || students.length === 0) {
    return { avgProblemsSolved: 450, avgMockScore: 78, avgSalaryLPA: 12.5, totalPlaced: 15400 };
  }

  let totalProblems = 0;
  let totalMock = 0;
  let totalSalary = 0;
  let placedCount = 0;

  students.forEach((s) => {
    totalProblems += parseInt(s.DSA_problems_solved || "0") || 0;
    totalMock += parseFloat(s.mock_interview_score || "0") || 0;
    if (s.placement_status === "Placed") {
      placedCount++;
      totalSalary += parseFloat(s.salary_lpa || "0") || 0;
    }
  });

  const count = students.length;
  return {
    avgProblemsSolved: Math.round(totalProblems / count),
    avgMockScore: Math.round(totalMock / count),
    avgSalaryLPA: placedCount > 0 ? Number((totalSalary / placedCount).toFixed(1)) : 14.2,
    totalStudents: count,
    placementRate: Math.round((placedCount / count) * 100)
  };
}

// ─── Helper: Categorize a skill keyword ───────────────────
function categorizeSkill(skill) {
  const s = skill.toLowerCase();
  if (s.includes("react") || s.includes("angular") || s.includes("vue") || s.includes("html") || s.includes("css") || s.includes("javascript") || s.includes("typescript")) return "Frontend";
  if (s.includes("node") || s.includes("express") || s.includes("django") || s.includes("spring") || s.includes("flask") || s.includes(".net") || s.includes("java") || s.includes("python")) return "Backend";
  if (s.includes("sql") || s.includes("mongo") || s.includes("redis") || s.includes("postgres") || s.includes("database") || s.includes("entity")) return "Database";
  if (s.includes("docker") || s.includes("kubernetes") || s.includes("aws") || s.includes("azure") || s.includes("ci/cd") || s.includes("devops") || s.includes("terraform")) return "DevOps";
  if (s.includes("design") || s.includes("architecture") || s.includes("microservice") || s.includes("api") || s.includes("rest") || s.includes("graphql")) return "Architecture";
  if (s.includes("ml") || s.includes("ai") || s.includes("deep") || s.includes("tensor") || s.includes("pytorch")) return "AI/ML";
  if (s.includes("test") || s.includes("jest") || s.includes("unit") || s.includes("selenium")) return "Testing";
  if (s.includes("git") || s.includes("agile") || s.includes("scrum")) return "Workflow";
  if (s.includes("array") || s.includes("hash") || s.includes("tree") || s.includes("graph") || s.includes("dynamic") || s.includes("sorting") || s.includes("search") || s.includes("stack") || s.includes("queue") || s.includes("linked") || s.includes("recursion") || s.includes("greedy")) return "DSA";
  return "Core";
}
