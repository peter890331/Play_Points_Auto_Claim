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
    clearInterval(intervalId);
    const isChinese = navigator.language.startsWith('zh');
    const noDataText = isChinese ? '尚未取得資料' : 'No data available';
    
    chrome.storage.local.get(['claimCount', 'nextClaimDate', 'dateString', 'autoRunFlag'], (result) => {
      let count = result.claimCount || 0;
      let nextDate = result.nextClaimDate || 0;
      let finalStr = result.dateString || noDataText;
      let shouldAutoClose = false;
      
      if (result.autoRunFlag && (Date.now() - result.autoRunFlag < 15000)) {
        shouldAutoClose = true;
        chrome.storage.local.remove('autoRunFlag');
      }
      
      const now = new Date();
      const currentDay = now.getDay();
      let daysUntilFriday = (5 - currentDay + 7) % 7;
      if (daysUntilFriday === 0) {
        daysUntilFriday = 7;
      }
      
      const nextFridayTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilFriday).getTime();
      const nextFridayString = new Date(nextFridayTime).toLocaleDateString();

      if (isSuccessfullyClaimed) {
        count += 1;
        nextDate = nextFridayTime;
        finalStr = nextFridayString;
      } else {
        if (nextDate === 0) {
          nextDate = nextFridayTime;
          finalStr = nextFridayString;
        } else if (Date.now() >= nextDate) {
          nextDate = Date.now() + 6 * 60 * 60 * 1000;
        }
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
}, 200);