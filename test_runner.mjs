// Dynamically import modules and run their checks on successful document load.
// TODO: Delay running the detectors so that the cookie form can load.

(async () => {
	const modulePaths = [
		//"cookies_tests/test_pre_ticked_checkbox.mjs",
		//"cookies_tests/test_no_reject_button.mjs",
		"cookies_tests/test_banner_readability.mjs",
		"cookies_tests/test_layering.mjs",
		"cookies_tests/test_withdraw_icon.mjs",
		"cookies_tests/test_legitimate_interest.mjs",
	];

	const detectors = await Promise.all(
		modulePaths.map(path => import(chrome.runtime.getURL(path)))	
	);

	for (const detector of detectors) {
		if (typeof detector.runCheck === "function") {
			const result = await detector.runCheck();
			console.log(`${result.check} result:`, result)
		} else {
			console.warn("Module missing runCheck() function:", detector);
		}
	}

})();
