const { GoogleGenerativeAI } = require("@google/generative-ai");

const client = new GoogleGenerativeAI("AIzaSyCvM3WYZdi7fv841mMa3D6C907lSpZ9r00");

(async function () {
  document.addEventListener("mouseup", function () {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
      console.log("Selected text:", selectedText);
    }
  });

  chrome.storage.sync.get(["backgroundColor"], function (result) {
    if (result.backgroundColor) {
      document.body.style.backgroundColor = result.backgroundColor;
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "translatePage" && message.language) {
      translatePageContent(message.language)
        .then(() => sendResponse({ status: "Translation complete" }))
        .catch((err) =>
          sendResponse({ status: "Translation failed", error: err.message })
        );
      return true;
    } else if (message.action === "summarizePage") {
      summarizePageContent()
        .then(() => sendResponse({ status: "Summarization complete" }))
        .catch((err) =>
          sendResponse({ status: "Summarization failed", error: err.message })
        );
      return true;
    }
  });

  async function translatePageContent(targetLanguage) {
    const model = client.getGenerativeModel({ model: "gemini-1.5-pro" });

    const elements = document.body.querySelectorAll(
      "*:not(script):not(style):not(meta):not(link)"
    );
    const textNodes = [];
    elements.forEach((element) => {
      if (element.childNodes && element.childNodes.length > 0) {
        element.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length > 0) {
            textNodes.push(node);
          }
        });
      }
    });

    const originalText = textNodes.map((node) => node.nodeValue.trim()).join("|||");
    if (!originalText) return;

    const loadingElement = document.createElement("div");
    loadingElement.id = "loading-spinner";
    loadingElement.style.position = "fixed";
    loadingElement.style.top = "50%";
    loadingElement.style.left = "50%";
    loadingElement.style.transform = "translate(-50%, -50%)";
    loadingElement.style.padding = "10px 20px";
    loadingElement.style.borderRadius = "5px";
    loadingElement.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    loadingElement.style.color = "white";
    loadingElement.style.fontSize = "16px";
    loadingElement.innerText = "Translating... Please wait.";
    document.body.appendChild(loadingElement);

    const maxRetries = 5;
    let retryCount = 0;
    let backoffDelay = 1000;

    try {
      while (retryCount < maxRetries) {
        try {
          const response = await model.generateContent(
            `Translate this text to ${targetLanguage}: ${originalText} just give the translatation not any other notes or text`
          );
          if (!response || !response.response) throw new Error("Empty response from API.");
          const translatedText = response.response.text();
          const translatedSegments = translatedText.split("|||");
          if (translatedSegments.length !== textNodes.length) {
            throw new Error("Segment mismatch.");
          }
          textNodes.forEach((node, index) => {
            node.nodeValue = translatedSegments[index] || node.nodeValue;
          });
          break;
        } catch (error) {
          if (error.message.includes("503")) {
            retryCount++;
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
            backoffDelay *= 2;
          } else {
            throw error;
          }
        }
      }
    } finally {
      const spinner = document.getElementById("loading-spinner");
      if (spinner) spinner.remove();
    }
  }

  async function summarizePageContent() {
    const model = client.getGenerativeModel({ model: "gemini-1.5-pro" });

    const elements = document.body.querySelectorAll(
      "*:not(script):not(style):not(meta):not(link)"
    );
    let pageText = "";
    elements.forEach((element) => {
      if (element.childNodes && element.childNodes.length > 0) {
        element.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length > 0) {
            pageText += node.nodeValue.trim() + " ";
          }
        });
      }
    });

    if (!pageText) return;

    const loadingElement = document.createElement("div");
    loadingElement.id = "loading-spinner";
    loadingElement.style.position = "fixed";
    loadingElement.style.top = "50%";
    loadingElement.style.left = "50%";
    loadingElement.style.transform = "translate(-50%, -50%)";
    loadingElement.style.padding = "10px 20px";
    loadingElement.style.borderRadius = "5px";
    loadingElement.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    loadingElement.style.color = "white";
    loadingElement.style.fontSize = "16px";
    loadingElement.innerText = "Summarizing... Please wait.";
    document.body.appendChild(loadingElement);

    try {
      const response = await model.generateContent(
        `Summarize the following text:\n\n${pageText}`
      );
      if (!response || !response.response) throw new Error("Empty response from API.");
      const summary = response.response.text();

      const summaryElement = document.createElement("div");
      summaryElement.style.position = "fixed";
      summaryElement.style.top = "10%";
      summaryElement.style.left = "10%";
      summaryElement.style.width = "80%";
      summaryElement.style.padding = "20px";
      summaryElement.style.borderRadius = "10px";
      summaryElement.style.backgroundColor = "#fff";
      summaryElement.style.color = "#000";
      summaryElement.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
      summaryElement.style.zIndex = "10000";
      summaryElement.innerText = summary;

      const closeButton = document.createElement("button");
      closeButton.innerText = "Close";
      closeButton.style.marginTop = "20px";
      closeButton.style.padding = "10px";
      closeButton.style.border = "none";
      closeButton.style.borderRadius = "5px";
      closeButton.style.backgroundColor = "#007bff";
      closeButton.style.color = "white";
      closeButton.style.cursor = "pointer";

      closeButton.addEventListener("click", () => summaryElement.remove());
      summaryElement.appendChild(closeButton);

      document.body.appendChild(summaryElement);
    } finally {
      const spinner = document.getElementById("loading-spinner");
      if (spinner) spinner.remove();
    }
  }
})();
