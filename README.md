
# Github Asana Action 
![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/apgapg/github-asana-action) ![GitHub](https://img.shields.io/github/license/apgapg/github-asana-action) ![GitHub Repo stars](https://img.shields.io/github/stars/apgapg/github-asana-action?style=social)

<img src="https://user-images.githubusercontent.com/13887407/112085815-2e77af80-8bb1-11eb-9100-973cd024f9d5.png"  height = "100" alt="Asana">

This action integrates asana with github for task movement and auto comment.

### Prerequisites

- Asana account with the permission on the particular project you want to integrate with, as this action needs your personal access token.

## Inputs

### `asana-token` (Required)

**Required** Your personal access token of asana, you can find it in [asana docs](https://developers.asana.com/docs/#authentication-basics).

### `targets` (Optional)

**Optional** JSON array of objects having project and section where to move current task. Move task only if it exists in target project. e.g 
```yaml
targets_commit_push: '[{"project": "Backlog", "section": "Development Done"}, {"project": "Current Sprint", "section": "In Review"'

# OR

targets_pr_raise: '[{"project": "Backlog", "section": "Development Done"}, {"project": "Current Sprint", "section": "In Review"}]'

# OR

targets_pr_merge: '[{"project": "Backlog", "section": "Development Done"}, {"project": "Current Sprint", "section": "In Review"}]'
```

## Sample Commit

```
[Fix] Add xyz to pqr

Asana Task: https://app.asana.com/0/---/---
```

## Sample PR Description

```
**Asana Task:** [Task Name](https://app.asana.com/0/1/2)
```

## Examples

### Without special characters:

```yaml
uses: apgapg/github-asana-action@--latest--
with:
  asana-token: 'Your PAT'
  targets: '[{"project": "New MT Flutter App", "section": "Development Done"}, {"project": "Current Sprint", "section": "In Review"}]'
```
