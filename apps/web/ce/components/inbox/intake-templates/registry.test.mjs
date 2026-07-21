/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * Copyright (c) 2026 Pilo Development
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CODEX_REQUEST_REQUIRED_SECTION_LABELS,
  PILO_PROJECT_ID,
  applyLocalIntakeTemplate,
  getDefaultLocalIntakeTemplate,
  getLocalIntakeReadiness,
  getLocalIntakeTemplate,
  getLocalIntakeTemplates,
  isLocalIntakeTemplateDescriptionPristine,
} from "./registry.ts";
import { PILO_FORK_SOURCE_URL } from "../../../constants/pilo-fork.mjs";

test("scopes the Codex request template to the Pilo project", () => {
  assert.equal(getLocalIntakeTemplates(PILO_PROJECT_ID).length, 8);
  assert.equal(getLocalIntakeTemplates("another-project").length, 0);
  assert.equal(getDefaultLocalIntakeTemplate("another-project"), null);
});

test("offers purpose-fit blueprints with tailored fail-closed examples", () => {
  const templates = getLocalIntakeTemplates(PILO_PROJECT_ID);
  const template = getDefaultLocalIntakeTemplate(PILO_PROJECT_ID);
  assert.ok(template);

  assert.equal(new Set(templates.map((item) => item.id)).size, templates.length);
  assert.ok(templates.some((item) => item.name === "Bug / Regression"));
  assert.ok(templates.some((item) => item.name === "UI / UX Change"));
  assert.ok(templates.some((item) => item.name === "Production Incident"));
  assert.ok(templates.some((item) => item.name === "Migration / Backfill"));

  const descriptionBodies = new Set(templates.map((item) => item.descriptionHtml));
  assert.ok(descriptionBodies.size >= 6, "blueprints should provide type-specific inserted examples");

  for (const item of templates) {
    assert.ok(item.bestFor.length >= 2, `${item.name} should explain where it fits`);
    assert.ok(item.example.length >= 18, `${item.name} should include helper-only example copy`);
    assert.ok(item.guide.length >= 3, `${item.name} should include request-writing guidance`);
    assert.ok(item.validationHints.length >= 3, `${item.name} should include validation hints`);
    assert.doesNotMatch(item.descriptionHtml, /\bTBD\b/);
    assert.match(item.descriptionHtml, /Replace every example with the real request/);
  }
});

test("keeps the enforced readiness headings with visible example guidance", () => {
  const template = getDefaultLocalIntakeTemplate(PILO_PROJECT_ID);
  assert.ok(template);

  for (const heading of CODEX_REQUEST_REQUIRED_SECTION_LABELS) {
    assert.ok(template.descriptionHtml.includes(`<h2>${heading}</h2><blockquote><p>Example: `));
  }

  assert.equal((template.descriptionHtml.match(/<blockquote><p>Example:/g) ?? []).length, 11);
  assert.ok(template.descriptionHtml.includes("<h2>Definition Of Ready:</h2>"));
  assert.ok(template.descriptionHtml.includes("Every example above has been replaced with request-specific facts."));
  assert.equal(template.sourceUrl, PILO_FORK_SOURCE_URL);
});

test("applies only the description and preserves the rest of the draft", () => {
  const template = getDefaultLocalIntakeTemplate(PILO_PROJECT_ID);
  assert.ok(template);
  const original = { name: "Preserved title", priority: "high", description_html: "<p>Old</p>" };

  const applied = applyLocalIntakeTemplate(original, template);

  assert.equal(applied.name, original.name);
  assert.equal(applied.priority, original.priority);
  assert.equal(applied.description_html, template.descriptionHtml);
  assert.equal(applyLocalIntakeTemplate(applied, null).description_html, "");
});

test("requires confirmation only after the selected description changes", () => {
  const template = getDefaultLocalIntakeTemplate(PILO_PROJECT_ID);
  assert.ok(template);

  assert.equal(isLocalIntakeTemplateDescriptionPristine(template.descriptionHtml, template), true);
  assert.equal(isLocalIntakeTemplateDescriptionPristine("<p>Operator edit</p>", template), false);
  assert.equal(isLocalIntakeTemplateDescriptionPristine("", null), true);
  assert.equal(isLocalIntakeTemplateDescriptionPristine("<p><br></p>", null), true);
  assert.equal(isLocalIntakeTemplateDescriptionPristine("<p>&nbsp;</p>", null), true);
  assert.equal(isLocalIntakeTemplateDescriptionPristine("<p>Operator edit</p>", null), false);
  assert.equal(getLocalIntakeTemplate(PILO_PROJECT_ID, "unknown"), null);
});

test("summarizes local readiness without treating helper examples as submitted answers", () => {
  const template = getDefaultLocalIntakeTemplate(PILO_PROJECT_ID);
  assert.ok(template);

  const emptyReadiness = getLocalIntakeReadiness(template.descriptionHtml);
  assert.equal(emptyReadiness.ok, false);
  assert.equal(emptyReadiness.completeCount, 0);
  assert.deepEqual(emptyReadiness.missing, []);
  assert.deepEqual(emptyReadiness.incomplete, CODEX_REQUEST_REQUIRED_SECTION_LABELS);

  const readyDescription = [
    "<h1>Codex Request</h1>",
    "<h2>Goal</h2><p>Operators can filter service jobs by assigned crew.</p>",
    "<h2>Work Type</h2><p>Feature</p>",
    "<h2>Surface</h2><p>Tenant product</p>",
    "<h2>Current Behavior / Problem</h2><p>The service jobs list cannot filter by crew assignment.</p>",
    "<h2>Desired Behavior</h2><p>The crew filter composes with existing status and date filters.</p>",
    "<h2>Acceptance Criteria</h2><ul><li>Combined filters work.</li><li>Filtered empty state renders.</li></ul>",
    "<h2>Relevant Context</h2><p>None known</p>",
    "<h2>Constraints / Non-Goals</h2><p>No constraints</p>",
    "<h2>Data, Safety, And Risk</h2><p>No special risks</p>",
    "<h2>Validation Expected</h2><p>Run focused ServiceJobsPage tests.</p>",
    "<h2>Definition Of Ready:</h2><ul><li>[x] Goal is specific.</li></ul>",
  ].join("");

  const readyReadiness = getLocalIntakeReadiness(readyDescription);
  assert.equal(readyReadiness.ok, true);
  assert.equal(readyReadiness.completeCount, CODEX_REQUEST_REQUIRED_SECTION_LABELS.length);

  const exampleOnlyReadiness = getLocalIntakeReadiness("<h2>Goal</h2><p>Example: Operators can filter jobs.</p>");
  assert.equal(exampleOnlyReadiness.incomplete.includes("Goal"), true);
});

test("offers the tagged AGPL source on signed-out and authenticated surfaces", () => {
  const signedOutSurface = readFileSync(
    new URL("../../../../core/components/account/terms-and-conditions.tsx", import.meta.url),
    "utf8"
  );
  const authenticatedSurface = readFileSync(
    new URL("../../../../app/(all)/[workspaceSlug]/(projects)/star-us-link.tsx", import.meta.url),
    "utf8"
  );
  assert.match(signedOutSurface, /href=\{LEGAL_LINKS\.forkSource\}/);
  assert.match(authenticatedSurface, /href=\{PILO_FORK_SOURCE_URL\}/);
  assert.match(PILO_FORK_SOURCE_URL, /PiloDevelopment\/plane\/tree\/v1\.2\.3-pilo\.3$/);
});

test("keys Intake draft state by project", () => {
  const createModal = readFileSync(
    new URL("../../../../core/components/inbox/modals/create-modal/modal.tsx", import.meta.url),
    "utf8"
  );

  assert.match(createModal, /<InboxIssueCreateRoot\s+key=\{projectId\}/);
});
