import { ref, computed, onMounted } from 'vue';
import {
  initDB,
  getBibleFile,
  downloadBibleFile,
  downloadAllBibles,
  getAllDownloadStatuses,
  isAllDownloaded,
  getDownloadedCount,
  BIBLE_FILES
} from '../utils/bibleDb.js';
import { parseBibleXML, parseReference, findVerses } from '../utils/bibleParser.js';

const bibleData = ref({});
const isLoading = ref(false);
const downloadProgress = ref({});
const downloadStatus = ref({});
const isInitialized = ref(false);
const error = ref(null);

export function useBible() {
  const loadedBibles = computed(() => Object.keys(bibleData.value));

  async function initialize() {
    if (isInitialized.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      await initDB();

      const statuses = await getAllDownloadStatuses();
      downloadStatus.value = statuses;

      const count = await getDownloadedCount();
      const total = BIBLE_FILES.length;

      if (count >= total) {
        await loadAllBibles();
      }

      isInitialized.value = true;
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadAllBibles() {
    for (const file of BIBLE_FILES) {
      const content = await getBibleFile(file.name);
      if (content) {
        const translationName = file.name.replace('Bible.xml', '');
        bibleData.value[translationName] = parseBibleXML(content, translationName);
      }
    }
  }

  async function downloadBible(filename, onProgress) {
    const file = BIBLE_FILES.find(f => f.name === filename);
    if (!file) throw new Error(`File not found: ${filename}`);

    try {
      await downloadBibleFile(file.name, file.url, (name, progress) => {
        downloadProgress.value[name] = progress;
        downloadStatus.value[name] = 'downloading';
        if (onProgress) onProgress(name, progress);
      });

      const content = await getBibleFile(file.name);
      const translationName = file.name.replace('Bible.xml', '');
      bibleData.value[translationName] = parseBibleXML(content, translationName);
    } catch (err) {
      downloadStatus.value[filename] = 'error';
      throw err;
    }
  }

  async function downloadAll(onProgress) {
    isLoading.value = true;
    error.value = null;

    try {
      const results = await downloadAllBibles((filename, progress) => {
        downloadProgress.value[filename] = progress;
        downloadStatus.value[filename] = 'downloading';
        if (onProgress) onProgress(filename, progress);
      });

      await loadAllBibles();

      const failed = Object.values(results).filter(r => !r.success);
      if (failed.length > 0) {
        throw new Error(`Failed to download: ${failed.map(f => f.error).join(', ')}`);
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function getVerses(translation, reference) {
    if (!bibleData.value[translation]) return [];
    return findVerses(bibleData.value[translation], reference);
  }

  function getVersesFromAll(reference) {
    const results = {};
    for (const translation of loadedBibles.value) {
      const verses = findVerses(bibleData.value[translation], reference);
      if (verses.length > 0) {
        results[translation] = verses;
      }
    }
    return results;
  }

  function getVerseText(translation, bookNumber, chapter, verse) {
    if (!bibleData.value[translation]) return null;
    const found = bibleData.value[translation].find(
      v => v.bookNumber === bookNumber && v.chapter === chapter && v.verse === verse
    );
    return found?.text || null;
  }

  function searchVerses(query, translations = null) {
    const targetTranslations = translations || loadedBibles.value;
    const results = [];

    for (const translation of targetTranslations) {
      if (!bibleData.value[translation]) continue;

      const found = bibleData.value[translation].filter(v =>
        v.text.toLowerCase().includes(query.toLowerCase())
      );

      for (const verse of found) {
        results.push({ ...verse, translation });
      }
    }

    return results;
  }

  function parseReference(ref) {
    return parseReference(ref);
  }

  return {
    bibleData,
    loadedBibles,
    downloadProgress,
    downloadStatus,
    isLoading,
    isInitialized,
    error,
    initialize,
    downloadBible,
    downloadAll,
    getVerses,
    getVersesFromAll,
    getVerseText,
    searchVerses,
    parseReference,
    BIBLE_FILES
  };
}
