(function () {
  // ---- Set your links here (or leave as "#") ----
  const LINKS = {
    interviewAgent: "https://chatgpt.com/g/g-69877ad432f481918d4fa6ec928c1009-portfolio-gpt",
    linkedin: "https://www.linkedin.com/in/andrew-heroux-9a2505198/",
    github: "https://github.com/ajheroux"
  };

  // Apply link placeholders on any page that contains these IDs
  const interviewAgentLink = document.getElementById("interviewAgentLink");
  const linkedinLink = document.getElementById("linkedinLink");
  const githubLink = document.getElementById("githubLink");

  if (interviewAgentLink) interviewAgentLink.href = LINKS.interviewAgent;
  if (linkedinLink) linkedinLink.href = LINKS.linkedin;
  if (githubLink) githubLink.href = LINKS.github;

  // ---- Filter logic (only runs on resume page if filterBar exists) ----
  const filterBar = document.getElementById("filterBar");
  if (!filterBar) return;

  const hint = document.getElementById("filterHint");
  const buttons = Array.from(filterBar.querySelectorAll(".filter-btn"));

  // We filter individual lines, and only show parent project/job if it contains matching lines.
  const lines = Array.from(document.querySelectorAll(".line[data-tags]"));
  const projects = Array.from(document.querySelectorAll("[data-project]"));
  const jobs = Array.from(document.querySelectorAll("[data-job]"));

  let filteringStarted = false;

  function normalizeTags(attr) {
    return (attr || "")
      .toLowerCase()
      .split(/\s+/)
      .map(t => t.trim())
      .filter(Boolean);
  }

  function updateBtnState(btn) {
    const isOn = btn.classList.contains("is-on");
    btn.classList.toggle("is-off", !isOn);
    btn.setAttribute("aria-pressed", isOn ? "true" : "false");
  }

  function getSelectedKeys() {
    return buttons
      .filter(b => b.classList.contains("is-on"))
      .map(b => b.dataset.filter);
  }

  function setAllOn() {
    buttons.forEach(b => {
      b.classList.add("is-on");
      b.classList.remove("is-off");
      b.setAttribute("aria-pressed", "true");
    });
  }

  function clearFiltering() {
    filteringStarted = false;

    // Show everything
    lines.forEach(el => {
      el.classList.remove("is-hidden");
      el.classList.remove("is-match");
    });

    projects.forEach(p => p.classList.remove("is-hidden"));
    jobs.forEach(j => j.classList.remove("is-hidden"));

    if (hint) hint.textContent = "Tip: click a topic to filter the resume.";
  }

  function applyFilter({ scroll = true } = {}) {
    const selected = getSelectedKeys();

    // If nothing selected, revert to show all
    if (filteringStarted && selected.length === 0) {
      setAllOn();
      clearFiltering();
      return;
    }

    // 1) Filter LINES
    lines.forEach(el => {
      const tags = normalizeTags(el.getAttribute("data-tags"));
      const matches = selected.some(k => tags.includes(k));

      el.classList.toggle("is-hidden", filteringStarted && !matches);
      el.classList.toggle("is-match", filteringStarted && matches);
    });

    // 2) Show/hide PROJECTS based on whether they contain any visible lines
    projects.forEach(project => {
      const projectLines = Array.from(project.querySelectorAll(".line[data-tags]"));
      const anyVisible = projectLines.some(l => !l.classList.contains("is-hidden"));
      project.classList.toggle("is-hidden", filteringStarted && !anyVisible);
    });

    // 3) Show/hide JOBS based on whether they contain any visible projects
    jobs.forEach(job => {
      const jobProjects = Array.from(job.querySelectorAll("[data-project]"));
      const anyVisibleProject = jobProjects.some(p => !p.classList.contains("is-hidden"));
      job.classList.toggle("is-hidden", filteringStarted && !anyVisibleProject);
    });

    if (hint) {
      hint.textContent = filteringStarted
        ? "Filtering active — click topics to refine. (Unselect all to show everything.)"
        : "Tip: click a topic to filter the resume.";
    }

    if (filteringStarted && scroll) {
      const firstVisible = lines.find(el => !el.classList.contains("is-hidden"));
      if (firstVisible) firstVisible.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Initial aria state
  buttons.forEach(b => b.setAttribute("aria-pressed", "true"));

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // First click: start filtering and show ONLY that topic
      if (!filteringStarted) {
        filteringStarted = true;
        const clickedKey = btn.dataset.filter;

        buttons.forEach(b => {
          const shouldBeOn = b.dataset.filter === clickedKey;
          b.classList.toggle("is-on", shouldBeOn);
          updateBtnState(b);
        });

        applyFilter({ scroll: true });
        return;
      }

      // After filtering started: toggle selection
      btn.classList.toggle("is-on");
      updateBtnState(btn);
      applyFilter({ scroll: true });
    });
  });

  // Initial render: show all
  clearFiltering();
})();
