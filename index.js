const token = "token";
const alert = `M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z`;

async function callApi(url) {
  const request = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  return await request.json();
}

async function getPullRequests() {
  const data = await callApi(
    `https://api.github.com/repos${location.href.split("github.com")[1]}`
  );

  return data.map((el) => ({
    url: el.url,
    title: el.title,
  }));
}

async function getStatus() {
  const requests = await getPullRequests();
  const finished = await Promise.all(
    requests.map(async (request) => {
      const data = await callApi(request.url);

      return {
        title: data.title,
        canMerge: data.mergeable,
      };
    })
  );

  return finished;
}

// Github uses some form of SPA so we're going to watch page changes with this
// A URL ending in /pulls is a page for pul requests so we can run this script
let previousUrl = "";
const observer = new MutationObserver(function () {
  if (location.href !== previousUrl) {
    previousUrl = location.href;
    if (location.href.includes("/pulls")) {
      getPullRequests();

      getStatus().then(function (statusArray) {
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
