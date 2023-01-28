module.exports = async function (input) {
    if(await extractorContext.execute(async function() {
        return !!document.querySelector('button#onetrust-accept-btn-handler');
    })) {
        await extractorContext.click('button#onetrust-accept-btn-handler');
    }

    await extractorContext.waitForPage();

    let extractedData = [];
    let playerDetails = {};

    let detailsUrl = await extractorContext.execute(async function() {
        let detailsUrl = window.location.href;
        console.log('Details Url: ', detailsUrl);

        return detailsUrl;
    });
                        
    let overviewUrl = `https://www.itftennis.com/tennis/api/PlayerApi/GetPlayerOverview?circuitCode=JT&matchTypeCode=S&playerId=${input.itfPlayerId}`
    console.log('Overview URL: ', overviewUrl);
    let playerOverviewJson = await extractorContext.fetch(overviewUrl, {
            headers: {
                accept: 'application/json, text/javascript, */*; q=0.01',
            },
            body: null,
            method: 'GET',
            mode: 'cors',
        }).then(resp => resp.json())

    let careerHighRanking;
    let careerHighYear;

    if(playerOverviewJson.careerHighRankings.length) {
        careerHighRanking =  parseInt(playerOverviewJson.careerHighRankings[0].rank);
        careerHighYear = parseInt(playerOverviewJson.careerHighRankings[0].date.trim().replace(/.*(\d{4}).*/, '$1'));

        console.log('Initial Career High Rank: ', careerHighRanking);
        console.log('Initial Career High Year: ', careerHighYear);

        for(let k = 1; k < playerOverviewJson.careerHighRankings.length; k++) {
            console.log('Career High Loop: ', k);
            if(parseInt(playerOverviewJson.careerHighRankings[k].rank) < careerHighRanking) {
                careerHighRanking = parseInt(playerOverviewJson.careerHighRankings[k].rank);
                careerHighYear = parseInt(playerOverviewJson.careerHighRankings[k].date.trim().replace(/.*(\d{4}).*/, '$1'));
            }
        }
        console.log('Final Career High Rank: ', careerHighRanking);
        console.log('Final Career High Year: ', careerHighYear);
    } else {
        console.log('Career High Rankings not found.');
    }

    let drawMapping = {'Main Draw': 'M', 'Qualifying Draw': 'Q'};
    let tournamentAchievementMapping = {
        '1st Round': '1',
        '2nd Round': '2',
        '3rd Round': '3',
        '4th Round': '4',
        'Quarter-final': 'QF',
        'Semi-final': 'SF',
        'Final': 'F',
    };
    let pointsMapping = {
        'AW': 500, 'AF': 350, 'ASF': 250, 'AQF': 150, 'A4': 90, 'A3': 90, 'A2': 45, 'A1': 0,
        'B1W': 300, 'B1F': 210, 'B1SF': 140, 'B1QF': 100, 'B14': 60, 'B13': 60, 'B12': 30, 'B11': 0,
        'B2W': 200, 'B2F': 140, 'B2SF': 100, 'B2QF': 60, 'B24': 26, 'B23': 26, 'B22': 18, 'B21': 0,
        'B3W': 100, 'B3F': 60, 'B3SF': 36, 'B3QF': 20, 'B34': 10, 'B33': 10, 'B32': 5, 'B31': 0,
        '1W': 300, '1F': 210, '1SF': 140, '1QF': 100, '14': 60, '13': 60, '12': 30, '11': 0,
        '2W': 200, '2F': 140, '2SF': 100, '2QF': 60, '24': 26, '23': 26, '22': 18, '21': 0,
        '3W': 100, '3F': 60, '3SF': 36, '3QF': 20, '34': 10, '33': 10, '32': 5, '31': 0,
        '4W': 60, '4F': 36, '4SF': 18, '4QF': 10, '44': 5, '43': 5, '42': 5, '41': 0,
        '5W': 30, '5F': 18, '5SF': 9, '5QF': 5, '54': 2, '53': 2, '52': 2, '51': 0
    };

    let activityUrl = `https://www.itftennis.com/tennis/api/PlayerApi/GetPlayerActivity?circuitCode=JT&matchTypeCode=S&playerId=${input.itfPlayerId}`;
    console.log('Activity URL: ', activityUrl);
    let tournamentList = await extractorContext.fetch(activityUrl, {
            headers: {
                accept: 'application/json, text/javascript, */*; q=0.01',
            },
            body: null,
            method: 'GET',
            mode: 'cors',
        }).then(resp => resp.json())

    console.log('Tournament Count: ', tournamentList.length);
                            
    if(tournamentList.length) {
        for(let k = 0; k < tournamentList.length; k++) {
            console.log('k :', k);

            if(!tournamentList[k].tournamentType.toLowerCase().includes('grade c')) {
                let playerData = {};

                playerData.bestITFJuniorRanking = careerHighRanking ? careerHighRanking : '';
                playerData.bestITFJuniorRankingYear = careerHighYear ? careerHighYear : '';
                playerData.detailsUrl = detailsUrl ? detailsUrl : '';
                playerData.name = input.name ? input.name : '';
                playerData.ranking = input.ranking ? input.ranking : '';
                playerData.rankingYear = input.rankingYear ? input.rankingYear : '';
                playerData.yob = input.yob ? input.yob : '';
                playerData.height = input.height ? input.height : '';
                playerData.country = input.country ? input.country : '';
                playerData.turnedProYear = input.turnedProYear ? input.turnedProYear : '';

                playerData.juniorTournamentName = tournamentList[k].tournamentName ? tournamentList[k].tournamentName.trim() : '';
                playerData.tournamentCountry = tournamentList[k].hostNationCode ? tournamentList[k].hostNationCode.trim() : '';
                playerData.grade = tournamentList[k].tournamentType ? tournamentList[k].tournamentType.trim().replace(/.*[Gg]rade\s*([A-Z0-9]{1,2}).*/, '$1') : '';
                playerData.draw = tournamentList[k].events ? drawMapping[tournamentList[k].events[0].drawType.trim()] : '';
                playerData.tournamentYear = tournamentList[k].dates ? tournamentList[k].dates.trim().replace(/.*(\d{4}).*/, '$1') : '';
                playerData.tournamentAge = playerData.yob && playerData.tournamentYear ? parseInt(playerData.tournamentYear) - parseInt(playerData.yob) : '';
                                    
                if(tournamentList[k].events && tournamentList[k].events[0].matches) {
                    if(tournamentList[k].events[0].matches[0].resultCode == 'W') {
                        playerData.tournamentAchievement = tournamentList[k].events[0].matches[0].resultCode;
                    } else {
                        playerData.tournamentAchievement = tournamentList[k].events[0].matches[0].roundGroup && tournamentList[k].events[0].matches[0].roundGroup.Value ? tournamentAchievementMapping[tournamentList[k].events[0].matches[0].roundGroup.Value] : '';
                    }
                } else {
                    playerData.tournamentAchievement = '';
                }
         
                if(playerData.draw == drawMapping['Main Draw'] && playerData.grade.toLowerCase() != 'junior masters') {
                    pointsType = playerData.grade.concat(playerData.tournamentAchievement);
                    playerData.points = pointsMapping[pointsType];
                } else {
                    playerData.points = 0;
                }

                extractedData.push(playerData);
            } else {
                console.log('Skipping Grade C Tournament.');
                continue;
            }
        }
    } else {
        console.log('No Juniors Tournament Data Present.');

        playerDetails.bestITFJuniorRanking = careerHighRanking ? careerHighRanking : '';
        playerDetails.bestITFJuniorRankingYear = careerHighYear ? careerHighYear : '';
        playerDetails.detailsUrl = detailsUrl ? detailsUrl : '';
        playerDetails.name = input.name ? input.name : '';
        playerDetails.ranking = input.ranking ? input.ranking : '';
        playerDetails.rankingYear = input.rankingYear ? input.rankingYear : '';
        playerDetails.yob = input.yob ? input.yob : '';
        playerDetails.height = input.height ? input.height : '';
        playerDetails.country = input.country ? input.country : '';
        playerDetails.turnedProYear = input.turnedProYear ? input.turnedProYear : '';
    }

    if(!extractedData.length) {
        extractedData.push(playerDetails);
    }
    
    console.log(extractedData);
    return extractorContext.return(extractorContext.createData(extractedData));
}
