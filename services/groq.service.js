import env from '../config/env.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

function systemPrompt(extra = '') {
  return [
    'You are a warm, patient personal study assistant for a student.',
    'Explain things simply using real-life examples a student can relate to.',
    'Keep answers short, clear and encouraging. Avoid robotic tone.',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

async function callGroq(messages, { json = false, maxTokens = 2000 } = {}) {
  if (!env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured on the server');
  }

  const body = {
    model: env.GROQ_MODEL,
    messages,
    temperature: 0.6,
    max_tokens: maxTokens,
  };
  if (json) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API error ${response.status}: ${text.slice(0, 300)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function chat(messages, options) {
  return callGroq(messages, options);
}

async function summarizeNote(content, title) {
  const raw = await callGroq(
    [
      { role: 'system', content: systemPrompt('Return JSON only.') },
      {
        role: 'user',
        content: `Summarize these class notes titled "${title}". Return JSON with keys: "summary" (short paragraph), "keyTopics" (array of strings).\n\n${content.slice(0, 12000)}`,
      },
    ],
    { json: true, maxTokens: 1200 }
  );
  return JSON.parse(raw);
}

async function explainTopic(topic, context = '', learningStyle = 'mixed') {
  const styleHint =
    learningStyle === 'visual'
      ? 'Use a visual analogy or diagram description.'
      : learningStyle === 'practice'
        ? 'Include a small practice example the student can try.'
        : '';

  return callGroq([
    { role: 'system', content: systemPrompt(styleHint) },
    {
      role: 'user',
      content: `Explain "${topic}" simply with a real-world example.${context ? ` Context: ${context.slice(0, 4000)}` : ''}`,
    },
  ]);
}

async function generateMindMap(content, title) {
  const raw = await callGroq(
    [
      { role: 'system', content: systemPrompt('Return JSON only.') },
      {
        role: 'user',
        content: `Create a study mind map for notes titled "${title}". Return JSON: {"center": "<topic>", "branches": [{"label": "<branch>", "children": ["<leaf>", ...]}, ...]} with 3-6 branches, each 2-5 children.\n\n${content.slice(0, 12000)}`,
      },
    ],
    { json: true, maxTokens: 1500 }
  );
  return JSON.parse(raw);
}

async function generateQuiz(subject, material, count = 5) {
  const raw = await callGroq(
    [
      { role: 'system', content: systemPrompt('Return JSON only.') },
      {
        role: 'user',
        content: `Create a ${count}-question quiz for subject "${subject}" based on this material. Return JSON: {"questions": [{"text": "...", "options": ["a","b","c","d"], "correctIndex": 0-3, "explanation": "..."}]}. Use mostly multiple choice; at most one open-ended question with empty options and correctIndex -1.\n\n${material.slice(0, 12000)}`,
      },
    ],
    { json: true, maxTokens: 2500 }
  );
  return JSON.parse(raw).questions ?? [];
}

async function generateStudyPlan(subjects, dailyGoalMinutes, weekDays = 6) {
  const raw = await callGroq(
    [
      { role: 'system', content: systemPrompt('Return JSON only.') },
      {
        role: 'user',
        content: `Make a ${weekDays}-day study timetable for a student. Subjects: ${subjects.join(', ')}. Daily goal: ${dailyGoalMinutes} minutes. Cover each subject at least twice per week, include one revision slot and one quiz slot. Return JSON: {"title": "...", "slots": [{"day": "mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun", "startTime": "HH:MM", "endTime": "HH:MM", "subject": "...", "topic": "...", "kind": "study"|"revision"|"quiz"|"practice"}]}. Keep times between 08:00 and 21:00.`,
      },
    ],
    { json: true, maxTokens: 2500 }
  );
  return JSON.parse(raw);
}

async function generateRevisionPlan(subjects, weakTopics = []) {
  const raw = await callGroq(
    [
      { role: 'system', content: systemPrompt('Return JSON only.') },
      {
        role: 'user',
        content: `Create a monthly revision schedule for subjects: ${subjects.join(', ')}.${weakTopics.length ? ` The student struggles with: ${weakTopics.join(', ')} — give these extra attention.` : ''} Return JSON: {"weeks": [{"week": 1, "focus": "...", "tasks": ["..."]}, ...4 weeks]}.`,
      },
    ],
    { json: true, maxTokens: 2000 }
  );
  return JSON.parse(raw);
}

async function answerQuestion(question, history = []) {
  const messages = [
    { role: 'system', content: systemPrompt() },
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: question },
  ];
  return chat(messages);
}

export default {
  chat,
  summarizeNote,
  explainTopic,
  generateMindMap,
  generateQuiz,
  generateStudyPlan,
  generateRevisionPlan,
  answerQuestion,
};
