import { openDB } from 'idb';

const BIBLE_FILES = [
  { name: 'AramaicBible.xml', url: 'https://raw.githubusercontent.com/mfloresz/excavatio/main/resources/bible/AramaicBible.xml' },
  { name: 'GreekBYZ18Bible.xml', url: 'https://raw.githubusercontent.com/mfloresz/excavatio/main/resources/bible/GreekBYZ18Bible.xml' },
  { name: 'GreekTCGNTBible.xml', url: 'https://raw.githubusercontent.com/mfloresz/excavatio/main/resources/bible/GreekTCGNTBible.xml' },
  { name: 'GreekSBLGNTBible.xml', url: 'https://raw.githubusercontent.com/mfloresz/excavatio/main/resources/bible/GreekSBLGNTBible.xml' },
  { name: 'HebrewAleppoCodexBible.xml', url: 'https://raw.githubusercontent.com/mfloresz/excavatio/main/resources/bible/HebrewAleppoCodexBible.xml' },
  { name: 'HebrewLeningradCodexBible.xml', url: 'https://raw.githubusercontent.com/mfloresz/excavatio/main/resources/bible/HebrewLeningradCodexBible.xml' },
  { name: 'SpanishNBLABible.xml', url: 'https://raw.githubusercontent.com/mfloresz/excavatio/main/resources/bible/SpanishNBLABible.xml' },
  { name: 'SpanishRVR1960Bible.xml', url: 'https://raw.githubusercontent.com/mfloresz/excavatio/main/resources/bible/SpanishRVR1960Bible.xml' },
  { name: 'SpanishTLABible.xml', url: 'https://raw.githubusercontent.com/mfloresz/excavatio/main/resources/bible/SpanishTLABible.xml' }
];

const DB_NAME = 'BibleExDB';
const DB_VERSION = 1;
const STORE_BIBLES = 'bibles';
const STORE_META = 'metadata';

let dbPromise = null;

export async function initDB() {
  if (dbPromise) return dbPromise;

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_BIBLES)) {
        db.createObjectStore(STORE_BIBLES, { keyPath: 'name' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    }
  });

  return dbPromise;
}

export async function getBibleFile(filename) {
  const db = await initDB();
  const record = await db.get(STORE_BIBLES, filename);
  return record?.content || null;
}

export async function saveBibleFile(filename, content) {
  const db = await initDB();
  await db.put(STORE_BIBLES, { name: filename, content, timestamp: Date.now() });
}

export async function getDownloadProgress(filename) {
  const db = await initDB();
  const record = await db.get(STORE_META, `progress_${filename}`);
  return record?.value || 0;
}

export async function setDownloadProgress(filename, progress) {
  const db = await initDB();
  await db.put(STORE_META, { key: `progress_${filename}`, value: progress });
}

export async function setDownloadStatus(filename, status) {
  const db = await initDB();
  await db.put(STORE_META, { key: `status_${filename}`, value: status });
}

export async function getDownloadStatus(filename) {
  const db = await initDB();
  const record = await db.get(STORE_META, `status_${filename}`);
  return record?.value || 'pending';
}

export async function getAllDownloadStatuses() {
  const db = await initDB();
  const statuses = {};
  for (const file of BIBLE_FILES) {
    statuses[file.name] = await getDownloadStatus(file.name);
  }
  return statuses;
}

export async function isAllDownloaded() {
  const db = await initDB();
  let allDownloaded = true;
  for (const file of BIBLE_FILES) {
    const status = await getDownloadStatus(file.name);
    if (status !== 'completed') {
      allDownloaded = false;
      break;
    }
    const exists = await db.get(STORE_BIBLES, file.name);
    if (!exists) {
      allDownloaded = false;
      break;
    }
  }
  return allDownloaded;
}

export async function getDownloadedCount() {
  const db = await initDB();
  let count = 0;
  for (const file of BIBLE_FILES) {
    const status = await getDownloadStatus(file.name);
    if (status === 'completed') {
      const exists = await db.get(STORE_BIBLES, file.name);
      if (exists) count++;
    }
  }
  return count;
}

export async function downloadBibleFile(filename, url, onProgress) {
  try {
    await setDownloadStatus(filename, 'downloading');

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const reader = response.body.getReader();
    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength, 10) || 0;
    let received = 0;

    let chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      received += value.length;

      if (total > 0 && onProgress) {
        const progress = (received / total) * 100;
        await setDownloadProgress(filename, progress);
        onProgress(filename, progress);
      }
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combinedArray = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combinedArray.set(chunk, offset);
      offset += chunk.length;
    }
    const content = new TextDecoder('utf-8').decode(combinedArray);
    await saveBibleFile(filename, content);
    await setDownloadStatus(filename, 'completed');

    return content;
  } catch (error) {
    await setDownloadStatus(filename, 'error');
    throw error;
  }
}

export async function downloadAllBibles(onProgress) {
  const results = {};
  for (const file of BIBLE_FILES) {
    try {
      const content = await downloadBibleFile(file.name, file.url, onProgress);
      results[file.name] = { success: true, content };
    } catch (error) {
      results[file.name] = { success: false, error: error.message };
    }
  }
  return results;
}

export { BIBLE_FILES };
