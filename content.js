const isTopFrame = window.top === window;

const isLikelyCookieFrame = /consent|cookie|cmp|privacy|tcf|choice|banner/i.test(location.href);

chrome.runtime.sendMessage({
    type: "TEST_RUN_STARTED",
    isTopFrame: isTopFrame
});

chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg.type === "RUN_TESTS") {
        const testModules = [
            "cookies_tests/test_banner_readability.mjs",
            "cookies_tests/test_no_reject_button.mjs",
            "cookies_tests/test_withdraw_icon.mjs",
            "cookies_tests/test_legitimate_interest.mjs"
        ];

        for (const path of testModules) {
            const mod = await import(chrome.runtime.getURL(path));
            const result = await mod.runCheck(document); // real DOM
            console.log(result);
            chrome.runtime.sendMessage({
                type: "GDPR_TEST_RESULT",
                payload: result,
                frameUrl: window.location.href
            });
        }
    }
});
