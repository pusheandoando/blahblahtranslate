// blahblahtranslate/shared/async-utils.js





function delay(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}


function withTimeout(promise, timeoutMs) {
    let timerId = null;
    
    const timeout = new Promise((resolve, reject) => {
        timerId = setTimeout(() => {
            reject(new Error('The request timed out'));
        }, timeoutMs);
    });

    
    return Promise.race([promise, timeout]).finally(() => {
        clearTimeout(timerId);
    });
}