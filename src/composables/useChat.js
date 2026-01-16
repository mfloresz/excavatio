import { ref } from 'vue';
import { AIClient } from '@aivue/core';
import { useSettings } from '../stores/settings';
import { useChat } from '../stores/chat';
import { getPreset } from '../utils/prompts';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { getToolsForProvider } from '../utils/tools.js';
import { BOOKS } from '../utils/bibleParser.js';
import { getBibleFile } from '../utils/bibleDb.js';

const CHUTES_API_URL = 'https://llm.chutes.ai/v1/chat/completions';

const BOOK_NAME_TO_NUMBER = {
  'genesis': 1, 'gen': 1, 'gn': 1,
  'exodus': 2, 'exod': 2, 'ex': 2,
  'leviticus': 3, 'lev': 3, 'lv': 3,
  'numbers': 4, 'num': 4, 'nm': 4,
  'deuteronomy': 5, 'deut': 5, 'dt': 5,
  'joshua': 6, 'jos': 6,
  'judges': 7, 'jdg': 7, 'jz': 7,
  'ruth': 8, 'rt': 8,
  '1 samuel': 9, '1samuel': 9, '1 sm': 9,
  '2 samuel': 10, '2samuel': 10, '2 sm': 10,
  '1 kings': 11, '1kings': 11, '1 kgs': 11,
  '2 kings': 12, '2kings': 12, '2 kgs': 12,
  '1 chronicles': 13, '1chronicles': 13, '1 ch': 13,
  '2 chronicles': 14, '2chronicles': 14, '2 ch': 14,
  'ezra': 15, 'ed': 15,
  'nehemiah': 16, 'neh': 16,
  'esther': 17, 'est': 17,
  'job': 18,
  'psalms': 19, 'psalm': 19, 'ps': 19,
  'proverbs': 20, 'prov': 20, 'pr': 20,
  'ecclesiastes': 21, 'ecc': 21, 'ec': 21,
  'song of songs': 22, 'song': 22, 'sg': 22,
  'isaiah': 23, 'isa': 23, 'is': 23,
  'jeremiah': 24, 'jer': 24, 'jr': 24,
  'lamentations': 25, 'lam': 25, 'lm': 25,
  'ezekiel': 26, 'eze': 26, 'ez': 26,
  'daniel': 27, 'dan': 27, 'dn': 27,
  'hosea': 28, 'hos': 28, 'os': 28,
  'joel': 29, 'jl': 29,
  'amos': 30, 'am': 30,
  'obadiah': 31, 'obad': 31, 'ob': 31,
  'jonah': 32, 'jon': 32, 'jn': 32,
  'micah': 33, 'mic': 33, 'mi': 33,
  'nahum': 34, 'nah': 34, 'na': 34,
  'habakkuk': 35, 'hab': 35, 'hk': 35,
  'zephaniah': 36, 'zeph': 36, 'zp': 36,
  'haggai': 37, 'hag': 37, 'hg': 37,
  'zechariah': 38, 'zech': 38, 'zc': 38,
  'malachi': 39, 'mal': 39, 'ml': 39,
  'matthew': 40, 'matt': 40, 'mt': 40,
  'mark': 41, 'mk': 41,
  'luke': 42, 'lk': 42,
  'john': 43, 'jn': 43,
  'acts': 44, 'hch': 44,
  'romans': 45, 'rom': 45, 'rm': 45,
  '1 corinthians': 46, '1corinthians': 46, '1 co': 46,
  '2 corinthians': 47, '2corinthians': 47, '2 co': 47,
  'galatians': 48, 'gal': 48, 'gl': 48,
  'ephesians': 49, 'eph': 49, 'ef': 49,
  'philippians': 50, 'phil': 50, 'php': 50,
  'colossians': 51, 'col': 51,
  '1 thessalonians': 52, '1thessalonians': 52, '1 th': 52,
  '2 thessalonians': 53, '2thessalonians': 53, '2 th': 53,
  '1 timothy': 54, '1timothy': 54, '1 ti': 54,
  '2 timothy': 55, '2timothy': 55, '2 ti': 55,
  'titus': 56, 'tit': 56,
  'philemon': 57, 'phm': 57,
  'hebrews': 58, 'heb': 58,
  'james': 59, 'jas': 59, 'jm': 59,
  '1 peter': 60, '1peter': 60, '1 p': 60,
  '2 peter': 61, '2peter': 61, '2 p': 61,
  '1 john': 62, '1john': 62, '1 jn': 62,
  '2 john': 63, '2john': 63, '2 jn': 63,
  '3 john': 64, '3john': 64, '3 jn': 64,
  'jude': 65, 'jud': 65,
  'revelation': 66, 'rev': 66, 'rv': 66,
};

function parseBibleXMLToDoc(xmlContent) {
  const parser = new DOMParser();
  return parser.parseFromString(xmlContent, 'text/xml');
}

async function getVersesFromXML(xmlDoc, book, chapter, verses) {
  const results = [];
  const bookElement = xmlDoc.querySelector(`book[number="${book}"]`);
  if (!bookElement) {
    console.warn(`Book ${book} not found in XML`);
    return results;
  }
  const chapterElement = bookElement.querySelector(`chapter[number="${chapter}"]`);
  if (!chapterElement) {
    console.warn(`Chapter ${chapter} not found in book ${book}`);
    return results;
  }
  for (const verseNum of verses) {
    const verseElement = chapterElement.querySelector(`verse[number="${verseNum}"]`);
    if (verseElement) {
      results.push({
        verse: verseNum,
        text: verseElement.textContent || '',
      });
    }
  }
  return results;
}

async function getBibleVerses(requests) {
  const results = [];
  for (const req of requests) {
    const { version, book, chapter, verses } = req;
    const content = await getBibleFile(version);
    if (!content) {
      results.push(`[Error: La versión ${version} no está disponible en caché]`);
      continue;
    }
    const xmlDoc = parseBibleXMLToDoc(content);
    const extractedVerses = await getVersesFromXML(xmlDoc, book, chapter, verses);
    if (extractedVerses.length === 0) {
      results.push(`[No se encontraron versículos para ${version} - ${BOOKS[book]?.name || book} ${chapter}:${verses.join(',')}]`);
      continue;
    }
    const bookName = BOOKS[book]?.name || `Libro ${book}`;
    let formattedResult = `### ${version.replace('.xml', '')} - ${bookName} ${chapter}\n\n`;
    for (const v of extractedVerses) {
      formattedResult += `**${v.verse}** ${v.text}\n`;
    }
    results.push(formattedResult);
  }
  return results.join('\n---\n\n');
}

async function searchBible(query, version = null, limit = 10) {
  const versions = version ? [version] : [
    'GreekSBLGNTBible.xml',
    'GreekBYZ18Bible.xml',
    'GreekTCGNTBible.xml',
    'SpanishNBLABible.xml',
    'SpanishRVR1960Bible.xml',
    'SpanishTLABible.xml'
  ];
  
  const results = [];
  const lowerQuery = query.toLowerCase();
  
  for (const ver of versions) {
    const content = await getBibleFile(ver);
    if (!content) continue;
    
    const xmlDoc = parseBibleXMLToDoc(content);
    const books = xmlDoc.querySelectorAll('book');
    
    for (const book of books) {
      const bookNum = book.getAttribute('number');
      const chapters = book.querySelectorAll('chapter');
      
      for (const chapter of chapters) {
        const chapterNum = chapter.getAttribute('number');
        const verses = chapter.querySelectorAll('verse');
        
        for (const verse of verses) {
          const verseNum = verse.getAttribute('number');
          const text = verse.textContent || '';
          
          if (text.toLowerCase().includes(lowerQuery)) {
            results.push({
              version: ver.replace('.xml', ''),
              book: parseInt(bookNum),
              chapter: parseInt(chapterNum),
              verse: parseInt(verseNum),
              text: text
            });
            
            if (results.length >= limit) {
              break;
            }
          }
        }
        
        if (results.length >= limit) break;
      }
      
      if (results.length >= limit) break;
    }
    
    if (results.length >= limit) break;
  }
  
  let formattedResult = `### Resultados de búsqueda: "${query}"\n\n`;
  for (const r of results) {
    const bookName = BOOKS[r.book]?.name || `Libro ${r.book}`;
    formattedResult += `**${r.version} - ${bookName} ${r.chapter}:${r.verse}**\n${r.text}\n\n`;
  }
  
  if (results.length === 0) {
    formattedResult += 'No se encontraron resultados.';
  }
  
  return formattedResult;
}

async function* streamWithTools(messages, apiKey, model, temperature, maxTokens) {
  const tools = getToolsForProvider('chutes');

  const response = await fetch(CHUTES_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: maxTokens,
      temperature,
      tools,
      tool_choice: 'auto',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';
  let toolCalls = [];
  let currentToolCall = null;
  let inToolCallText = false;
  let toolCallTextBuffer = '';

  const TOOL_CALL_PATTERNS = [
    /<function_calls>/i,
    /<\/function_calls>/i,
    /<invoke\s+/i,
    /<\/invoke>/i,
    /<parameter\s+/i,
    /<\/parameter>/i,
    /<tool_call/i,
    /<\/tool_call>/i,
  ];

  function isToolCallText(content) {
    return TOOL_CALL_PATTERNS.some(pattern => pattern.test(content));
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;

        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const choice = data.choices?.[0];

            if (choice?.delta?.content) {
              const content = choice.delta.content;
              
              if (isToolCallText(content)) {
                inToolCallText = true;
                toolCallTextBuffer += content;
                continue;
              }
              
              if (inToolCallText) {
                toolCallTextBuffer += content;
                if (!isToolCallText(toolCallTextBuffer)) {
                  inToolCallText = false;
                  toolCallTextBuffer = '';
                }
                continue;
              }
              
              yield content;
            }

            if (choice?.delta?.tool_calls) {
              for (const tc of choice.delta.tool_calls) {
                if (tc.id) {
                  if (currentToolCall?.id) {
                    toolCalls.push({
                      id: currentToolCall.id,
                      type: 'function',
                      function: {
                        name: currentToolCall.function.name || '',
                        arguments: currentToolCall.function.arguments,
                      },
                    });
                  }
                  currentToolCall = {
                    id: tc.id,
                    type: tc.type,
                    function: { name: tc.function?.name, arguments: '' },
                  };
                }
                if (currentToolCall && tc.function?.arguments) {
                  currentToolCall.function.arguments += tc.function.arguments;
                }
              }
            }

            if (choice?.finish_reason === 'tool_calls' && currentToolCall?.id) {
              toolCalls.push({
                id: currentToolCall.id,
                type: 'function',
                function: {
                  name: currentToolCall.function.name || '',
                  arguments: currentToolCall.function.arguments,
                },
              });
            }
          } catch (e) {
            console.error('SSE parse error:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (toolCalls.length > 0) {
    const toolMessages = [
      ...messages,
      { role: 'assistant', content: '', tool_calls: toolCalls },
    ];

    for (const toolCall of toolCalls) {
      try {
        if (toolCall.function.name === 'get_bible_verses') {
          const args = JSON.parse(toolCall.function.arguments);
          const requests = args.requests;

          yield '\n\n*Consultando versículos bíblicos...*\n\n';

          const toolResult = await getBibleVerses(requests);
          toolMessages.push({
            role: 'tool',
            content: toolResult,
            tool_call_id: toolCall.id
          });
        } else if (toolCall.function.name === 'search_bible') {
          const args = JSON.parse(toolCall.function.arguments);
          const { query, version, limit } = args;

          yield '\n\n*Buscando en la Biblia...*\n\n';

          const toolResult = await searchBible(query, version, limit);
          toolMessages.push({
            role: 'tool',
            content: toolResult,
            tool_call_id: toolCall.id
          });
        }
      } catch (e) {
        console.error('Tool call error:', e);
        const errorMessage = `Error: ${e instanceof Error ? e.message : 'Unknown'}`;
        toolMessages.push({
          role: 'tool',
          content: errorMessage,
          tool_call_id: toolCall.id
        });
        yield `\n\n*${errorMessage}*\n\n`;
      }
    }

    const followUpRes = await fetch(CHUTES_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: toolMessages,
        stream: true,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!followUpRes.ok) {
      const err = await followUpRes.text();
      throw new Error(`Follow-up error: ${followUpRes.status} - ${err}`);
    }

    const followReader = followUpRes.body?.getReader();
    if (followReader) {
      let fBuffer = '';
      try {
        while (true) {
          const { done, value } = await followReader.read();
          if (done) break;
          fBuffer += decoder.decode(value, { stream: true });
          const fLines = fBuffer.split('\n');
          fBuffer = fLines.pop() || '';
          for (const fLine of fLines) {
            const fTrim = fLine.trim();
            if (!fTrim || fTrim === 'data: [DONE]') continue;
            if (fTrim.startsWith('data: ')) {
              try {
                const fData = JSON.parse(fTrim.slice(6));
                if (fData.choices?.[0]?.delta?.content) {
                  yield fData.choices[0].delta.content;
                }
              } catch (e) {}
            }
          }
        }
      } finally {
        followReader.releaseLock();
      }
    }
  }
}

export function useChatEngine() {
  const { settings, getCurrentApiKey, getCurrentParams, getCurrentProvider, getCurrentModel } = useSettings();
  const { addMessage, getMessages, updateMessage } = useChat();

  const isLoading = ref(false);
  const error = ref(null);
  const streamingContent = ref('');
  const toolCalls = ref([]);

  let abortController = null;

  let clientCache = null;
  let lastProvider = null;
  let lastModel = null;

  function getClient() {
    const provider = getCurrentProvider();
    const model = getCurrentModel();
    const apiKey = getCurrentApiKey();
    const params = getCurrentParams();

    if (provider === 'chutes' || provider === 'openrouter') {
      return { provider, apiKey, model, params, isCustom: true };
    }

    if (provider !== lastProvider || model !== lastModel || !clientCache) {
      clientCache = new AIClient({
        provider,
        apiKey: provider === 'ollama' ? 'ollama' : apiKey,
        model,
        options: {
          temperature: params.temperature || 0.7,
          maxTokens: params.maxTokens || 4096
        }
      });
      lastProvider = provider;
      lastModel = model;
    }
    return clientCache;
  }

  async function sendMessage(content) {
    isLoading.value = true;
    error.value = null;
    streamingContent.value = '';
    toolCalls.value = [];

    const messages = getMessages();
    const preset = getPreset(settings.activePreset);
    const systemPrompt = settings.systemPrompt || preset.prompt;

    const allMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
      { role: 'user', content }
    ];

    addMessage('user', content);
    abortController = new AbortController();

    try {
      const client = getClient();
      const provider = getCurrentProvider();
      const apiKey = getCurrentApiKey();
      const params = getCurrentParams();

      if (!apiKey && provider !== 'ollama') {
        throw new Error('API Key requerida');
      }

      let fullResponse = '';
      let assistantMessageId = null;

      if (client.isCustom) {
        assistantMessageId = addMessage('assistant', '', null);
        
        const generator = streamWithTools(
          allMessages,
          apiKey,
          client.model,
          params.temperature,
          params.maxTokens,
        );

        for await (const token of generator) {
          if (abortController?.signal.aborted) break;
          fullResponse += token;
          streamingContent.value = fullResponse;
          
          if (assistantMessageId) {
            updateMessage(assistantMessageId, { content: fullResponse });
          }
        }

        streamingContent.value = '';
        toolCalls.value = [];
      } else {
        client.chatStream(
          allMessages,
          {
            onStart: () => {
              assistantMessageId = addMessage('assistant', '', null);
            },
            onToken: (token) => {
              fullResponse += token;
              streamingContent.value = fullResponse;
              if (assistantMessageId) {
                updateMessage(assistantMessageId, { content: fullResponse });
              }
            },
            onComplete: () => {
              streamingContent.value = '';
              toolCalls.value = [];
            },
            onError: (err) => {
              error.value = err.message;
              addMessage('assistant', `Error: ${err.message}`);
            }
          }
        );
      }
    } catch (err) {
      error.value = err.message;
      addMessage('assistant', `Error: ${err.message}`);
    } finally {
      isLoading.value = false;
      abortController = null;
    }
  }

  function stopStreaming() {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    isLoading.value = false;
  }

  function renderMarkdown(content) {
    if (!content) return '';
    const html = marked.parse(content);
    return DOMPurify.sanitize(html);
  }

  return {
    isLoading,
    error,
    streamingContent,
    toolCalls,
    sendMessage,
    stopStreaming,
    renderMarkdown
  };
}
