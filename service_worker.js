chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "search.html" });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractClass") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      const activeTabUrl = activeTab.url;

      // Ensure we are on the correct URL
      if (
        activeTabUrl &&
        activeTabUrl.startsWith("https://www.youtube.com/feed/playlists")
      ) {
        const activeTabId = activeTab.id;

        // Inject script to extract content from the <head> tag
        chrome.scripting.executeScript(
          {
            target: { tabId: activeTabId },
            func: extractClass,
          },
          (results) => {
            if (results && results[0] && results[0].result) {
              sendResponse({ content: results[0].result });
            } else {
              sendResponse({ error: "Element not found" });
            }
          }
        );
      } else {
        sendResponse({
          error:
            "Not on the correct YouTube page, please go to your playlist (https://www.youtube.com/feed/playlists)",
        });
      }
    });
    return true; // Keep the message channel open for async response
  }
});

// Function to extract the class from the <yt-guide-manager> element
function extractClass() {
  const elements = document.querySelectorAll(
    "h3.yt-lockup-metadata-view-model-wiz__heading-reset"
  );
  if (elements.length === 0) return "Element not found";

  const result = Array.from(elements).map((element) => {
    const title = element.textContent;
    const anchor = element.closest("a");
    if (!anchor) {
      const parentAnchor = element
        .closest(".yt-lockup-view-model-wiz")
        .querySelector("a");
      return { title, url: parentAnchor ? parentAnchor.href : null };
    }
    return { title, url: anchor.href };
  });

  return JSON.stringify(result, null, 2);
}
