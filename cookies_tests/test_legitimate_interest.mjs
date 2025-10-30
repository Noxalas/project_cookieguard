// Test for legitimate interest cookies
export function runCheck() {
  const legitimateInterestKeywords = [
    "legitimate interest",
    "legitime interesser",
    "berettiget interesse",
    "legitimate purposes",
    "business purposes",
  ];

  const legitimateInterestRules = {
    // Check if legitimate interest is clearly explained
    hasExplanation: () => {
      const consentText = document.body.innerText.toLowerCase();
      return legitimateInterestKeywords.some((keyword) =>
        consentText.includes(keyword)
      );
    },

    // Check if there's a way to object to legitimate interest processing
    hasObjectionOption: () => {
      const links = Array.from(document.getElementsByTagName("a"));
      const buttons = Array.from(document.getElementsByTagName("button"));
      const elements = [...links, ...buttons];

      return elements.some((element) => {
        const text = element.innerText.toLowerCase();
        return (
          text.includes("object") ||
          text.includes("opt out") ||
          text.includes("reject") ||
          text.includes("decline")
        );
      });
    },

    // Check if legitimate interest purposes are specific and clear
    hasClearPurposes: () => {
      const consentText = document.body.innerText.toLowerCase();
      const purposeKeywords = [
        "analytics",
        "marketing",
        "advertising",
        "personalization",
        "security",
        "fraud prevention",
      ];

      return purposeKeywords.some((purpose) => consentText.includes(purpose));
    },
  };

  const results = {
    explanation: legitimateInterestRules.hasExplanation(),
    objection: legitimateInterestRules.hasObjectionOption(),
    purposes: legitimateInterestRules.hasClearPurposes(),
  };

  const score =
    (Object.values(results).filter(Boolean).length /
      Object.keys(results).length) *
    100;

  return {
    score,
    details: {
      hasExplanation: results.explanation
        ? "Legitimate interest is explained"
        : "No clear explanation of legitimate interest",
      hasObjectionOption: results.objection
        ? "Option to object is provided"
        : "No clear way to object to processing",
      hasClearPurposes: results.purposes
        ? "Purposes are clearly stated"
        : "Purposes are not clearly specified",
    },
  };
}

// Execute the test when the content script loads
// const legitimateInterestResult = testLegitimateInterest();
// chrome.runtime.sendMessage({
//   type: "legitimateInterestTest",
//   result: legitimateInterestResult,
// });
