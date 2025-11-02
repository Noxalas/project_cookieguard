// cookieInformation.js
// This script is meant to look at the amount of text present in the cookie banner.
// It is meant to classify if it has got enough information for the user to understand what the cookies is used for. 

function findCookieBanner(doc) {
    // Finding the cookie banner. 
    const keywordSelectors = [
        'div[id*="cookie"]',
        'div[id*="consent"]',
        'div[class*="cookie"]',
        'div[class*="consent"]',
        'section[id*="cookie"]',
        'section[id*="consent"]',
        'section[class*="cookie"]',
        'section[class*="consent"]',
        'footer[id*="cookie"]',
        'footer[class*="cookie"]'
    ];

    // Looking for anything matching the elements and returning them in an array. 
    const elements = doc.querySelectorAll(keywordSelectors.join(','));
    return Array.from(elements);
}

// Returning the visible text from the page. 
function getVisibleText(el) {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return '';
    return el.innerText.trim();
}

// Checking if there is information in the detected cookie banner. 
function analyzeCookieInfo(doc) {
    const banners = findCookieBanner(doc);
    // If no cookie banner is detected. 
    if (banners.length === 0){
        console.log(`[Cookie Info Test] No cookie banner detected.`);
        return;
    }

    // Looks trough each banner element that is matched and counts the characters and words in the element. 
    banners.forEach(banner => {
        const text = getVisibleText(banner);
        const length = text.length;
        const wordCount = text.split(/\s+/).length;
        const readMore = ['read more', 'les mer', 'mer info', 'more info', 'learn more', 'vis mer'];
        let hasReadMore = false;

        // Checking if the banner includes "read more" or similar links or buttons. 
        const links = banner.querySelectorAll('a, button');
        links.forEach(link => {
            const linkText = (link.innerText || link.value || '').toLowerCase();
            if (readMore.some(w => linkText.includes(w))) {
                hasReadMore = true;
            }
        })

        console.log(`[Cookie Info Test] Found banner with ${wordCount} words (${length} chars)`);

        // Classing banners that have less than 150 chars or 20 words as lacking enough detail. 
        if ((length < 150 || wordCount < 20) && !hasReadMore) {
            console.log(`[Cookie Info Test] Little cookie information detected.`);
            banner.style.outline = '4px dashed orange';
        } else if (hasReadMore){
            console.log(`[Cookie Info Test] Banner includes a "Read more" link so sufficient detail likely available.`);
            banner.style.outline = '4px dashed blue';
        } else {
            console.log(`[Cookie Info Test] There looks to be sufficient amount of information about the cookie.`);
            banner.style.outline = '4px dashed green';
        }
    });

    console.log(`[Cookie Info Test] Completed can on ${window.location.href}`);
}

function runCookieInfoChecker() {
    analyzeCookieInfo(document);

    // Checking the same-origin iframes. 
    const frames = document.querySelectorAll('iframe');
    // Loops trough each iframe element to see if anyone of them contain cookie banners. 
    frames.forEach(frame => {
        try {
            if (frame.contentDocument) analyzeCookieInfo(frame.contentDocument);
        } catch (err) {
            // Ignores cross-origin frames. 
        }
    })
}

runCookieInfoChecker();
