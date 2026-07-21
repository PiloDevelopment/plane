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
  PILO_PROJECT_ID,
  applyLocalIntakeTemplate,
  getDefaultLocalIntakeTemplate,
  getLocalIntakeTemplate,
  getLocalIntakeTemplates,
  isLocalIntakeTemplateDescriptionPristine,
} from "./registry.ts";
import { PILO_FORK_SOURCE_URL } from "../../../constants/pilo-fork.mjs";

const REQUIRED_HEADINGS = [
  "Goal",
  "Work Type",
  "Surface",
  "Current Behavior / Problem",
  "Desired Behavior",
  "Acceptance Criteria",
  "Relevant Context",
  "Constraints / Non-Goals",
  "Data, Safety, And Risk",
  "Validation Expected",
];

test("scopes the Codex request template to the Pilo project", () => {
  assert.equal(getLocalIntakeTemplates(PILO_PROJECT_ID).length, 1);
  assert.equal(getLocalIntakeTemplates("another-project").length, 0);
  assert.equal(getDefaultLocalIntakeTemplate("another-project"), null);
});

test("keeps the enforced readiness headings and fail-closed placeholders", () => {
  const template = getDefaultLocalIntakeTemplate(PILO_PROJECT_ID);
  assert.ok(template);

  for (const heading of REQUIRED_HEADINGS) {
    assert.ok(
      template.descriptionHtml.includes(`<h2>${heading}</h2><p>TBD</p>`),
      `${heading} must begin with a fail-closed placeholder`
    );
  }

  assert.equal((template.descriptionHtml.match(/<p>TBD<\/p>/g) ?? []).length, 10);
  assert.ok(template.descriptionHtml.includes("<h2>Definition Of Ready:</h2>"));
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
  assert.match(PILO_FORK_SOURCE_URL, /PiloDevelopment\/plane\/tree\/v1\.2\.3-pilo\.1$/);
});

test("keys Intake draft state by project", () => {
  const createModal = readFileSync(
    new URL("../../../../core/components/inbox/modals/create-modal/modal.tsx", import.meta.url),
    "utf8"
  );

  assert.match(createModal, /<InboxIssueCreateRoot\s+key=\{projectId\}/);
});
