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

var stats = [];
var deaths = 0;
var wins = 0;
var damageDone = 0;
var gravesRobbed = 0;
var mineCount = 0;
var minesCaptured = 0;
var diamondsEarned = 0;
var healthRecovered = 0;
var healthGiven = 0;

var myHero;

//Get my hero's move function ("brain")
var heroMoveFunction = require('./hero.js');

var moveNames = ['aggressor', 'healthNut',
  'blindMan', 'priest', 'unwiseAssassin', 'carefulAssassin', 'safeDiamondMiner',
  'selfishDiamondMiner'];

//The move function ("brain") the practice enemy will use
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

//Makes a new game board
var game;

var createGame = function(){
  game = new Game(12);

  var spaces = [];

  for(var i = 0; i < 12; ++i)
    for(var j = 0; j < 12; ++j)
      spaces.push({x: i, y: j});

  var shuffle = function(o){ //v1.0
      for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
  };

  spaces = shuffle(spaces);

  var getNorthSpace = function(){
    space = spaces.pop();
    if(space.x > 5){
      spaces.push(space);
      space = spaces.pop();
      return getNorthSpace();
    } else {
      return space;
    }
  }

  var getSouthSpace = function(){
    space = spaces.pop();
    if(space.x < 6){
      spaces.push(space);
      space = spaces.pop();
      return getSouthSpace();
    } else {
      return space;
    }
  }

  var addHealthWells = function(min,max){
    if(min == undefined)
      min = 5;
    if(max == undefined)
      max = 5;
    for(var i = Math.floor((Math.random() * max) + min); i > 0; --i){
      space = spaces.pop();
      game.addHealthWell(space.x,space.y);
    }
  }

  var addMines = function(min,max){
    if(min == undefined)
      min = 5;
    if(max == undefined)
      max = 5;
    for(var i = Math.floor((Math.random() * max) + min); i > 0; --i){
      space = spaces.pop();
      game.addDiamondMine(space.x,space.y);
    }
  }

  var addEnemies = function(min,max){
    if(min == undefined)
      min = 10;
    if(max == undefined)
      max = 12;
    for(var i = Math.floor((Math.random() * max) + min); i > 0; --i){
      space = getSouthSpace();
      moveName = moveNames[Math.floor(Math.random() * moveNames.length)];
      game.addHero(space.x,space.y, moveName, 1);
    }
  }

  var addAllies = function(min,max){
    if(min == undefined)
      min = 9;
    if(max == undefined)
      max = 11;
    for(var i = Math.floor((Math.random() * max) + min); i > 0; --i){
      space = getNorthSpace();
      moveName = moveNames[Math.floor(Math.random() * moveNames.length)];
      game.addHero(space.x,space.y, moveName, 0);
    }
  }

  var addImpassables = function(min,max){
    if(min == undefined)
      min = 6;
    if(max == undefined)
      max = 10;
    for(var i = Math.floor((Math.random() * max) + min); i > 0; --i){
      space = spaces.pop();
      game.addImpassable(space.x,space.y);
    }
  }

  addHealthWells();
  addMines();
  addAllies();
  addEnemies();
  addImpassables();

  //Add your hero
  space = getNorthSpace();
  game.addHero(space.x,space.y, 'MyHero', 0);

  //console.log('About to start the game!  Here is what the board looks like:');
  //You can run game.board.inspect() in this test code at any time
  //to log out the current state of the board (keep in mind that in the actual
  //game, the game object will not have any functions on it)
  //game.board.inspect();
}


var playGame = function(turnsToPlay){
//console.log(JSON.stringify(game.heroes, null, 2));
  //game.board.inspect();
  if(turnsToPlay > 0){
    var hero = game.activeHero;
    var direction;
    if (hero.name == 'MyHero') {
      //Ask your hero brain which way it wants to move
      direction = heroMoveFunction(game, helpers);
      if(hero.dead == true)
        turnsToPlay = 0;
    } else {
      //console.log(JSON.stringify(hero, null, 2));
      direction = moves[hero.name](game, helpers);
    }
    game.handleHeroTurn(direction);
    playGame(turnsToPlay-1);
  } else {
    game.heroes.forEach(function(gameHero) {
      //console.log(JSON.stringify(gameHero, null, 2));
      if(gameHero.name == 'MyHero'){
        if(gameHero.dead === true)
          deaths += 1;
        if(gameHero.won === true)
          wins += 1;
        damageDone += gameHero.damageDone;
        gravesRobbed += gameHero.gravesRobbed;
        mineCount += gameHero.mineCount;
        minesCaptured += gameHero.minesCaptured;
        diamondsEarned += gameHero.diamondsEarned;
        healthRecovered += gameHero.healthRecovered;
        healthGiven += gameHero.healthGiven;
      }
    });
  }
}

var numGames = 1000;
for(i=0;i<numGames;++i){
  if(i%10 == 0)
    console.log(i/numGames*100 + "% done: be patient!");
  createGame();
  playGame(1250);
}

console.log('games: ' + numGames);
console.log("Deaths: " + deaths/numGames*100 +"%");
console.log("Wins: " + wins/numGames*100 + "%");
console.log("damageDone avg: " + damageDone/numGames);
console.log("gravesRobbed avg: " + gravesRobbed/numGames);
console.log("mineCount avg: " + mineCount/numGames);
console.log("diamondsEarned avg: " + diamondsEarned/numGames);
console.log("healthRecovered avg: " + healthRecovered/numGames);
console.log("healthGiven avg: " + healthGiven/numGames);
