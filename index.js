const token = "token";
const alert = `M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z`;

/**
 * Makes a call to the specified github API URL.
 * @param {*} url URL of the route to hit
 * @returns object - data associated with the request
 */
async function callApi(url) {
  const request = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!request.ok) {
    if (request.status === 401) {
      window.alert(
        "You either didn't add your token to the script or it's expired."
      );
      return null;
    } else {
      window.alert("An unknown error occured.");
      return null;
    }
  }

  return await request.json();
}

/**
 * Gets a list of pull requests from the currently viewed repo.
 * @returns object - the URL of the pull request and the title
 */
async function getPullRequests() {
  const data = await callApi(
    `https://api.github.com/repos${location.href.split("github.com")[1]}`
  );

  if (!data) {
    return null;
  }

  return data.map((el) => ({
    url: el.url,
    title: el.title,
  }));
}

/**
 * Gets the mergability status of the currently loaded pull requests
 * @returns object - title of the pull request and the mergability
 */
async function getStatus() {
  const pullRequests = await getPullRequests();
  if (!pullRequests) {
    return null;
  }

  const finished = await Promise.all(
    pullRequests.map(async (request) => {
      const data = await callApi(request.url);

      return {
        title: data.title,
        canMerge: data.mergeable,
      };
    })
  );

  return finished;
}

/**
 * Starts a mutation observer to watch for a pull request page being opened
 */
function watchForPageChanges() {
  // Github uses some form of SPA so we're going to watch page changes with this
  // A URL ending in /pulls is a page for pul requests so we can run this script
  let previousUrl = "";
  const observer = new MutationObserver(function () {
    if (location.href !== previousUrl) {
      previousUrl = location.href;
      if (location.href.includes("/pulls")) {
        getStatus().then(function (statusArray) {
          if (!statusArray) {
            return;
          }
          const elements = Array.from(document.querySelectorAll("a"));
          for (const status of statusArray) {
            if (!status.canMerge) {
              const element = elements
                .find((el) => el.innerText === status.title)
                .parentNode.parentNode.querySelector("svg");
              const color = element.classList[2];
              element.classList.remove(color);
              element.classList.add("color-fg-closed");
              const path = element.querySelector("path");
              path.setAttribute("d", alert);
            }
          }
        });
      }
    }
  });
  const config = { subtree: true, childList: true };
  observer.observe(document, config);
}

watchForPageChanges();
