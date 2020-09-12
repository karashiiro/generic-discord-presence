# Generic Discord Rich Presence
Discord Rich Presence everywhere!

## Features
 * Attention status based on game window focus
 * Second-precision playtime

## Installation
Clone the repo down to your plugins folder, and then just
```
npm i
npm run build
```
...and restart your client.

## Limitations
Naturally, something generic like this comes with certain limitations.
 * The caption under your name can only be set to "Playing a game"; setting this to the current game is not possible.
 * If you're using a plugin such as Show All Activities to see all of a user's statuses, the boring default presence will still be visible at the end of the list. This is related to the first limitation.