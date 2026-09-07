# Privacy Policy — Vector Database Explorer Companion

**Effective date:** 2026-09-07

Vector Database Explorer Companion is a Gap Hunter Labs extension for
Visual Studio Code. Unlike every other extension in this workstream,
this one **does** make network calls — that's the whole point of an
"explorer": it has nothing to show without talking to a database.
Here's exactly what that means.

## What this extension collects

**Nothing.** This extension does not collect, store, transmit, or
sell any data to Gap Hunter Labs or any third party — no telemetry,
no analytics, no crash reports.

## Network access

This extension sends HTTP requests **only to the Qdrant instance URL
you configure yourself** (`vectorDbExplorerCompanion.qdrantUrl`) —
your own local instance, your own self-hosted server, or your own
Qdrant Cloud account. It never contacts any Gap Hunter Labs server or
any third party. If you don't configure a URL, the extension makes no
network requests at all.

## Your API key

If you set a Qdrant API key (`Vector Database Explorer Companion: Set
Qdrant API Key`), it's stored using VS Code's own built-in
[Secret Storage](https://code.visualstudio.com/api/references/vscode-api#SecretStorage)
API — the same OS-level secure storage VS Code itself and other
extensions use for credentials — never in a plain settings file, and
never sent anywhere except as an `api-key` header on requests to the
Qdrant URL you configured.

## Third parties

None beyond the Qdrant instance you explicitly point this extension
at.

## Changes to this policy

If this ever changes, this file will be updated and the change will
be noted in the extension's `CHANGELOG.md`.

## Contact

Questions about this policy: **gaphunterlabs@gmail.com**
