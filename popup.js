document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['claimCount', 'nextClaimDate', 'dateString'], (result) => {
    const countEl = document.getElementById('count');
    const dateEl = document.getElementById('date');

    if (result.claimCount !== undefined) {
      countEl.innerText = result.claimCount;
    }

    if (result.dateString && result.dateString !== '尚未取得資料') {
      dateEl.innerText = result.dateString;
    } else if (result.nextClaimDate) {
      const d = new Date(result.nextClaimDate);
      dateEl.innerText = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
    } else {
      dateEl.innerText = '尚未取得資料';
    }
  });

  document.getElementById('checkBtn').addEventListener('click', () => {
    chrome.storage.local.set({ autoRunFlag: Date.now() }, () => {
      chrome.tabs.create({ url: "https://play.google.com/store/points/perks", active: true });
    });
  });
});