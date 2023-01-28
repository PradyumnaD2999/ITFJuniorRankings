module.exports = async function (input) {
    await extractorContext.waitForElement('#singlesRanking tbody');

    let rankDate = await extractorContext.execute(async function() {
      let rankYear = document.evaluate(`(//ul[@data-value="rankDate"]/li[contains(text(), "${input.year}")])[1]`, document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue;
      let rankDate = rankYear ? rankYear.textContent.trim().replace(/\./g, "-") : '';
      return rankDate;
    });

    await extractorContext.goto(`https://www.atptour.com/en/rankings/singles?rankRange=1-5000&rankDate=${rankDate}`);
    await extractorContext.waitForElement('#singlesRanking tbody');

    let extractedData = await extractorContext.execute(async function() {
      let playerData = [];
      let playerList = document.querySelectorAll('#singlesRanking tbody > tr');
      
      for(let i=0; i < playerList.length; i++) {
        let playerDetails = {};
        
        playerDetails.detailsUrl = playerList[i].querySelector('a[href*="/overview"]').href;
        playerDetails.name = playerList[i].querySelector('a[href*="/overview"]').getAttribute('ga-label');
        playerDetails.rank = playerList[i].querySelector('td[class*="rank"]').textContent.trim();
        playerDetails.points = playerList[i].querySelector('td[class*="points"] a').textContent.trim().replace(/\,/g, "");
        playerDetails.country = playerList[i].querySelector('td[class*="country"] img').getAttribute('alt');
        playerDetails.rankingYear = input.year ? input.year : '';
        playerDetails.listingYear = input.year ? input.year : '';
        
        playerData.push(playerDetails);
      }
      return playerData;
    });
    
    console.log(extractedData);
    return extractorContext.return(extractorContext.createData(extractedData));
}
