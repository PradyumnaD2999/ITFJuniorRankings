module.exports = async function (input) {
    await extractorContext.waitForPage();

    let playerSearchJson = await extractorContext.fetch(`https://www.atptour.com/en/-/ajax/playersearch/PlayerUrlSearch?searchTerm=${input.name}`, {
          "headers": {
            "accept": "application/json; q=0.01",
            "accept-language": "en-US,en;q=0.9",
          },
          "body": null,
          "method": "GET",
          "mode": "cors",
        }).then(resp => resp.json());

    let extractedData = [];
    
    if(playerSearchJson && playerSearchJson.items) {
      console.log('Players Found: ', playerSearchJson.items.length);

      if(playerSearchJson.items.length) {
        let profileUrl = `https://www.atptour.com${playerSearchJson.items[0].Value}`;
        await extractorContext.goto(profileUrl);
        await extractorContext.waitForPage();
        await extractorContext.waitForElement('div#mainContent');

        extractedData = await extractorContext.execute(async function() {
          let playerData = [];
          let playerDetails = {};
          
          let ranking = document.evaluate('//div[contains(text(), "ank")]/../div[@data-singles]', document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue;
          let rankingYear = document.querySelector('td.overview-year');
          let height = document.querySelector('span[class*="height-cm"]');
          let turnedProYear = document.evaluate('//div[contains(text(), "urned Pro") or contains(text(), "urned pro")]/following-sibling::div', document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue;
          let rankingsHistoryUrl = document.querySelector('a[ga-label*="ankings History"], a[ga-label*="ankings history"]');
    
          playerDetails.detailsUrl = window.location.href;
          playerDetails.name = input.name ? input.name : '';
          playerDetails.yob = input.yob ? input.yob : '';
          playerDetails.country = input.country ? input.country : '';
          playerDetails.itfDetailsUrl = input.itfDetailsUrl ? input.itfDetailsUrl : '';
          playerDetails.itfPlayerId = input.itfPlayerId ? input.itfPlayerId : '';
          playerDetails.ranking = ranking ? ranking.textContent.trim() : '';
          playerDetails.rankingYear = rankingYear ? rankingYear.textContent.trim() : '';
          playerDetails.height = height ? height.textContent.trim().replace(/\((\d+).*/, '$1') : '';
          playerDetails.turnedProYear = turnedProYear ? turnedProYear.textContent.trim() : '';
          playerDetails.rankingsHistoryUrl = rankingsHistoryUrl ? rankingsHistoryUrl.href : '';
          
          playerData.push(playerDetails);
    
          return playerData;
        });
      } else {
        console.log('Player didn\'t go Pro.');
        let playerDetails = {};

        playerDetails.name = input.name ? input.name : '';
        playerDetails.yob = input.yob ? input.yob : '';
        playerDetails.country = input.country ? input.country : '';
        playerDetails.itfDetailsUrl = input.itfDetailsUrl ? input.itfDetailsUrl : '';
        playerDetails.itfPlayerId = input.itfPlayerId ? input.itfPlayerId : '';
        playerDetails.rankingsHistoryUrl = input._url.url ? input._url.url : input._url;

        extractedData.push(playerDetails);
      }
    }
    
    console.log(extractedData);
    return extractorContext.return(extractorContext.createData(extractedData));
}
