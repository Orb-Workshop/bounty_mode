# Bounty Mode

**Bounty Mode**, is a drop-in Counter-Strike 2 Script and Library for
  player bounties in defusal and hostages maps.

Any players who kill two or more players while not dying will have a
bounty placed on their head in the next round. Players who kill
someone who has a bounty will be given a cash reward.

Cash Reward Denominations

- 2 Kills, $50 Reward
- 3 Kills, $100 Reward
- 4 Kills, $200 Reward
- 5 Kills, $400 Reward
- N Kills, $50 * 2 ^ (N-2)

## Installation

- Download [Latest Release](https://github.com/Orb-Workshop/scriptedeuch/releases)

- Extract bounty_mode.zip and copy the folder structure over your cs2 project folder

- Import Prefab ./maps/prefabs/bounty_mode/bounty_mode_root.vmap
  - MAKE SURE 'Fixup Entity Names' is turned **off**
  - OR Collapse the `bounty_mode_root.vmap` prefab

- Compile your map and run!

Be sure to decorate the bounty_mode prefabs to match your maps theme!

Enjoy!

## References

- [Bun](https://bun.com/)

- [CS2 Scripting API](https://developer.valvesoftware.com/wiki/Counter-Strike_2_Workshop_Tools/Scripting_API)

- [bundledeuch](https://github.com/Orb-Workshop/bundledeuch)

- [scriptedeuch](https://github.com/Orb-Workshop/scriptedeuch)