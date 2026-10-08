(function () {
  "use strict";
  const $ = (id) => document.getElementById(id),
    config = window.INFRAQUOTE_CLOUD_CONFIG || {};
  let session = null,
    workspace = "",
    role = "",
    versions = [],
    handovers = [];
  const safe = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const configured = () =>
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config.url || "") &&
    !!config.publishableKey;
  function status(text) {
    $("cloudStatus").textContent = text;
  }
  async function request(path, method = "GET", body) {
    if (!configured())
      throw Error(
        "The optional shared workspace is not connected. Local tools are available.",
      );
    if (session && session.expires_at < Date.now() / 1000) {
      session = null;
      throw Error("Session expired. Sign in again.");
    }
    const response = await fetch(config.url.replace(/\/$/, "") + path, {
      method,
      headers: {
        apikey: config.publishableKey,
        "Content-Type": "application/json",
        ...(session ? { Authorization: "Bearer " + session.access_token } : {}),
        Prefer: "return=representation",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
      throw Error(
        data?.message ||
          data?.msg ||
          data?.error_description ||
          "Shared workspace request failed.",
      );
    return data;
  }
  async function run(action) {
    try {
      await action();
    } catch (error) {
      status(error.message);
    }
  }
  function selected() {
    workspace = $("cloudWorkspace").value;
    if (!workspace) throw Error("Choose a company workspace first.");
  }
  async function listWorkspaces() {
    const memberships = await request(
        `/rest/v1/iq_members?select=workspace_id,role&user_id=eq.${session.user.id}`,
      ),
      companies = await request("/rest/v1/iq_workspaces?select=id,name");
    $("cloudWorkspace").innerHTML =
      '<option value="">Choose a company</option>' +
      companies
        .map((c) => `<option value="${safe(c.id)}">${safe(c.name)}</option>`)
        .join("");
    $("cloudWorkspace").onchange = () => {
      workspace = $("cloudWorkspace").value;
      role = memberships.find((m) => m.workspace_id === workspace)?.role || "";
      $("cloudRole").textContent = role ? `Your role: ${role}` : "";
    };
    $("cloudSignedIn").hidden = false;
    $("cloudSignIn").hidden = true;
    status("Signed in. Select a company or create your first workspace.");
  }
  async function loadVersions() {
    selected();
    [versions, handovers] = await Promise.all([
      role === "operations"
        ? Promise.resolve([])
        : request(
            `/rest/v1/iq_versions?workspace_id=eq.${workspace}&order=created_at.desc&limit=50`,
          ),
      request(
        `/rest/v1/iq_handovers?workspace_id=eq.${workspace}&order=created_at.desc&limit=50`,
      ),
    ]);
    $("cloudVersions").innerHTML =
      versions
        .map(
          (v, i) =>
            `<article class="tool-item"><strong>${safe(v.reference)} · v${v.version} · ${v.approved ? "Approved" : "Draft"}</strong><p>${safe(v.created_at)}</p><button type="button" class="btn secondary" data-cloud-restore="${i}">Restore as local draft</button></article>`,
        )
        .join("") +
      handovers
        .map(
          (v, i) =>
            `<article class="tool-item"><strong>Operations handover · ${safe(v.service.reference)} · v${safe(v.service.version)}</strong><button type="button" class="btn secondary" data-cloud-dispatch="${i}">Open in InfraDispatch</button></article>`,
        )
        .join("");
    document.querySelectorAll("[data-cloud-restore]").forEach(
      (b) =>
        (b.onclick = () => {
          window.INFRAQUOTE_WORKFLOW.restore({
            ...versions[Number(b.dataset.cloudRestore)].snapshot.quote,
            quoteStatus: "Draft",
          });
          status(
            "Shared version loaded as a local draft; approved history is unchanged.",
          );
        }),
    );
    document.querySelectorAll("[data-cloud-dispatch]").forEach(
      (b) =>
        (b.onclick = () => {
          localStorage.setItem(
            "infraquote_dispatch_handover_v1",
            JSON.stringify(handovers[Number(b.dataset.cloudDispatch)].service),
          );
          location.href =
            "/live-demos/infradispatch/index.html#quotation-handover";
        }),
    );
  }
  document.addEventListener("DOMContentLoaded", () => {
    const panel = document.createElement("details");
    panel.className = "cloud-workspace";
    panel.innerHTML = `<summary>Shared company workspace · optional</summary><div class="tool-content"><p id="cloudStatus" role="status">${configured() ? "Connected to your configured backend. Sign in to access your company." : "Not connected yet. All local quotation tools work on GitHub Pages without a hosting purchase."}</p><div id="cloudSignIn" ${configured() ? "" : "hidden"}><div class="form-grid"><label>Email<input id="cloudEmail" type="email" autocomplete="username"></label><label>Password<input id="cloudPassword" type="password" autocomplete="current-password"></label></div><button type="button" class="btn secondary" id="cloudLogin">Sign in</button><p>Create users in your backend’s account settings. Credentials are not saved by this demo.</p></div><div id="cloudSignedIn" hidden><label>Company workspace<select id="cloudWorkspace"></select></label><p id="cloudRole"></p><div class="tool-row"><label>New company name<input id="cloudCompanyName"></label><button type="button" class="btn secondary" id="cloudCreate">Create company workspace</button></div><p>Sharing sends the selected draft, rates or template to your configured company backend. Uploads are manual.</p><div class="tool-row"><button class="btn secondary" type="button" id="cloudSave">Save draft to company</button><button class="btn secondary" type="button" id="cloudApproved">Upload latest approved snapshot</button><button class="btn secondary" type="button" id="cloudLoad">Load versions and handovers</button><button class="btn secondary" type="button" id="cloudSaveDefaults">Save company defaults</button><button class="btn secondary" type="button" id="cloudUploadTools">Upload local templates and rates</button><button class="btn secondary" type="button" id="cloudDownloadTools">Load company templates and rates</button><button class="btn secondary" type="button" id="cloudBackup">Download company backup</button></div><details><summary>Administrator: add a team member</summary><div class="form-grid"><label>Existing account user ID<input id="cloudMember"></label><label>Role<select id="cloudMemberRole"><option value="sales">Sales</option><option value="operations">Operations</option><option value="admin">Administrator</option></select></label></div><button class="btn secondary" type="button" id="cloudAddMember">Add or update member</button></details><div id="cloudVersions"></div><button type="button" class="btn secondary" id="cloudLogout">Sign out</button></div></div>`;
    document.querySelector(".workflow-tools").append(panel);
    $("cloudLogin").onclick = () =>
      run(async () => {
        const result = await request(
          "/auth/v1/token?grant_type=password",
          "POST",
          { email: $("cloudEmail").value, password: $("cloudPassword").value },
        );
        $("cloudPassword").value = "";
        session = {
          ...result,
          expires_at: Date.now() / 1000 + result.expires_in,
        };
        await listWorkspaces();
      });
    $("cloudLogout").onclick = () =>
      run(async () => {
        try {
          await request("/auth/v1/logout", "POST");
        } finally {
          session = null;
          workspace = "";
          role = "";
          versions = [];
          handovers = [];
          $("cloudVersions").replaceChildren();
          $("cloudSignedIn").hidden = true;
          $("cloudSignIn").hidden = false;
          status(
            "Signed out. Shared data is no longer shown. Local drafts remain on this device.",
          );
        }
      });
    $("cloudCreate").onclick = () =>
      run(async () => {
        await request("/rest/v1/rpc/iq_create_workspace", "POST", {
          workspace_name: $("cloudCompanyName").value.trim(),
        });
        await listWorkspaces();
      });
    $("cloudSave").onclick = () =>
      run(async () => {
        selected();
        const api = window.INFRAQUOTE_WORKFLOW;
        const review = api.review();
        await request("/rest/v1/rpc/iq_save_version", "POST", {
          target: workspace,
          payload: { quote: api.get(), ...review },
          approve: false,
        });
        await loadVersions();
        status("Draft snapshot saved to your company.");
      });
    $("cloudApproved").onclick = () =>
      run(async () => {
        selected();
        const stored = JSON.parse(
            localStorage.getItem("infraquote_workspace_v1") || "{}",
          ),
          reference = window.INFRAQUOTE_WORKFLOW.get().quoteNo,
          v = (stored.versions || []).find(
            (item) => item.approved && item.quote.quoteNo === reference,
          );
        if (!v)
          throw Error(
            "Save an approved local snapshot for this quotation first.",
          );
        const review =
          v.review || window.INFRAQUOTE_WORKFLOW.reviewSnapshot(v.quote);
        await request("/rest/v1/rpc/iq_save_version", "POST", {
          target: workspace,
          payload: {
            quote: v.quote,
            ...review,
            total: v.total,
            clientDocument: v.document,
            reviewedAt: v.at,
            reviewConfirmed: true,
          },
          approve: true,
        });
        await loadVersions();
        status(
          "Approved snapshot uploaded. Operations can access its sanitized handover.",
        );
      });
    $("cloudLoad").onclick = () =>
      run(async () => {
        await loadVersions();
        status("Company history loaded.");
      });
    $("cloudAddMember").onclick = () =>
      run(async () => {
        selected();
        if (!/^[0-9a-f-]{36}$/i.test($("cloudMember").value))
          throw Error("Enter the existing account UUID from your backend.");
        await request("/rest/v1/rpc/iq_add_member", "POST", {
          target: workspace,
          member_user: $("cloudMember").value,
          member_role: $("cloudMemberRole").value,
        });
        status("Team member role saved by the backend.");
      });
    $("cloudSaveDefaults").onclick = () =>
      run(async () => {
        selected();
        const stored = JSON.parse(
          localStorage.getItem("infraquote_workspace_v1") || "{}",
        );
        const changed = await request(
          `/rest/v1/iq_workspaces?id=eq.${workspace}`,
          "PATCH",
          { settings: stored.settings || {} },
        );
        if (!changed?.length)
          throw Error(
            "Administrator permission is required to update company defaults.",
          );
        status("Company defaults saved. Administrator permission is required.");
      });
    $("cloudUploadTools").onclick = () =>
      run(async () => {
        selected();
        const stored = JSON.parse(
          localStorage.getItem("infraquote_workspace_v1") || "{}",
        );
        for (const t of stored.templates || [])
          await request("/rest/v1/iq_templates", "POST", {
            workspace_id: workspace,
            name: t.name,
            setup: t.setup,
          });
        for (const r of stored.rates || [])
          await request("/rest/v1/iq_rates", "POST", {
            workspace_id: workspace,
            name: r.name,
            supplier: r.supplier,
            unit_cost: r.unitCost,
            quantity: r.quantity,
            valid_from: r.validFrom,
            valid_to: r.validTo,
            verified: r.verified,
            terms: r.terms,
          });
        status(
          "Templates and rates uploaded as copies. Repeating this action adds new copies.",
        );
      });
    $("cloudDownloadTools").onclick = () =>
      run(async () => {
        selected();
        const [templates, rates, companies] = await Promise.all([
          request(`/rest/v1/iq_templates?workspace_id=eq.${workspace}`),
          request(`/rest/v1/iq_rates?workspace_id=eq.${workspace}`),
          request(`/rest/v1/iq_workspaces?id=eq.${workspace}&select=settings`),
        ]);
        window.dispatchEvent(
          new CustomEvent("infraquote:import-tools", {
            detail: {
              settings: companies[0]?.settings,
              templates: templates.map((t) => ({
                name: t.name,
                setup: t.setup,
              })),
              rates: rates.map((r) => ({
                id: r.id,
                name: r.name,
                supplier: r.supplier,
                unitCost: Number(r.unit_cost),
                quantity: Number(r.quantity),
                validFrom: r.valid_from,
                validTo: r.valid_to,
                verified: r.verified,
                terms: r.terms,
              })),
            },
          }),
        );
        status("Company templates and rates copied to this device.");
      });
    $("cloudBackup").onclick = () =>
      run(async () => {
        selected();
        const names =
          role === "admin"
            ? [
                "iq_workspaces",
                "iq_members",
                "iq_rates",
                "iq_templates",
                "iq_versions",
                "iq_handovers",
                "iq_audit",
              ]
            : role === "sales"
              ? ["iq_rates", "iq_templates", "iq_versions", "iq_handovers"]
              : ["iq_handovers"];
        const backup = {
          format: "infraquote-company-backup-v1",
          exportedAt: new Date().toISOString(),
          workspace,
        };
        for (const table of names)
          backup[table] = await request(
            `/rest/v1/${table}?${table === "iq_workspaces" ? "id" : "workspace_id"}=eq.${workspace}`,
          );
        const url = URL.createObjectURL(
          new Blob([JSON.stringify(backup, null, 2)], {
            type: "application/json",
          }),
        );
        const a = document.createElement("a");
        a.href = url;
        a.download = "InfraQuote-company-backup.json";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        status("Company backup downloaded for your role. Keep it private.");
      });
  });
})();
