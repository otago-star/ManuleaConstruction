# Manulea Construction Website

Official website source for **Manulea Construction**.

This project is a static multi-page website focused on:

- Before/after renovation galleries
- Project image galleries with progressive loading
- Clear contact options for renovation and repair inquiries
- Separate informational pages for About, Services, and Process

## Pages

- `index.html` - Home page with before/after galleries, project gallery, reviews, and contact form
- `about.html` - Business background and contact details
- `services.html` - Service offerings
- `process.html` - Client process overview

## Project Structure

- `styles.css` - Main site styling and responsive layout
- `script.js` - Form mailto behavior and gallery load interactions
- `images/logo/` - Logo assets
- `images/border/` - Side border graphics
- `images/projects/` - Project gallery images by folder (`project1`, `project2`, etc.)

## Gallery Behavior

On the home page:

1. Before/After Galleries 1-3 are shown immediately.
2. Project galleries are hidden by default.
3. Clicking **Load Gallery Images** reveals Project 1 first.
4. Each next click reveals the next project gallery.

## Contact

- Email: `manuleacon@gmail.com`
- Address: `104 Glen Road, The Glen, Dunedin 9011`

## Local Preview

This project is configured to run locally over HTTPS using Vite.

1. Install dependencies:
	- `npm install`
2. Start the HTTPS dev server:
	- `npm run dev`
3. Open:
	- `https://localhost:5173/`

Vite uses `@vitejs/plugin-basic-ssl` to generate a local development certificate automatically.

## GitHub Pages HTTPS Check

To verify your custom domain DNS is ready for the GitHub Pages **Enforce HTTPS** checkbox:

1. Open PowerShell in the project root.
2. Run:
	- `powershell.exe -ExecutionPolicy Bypass -File .\scripts\check-github-pages-dns.ps1`

Optional parameters:

- `-Domain "manuleaconstruction.co.nz"`
- `-ExpectedWwwCname "otago-star.github.io"`

The script checks:

- Apex A records
- Apex AAAA records
- `www` CNAME target
- Root `CNAME` file value

### Wait Until HTTPS Is Ready

If GitHub has not issued the certificate yet, run the watcher:

- `powershell.exe -ExecutionPolicy Bypass -File .\scripts\wait-for-https-ready.ps1`

Optional parameters:

- `-IntervalSeconds 180`
- `-MaxChecks 120`

The watcher repeats the DNS and certificate check until it passes or times out.

## Google Ranking Check Script

Use this script to check your Google ranking position for a target keyword.

1. Create a SerpApi key: `https://serpapi.com/`
2. Set your API key in PowerShell:
	- `$env:SERPAPI_API_KEY = "your_api_key_here"`
3. Run the script:
	- `powershell.exe -ExecutionPolicy Bypass -File .\scripts\check-google-rank.ps1 -Keyword "renovations dunedin" -Domain "manuleaconstruction.co.nz"`

Optional parameters:

- `-Gl "nz"` (country code)
- `-Hl "en"` (language code)
- `-MaxResults 100` (search depth)
