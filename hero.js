/*

  The only function that is required in this file is the "move" function

  You MUST export the move function, in order for your code to run
  So, at the bottom of this code, keep the line that says:

  module.exports = move;

  The "move" function must return "North", "South", "East", "West", or "Stay"
  (Anything else will be interpreted by the game as "Stay")

  The "move" function should accept two arguments that the website will be passing in:
    - a "gameData" object which holds all information about the current state
      of the battle

    - a "helpers" object, which contains useful helper functions
      - check out the helpers.js file to see what is available to you

    (the details of these objects can be found on javascriptbattle.com/#rules)

  This file contains four example heroes that you can use as is, adapt, or
  take ideas from and implement your own version. Simply uncomment your desired
  hero and see what happens in tomorrow's battle!

  Such is the power of Javascript!!!

*/

//TL;DR: If you are new, just uncomment the 'move' function that you think sounds like fun!
//       (and comment out all the other move functions)


// // The "Northerner"
// // This hero will walk North.  Always.
// var move = function(gameData, helpers) {
//   var littleSelbyK = gameData.activeHero;
//   return 'North';
// };

// // The "Blind Man"
// // This hero will walk in a random direction each turn.
// var move = function(gameData, helpers) {
//   var littleSelbyK = gameData.activeHero;
//   var choices = ['North', 'South', 'East', 'West'];
//   return choices[Math.floor(Math.random()*4)];
// };

// // The "Priest"
// // This hero will heal nearby friendly champions.
// var move = function(gameData, helpers) {
//   var littleSelbyK = gameData.activeHero;
//   if (littleSelbyK.health < 60) {
//     return helpers.findNearestHealthWell(gameData);
//   } else {
//     return helpers.findNearestTeamMember(gameData);
//   }
// };

// // The "Unwise Assassin"
// // This hero will attempt to kill the closest enemy hero. No matter what.
// var move = function(gameData, helpers) {
//   var littleSelbyK = gameData.activeHero;
//   if (littleSelbyK.health < 30) {
//     return helpers.findNearestHealthWell(gameData);
//   } else {
//     return helpers.findNearestEnemy(gameData);
//   }
// };

// // The "Careful Assassin"
// // This hero will attempt to kill the closest weaker enemy hero.
// var move = function(gameData, helpers) {
//   var littleSelbyK = gameData.activeHero;
//   if (littleSelbyK.health < 50) {
//     return helpers.findNearestHealthWell(gameData);
//   } else {
//     return helpers.findNearestWeakerEnemy(gameData);
//   }
// };

// // The "Safe Diamond Miner"
var move = function(gameData, helpers) {
  var littleSelbyK = gameData.activeHero;

  /* Intuition */
  var intuition = {
    stay: 0,
    north: 0,
    south: 0,
    east: 0,
    west: 0
  };

  var learn = function(direction, goodnessNumber){
    goodnessNumber = 15/goodnessNumber;
    switch(direction){
      case 'North':
        intuition.north = intuition.north + goodnessNumber;
        break;
      case 'South':
        intuition.south = intuition.south + goodnessNumber;
        break;
      case 'East':
        intuition.east = intuition.east + goodnessNumber;
        break;
      case 'West':
        intuition.west = intuition.west + goodnessNumber;
        break;
      case 'Stay':
      default:
        intuition.stay = intuition.stay + goodnessNumber;
        break;
    }
  };

  var opposite = function(direction){
    switch(direction){
      case 'North':
        return 'South';
        break;
      case 'South':
        return 'North';
        break;
      case 'East':
        return 'West';
        break;
      case 'West':
        return 'East';
        break;
      case 'Stay':
      default:
        return 'Stay';
        break;
    }
  };

  var withTheWind = function(){
    var bestDirection  = 'Stay',
        goodnessValue  = 0;

    if(intuition.stay > goodnessValue){
      goodnessValue = intuition.stay;
      bestDirection = 'Stay';
    }
    if(intuition.north > goodnessValue){
      goodnessValue = intuition.north;
      bestDirection = 'North';
    }
    if(intuition.south > goodnessValue){
      goodnessValue = intuition.south;
      bestDirection = 'South';
    }
    if(intuition.east > goodnessValue){
      goodnessValue = intuition.east;
      bestDirection = 'East';
    }
    if(intuition.west > goodnessValue){
      goodnessValue = intuition.west;
      bestDirection = 'West';
    }

    console.log('I think the best direction to go is' + bestDirection);
    return bestDirection;
  };

  /*
    Gather all the info we need
  */
  var teamMemberDirection = helpers.findNearestTeamMember(gameData);
  var healthWellDirection = helpers.findNearestHealthWell(gameData);

  var enemyStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, littleSelbyK, function(boardTile) {
    if (boardTile.type === 'Hero' && boardTile.team != littleSelbyK.team) {
      return true;
    }
  });

  var enemyDistance = enemyStats.distance === undefined ? 0 : enemyStats.distance;
  var enemyDirection = enemyStats.direction === undefined ? 'Stay' : enemyStats.direction;

  console.log("Enemy is " + enemyStats.distance + " " + enemyStats.direction);

  var strongerEnemyStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, littleSelbyK, function(boardTile) {
    if (boardTile.type === 'Hero' && boardTile.team != littleSelbyK.team && boardTile.health > hero.health) {
      return true;
    }
  });

  var strongerEnemyDistance = strongerEnemyStats.distance === undefined ? 0 : strongerEnemyStats.distance;
  var strongerEnemyDirection = strongerEnemyStats.direction === undefined ? 'Stay' : strongerEnemyStats.direction;

  console.log("Stronger enemy is " + strongerEnemyStats.distance + " " + strongerEnemyStats.direction);

  var weakerEnemyStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, littleSelbyK, function(boardTile) {
    if (boardTile.type === 'Hero' && boardTile.team != littleSelbyK.team && boardTile.health < hero.health) {
      return true;
    }
  });

  var weakerEnemyDistance = weakerEnemyStats.distance === undefined ? 0 : weakerEnemyStats.distance;
  var weakerEnemyDirection = weakerEnemyStats.direction === undefined ? 'Stay' : weakerEnemyStats.direction;

  console.log("Weaker enemy is " + weakerEnemyStats.distance + " " + weakerEnemyStats.direction);

  //Get stats on the nearest health well
  var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, littleSelbyK, function(boardTile) {
    if (boardTile.type === 'HealthWell') {
      return true;
    }
  });
  console.log(JSON.stringify(healthWellStats));

  var healthWellDistance = healthWellStats.distance === undefined ? 0 : healthWellStats.distance;
  var healthWellDirection = healthWellStats.direction === undefined ? 'Stay' : healthWellStats.direction;
  console.log("I can find a health well " + healthWellDistance + " units " + healthWellDirection);
  var teamStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, littleSelbyK, function(boardTile) {
    if (boardTile.type === 'Hero' && boardTile.team == littleSelbyK.team) {
      return true;
    }
  });

  var teamMemberDistance = teamStats.distance === undefined ? 0 : teamStats.distance;
  var teamMemberDirection = teamStats.direction === undefined ? 'Stay' : teamStats.direction;
  console.log(JSON.stringify(teamStats));
  console.log("My nearest ally is " + teamMemberDistance + " units " + teamMemberDirection);

  var mineStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, littleSelbyK, function(boardTile) {
    if (boardTile.type === 'DiamondMine') {
      return true;
    }
  });

  console.log(JSON.stringify(mineStats));
  var mineDistance = mineStats.distance === undefined ? 0 : mineStats.distance;
  var mineDirection = mineStats.direction === undefined ? 'Stay' : mineStats.direction;

  console.log("There is a mine at " + mineDistance + " " + mineDirection);

  //Get the path info object
  var unownedMineStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, littleSelbyK, function(boardTile) {
    if (boardTile.type === 'DiamondMine') {
      if (boardTile.owner) {
        return boardTile.owner.id !== littleSelbyK.id;
      } else {
        return true;
      }
    } else {
      return false;
    }
  });
  var unownedMineDistance = unownedMineStats.distance === undefined ? 0 : unownedMineStats.distance;
  var unownedMineDirection = unownedMineStats.direction === undefined ? 'Stay' : unownedMineStats.direction;
  console.log("There is an unowned mine at " + unownedMineDistance + " " + unownedMineDirection);


  //Get the path info object
  var nonTeamMineStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, littleSelbyK, function(boardTile) {
    if (boardTile.type === 'DiamondMine') {
      if (boardTile.owner) {
        return boardTile.owner.team !== littleSelbyK.team;
      } else {
        return true;
      }
    } else {
      return false;
    }
  });
  var nonTeamMineDistance = nonTeamMineStats.distance === undefined ? 0 : nonTeamMineStats.distance;
  var nonTeamMineDirection = nonTeamMineStats.direction === undefined ? 'Stay' : nonTeamMineStats.direction;
  console.log("There is an unowned mine at " + nonTeamMineDistance + " " + nonTeamMineDirection);

  console.log(JSON.stringify(littleSelbyK));

  /* Instinct */
  // Fill to 100 when near health well
  if(littleSelbyK.health < 100 && healthWellDistance === 1)
    return healthWellDirection;
  if(strongerEnemyDistance === 2)
    return opposite(strongerEnemyDirection);
  if(strongerEnemyDistance === 1)
    return teamMemberDirection != strongerEnemyDirection ? teamMemberDirection : healthWellDirection;
  if(weakerEnemyDistance === 2)
    return weakerEnemyDirection;

  // health good
  learn(healthWellDirection, -1*healthWellDistance);
  // team and health good
  learn(teamMemberDirection, teamMemberDistance);
  // mines are kinda good
  learn(mineDirection, mineDistance);
  learn(unownedMineDirection, unownedMineDistance);
  learn(nonTeamMineDirection, nonTeamMineDistance);
  // strong enemies bad
  learn(strongerEnemyDirection, -1*strongerEnemyDistance);
  // weak enemies good
  learn(weakerEnemyDirection, weakerEnemyDistance);
  // Mines!
  learn(unownedMineDirection, unownedMineDistance);

  // Low health senario
  if(littleSelbyK.health < 50){
    // Health well super good
    learn(healthWellDirection, 1);
    // Teak member direction also pretty good
    learn(teamMemberDirection, 2);
    // Enemy direction super bad
    learn(enemyDirection, -1*enemyDistance);
    // strong enemies super super bad
    learn(strongerEnemyDirection, -1*strongerEnemyDistance);
    // even weak enemies bad
    learn(weakerEnemyDirection, weakerEnemyDistance);
    // mines are bad
    learn(mineDirection, -1*mineDistance);
  } else {
    // Health and health/protection is always the best option if there's nothing else
    learn(healthWellDirection, 1);
    // Teak member direction is always a decent choice
    learn(teamMemberDirection, 2);
    // Enemy direction super bad
    learn(enemyDirection, -1*enemyDistance);
    // strong enemies super super bad
    learn(strongerEnemyDirection, -1*strongerEnemyDistance);
    // even weak enemies bad
    learn(weakerEnemyDirection, -1*weakerEnemyDistance);
    // even weak enemies bad
    learn(mineDirection, -1*mineDistance);
  }
  console.log('INTUITION');
  console.log(JSON.stringify(intuition));
  return withTheWind();
}

// // The "Selfish Diamond Miner"
// // This hero will attempt to capture diamond mines (even those owned by teammates).
// var move = function(gameData, helpers) {
//   var littleSelbyK = gameData.activeHero;

//   //Get stats on the nearest health well
//   var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, littleSelbyK, function(boardTile) {
//     if (boardTile.type === 'HealthWell') {
//       return true;
//     }
//   });

//   var distanceToHealthWell = healthWellStats.distance;
//   var directionToHealthWell = healthWellStats.direction;

//   if (littleSelbyK.health < 40) {
//     //Heal no matter what if low health
//     return directionToHealthWell;
//   } else if (littleSelbyK.health < 100 && distanceToHealthWell === 1) {
//     //Heal if you aren't full health and are close to a health well already
//     return directionToHealthWell;
//   } else {
//     //If healthy, go capture a diamond mine!
//     return helpers.findNearestUnownedDiamondMine(gameData);
//   }
// };

// // The "Coward"
// // This hero will try really hard not to die.
// var move = function(gameData, helpers) {
//   return helpers.findNearestHealthWell(gameData);
// }


// Export the move function here
module.exports = move;
