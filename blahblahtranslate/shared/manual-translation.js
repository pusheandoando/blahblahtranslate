// blahblahtranslate/shared/manual-translation.js





function createManualTranslation({ translate, readRequest, onStart, onResult, onError, onFinish }) {
    let running = false;

    async function run() {
        if (running) {
            return null;
        }

        const request = readRequest();
        if (!request.text || !request.targetLanguage) {
            onResult('');
            return null;
        }

        running = true;
        onStart();
        try {
            const result = await translate(request.text, request.targetLanguage, request.sourceLanguage);
            onResult(result);
            return result;
        } catch (error) {
            onError(error);
            return null;
        } finally {
            running = false;
            onFinish();
        }
    }

    
    return { run };
}