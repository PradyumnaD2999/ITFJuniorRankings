module.exports = async function (input) {
    if(await extractorContext.execute(async function() {
        return !!document.querySelector('button[data-text="Accept Cookies"]');
    })) {
        await extractorContext.click('button[data-text="Accept Cookies"]');
    }

    await extractorContext.waitForElement('section[class*="ranking-history"]');

    let extractedData = await extractorContext.execute(async function() {
      let playerData = [];
    
      let yearCountSelector = document.querySelectorAll('nav[class*="rankings-year"] *[class*="option"]');
      let yearCount = yearCountSelector.length ? yearCountSelector.length : 1;

      for(let i = 0; i < yearCount; i++) {
        let playerDetails = {};

        let proYear = yearCountSelector.length ? document.evaluate(`(//tr[@data-year="${yearCountSelector[i].getAttribute('data-year')}"]/@data-year)[1]`, document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue : '';
        let proYearEndRank = yearCountSelector.length ? document.evaluate(`(//tr[@data-year="${yearCountSelector[i].getAttribute('data-year')}"]/td[contains(@class, "value2")])[1]`, document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue : '';

        playerDetails.detailsUrl = input.detailsUrl ? input.detailsUrl : '';
        playerDetails.name = input.name ? input.name : '';
        playerDetails.ranking = input.ranking ? input.ranking : '';
        playerDetails.rankingYear = input.rankingYear ? input.rankingYear : '';
        playerDetails.yob = input.yob ? input.yob : '';
        playerDetails.height = input.height ? input.height : '';
        playerDetails.country = input.country ? input.country : '';
        playerDetails.turnedProYear = input.turnedProYear ? input.turnedProYear : '';
        playerDetails.proYear = proYear ? proYear.value : '';
        playerDetails.proYearEndRank = proYearEndRank ? proYearEndRank.textContent.trim() : '';
        
        playerData.push(playerDetails);
      }

      return playerData;
    });
    
    console.log(extractedData);
    return extractorContext.return(extractorContext.createData(extractedData));
}
