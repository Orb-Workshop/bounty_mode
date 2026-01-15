import { Instance as CSS } from "cs_script/point_script";
import { Base, Util } from "scriptedeuch";
import { BountySystem, BountyEntry } from "./BountySystem";

const TEAM_NUMBER_T = 2;
const TEAM_NUMBER_CT = 3;

/** Represents a View into the BountySystem */
export class BulletinBoard extends Base.Actor {
    private target_name: string;
    private team_number: number;
    private board: Array<BountyEntry> = [];
    
    constructor({
        target_name,
        team_number,
    }) {
        super();
        this.target_name = target_name;
        this.team_number = team_number;
        this.ClearBoard();
    }

    private handleEvent_BountyListingUpdated(bounty_listing: Array<BountyEntry>) {
        // Filter out for our team
        const board = bounty_listing.filter((entry) => entry.team_number != this.team_number);
        
        // Retrieve only the first five
        this.board = board.slice(0, 5);
        this.UpdateBoard();
    }

    private handleEvent_BountyRewarded({player_rewarded, reward_amount, player_killed}) {
        //const player_name = Util.GetPlayerName(player_rewarded);
        //const player_dead_name = Util.GetPlayerName(player_killed);
        //CSS.Msg(`Rewarded ${player_name} with $${reward_amount} for killing ${player_dead_name}`);
    }
    
    private ClearBoard() {
        for (let i = 0; i < 5; i++) {
            const bulletin_target_name = this.target_name + "_bulletin_" + i;
            const label_wanted = bulletin_target_name + "_label.wanted";
            const label_player_name = bulletin_target_name + "_label.player_name";
            const label_reward = bulletin_target_name + "_label.reward";
            const label_money = bulletin_target_name + "_label.money";
            const label_paper = bulletin_target_name + "_paper";

            const clearLabel = (name) => CSS.EntFireAtName({name, input: "SetMessage", value: ""});
            clearLabel(label_wanted);
            clearLabel(label_player_name);
            clearLabel(label_reward);
            clearLabel(label_money);
            CSS.EntFireAtName({name: label_paper, input: "Disable"});
        }
    }
    
    private UpdateBoard() {
        this.ClearBoard();
        this.board.forEach((bullet, idx) => {
            const {
                player_name, reward, team_number,
            } = bullet;
            
            const bulletin_target_name = this.target_name + "_bulletin_" + idx;
            const label_wanted = bulletin_target_name + "_label.wanted";
            const label_player_name = bulletin_target_name + "_label.player_name";
            const label_reward = bulletin_target_name + "_label.reward";
            const label_money = bulletin_target_name + "_label.money";
            const label_paper = bulletin_target_name + "_paper";
            
            const setLabel = (name, value) => CSS.EntFireAtName({name, input: "SetMessage", value});
            setLabel(label_wanted, "Wanted");
            setLabel(label_player_name, player_name.substr(0, 8));
            setLabel(label_reward, "Reward");
            setLabel(label_money, "$" + reward);
            CSS.EntFireAtName({name: label_paper, input: "Enable"});
        });
    }
    
    override ReceiveMessage(tag: string, data: any): void {
        if (tag !== BountySystem.MessageTag) return;
        const { event_name, event_data } = data;
        switch(event_name) {
            case "BountyListingUpdated":
                this.handleEvent_BountyListingUpdated(event_data);
                return;
            case "BountyRewarded":
                this.handleEvent_BountyRewarded(event_data);
                return;
        }
    }
}
