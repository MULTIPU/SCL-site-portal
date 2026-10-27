SCL GitHub Pages blank-screen fix

Why the page is blank:
- The repository now contains a Vite + React + TypeScript application.
- The current root index.html points to /src/main.tsx. GitHub Pages is a static host and does not compile TSX on its own.
- The existing Vite config has no GitHub Pages base path, so compiled asset paths would otherwise point at the domain root instead of /SCL-site-portal/.

Files in this package:
1. vite.config.ts — sets Vite's base path to /SCL-site-portal/.
2. .github/workflows/deploy-pages.yml — builds the app with npm ci + npm run build and publishes dist to GitHub Pages on each push to MAIN.

Install:
- Copy vite.config.ts to the repository root, replacing the existing file.
- Copy .github/workflows/deploy-pages.yml to the same path in the repository.
- Commit both files to MAIN.
- In GitHub repository Settings > Pages, set Build and deployment > Source to GitHub Actions.
- Open Actions and confirm “Build and deploy SCL Portal to GitHub Pages” succeeds.
- Then open https://multipu.github.io/SCL-site-portal/ and refresh. If an old app/PWA cache is serving the blank page, clear the site's stored data or uninstall/reinstall the home-screen app after the deployment succeeds.

Important:
- I could inspect the repository, but the connected GitHub integration rejected write/branch creation with HTTP 403 “Resource not accessible by integration”, so these changes were packaged rather than committed directly.
- This is a deployment fix; it does not claim that every feature of the new app has been end-to-end tested.
