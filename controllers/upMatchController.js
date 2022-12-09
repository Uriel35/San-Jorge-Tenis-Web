const User = require('../model/User');
const Double = require('../model/Doubles');
const { DateTime } = require('luxon')

async function handleUpMatch(req, res) {
    let winPlayer = await User.findById(req.body.winPlayer._id);
    let losePlayer = await User.findById(req.body.losePlayer._id);

    // Control exists players
    if(!winPlayer) {
        return res.status(404).json({ message: `Player with ${ req.body.winPlayer.name } not found`, from: `upMatchController.js` })
    } else if(!losePlayer) {
        return res.status(404).json({ message: `Player with ${ req.body.losePlayer.name } not found`, from: `upMatchController.js` })
    }
    // Control same Sex
    if(winPlayer.sex !== losePlayer.sex) return res.status(404).json({ message: `Players with the same sex category`, from: `upMatchController.js` });

    const winPlayerInfo = req.body.winPlayer;
    const losePlayerInfo = req.body.losePlayer;

    // Control date
    let checkSameDateWinPlayer = winPlayer.matches.some(match => match.date == DateTime.now().toFormat('dd-MM-yyyy'));
    let checkSameDateLosePlayer = losePlayer.matches.some(match => match.date == DateTime.now().toFormat('dd-MM-yyyy'));
    if(checkSameDateWinPlayer || checkSameDateLosePlayer) return res.status(400).json({ message: 'Misma fecha' })

    // Control score
    let resultArray = req.body.score.map(item => checkSet(item));
    const resign = req.body.resign;
    const bo3 = req.body.bestOf3;
    if(validateScore(bo3, resign, resultArray) == false) return res.status(409).json({ message: 'Score NO valido', from: 'upMatchController.js'});

    const score = req.body.score.filter(item => {
        if(item[0] == 0 && item[1] == 0) {
            return;
        } else {
            return item
        };
    }); 
    
    const serve = req.body.whoServed;
    winPlayerInfo.matches = {
        ...winPlayerInfo.matches,
        // date: "10-09-2022",
        score: score,
        breaks: getBreak(score, serve)
    };
    // winPlayerInfo.ranking.history.date = "10-09-2022"
    // losePlayerInfo.ranking.history.date = "10-09-2022"
    losePlayerInfo.matches = {
        ...losePlayerInfo.matches,
        // date: "10-09-2022",
        score: reverseScore(score),
        breaks: getBreak(reverseScore(score), serve)
    };


    try {
        // Win player
        winPlayer.ranking.history.push(winPlayerInfo.ranking.history);
        const winHistory = winPlayer.ranking.history;
        await User.updateOne({ _id: winPlayerInfo._id}, {
            "ranking.history": winHistory,
            "ranking.ranking": winPlayerInfo.ranking.ranking,
            $push: { matches: winPlayerInfo.matches },
            streak: winPlayer.streak + 1,
        })
        // Lose player
        losePlayer.ranking.history.push(losePlayerInfo.ranking.history);
        const loseHistory = losePlayer.ranking.history;
        await User.updateOne({ _id: losePlayerInfo._id}, {
            streak: 0,
            "ranking.history": loseHistory,
            "ranking.ranking": losePlayerInfo.ranking.ranking,
            $push: { matches: losePlayerInfo.matches },
        })
        res.status(200).json({ message: 'Succesfull update', winPlayer: await User.findById(winPlayer._id), losePlayer: await User.findById(losePlayer._id), from: 'upMatchController.js' });

    } catch(err) {
        res.status(500).json({ message: err.message, from: `upMatchController.js`})
    }
}

const handleDoubleUpMatch = async (req, res) => {
    let winPlayer = await Double.findById(req.body.winPlayer._id);
    let losePlayer = await Double.findById(req.body.losePlayer._id);

    if(!winPlayer) {
        return res.status(404).json({ message: `Player with ${ req.body.winPlayer.name } not found`, from: `upMatchController.js` })
    } else if(!losePlayer) {
        return res.status(404).json({ message: `Player with ${ req.body.losePlayer.name } not found`, from: `upMatchController.js` })
    }
    // Control same Sex
    if(winPlayer.sex !== losePlayer.sex) return res.status(404).json({ message: `Players with the different sex category`, from: `upMatchController.js` });

    // Control Date
    let checkSameDateWinPlayer = winPlayer.matches.some(match => match.date == DateTime.now().toFormat('dd-MM-yyyy'));
    let checkSameDateLosePlayer = losePlayer.matches.some(match => match.date == DateTime.now().toFormat('dd-MM-yyyy'));
    if(checkSameDateWinPlayer || checkSameDateLosePlayer) return res.status(400).json({ message: 'Misma fecha' })
    
    const winPlayerInfo = req.body.winPlayer;
    const losePlayerInfo = req.body.losePlayer;

    // Control score
    // Tal vez podemos controlar el score SIN los 0-0, asi quitamos par de lineas de codigo
    let resultArray = req.body.score.map(item => {
        return checkSet(item)
    });
    const resign = req.body.resign;
    const bo3 = req.body.bestOf3;
    if(validateScore(bo3, resign, resultArray) == false) return res.status(409).json({ message: 'Score NO valido', from: 'upMatchController.js'});

    const score = req.body.score.filter(item => {
        if(item[0] == 0 && item[1] == 0) {
            return;
        } else {
            return item
        };
    });

    const serve = req.body.whoServed;
    winPlayerInfo.matches = {
        ...winPlayerInfo.matches,
        score: score,
        breaks: getBreak(score, serve)
    };
    losePlayerInfo.matches = {
        ...losePlayerInfo.matches,
        score: reverseScore(score),
        breaks: getBreak(reverseScore(score), serve)
    };
    
    try {
        // Win player
        winPlayer.ranking.history.push(winPlayerInfo.ranking.history); 
        const winHistory = winPlayer.ranking.history;
        await Double.updateOne({ _id: winPlayerInfo._id}, {
            streak: winPlayer.streak + 1,
            "ranking.history": winHistory,
            "ranking.ranking": losePlayerInfo.ranking.ranking,
            $push: { matches: winPlayerInfo.matches },
        })
        // Lose player
        losePlayer.ranking.history.push(losePlayerInfo.ranking.history);
        const loseHistory = losePlayer.ranking.history;
        await Double.updateOne({ _id: losePlayerInfo._id}, {
            streak: 0,
            "ranking.history": loseHistory,
            "ranking.ranking": losePlayerInfo.ranking.ranking,
            $push: { matches: losePlayerInfo.matches },
        })
        res.status(200).json({ message: 'Succesfull update', winPlayer: await Double.findById(winPlayer._id), losePlayer: await Double.findById(losePlayer._id), from: 'upMatchController.js' });

    } catch(err) {
        res.status(500).json({ message: err.message, from: `upMatchController.js`})
    }
}

module.exports = {
    handleUpMatch,
    handleDoubleUpMatch
}

const checkSet = (set) => {
    let result = {};
    if(set[0].length !== 1 || set[1].length !== 1) {
        result.lengthUnvalid = true;
    }
    set[0] = parseInt(set[0]);
    set[1] = parseInt(set[1]);
    if(typeof(set[0]) == 'number' && typeof(set[1]) == 'number') {
        if(set[0] <= 7 && set[0] >= 0 && set[1] <= 7 && set[1] >= 0) {
            result.invalidRange = false;
            if(set.indexOf(7) !== -1) {
                if(set.indexOf(5) !== -1) {
                    result.scoreValid = true;
                } else if(set.indexOf(6) !== -1) {
                    result.scoreValid = true;
                    result.tiebreak = true;
                } else {
                    result.scoreValid = false;
                }
            } else if(set.indexOf(6) !== -1 ) {
                if(set.indexOf(5) !== -1 || set[0] == set[1]) {
                    result.scoreValid = false;
                } else {
                    result.scoreValid = true;
                }
            } else if(set[0] == 0 && set[1] == 0) {
                result.zeroZero = true;
            } else {
                result.scoreValid = false;
            }
        } else {
            result.invalidRange = true;
        }
    } else {
        result.isNaN = true;
    }
    result.setScore = set;
    return result;
}

function validateScore(bo3, resign, resultArray) {
    if(bo3 == true) {
        if(resultArray.length !== 3) return false;
        if(!resign) {
            let realScore = [], winSets = 0, zeroZero = 0, unvalidLength;
            resultArray.map(item => {
                if(item.lengthUnvalid == true) {
                    unvalidLength = true
                }
                if(item.scoreValid == false || item.invalidRange == true) {
                    if(item.zeroZero == true) {
                        zeroZero++;
                    } else {
                        winSets--;
                    }
                }
                if(item.scoreValid == true && item.invalidRange == false) {
                    realScore.push(item.setScore)
                    if(item.setScore[0] > item.setScore[1]){
                        winSets++;
                    }
                }
            });
            if(winSets !== 2 || zeroZero > 1 || unvalidLength == true) {
                return false
            }
        } else { // bo3 resign
            let resignScore = [], unvalidSet, justOneInvalidScore = 0, winSets = 0, zeroZero = 0, unvalidLength;
            resultArray.map(item => {
                if(item.lengthUnvalid == true) {
                    unvalidLength = true;
                } 
                if(item.zeroZero == true) {
                    zeroZero++;
                }
                if(item.scoreValid == false) {
                    justOneInvalidScore++; 
                }
                if(item.invalidRange == true || item.isNaN == true) {
                    unvalidSet = true;
                } else if(item.invalidRange == false) {
                    resignScore.push(item.setScore);
                    if(item.setScore[0] > item.setScore[1]){
                        winSets++;
                    }
                }
            })
            if(unvalidSet == true || winSets >= 2 || unvalidLength == true) {
                return false;
            } else if(justOneInvalidScore !== 1 || justOneInvalidScore !== 0) {
                if (zeroZero >= 3) {
                    return false;
                }
            }
        }
    } else { // bo5
        if(resultArray.length !== 5) {
            return false
        } 
        if(!resign) {
            let realScore = [], winSets = 0, zeroZero = 0, unvalidLength;
            resultArray.map(item => {
                if(item.lengthUnvalid == true) {
                    unvalidLength = true;
                }
                if(item.scoreValid == false || item.invalidRange == true) {
                    if(item.zeroZero == true) {
                        zeroZero++;
                    } else {
                        winSets--;
                    }
                }
                if(item.scoreValid == true && item.invalidRange == false) {
                    realScore.push(item.setScore)
                    if(item.setScore[0] > item.setScore[1]){
                        winSets++;
                    }
                }
            });
            if(winSets !== 3 || zeroZero > 2 || unvalidLength == true) {                
                return false;
            }
        } else {
            let resignScore = [], unvalidSet, justOneInvalidScore = 0, winSets = 0, zeroZero = 0, unvalidLength;
            resultArray.map(item => {
                if(item.lengthUnvalid == true) {
                    unvalidLength = true;
                }
                if(item.zeroZero == true) {
                    zeroZero++;
                }
                if(item.scoreValid == false) {
                    justOneInvalidScore++; 
                }
                if(item.invalidRange == true || item.isNaN == true) {
                    unvalidSet = true;
                } else if(item.invalidRange == false) {
                    resignScore.push(item.setScore);
                    if(item.setScore[0] > item.setScore[1]){
                        winSets++;
                    }
                }
            })
            if(unvalidSet == true || unvalidLength == true || winSets >= 3) {
                return false
            }
            else if(justOneInvalidScore !== 1 || justOneInvalidScore !== 0) {
                if (!zeroZero < 5) {
                    return false;
                }
            } 
        }
    }
}

const reverseScore = (score) => {
    let result = [];
    score.map(item => result.push([item[1], item[0]]))
    return result;
}

const getBreak = (score, serve) => {
    let breaks = {
        win: 0,
        lose: 0
    }
    score.map(set => {
        let diff = set[0] - set[1];
        if((set[0] + set[1]) % 2 == 0) {
            if(diff > 0) breaks.win += diff / 2;
            else breaks.lose += (diff / (-2))

            if(serve == 'win') serve = 'loser';
            else serve = 'win';
        } else { // Diff es impar...
            if(serve == 'win') {
                if(diff > 0) breaks.win += (diff - 1) / 2;
                else breaks.lose +=  (diff + 1) / (-2) // Para hacerlo positivo;
            } else if(serve == 'loser') {
                if(diff < 0 ) breaks.lose += (diff - 1) / (-2);
                else breaks.win += (diff + 1) / 2;
            }
        }
    })
    return breaks;
}
