const isChinese = navigator.language.startsWith('zh');
const i18n = {
  title: isChinese ? '自動領取 Play Points!' : 'Auto Claim Play Points! ',
  countLabel: isChinese ? '已經自動領取次數：' : 'Already Auto Claim Count:',
  countUnit: isChinese ? '次' : 'times',
  dateLabel: isChinese ? '下次自動領取日期：' : 'Next Auto Claim Date:',
  loading: isChinese ? '檢查中...' : 'Checking...',
  btnText: isChinese ? '立即檢查與領取' : 'Check & Claim Now',
  noData: isChinese ? '尚未取得資料' : 'No data available'
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('titleText').innerText = i18n.title;
  document.getElementById('countLabel').innerText = i18n.countLabel;
  document.getElementById('countUnit').innerText = i18n.countUnit;
  document.getElementById('dateLabel').innerText = i18n.dateLabel;
  document.getElementById('checkBtn').innerText = i18n.btnText;
  document.getElementById('date').innerText = i18n.loading;

  chrome.storage.local.get(['claimCount', 'nextClaimDate', 'dateString'], (result) => {
    const countEl = document.getElementById('count');
    const dateEl = document.getElementById('date');

    if (result.claimCount !== undefined) {
      countEl.innerText = result.claimCount;
    }

    if (result.dateString && result.dateString !== '尚未取得資料' && result.dateString !== 'No data available') {
      dateEl.innerText = result.dateString;
    } else if (result.nextClaimDate) {
      const d = new Date(result.nextClaimDate);
      dateEl.innerText = d.toLocaleDateString();
    } else {
      dateEl.innerText = i18n.noData;
    }
  });

  document.getElementById('checkBtn').addEventListener('click', () => {
    chrome.storage.local.set({ autoRunFlag: Date.now() }, () => {
      chrome.tabs.create({ url: "https://play.google.com/store/points/perks", active: true });
    });
  });
});