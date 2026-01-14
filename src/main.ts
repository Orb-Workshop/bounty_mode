import { Instance as CSS } from "cs_script/point_script";
import {
    Base, Util,
} from "scriptedeuch";

import { BountySystem, BulletinBoard } from "./index";

// Register our Bounty System
Base.Mount.Register("Bounty", new BountySystem({
    // Used to hand out money to players, entity 'game_money'
    game_money_targetname: "bounty_mode.money",
}));

// Spawn T and CT Bulletin Board Actors, which listen to our BountySystem
// Prefab: `maps/prefabs/bounty_mode/bounty_mode_bulletin_board.vmap`
const bulletin_t = new BulletinBoard({
    target_name: "bounty_mode.bulletin_board_t",
    team_number: 2,
});

const bulletin_ct = new BulletinBoard({
    target_name: "bounty_mode.bulletin_board_ct",
    team_number: 3,
});

// Debugging, echo event messages.
//const echo = new Base.MessageTask((tag, data) => {
//    CSS.Msg(`${tag} - ${JSON.stringify(data)}`);
//});


// Reward Message from the Server.
function RewardMessage(killer_name: string, death_name: string, reward_amount: number) {
    return `${killer_name} received a $${reward_amount} bounty reward for killing ${death_name}!`;
}

// Listen for "BountyRewarded" event from the running BountySystem instance.
const rewardMessage = new Base.MessageTask((tag, data) => {
    if (tag !== BountySystem.MessageTag) return;
    const { event_name, event_data } = data;
    if (event_name !== "BountyRewarded") return;
    const { player_rewarded, player_killed, reward_amount } = event_data;
    const killer_name = Util.GetPlayerName(player_rewarded) ?? "N/A";
    const death_name = Util.GetPlayerName(player_killed) ?? "N/A";
    const reward_message = RewardMessage(killer_name, death_name, reward_amount);
    CSS.ServerCommand(`say ${reward_message}`);
});

// Trigger 'logic_relay' entities as BountySystem Events.
const Relay_BountyRewarded_targetname = "bounty_mode.relay_BountyRewarded";
const Relay_BountyListingUpdated_targetname = "bounty_mode.relay_BountyListingUpdated";

const relayMessenger = new Base.MessageTask((tag, data) => {
    if (tag !== BountySystem.MessageTag) return;
    const { event_name, event_data } = data;
    if (event_name == "BountyRewarded") {
        CSS.EntFireAtName({
            name: Relay_BountyRewarded_targetname,
            input: "Trigger",
            value: JSON.stringify(event_data), // TODO: serialize CSPlayerPawn, use player slot?
        });
    }
    else if (event_name == "BountyListingUpdated") {
        CSS.EntFireAtName({
            name: Relay_BountyListingUpdated_targetname,
            input: "Trigger",
            value: JSON.stringify(event_data),
        });
    }
});

// Go
Base.Mount.Start();
CSS.Msg("Bounty Mode!");
