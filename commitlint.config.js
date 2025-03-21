// This is a configuration file for commitlint, which is a tool that checks if your commit messages meet the conventional commit format.
// It extends the conventional commit configuration and defines custom rules for commit messages.
// The rules defined here include:
// - The type of commit must be one of the specified types (build, chore, ci, docs, feat, fix, perf, refactor, revert, style).
// - The subject of the commit message cannot be empty.
// - The type of commit cannot be empty.

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
      ],
    ],
    "subject-empty": [2, "never"],
    "type-empty": [2, "never"],
  },
}
