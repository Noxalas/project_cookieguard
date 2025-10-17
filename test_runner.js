import * as noRejectButtonDetector from "./cookie_tests/test_no_reject_button.js"
import * as preTickedCheckboxDetector from "./cookies_tests/test_pre_ticked_checkbox.js"
import * as bannerVisibilityDetector from "./cookies_tests/test_banner_readability.js"
import * as layeringDetector from "./cookies_tests/test_layering.js"
import * as withdrawIconDetector from "./cookies_tests/test_withdraw_icon.js"


const detectors = [
	noRejectButtonDetector, 
	preTickedCheckboxDetector,
	bannerVisibilityDetector,
	layeringDetector,
	withdrawIconDetector,
]


for (const detector of detectors) {
	if (typeof detector.runCheck === "function") {
		const result = detector.runCheck();
		console.log(`${result.check} result:`, result)
	} else {
		console.warn("Module missing runCheck() function:", detector);
	}
}
