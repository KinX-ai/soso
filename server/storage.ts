import { 
  users, transactions, lotteryResults, bets, settings, numberStats,
  type User, type InsertUser, type Transaction, type InsertTransaction, 
  type LotteryResult, type InsertLotteryResult, type Bet, 
  type InsertBet, type Setting, type InsertSetting, 
  type NumberStat, type InsertNumberStat, type BetType
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private lotteryResults: Map<number, LotteryResult>;
  private bets: Map<number, Bet>;
  private settings: Map<string, Setting>;
  private numberStats: Map<string, NumberStat>; // Composite key: number-date-region
  
  private currentUserId: number;
  private currentTransactionId: number;
  private currentLotteryResultId: number;
  private currentBetId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.lotteryResults = new Map();
    this.bets = new Map();
    this.settings = new Map();
    this.numberStats = new Map();
    
    this.currentUserId = 1;
    this.currentTransactionId = 1;
    this.currentLotteryResultId = 1;
    this.currentBetId = 1;
    
    // Initialize default settings
    this.initializeSettings();
  }

  private initializeSettings() {
    const defaultSettings = [
      {
        key: "betting_rates",
        value: {
          lo: 99.5,
          de: 99,
          "3cang": 700,
          lo_xien_2: 17,
          lo_xien_3: 70,
          lo_xien_4: 150
        },
        description: "Payout rates for different bet types"
      },
      {
        key: "min_bet_amount",
        value: 10000,
        description: "Minimum bet amount in VND"
      },
      {
        key: "max_bet_amount",
        value: 10000000,
        description: "Maximum bet amount in VND"
      },
      {
        key: "lottery_schedule",
        value: { time: "18:15" },
        description: "Daily lottery draw time"
      }
    ];
    
    defaultSettings.forEach(setting => {
      this.settings.set(setting.key, {
        ...setting,
        updatedAt: new Date()
      });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    
    const user: User = {
      id,
      ...userData,
      balance: 0,
      role: "user",
      isActive: true,
      createdAt: now
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    
    return updatedUser;
  }

  async getAllUsers(filter?: Partial<User>): Promise<User[]> {
    let users = Array.from(this.users.values());
    
    if (filter) {
      users = users.filter(user => {
        return Object.entries(filter).every(([key, value]) => {
          return user[key as keyof User] === value;
        });
      });
    }
    
    return users;
  }

  // Transaction operations
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    
    const transaction: Transaction = {
      id,
      ...transactionData,
      status: "pending",
      createdAt: now,
      updatedAt: now
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateTransaction(id: number, transactionData: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const now = new Date();
    const updatedTransaction = { 
      ...transaction, 
      ...transactionData,
      updatedAt: now
    };
    
    this.transactions.set(id, updatedTransaction);
    
    // If transaction is completed and it's a deposit, update user balance
    if (updatedTransaction.status === "completed" && updatedTransaction.type === "deposit") {
      const user = await this.getUser(updatedTransaction.userId);
      if (user) {
        await this.updateUser(user.id, {
          balance: user.balance + updatedTransaction.amount
        });
      }
    }
    
    // If transaction is completed and it's a withdrawal, update user balance
    if (updatedTransaction.status === "completed" && updatedTransaction.type === "withdrawal") {
      const user = await this.getUser(updatedTransaction.userId);
      if (user) {
        await this.updateUser(user.id, {
          balance: Math.max(0, user.balance - updatedTransaction.amount)
        });
      }
    }
    
    return updatedTransaction;
  }

  async getAllTransactions(filter?: Partial<Transaction>): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values());
    
    if (filter) {
      transactions = transactions.filter(transaction => {
        return Object.entries(filter).every(([key, value]) => {
          return transaction[key as keyof Transaction] === value;
        });
      });
    }
    
    return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Lottery results operations
  async addLotteryResult(resultData: InsertLotteryResult): Promise<LotteryResult> {
    const id = this.currentLotteryResultId++;
    const now = new Date();
    
    const result: LotteryResult = {
      id,
      ...resultData,
      createdAt: now,
      updatedAt: now
    };
    
    this.lotteryResults.set(id, result);
    
    // Update bets based on this result
    this.settleBetsForDate(result.date, result.region);
    
    return result;
  }

  private async settleBetsForDate(date: Date, region: string): Promise<void> {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);
    
    const betsForDate = Array.from(this.bets.values()).filter(bet => {
      const betDate = new Date(bet.date);
      return betDate >= dateStart && betDate <= dateEnd && bet.status === "pending";
    });
    
    const result = await this.getLatestLotteryResult(region);
    if (!result) return;
    
    const settingObj = await this.getSetting("betting_rates");
    const rates = settingObj?.value || {
      lo: 99.5,
      de: 99,
      "3cang": 700,
      lo_xien_2: 17,
      lo_xien_3: 70,
      lo_xien_4: 150
    };
    
    // Process each bet
    for (const bet of betsForDate) {
      let won = false;
      let payout = 0;
      
      switch (bet.type) {
        case "lo":
          // Check if bet numbers appear in any prize
          won = this.checkLoWin(bet.numbers as string[], result);
          if (won) {
            payout = bet.amount * (rates.lo as number);
          }
          break;
          
        case "de":
          // Check if bet numbers match last 2 digits of special prize
          const specialLast2 = result.special.slice(-2);
          won = (bet.numbers as string[]).includes(specialLast2);
          if (won) {
            payout = bet.amount * (rates.de as number);
          }
          break;
          
        case "3cang":
          // Check if bet numbers match last 3 digits of special prize
          const specialLast3 = result.special.slice(-3);
          won = (bet.numbers as string[]).includes(specialLast3);
          if (won) {
            payout = bet.amount * (rates["3cang"] as number);
          }
          break;
          
        case "lo_xien_2":
        case "lo_xien_3":
        case "lo_xien_4":
          // For xiên bets, all numbers must appear
          const allNumbersWon = (bet.numbers as string[]).every(num => 
            this.checkLoWin([num], result)
          );
          
          if (allNumbersWon) {
            won = true;
            payout = bet.amount * (rates[bet.type] as number);
          }
          break;
      }
      
      // Update bet status and payout
      await this.updateBet(bet.id, {
        status: won ? "won" : "lost",
        payout: won ? payout : 0,
        settledAt: new Date()
      });
      
      // If bet is won, update user balance
      if (won) {
        const user = await this.getUser(bet.userId);
        if (user) {
          await this.updateUser(user.id, {
            balance: user.balance + payout
          });
        }
      }
    }
  }

  private checkLoWin(numbers: string[], result: LotteryResult): boolean {
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
      if (Array.isArray(prizeArray)) {
        prizeArray.forEach(prize => {
          for (let i = 0; i < prize.length - 1; i++) {
            allNumbers.push(prize.substring(i, i + 2));
          }
        });
      }
    });
    
    // Check if any of the bet numbers appear in the results
    return numbers.some(num => allNumbers.includes(num));
  }

  async getLotteryResultsByDate(date: Date): Promise<LotteryResult[]> {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);
    
    return Array.from(this.lotteryResults.values())
      .filter(result => {
        const resultDate = new Date(result.date);
        return resultDate >= dateStart && resultDate <= dateEnd;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async getLotteryResultsByRegion(region: string, limit: number = 10): Promise<LotteryResult[]> {
    return Array.from(this.lotteryResults.values())
      .filter(result => result.region === region)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  async getLatestLotteryResult(region: string): Promise<LotteryResult | undefined> {
    const results = await this.getLotteryResultsByRegion(region, 1);
    return results.length > 0 ? results[0] : undefined;
  }

  // Betting operations
  async createBet(betData: InsertBet): Promise<Bet> {
    const id = this.currentBetId++;
    const now = new Date();
    
    const bet: Bet = {
      id,
      ...betData,
      status: "pending",
      createdAt: now
    };
    
    this.bets.set(id, bet);
    
    // Deduct the bet amount from user balance
    const user = await this.getUser(bet.userId);
    if (user) {
      await this.updateUser(user.id, {
        balance: user.balance - bet.amount
      });
    }
    
    return bet;
  }

  async getUserBets(userId: number): Promise<Bet[]> {
    return Array.from(this.bets.values())
      .filter(bet => bet.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getBetsByDate(date: Date): Promise<Bet[]> {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);
    
    return Array.from(this.bets.values())
      .filter(bet => {
        const betDate = new Date(bet.date);
        return betDate >= dateStart && betDate <= dateEnd;
      })
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async updateBet(id: number, betData: Partial<Bet>): Promise<Bet | undefined> {
    const bet = this.bets.get(id);
    if (!bet) return undefined;
    
    const updatedBet = { ...bet, ...betData };
    this.bets.set(id, updatedBet);
    
    return updatedBet;
  }

  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async updateSetting(key: string, value: any, description?: string): Promise<Setting> {
    const now = new Date();
    const existingSetting = this.settings.get(key);
    
    const setting: Setting = {
      key,
      value,
      updatedAt: now,
      description: description || existingSetting?.description || ""
    };
    
    this.settings.set(key, setting);
    return setting;
  }

  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  // Statistics operations
  async addNumberStat(statData: InsertNumberStat): Promise<NumberStat> {
    const key = `${statData.number}-${statData.date.toISOString()}-${statData.region}`;
    
    const stat: NumberStat = {
      ...statData
    };
    
    this.numberStats.set(key, stat);
    return stat;
  }

  async getNumberStats(number: string, region: string, limit: number = 30): Promise<NumberStat[]> {
    return Array.from(this.numberStats.values())
      .filter(stat => stat.number === number && stat.region === region)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  async getMostFrequentNumbers(region: string, limit: number = 10): Promise<{number: string, occurrences: number}[]> {
    const stats = Array.from(this.numberStats.values())
      .filter(stat => stat.region === region);
    
    const numberCounts = new Map<string, number>();
    
    stats.forEach(stat => {
      const current = numberCounts.get(stat.number) || 0;
      numberCounts.set(stat.number, current + stat.occurrences);
    });
    
    return Array.from(numberCounts.entries())
      .map(([number, occurrences]) => ({ number, occurrences }))
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, limit);
  }

  async getNumberAbsence(region: string, limit: number = 10): Promise<{number: string, days: number}[]> {
    const mostRecentDate = new Date();
    
    // For all possible 2-digit numbers (00-99)
    const numberAbsences: {number: string, days: number}[] = [];
    
    for (let i = 0; i <= 99; i++) {
      const numStr = i.toString().padStart(2, '0');
      const stats = await this.getNumberStats(numStr, region);
      
      if (stats.length === 0) {
        // Number has never appeared
        numberAbsences.push({ number: numStr, days: 100 }); // Some high number
      } else {
        // Calculate days since last appearance
        const lastDate = new Date(stats[0].date);
        const diffTime = Math.abs(mostRecentDate.getTime() - lastDate.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        numberAbsences.push({ number: numStr, days });
      }
    }
    
    return numberAbsences
      .sort((a, b) => b.days - a.days)
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
