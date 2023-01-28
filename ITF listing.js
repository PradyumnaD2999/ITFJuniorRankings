module.exports = async function (input) {
    if(await extractorContext.execute(async function() {
        return !!document.querySelector('button[id*="accept-btn"]');
    })) {
        await extractorContext.click('button[id*="accept-btn"]');
    }

    await extractorContext.waitForElement('div#ranking-page-id');

    let extractedData = [];

    let listingJsonUrl = `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=JT&playerTypeCode=B&ageCategoryCode=%20%20%20%20%20%20%20%20%20%20%20%20&juniorRankingType=year&take=5000&skip=0&juniorEndYear=${input.year}`;
    let playerList = await extractorContext.fetch(listingJsonUrl, {
        "headers": {
          "accept": "application/json",
          "accept-language": "en-US,en;q=0.9",
        },
        "body": null,
        "method": "GET",
        "mode": "cors",
      }).then(resp => resp.json());

    if(playerList && playerList.items) {
        console.log('Player Count: ', playerList.items.length);

        if(playerList.items.length) {
            for(let i = 0; i < playerList.items.length; i++) {
                let playerDetails = {};
            
                playerDetails.itfDetailsUrl = `https://www.itftennis.com${playerList.items[i].profileLink}jt/s/`;
                playerDetails.name = playerList.items[i].playerGivenName + ' ' + playerList.items[i].playerFamilyName;
                playerDetails.yob = playerList.items[i].birthYear;
                playerDetails.country = playerList.items[i].playerNationalityCode;
                playerDetails.itfPlayerId = playerList.items[i].playerId;

                extractedData.push(playerDetails);
            }
        }
    }
    
    console.log(extractedData);
    return extractorContext.return(extractorContext.createData(extractedData));
}
