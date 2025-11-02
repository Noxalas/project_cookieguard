// visibilityButtons.js
//Checks the visual contrast of detected accept and deny buttons and compared them. 
//Using the standard WCAG contrast ration format. 

// Calculating the relative luminance for the colors.  
function getLuminence(rgb){
    // Converts RGB colors to the correct Luminance value based on the standard WCAG formula
    // Formula for the calculation "https://www.w3.org/TR/WCAG21/#dfn-relative-luminance"
    const [r, g, b] = rgb.map(channel => {
        const c = channel/255;
        if (c <= 0.03928){
            return c/12.92;
        } else {
            return Math.pow((c + 0.055) / 1.055, 2.4);
        }
    });
    // based on the given formula for the conversion. 
    return 0.2126 * r + 0.7152 * g + 0.0722*b;
}

// Returns the calculated contrast ratio
function getContrastRatio(rgb1, rgb2){
    const L1 = getLuminence(rgb1);
    const L2 = getLuminence(rgb2);
    // Which number is the largest of the two.
    const brighter = Math.max(L1, L2)
    // Which number is the smallest of the two. 
    const darker = Math.min(L1, L2)
    // Returns the diffrence in the two numbers. 
    return (brighter + 0.05) / (darker + 0.05);
}

// Converts CSS colors into RGB arrays. 
function colorConvert(colorStr) {
    // Handler for diffrent color types (rgb/rgba/hex)
    if (!colorStr) return[255, 255, 255];
    let rgb = [255, 255, 255];
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = colorStr;
    const computed = ctx.fillStyle;

    if (computed.startsWith('#')) {
        const bigint = parseInt(computed.slice(1), 16);
        if (computed.length === 7) {
            rgb = [(bigint >> 16) & 255, (bigint >> 8) & 255];
        }
    } else if (computed.startsWith('rgb')) {
        // Used to pull the numbers out of the rgb/rgba string.
        const match = computed.match(/\d+/g);
        // Slicing it for the three numbers representing the colour.
        if (match) rgb = match.map(Number).slice(0, 3);
    }
    return rgb;
}
// Used to calculate the contrast beween the buttons and the backgrund.
function getElementContrast(el){
    const styles = window.getComputedStyle(el);
    const button = colorConvert(styles.color);
    const background = colorConvert(styles.backgroundColor || getParentBackgourncolor(el));
    return getContrastRatio(button, background);
}

// Returning the background of the page where the buttons are present, nearest non-transparent background. 
function  getParentBackground(el) {
    // Reaching up the DOM until a non-transparent background is found
    let parent = el.parentElement;
    while (parent){
        const background = window.getComputedStyle(parent).backgroundColor;
        if (background && background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent'){
            return background;
        }
        parent = parent.parentElement;
    }
    // Returning  white as the default background color. 
    return '#ffffff';
}

// Comparing the visibility of the buttons two button types.  
function analyzeButtonVisibility(doc) {
    const selectors = ['button', '[role="button"]'];
    const elements = doc.querySelectorAll(selectors.join(','));

    const denyWords = ['deny', 'no', 'nei', 'ikke tillat', 'avslå', 'avbryt', 'decline', 'reject', 'avvis'];
    const acceptWords = ['accept', 'yes', 'ja', 'tillat', 'bekreft', 'ok', 'agree', 'allow', 'godta'];

    const found = {
        accept: [],
        deny: []
    }

    // Adding the appropriate buttons to the right container. 
    elements.forEach(el => {
        const text = (el.innerText || el.value || '').toLowerCase().trim();
        if (denyWords.some(w => text.includes(w))) found.deny.push(el);
        if (acceptWords.some(w => text.includes(w))) found.accept.push(el);
    });


    // Calculating the contrast for each of the ACCEPT related buttons
    found.accept.forEach(el => {
        const contrast = getElementContrast(el);
        console.log(`[Visibility Test] ACCEPT button "${el.innerText.trim()}" contrast level: ${contrast.toFixed(2)}`)
        //Outlines the low contrast buttons in orang, just for the visuals. 
        if (contrast < 4.5) el.style.outline = '4px dashed orange';
    });

    // Calculating the contrast for each of the DENY related buttons
    found.deny.forEach(el => {
        const contrast = getElementContrast(el);
        console.log(`[Visibility Test] DENY button "${el.innerText.trim()}" contrast level: ${contrast.toFixed(2)}`)
        if (contrast < 4.5) el.style.outline = '4px dashed orange';
    });

    // Compare average contrast between the accept and deny buttons
    const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const acceptContrast = avg(found.accept.map(el => getElementContrast(el)));
    const denyContrast = avg(found.deny.map(el => getElementContrast(el)));

    if (acceptContrast && denyContrast) {
        const diff = Math.abs(acceptContrast - denyContrast);
        console.log(`[Visibility Test] Contrast diffrence between ACCEPT and DENY buttons: ${diff.toFixed(2)}`);
        // If the diffrence is greater than what should be allowed, a warning.
        if (diff > 1.0) console.warn(`[Visibility Test] Significant visual contrast diffrence: ${diff}`);
    }
}


function runVisibilityScan(){
    analyzeButtonVisibility(document);

    const frames = document.querySelectorAll('iframe');
    // Running inside every iframe to look for cookie banners to test 
    frames.forEach(frame => {
        try{
            if (frame.contentDocument) analyzeButtonVisibility(frame.contentDocument);
        } catch(err){
            // Ignores cross-origin frames
        }
    });
    // Message for the completed check on the webpage. 
    console.log(`[Visibility Test] Completed contrast check on ${window.location.href}`)
}

runVisibilityScan();

