// Initialize the Author section
function setupAuthor(showSection) {
  const authorSection = document.getElementById("author");
  const get = id => {
    if (!authorSection) return document.getElementById(id);
    return authorSection.querySelector(`#${id}`) || document.getElementById(id);
  };

  // The rest of the code remains the same, using the new get function
  let saveBtn = get("saveCapsule");
  let flashcardSContainer = get("flashcardsContainer");
  let quizContainer = get("quizContainer");
  let addFlashcardBtn = get("addFlashcardBtn");
  let addQuizBtn = get("addQuizBtn");
  let backBtn = get("backToLibrary");
  let form = get("authorForm");

  const ensureFresh = el => {
    if (!el) return null;
    const newEl = el.cloneNode(true);
    el.parentNode.replaceChild(newEl, el);
    return newEl;
  };

  // Form reset function
  function resetAuthorForm() {
    form = get("authorForm");
    flashcardsContainer = get("flashcardsContainer");
    quizContainer = get("quizContainer");
    saveBtn = get("saveCapsule");

    if (form) form.reset();
    if (flashcardsContainer) flashcardsContainer.innerHTML = "";
    if (quizContainer) quizContainer.innerHTML = "";
    if (saveBtn) {
      saveBtn.textContent = "💾 Save Capsule";
      saveBtn.removeAttribute("data-editing");
    }
  }
  window.resetAuthorForm = resetAuthorForm;

// Refresh elements (reselect them from the Author section)
  saveBtn = ensureFresh(saveBtn) || get("saveCapsule");
  addFlashcardBtn = ensureFresh(addFlashcardBtn) || get("addFlashcardBtn");
  addQuizBtn = ensureFresh(addQuizBtn) || get("addQuizBtn");
  backBtn = ensureFresh(backBtn) || get("backToLibrary");

  // Back button
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      resetAuthorForm();
      localStorage.removeItem("editCapsuleId");
      if (typeof loadCapsules === "function") loadCapsules();
      showSection("library");
    });
  }

// Load edit mode only if editCapsuleId exists
  const editingCapsuleId = localStorage.getItem("editCapsuleId");

  if (editingCapsuleId) {
    const capsules = getFromStorage("capsules", []);
    const capsuleToEdit = capsules.find(c => c.id == editingCapsuleId);

    if (capsuleToEdit) {
      // Fill in the fields (always within the Author section)
      (get("title") || {}).value = capsuleToEdit.title || "";
      (get("subject") || {}).value = capsuleToEdit.subject || "";
      (get("level") || {}).value = capsuleToEdit.level || "Beginner";
      (get("description") || {}).value = capsuleToEdit.description || "";
      (get("notesInput") || {}).value = (capsuleToEdit.notes || []).join("\n");

      // Flashcards
      flashcardsContainer = get("flashcardsContainer");
      if (flashcardsContainer) {
        flashcardsContainer.innerHTML = "";
        (capsuleToEdit.flashcards || []).forEach(fc => {
          const row = document.createElement("div");
          row.className = "flashcard-row";
          row.innerHTML = `
            <input type="text" placeholder="Term (Front)" value="${(fc.term || "").replace(/"/g, "&quot;")}">
            <input type="text" placeholder="Definition (Back)" value="${(fc.definition || "").replace(/"/g, "&quot;")}">
            <button class="removeCard">✖</button>
          `;
          row.querySelector(".removeCard").addEventListener("click", () => row.remove());
          flashcardsContainer.appendChild(row);
        });
      }

      // Quizzes
      quizContainer = get("quizContainer");
      if (quizContainer) {
        quizContainer.innerHTML = "";
        (capsuleToEdit.quizzes || []).forEach(qz => {
          const card = document.createElement("div");
          card.className = "quiz-card p-3 rounded";
          card.innerHTML = `
            <label class="form-label text-success">Question</label>
            <input type="text" class="form-control mb-3" value="${(qz.question || "").replace(/"/g, "&quot;")}">
            <div class="row g-2">
              ${(qz.choices || []).map((c, i) => `
                <div class="col-md-6">
                  <input type="text" class="form-control" value="${(c || "").replace(/"/g, "&quot;")}" placeholder="Choice ${String.fromCharCode(65+i)}">
                </div>`).join("")}
            </div>
            <div class="row g-2 mt-3">
              <div class="col-md-4">
                <input type="number" class="form-control" value="${qz.correct || 0}" placeholder="Correct index (0-3)">
              </div>
              <div class="col-md-8">
                <input type="text" class="form-control" value="${(qz.explanation || "").replace(/"/g, "&quot;")}" placeholder="Explanation">
              </div>
            </div>
            <button class="btn btn-danger btn-sm mt-3 removeQuiz">✖ Remove</button>
          `;
          card.querySelector(".removeQuiz").addEventListener("click", () => card.remove());
          quizContainer.appendChild(card);
        });
      }

      // Set edit mode on the button inside the Author section
      saveBtn = get("saveCapsule");
      if (saveBtn) {
        saveBtn.textContent = "✏ Update Capsule";
        saveBtn.setAttribute("data-editing", editingCapsuleId);
      }
    }
  } else {
    resetAuthorForm();
  }

  // Add flashcard
  addFlashcardBtn = get("addFlashcardBtn");
  flashcardsContainer = get("flashcardsContainer");
  if (addFlashcardBtn && flashcardsContainer) {
    addFlashcardBtn.addEventListener("click", () => {
      const row = document.createElement("div");
      row.className = "flashcard-row";
      row.innerHTML = `
        <input type="text" placeholder="Term (Front)">
        <input type="text" placeholder="Definition (Back)">
        <button class="removeCard">✖</button>
      `;
      row.querySelector(".removeCard").addEventListener("click", () => row.remove());
      flashcardsContainer.appendChild(row);
    });
  }

  // Add quiz
  addQuizBtn = get("addQuizBtn");
  quizContainer = get("quizContainer");
  if (addQuizBtn && quizContainer) {
    addQuizBtn.addEventListener("click", () => {
      const card = document.createElement("div");
      card.className = "quiz-card p-3 rounded";
      card.innerHTML = `
        <label class="form-label text-success">Question</label>
        <input type="text" placeholder="Type your question..." class="form-control mb-3">
        <div class="row g-2">
          <div class="col-md-6"><input type="text" placeholder="Choice A" class="form-control"></div>
          <div class="col-md-6"><input type="text" placeholder="Choice B" class="form-control"></div>
          <div class="col-md-6"><input type="text" placeholder="Choice C" class="form-control mt-2"></div>
          <div class="col-md-6"><input type="text" placeholder="Choice D" class="form-control mt-2"></div>
        </div>
        <div class="row g-2 mt-3">
          <div class="col-md-4"><input type="number" placeholder="Correct index (0-3)" class="form-control"></div>
          <div class="col-md-8"><input type="text" placeholder="Explanation (optional)" class="form-control"></div>
        </div>
        <button class="btn btn-danger btn-sm mt-3 removeQuiz">✖ Remove</button>
      `;
      card.querySelector(".removeQuiz").addEventListener("click", () => card.remove());
      quizContainer.appendChild(card);
    });
  }

  // Save / Update handler (scoped)
  saveBtn = ensureFresh(get("saveCapsule")) || get("saveCapsule");
  if (saveBtn) {
//     saveBtn.addEventListener("click", () => {
//       const title = (get("title")?.value || "").trim();
//       const subject = (get("subject")?.value || "").trim();
//       const level = (get("level")?.value || "Beginner");
//       const description = (get("description")?.value || "").trim();
//       const notes = (get("notesInput")?.value || "").split("\n").map(s => s.trim()).filter(Boolean);

//       if (!title) {
//         alert("Please enter a title before saving!");
//         return;
//       }

//       const fContainer = get("flashcardsContainer");
//       const flashcards = Array.from(fContainer?.children || []).map(div => {
//         const inputs = div.querySelectorAll("input");
//         return { term: (inputs[0]?.value || "").trim(), definition: (inputs[1]?.value || "").trim(), known: false };
//       }).filter(fc => fc.term || fc.definition);

//       const qContainer = get("quizContainer");
//       const quizzes = Array.from(qContainer?.children || []).map(div => {
//         const inputs = div.querySelectorAll("input");
//         return {
//           question: (inputs[0]?.value || "").trim(),
//           choices: [inputs[1]?.value, inputs[2]?.value, inputs[3]?.value, inputs[4]?.value].map(c => (c||"").trim()),
//           correct: parseInt(inputs[5]?.value || 0),
//           explanation: (inputs[6]?.value || "").trim()
//         };
//       }).filter(q => q.question);

//       let capsules = getFromStorage("capsules", []);
//       const editingId = saveBtn.getAttribute("data-editing");

//       const now = new Date().toLocaleString(); // یا به شکل timestamp: Date.now()
//       if (editingId) {
//         capsules = capsules.map(c =>
//           c.id == editingId
//             ? { ...c, title, subject, level, description, notes, flashcards, quizzes }
//             : c
//         );
//         alert("✅ Capsule updated successfully!");
//       } else {
//         const newCapsule = { id: Date.now(), title, subject, level, description, notes, flashcards, quizzes };
//         capsules.push(newCapsule);
//         alert("✅ New capsule created!");
//       }

//       saveToStorage("capsules", capsules);

//       // Clear edit mode and fully reset the form
//       localStorage.removeItem("editCapsuleId");
//       saveBtn.removeAttribute("data-editing");
//       saveBtn.textContent = "💾 Save Capsule";

//       resetAuthorForm();

//       if (typeof loadCapsules === "function") loadCapsules();

//       localStorage.removeItem("editCapsuleId");

//       setTimeout(() => {
//   showSection("library");
// }, 50);

//       // Final cleanup with a very short delay for reliability
//       setTimeout(() => {
//         resetAuthorForm();
//       }, 50);
//     });


saveBtn.addEventListener("click", () => {
  const title = (get("title")?.value || "").trim();
  const subject = (get("subject")?.value || "").trim();
  const level = (get("level")?.value || "Beginner");
  const description = (get("description")?.value || "").trim();
  const notes = (get("notesInput")?.value || "").split("\n").map(s => s.trim()).filter(Boolean);

  // ✅ Basic validations
  if (!title) {
    alert("⚠ Please enter a title before saving!");
    return;
  }
  if (!subject) {
    alert("⚠ Please enter a subject!");
    return;
  }

  // Collect flashcards
  const fContainer = get("flashcardsContainer");
  const flashcards = Array.from(fContainer?.children || []).map(div => {
    const inputs = div.querySelectorAll("input");
    return { term: (inputs[0]?.value || "").trim(), definition: (inputs[1]?.value || "").trim(), known: false };
  }).filter(fc => fc.term && fc.definition); // Only keep valid flashcards

  // Collect quizzes
  const qContainer = get("quizContainer");
  const quizzes = Array.from(qContainer?.children || []).map(div => {
    const inputs = div.querySelectorAll("input");
    return {
      question: (inputs[0]?.value || "").trim(),
      choices: [inputs[1]?.value, inputs[2]?.value, inputs[3]?.value, inputs[4]?.value].map(c => (c||"").trim()),
      correct: parseInt(inputs[5]?.value || 0),
      explanation: (inputs[6]?.value || "").trim()
    };
  }).filter(q => q.question && q.choices.every(c => c)); // Only keep valid quizzes

  // ✅ Ensure there is at least one content
  if (notes.length === 0 && flashcards.length === 0 && quizzes.length === 0) {
    alert("⚠ Please add at least one note, flashcard, or quiz before saving!");
    return;
  }

  // ✅ Optional: extra validation for each flashcard
  for (let fc of flashcards) {
    if (!fc.term || !fc.definition) {
      alert("⚠ Each flashcard must have both a term and a definition!");
      return;
    }
  }

  // ✅ Optional: extra validation for each quiz
  for (let qz of quizzes) {
    if (!qz.question) {
      alert("⚠ Quiz question cannot be empty!");
      return;
    }
    if (qz.choices.some(c => !c)) {
      alert("⚠ All quiz choices must be filled!");
      return;
    }
    if (isNaN(qz.correct) || qz.correct < 0 || qz.correct > 3) {
      alert("⚠ The correct answer index must be a number between 0 and 3!");
      return;
    }
  }

  // ✅ Save or update capsule
  let capsules = getFromStorage("capsules", []);
  const editingId = saveBtn.getAttribute("data-editing");
  if (editingId) {
    capsules = capsules.map(c =>
      c.id == editingId
        ? { ...c, title, subject, level, description, notes, flashcards, quizzes }
        : c
    );
    alert("✅ Capsule updated successfully!");
  } else {
    const newCapsule = { id: Date.now(), title, subject, level, description, notes, flashcards, quizzes };
    capsules.push(newCapsule);
    alert("✅ New capsule created!");
  }

  saveToStorage("capsules", capsules);

  // Reset and go back to library
  localStorage.removeItem("editCapsuleId");
  saveBtn.removeAttribute("data-editing");
  saveBtn.textContent = "💾 Save Capsule";
  resetAuthorForm();
  if (typeof loadCapsules === "function") loadCapsules();
  setTimeout(() => showSection("library"), 50);
});
  }
}

// Expose functions for external use / Global access
window.setupAuthor = setupAuthor;