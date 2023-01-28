module.exports = async function (input) {
    if(await extractorContext.execute(async function() {
        return !!document.querySelector('button[data-text="Accept Cookies"]');
    })) {
        await extractorContext.click('button[data-text="Accept Cookies"]');
    }

    await extractorContext.waitForElement('section[class*="profile-header"]');
    await extractorContext.waitForElement('main#main-content');

    let extractedData = await extractorContext.execute(async function() {
      let playerData = [];
      let playerDetails = {};
      
      let ranking = document.evaluate('//div[contains(text(), "ank")]/following-sibling::div[@data-single]', document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue;
      let rankingYear = document.evaluate('//div[contains(text(), "ank")]/following-sibling::div[contains(@class, "context")]', document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue;
      let yob = document.querySelector('div[data-dob]');
      let height = document.querySelector('div[class*="height"] div[class*="small"]');
      let country = document.querySelector('div[class*="nationality"][class*="profile"] img[alt]');
      let rankingsHistoryUrl = window.location.href + '#rankingshistory';

      let yearCountSelector = document.querySelectorAll('nav[class*="rankings-year"] *[class*="option"]');
      let yearCount = yearCountSelector.length ? yearCountSelector.length : 1;
      let turnedProYear = yearCountSelector.length ? document.evaluate(`(//tr[@data-year="${yearCountSelector[yearCount - 1].getAttribute('data-year')}"]/@data-year)[1]`, document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue : '';

      playerDetails.detailsUrl = window.location.href;
      playerDetails.name = input.name ? input.name : '';
      playerDetails.ranking = ranking ? ranking.textContent.trim() : '';
      playerDetails.rankingYear = rankingYear ? rankingYear.textContent.trim().replace(/.*(\d{4}).*/, '$1') : '';
      playerDetails.yob = yob ? yob.getAttribute('data-dob').trim().replace(/.*(\d{4}).*/, '$1') : '';
      playerDetails.height = height ? parseFloat(height.textContent.trim()) * 100 : '';
      playerDetails.country = country ? country.getAttribute('alt').trim() : '';
      playerDetails.turnedProYear = turnedProYear ? turnedProYear.value : '';
      playerDetails.rankingsHistoryUrl = rankingsHistoryUrl ? rankingsHistoryUrl : '';
      
      playerData.push(playerDetails);

      return playerData;
    });
    
    console.log(extractedData);
    return extractorContext.return(extractorContext.createData(extractedData));
}
