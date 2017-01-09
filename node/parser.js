var fs = require('fs')

var _ = require('lodash')

var config = {} 



config.params_pattern = /\$.*?\}/gi //new RegExp(config.params_pattern_string);



const str = `SELECT 

SQL_CALC_FOUND_ROWS 

W.PlayerId, 

PP.UserName,

MAX(W.CreationDate) AS LastWager, 

(IFNULL(SUM(W.Value/100000), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" THEN (W.Value/100000) END), 0)) AS NetWager, 

(IFNULL(SUM(Win.Value/100000), 0) - (IFNULL(SUM(CASE WHEN W.State="PLAYED" THEN (W.Value/100000) END), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" THEN (W.Value/100000) END), 0))) AS NetLoss, 

ROUND(((IFNULL(SUM(Win.Value/100000), 0) - (IFNULL(SUM(CASE WHEN W.State="PLAYED" THEN (W.Value/100000) END), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" THEN (W.Value/100000) END), 0))) / (IFNULL(SUM(W.Value/100000), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" THEN (W.Value/100000) END), 0))), 1) AS NetLossPercentage, 

(CASE WHEN (SELECT IFNULL(COUNT(GR.PlayerId), 0) FROM GameRestriction GR WHERE GR.AppliedFrom <= NOW() AND GR.AppliedUntil >= NOW() AND GR.PlayerId = W.PlayerId GROUP BY GR.PlayerId) >= 1 THEN 'Yes' ELSE 'No' END) AS GameExclusion,

(IFNULL(SUM(CASE WHEN GD.GameType='DLO' THEN (W.Value/100000) END), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" AND GD.GameType='DLO' THEN (W.Value/100000) END), 0)) AS DLONetWager, 

(IFNULL(SUM(CASE WHEN GD.GameType='DLO' THEN (Win.Value/100000) END), 0) - (IFNULL(SUM(CASE WHEN W.State="PLAYED" AND GD.GameType='DLO' THEN (W.Value/100000) END), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" AND GD.GameType='DLO' THEN (W.Value/100000) END), 0))) AS DLONetLoss,

(IFNULL(SUM(CASE WHEN GD.GameType='DLI' THEN (W.Value/100000) END), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" AND GD.GameType='DLI' THEN (W.Value/100000) END), 0)) AS DLINetWager, 

(IFNULL(SUM(CASE WHEN GD.GameType='DLI' THEN (Win.Value/100000) END), 0) - (IFNULL(SUM(CASE WHEN W.State="PLAYED" AND GD.GameType='DLI' THEN (W.Value/100000) END), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" AND GD.GameType='DLI' THEN (W.Value/100000) END), 0))) AS DLINetLoss,

(IFNULL(SUM(CASE WHEN GD.Category='Lottery' THEN (W.Value/100000) END), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" AND GD.Category='Lottery' THEN (W.Value/100000) END), 0)) AS LottoNetWager, 

(IFNULL(SUM(CASE WHEN GD.Category='Lottery' THEN (Win.Value/100000) END), 0) - (IFNULL(SUM(CASE WHEN W.State="PLAYED" AND GD.Category='Lottery' THEN (W.Value/100000) END), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" AND GD.Category='Lottery' THEN (W.Value/100000) END), 0))) AS LottoNetLoss,

(IFNULL(SUM(CASE WHEN GD.Category='Casino' THEN (W.Value/100000) END), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" AND GD.Category='Casino' THEN (W.Value/100000) END), 0)) AS CasinoNetWager,

(IFNULL(SUM(CASE WHEN GD.Category='Casino' THEN (Win.Value/100000) END), 0) - (IFNULL(SUM(CASE WHEN W.State="PLAYED" AND GD.Category='Casino' THEN (W.Value/100000) END), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" AND GD.Category='Casino' THEN (W.Value/100000) END), 0))) AS CasinoNetLoss,

(IFNULL(SUM(CASE WHEN GD.Category='Sportsbook' THEN (W.Value/100000) END), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" AND GD.Category='Sportsbook' THEN (W.Value/100000) END), 0)) AS SportsBookNetWager, 

(IFNULL(SUM(CASE WHEN GD.Category='Sportsbook' THEN (Win.Value/100000) END), 0) - (IFNULL(SUM(CASE WHEN W.State="PLAYED" AND GD.Category='Sportsbook' THEN (W.Value/100000) END), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" AND GD.Category='Sportsbook' THEN (W.Value/100000) END), 0))) AS SportsBookNetLoss,

(IFNULL(SUM(CASE WHEN GD.Category='Poker' THEN (W.Value/100000) END), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" AND GD.Category='Poker' THEN (W.Value/100000) END), 0)) AS PokerNetWager, 

(IFNULL(SUM(CASE WHEN GD.Category='Poker' THEN (Win.Value/100000) END), 0) - (IFNULL(SUM(CASE WHEN W.State="PLAYED" AND GD.Category='Poker' THEN (W.Value/100000) END), 0) - IFNULL(SUM(CASE WHEN W.State="REFUNDED" AND GD.Category='Poker' THEN (W.Value/100000) END), 0))) AS PokerNetLoss

FROM Wager AS W

LEFT JOIN PlayerProfile PP ON (W.PlayerId = PP.Id)

LEFT JOIN Winning Win ON (Win.WagerId = W.Id)

LEFT JOIN GameDetails GD ON (W.GameId = GD.GameId)

WHERE 

($P{Website} IS NULL OR W.Website = $P{Website})

AND if($P{StartDate} is null,true,W.CreationDate >= $P{StartDate}) 

AND if($P{EndDate} is null,true,W.ExternalCreationDate <= $P{EndDate}) 

AND ($P{AffiliateRef} IS NULL OR (PP.AffiliatePartner = $P{AffiliateRef} OR PP.AffiliateCampaign = $P{AffiliateRef} OR PP.AffiliatePayload = $P{AffiliateRef}))

AND ($P{PlayerId} IS NULL OR (W.PlayerId = $P{PlayerId} OR PP.UserName = $P{PlayerId}))

AND (($P{AgeFrom} IS NULL OR ((PP.BirthDate <= DATE_SUB(CURDATE(), INTERVAL $P{AgeFrom} YEAR)))))

AND (($P{AgeTo} IS NULL OR ((PP.BirthDate >= DATE_SUB(CURDATE(), INTERVAL $P{AgeTo} YEAR)))))

AND ($P{Gender} IS NULL OR PP.Gender = $P{Gender})

AND ($P{Country} IS NULL OR PP.Country = $P{Country})

AND ($P{Currency} IS NULL OR W.Currency = $P{Currency})

GROUP BY W.PlayerId

HAVING IF($P{OnlyGameExclusionPlayer} IS NULL OR ($P{OnlyGameExclusionPlayer} IS NOT NULL AND $P{ExcludeGameExclusionPlayer} IS NOT NULL) ,TRUE ,GameExclusion = 'Yes')

AND IF($P{ExcludeGameExclusionPlayer} IS NULL OR ($P{OnlyGameExclusionPlayer} IS NOT NULL AND $P{ExcludeGameExclusionPlayer} IS NOT NULL) ,TRUE ,GameExclusion = 'No') 

AND IF($P{MinAmount} IS NULL,TRUE,NetLoss >= $P{MinAmount})

AND IF($P{MaxAmount} IS NULL,TRUE,NetLoss <= $P{MaxAmount})

ORDER BY LastWager DESC`;









function arrayToObj(keys) {

    var keyVal = _.reduce(keys, function (formed, item) {

        formed[item] = null

        return formed

    }, {});

    console.log(keyVal);

}



var toReplace = { '$P{Website}': null,

  '$P{StartDate}': null,

  '$P{EndDate}': null,

  '$P{AffiliateRef}': null,

  '$P{PlayerId}': null,

  '$P{AgeFrom}': null,

  '$P{AgeTo}': null,

  '$P{Gender}': null,

  '$P{Country}': null,

  '$P{Currency}': null,

  '$P{OnlyGameExclusionPlayer}': null,

  '$P{ExcludeGameExclusionPlayer}': null,

  '$P{MinAmount}': null,

  '$P{MaxAmount}': null };



var replacer = function (tpl, data) {
    var re = config.params_pattern, match;
    while (match = re.exec(tpl)) {
        tpl = tpl.replace(match[0], data[match[0]])
        re.lastIndex = 0;
    }
    fs.writeFileSync("output.sql",tpl)
}





//console.log(arrayToObj(_.uniq(str.match(config.params_pattern))));

replacer(str, toReplace)
