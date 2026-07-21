/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * Copyright (c) 2026 Pilo Development
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { FileText } from "lucide-react";
// plane imports
import { CustomSelect } from "@plane/ui";
// local imports
import { getLocalIntakeTemplate, getLocalIntakeTemplates } from "./registry";

type TLocalIntakeTemplateSelectorProps = {
  projectId: string;
  selectedTemplateId: string | null;
  onSelect: (templateId: string | null) => void;
  tabIndex?: number;
};

export function LocalIntakeTemplateSelector(props: TLocalIntakeTemplateSelectorProps) {
  const { projectId, selectedTemplateId, onSelect, tabIndex } = props;
  const templates = getLocalIntakeTemplates(projectId);
  const selectedTemplate = getLocalIntakeTemplate(projectId, selectedTemplateId);

  if (templates.length === 0) return null;

  return (
    <section aria-label="Request template" className="rounded-md border-[0.5px] border-subtle-1 bg-layer-1 px-3 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="grid size-8 flex-shrink-0 place-items-center rounded-md bg-accent-primary/10 text-accent-primary">
            <FileText className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-12 font-medium text-primary">Request template</p>
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-9 font-medium tracking-wide text-secondary uppercase">
                Description only
              </span>
            </div>
            <p className="mt-0.5 max-w-xl text-11 leading-4 text-secondary">
              {selectedTemplate?.summary ?? "Start without pre-filled request sections."}
            </p>
            {selectedTemplate && (
              <p className="mt-1 text-10 leading-4 text-tertiary">
                Replace every TBD before review. A reviewer applies codex-ready after the request is complete.
              </p>
            )}
          </div>
        </div>

        <div className="flex w-full flex-shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          {selectedTemplate?.sourceUrl && (
            <a
              href={selectedTemplate.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="self-end text-10 font-medium text-accent-primary hover:underline sm:self-auto"
            >
              Source (AGPL-3.0)
            </a>
          )}
          <CustomSelect
            value={selectedTemplateId ?? ""}
            onChange={(templateId: string) => onSelect(templateId || null)}
            label={<span className="max-w-56 truncate">{selectedTemplate?.name ?? "Blank request"}</span>}
            placement="bottom-end"
            buttonClassName="w-full bg-surface-1 sm:min-w-52"
            optionsClassName="w-72 max-w-[calc(100vw-2rem)]"
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
                <div className="max-w-64 whitespace-normal">
                  <p className="font-medium text-primary">{template.name}</p>
                  <p className="mt-0.5 text-10 leading-4 text-secondary">{template.summary}</p>
                </div>
              </CustomSelect.Option>
            ))}
          </CustomSelect>
        </div>
      </div>
    </section>
  );
}
