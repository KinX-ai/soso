import { users, type User, type InsertUser, transactions, type Transaction, type InsertTransaction, lotteryResults, type LotteryResult, type InsertLotteryResult, bets, type Bet, type InsertBet, settings, type Setting, numberStats, type NumberStat, type InsertNumberStat } from "@shared/schema";
import { db } from './db';
import { eq, desc, asc, and, lte, gte, sql } from 'drizzle-orm';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(filter?: Partial<User>): Promise<User[]>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  updateTransaction(id: number, transactionData: Partial<Transaction>): Promise<Transaction | undefined>;
  getAllTransactions(filter?: Partial<Transaction>): Promise<Transaction[]>;
  
  // Lottery results operations
  addLotteryResult(result: InsertLotteryResult): Promise<LotteryResult>;
  getLotteryResultsByDate(date: Date): Promise<LotteryResult[]>;
  getLotteryResultsByRegion(region: string, limit?: number): Promise<LotteryResult[]>;
  getLatestLotteryResult(region: string): Promise<LotteryResult | undefined>;
  
  // Betting operations
  createBet(bet: InsertBet): Promise<Bet>;
  getUserBets(userId: number): Promise<Bet[]>;
  getBetsByDate(date: Date): Promise<Bet[]>;
  updateBet(id: number, betData: Partial<Bet>): Promise<Bet | undefined>;
  
  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  updateSetting(key: string, value: any, description?: string): Promise<Setting>;
  getAllSettings(): Promise<Setting[]>;
  
  // Statistics operations
  addNumberStat(stat: InsertNumberStat): Promise<NumberStat>;
  getNumberStats(number: string, region: string, limit?: number): Promise<NumberStat[]>;
  getMostFrequentNumbers(region: string, limit?: number): Promise<{number: string, occurrences: number}[]>;
  getNumberAbsence(region: string, limit?: number): Promise<{number: string, days: number}[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user;
  }

  async getAllUsers(filter?: Partial<User>): Promise<User[]> {
    if (!filter) {
      return db.select().from(users);
    }

    // Build dynamic where clauses based on filter
    const whereConditions = [];
    
    if (filter.id) whereConditions.push(eq(users.id, filter.id));
    if (filter.username) whereConditions.push(eq(users.username, filter.username));
    if (filter.email) whereConditions.push(eq(users.email, filter.email));
    if (filter.role) whereConditions.push(eq(users.role, filter.role));
    
    if (whereConditions.length === 0) {
      return db.select().from(users);
    }
    
    return db.select().from(users).where(and(...whereConditions));
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    // Update user balance if transaction is deposit or withdrawal
    if (transactionData.type === 'deposit' || transactionData.type === 'withdrawal') {
      const user = await this.getUser(transactionData.userId);
      if (user) {
        const balanceChange = transactionData.type === 'deposit' 
          ? transactionData.amount 
          : -transactionData.amount;
          
        await this.updateUser(user.id, { 
          balance: (user.balance || 0) + balanceChange 
        });
      }
    }
    
    const [transaction] = await db.insert(transactions).values(transactionData).returning();
    return transaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async updateTransaction(id: number, transactionData: Partial<Transaction>): Promise<Transaction | undefined> {
    // Check if status is being updated to 'approved' for deposits and withdrawals
    if (transactionData.status === 'approved') {
      const transaction = await this.getTransaction(id);
      if (transaction && transaction.status !== 'approved') {
        const user = await this.getUser(transaction.userId);
        if (user) {
          // Only update balance if status is changing to approved
          if (transaction.type === 'deposit') {
            await this.updateUser(user.id, { 
              balance: (user.balance || 0) + transaction.amount 
            });
          } else if (transaction.type === 'withdrawal' && transaction.status !== 'approved') {
            // For withdrawals, we already reduced balance on creation if status was pending
            // Only reduce balance if the withdrawal was previously rejected
            if (transaction.status === 'rejected') {
              await this.updateUser(user.id, { 
                balance: (user.balance || 0) - transaction.amount 
              });
            }
          }
        }
      }
    }
    
    const [updatedTransaction] = await db.update(transactions)
      .set(transactionData)
      .where(eq(transactions.id, id))
      .returning();
      
    return updatedTransaction;
  }

  async getAllTransactions(filter?: Partial<Transaction>): Promise<Transaction[]> {
    if (!filter) {
      return db.select().from(transactions).orderBy(desc(transactions.createdAt));
    }
    
    // Build dynamic where clauses based on filter
    const whereConditions = [];
    
    if (filter.id) whereConditions.push(eq(transactions.id, filter.id));
    if (filter.userId) whereConditions.push(eq(transactions.userId, filter.userId));
    if (filter.type) whereConditions.push(eq(transactions.type, filter.type));
    if (filter.status) whereConditions.push(eq(transactions.status, filter.status));
    
    if (whereConditions.length === 0) {
      return db.select().from(transactions).orderBy(desc(transactions.createdAt));
    }
    
    return db.select()
      .from(transactions)
      .where(and(...whereConditions))
      .orderBy(desc(transactions.createdAt));
  }

  async addLotteryResult(resultData: InsertLotteryResult): Promise<LotteryResult> {
    const [result] = await db.insert(lotteryResults).values(resultData).returning();
    
    // Update number stats
    await this.updateNumberStats(result);
    
    // Settle bets for this date and region
    await this.settleBetsForDate(new Date(result.date), result.region);
    
    return result;
  }

  private async updateNumberStats(result: LotteryResult): Promise<void> {
    // Extract all numbers from the result
    const allNumbers: string[] = [];
    
    // Special prize (2 last digits)
    const specialLastTwo = result.special.slice(-2);
    allNumbers.push(specialLastTwo);
    
    // First prize (2 last digits)
    const firstLastTwo = result.first.slice(-2);
    allNumbers.push(firstLastTwo);
    
    // All other prizes (2 last digits)
    const otherNumbers = [
      ...result.second,
      ...result.third,
      ...result.fourth,
      ...result.fifth,
      ...result.sixth,
      ...result.seventh
    ].map(num => num.slice(-2));
    
    allNumbers.push(...otherNumbers);
    
    // Create number stat entries for each unique number
    const uniqueNumbers = [...new Set(allNumbers)];
    const date = new Date(result.date);
    
    for (const number of uniqueNumbers) {
      // Create or update number stat
      await this.addNumberStat({
        number,
        date: date.toISOString(),
        region: result.region,
        isPresent: true
      });
    }
    
    // For numbers not present, create absence entries
    const allPossibleNumbers = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0'));
    const absentNumbers = allPossibleNumbers.filter(num => !uniqueNumbers.includes(num));
    
    for (const number of absentNumbers) {
      await this.addNumberStat({
        number,
        date: date.toISOString(),
        region: result.region,
        isPresent: false
      });
    }
  }

  private async settleBetsForDate(date: Date, region: string): Promise<void> {
    // Get all bets for this date
    const dateStr = date.toISOString().split('T')[0];
    const startOfDay = new Date(dateStr);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);
    
    const betsToSettle = await db.select().from(bets)
      .where(
        and(
          gte(bets.date, startOfDay.toISOString()),
          lte(bets.date, endOfDay.toISOString()),
          eq(bets.status, 'pending')
        )
      );
    
    if (betsToSettle.length === 0) return;
    
    // Get the lottery result for this date and region
    const [result] = await db.select()
      .from(lotteryResults)
      .where(
        and(
          gte(lotteryResults.date, startOfDay.toISOString()),
          lte(lotteryResults.date, endOfDay.toISOString()),
          eq(lotteryResults.region, region)
        )
      );
    
    if (!result) return;
    
    // Process each bet
    for (const bet of betsToSettle) {
      // Skip bets that have already been settled
      if (bet.status !== 'pending') continue;
      
      let isWin = false;
      let payout = 0;
      
      // Check different bet types
      if (bet.type === 'lo') {
        isWin = this.checkLoWin(bet.numbers, result);
      } else if (bet.type === 'de') {
        isWin = bet.numbers.includes(result.special.slice(-2));
      } else if (bet.type === '3cang') {
        isWin = bet.numbers.includes(result.special.slice(-3));
      } else if (bet.type.startsWith('lo_xien')) {
        // For lô xiên, all numbers must appear in the results
        isWin = bet.numbers.every(num => {
          return this.checkLoWin([num], result);
        });
      }
      
      // Calculate payout if bet won
      if (isWin) {
        payout = bet.amount * bet.multiplier;
        
        // Credit user account with winnings
        const user = await this.getUser(bet.userId);
        if (user) {
          await this.updateUser(user.id, {
            balance: (user.balance || 0) + payout
          });
          
          // Create transaction record for the win
          await this.createTransaction({
            userId: user.id,
            type: 'winning',
            amount: payout,
            status: 'approved',
            description: `Thắng cược ${bet.type} - ${bet.numbers.join(', ')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      // Update bet status
      await this.updateBet(bet.id, {
        status: isWin ? 'win' : 'lose',
        result: result.id,
        payout: isWin ? payout : 0,
        updatedAt: new Date().toISOString()
      });
    }
  }

  private checkLoWin(numbers: string[], result: LotteryResult): boolean {
    // Extract all 2-digit numbers from the lottery result
    const allNumbers = [
      result.special.slice(-2),
      result.first.slice(-2),
      ...result.second.map(num => num.slice(-2)),
      ...result.third.map(num => num.slice(-2)),
      ...result.fourth.map(num => num.slice(-2)),
      ...result.fifth.map(num => num.slice(-2)),
      ...result.sixth.map(num => num.slice(-2)),
      ...result.seventh.map(num => num.slice(-2))
    ];
    
    // Check if any of the bet numbers appear in the result
    return numbers.some(num => allNumbers.includes(num));
  }

  async getLotteryResultsByDate(date: Date): Promise<LotteryResult[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return db.select()
      .from(lotteryResults)
      .where(
        and(
          gte(lotteryResults.date, startOfDay.toISOString()),
          lte(lotteryResults.date, endOfDay.toISOString())
        )
      );
  }

  async getLotteryResultsByRegion(region: string, limit: number = 10): Promise<LotteryResult[]> {
    return db.select()
      .from(lotteryResults)
      .where(eq(lotteryResults.region, region))
      .orderBy(desc(lotteryResults.date))
      .limit(limit);
  }

  async getLatestLotteryResult(region: string): Promise<LotteryResult | undefined> {
    const [result] = await db.select()
      .from(lotteryResults)
      .where(eq(lotteryResults.region, region))
      .orderBy(desc(lotteryResults.date))
      .limit(1);
      
    return result;
  }

  async createBet(betData: InsertBet): Promise<Bet> {
    // Deduct user balance
    const user = await this.getUser(betData.userId);
    if (user) {
      if ((user.balance || 0) < betData.amount) {
        throw new Error("Insufficient balance");
      }
      
      await this.updateUser(user.id, {
        balance: (user.balance || 0) - betData.amount
      });
      
      // Create transaction record for the bet
      await this.createTransaction({
        userId: user.id,
        type: 'bet',
        amount: betData.amount,
        status: 'approved',
        description: `Đặt cược ${betData.type} - ${betData.numbers.join(', ')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Create bet record
    const [bet] = await db.insert(bets).values(betData).returning();
    return bet;
  }

  async getUserBets(userId: number): Promise<Bet[]> {
    return db.select()
      .from(bets)
      .where(eq(bets.userId, userId))
      .orderBy(desc(bets.createdAt));
  }

  async getBetsByDate(date: Date): Promise<Bet[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return db.select()
      .from(bets)
      .where(
        and(
          gte(bets.date, startOfDay.toISOString()),
          lte(bets.date, endOfDay.toISOString())
        )
      );
  }

  async updateBet(id: number, betData: Partial<Bet>): Promise<Bet | undefined> {
    const [bet] = await db.update(bets)
      .set(betData)
      .where(eq(bets.id, id))
      .returning();
      
    return bet;
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select()
      .from(settings)
      .where(eq(settings.key, key));
      
    return setting;
  }

  async updateSetting(key: string, value: any, description?: string): Promise<Setting> {
    // Check if setting exists
    const existingSetting = await this.getSetting(key);
    
    if (existingSetting) {
      // Update existing setting
      const [setting] = await db.update(settings)
        .set({ 
          value: JSON.stringify(value),
          description: description || existingSetting.description, 
          updatedAt: new Date().toISOString() 
        })
        .where(eq(settings.key, key))
        .returning();
        
      return setting;
    } else {
      // Create new setting
      const [setting] = await db.insert(settings)
        .values({
          key,
          value: JSON.stringify(value),
          description: description || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning();
        
      return setting;
    }
  }

  async getAllSettings(): Promise<Setting[]> {
    return db.select().from(settings);
  }

  async addNumberStat(statData: InsertNumberStat): Promise<NumberStat> {
    const [stat] = await db.insert(numberStats).values(statData).returning();
    return stat;
  }

  async getNumberStats(number: string, region: string, limit: number = 30): Promise<NumberStat[]> {
    return db.select()
      .from(numberStats)
      .where(
        and(
          eq(numberStats.number, number),
          eq(numberStats.region, region)
        )
      )
      .orderBy(desc(numberStats.date))
      .limit(limit);
  }

  async getMostFrequentNumbers(region: string, limit: number = 10): Promise<{number: string, occurrences: number}[]> {
    const result = await db.execute(sql`
      SELECT number, SUM(occurrences) as occurrences
      FROM ${numberStats}
      WHERE region = ${region}
      GROUP BY number
      ORDER BY occurrences DESC
      LIMIT ${limit}
    `);
    
    return result.rows.map(row => ({
      number: row.number as string,
      occurrences: Number(row.occurrences)
    }));
  }

  async getNumberAbsence(region: string, limit: number = 10): Promise<{number: string, days: number}[]> {
    // Cách dễ dàng hơn để mô phỏng số liệu lô gan
    const result = await db.execute(sql`
      WITH recent_appearances AS (
        SELECT 
          number, 
          MAX(date) as last_appear_date
        FROM number_stats
        WHERE region = ${region} 
        GROUP BY number
      )
      SELECT 
        number, 
        EXTRACT(DAY FROM NOW() - last_appear_date)::int as days
      FROM recent_appearances
      ORDER BY days DESC
      LIMIT ${limit}
    `);
    
    return result.rows.map(row => ({
      number: row.number as string,
      days: Number(row.days)
    }));
  }
}

export const storage = new DatabaseStorage();