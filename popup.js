document.getElementById('summarizeButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'summarizePage' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError.message);
          return;
        }
        if (response?.text) {
          console.log('Summarized text:', response.text);
        } else {
          console.error('No response received or text missing.');
        }
      });
    }
  });
});


document.getElementById('translateButton').addEventListener('click', () => {
  const languageMenu = document.getElementById('languageMenu');
  languageMenu.style.display = 'block';
});

document.getElementById('confirmLanguageButton').addEventListener('click', () => {
  const selectedLanguage = document.getElementById('languageSelect').value;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'translatePage', language: selectedLanguage },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError.message);
          return;
        }
        console.log('Translation response:', response);
      }
    );
  });
});

document.getElementById('privacyToggleButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'togglePrivacy' });
  });
});
