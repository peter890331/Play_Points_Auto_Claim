let attempts = 0;
let step = 1;
let isSuccessfullyClaimed = false;

const intervalId = setInterval(() => {
  attempts++;
  
  if (step === 1) {
    const rewardCard = document.querySelector('div[jscontroller="KRZHBd"]');
    let clicked = false;
    
    if (rewardCard) {
      const btn = rewardCard.querySelector('button');
      const span = rewardCard.querySelector('span[jsname="V67aGc"]');
      
      if (btn) {
        btn.removeAttribute('inert');
        if (span) span.click();
        btn.click();
        clicked = true;
        step = 2;
        attempts = 0;
      }
    }
    
    if (!clicked && attempts >= 15) {
      step = 3;
      attempts = 0;
    }
  } else if (step === 2) {
    const chestBtn = document.querySelector('button[jslog*="TE9ZQUxUWV9SRVdBUkRf"]');
    let chestClicked = false;
    
    if (chestBtn) {
      chestBtn.click();
      chestClicked = true;
      isSuccessfullyClaimed = true;
      step = 3;
      attempts = 0;
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