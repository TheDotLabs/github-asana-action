
# Github-Asana action

This action integrates asana with github.

### Prerequisites

- Asana account with the permission on the particular project you want to integrate with.
- Must provide the task url in the PR description.

## Inputs

### `asana-pat`

**Required** Your personal access token of asana, you can find it in [asana docs](https://developers.asana.com/docs/#authentication-basics).

### `targets`

**Optional** JSON array of objects having project and section where to move current task. Move task only if it exists in target project. e.g 
```yaml
targets: '[{"project": "Backlog", "section": "Development Done"}, {"project": "Current Sprint", "section": "In Review"}]'
```
if you don't want to move task omit `targets`.

## Sample Commit

[Fix] Add xyz to pqr

Asana Task: https://app.asana.com/0/---/---

## Sample PR Description

``
**Asana Task:** [Task Name](https://app.asana.com/0/1/2)
``

## Examples

#### Without special characters:

```yaml
uses: insurify/github-asana-action@v1.0.1
with:
  asana-pat: 'Your PAT'
  targets: '[{"project": "New MT Flutter App", "section": "Development Done"}, {"project": "Current Sprint", "section": "In Review"}]'
```