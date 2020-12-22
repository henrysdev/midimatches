# Progressions

Progressions is a browser-based online multiplayer game that aims to combine the joy of improvisational keyboard with the thrill of friendly competition.

The core game mechanic revolves around facing off with other musicians on creating short keyboard solos over beats.

## Game Mechanics

Quick Overview

- Round-based 1v1 keyboard duels.
- First player to 3 rounds wins game.
- 2 players selected to participate in duel each round.
- Participating players independently record keyboard solos over the same beat.
- Solos are anonymously labeled and played back for everyone in the game.
- Non-participating players vote on their favorite of the 2 recordings.
- Round winner determined by most votes.

TODO screenshots for each game view

### Game Start

At the beginning of every game, players in the room who wish to participate in the game must ready up by playing middle C on their keyboard. Once enough players have ready'd up, the first round of the game will begin.

### Round Start

Each round begins with the selection of 2 players from the game to participate in a keyboard duel. These players will be the ones whos keyboard solos are recorded and judged by the other players in the room. The background music loop that the solos will be played over is also randomly selected at this stage.

### Recording

The background music loop will play once fully through before recording begins. At this point, your keyboard's midi output will start recording. After 30 seconds, recording is stopped and the recording is saved by the server.

### Playback Voting

Recorded solos are presented anonymously to all players in the game. In a random order, each solo is each played back in its entirety. The voting period begins only after both samples have been fully played back.

During the voting period, independent playback of the samples as well as scrubbing through them is allowed. Once a player casts their vote, they cannot change it. The timeout for the voting is 1 minute. If an eligible voter has not cast their vote at the end of this time frame, their vote will be randomly cast.

Once all applicable players have cast votes, the winner of the round is presented. If the winner has won enough rounds to win the game, the game will progress to game end. Otherwise, the next round will start.

### Game End

The winner of the game is presented. After a 20 second timeout, the game resets back to game start.

## Installation

TODO

To start your Phoenix server:

- Install dependencies with `mix deps.get`
- Install Node.js dependencies with `npm install` inside the `assets` directory
- Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.
