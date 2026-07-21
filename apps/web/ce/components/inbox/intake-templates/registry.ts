/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * Copyright (c) 2026 Pilo Development
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { PILO_FORK_SOURCE_URL } from "../../../constants/pilo-fork.mjs";

export type TLocalIntakeTemplate = Readonly<{
  bestFor: readonly string[];
  id: string;
  name: string;
  summary: string;
  descriptionHtml: string;
  example: string;
  exampleTitle: string;
  guide: readonly string[];
  projectIds: readonly string[];
  isDefault: boolean;
  riskLevel: string;
  sourceUrl: string;
  surface: string;
  validationHints: readonly string[];
  workType: string;
}>;

type TIntakeDraftWithDescription = {
  description_html?: string | null;
};

export const PILO_PROJECT_ID = "e9b270a8-719f-4e2f-80bb-e9724f906e16";

export const CODEX_REQUEST_REQUIRED_SECTIONS = [
  {
    aliases: ["goal", "outcome"],
    allowExplicitUnknown: false,
    id: "goal",
    label: "Goal",
    minLength: 12,
  },
  {
    aliases: ["work type", "request type", "type"],
    allowExplicitUnknown: false,
    id: "work_type",
    label: "Work Type",
    minLength: 3,
  },
  {
    aliases: ["surface", "product surface", "area"],
    allowExplicitUnknown: false,
    id: "surface",
    label: "Surface",
    minLength: 4,
  },
  {
    aliases: ["current behavior problem", "current behavior", "problem", "context", "problem context"],
    allowExplicitUnknown: false,
    id: "current_behavior_problem",
    label: "Current Behavior / Problem",
    minLength: 18,
  },
  {
    aliases: ["desired behavior", "expected behavior", "target behavior"],
    allowExplicitUnknown: false,
    id: "desired_behavior",
    label: "Desired Behavior",
    minLength: 18,
  },
  {
    aliases: ["acceptance criteria", "success criteria", "definition of done"],
    allowExplicitUnknown: false,
    id: "acceptance_criteria",
    label: "Acceptance Criteria",
    minLength: 12,
  },
  {
    aliases: ["relevant context", "links files context", "links", "files"],
    allowExplicitUnknown: true,
    id: "relevant_context",
    label: "Relevant Context",
    minLength: 4,
  },
  {
    aliases: ["constraints non goals", "constraints and non goals", "non goals", "constraints"],
    allowExplicitUnknown: true,
    id: "constraints_non_goals",
    label: "Constraints / Non-Goals",
    minLength: 4,
  },
  {
    aliases: ["data safety and risk", "data safety risk", "safety risk", "risk"],
    allowExplicitUnknown: true,
    id: "data_safety_risk",
    label: "Data, Safety, And Risk",
    minLength: 4,
  },
  {
    aliases: ["validation expected", "validation", "test plan", "testing"],
    allowExplicitUnknown: true,
    id: "validation_expected",
    label: "Validation Expected",
    minLength: 4,
  },
] as const;

export const CODEX_REQUEST_REQUIRED_SECTION_LABELS = CODEX_REQUEST_REQUIRED_SECTIONS.map((section) => section.label);

export type TLocalIntakeReadiness = Readonly<{
  completeCount: number;
  incomplete: readonly string[];
  missing: readonly string[];
  ok: boolean;
  requiredCount: number;
}>;

const CODEX_REQUEST_DESCRIPTION_HTML = [
  "<h1>Codex Request</h1>",
  ...CODEX_REQUEST_REQUIRED_SECTIONS.flatMap((section) => [`<h2>${section.label}</h2>`, "<p>TBD</p>"]),
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

const EXPLICIT_UNKNOWN_PATTERN =
  /^(n\/a|none|none known|not applicable|not sure|unknown|no special risks?|no known risks?|no constraints?|no non-?goals?|no validation path|validation unknown)$/i;
const PLACEHOLDER_PATTERN =
  /^(tbd|todo|to do|fill in|fill this in|placeholder|example|describe|unknown|\?|n\/a|none)$/i;

const CODEX_READY_ALIAS_TO_SECTION_ID = new Map<string, string>(
  CODEX_REQUEST_REQUIRED_SECTIONS.flatMap((section) =>
    section.aliases.map((alias) => [normalizeSectionHeading(alias), section.id])
  )
);

type TLocalIntakeTemplateInput = Omit<TLocalIntakeTemplate, "descriptionHtml" | "projectIds" | "sourceUrl">;

function buildLocalIntakeTemplate(input: TLocalIntakeTemplateInput): TLocalIntakeTemplate {
  return {
    ...input,
    descriptionHtml: CODEX_REQUEST_DESCRIPTION_HTML,
    projectIds: [PILO_PROJECT_ID],
    sourceUrl: PILO_FORK_SOURCE_URL,
  };
}

const LOCAL_INTAKE_TEMPLATES: readonly TLocalIntakeTemplate[] = [
  buildLocalIntakeTemplate({
    bestFor: ["Mixed work", "Requests that need human scoping", "First pass when the type is unclear"],
    example: "Operators can filter service jobs by crew without losing status and date filters.",
    exampleTitle: "Crew filter request",
    id: "pilo-codex-request-agent-ready-v1",
    name: "Codex Request - Agent Ready",
    summary: "A complete engineering request with scope, risk, acceptance, and validation.",
    guide: ["State the operator outcome", "Name the exact surface", "List observable acceptance checks"],
    isDefault: true,
    riskLevel: "Classify in body",
    surface: "Any Pilo surface",
    validationHints: ["Focused test first", "Typecheck when contracts move", "Manual route check for UI changes"],
    workType: "General",
  }),
  buildLocalIntakeTemplate({
    bestFor: ["Broken behavior", "Console or API errors", "Regression reports"],
    example: "Service communications returns 403 for a role that should be able to review tenant messages.",
    exampleTitle: "Access regression",
    id: "pilo-codex-request-bug-v1",
    name: "Bug / Regression",
    summary: "For a reproducible break with expected vs actual behavior and a focused verification path.",
    guide: ["Paste the exact error", "Give route and tenant context", "Name the last known good behavior"],
    isDefault: false,
    riskLevel: "Usually low to medium",
    surface: "Affected surface",
    validationHints: [
      "Add or update a regression test",
      "Re-run the failing request",
      "Check logs for the original error",
    ],
    workType: "Bug fix",
  }),
  buildLocalIntakeTemplate({
    bestFor: ["Layout polish", "Interaction flow", "Accessibility and responsive fixes"],
    example: "Make the notifications edit drawer actions horizontal and add generated subject and message drafts.",
    exampleTitle: "Drawer workflow polish",
    id: "pilo-codex-request-ui-ux-v1",
    name: "UI / UX Change",
    summary: "For visual, interaction, copy, density, accessibility, or workflow improvements.",
    guide: ["Describe the user job", "Name desktop and mobile states", "Specify empty, loading, and error behavior"],
    isDefault: false,
    riskLevel: "Usually low",
    surface: "Tenant, CRM, or Admin UI",
    validationHints: [
      "Focused component/page tests",
      "Responsive check at 375px and desktop",
      "Keyboard and focus check",
    ],
    workType: "UI/UX",
  }),
  buildLocalIntakeTemplate({
    bestFor: ["500s and 502s", "Production-only failure", "Operator-blocking outage"],
    example: "Admin integrations workspace returns 500 and blocks support from reviewing tenant integration health.",
    exampleTitle: "Admin workspace incident",
    id: "pilo-codex-request-production-incident-v1",
    name: "Production Incident",
    summary: "For live failures that need impact, logs, rollback posture, and a minimal recovery path.",
    guide: ["State production impact", "Include the failing endpoint or route", "Name rollback and smoke checks"],
    isDefault: false,
    riskLevel: "High until proven otherwise",
    surface: "Production runtime",
    validationHints: [
      "Reproduce with safe read-only commands",
      "Add regression coverage",
      "Run smoke checks after deploy",
    ],
    workType: "Bug fix",
  }),
  buildLocalIntakeTemplate({
    bestFor: ["Provider OAuth", "Webhooks", "SMS, email, or DM delivery"],
    example: "System SMS should use Pilo's sender while tenant customer SMS uses the tenant's configured number.",
    exampleTitle: "Sender routing contract",
    id: "pilo-codex-request-integration-v1",
    name: "Integration Provider",
    summary: "For Gmail, RingCentral, Facebook, QuickBooks, webhook, OAuth, and delivery routing work.",
    guide: [
      "Separate Pilo-owned vs tenant-owned credentials",
      "Name provider callback or webhook paths",
      "Call out secrets",
    ],
    isDefault: false,
    riskLevel: "Medium to high",
    surface: "Integrations",
    validationHints: [
      "Provider route tests",
      "Webhook signature or callback checks",
      "No secrets in logs or client bundles",
    ],
    workType: "Feature / Bug fix",
  }),
  buildLocalIntakeTemplate({
    bestFor: ["Schema changes", "Production data repair", "Replay-safe backfills"],
    example: "Backfill service-area lineage for jobs that cannot be scheduled because the assignable area is missing.",
    exampleTitle: "Scheduling backfill",
    id: "pilo-codex-request-migration-v1",
    name: "Migration / Backfill",
    summary: "For data shape changes, repair scripts, lineage recovery, and replay-safe production backfills.",
    guide: ["Describe affected rows", "State idempotency rules", "Include rollback or verification SQL"],
    isDefault: false,
    riskLevel: "High",
    surface: "Backend/runtime",
    validationHints: ["Migration parity test", "Dry-run or count query", "Production backfill verification query"],
    workType: "Backend/runtime",
  }),
  buildLocalIntakeTemplate({
    bestFor: ["API contracts", "Service modules", "Cross-layer typed behavior"],
    example: "Notification counts should be tenant-scoped so browser tab badges do not show global unread counts.",
    exampleTitle: "Tenant-scoped API behavior",
    id: "pilo-codex-request-backend-api-v1",
    name: "Backend / API",
    summary: "For route contracts, service modules, repositories, projections, and typed frontend adapters.",
    guide: ["Name the contract boundary", "Identify canonical writes", "Call out tenant scoping"],
    isDefault: false,
    riskLevel: "Medium",
    surface: "Backend/runtime",
    validationHints: ["Route or service tests", "Contract/schema checks", "Frontend adapter tests if payloads change"],
    workType: "Feature / Refactor",
  }),
  buildLocalIntakeTemplate({
    bestFor: ["Unknown root cause", "Design or architecture discovery", "No code change expected yet"],
    example:
      "Plane intake template is not visible for the project; verify bundle, project scope, cache, and modal state.",
    exampleTitle: "Visibility investigation",
    id: "pilo-codex-request-investigation-v1",
    name: "Investigation",
    summary: "For read-only diagnosis when the right implementation path is not known yet.",
    guide: [
      "State the question to answer",
      "List evidence to collect",
      "Define the decision the investigation unlocks",
    ],
    isDefault: false,
    riskLevel: "Low unless production access is needed",
    surface: "Any Pilo surface",
    validationHints: [
      "Commands and observations",
      "No-change conclusion when appropriate",
      "Follow-up issue if code is needed",
    ],
    workType: "Investigation",
  }),
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

export function getLocalIntakeReadiness(descriptionHtml: string | null | undefined): TLocalIntakeReadiness {
  const sections = extractCodexReadySections(stripLocalDescription(descriptionHtml ?? ""));
  const missing: string[] = [];
  const incomplete: string[] = [];

  for (const requirement of CODEX_REQUEST_REQUIRED_SECTIONS) {
    const content = sections.get(requirement.id);
    if (content === undefined) {
      missing.push(requirement.label);
      continue;
    }
    if (!hasSubstantiveSectionContent(content, requirement)) {
      incomplete.push(requirement.label);
    }
  }

  const issueCount = missing.length + incomplete.length;

  return {
    completeCount: CODEX_REQUEST_REQUIRED_SECTIONS.length - issueCount,
    incomplete,
    missing,
    ok: issueCount === 0,
    requiredCount: CODEX_REQUEST_REQUIRED_SECTIONS.length,
  };
}

function extractCodexReadySections(description: string): Map<string, string> {
  const sections = new Map<string, string>();
  let currentSectionId: string | null = null;

  for (const rawLine of description.split(/\r?\n/)) {
    const heading = parseSectionHeading(rawLine);
    if (heading) {
      const sectionId = CODEX_READY_ALIAS_TO_SECTION_ID.get(heading);
      if (sectionId) {
        currentSectionId = sectionId;
        if (!sections.has(sectionId)) {
          sections.set(sectionId, "");
        }
        continue;
      }
      currentSectionId = null;
    }

    if (currentSectionId) {
      const current = sections.get(currentSectionId) ?? "";
      sections.set(currentSectionId, `${current}${rawLine}\n`);
    }
  }

  return sections;
}

function hasSubstantiveSectionContent(
  value: string,
  requirement: (typeof CODEX_REQUEST_REQUIRED_SECTIONS)[number]
): boolean {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("<!--"))
    .filter((line) => !/^example\s*:/i.test(line));

  if (lines.length === 0) {
    return false;
  }

  const cleaned = lines
    .join(" ")
    .replace(/^-+\s*/g, "")
    .replace(/\[[ xX]\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (requirement.allowExplicitUnknown && EXPLICIT_UNKNOWN_PATTERN.test(cleaned)) {
    return true;
  }

  if (cleaned.length < requirement.minLength) {
    return false;
  }

  const normalized = cleaned
    .replace(/^[-*]\s*/, "")
    .replace(/[.:]+$/g, "")
    .trim()
    .toLowerCase();

  return !PLACEHOLDER_PATTERN.test(normalized);
}

function parseSectionHeading(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) {
    return "";
  }

  const markdownHeading = trimmed.match(/^#{1,6}\s+(.+?)\s*:?\s*$/);
  if (markdownHeading) {
    return normalizeSectionHeading(markdownHeading[1]);
  }

  const boldHeading = trimmed.match(/^\*\*(.+?)\*\*\s*:?\s*$/);
  if (boldHeading) {
    return normalizeSectionHeading(boldHeading[1]);
  }

  const plainHeading = trimmed.match(/^([A-Za-z][A-Za-z0-9 /&,-]{2,80})\s*:\s*$/);
  if (plainHeading) {
    return normalizeSectionHeading(plainHeading[1]);
  }

  const normalized = normalizeSectionHeading(trimmed);
  if (CODEX_READY_ALIAS_TO_SECTION_ID.has(normalized)) {
    return normalized;
  }

  return "";
}

function normalizeSectionHeading(value: string): string {
  return value
    .replace(/\([^)]*\)/g, " ")
    .replace(/&/g, " and ")
    .replace(/[`*_~[\]]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function stripLocalDescription(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\s*li[^>]*>/gi, "\n- ")
      .replace(/<\/\s*(p|div|h[1-6]|li|ul|ol|blockquote|pre|tr|table)\s*>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
  ).trim();
}

function decodeHtmlEntities(value: string): string {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value
    .replace(/&#(\d+);/g, (_match, codePoint) => {
      const parsed = Number.parseInt(codePoint, 10);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : "";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_match, codePoint) => {
      const parsed = Number.parseInt(codePoint, 16);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : "";
    })
    .replace(/&([a-z]+);/gi, (match, name) => namedEntities[name.toLowerCase()] ?? match);
}
