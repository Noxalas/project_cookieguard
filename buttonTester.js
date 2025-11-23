function highlightMatchingButtonsInDocument(doc){
    if (!doc) return 0;
    const selectors = ['button', '[role="button"]'];
    const elements = doc.querySelectorAll(selectors.join(','));

    const denyWords = ['deny', 'no', 'nei', 'ikke tillat', 'avslå', 'avbryt', 'decline', 'reject', 'avvis'];
    const acceptWords = ['accept', 'yes', 'ja', 'tillat', 'bekreft', 'ok', 'agree', 'allow', 'godta'];

    elements.forEach(el => {
        const text = (el.innerText || el.value || '').toLowerCase().trim()
        
        if (denyWords.some(word => text.includes(word))){
            console.log(`[Cookie Extension] Found DENY button: "${text}"`);
            el.style.outline = '4px solid red';
        }else if (acceptWords.some(word => text.includes(word))){
            console.log(`[Cookie Extension] Found ACCEPT button: "${text}"`);
            el.style.outline = '4px solid green';
        }
    })
    return elements.length;
}

function getInteractiveElements(){
    //Will highlight the buttons in the main document
    highlightMatchingButtonsInDocument(document);

    // checking the iframes as well - if they are in the same origin. 
    const frames = document.querySelectorAll('iframe');
    frames.forEach(frame => {
        try {
            if (frame.contentDocument) {
                highlightMatchingButtonsInDocument(frame.contentDocument);
            }
        } catch(err){
            // Cross-origin frame - safely ignore the error message
        }
    });

    
    console.log(`[Cookie Extension] The scan is completed on ${window.location.href}`);
}

getInteractiveElements();
