module.exports = async function (input) {
    await extractorContext.waitForElement('div#mainContent');

    let extractedData = await extractorContext.execute(async function() {
      let playerData = [];
    
      let yearCountSelector = document.querySelectorAll(`ul#playerRankHistoryDropdownContainer > li ~ li`);
      let yearCount = yearCountSelector ? yearCountSelector.length : 1;

      for(let i = 0; i < yearCount; i++) {
        let playerDetails = {};

        yearCountSelector[i].click();
        await new Promise(r => setTimeout(r, 1500));

        let proYear = document.evaluate('(//div[@id="playerRankHistoryContainer"]//tbody//td)[1]', document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue;
        let proYearEndRank = document.evaluate('(//div[@id="playerRankHistoryContainer"]//tbody//td/following-sibling::td)[1]', document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue;
          
        playerDetails.detailsUrl = input.detailsUrl ? input.detailsUrl : '';
        playerDetails.name = input.name ? input.name : '';
        playerDetails.ranking = input.ranking ? input.ranking : '';
        playerDetails.rankingYear = input.rankingYear ? input.rankingYear : '';
        playerDetails.yob = input.yob ? input.yob : '';
        playerDetails.height = input.height ? input.height : '';
        playerDetails.country = input.country ? input.country : '';
        playerDetails.turnedProYear = input.turnedProYear ? input.turnedProYear : '';
        playerDetails.points = input.points ? input.points : '';
        playerDetails.proYear = proYear ? proYear.textContent.trim().replace(/(\d+)\.(\d+)\.(\d+).*/, '$1') : '';
        playerDetails.proYearEndRank = proYearEndRank ? proYearEndRank.textContent.trim() : '';
          
        playerData.push(playerDetails);
      }

      return playerData;
    });
    
    console.log(extractedData);
    return extractorContext.return(extractorContext.createData(extractedData));
}
