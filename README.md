# ESIR-SR-PM
A simple distributed game

# How to use

## What you need

In order to launch this game, you need to have installed [NodeJS and NPM] (https://nodejs.org/en/).
In the root folder of the game, please use `npm install --save`

## Run the game

You can launch the game using the command `npm start`.

## Run the tests

### Unit tests

You can launch the unit tests using the command `npm test`.

### Integration tests

You can launch the integration tests using the command `npm run monkey`.

# Rules

## Entities

Blue : Player
Red : Virus
Green and purple : Sweet

An interaction occurs between entities when their body is more than 50% covered by another entity.

## Global rules

You are a player. Your goal is to eat sweet and avoid virus.

By default, a game last 5 minutes. However, it can be modified in the `config.js` file.
At the end of the timer (in the upper-right corner), the game ends, a new page appear with the leaderboard. 
This page stays for 20 seconds (can be modified in the `config.js` file) and the player with the best score win.
At the end of this timer, a new game start.

The score is a mass. The radius of the entities are determined using their mass.

## Sweet

A sweet has a default mass of 10 (can be modified in the `config.js` file).
When the game start, there is 400 sweets on the gameboard (can be modified in the `config.js` file).
When eated, a sweet immediately respawn at a random location and give his mass to the player who eated him.
A sweet can be normal but has a 5% chance (can be modified in the `config.js` file) to be special.
A special sweet can have 4 different powers.

1. The first power is a super sweet which gives 10 times more than the normal sweet mass.
2. The second power is a speed boost which multiply the player base speed by 3 for 5 seconds (not combinable).
3. The third power is to teleport away virus that target you (or random virus in case tracking is disabled).
4. The fourth power is make you smaller and vulnerable (with a mass of 10), but after 8 seconds, if you survived, you will be rewarded. In fact, you will regain your previous mass and you will earn 25% of your mass.

When a player join the game, he will create 400 more sweets (can be modified in the `config.js` file). At his disconnection, the same number of sweets will disappear.

## Virus

A virus has a default mass of 10 (can be modified in the `config.js` file).
When the game start, there is 0 virus on the gameboard.
A virus cannot spawn on players.

If the option is on (can be modified in the `config.js` file), the virus will target a random player.
This target will change every 20 seconds or when the target disconnect.

When eated, a virus immediately respawn at a random location and reduce the mass of the player who eated him.
The calculation of the mass lost is the following : 
If the player mass is ten time superior to the virus mass, the player mass will be decreased by 10%.
Otherwise, the player mass will be decreased by the virus mass.

When a player join the game, he will create 5 virus (can be modified in the `config.js` file). At his disconnection, the same number of virus will disappear.

## Player

A player has a default mass of 10 (can be modified in the `config.js` file).
A player can move using z-q-s-d keys.
A player can eat food and virus and cannot spawn on other players or virus.
If a player interact with another player, the one with the bigger mass will eat the other one and gain his mass.

If the player mass falls bellow his default mass or if the player is eated, the player died.
The player will respawn after 7 seconds (can be modified in the `config.js` file).

# Remember 

![Have fun !](https://media.giphy.com/media/xT77XPbvrQgE58pSta/giphy.gif)
