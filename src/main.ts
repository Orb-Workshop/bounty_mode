import { Instance as CSS } from "cs_script/point_script";
import {
    Base,
} from "scriptedeuch";

import { BountySystem, BulletinBoard } from "./index";


// Register our Bounty System
Base.Mount.Register("Bounty", new BountySystem({
    game_money_targetname: "bounty_mode.money",
}));

// Spawn T and CT Bulletin Board Actors, which listen to our BountySystem
const bulletin_t = new BulletinBoard({
    target_name: "bounty_mode.bulletin_board_t",
    team_number: 2,
});

const bulletin_ct = new BulletinBoard({
    target_name: "bounty_mode.bulletin_board_ct",
    team_number: 3,
});

// Debugging, echo event messages.
//const echo = new Base.MessageTask((key, data) => {
//    CSS.Msg(`${key} - ${JSON.stringify(data)}`);
//});

// Go
Base.Mount.Start();
CSS.Msg("Bounty Mode!");
