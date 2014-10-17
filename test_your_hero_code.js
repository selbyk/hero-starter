/*

If you'd like to test your hero code locally,
run this code using node (must have node installed).

Please note that you DO NOT need to do this to enter javascript
battle, it is simply an easy way to test whether your new hero
code will work in the javascript battle.

To run:

  -Install node
  -Run the following in your terminal:

    node test_your_hero_code.js

  -If you don't see any errors in your terminal, the code works!

*/

//Get the helper file and the Game logic
var helpers = require('./helpers.js');
var Game = require('./game_logic/Game.js');

//Get my hero's move function ("brain")
var heroMoveFunction = require('./hero.js');

//The move function ("brain") the practice enemy will use
var enemyMoveFunction = function(gameData, helpers) {
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
    if (boardTile.type === 'Hero' && boardTile.team != littleSelbyK.team && boardTile.health >= littleSelbyK.health) {
      return true;
    }
  });

  var strongerEnemyDistance = strongerEnemyStats.distance === undefined ? 0 : strongerEnemyStats.distance;
  var strongerEnemyDirection = strongerEnemyStats.direction === undefined ? 'Stay' : strongerEnemyStats.direction;

  console.log("Stronger enemy is " + strongerEnemyStats.distance + " " + strongerEnemyStats.direction);

  var weakerEnemyStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, littleSelbyK, function(boardTile) {
    if (boardTile.type === 'Hero' && boardTile.team != littleSelbyK.team && boardTile.health <= littleSelbyK.health) {
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

  // at 100 health, go adventure and be wreckless
  if(littleSelbyK.health === 100){
    if(strongerEnemyDirection != weakerEnemyDirection)
      if(strongerEnemyDistance === 2)
        return strongerEnemyDirection;
    learn(healthWellDirection, -1*healthWellDistance/2);
    learn(teamMemberDirection, -1*teamMemberDistance/2);
    learn(strongerEnemyDirection, strongerEnemyDistance);
    learn(weakerEnemyDirection, weakerEnemyDistance);
    learn(mineDirection, mineDistance);
    learn(unownedMineDirection, unownedMineDistance);
    learn(nonTeamMineDirection, nonTeamMineDistance);
  }

  // strong enemies bad
  learn(strongerEnemyDirection, -1*strongerEnemyDistance);
  // weak enemies good
  learn(weakerEnemyDirection, weakerEnemyDistance);
  // mines are good
  learn(mineDirection, mineDistance);
  learn(unownedMineDirection, unownedMineDistance);
  learn(nonTeamMineDirection, nonTeamMineDistance);


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
/*function(gameData, helpers) {
  var littleSelbyK = gameData.activeHero;

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
}*/

//Makes a new game with a 5x5 board
var game = new Game(10);

//Add a health well in the middle of the board
game.addHealthWell(2,2);
game.addHealthWell(7,9);
game.addHealthWell(3,6);

//Add diamond mines on either side of the health well
game.addDiamondMine(2,1);
game.addDiamondMine(2,3);

game.addDiamondMine(6,6);

game.addDiamondMine(4,8);

//Add your hero in the top left corner of the map (team 0)
game.addHero(0, 0, 'MyHero', 0);

//Add an enemy hero in the bottom left corner of the map (team 1)
game.addHero(4, 4, 'Enemy', 1);
game.addHero(4, 5, 'Enemy', 1);

console.log('About to start the game!  Here is what the board looks like:');

//You can run game.board.inspect() in this test code at any time
//to log out the current state of the board (keep in mind that in the actual
//game, the game object will not have any functions on it)
game.board.inspect();

//Play a very short practice game
var turnsToPlay = 1000;

var playGame = function(){
  setTimeout(function(){
    var hero = game.activeHero;
    var direction;
    if (hero.name === 'MyHero') {

      //Ask your hero brain which way it wants to move
      direction = heroMoveFunction(game, helpers);
    } else {
      direction = enemyMoveFunction(game, helpers);
    }
    console.log('-----');
    console.log('Turns left: ' + turnsToPlay + ':');
    console.log('-----');
    console.log(hero.name + ' tried to move ' + direction);
    console.log(hero.name + ' owns ' + hero.mineCount + ' diamond mines')
    console.log(hero.name + ' has ' + hero.health + ' health')
    game.handleHeroTurn(direction);
    game.board.inspect();
    if(turnsToPlay-- > 0)
      playGame();
  }, 250);
}

playGame();
