# Vue3 Gantt Demo

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy with GitHub Pages (recommended)

This project includes `.github/workflows/deploy-pages.yml` and auto deploys on every push to `main`.

1. Create a **public** GitHub repository and push this project.
2. In GitHub repository settings:
   - Open `Settings -> Pages`
   - Set `Build and deployment -> Source` to `GitHub Actions`
3. Push to `main`, wait for workflow `Deploy Vue App to GitHub Pages` to pass.
4. Your page URL will be:

```text
https://<your-github-username>.github.io/<your-repo-name>/
```
