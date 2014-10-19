/*

  Strategies for the hero are contained within the "moves" object as
  name-value pairs, like so:

    //...
    ambusher : function(gamedData, helpers){
      // implementation of strategy.
    },
    heWhoLivesToFightAnotherDay: function(gamedData, helpers){
      // implementation of strategy.
    },
    //...other strategy definitions.

  The "moves" object only contains the data, but in order for a specific
  strategy to be implemented we MUST set the "move" variable to a
  definite property.  This is done like so:

  move = moves.heWhoLivesToFightAnotherDay;

  You MUST also export the move function, in order for your code to run
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

  Such is the power of Javascript!!!

*/

// Strategy definitions
var moves = {
  // Aggressor
  aggressor: function(gameData, helpers) {
    // Here, we ask if your hero's health is below 30
    if (gameData.activeHero.health <= 30){
      // If it is, head towards the nearest health well
      return helpers.findNearestHealthWell(gameData);
    } else {
      // Otherwise, go attack someone...anyone.
      return helpers.findNearestEnemy(gameData);
    }
  },

  // Health Nut
  healthNut:  function(gameData, helpers) {
    // Here, we ask if your hero's health is below 75
    if (gameData.activeHero.health <= 75){
      // If it is, head towards the nearest health well
      return helpers.findNearestHealthWell(gameData);
    } else {
      // Otherwise, go mine some diamonds!!!
      return helpers.findNearestNonTeamDiamondMine(gameData);
    }
  },

  // Balanced
  balanced: function(gameData, helpers){
    //FIXME : fix;
    return null;
  },

  // The "Northerner"
  // This hero will walk North.  Always.
  northener : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    return 'North';
  },

  // The "Blind Man"
  // This hero will walk in a random direction each turn.
  blindMan : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    var choices = ['North', 'South', 'East', 'West'];
    return choices[Math.floor(Math.random()*4)];
  },

  // The "Priest"
  // This hero will heal nearby friendly champions.
  priest : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 60) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestTeamMember(gameData);
    }
  },

  // The "Unwise Assassin"
  // This hero will attempt to kill the closest enemy hero. No matter what.
  unwiseAssassin : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 30) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestEnemy(gameData);
    }
  },

  // The "Careful Assassin"
  // This hero will attempt to kill the closest weaker enemy hero.
  carefulAssassin : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 50) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestWeakerEnemy(gameData);
    }
  },

  // The "Safe Diamond Miner"
  // This hero will attempt to capture enemy diamond mines.
  safeDiamondMiner : function(gameData, helpers) {
    var myHero = gameData.activeHero;

    //Get stats on the nearest health well
    var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
      if (boardTile.type === 'HealthWell') {
        return true;
      }
    });
    var distanceToHealthWell = healthWellStats.distance;
    var directionToHealthWell = healthWellStats.direction;

    if (myHero.health < 40) {
      //Heal no matter what if low health
      return directionToHealthWell;
    } else if (myHero.health < 100 && distanceToHealthWell === 1) {
      //Heal if you aren't full health and are close to a health well already
      return directionToHealthWell;
    } else {
      //If healthy, go capture a diamond mine!
      return helpers.findNearestNonTeamDiamondMine(gameData);
    }
  },

  // The "Selfish Diamond Miner"
  // This hero will attempt to capture diamond mines (even those owned by teammates).
  selfishDiamondMiner :function(gameData, helpers) {
    var myHero = gameData.activeHero;

    //Get stats on the nearest health well
    var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
      if (boardTile.type === 'HealthWell') {
        return true;
      }
    });

    var distanceToHealthWell = healthWellStats.distance;
    var directionToHealthWell = healthWellStats.direction;

    if (myHero.health < 40) {
      //Heal no matter what if low health
      return directionToHealthWell;
    } else if (myHero.health < 100 && distanceToHealthWell === 1) {
      //Heal if you aren't full health and are close to a health well already
      return directionToHealthWell;
    } else {
      //If healthy, go capture a diamond mine!
      return helpers.findNearestUnownedDiamondMine(gameData);
    }
  },

  // The "Coward"
  // This hero will try really hard not to die.
  coward : function(gameData, helpers) {
    return helpers.findNearestHealthWell(gameData);
  }
 };

var greeting = 'greetings, friends\n';
var kill = null;

// // The "Safe Diamond Miner"
var move = function(gameData, helpers) {
  var littleSelbyK = gameData.activeHero;

  //console.log(greeting);

  //if(kill!=null)
    //console.log("I'm going to kill " + kill);

  /* Intuition */
  var intuition = {
    stay: 0,
    north: 0,
    south: 0,
    east: 0,
    west: 0
  };

  var fightingIntuition = {
    stay: 0,
    north: 0,
    south: 0,
    east: 0,
    west: 0
  };

  var learn = function(direction, goodnessNumber){
    goodnessNumber = gameData.board.lengthOfSide/goodnessNumber;
    if(goodnessNumber < 0){
      goodnessNumber = -1*goodnessNumber;
      if(direction != 'North')
        learn('North', goodnessNumber);
      if(direction != 'South')
        learn('South', goodnessNumber);
      if(direction != 'East')
        learn('East', goodnessNumber);
      if(direction != 'West')
        learn('West', goodnessNumber);
      if(direction != 'Stay')
        learn('Stay', goodnessNumber);
      return;
    }
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
        var choices = ['North', 'South', 'East', 'West'];
        learn(choices[Math.floor(Math.random()*4)], goodnessNumber);
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
      bestDirection = moves.blindMan();
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

    //console.log('I think the best direction to go is' + bestDirection);
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

  var enemyDistance = enemyStats.distance === undefined ? 9999 : enemyStats.distance;
  var enemyDirection = enemyStats.direction === undefined ? 'Stay' : enemyStats.direction;
  var enemyHealth = enemyStats.health === undefined ? 100 : enemyStats.health;

  //console.log("Enemy is " + enemyStats.distance + " " + enemyStats.direction);

  var strongerEnemyStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, littleSelbyK, function(boardTile) {
    if (boardTile.type === 'Hero' && boardTile.team != littleSelbyK.team && boardTile.health > littleSelbyK.health) {
      return true;
    }
  });

  var strongerEnemyDistance = strongerEnemyStats.distance === undefined ? 9999 : strongerEnemyStats.distance;
  var strongerEnemyDirection = strongerEnemyStats.direction === undefined ? 'Stay' : strongerEnemyStats.direction;

  //console.log("Stronger enemy is " + strongerEnemyStats.distance + " " + strongerEnemyStats.direction);

  var weakerEnemyStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, littleSelbyK, function(boardTile) {
    if (boardTile.type === 'Hero' && boardTile.team != littleSelbyK.team && boardTile.health <= littleSelbyK.health) {
      return true;
    }
  });

  var weakerEnemyDistance = weakerEnemyStats.distance === undefined ? 9999 : weakerEnemyStats.distance;
  var weakerEnemyDirection = weakerEnemyStats.direction === undefined ? 'Stay' : weakerEnemyStats.direction;

  //console.log("Weaker enemy is " + weakerEnemyStats.distance + " " + weakerEnemyStats.direction);

  //Get stats on the nearest health well
  var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, littleSelbyK, function(boardTile) {
    if (boardTile.type === 'HealthWell') {
      return true;
    }
  });

  var healthWellDistance = healthWellStats.distance === undefined ? 9999 : healthWellStats.distance;
  var healthWellDirection = healthWellStats.direction === undefined ? 'Stay' : healthWellStats.direction;
  //console.log("I can find a health well " + healthWellDistance + " units " + healthWellDirection);

  var teamStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, littleSelbyK, function(boardTile) {
    if (boardTile.type === 'Hero' && boardTile.team == littleSelbyK.team) {
      return true;
    }
  });
  var teamMemberDistance = teamStats.distance === undefined ? 9999 : teamStats.distance;
  var teamMemberDirection = teamStats.direction === undefined ? 'Stay' : teamStats.direction;
  var teamMemberHealth = teamStats.health === undefined ? 100 : teamStats.health;
  //console.log("My nearest ally is " + teamMemberDistance + " units " + teamMemberDirection);

  var mineStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, littleSelbyK, function(boardTile) {
    if (boardTile.type === 'DiamondMine') {
      if (boardTile.owner && boardTile.owner.id === littleSelbyK.id) {
        return false;
      } else {
        return true;
      }
    }
  });

  var mineDistance = mineStats.distance === undefined ? 9999 : mineStats.distance;
  var mineDirection = mineStats.direction === undefined ? 'Stay' : mineStats.direction;

  //console.log("There is a mine at " + mineDistance + " " + mineDirection);

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
  //console.log("There is an unowned mine at " + unownedMineDistance + " " + unownedMineDirection);


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

  console.log(JSON.stringify(littleSelbyK, null, 2));

  /* Instinct */
  // Fill to 100 when near health well

  if(littleSelbyK.health < 100 && ( healthWellDistance < 3))
    return healthWellDirection;
  if(littleSelbyK.health === 100 && healthWellDistance < 5 && enemyDistance < 3 && teamMemberDistance > 1){
    learn(enemyDirection, -0.025);
    learn(healthWellDirection, -0.025);
  }
  if(enemyDistance === 1){
    learn(enemyDirection, 0.025);
  }
  if(enemyHealth < littleSelbyK.health && enemyDistance <= 2)
    learn(enemyDirection, 0.025);
  if(littleSelbyK.health >= 60 && teamMemberHealth <= 80 && teamMemberDistance === 1)
    return teamMemberDirection;
  if(teamMemberDistance === 1 && enemyDistance <= 2)
    learn(enemyDirection, 0.025);
  if(enemyDistance > 3 && littleSelbyK.health > 70 && unownedMineDistance === 1)
    learn(unownedMineDirection, -0.025);

  if(littleSelbyK.health <= 60 && strongerEnemyDirection == healthWellDirection && strongerEnemyDistance <= healthWellDistance){
    learn(opposite(strongerEnemyDirection), 0.25*strongerEnemyDistance);
    learn(weakerEnemyDirection, -0.5*weakerEnemyDistance);
  }

  if(littleSelbyK.health === 100){
    if(teamMemberDistance === 1)
      learn(teamMemberDirection, -0.25);
    if(healthWellDistance === 1){
      learn(healthWellDirection, -0.25);
      if(enemyDistance === 1)
        learn(enemyDirection, -0.5);
    }
    learn(weakerEnemyDirection, 0.5);
    learn(unownedMineDirection, 0.5);
    learn(nonTeamMineDirection, 0.25);
  }

  if(strongerEnemyDistance <= 3 && weakerEnemyDistance <= 3){
    learn(healthWellDirection, 0.07*healthWellDistance);
    learn(teamMemberDirection, 0.25*teamMemberDistance);
  }
  if(littleSelbyK.health < 100 ){
    learn(healthWellDirection, 0.07*healthWellDistance);
    learn(teamMemberDirection, 0.25*teamMemberDistance);
  }
  if(littleSelbyK.health < 90){
    learn(healthWellDirection, 0.05*healthWellDistance);
    learn(teamMemberDirection, 0.5*teamMemberDistance);
  }
  learn(healthWellDirection, 1);
  learn(nonTeamMineDirection, 0.25);

  if(strongerEnemyDistance < 4)
    learn(strongerEnemyDirection, -0.1);
  if(enemyDistance < 4)
    learn(enemyDirection, -0.1);
  if(weakerEnemyDistance < 4)
      learn(weakerEnemyDirection, 0.1);
  if(enemyDistance < 3)
    learn(enemyDirection, 0.5);
  if(weakerEnemyDistance < 3)
    learn(weakerEnemyDirection, 0.1);
  if(littleSelbyK.health > 70){
    learn(nonTeamMineDirection, 0.07*nonTeamMineDistance/2);
    learn(unownedMineDirection, 0.2*unownedMineDistance/2);
    learn(mineDirection, -0.25);
  }

  return withTheWind();
}

  // Don't do things that will kill you
/*
  var learnCommonSense = function(){
    if(littleSelbyK.health < 60)
      learn(healthWellDirection, 0.25);
    if(strongerEnemyDistance === 3)
      learn(strongerEnemyDirection, -0.25);
    if(weakerEnemyDistance === 1)
      learn(weakerEnemyDirection, 0.5);
    if(enemyDistance === 2 && (strongerEnemyDistance < 3 || weakerEnemyDistance < 3 || healingWellDistance < 2)){
      learn(enemyDirection, -0.5);
      learn(weakerEnemyDirection, -0.5);
      learn(strongerEnemyDirection, -0.5);
      learn(weakerEnemyDirection, -0.5);
      learn(healthWellDirection, 0.25);
    }
    if(enemyDistance === 1)
      learn(enemyDirection, 0.5);
    if(healthWellDistance < 2 && enemyDistance < 2)
      learn(enemyDirection, -1*0.5);
    learn(weakerEnemyDirection, weakerEnemyDistance);
    learn(healthWellDirection, healthWellDistance);
    learn(teamMemberDirection, 2*teamMemberDistance);
  };

  var learnFighting = function(){
    if(weakerEnemyDistance < 3)
      learn(weakerEnemyDirection, weakerEnemyDistance/3);
  };

  var learnEcon = function(){
    learn(unownedMineDirection, 1);
    learn(nonTeamMineDirection, 1);
  };

  var learnSurvival = function(){
    learn(healthWellDirection, 0.5);
    learn(teamMemberDirection, teamMemberDistance/2);
    if(enemyDistance === 2 || enemyDistance === 1)
      learn(enemyDirection, -1*enemyDistance);
    if(enemyDistance === 1)
      learn(enemyDirection, 0.5);
    else
      learn(strongerEnemyDirection, -1*strongerEnemyDistance);
  };

  learnCommonSense();

  if(littleSelbyK.health > 60){
    learnFighting();
    learnEcon();
  } else
    learnSurvival();*/


//  Set our heros strategy
//var  move =  moves.aggressor;

// Export the move function here
module.exports = move;
