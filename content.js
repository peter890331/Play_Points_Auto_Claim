let attempts = 0;
let step = 1;
let isSuccessfullyClaimed = false;

const intervalId = setInterval(() => {
  attempts++;
  
  if (step === 1) {
    const elements = document.querySelectorAll('span, div');
    let clicked = false;
    for (let el of elements) {
      if (el.textContent.trim() === '領取') {
        const btn = el.closest('button, [role="button"]');
        if (btn) {
          btn.removeAttribute('inert');
          el.click();
          btn.click();
          clicked = true;
          step = 2;
          attempts = 0;
          break;
        }
      }
    }
    if (!clicked && attempts >= 15) {
      step = 3;
      attempts = 0;
    }
  } else if (step === 2) {
    const elements = document.querySelectorAll('div');
    let chestClicked = false;
    for (let el of elements) {
      if (el.textContent.trim() === '按一下即可查看獎勵內容！') {
        el.click();
        chestClicked = true;
        isSuccessfullyClaimed = true;
        step = 3;
        attempts = 0;
        break;
      }
    }
    if (!chestClicked && attempts >= 15) {
      step = 3;
      attempts = 0;
    }
  } else if (step === 3) {
    const dateEl = document.querySelector('.WNhI5e');
    let targetDate = 0;
    let dateFound = false;
    
    if (dateEl) {
      const match = dateEl.textContent.match(/(\d+)月(\d+)日/);
      if (match) {
        const currentYear = new Date().getFullYear();
        targetDate = new Date(currentYear, parseInt(match[1]) - 1, parseInt(match[2])).getTime();
        dateFound = true;
      }
    }

    if (dateFound || attempts >= 10) {
      clearInterval(intervalId);
      
      chrome.storage.local.get(['claimCount', 'nextClaimDate'], (result) => {
        let count = result.claimCount || 0;
        let nextDate = result.nextClaimDate || 0;
        
        if (isSuccessfullyClaimed) {
          count += 1;
        }
        
        if (dateFound && targetDate !== 0) {
          nextDate = targetDate;
        }
        
        chrome.storage.local.set({ nextClaimDate: nextDate, claimCount: count }, () => {
          setTimeout(() => {
            chrome.runtime.sendMessage({ action: 'closeTab' });
          }, 500);
        });
      });
    }
  }
}, 200);