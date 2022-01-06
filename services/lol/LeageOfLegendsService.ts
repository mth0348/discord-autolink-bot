import { LolRolePreference } from '../../domain/models/lol/LolRolePreference';
import { LolRoleAssignment } from '../../dtos/lol/LolRoleAssignment';
import { LolRoleCount } from '../../dtos/lol/LolRoleCount';
import { LolCommandParser } from '../../parsers/LolCommandParser';
import { LolRoleChance } from '../../dtos/lol/LolRoleChance';
import { Random } from '../../helpers/Random';

export class LeageOfLegendsService {

    public static PIMARY_ROLE_CHANCE: number = 80;
    public static SECONDARY_ROLE_CHANCE: number = 20;

    public determineRoles(preferences: LolRolePreference[]) {
        let roleCounts: LolRoleCount[] = [];

        LolCommandParser.LOL_ROLES.forEach((r, i) => roleCounts[i] = new LolRoleCount(r));

        preferences.forEach(rolePreference => {
            roleCounts.find(r => r.role === rolePreference.primaryRole).primaries++;
            roleCounts.find(r => r.role === rolePreference.secondaryRole).secondaries++;
        });

        roleCounts = roleCounts.sort(this.sortDescendingByRoleCount);

        let roleAssignments = this.assignRole(roleCounts.map(r => r.role), [...preferences], []);

        console.log(roleAssignments);

        return roleAssignments;
    }

    private assignRole(roles: string[], remainingPreferences: LolRolePreference[], assignments: LolRoleAssignment[]): LolRoleAssignment[] {
        const role = roles[0];
        let participants: LolRoleChance[] = [];

        // gather participants for roll.
        remainingPreferences.forEach(rolePreference => {
            if (rolePreference.primaryRole === role) {
                participants.push(new LolRoleChance(rolePreference.playerId, LeageOfLegendsService.PIMARY_ROLE_CHANCE));
            }
            else if (rolePreference.secondaryRole === role) {
                participants.push(new LolRoleChance(rolePreference.playerId, LeageOfLegendsService.SECONDARY_ROLE_CHANCE));
            }
        });

        // determine winner.
        let winner = new LolRoleAssignment();
        let winnerIndex = -1;

        if (participants.length === 0) {
            // assign role randomly if no one is interested.
            const unluckyWinner = Random.next(0, remainingPreferences.length - 1);
            winnerIndex = unluckyWinner;
            winner.playerId = remainingPreferences[unluckyWinner].playerId;
            winner.role = role;
            assignments.push(winner);

        } else {

            // assign role with a fair roll.
            const minValue = 1;
            const maxValue = participants.map(a => a.chance).reduce((a, b) => a + b);
            const roll = Random.next(minValue, maxValue);

            // pull winner from participants.
            let totalChance = 0;
            participants.forEach(participant => {
                if (roll > totalChance && roll <= totalChance + participant.chance) {
                    winnerIndex = remainingPreferences.findIndex(r => r.playerId === participant.playerId);
                    winner.playerId = participant.playerId;
                    winner.role = role;
                    assignments.push(winner);
                }
                totalChance += participant.chance;
            });
        }

        // cleanup and go to next role.
        roles.splice(0, 1);
        remainingPreferences.splice(winnerIndex, 1);

        if (roles.length === 0) {
            return assignments;
        } else {
            return this.assignRole(roles, remainingPreferences, assignments);
        }
    }

    private sortDescendingByRoleCount(a: LolRoleCount, b: LolRoleCount): number {
        if (a.primaries > b.primaries) {
            return -1;
        } else if (a.primaries < b.primaries) {
            return 1;
        }
        if (a.secondaries > b.secondaries) {
            return -1;
        } else if (a.secondaries < b.secondaries) {
            return 1;
        } else {
            return 0;
        }
    }
}
