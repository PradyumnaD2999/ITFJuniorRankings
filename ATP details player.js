module.exports = async function (input) {
    await extractorContext.waitForElement('div#mainContent');

    let playerDetails = await extractorContext.execute(async function() {
      let playerDetails = {};
      
      let ranking = document.evaluate('//div[contains(text(), "ank")]/../div[@data-singles]', document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue;
      let rankingYear = document.querySelector('td.overview-year');
      let yob = document.querySelector('span.table-birthday');
      let height = document.querySelector('span[class*="height-cm"]');
      let country = document.querySelector('div[class*="flag-code"]');
      let turnedProYear = document.evaluate('//div[contains(text(), "urned Pro") or contains(text(), "urned pro")]/following-sibling::div', document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue;
      let rankingsHistoryUrl = document.querySelector('a[ga-label*="ankings History"], a[ga-label*="ankings history"]');
      
      playerDetails.detailsUrl = window.location.href;
      playerDetails.name = input.name ? input.name : '';
      playerDetails.ranking = ranking ? ranking.textContent.trim() : '';
      playerDetails.rankingYear = rankingYear ? rankingYear.textContent.trim() : '';
      playerDetails.yob = yob ? yob.textContent.trim().replace(/\((.*)\.(.*)\.(.*)/, '$1') : '';
      playerDetails.height = height ? height.textContent.trim().replace(/\((\d+).*/, '$1') : '';
      playerDetails.country = country ? country.textContent.trim() : (document.evaluate('//td//div[contains(text(), "ussia")]', document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue ? 'RUS' : '');
      playerDetails.turnedProYear = turnedProYear ? turnedProYear.textContent.trim() : '';
      playerDetails.rankingsHistoryUrl = rankingsHistoryUrl ? rankingsHistoryUrl.href : '';

      return playerDetails;
    });

    await extractorContext.click('a[ga-label="Rankings Breakdown"]');
    await extractorContext.waitForElement('div#playerRankBreakdown');

    let extractedData = await extractorContext.execute(async function(playerDetails) {
      let playerData = [];

      let playerPoints = document.evaluate(`(//table//th[contains(text(), "oints")]/../../following-sibling::tbody//td)[2]`, document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue;
      playerDetails.points = playerPoints ? playerPoints.textContent.trim().replace(/\,/g, "") : '';

      playerData.push(playerDetails);

      return playerData;
    }, playerDetails);
    
    console.log(extractedData);
    return extractorContext.return(extractorContext.createData(extractedData));
}
