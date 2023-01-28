module.exports = async function (input) {
    if(await extractorContext.execute(async function() {
        return !!document.querySelector('button[data-text="Accept Cookies"]');
    })) {
        await extractorContext.click('button[data-text="Accept Cookies"]');
    }

    await extractorContext.waitForElement('main#main-content');

    let specialCharsArray = ['À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï', 'Ð', 'Ñ', 'Ò', 'Ó', 'Ô',
                             'Õ', 'Ö', '×', 'Ø', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'Þ', 'ß', 'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é',
                             'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ð', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', '÷', 'ø', 'ù', 'ú', 'û', 'ü', 'ý', 'þ',
                             'ÿ', 'Ā', 'ā', 'Ă', 'ă', 'Ą', 'ą', 'Ć', 'ć', 'Ĉ', 'ĉ', 'Ċ', 'ċ', 'Č', 'č', 'Ď', 'ď', 'Đ', 'đ', 'Ē', 'ē',
                             'Ĕ', 'ĕ', 'Ė', 'ė', 'Ę', 'ę', 'Ě', 'ě', 'Ĝ', 'ĝ', 'Ğ', 'ğ', 'Ġ', 'ġ', 'Ģ', 'ģ', 'Ĥ', 'ĥ', 'Ħ', 'ħ', 'Ĩ',
                             'ĩ', 'Ī', 'ī', 'Ĭ', 'ĭ', 'Į', 'į', 'İ', 'ı', 'Ĳ', 'ĳ', 'Ĵ', 'ĵ', 'Ķ', 'ķ', 'ĸ', 'Ĺ', 'ĺ', 'Ļ', 'ļ', 'Ľ',
                             'ľ', 'Ŀ', 'ŀ', 'Ł', 'ł', 'Ń', 'ń', 'Ņ', 'ņ', 'Ň', 'ň', 'ŉ', 'Ŋ', 'ŋ', 'Ō', 'ō', 'Ŏ', 'ŏ', 'Ő', 'ő', 'Œ',
                             'œ', 'Ŕ', 'ŕ', 'Ŗ', 'ŗ', 'Ř', 'ř', 'Ś', 'ś', 'Ŝ', 'ŝ', 'Ş', 'ş', 'Š', 'š', 'Ţ', 'ţ', 'Ť', 'ť', 'Ŧ', 'ŧ',
                             'Ũ', 'ũ', 'Ū', 'ū', 'Ŭ', 'ŭ', 'Ů', 'ů', 'Ű', 'ű', 'Ų', 'ų', 'Ŵ', 'ŵ', 'Ŷ', 'ŷ', 'Ÿ', 'Ź', 'ź', 'Ż', 'ż',
                             'Ž', 'ž', 'ſ'];
    
    let extractedData = [];

    for(let i = 0; ; i++) {
        let playerList = await extractorContext.fetch(`https://api.wtatennis.com/tennis/players/ranked?page=${i}&pageSize=100&type=rankSingles&sort=asc&name=&metric=SINGLES&at=&nationality=`, {
                "headers": {
                    "accept": "application/json",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                },
                "body": null,
                "method": "GET",
                "mode": "cors",
                }).then(resp => resp.json());

        if(!playerList.length) {
            break;
        }

        console.log("Page No.: ", i + 1);

        for(let j = 0; j < playerList.length; j++) {
            let playerDetails = {};
            let urlPlayerName = playerList[j].player.firstName.replace(/\s+/g, "-") + "-" + playerList[j].player.lastName.replace(/\s+/g, "-");
            
            for(let k = 0; k < urlPlayerName.length; k++) {
                specialCharsArray.some(sChar => {
                    if(urlPlayerName.charAt(k) == sChar) {
                        console.log("Replacing Special Char For URL Player Name: ", urlPlayerName.toLowerCase());
                        urlPlayerName = urlPlayerName.replace(urlPlayerName.charAt(k), '-');
                    }
                });
            }

            let detailsUrl = playerList[j] && playerList[j].player ? `https://www.wtatennis.com/players/${playerList[j].player.id}/${urlPlayerName.toLowerCase()}` : '';

            playerDetails.detailsUrl = detailsUrl ? detailsUrl : '';
            playerDetails.name = playerList[j] && playerList[j].player ? playerList[j].player.fullName : '';

            extractedData.push(playerDetails);
        }
    }
    
    console.log(extractedData);
    return extractorContext.return(extractorContext.createData(extractedData));
}
