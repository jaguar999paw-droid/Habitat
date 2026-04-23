# Habitat Assets

This directory holds static assets referenced in the README and project pages.

## habitat-ui.png

This is the UI screenshot shown at the top of the README.

**To add your screenshot:**

1. Take a screenshot of the running Habitat UI at http://localhost:3000
   - Best captured at the CockpitHub screen (the main identity input interface)
   - Ideal resolution: 1280×720 or wider
   - Dark theme renders best — the green/magenta palette photographs well

2. Save it as `habitat-ui.png` inside this `assets/` folder

3. Commit and push:
   ```bash
   git add assets/habitat-ui.png
   git commit -m "assets: add UI screenshot for README"
   git push origin main
   ```

The README already references it at:
```
https://raw.githubusercontent.com/jaguar999paw-droid/Habitat/main/assets/habitat-ui.png
```

So once you push the image, the README header will render it automatically on GitHub.

## Repo Social Preview (Shared Link Image)

This is the image shown when the repo URL is shared on Twitter, WhatsApp, Slack etc.

To set it:
1. Go to https://github.com/jaguar999paw-droid/Habitat
2. Click **Settings** (top right of the repo)
3. Scroll to **Social preview** section
4. Click **Edit** → Upload your screenshot → **Save**

Recommended: use the same `habitat-ui.png` screenshot, or a cropped/branded version of it.
