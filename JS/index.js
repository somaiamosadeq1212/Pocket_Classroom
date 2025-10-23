//  Handle navigation and section visibility
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".section");

   showSection("library");

  // بارگذاری محتوای Library
  if (typeof setupLibrary === "function") {
    setupLibrary();
  }

  function showSection(id) {
    sections.forEach(sec => {
      sec.classList.toggle("active-section", sec.id === id);
    });
    navLinks.forEach(link => {
      link.classList.toggle("active", link.dataset.target === id);
    });
  }

  // Add click event for each navbar link
  navLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = link.dataset.target;

    if (target === "author") {
      // Clear edit mode
      localStorage.removeItem("editCapsuleId");

      // If the reset function is available, clear the form
      if (typeof resetAuthorForm === "function") resetAuthorForm();

      // display the Author tab
      showSection("author");
      return;
    }

    if (target) showSection(target);
  });
});

//  Initialize main app sections
  setupAuthor(showSection);
  setupLibrary(showSection);
  setupLearn(showSection);

  // Make the resetAuthorForm function callable from outside
window.resetAuthorForm = () => {
  const form = document.getElementById("authorForm");
  const flashcardContainer = document.getElementById("flashcardContainer");
  const quizContainer = document.getElementById("quizContainer");
  const saveBtn = document.getElementById("saveCapsule");
  if (form) form.reset();
  if (flashcardContainer) flashcardContainer.innerHTML = "";
  if (quizContainer) quizContainer.innerHTML = "";
  if (saveBtn) {
    saveBtn.textContent = "💾 Save Capsule";
    saveBtn.removeAttribute("data-editing");
  }
};
  showSection("library");

  window.showSection = showSection;
});


