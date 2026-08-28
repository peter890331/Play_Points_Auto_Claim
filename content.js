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
    let displayString = '';
    
    if (dateEl) {
      const match = dateEl.textContent.match(/(\d+)月(\d+)日/);
      if (match) {
        const currentYear = new Date().getFullYear();
        targetDate = new Date(currentYear, parseInt(match[1]) - 1, parseInt(match[2])).getTime();
        dateFound = true;
        displayString = match[1] + '月' + match[2] + '日';
      }
    }

    if (dateFound || attempts >= 10) {
      clearInterval(intervalId);
      
      chrome.storage.local.get(['claimCount', 'nextClaimDate', 'dateString', 'autoRunFlag'], (result) => {
        let count = result.claimCount || 0;
        let nextDate = result.nextClaimDate || 0;
        let finalStr = dateFound ? displayString : (result.dateString || '尚未取得資料');
        let shouldAutoClose = false;
        
        if (result.autoRunFlag && (Date.now() - result.autoRunFlag < 15000)) {
          shouldAutoClose = true;
          chrome.storage.local.remove('autoRunFlag');
        }
        
        if (isSuccessfullyClaimed) {
          count += 1;
        }
        
        if (dateFound && targetDate !== 0) {
          nextDate = targetDate;
        }
        
        chrome.storage.local.set({ 
          nextClaimDate: nextDate, 
          claimCount: count,
          dateString: finalStr
        }, () => {
          if (shouldAutoClose) {
            setTimeout(() => {
              chrome.runtime.sendMessage({ action: 'closeTab' });
            }, 500);
          }
        });
      });
    }
  }
}, 200);