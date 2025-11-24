const toggleModeBtn = document.getElementById('toggle-color-mode-btn');

toggleModeBtn.onclick = () => {
    document.body.classList.toggle('light');
}

let realResults = [];

function computeSiteScore(results) {
    if (!results.length) return 0;

    const total = results.length;
    const violations = results.filter(r => !r.passed).length;

    return Math.round((violations / total) * 100);
}

function updateScoreCircle(score) {
    const circle = document.querySelector('.score_container circle:nth-of-type(2)');
    const text = document.querySelector('.score_container text');

    const max = 477;
    const offset = max - (score / 100) * max;

    circle.style.strokeDashoffset = `${offset}px`;
    text.textContent = score;

    if (score >= 67) {
        circle.style.stroke = "#e74c3c"; // red
        text.style.fill = "#e74c3c";
    } else if (score >= 34) {
        circle.style.stroke = "#f1c40f"; // yellow
        text.style.fill = "#f1c40f";
    } else {
        circle.style.stroke = "#27ae60"; // green
        text.style.fill = "#27ae60";
    }
}

function testNameToTitle(test) {
    const map = {
        "banner_readability": "Banner Readability",
        "withdraw_icon": "Withdraw Consent Button",
        "no_reject_button": "Reject Button",
        "layering": "Layering",
        "legitimate_interest": "Legitimate Interest Disclosure",
    };

    return map[test] || test;
}

function mapSeverityToLabel(severity) {
    if (severity == null) return "blank";

    let value = severity;

    if (Array.isArray(severity)) {
        value = (severity[0] + severity[1]) / 2;
    }

    if (value >= 4) return "danger";
    if (value >= 2) return "warning";
    return "success";
}

function mapSeverityToLabel(severity) {
    if (!severity || severity.length <= 0.0) return "blank";

    const avg = severity[0] + severity[1] / 2.0;
    if (severity > 4.0) {
        return "danger";
    } else if (severity <= 4.0 && severity > 2.0) {
        return "warning";
    } else if (severity <= 2.0 && severity > 0.0) {
        return "success";
    }
}

function populateCards(results) {
    const container = document.getElementById("card-section");
    container.innerHTML = ""; // clear old cards

    const seenChecks = new Set(); // <-- prevent duplicates

    results.forEach((res, index) => {
        const { check, passed, severity, message } = res;

        // skip duplicates
        if (seenChecks.has(check)) return;
        seenChecks.add(check);

        console.log(
            `Result with ${check} ${passed} with severity ${severity}. ${message}`
        );

        let severityLabel = mapSeverityToLabel(severity);

        if (severityLabel === "blank") return;

        const card = createInfoCard(
            passed,
            testNameToTitle(check),
            message,
            severityLabel,
            index
        );

        container.appendChild(card);
    });
}


chrome.storage.local.get(["latestResults"], ({ latestResults }) => {
    if (latestResults) {
        populateCards(latestResults);
        realResults = latestResults;

        const score = computeSiteScore(latestResults);
        updateScoreCircle(score);
    }
});

document.getElementById('download-pdf-btn').onclick = () => {
    if (!realResults || !realResults.length) {
        alert("No results to download!");
        return;
    }

    // Using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Accessibility Test Results", 14, 20);

    let y = 30; // start y position
    doc.setFontSize(12);

    realResults.forEach((res, index) => {
        const { check, passed, severity, message } = res;
        const title = testNameToTitle(check);
        const status = passed ? "Passed" : "Failed";
        const severityLabel = mapSeverityToLabel(severity) || "N/A";

        const line = `${index + 1}. ${title} — ${status} — Severity: ${severityLabel}`;
        doc.text(line, 14, y);
        y += 8;

        // Add message if present
        if (message) {
            doc.text(`    Message: ${message}`, 14, y);
            y += 6;
        }

        // Avoid going off-page
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
    });

    // Add summary at the bottom
    const score = computeSiteScore(realResults);
    doc.setFontSize(14);
    doc.text(`\nOverall Non-compliance Score: ${score}%`, 14, y + 10);

    // Save PDF
    doc.save("test_results.pdf");
};


function createInfoCard(hasPassed, cardTitle, info, severity, tabIndex) {
    // safety fallback to avoid .charAt errors
    severity = severity || "warning";

    const card = document.createElement('div');
    card.tabIndex = tabIndex;
    card.className = `card ${hasPassed ? "success" : severity}`;

    const inner = document.createElement('div');

    const labelHeader = document.createElement('div');
    labelHeader.className = 'label_header';

    const h2 = document.createElement('h2');
    h2.textContent = cardTitle;

    const label = document.createElement('p');
    label.className = `label ${hasPassed ? "success" : severity}_bg`;

    let labelText = "";
    if (!hasPassed) {
        switch (severity) {
            case "danger":
                labelText = "Danger"
            case "warning":
                labelText = "Warning"
            case "success":
                labelText = "Danger"
        }
    } else {
        labelText = "Passed"
    }

    label.textContent = labelText;

    labelHeader.append(h2, label);

    const infoP = document.createElement('p');
    infoP.textContent = info;

    inner.append(labelHeader, infoP);
    card.append(inner);

    return card;
}