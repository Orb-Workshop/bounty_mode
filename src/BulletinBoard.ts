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
        this.team_number = team_number;
    }

    private handleEvent_BountyListingUpdated(bounty_listing: Array<BountyEntry>) {
        // Filter out for our team
        const board = bounty_listing.filter((entry) => entry.team_number == this.team_number);
        
        // Retrieve only the first five
        this.board = board.slice(0, 5);
        this.UpdateBoard();
    }

    private handleEvent_BountyRewarded({player_rewarded, reward_amount, player_killed}) {
        const player_name = Util.GetPlayerName(player_rewarded);
        const player_dead_name = Util.GetPlayerName(player_killed);
        CSS.ServerCommand(`say Rewarded ${player_name} with $${reward_amount} for killing ${player_dead_name}`);
    }

    private MarkBulletin() {

    }
    
    private ClearBoardEntries() {
        
    }
    
    private UpdateBoard() {
        CSS.Msg(this.team_number == 2 ? "T" : "CT");
        for (const bullet of this.board) {
            const {
                player_name, reward, team_number,
            } = bullet;
            CSS.Msg(`${player_name} - ${reward}`);
        }
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
