export function runCheck() {
	console.log("Running pre-ticked checkboxes test...");

	const keywords = [
		"cookie",
		"consent",
		"privacy",
		"legitimate interest",
		"preference",
		"marketing",
		"statistics",
		"analytics",
		"personalization"
	]

	const allChecked = Array.from(document.querySelectorAll("input[type='checkbox]:checked"));

	const prechecked = allChecked.filter(element => {
		let labelText = "";
		const label = element.closest("label") || document.querySelector(`label[for='${element.id}']`);
		if (label) labelText = label.innerText.toLowerCase();

		const surroundingText = element.closest("*:has(label), div, section, form")?.innerText?.toLowerCase() || "";

		return keywords.some(k => labelText.includes(k) || surroundingText.includes(k));
	});

	const result = {
		name: "PreCheckedCheckboxesTest",
		isPositive: prechecked.length > 0,
		count: prechecked.length,
		elements: prechecked.map(element => ({
			label: element.closest("label")?.innerText || "",
			id: element.id || "",
			name: element.name || "",
		}))
	};

	if (result.isPositive) {
		console.warn("Pre-checked cookie-related checkboxes detected:", result.elements);
	} else {
		console.log("No pre-checked cookie-related checkboxes found.");
	}

	return result;
}
