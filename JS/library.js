// Prevent HTML injection
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Load capsules
function loadCapsules() {
  const capsules = getFromStorage("capsules", []);
  const libraryList = document.getElementById("libraryList");
  if (!libraryList) return;

  libraryList.innerHTML = "";
  libraryList.className = "row g-4 section active-section";

  if (capsules.length === 0) {
    libraryList.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="card text-light border-0 shadow-sm p-5">
          <h4 class="text-warning mb-3">😕 There are no capsules available.</h4>
          <p class="mb-4">Create a new capsule or import one from a JSON file to display it here.</p>
        </div>
      </div>
    `;
    return;
  }

  capsules.forEach(renderCapsule);
  addToSelect();
}

window.addEventListener("capsuleUpdated", () => {
  loadCapsules();
});

// Add to the Learn selector
function addToSelect(capsule = null) {
  const capsuleSelect = document.getElementById("capsuleSelect");
  if (!capsuleSelect) return;

  if (!capsule) {
    capsuleSelect.innerHTML = "";
    const capsules = getFromStorage("capsules", []);
    capsules.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = c.title || "Untitled";
      capsuleSelect.appendChild(option);
    });
  } else {
    const option = document.createElement("option");
    option.value = capsule.id;
    option.textContent = capsule.title || "Untitled";
    capsuleSelect.appendChild(option);
  }
}

// Render a capsule in the Library list
function renderCapsule(capsule) {
  const libraryList = document.getElementById("libraryList");
  if (!libraryList) return;

  // Calculate Progress and Score values from quizzes or flashcards
  const known = capsule.quizScore ?? capsule.knownCount ?? 0;
  const total = capsule.quizTotal ?? capsule.totalCards ?? capsule.flashcards?.length ?? 0;
  const progress = total > 0 ? Math.round((known / total) * 100) : 0;
  const updatedTime = capsule.lastUpdated || "just now";

  const col = document.createElement("div");
  col.className = "col-lg-4 col-md-6 col-12";

  // Render the capsule card
  col.innerHTML = `
    <div class="card bg-dark text-light border-0 rounded-4 shadow-sm h-100">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-1">
          <h6 class="card-title fw-bold">${escapeHtml(capsule.title || "Untitled")}</h6>
          <span class="badge bg-secondary small">${escapeHtml(capsule.level || "Beginner")}</span>
        </div>

        <p class="text-secondary small mb-2">
          ${escapeHtml(capsule.subject || "General")} • Updated ${escapeHtml(updatedTime)}
        </p>

        <div class="progress mb-2" style="height: 5px;">
          <div class="progress-bar bg-success" style="width: ${progress}%;"></div>
        </div>

        <div class="d-flex justify-content-between align-items-center small mb-3">
          <span>Quiz Score: ${known} / ${total}</span>
          <span class="known-cards" data-id="${capsule.id}">Known Cards: ${capsule.knownCount || 0}</span>          
        </div>

        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-success btn-sm flex-fill learnBtn">▶ Learn</button>
          <button class="btn btn-warning btn-sm flex-fill text-dark editBtn">✏ Edit</button>
          <button class="btn btn-info btn-sm flex-fill text-dark">📦 Export</button>
          <button class="btn btn-danger btn-sm flex-fill deleteBtn">🗑 Delete</button>
        </div>
      </div>
    </div>
  `;

  // buttons
  const learnBtn = col.querySelector(".learnBtn");
  const editBtn = col.querySelector(".editBtn");
  const exportBtn = col.querySelector(".btn-info");
  const deleteBtn = col.querySelector(".deleteBtn");

  if (learnBtn) learnBtn.addEventListener("click", () => startLearning(capsule.id));
  if (editBtn) editBtn.addEventListener("click", () => {
    localStorage.setItem("editCapsuleId", capsule.id);
    showSection("author");
    setupAuthor(showSection);
  });
  if (exportBtn) exportBtn.addEventListener("click", () => exportCapsule(capsule));
  if (deleteBtn) deleteBtn.addEventListener("click", () => deleteCapsule(capsule.id));

  libraryList.appendChild(col);
}

function startLearning(id) {
  const capsules = getFromStorage("capsules", []);
  const selected = capsules.find(c => c.id === id);

  if (!selected) return;

  // store in localStorage
  localStorage.setItem("selectedCapsule", JSON.stringify(selected));

  // go to learn tab
  document.querySelector("[data-target='learn']")?.click();

  // Full load of all three Learn sections
  if (typeof loadCapsuleIntoLearn === "function") {
    setTimeout(() => loadCapsuleIntoLearn(selected), 100);
  } else if (typeof showLearnContent === "function") {
    // Backward compatibility: if loadCapsuleIntoLearn is not defined yet
    setTimeout(() => {
      showLearnContent(selected);
      if (typeof showFlashcardsForCapsule === "function") showFlashcardsForCapsule(selected);
      if (typeof startQuizForCapsule === "function") startQuizForCapsule(selected);
    }, 100);
  }
}

// Delete capsule
function deleteCapsule(id) {
  if (confirm("Are you sure you want to delete this capsule?")) {
    let capsules = getFromStorage("capsules", []);
    capsules = capsules.filter(c => c.id !== id);
    saveToStorage("capsules", capsules);

    // delet selectedCapsule 
    const selected = JSON.parse(localStorage.getItem("selectedCapsule") || "null");
    if (selected && selected.id === id) {
      localStorage.removeItem("selectedCapsule");
    }

    // If no capsules remain → completely clear the Learn section
    if (capsules.length === 0) {
      localStorage.removeItem("selectedCapsule"); 
      clearLearnSection(); 
    }

    // Reload the Library
    loadCapsules();
  }
}

function setupLibrary() {
  loadCapsules();
}

// New Capsule button
  const newCapsuleBtn = document.getElementById("newCapsuleBtn");
  if (newCapsuleBtn) {
    newCapsuleBtn.addEventListener("click", () => {
      localStorage.removeItem("editCapsuleId");

      // Navigate to the Author tab
      showSection("author");

      // Execute setupAuthor to initialize an empty form
      if (typeof setupAuthor === "function") {
        setupAuthor(showSection);
      }
    });
  }

  // Edit Capsule
function editCapsule(id) {
  if (typeof id === "undefined" || id === null) return;
  localStorage.setItem("editCapsuleId", id);
  if (typeof showSection === "function") {
    showSection("author");
  } else {
    const nav = document.querySelector("[data-target='author']");
    if (nav) nav.click();
  }
  if (typeof setupAuthor === "function") {
    setTimeout(() => setupAuthor(window.showSection), 0);
  }
}

// Export Capsule
function exportCapsule(capsule) {
  // Convert data to JSON
  const dataStr = JSON.stringify(capsule, null, 2);

  // Create a Blob for download
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Create a temporary download link
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(capsule.title || "capsule").replace(/[^\w\s-]/g, "_")}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Release the URL
  URL.revokeObjectURL(url);
}

// Import JSON handler
function importCapsulesFromJSON() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "application/json";

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        const capsules = Array.isArray(jsonData) ? jsonData : [jsonData];

        const savedCapsules = JSON.parse(localStorage.getItem("capsules") || "[]");

        // Detect new and duplicate capsules
        const newCapsules = capsules.filter(
          (c) => !savedCapsules.some((s) => s.id === c.id)
        );
        const duplicateCapsules = capsules.filter((c) =>
          savedCapsules.some((s) => s.id === c.id)
        );

        // Save only the new capsules
        const updatedCapsules = [...savedCapsules, ...newCapsules];
        localStorage.setItem("capsules", JSON.stringify(updatedCapsules));

        // Display a more detailed message
        if (newCapsules.length > 0 && duplicateCapsules.length === 0) {
          alert(`✅ Imported ${newCapsules.length} new capsule(s) successfully!`);
        } else if (newCapsules.length > 0 && duplicateCapsules.length > 0) {
          alert(
            `✅ Imported ${newCapsules.length} new capsule(s), ⚠ skipped ${duplicateCapsules.length} duplicate(s).`
          );
        } else {
          alert("⚠ Capsule already exists — skipped import.");
        }

        loadCapsules();
      } catch (err) {
        alert("❌ Invalid JSON format! Please select a valid capsule file.");
        console.error("Import error:", err);
      }
    };

    reader.readAsText(file);
  });

  fileInput.click();
}

// Update the Known Cards badge in the Library for the given capsule
function updateLibraryBadge(capsule) {
  const libraryList = document.getElementById("libraryList");
  if (!libraryList) return;

  const cardEl = Array.from(libraryList.children).find(col => {
    return col.querySelector(".learnBtn")?.dataset.id === capsule.id;
  });

  if (cardEl) {
    const knownSpan = cardEl.querySelector(".known-cards");
    if (knownSpan) {
      knownSpan.textContent = `Known Cards: ${capsule.knownCount || 0}`;
    }
  }
}

// Import button event
document.getElementById("importJsonBtn")?.addEventListener("click", importCapsulesFromJSON);

// Expose functions for external use / Global access
window.setupLibrary = setupLibrary;
window.loadCapsules = loadCapsules;
window.addToSelect = addToSelect;
window.renderCapsule = renderCapsule;
window.escapeHtml = escapeHtml;
window.startLearning = startLearning;
window.editCapsule = editCapsule;
window.deleteCapsule = deleteCapsule;