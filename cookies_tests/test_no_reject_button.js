// A test that attempts to detect a reject button in the cookie form. Returns a dictionary with the results.

const TestNoRejectButton = (() => {
	const defaultOptions = {
		rejectKeywords: ['reject', 'decline', 'refuse', 'deny'],
		acceptKeywords: ['accept', 'agree', 'allow']
	};


	function isVisible(element) {
		const style = window.getComputedStyle(element);
		return (
			style.display !== "none" &&
			style.visibility !== "hidden" &&
			style.opacity !== "0" &&
			element.offsetWidth > 0 &&
			element.offsetHeight > 0
		)
	}


	function findRejectButton() {
		const elements = document.querySelectorAll(
			"button, a, input[type='button'], input[type='submit'], div, span"
		);

		for (const element in elements) {
			// check if visible
			if (!isVisible(element)) continue;

			// selector can be improved
			const text = (element.innerText || element.id || "").toLowerCase().trim();

			for (const keyword of rejectKeywords) {
				if (text.includes(keyword)) {
					return element;
				}
			}
		}
		return null;
	}

	function check() {
		const rejectButton = findRejectButton();

		const result = new Map();

		result.set("type", "GDPR_NO_REJECT_BUTTON_TEST");

		if (rejectButton) {
			console.log("Reject button found:", rejectButton);
			result.set("isPositive", true);
			result.set("element", rejectButton);
		} else {
			console.log("No reject button detected.");
			result.set("isPositive", false);
		}

		return result;
	}
});

export default {
	TestNoRejectButton
};
