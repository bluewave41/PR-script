
# PR Script

This script shows PR's in need of a rebase visually on the PR page instead of inside the PR.

# Requirements

- Chrome: https://www.tampermonkey.net/
- Firefox: https://addons.mozilla.org/en-CA/firefox/addon/tampermonkey/

# Installation

1. Generate a new personal access token at https://github.com/settings/tokens and keep it saved somewhere safe
2. Clone this repo
3. Install the dependencies with `yarn install`
4. Open `index.js` and replace `token` with the token you generated
5. Build the project with `yarn browserify index.js -o out.js
6. Open the Tampermonkey plugin
7. Create a new script
8. Paste this in as the header

```// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://github.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @run-at document-start
// ==/UserScript==
```

9. Open `out.js` and copy paste the contents below the header inside the function block
10. Open any repo PR page and you should see the icons update as the requests finish
