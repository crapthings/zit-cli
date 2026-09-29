# Changelog

All notable changes to this project are documented in this file.

## [0.1.1] - 2026-09-29

### Changed

- Updated the `wavespeed` SDK from `0.2.3` to `0.3.2`.
- Added an automated release command that selects the next npm version, runs the test suite, and publishes the package.
- Fixed the npm binary path so global installs continue to expose the `zit` command.

### Verified

- Confirmed text-to-image generation, API polling, and PNG download against the live WaveSpeed API.

## [0.1.0] - 2026-04-30

### Added

- Initial `zit` CLI with text-to-image and image-guided generation.
- Common aspect ratios, custom sizes, output downloads, JSON output, and a bundled Codex skill.
