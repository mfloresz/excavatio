export const BIBLE_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_bible_verses',
      description: 'Obtiene versículos bíblicos de las versiones disponibles. Usa esta herramienta para consultar pasajes bíblicos en idiomas originales (hebreo, arameo, griego) o en traducciones al español.',
      parameters: {
        type: 'object',
        properties: {
          requests: {
            type: 'array',
            description: 'Lista de solicitudes de versículos',
            items: {
              type: 'object',
              properties: {
                version: {
                  type: 'string',
                  description: 'Nombre del archivo XML de la versión bíblica',
                  enum: [
                    'AramaicBible.xml',
                    'GreekBYZ18Bible.xml',
                    'GreekTCGNTBible.xml',
                    'GreekSBLGNTBible.xml',
                    'HebrewAleppoCodexBible.xml',
                    'HebrewLeningradCodexBible.xml',
                    'SpanishNBLABible.xml',
                    'SpanishRVR1960Bible.xml',
                    'SpanishTLABible.xml',
                  ],
                },
                book: {
                  type: 'number',
                  description: 'Número del libro bíblico (1-66)',
                  minimum: 1,
                  maximum: 66,
                },
                chapter: {
                  type: 'number',
                  description: 'Número del capítulo',
                  minimum: 1,
                },
                verses: {
                  type: 'array',
                  description: 'Lista de números de versículos a obtener',
                  items: {
                    type: 'number',
                  },
                },
              },
              required: ['version', 'book', 'chapter', 'verses'],
            },
          },
        },
        required: ['requests'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_bible',
      description: 'Busca un término o frase en todas las versiones bíblicas disponibles.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Término o frase a buscar en el texto bíblico'
          }
        },
        required: ['query']
      }
    }
  }
];

export function getToolsForProvider(provider) {
  if (provider === 'chutes' || provider === 'openrouter') {
    return BIBLE_TOOLS;
  }
  return BIBLE_TOOLS;
}
