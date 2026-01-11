import {
    Instance as CSS,
    CSPlayerPawn,
} from "cs_script/point_script";
import {
    Base, Util,
} from "scriptedeuch";

export interface BountyEntry {
    player_name: string;
    reward: number;
    team_number: number;
}


function RewardFunction(kills: number): number {
    if (kills < 2) return 0;
    return 50 * Math.pow(2, kills-2);
}


type PlayerMap = Map<CSPlayerPawn, number>;
export class BountySystem extends Base.System {
    static MessageTag = "BountySystem_MessageTag";
    private player_kill_mapping: PlayerMap = new Map();
    private player_bounty_mapping: PlayerMap = new Map();
    private game_money_targetname: string;
    private reward_function: (number) => number;
    
    constructor({
        game_money_targetname = "bounty_mode.money",
        reward_function = RewardFunction,
    }) {
        super();
        this.game_money_targetname = game_money_targetname;
        this.reward_function = reward_function;
    }

    /** Send Event Messages through the Actor System */
    private SendMessage(event_name: string, event_data: any) {
        Base.Actor.SendMessage(BountySystem.MessageTag, { event_name, event_data });
    }
    
    private recordKill(player_pawn: CSPlayerPawn) {
        if (!this.player_kill_mapping.has(player_pawn))
            this.player_kill_mapping.set(player_pawn, 0);
        const num_kills = this.player_kill_mapping.get(player_pawn);
        this.player_kill_mapping.set(player_pawn, num_kills+1);
    }

    private recordDeath(player_pawn: CSPlayerPawn) {
        this.player_kill_mapping.set(player_pawn, 0);
        this.player_bounty_mapping.set(player_pawn, 0);
    }
    
    /** Sorted List of bounties by player name */
    private generateBountyListing(): Array<BountyEntry> {
        const bounty_listing = [];

        // Generate a bounty listing from our kill stats
        this.player_kill_mapping.forEach((kills: number, player_pawn: CSPlayerPawn) => {
            if (!player_pawn.IsValid()) return;
            const player_name = Util.GetPlayerName(player_pawn);
            const team_number = player_pawn?.GetTeamNumber();
            const reward = this.reward_function(kills);
            bounty_listing.push({ player_name, reward, team_number });
        });

        // Do a shallow copy of our player kill mapped stats into our bounty mapping.
        this.player_bounty_mapping = new Map(this.player_kill_mapping);
        
        // Sort our bounties, descending. Remove entries with no reward.
        return bounty_listing
            .sort((a, b) => b.reward - a.reward)
            .filter(bounty => bounty.reward > 0);

    }

    private GetPlayerBountyReward(player_pawn: CSPlayerPawn): number {
        const kills = this.player_bounty_mapping.get(player_pawn) ?? 0;
        return this.reward_function(kills);
    }
    
    private EventBountyListingUpdated(bounty_listing: Array<BountyEntry>) {
        this.SendMessage("BountyListingUpdated", bounty_listing);
    }

    private EventBountyRewarded(event_data) {
        this.SendMessage("BountyRewarded", event_data);
    }

    private GiveMoney(player_pawn: CSPlayerPawn, money: number) {
        if (money <= 0) return;
        
        const player_name = Util.GetPlayerName(player_pawn);
        const game_money_entity = CSS.FindEntityByName(this.game_money_targetname);
        if (game_money_entity.GetClassName() !== "game_money") {
            CSS.Msg(`Failed to find 'game_money' Entity with targetname '${this.game_money_targetname}'`);
            return;
        }
        CSS.EntFireAtTarget({
            target: game_money_entity,
            input: "SetMoneyAmount",
            value: money,
        });
        CSS.EntFireAtTarget({
            target: game_money_entity,
            activator: player_pawn,
            input: "AddMoneyPlayer",
            delay: 0.1,
        });
    }
    
    override OnPlayerKill(event) {
        const player_killer = event.attacker; // killer
        const player_death = event.player;    // deadman
        if (!(player_killer instanceof CSPlayerPawn)) return;
        if (!(player_death instanceof CSPlayerPawn)) return;
        if (!player_killer.IsValid() || !player_death.IsValid()) return;
        
        // Don't record kills or deaths if they're teammates
        if (player_killer.GetTeamNumber() === player_death.GetTeamNumber()) return;
        
        // Give the killer the bounty reward, and fire an actor message event
        const reward_money = this.GetPlayerBountyReward(player_death);
        if (reward_money > 0) {
            this.GiveMoney(player_killer, reward_money);
            this.EventBountyRewarded({
                player_rewarded: player_killer,
                player_killed: player_death,
                reward_amount: reward_money,
            });
        }
            
        // 
        this.recordKill(player_killer);
        this.recordDeath(player_death);
    }

    override OnRoundStart() {
        const bounty_listing = this.generateBountyListing();
        this.EventBountyListingUpdated(bounty_listing);
    }
}
