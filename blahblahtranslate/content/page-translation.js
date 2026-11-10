// blahblahtranslate/content/page-translation.js





const PROGRESS_LINGER_MS = 1500;
const PROGRESS_ERROR_LINGER_MS = 4000;
const SEPARATOR_REQUEST_SIZE = 3;

let activeJob = null;





function createJob() {
    const job = { isCancelled: false };
    
    job.cancelSignal = new Promise((resolve) => {
        job.cancel = () => {
            job.isCancelled = true;
            resolve();
        };
    });
    
    
    return job;
}


function measureRequestSize(text) {
    return encodeURIComponent(text).length + SEPARATOR_REQUEST_SIZE;
}


function buildChunks(entries) {
    const chunks = [];
    let currentChunk = [];
    let currentSize = 0;

    for (const entry of entries) {
        const entrySize = measureRequestSize(entry.text);
        const overflows =
            currentChunk.length >= PAGE_CHUNK_MAX_ITEMS ||
            currentSize + entrySize > PAGE_CHUNK_MAX_CHARS;

        if (overflows && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = [];
            currentSize = 0;
        }

        currentChunk.push(entry);
        currentSize += entrySize;
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }


    return chunks;
}


function storeTranslations(entries, translations) {
    const pendingEntries = [];

    for (let index = 0; index < entries.length; index++) {
        const translation = translations[index];
        
        if (typeof translation === 'string' && translation !== '') {
            entries[index].translation = translation;
        } else {
            pendingEntries.push(entries[index]);
        }
    }


    return pendingEntries;
}


async function translateChunk(chunk, targetLanguage, job) {
    let pendingEntries = chunk;

    for (let attempt = 0; attempt <= PAGE_MAX_RETRIES; attempt++) {
        if (job.isCancelled) {
            return pendingEntries.length;
        }

        try {
            const texts = pendingEntries.map((entry) => entry.text);
            const translations = await requestTranslations(texts, targetLanguage);
            pendingEntries = storeTranslations(pendingEntries, translations);
        } catch {
            // the entries still pending are sent again after the delay below
        }

        if (pendingEntries.length === 0) {
            return 0;
        }

        if (attempt < PAGE_MAX_RETRIES) {
            await delay(PAGE_RETRY_DELAY_MS * (attempt + 1));
        }
    }


    return pendingEntries.length;
}


async function runPageTranslation(targetLanguage, job, progress) {
    const entries = collectTranslationEntries();

    if (entries.length === 0) {
        progress.finish('Nothing to translate', PROGRESS_LINGER_MS);
        return;
    }

    const chunks = buildChunks(entries);
    let nextChunkIndex = 0;
    let completedCount = 0;
    let failedCount = 0;

    async function processChunks() {
        while (nextChunkIndex < chunks.length && !job.isCancelled) {
            const chunk = chunks[nextChunkIndex];
            nextChunkIndex += 1;

            failedCount += await translateChunk(chunk, targetLanguage, job);
            completedCount += chunk.length;
            progress.update(Math.round((completedCount / entries.length) * 100));
        }
    }

    const workers = [];
    for (let index = 0; index < PAGE_CONCURRENCY; index++) {
        workers.push(processChunks());
    }
    await Promise.race([Promise.all(workers), job.cancelSignal]);

    if (job.isCancelled) {
        progress.finish('Translation cancelled', PROGRESS_LINGER_MS);
        return;
    }

    applyTranslations(entries);

    if (failedCount === 0) {
        progress.update(100);
        progress.finish('Translation complete', PROGRESS_LINGER_MS);
        return;
    }

    progress.finish('Done, ' + failedCount + ' texts failed', PROGRESS_ERROR_LINGER_MS);
}


async function translatePage(targetLanguage) {
    if (activeJob || !document.body) {
        return;
    }

    const job = createJob();
    activeJob = job;
    const progress = createProgressBar(job.cancel);

    try {
        await runPageTranslation(targetLanguage, job, progress);
    } catch (error) {
        progress.finish('Translation failed', PROGRESS_ERROR_LINGER_MS);
    } finally {
        activeJob = null;
    }
}