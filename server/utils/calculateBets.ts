/**
 * Utility functions for calculating bet results
 */

import { Bet, LotteryResult } from "@shared/schema";

/**
 * Check if a lô bet has won
 * Lô: Bet on the last 2 digits appearing in any prize
 */
export function checkLoBet(bet: Bet, result: LotteryResult): boolean {
  // Extract all 2-digit combinations from the result
  const allNumbers: string[] = [];
  
  // Special prize
  for (let i = 0; i < result.special.length - 1; i++) {
    allNumbers.push(result.special.substring(i, i + 2));
  }
  
  // First prize
  for (let i = 0; i < result.first.length - 1; i++) {
    allNumbers.push(result.first.substring(i, i + 2));
  }
  
  // Other prizes (arrays)
  [result.second, result.third, result.fourth, result.fifth, result.sixth, result.seventh].forEach(prizeArray => {
    prizeArray.forEach(prize => {
      for (let i = 0; i < prize.length - 1; i++) {
        allNumbers.push(prize.substring(i, i + 2));
      }
    });
  });
  
  // Check if any of the bet numbers appear in the results
  return (bet.numbers as string[]).some(num => allNumbers.includes(num));
}

/**
 * Check if a đề bet has won
 * Đề: Bet on the last 2 digits of the special prize
 */
export function checkDeBet(bet: Bet, result: LotteryResult): boolean {
  const specialLast2 = result.special.slice(-2);
  return (bet.numbers as string[]).includes(specialLast2);
}

/**
 * Check if a 3 càng bet has won
 * 3 càng: Bet on the last 3 digits of the special prize
 */
export function check3CangBet(bet: Bet, result: LotteryResult): boolean {
  const specialLast3 = result.special.slice(-3);
  return (bet.numbers as string[]).includes(specialLast3);
}

/**
 * Check if a lô xiên bet has won
 * Lô xiên: Bet on multiple numbers, all must appear
 */
export function checkLoXienBet(bet: Bet, result: LotteryResult): boolean {
  // For xiên bets, all numbers must appear
  return (bet.numbers as string[]).every(num => {
    // Extract all 2-digit combinations from the result
    const allNumbers: string[] = [];
    
    // Special prize
    for (let i = 0; i < result.special.length - 1; i++) {
      allNumbers.push(result.special.substring(i, i + 2));
    }
    
    // First prize
    for (let i = 0; i < result.first.length - 1; i++) {
      allNumbers.push(result.first.substring(i, i + 2));
    }
    
    // Other prizes (arrays)
    [result.second, result.third, result.fourth, result.fifth, result.sixth, result.seventh].forEach(prizeArray => {
      prizeArray.forEach(prize => {
        for (let i = 0; i < prize.length - 1; i++) {
          allNumbers.push(prize.substring(i, i + 2));
        }
      });
    });
    
    return allNumbers.includes(num);
  });
}

/**
 * Calculate payout for a winning bet
 */
export function calculatePayout(bet: Bet): number {
  return bet.amount * bet.multiplier;
}

/**
 * Get the last draw time for today
 * 18:15 is the cutoff time
 */
export function getNextDrawDate(): Date {
  const now = new Date();
  const drawTime = new Date(now);
  drawTime.setHours(18, 15, 0, 0);
  
  // If it's past 18:15, set for tomorrow
  if (now > drawTime) {
    drawTime.setDate(drawTime.getDate() + 1);
  }
  
  return drawTime;
}

/**
 * Check if a number is valid for betting
 * Must be 2 digits for lô/đề and lô xiên
 * Must be 3 digits for 3 càng
 */
export function isValidBetNumber(number: string, betType: string): boolean {
  if (betType === '3cang') {
    return /^\d{3}$/.test(number);
  } else {
    return /^\d{2}$/.test(number);
  }
}
