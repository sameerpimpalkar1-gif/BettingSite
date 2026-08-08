import { Bet, User } from './db.js';

/**
 * Returns the color category for a given number (0-9).
 * @param {number} num
 * @returns {'green'|'red'|'violet'}
 */
export function getColor(num) {
    if ([1, 3, 7, 9].includes(num)) return 'green';
    if ([2, 4, 6, 8].includes(num)) return 'red';
    if ([0, 5].includes(num)) return 'violet';
}

/**
 * Returns the size category for a given number (0-9).
 * @param {number} num
 * @returns {'big'|'small'|'violet'}
 */
export function getSize(num) {
    if ([6, 7, 8, 9].includes(num)) return 'big';
    if ([0, 1, 2, 3, 4].includes(num)) return 'small';
    if (num === 5) return 'violet';
}

/**
 * Calculates and credits winnings for all bets in a round.
 * Uses bulkWrite for efficient batch DB operations instead of N individual saves.
 * @param {number} roundId
 * @param {number} result - winning number (0-9)
 */
export async function calculateWinnings(roundId, result) {
    const color = getColor(result);
    const size = getSize(result);

    const bets = await Bet.find({ roundId, won: false });
    if (bets.length === 0) return;

    const betUpdates = [];
    const balanceMap = {}; // userId -> total payout

    for (const bet of bets) {
        let won = false;
        let payout = 0;

        if (bet.betType === 'number' && bet.betValue === result) {
            won = true;
            payout = bet.amount * 8;
        } else if (bet.betType === color) {
            won = true;
            payout = bet.amount * 2;
        } else if (bet.betType === size && size !== 'violet') {
            won = true;
            payout = bet.amount * 2;
        }

        if (won) {
            betUpdates.push({
                updateOne: {
                    filter: { _id: bet._id },
                    update: { $set: { won: true, payout } },
                },
            });

            const uid = bet.userId.toString();
            balanceMap[uid] = (balanceMap[uid] || 0) + payout;
        }
    }

    // Batch update bets
    if (betUpdates.length > 0) {
        await Bet.bulkWrite(betUpdates);
    }

    // Batch credit user balances
    const userUpdates = Object.entries(balanceMap).map(([userId, payout]) => ({
        updateOne: {
            filter: { _id: userId },
            update: { $inc: { balance: payout } },
        },
    }));

    if (userUpdates.length > 0) {
        await User.bulkWrite(userUpdates);
    }
}
