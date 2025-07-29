module.exports = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          { type: "feat", release: "minor" },
          { type: "fix", release: "patch" },
          { type: "perf", release: "patch" },
          { type: "revert", release: "patch" },
          { type: "docs", release: "patch" },
          { type: "style", release: "patch" },
          { type: "refactor", release: "patch" },
          { type: "test", release: "patch" },
          { type: "build", release: "patch" },
          { type: "ci", release: "patch" },
          { type: "chore", release: false },
          { scope: "no-release", release: false },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            { type: "feat", section: "🚀 Features" },
            { type: "fix", section: "🐛 Bug Fixes" },
            { type: "perf", section: "⚡ Performance Improvements" },
            { type: "revert", section: "⏪ Reverts" },
            { type: "docs", section: "📚 Documentation" },
            { type: "style", section: "💎 Styles" },
            { type: "refactor", section: "📦 Code Refactoring" },
            { type: "test", section: "🚨 Tests" },
            { type: "build", section: "🛠 Build System" },
            { type: "ci", section: "⚙️ CI/CD" },
          ],
        },
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    [
      "@semantic-release/npm",
      {
        npmPublish: true, // Publish as CLI tool
        access: "public", // Required for scoped packages
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: [
          {
            path: "release/*.dmg",
            label: "macOS DMG (${nextRelease.gitTag})",
          },
          {
            path: "release/*.exe",
            label: "Windows Installer (${nextRelease.gitTag})",
          },
          {
            path: "release/*.AppImage",
            label: "Linux AppImage (${nextRelease.gitTag})",
          },
        ],
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],
};