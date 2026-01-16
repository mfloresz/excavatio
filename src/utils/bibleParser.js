export const BOOKS = {
  1: 'Génesis', 2: 'Éxodo', 3: 'Levítico', 4: 'Números', 5: 'Deuteronomio',
  6: 'Josué', 7: 'Jueces', 8: 'Rut', 9: '1 Samuel', 10: '2 Samuel',
  11: '1 Reyes', 12: '2 Reyes', 13: '1 Crónicas', 14: '2 Crónicas',
  15: 'Esdras', 16: 'Nehemías', 17: 'Ester', 18: 'Job', 19: 'Salmos',
  20: 'Proverbios', 21: 'Eclesiastés', 22: 'Cantares', 23: 'Isaías',
  24: 'Jeremías', 25: 'Lamentaciones', 26: 'Ezequiel', 27: 'Daniel',
  28: 'Oseas', 29: 'Joel', 30: 'Amós', 31: 'Abdías', 32: 'Jonás',
  33: 'Miqueas', 34: 'Nahúm', 35: 'Habacuc', 36: 'Sofonías', 37: 'Hageo',
  38: 'Zacarías', 39: 'Malaquías', 40: 'Mateo', 41: 'Marcos', 42: 'Lucas',
  43: 'Juan', 44: 'Hechos', 45: 'Romanos', 46: '1 Corintios', 47: '2 Corintios',
  48: 'Gálatas', 49: 'Efesios', 50: 'Filipenses', 51: 'Colosenses',
  52: '1 Tesalonicenses', 53: '2 Tesalonicenses', 54: '1 Timoteo', 55: '2 Timoteo',
  56: 'Tito', 57: 'Filemón', 58: 'Hebreos', 59: 'Santiago', 60: '1 Pedro',
  61: '2 Pedro', 62: '1 Juan', 63: '2 Juan', 64: '3 Juan', 65: 'Judas', 66: 'Apocalipsis'
};

export const BOOK_ABBREVIATIONS = {
  'gn': 1, 'gen': 1, 'genesis': 1,
  'ex': 2, 'exod': 2, 'exodo': 2,
  'lv': 3, 'lev': 3, 'levitico': 3,
  'nm': 4, 'num': 4, 'numeros': 4,
  'dt': 5, 'deut': 5, 'deuteronomio': 5,
  'jos': 6, 'josua': 6, 'josue': 6,
  'jz': 7, 'jdg': 7, 'jueces': 7,
  'rt': 8, 'ruth': 8, 'rut': 8,
  '1sm': 9, '1 sam': 9, '1samuel': 9,
  '2sm': 10, '2 sam': 10, '2samuel': 10,
  '1rs': 11, '1 kgs': 11, '1reyes': 11,
  '2rs': 12, '2 kgs': 12, '2reyes': 12,
  '1ch': 13, '1 chr': 13, '1cronicas': 13,
  '2ch': 14, '2 chr': 14, '2cronicas': 14,
  'ed': 15, 'ezr': 15, 'esdras': 15,
  'neh': 16, 'nehemias': 16,
  'est': 17, 'ester': 17,
  'job': 18,
  'ps': 19, 'psalms': 19, 'salmos': 19,
  'pr': 20, 'prov': 20, 'proverbios': 20,
  'ec': 21, 'ecc': 21, 'ecclesiastes': 21,
  'sg': 22, 'song': 22, 'cantares': 22,
  'is': 23, 'isa': 23, 'isaias': 23,
  'jr': 24, 'jer': 24, 'jeremias': 24,
  'lm': 25, 'lam': 25, 'lamentaciones': 25,
  'ez': 26, 'eze': 26, 'ezequiel': 26,
  'dn': 27, 'dan': 27, 'daniel': 28,
  'os': 28, 'oseas': 28,
  'jl': 29, 'joel': 29,
  'am': 30, 'amos': 30,
  'ob': 31, 'abd': 31, 'abdias': 31,
  'jn': 32, 'jon': 32, 'jonas': 32,
  'mi': 33, 'mic': 33, 'miqueas': 33,
  'na': 34, 'nah': 34, 'nahum': 34,
  'hk': 35, 'hab': 35, 'habacuc': 35,
  'zp': 36, 'zeph': 36, 'sofonias': 36,
  'hg': 37, 'hag': 37, 'hageo': 37,
  'zc': 38, 'zech': 38, 'zacarias': 38,
  'ml': 39, 'mal': 39, 'malaquias': 39,
  'mt': 40, 'matt': 40, 'mateo': 40,
  'mk': 41, 'mark': 41, 'marcos': 41,
  'lk': 42, 'luke': 42, 'lucas': 42,
  'jn': 43, 'john': 43, 'juan': 43,
  'acts': 44, 'hch': 44, 'hechos': 44,
  'rm': 45, 'rom': 45, 'romanos': 45,
  '1co': 46, '1 cor': 46, '1corintios': 46,
  '2co': 47, '2 cor': 47, '2corintios': 47,
  'gl': 48, 'gal': 48, 'galatas': 48,
  'eph': 49, 'ef': 49, 'efesios': 49,
  'php': 50, 'phil': 50, 'filipenses': 50,
  'col': 51, 'colosenses': 51,
  '1th': 52, '1 thes': 52, '1tesalonicenses': 52,
  '2th': 53, '2 thes': 53, '2tesalonicenses': 53,
  '1ti': 54, '1 tim': 54, '1timoteo': 54,
  '2ti': 55, '2 tim': 55, '2timoteo': 55,
  'tit': 56, 'tito': 56,
  'phm': 57, 'filem': 57, 'filemon': 57,
  'heb': 58, 'hebreos': 58,
  'jas': 59, 'jm': 59, 'santiago': 59,
  '1p': 60, '1 pet': 60, '1pedro': 60,
  '2p': 61, '2 pet': 61, '2pedro': 61,
  '1jn': 62, '1 john': 62, '1juan': 62,
  '2jn': 63, '2 john': 63, '2juan': 63,
  '3jn': 64, '3 john': 64, '3juan': 64,
  'jud': 65, 'judas': 65,
  'rv': 66, 'rev': 66, 'apocalipsis': 66
};

export function parseBibleXML(xmlContent, translationName) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');
  const verses = [];

  const testamentElements = doc.querySelectorAll('testament');
  for (const testament of testamentElements) {
    const testamentName = testament.getAttribute('name');
    const testamentType = testamentName === 'Old' ? 'AT' : 'NT';

    const books = testament.querySelectorAll('book');
    for (const book of books) {
      const bookNumber = parseInt(book.getAttribute('number'));
      const bookName = BOOKS[bookNumber] || `Book ${bookNumber}`;

      const chapters = book.querySelectorAll('chapter');
      for (const chapter of chapters) {
        const chapterNumber = parseInt(chapter.getAttribute('number'));

        const verseElements = chapter.querySelectorAll('verse');
        for (const verse of verseElements) {
          const verseNumber = parseInt(verse.getAttribute('number'));
          const verseText = verse.textContent.trim();

          verses.push({
            testament: testamentType,
            bookNumber,
            bookName,
            chapter: chapterNumber,
            verse: verseNumber,
            text: verseText,
            translation: translationName
          });
        }
      }
    }
  }

  return verses;
}

export function parseReference(reference) {
  reference = reference.toLowerCase().trim();
  reference = reference.replace(/\s+/g, ' ');

  let bookNum = null;
  let chapter = null;
  let verseStart = null;
  let verseEnd = null;

  for (const [abbr, num] of Object.entries(BOOK_ABBREVIATIONS)) {
    if (reference.startsWith(abbr + ' ') ||
        reference.startsWith(abbr + '.') ||
        reference.startsWith(num.toString() + ' ')) {
      bookNum = num;
      break;
    }
  }

  if (!bookNum) {
    const words = reference.split(' ');
    for (let i = Math.min(words.length, 3); i >= 1; i--) {
      const possibleBook = words.slice(0, i).join(' ');
      for (const [abbr, num] of Object.entries(BOOK_ABBREVIATIONS)) {
        if (possibleBook === abbr || possibleBook === num.toString()) {
          bookNum = num;
          reference = words.slice(i).join(' ').trim();
          break;
        }
      }
      if (bookNum) break;
    }
  }

  if (!bookNum) return null;

  const chapterMatch = reference.match(/^[\s:]?(\d+)/);
  if (chapterMatch) {
    chapter = parseInt(chapterMatch[1]);
  }

  const verseRangeMatch = reference.match(/:(\d+)(?:-(\d+))?/);
  if (verseRangeMatch) {
    verseStart = parseInt(verseRangeMatch[1]);
    verseEnd = verseRangeMatch[2] ? parseInt(verseRangeMatch[2]) : verseStart;
  }

  return {
    bookNumber: bookNum,
    bookName: BOOKS[bookNum],
    chapter,
    verseStart,
    verseEnd
  };
}

export function findVerses(versesData, reference) {
  const ref = parseReference(reference);
  if (!ref || !ref.chapter || !ref.verseStart) {
    return [];
  }

  return versesData.filter(v =>
    v.bookNumber === ref.bookNumber &&
    v.chapter === ref.chapter &&
    v.verse >= ref.verseStart &&
    v.verse <= (ref.verseEnd || ref.verseStart)
  );
}

export function formatReference(ref) {
  if (!ref) return '';
  const bookName = BOOKS[ref.bookNumber] || `Book ${ref.bookNumber}`;
  if (ref.verseStart && ref.verseEnd && ref.verseStart !== ref.verseEnd) {
    return `${bookName} ${ref.chapter}:${ref.verseStart}-${ref.verseEnd}`;
  }
  if (ref.verseStart) {
    return `${bookName} ${ref.chapter}:${ref.verseStart}`;
  }
  return `${bookName} ${ref.chapter}`;
}
