// A test that attempts to detect a reject button in the cookie form. Returns a dictionary with the results.

export async function runCheck(doc) {
	const CHECK_NAME = "no_reject_button";

	const rejectKeywords = [
		"avvis", "avslå", "nekt", "ikke godta", "ikke aksepter", "ikke tillat",
		"avvis alle", "avslå alle", "nekt alle",
		"bare nødvendige", "kun nødvendige",
		"nei takk", "nei", "takk nei", "velg bort", "velg bort alle",
		"avslå informasjonskapsler", "avvis informasjonskapsler", "avvis cookies",
		"reject", "reject all", "decline", "deny",
		"only necessary", "essential only", "necessary only"
	];


	const isVisible = (element) => {
		const style = element.ownerDocument.defaultView.getComputedStyle(element);
		return (
			style.display !== "none" &&
			style.visibility !== "hidden" &&
			style.opacity !== "0" &&
			element.offsetWidth > 0 &&
			element.offsetHeight > 0
		)
	}

	const findRejectButton = (elements) => {
		for (const element of elements) {
			if (!isVisible(element)) continue;

			const text = (element.innerText || element.value || element.id || "")
				.toLowerCase()
				.trim();

			for (const keyword of rejectKeywords) {
				if (text.includes(keyword)) {
					return element;
				}
			}
		}
		return null;
	}

	function scan(docNode, depth = 0, visited = new WeakSet()) {
		if (!docNode || depth > 2 || visited.has(docNode)) return null;
		visited.add(docNode);

		const elements = docNode.querySelectorAll("button, a, input[type='button'], input[type='submit']");

		const found = findRejectButton(elements)
		if (found) return found

		return null;
	}

	const match = scan(doc);


	const getDomPath = (el) => {
		try {
			const path = [];
			while (el && el.nodeType === Node.ELEMENT_NODE) {
				let selector = el.nodeName.toLowerCase();
				if (el.id) {
					selector += `#${el.id}`;
					path.unshift(selector);
					break;
				}
				if (el.className) {
					selector += "." + [...el.classList].join(".");
				}
				path.unshift(selector);
				el = el.parentElement;
			}
			return path.join(" > ");
		} catch {
			return null;
		}
	};

	const result = {
		check: CHECK_NAME,
		passed: Boolean(match),
		severity: [5, 4],
		message: match
			? "Reject button detected."
			: "No reject button detected.",
		details: {
			found: Boolean(match),
			elementText: match ? (match.innerText || match.value || "").trim() : null,
			elementSelector: match ? getDomPath(match) : null
		}
	};


	return result;
}

