# SCL Portal V104 - single-file package
Files: index.html (everything: original app + all images + new CSS/JS inline, 5.69 MB), sw.js (must be a separate file), README_DEPLOY.md.
Deploy: back up the current index.html, upload index.html and sw.js to the repo root, commit. No assets folder needed. No Supabase/SQL changes. Change VERSION in sw.js on each deployment.
Changes: five-tab layout (Home, Services, School, Admission, Contact); WhatsApp chooser on the login screen (Parents group link, Staff request by email; never grants access); floating buttons no longer overlap; versioned network-first service worker. Nothing from the original was removed.
Tested (headless browser, layout only): no JS errors, tabs work, chooser works, no overlaps, no sideways scroll, no broken local images.
Not tested: Google/email/passkey sign-in, Supabase data, attendance GPS/period logic, result reminders, notifications, live service-worker updates.
Not done: removal of old stacked layers, attendance period bug, day/night switch, replacing 3 Unsplash stock photos.
