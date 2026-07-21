/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * Modified by Pilo Development on 2026-07-20 to provide the AGPL fork source.
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useTheme } from "next-themes";
// plane imports
// assets
import githubBlackImage from "@/app/assets/logos/github-black.png?url";
import githubWhiteImage from "@/app/assets/logos/github-white.png?url";
import { PILO_FORK_SOURCE_URL } from "@/plane-web/constants/pilo-fork.mjs";

export function StarUsOnGitHubLink() {
  // hooks
  const { resolvedTheme } = useTheme();
  const imageSrc = resolvedTheme === "dark" ? githubWhiteImage : githubBlackImage;

  return (
    <a
      aria-label="View Pilo fork source under AGPL-3.0"
      className="flex flex-shrink-0 items-center gap-1.5 rounded-sm bg-layer-2 px-3 py-1.5"
      href={PILO_FORK_SOURCE_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src={imageSrc} className="h-4 w-4 object-contain" alt="GitHub Logo" aria-hidden="true" />
      <span className="text-10 font-medium md:text-11">
        <span className="md:hidden">AGPL</span>
        <span className="hidden md:inline">Fork source (AGPL)</span>
      </span>
    </a>
  );
}
