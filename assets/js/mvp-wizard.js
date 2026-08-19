(function () {
  "use strict";

  function createProgress(steps, activeIndex, onGo) {
    var progress = document.createElement("div");
    progress.className = "mvp-progress";
    steps.forEach(function (step, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = index === activeIndex ? "active" : index < activeIndex ? "done" : "";
      button.innerHTML = "<span>" + (index + 1) + "</span>" + step.label;
      button.addEventListener("click", function () { onGo(index); });
      progress.appendChild(button);
    });
    return progress;
  }

  function createWizardSidebar(title, note) {
    var sidebar = document.createElement("aside");
    sidebar.className = "mvp-sidebar";
    sidebar.innerHTML = '<div class="mvp-sidebar-head"><strong>' + title + '</strong><p>' + note + '</p></div>';
    var progressHost = document.createElement("div");
    progressHost.className = "mvp-progress-host";
    sidebar.appendChild(progressHost);
    return { sidebar: sidebar, progressHost: progressHost };
  }

  function createControls(onBack, onNext) {
    var controls = document.createElement("div");
    controls.className = "mvp-step-controls";
    controls.innerHTML = '<button class="btn secondary" type="button" data-mvp-back>Back</button><button class="btn" type="button" data-mvp-next>Next</button>';
    controls.querySelector("[data-mvp-back]").addEventListener("click", onBack);
    controls.querySelector("[data-mvp-next]").addEventListener("click", onNext);
    return controls;
  }

  function requiredMissing(panel) {
    var firstMissing = null;
    panel.querySelectorAll("[data-mvp-required]").forEach(function (field) {
      field.classList.remove("mvp-field-error");
      if (field.closest("[hidden]")) return;
      var control = field.querySelector("input, select, textarea");
      if (control && !String(control.value || "").trim()) {
        field.classList.add("mvp-field-error");
        if (!firstMissing) firstMissing = control;
      }
    });
    if (firstMissing) {
      firstMissing.focus();
      return true;
    }
    return false;
  }

  function enhanceInfraSky() {
    var app = document.getElementById("infraSkyApp");
    var form = app && app.querySelector(".sky-form");
    var output = app && app.querySelector(".sky-output-panel");
    if (!form || !output || form.dataset.mvpWizard === "true") return;
    app.classList.add("infrasky-mvp-active");
    form.dataset.mvpWizard = "true";

    var runButton = document.getElementById("runInfraSky");
    function fieldById(id) {
      var control = document.getElementById(id);
      return control ? control.closest("label, .sky-field-row, div") : null;
    }
    function fieldGroup(selector) {
      return form.querySelector(selector);
    }
    var stepDefs = [
      { label: "Product", title: "Project, date and product fit", items: [fieldById("skyLocation"), fieldGroup(".sky-location-tools"), fieldGroup(".sky-location-brief"), fieldById("skyDate"), fieldById("skyPax"), fieldById("experienceType")], required: ["skyLocation", "skyDate", "skyPax", "experienceType"] },
      { label: "Guests", title: "Guest profile, language and transport", items: [fieldById("guestType"), fieldById("skyLanguage"), fieldById("pickupOrigin"), fieldById("transportMode"), fieldById("earliestStart"), fieldById("latestFinish"), fieldGroup(".sky-time-advisor"), fieldById("riskTolerance")], required: ["guestType", "skyLanguage", "pickupOrigin", "transportMode"] },
      { label: "Operations", title: "Lighting, equipment, guide readiness and notes", items: [fieldById("campLighting"), fieldGroup(".sky-check-grid")?.parentElement, fieldById("guideLevel"), fieldGroup(".sky-check-list")?.parentElement, fieldById("operationalNotes")], required: ["campLighting", "guideLevel"] },
      { label: "Report", title: "Run the MVP and review the operating report", items: [runButton].filter(Boolean), output: true }
    ];

    var wizard = document.createElement("div");
    wizard.className = "mvp-wizard mvp-sky-wizard";
    var panels = [];
    var active = 0;

    stepDefs.forEach(function (step, index) {
      var panel = document.createElement("section");
      panel.className = "mvp-step-panel";
      panel.dataset.mvpStep = String(index);
      panel.innerHTML = '<div class="step-head"><span>Step ' + (index + 1) + '</span><h2>' + step.title + '</h2></div>';
      var body = document.createElement("div");
      body.className = "mvp-step-body";
      step.items.forEach(function (item) {
        if (!item) return;
        body.appendChild(item);
        var control = item.querySelector && item.querySelector("input, select, textarea");
        if (control && step.required && step.required.indexOf(control.id) !== -1) {
          item.setAttribute("data-mvp-required", "true");
        }
      });
      if (step.output) {
        var actionWrap = document.createElement("div");
        actionWrap.className = "mvp-final-action";
        if (runButton) actionWrap.appendChild(runButton);
        var note = document.createElement("p");
        note.className = "mvp-note";
        note.textContent = "Generate the decision score, guest promise, guide brief, field checklist, calendar signals and export payloads. The report appears directly below this MVP workspace.";
        body.appendChild(note);
        body.appendChild(actionWrap);
      }
      panel.appendChild(body);
      panels.push(panel);
      wizard.appendChild(panel);
    });

    var controls = createControls(function () {
      active = Math.max(0, active - 1);
      render();
    }, function () {
      if (requiredMissing(panels[active])) return;
      if (active < panels.length - 1) active += 1;
      else if (runButton) runButton.click();
      render();
    });

    var layout = document.createElement("div");
    layout.className = "mvp-layout";
    var sidebarBits = createWizardSidebar("InfraSky MVP flow", "Add the required data step by step, then run the operational report.");
    var workspace = document.createElement("div");
    workspace.className = "mvp-workspace";
    workspace.appendChild(wizard);
    workspace.appendChild(controls);
    layout.appendChild(sidebarBits.sidebar);
    layout.appendChild(workspace);
    form.appendChild(layout);

    var progressHost = sidebarBits.progressHost;

    function render() {
      progressHost.innerHTML = "";
      progressHost.appendChild(createProgress(stepDefs, active, function (index) {
        if (index > active && requiredMissing(panels[active])) return;
        active = index;
        render();
      }));
      panels.forEach(function (panel, index) { panel.hidden = index !== active; });
      form.querySelector("[data-mvp-back]").disabled = active === 0;
      form.querySelector("[data-mvp-next]").textContent = active === panels.length - 1 ? "Run / refresh report" : "Next";
      if (active === panels.length - 1) output.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    render();
  }

  function enhanceInfraDispatch() {
    var planner = document.querySelector(".planner-grid");
    if (!planner || planner.dataset.mvpWizard === "true") return;
    var accordions = Array.from(planner.querySelectorAll(".planner-main > details.accordion"));
    if (!accordions.length) return;
    planner.dataset.mvpWizard = "true";
    planner.classList.add("dispatch-mvp-wizard");

    var labels = [
      "Trip",
      "Points",
      "Costs",
      "Approval",
      "Results",
      "Export"
    ];
    var active = 0;
    var existingSidebar = planner.querySelector(".planner-sidebar");
    var sidebarBits = createWizardSidebar("InfraDispatch MVP flow", "Work through trip, points, costs, approval, results and export in order.");
    sidebarBits.sidebar.classList.add("dispatch-progress-host", "no-print");
    var progressHost = sidebarBits.progressHost;
    var controls = createControls(function () {
      active = Math.max(0, active - 1);
      render();
    }, function () {
      active = Math.min(accordions.length - 1, active + 1);
      render();
    });
    controls.classList.add("no-print");
    if (existingSidebar) existingSidebar.insertBefore(sidebarBits.sidebar, existingSidebar.firstChild);
    else planner.querySelector(".planner-main").insertBefore(sidebarBits.sidebar, planner.querySelector(".planner-main").firstChild);
    planner.querySelector(".planner-main").appendChild(controls);

    function render() {
      progressHost.innerHTML = "";
      progressHost.appendChild(createProgress(labels.map(function (label) { return { label: label }; }), active, function (index) {
        active = index;
        render();
      }));
      accordions.forEach(function (accordion, index) {
        accordion.open = index === active;
        accordion.classList.toggle("mvp-active-accordion", index === active);
        accordion.hidden = index !== active;
      });
      controls.querySelector("[data-mvp-back]").disabled = active === 0;
      controls.querySelector("[data-mvp-next]").textContent = active === accordions.length - 1 ? "Review again" : "Next";
      if (active === accordions.length - 1) controls.querySelector("[data-mvp-next]").addEventListener("click", function once() {
        active = 0;
        controls.querySelector("[data-mvp-next]").removeEventListener("click", once);
        render();
      }, { once: true });
    }
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    enhanceInfraSky();
    enhanceInfraDispatch();
  });
}());
