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
