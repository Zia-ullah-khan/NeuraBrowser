(function () {
    function replacePersonalInfo(node) {
      const personalInfoPatterns = [
        /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g,
        /\b(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/g,
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
        /\b\d{1,5}\s\w+(?:\s\w+)*,\s\w+(?:\s\w+)*\b/g,
        /\b\d{5}(?:-\d{4})?\b/g,
        /\b(?:\d{4}[- ]?){3}\d{4}\b/g,
        /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
      ];
      
  
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length > 0) {
        let text = node.nodeValue;
        personalInfoPatterns.forEach((pattern) => {
          text = text.replace(pattern, "[REDACTED]");
        });
        node.nodeValue = text;
      }
    }
  
    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        replacePersonalInfo(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.childNodes.forEach(processNode);
      }
    }
  
    processNode(document.body);
  
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            processNode(node);
          });
        } else if (mutation.type === "characterData") {
          replacePersonalInfo(mutation.target);
        }
      });
    });
  
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  
    console.log("Real-time personal info redaction enabled.");
  })();
  