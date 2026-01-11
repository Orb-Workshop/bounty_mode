import { Instance as CSS } from "cs_script/point_script";
import {
    Base,
} from "scriptedeuch";

import { BountySystem, BulletinBoard } from "./index";
Base.Mount.Register("Bounty", new BountySystem({
    
}));

// Spawn some BulletinBoard Actors
const bulletin_t = new BulletinBoard({
    target_name: "bounty_mode.bulletin_t",
    team_number: 2,
});

const bulletin_ct = new BulletinBoard({
    target_name: "bounty_mode.bulletin_ct",
    team_number: 3,
});

const echo = new Base.MessageTask((key, data) => {
    data = JSON.stringify(data);
    CSS.Msg(`${key} - ${data}`);
});



Base.Mount.Start();
CSS.Msg("Bounty Mode!");
