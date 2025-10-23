// --- امن و idempotent setupLearnTabs ---
function setupLearnTabs() {
  // اگر قبلاً راه‌اندازی شده، دوباره انجام نده
  if (window.__learnTabsInitialized) return;

  const learnRoot = document.getElementById("learn");
  if (!learnRoot) {
    console.warn("setupLearnTabs: #learn not found");
    return;
  }

  // delegation: به جای وصل listener به هر تب، به والد گوش بده
  learnRoot.addEventListener("click", (e) => {
    const tab = e.target.closest(".tab");
    if (!tab || !learnRoot.contains(tab)) return;
    activateTabByElement(tab);
  });

  // keydown handler — فقط یکبار وصل می‌شود
  const keyHandler = (e) => {
    const tabs = Array.from(document.querySelectorAll("#learn .tab"));
    if (!tabs.length) return;
    const activeIndex = tabs.findIndex(t => t.classList.contains("active"));
    if (e.key === "]") {
      activateTab((activeIndex + 1) % tabs.length);
    } else if (e.key === "[") {
      activateTab((activeIndex - 1 + tabs.length) % tabs.length);
    }
  };

  document.addEventListener("keydown", keyHandler);

  // علامت که راه‌اندازی انجام شده
  window.__learnTabsInitialized = true;
  // اگر خواستی برای debug فعال کن:
  // console.log("learnTabs initialized");
}

// --- توابع کمکی که همیشه المان‌ها را از DOM می‌خوانند (استفاده از live query) ---
function activateTab(index) {
  const tabs = Array.from(document.querySelectorAll("#learn .tab"));
  const tabContents = Array.from(document.querySelectorAll("#learn .tab-content"));
  if (!tabs.length || !tabContents.length) return;

  // safety
  index = ((index % tabs.length) + tabs.length) % tabs.length;

  tabs.forEach(t => t.classList.remove("active", "btn-success"));
  tabs.forEach(t => t.classList.add("btn-outline-info"));
  tabContents.forEach(c => c.classList.remove("active", "fade-in"));

  const tab = tabs[index];
  if (!tab) return;
  const targetId = tab.dataset.tab;
  const target = document.getElementById(targetId);

  tab.classList.add("active", "btn-success");
  tab.classList.remove("btn-outline-info");
  if (target) {
    target.classList.add("active");
    setTimeout(() => target.classList.add("fade-in"), 20);
  }
}

function activateTabByElement(tab) {
  const tabs = Array.from(document.querySelectorAll("#learn .tab"));
  const idx = tabs.indexOf(tab);
  if (idx === -1) return;
  activateTab(idx);
}


// function setupLearnTabs() {
//   const tabs = document.querySelectorAll("#learn .tab");
//   const contents = document.querySelectorAll("#learn .tab-content");

//   if (!tabs.length || !contents.length) return;

//   tabs.forEach(tab => {
//     tab.addEventListener("click", () => {
//       // Remove the active state from all tabs
//       tabs.forEach(t => t.classList.remove("active", "btn-success"));
//       tabs.forEach(t => t.classList.add("btn-outline-info"));

//       // Hide all contents
//       contents.forEach(c => c.classList.remove("active", "fade-in"));

//       // Activate clicked tab
//       tab.classList.add("active", "btn-success");
//       tab.classList.remove("btn-outline-info");

//       const targetId = tab.dataset.tab;
//       const target = document.getElementById(targetId);
//       if (target) {
//         target.classList.add("active");
//         setTimeout(() => target.classList.add("fade-in"), 20);
//       }
//     });
//   });
// }

function setupLearn() {
// Reset tabs
  resetLearnTabs();

  // Activate the Notes tab by default
  const notesTab = document.querySelector('.tab[data-tab="notes"]');
  const notesContent = document.getElementById("notes");
  if (notesTab && notesContent) {
    notesTab.classList.add("active", "btn-success");
    notesTab.classList.remove("btn-outline-info");
    notesContent.classList.add("active", "fade-in");
  }

  const tabs = document.querySelectorAll("#learn .tab");
  const tabContents = document.querySelectorAll("#learn .tab-content");
  if (!tabs.length || !tabContents.length) return;

// Load all capsules
const capsules = JSON.parse(localStorage.getItem("capsules")) || [];

// If there are no capsules, clear the Learn section and return
if (capsules.length === 0) {
  clearLearnSection();
  return;
}

// Try/Catch reading selected capsule
let selectedCapsule = null;
try {
  const rawSelected = localStorage.getItem("selectedCapsule");
  if (rawSelected) {
    selectedCapsule = JSON.parse(rawSelected);
  }
} catch (err) {
  console.error("Error reading selectedCapsule:", err);
}

// If no capsule is currently selected but there is data, select the first
if (!selectedCapsule && capsules.length > 0) {
  selectedCapsule = capsules[0];
  try {
    localStorage.setItem("selectedCapsule", JSON.stringify(selectedCapsule));
  } catch (err) {
    console.warn("Could not set default selectedCapsule:", err);
  }
}

// display the content
if (selectedCapsule) {
  showLearnContent(selectedCapsule);
  showFlashcardsForCapsule(selectedCapsule);
  startQuizForCapsule(selectedCapsule);
}

// Once capsules are loaded, also render the Library
try {
  if (typeof renderLibrary === "function") {
    loadCapsules();
  }
} catch (err) {
  console.error("Error rendering library:", err);
}

// Display content
if (selectedCapsule) {
  showLearnContent(selectedCapsule);
  showFlashcardsForCapsule(selectedCapsule);
  startQuizForCapsule(selectedCapsule);
}

  // Populate the Select element
  const capsuleSelectEl = document.getElementById("capsuleSelect");
  if (capsuleSelectEl) {
    capsuleSelectEl.innerHTML =
      capsules.map(c => `<option value="${c.id}">${c.title}</option>`).join("");
    capsuleSelectEl.value = selectedCapsule?.id || "";

    capsuleSelectEl.addEventListener("change", (e) => {
      const value = e.target.value;
      const cap = capsules.find(c => c.id == value);
      if (!cap) return;
      localStorage.setItem("selectedCapsule", JSON.stringify(cap));

        loadCapsuleIntoLearn(cap);

      // Reset tabs and activate Notes
      resetLearnTabs();
      const notesTab = document.querySelector('.tab[data-tab="notes"]');
      const notesContent = document.getElementById("notes");
      if (notesTab && notesContent) {
        notesTab.classList.add("active", "btn-success");
        notesTab.classList.remove("btn-outline-info");
        notesContent.classList.add("active", "fade-in");
      }
    });
  }

  // Activate tabs
  tabs.forEach((tab, i) =>
    tab.addEventListener("click", () => activateTab(i))
  );

  // function activateTab(index) {
  //   tabs.forEach(t => t.classList.remove("active", "btn-success"));
  //   tabs.forEach(t => t.classList.add("btn-outline-info"));
  //   tabContents.forEach(c => c.classList.remove("active", "fade-in"));

  //   const tab = tabs[index];
  //   const target = document.getElementById(tab.dataset.tab);
  //   tab.classList.add("active", "btn-success");
  //   tab.classList.remove("btn-outline-info");
  //   if (target) {
  //     target.classList.add("active");
  //     setTimeout(() => target.classList.add("fade-in"), 20);
  //   }
  // }

  // [ and ] keys for switching tabs
  document.addEventListener("keydown", (e) => {
    const activeIndex = Array.from(tabs).findIndex(t => t.classList.contains("active"));
    if (e.key === "]") activateTab((activeIndex + 1) % tabs.length);
    if (e.key === "[") activateTab((activeIndex - 1 + tabs.length) % tabs.length);
  });

  setupLearnTabs();
}

// Display content (Notes)
function showLearnContent(capsule) {
  if (!capsule) return;

  document.getElementById("learnTitle").textContent = capsule.title || "";
  document.getElementById("learnSubject").textContent = capsule.subject || "";
  document.getElementById("learnLevel").textContent = capsule.level || "";
  document.getElementById("learnDescription").textContent = capsule.description || "";

  const notesEl = document.getElementById("learnNotes");
  if (notesEl) {
    notesEl.innerHTML = "";
    if (Array.isArray(capsule.notes) && capsule.notes.length) {
      capsule.notes.forEach(note => {
        const li = document.createElement("li");
        li.textContent = note;
        notesEl.appendChild(li);
      });
    } else {
      notesEl.innerHTML = `<li class="text-muted">No notes available.</li>`;
    }
  }
    setupLearnExport(capsule);

}

// Flashcards
function showFlashcardsForCapsule(capsule) {
  if (!capsule || !capsule.flashcards) return;

  const flashcardsContainer = document.getElementById("flashcards");
  if (!flashcardsContainer) return;

  flashcardsContainer.innerHTML = `
    <div class="flashcard-wrapper">
      <div class="flashcard-header">
        <span id="flash-status">1 / ${capsule.flashcards.length} · Known: 0</span>
        <span class="flash-hint">Press <b>Space</b> to flip</span>
      </div>
      <div class="flashcard-view">
        <button class="nav-btn prev-card">◀</button>
        <div class="flashcard-container">
          <div class="flashcard" id="flashcardBox">
            <div class="front"></div>
            <div class="back"></div>
          </div>
        </div>
        <button class="nav-btn next-card">▶</button>
      </div>
      <div class="flashcard-actions">
        <button class="btn-unknown">😕 Mark Unknown</button>
        <button class="btn-known">✅ Mark Known</button>
      </div>
    </div>
  `;

  const flashcardBox = flashcardsContainer.querySelector("#flashcardBox");
  const flashStatus = flashcardsContainer.querySelector("#flash-status");
  const prevBtn = flashcardsContainer.querySelector(".prev-card");
  const nextBtn = flashcardsContainer.querySelector(".next-card");
  const knownBtn = flashcardsContainer.querySelector(".btn-known");
  const unknownBtn = flashcardsContainer.querySelector(".btn-unknown");

  let currentIndex = 0;

  // Retrieve Known and Unknown status from the capsule
  let knownStatus = new Array(capsule.flashcards.length).fill(false);
  let unknownStatus = new Array(capsule.flashcards.length).fill(false);

  if (Array.isArray(capsule.knownCards)) {
    capsule.knownCards.forEach(i => {
      if (i >= 0 && i < knownStatus.length) knownStatus[i] = true;
    });
  }
  if (Array.isArray(capsule.unknownCards)) {
    capsule.unknownCards.forEach(i => {
      if (i >= 0 && i < unknownStatus.length) unknownStatus[i] = true;
    });
  }

  let knownCount = knownStatus.filter(k => k).length;

  // Display the current flashcard and update its status
  function renderFlashcard() {
    const card = capsule.flashcards[currentIndex];
    if (!card) return;

    flashcardBox.querySelector(".front").textContent = card.term || card.front || "No front";
    flashcardBox.querySelector(".back").textContent = card.definition || card.back || "No back";
    flashcardBox.classList.remove("flipped");

    flashStatus.textContent = `${currentIndex + 1} / ${capsule.flashcards.length} · Known: ${knownCount}`;

   // Button states
    knownBtn.disabled = knownStatus[currentIndex];
    knownBtn.classList.toggle("disabled", knownStatus[currentIndex]);
    unknownBtn.disabled = unknownStatus[currentIndex];
    unknownBtn.classList.toggle("disabled", unknownStatus[currentIndex]);
  }

  renderFlashcard();

  // Flashcard interaction: flip on click or Space key, navigate with Prev/Next buttons
  const flipFlashcard = () => {
  flashcardBox.classList.toggle("flipped");
};

// click listener
flashcardBox.addEventListener("click", flipFlashcard);

// space listener
document.addEventListener("keydown", e => {
  const tag = e.target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea") return; // Allow typing in forms

  if (e.code === "Space") {
    e.preventDefault();
    flipFlashcard();
  }
});

//  prev button
  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + capsule.flashcards.length) % capsule.flashcards.length;
    renderFlashcard();
  });
  // next button
  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % capsule.flashcards.length;
    renderFlashcard();
  });

  // Mark flashcard as Known/Unknown, update counts, storage, and Library badge
  knownBtn.addEventListener("click", () => {
  if (!knownStatus[currentIndex]) {
    knownStatus[currentIndex] = true;
    knownCount++;
    capsule.knownCount = knownCount;
    updateCapsuleInStorage(capsule);
    renderFlashcard();

    // Update Library card
    if (typeof updateLibraryBadge === "function") {
      updateLibraryBadge(capsule);
    }
  }
});

unknownBtn.addEventListener("click", () => {
  if (knownStatus[currentIndex]) {
    knownStatus[currentIndex] = false;
    knownCount--;
    capsule.knownCount = knownCount;
    updateCapsuleInStorage(capsule);
    renderFlashcard();

    // Update Library card
    if (typeof updateLibraryBadge === "function") {
      updateLibraryBadge(capsule);
    }
  }
});
}



function startQuizForCapsule(capsule) {
  if (!capsule || !Array.isArray(capsule.quizzes) || capsule.quizzes.length === 0) return;

  const quizBox = document.querySelector("#quiz .quiz-box");
  if (!quizBox) return console.warn("❗quizBox not found in DOM.");

  let qIndex = 0;
  let score = 0;

  function sanitizeHTML(str) {
    return str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
  }

  function renderQuestion() {
    const q = capsule.quizzes[qIndex];
    if (!q) {
      quizBox.innerHTML = `<div class="text-muted">No question available.</div>`;
      return;
    }

    const choices = Array.isArray(q.choices) ? q.choices : [];

    quizBox.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-header">
          <span id="quiz-progress">Question ${qIndex + 1} / ${capsule.quizzes.length}</span>
          <span id="quiz-score">Score: ${score}</span>
        </div>
        <div class="quiz-body">
          <p class="quiz-question"><b>Q${qIndex + 1}:</b> ${sanitizeHTML(q.question)}</p>
          <ul class="quiz-choices">
            ${choices.map((c, i) => `<li><button class="choice-btn" data-index="${i}">${sanitizeHTML(c)}</button></li>`).join("")}
          </ul>
        </div>
        <div class="quiz-footer">
          <button id="next-question" class="btn btn-primary d-none">Next ➡</button>
        </div>
      </div>
    `;

    const nextBtn = quizBox.querySelector("#next-question");
    const choiceBtns = quizBox.querySelectorAll(".choice-btn");

    // If there are no options
    if (choiceBtns.length === 0) {
      quizBox.querySelector(".quiz-choices").innerHTML = `<li class="text-muted">No choices available.</li>`;
      nextBtn.classList.remove("d-none");
      nextBtn.onclick = () => {
        qIndex++;
        if (qIndex < capsule.quizzes.length) renderQuestion();
        else showQuizResult(capsule, score);
      };
      return;
    }

    // Handle the selection of options
    choiceBtns.forEach(btn => {
      btn.onclick = () => {
        const selected = Number(btn.dataset.index);
        const correct = Number(q.correct); 
        if (selected === correct) {
          btn.classList.add("correct");
          score++;
        } else {
          btn.classList.add("wrong");
          const correctBtn = quizBox.querySelector(`.choice-btn[data-index="${correct}"]`);
          if (correctBtn) correctBtn.classList.add("correct");
        }

        // Disable all the options
        choiceBtns.forEach(b => b.disabled = true);

        // Display the Next button
        nextBtn.classList.remove("d-none");

        // Update score and save
        capsule.quizScore = score;
        capsule.quizTotal = capsule.quizzes.length;
        capsule.lastUpdated = new Date().toLocaleString();
        try {
          updateCapsuleInStorage(capsule);
        } catch (err) {
          console.warn("updateCapsuleInStorage failed:", err);
        }

        // Send notification to the Library
        window.dispatchEvent(new CustomEvent("capsuleUpdated", { detail: { capsuleId: capsule.id } }));
      };
    });

    // click the next button
    nextBtn.onclick = () => {
      qIndex++;
      if (qIndex < capsule.quizzes.length) renderQuestion();
      else showQuizResult(capsule, score);
    };
  }

  //  start display
  renderQuestion();
}

// show result of quiz
function showQuizResult(capsule, score) {
  const quizBox = document.querySelector("#quiz .quiz-box");
  if (!quizBox) return;

  const total = capsule.quizzes.length;

  // Save final score and last updated time
  capsule.quizScore = score;
  capsule.quizTotal = total;
  capsule.lastUpdated = new Date().toLocaleString();
  updateCapsuleInStorage(capsule);

  // Notify Library to refresh the card
  window.dispatchEvent(new CustomEvent("capsuleUpdated", { detail: { capsuleId: capsule.id } }));

  quizBox.innerHTML = `
    <div class="quiz-result text-center">
      <h3>🎉 Quiz Completed!</h3>
      <p>You answered <strong>${score}</strong> out of <strong>${total}</strong> correctly.</p>
      <p>Score: ${(score / total * 100).toFixed(0)}%</p>
      <button id="retryQuizBtn" class="btn btn-info mt-3">🔁 Retry Quiz</button>
    </div>
  `;

  const retryBtn = document.getElementById("retryQuizBtn");
  if (retryBtn) retryBtn.addEventListener("click", () => startQuizForCapsule(capsule));
}

// updateCapsuleInStorage function
function updateCapsuleInStorage(capsule) {
  try {
    const allCapsRaw = localStorage.getItem("capsules");
    const allCaps = allCapsRaw ? JSON.parse(allCapsRaw) : [];
    const idx = allCaps.findIndex(c => c.id == capsule.id);
    if (idx !== -1) {
      allCaps[idx] = capsule;
      localStorage.setItem("capsules", JSON.stringify(allCaps));
    } else {
      
      allCaps.push(capsule);
      localStorage.setItem("capsules", JSON.stringify(allCaps));
    }

// If the current selectedCapsule matches this id, update it with the new data
    try {
      const rawSel = localStorage.getItem("selectedCapsule");
      if (rawSel) {
        let sel = null;
        try { sel = JSON.parse(rawSel); } catch { sel = rawSel; }
        const selId = (typeof sel === "object" && sel.id) ? sel.id : sel;
        if (selId == capsule.id) {
          localStorage.setItem("selectedCapsule", JSON.stringify(capsule));
        }
      }
    } catch (err) {
      console.warn("Could not sync selectedCapsule after update:", err);
    }
  } catch (err) {
    console.error("Failed to update capsule in storage:", err);
  }
}



// Reset tabs and activate Notes by default
function resetLearnTabs() {
  document.querySelectorAll("#learn .tab").forEach(tab => {
    tab.classList.remove("active", "btn-success");
    tab.classList.add("btn-outline-info");
  });
  document.querySelectorAll("#learn .tab-content").forEach(tc => tc.classList.remove("active", "fade-in"));

  // activate Notes by default
  const notesTab = document.querySelector('.tab[data-tab="notes"]');
  const notesContent = document.getElementById("notes");
  if (notesTab && notesContent) {
    notesTab.classList.add("active", "btn-success");
    notesTab.classList.remove("btn-outline-info");
    notesContent.classList.add("active");
  }
}

function loadCapsuleIntoLearn(capsule) {
  try {
    if (!capsule) return;

    // store in local storage
    localStorage.setItem("selectedCapsule", JSON.stringify(capsule));

    //  reset of tabs
    resetLearnTabs();

    // render of 3 sections
    showLearnContent(capsule);
    showFlashcardsForCapsule(capsule);
    startQuizForCapsule(capsule);

    setupLearnTabs();

    // active the note tabs
    const notesTab = document.querySelector('.tab[data-tab="notes"]');
    const notesContent = document.getElementById("notes");
    if (notesTab && notesContent) {
      notesTab.classList.add("active", "btn-success");
      notesTab.classList.remove("btn-outline-info");
      notesContent.classList.add("active", "fade-in");
    }

  } catch (err) {
    console.error("❌ Error loading capsule into Learn:", err);
  }
}

function setupLearnExport(capsule) {
  const exportBtn = document.getElementById("exportLearnBtn");
  if (!exportBtn) return; // Exit safely if it doesn't exist

 // Clone the button to clear old event listeners
  const newBtn = exportBtn.cloneNode(true);
  exportBtn.replaceWith(newBtn);

// Only attach event listener if the button exists
  if (newBtn) {
    newBtn.addEventListener("click", () => {
      exportCapsule(capsule);
    });
  }
}

function clearLearnSection() {
  // clear text
  const ids = ["learnTitle", "learnSubject", "learnLevel", "learnDescription"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });

  //  clear Notes
  const notesEl = document.getElementById("learnNotes");
  if (notesEl) {
    notesEl.innerHTML = `<li class="text-warning fs-4 fade-in">No capsules available.</li>`;
  }

  // clear flashcards
  const flashcardsContainer = document.getElementById("flashcards");
  if (flashcardsContainer) {
    flashcardsContainer.innerHTML = `
      <div class="text-center text-warning fs-4 fade-in p-3">
        No flashcards available.
      </div>`;
  }

  // Clear Quiz (if exists)
  const quizBox = document.querySelector("#quiz .quiz-box");
  if (quizBox) {
    quizBox.innerHTML = `
      <div class="text-center fs-4 text-warning fade-in p-3">
        No quizzes available.
      </div>`;
  }

  //  clear the Select dropdown
  const capsuleSelectEl = document.getElementById("capsuleSelect");
  if (capsuleSelectEl) {
    capsuleSelectEl.innerHTML = `<option value="">No capsules available</option>`;
  }
  setupLearnTabs();
}

// Expose functions for external use / Global access
window.showLearnContent = showLearnContent;
window.showFlashcardsForCapsule = showFlashcardsForCapsule;
window.startQuizForCapsule = startQuizForCapsule;
window.setupLearn = setupLearn;
window.loadCapsuleIntoLearn = loadCapsuleIntoLearn;
