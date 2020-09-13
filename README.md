# Generic Discord Rich Presence
Discord Rich Presence everywhere!

## Features
 * Attention status based on game window focus
 * Second-precision playtime
 * Steam profile scraping to provide more details for games launched through Steam (requires connecting your Steam account and making your status public)

## Installation
Clone the repo down to your plugins folder, and then just
```
npm rptime
```
...and restart your client.

## Limitations
Naturally, something generic like this comes with certain limitations.
 * If you're playing an unverified game, the caption under your name can only be set to "Playing a game"; setting this to the current game is not possible in these cases.
 * If you're using a plugin such as Show All Activities to see all of a user's statuses, the boring default presence will still be visible at the end of the list. This is related to the first limitation.