/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * Copyright (c) 2026 Pilo Development
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
// plane imports
import { CustomSelect } from "@plane/ui";
// local imports
import { getLocalIntakeReadiness, getLocalIntakeTemplate, getLocalIntakeTemplates } from "./registry";

type TLocalIntakeTemplateSelectorProps = {
  descriptionHtml?: string | null;
  projectId: string;
  selectedTemplateId: string | null;
  onSelect: (templateId: string | null) => void;
  tabIndex?: number;
};

export function LocalIntakeTemplateSelector(props: TLocalIntakeTemplateSelectorProps) {
  const { descriptionHtml, projectId, selectedTemplateId, onSelect, tabIndex } = props;
  const templates = getLocalIntakeTemplates(projectId);
  const selectedTemplate = getLocalIntakeTemplate(projectId, selectedTemplateId);
  const readiness = getLocalIntakeReadiness(descriptionHtml ?? selectedTemplate?.descriptionHtml ?? "");
  const blockers = [...readiness.missing, ...readiness.incomplete];
  const readinessLabel = readiness.ok
    ? "Ready for review"
    : `${readiness.completeCount}/${readiness.requiredCount} sections filled`;
  const ReadinessIcon = readiness.ok ? CheckCircle2 : AlertTriangle;

  if (templates.length === 0) return null;

  return (
    <section aria-label="Request template" className="rounded-md border-[0.5px] border-subtle-1 bg-layer-1 px-3 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="ring-accent-primary/15 grid size-8 flex-shrink-0 place-items-center rounded-md bg-accent-primary/10 text-accent-primary ring-1">
            <FileText className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-12 font-medium text-primary">Codex request builder</p>
              <span
                aria-live="polite"
                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-9 font-medium tracking-wide uppercase ${
                  readiness.ok ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                }`}
              >
                <ReadinessIcon className="size-3" aria-hidden="true" />
                {readinessLabel}
              </span>
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-9 font-medium tracking-wide text-secondary uppercase">
                Starts incomplete
              </span>
            </div>
            <p className="mt-0.5 max-w-xl text-11 leading-4 text-secondary">
              {selectedTemplate?.summary ?? "Start without pre-filled request sections."}
            </p>
            {selectedTemplate && (
              <div className="mt-1.5 flex flex-wrap gap-1.5 text-10">
                <span className="rounded bg-surface-2 px-1.5 py-0.5 text-tertiary">{selectedTemplate.workType}</span>
                <span className="rounded bg-surface-2 px-1.5 py-0.5 text-tertiary">{selectedTemplate.surface}</span>
                <span className="rounded bg-surface-2 px-1.5 py-0.5 text-tertiary">{selectedTemplate.riskLevel}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full flex-shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          {selectedTemplate?.sourceUrl && (
            <a
              href={selectedTemplate.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 self-end text-10 font-medium text-accent-primary hover:underline sm:self-auto"
            >
              Source
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          )}
          <CustomSelect
            value={selectedTemplateId ?? ""}
            onChange={(templateId: string) => onSelect(templateId || null)}
            label={<span className="max-w-56 truncate">{selectedTemplate?.name ?? "Blank request"}</span>}
            placement="bottom-end"
            buttonClassName="w-full bg-surface-1 sm:min-w-64"
            optionsClassName="w-[26rem] max-w-[calc(100vw-2rem)]"
            maxHeight="lg"
            tabIndex={tabIndex}
          >
            <CustomSelect.Option value="">
              <div>
                <p className="font-medium text-primary">Blank request</p>
                <p className="text-10 text-secondary">Start with an empty description.</p>
              </div>
            </CustomSelect.Option>
            {templates.map((template) => (
              <CustomSelect.Option key={template.id} value={template.id}>
                <div className="max-w-[22rem] whitespace-normal">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="font-medium text-primary">{template.name}</p>
                    <span className="rounded bg-surface-2 px-1.5 py-0.5 text-9 font-medium text-tertiary">
                      {template.workType}
                    </span>
                  </div>
                  <p className="mt-0.5 text-10 leading-4 text-secondary">{template.summary}</p>
                </div>
              </CustomSelect.Option>
            ))}
          </CustomSelect>
        </div>
      </div>

      {selectedTemplate && (
        <div className="mt-3 grid gap-2 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-md border-[0.5px] border-subtle-1 bg-surface-1/70 p-2.5">
            <div className="flex items-center gap-1.5 text-10 font-medium text-primary">
              <ClipboardCheck className="size-3.5 text-accent-primary" aria-hidden="true" />
              Request spine
            </div>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
              {selectedTemplate.guide.map((item) => (
                <div key={item} className="rounded border-[0.5px] border-subtle-1 bg-layer-1 px-2 py-1.5">
                  <p className="text-10 leading-4 text-secondary">{item}</p>
                </div>
              ))}
            </div>
            {blockers.length > 0 && (
              <p className="mt-2 text-10 leading-4 text-tertiary">
                Next missing: {blockers.slice(0, 3).join(", ")}
                {blockers.length > 3 ? ` +${blockers.length - 3} more` : ""}.
              </p>
            )}
          </div>

          <div className="rounded-md border-[0.5px] border-subtle-1 bg-surface-1/70 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-10 font-medium text-primary">
                <Lightbulb className="text-amber-500 size-3.5" aria-hidden="true" />
                Example shape
              </div>
              <div className="inline-flex items-center gap-1 text-10 text-tertiary">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Helper only
              </div>
            </div>
            <p className="mt-1 text-10 font-medium text-secondary">{selectedTemplate.exampleTitle}</p>
            <p className="mt-0.5 text-10 leading-4 text-tertiary">{selectedTemplate.example}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedTemplate.validationHints.slice(0, 3).map((hint) => (
                <span key={hint} className="rounded bg-layer-1 px-1.5 py-0.5 text-9 font-medium text-tertiary">
                  {hint}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
