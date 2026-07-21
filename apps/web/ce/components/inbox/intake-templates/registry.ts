/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * Copyright (c) 2026 Pilo Development
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { PILO_FORK_SOURCE_URL } from "../../../constants/pilo-fork.mjs";

export type TLocalIntakeTemplate = Readonly<{
  id: string;
  name: string;
  summary: string;
  descriptionHtml: string;
  projectIds: readonly string[];
  isDefault: boolean;
  sourceUrl: string;
}>;

type TIntakeDraftWithDescription = {
  description_html?: string | null;
};

export const PILO_PROJECT_ID = "e9b270a8-719f-4e2f-80bb-e9724f906e16";

const CODEX_REQUEST_DESCRIPTION_HTML = [
  "<h1>Codex Request</h1>",
  "<h2>Goal</h2>",
  "<p>TBD</p>",
  "<h2>Work Type</h2>",
  "<p>TBD</p>",
  "<h2>Surface</h2>",
  "<p>TBD</p>",
  "<h2>Current Behavior / Problem</h2>",
  "<p>TBD</p>",
  "<h2>Desired Behavior</h2>",
  "<p>TBD</p>",
  "<h2>Acceptance Criteria</h2>",
  "<p>TBD</p>",
  "<h2>Relevant Context</h2>",
  "<p>TBD</p>",
  "<h2>Constraints / Non-Goals</h2>",
  "<p>TBD</p>",
  "<h2>Data, Safety, And Risk</h2>",
  "<p>TBD</p>",
  "<h2>Validation Expected</h2>",
  "<p>TBD</p>",
  // The colon survives Plane's HTML stripping and preserves an unknown-heading boundary in the readiness parser.
  "<h2>Definition Of Ready:</h2>",
  "<ul>",
  "<li><p>[ ] Goal is specific.</p></li>",
  "<li><p>[ ] Acceptance criteria are testable.</p></li>",
  "<li><p>[ ] Surface is identified.</p></li>",
  "<li><p>[ ] Relevant links or files are included, or explicitly marked none.</p></li>",
  "<li><p>[ ] Non-goals are stated.</p></li>",
  "<li><p>[ ] Validation is stated or explicitly unknown.</p></li>",
  "</ul>",
].join("");

const LOCAL_INTAKE_TEMPLATES: readonly TLocalIntakeTemplate[] = [
  {
    id: "pilo-codex-request-agent-ready-v1",
    name: "Codex Request - Agent Ready",
    summary: "A governed engineering request with explicit scope, risk, acceptance, and validation fields.",
    descriptionHtml: CODEX_REQUEST_DESCRIPTION_HTML,
    projectIds: [PILO_PROJECT_ID],
    isDefault: true,
    sourceUrl: PILO_FORK_SOURCE_URL,
  },
];

export function getLocalIntakeTemplates(projectId: string): readonly TLocalIntakeTemplate[] {
  return LOCAL_INTAKE_TEMPLATES.filter((template) => template.projectIds.includes(projectId));
}

export function getLocalIntakeTemplate(projectId: string, templateId: string | null): TLocalIntakeTemplate | null {
  if (!templateId) return null;

  return getLocalIntakeTemplates(projectId).find((template) => template.id === templateId) ?? null;
}

export function getDefaultLocalIntakeTemplate(projectId: string): TLocalIntakeTemplate | null {
  return getLocalIntakeTemplates(projectId).find((template) => template.isDefault) ?? null;
}

export function applyLocalIntakeTemplate<T extends TIntakeDraftWithDescription>(
  draft: T,
  template: TLocalIntakeTemplate | null
): T {
  return {
    ...draft,
    description_html: template?.descriptionHtml ?? "",
  };
}

export function isLocalIntakeTemplateDescriptionPristine(
  descriptionHtml: string | null | undefined,
  selectedTemplate: TLocalIntakeTemplate | null
): boolean {
  const currentDescription = descriptionHtml?.trim() ?? "";
  const selectedDescription = selectedTemplate?.descriptionHtml.trim() ?? "";

  if (!selectedTemplate && /^(?:<p(?:\s[^>]*)?>(?:\s|<br\s*\/?\s*>|&nbsp;)*<\/p>)*$/i.test(currentDescription)) {
    return true;
  }

  return currentDescription === selectedDescription;
}
