import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertTransactionSchema, insertBetSchema } from "@shared/schema";
import { crawlLotteryResults } from "./utils/crawlLottery";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { authMiddleware, adminMiddleware } from "./middleware/auth";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "rongbachkim-secret-key";
const SALT_ROUNDS = 10;

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Phục vụ file hướng dẫn thiết lập trực tiếp
  app.get("/setup-guide", (req, res) => {
    const setupGuidePath = path.resolve(process.cwd(), "setup-guide.html");
    if (fs.existsSync(setupGuidePath)) {
      res.sendFile(setupGuidePath);
    } else {
      res.status(404).send("Trang hướng dẫn không tồn tại");
    }
  });

  // Utility function to handle errors
  const handleError = (res: Response, error: unknown) => {
    console.error("API Error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    
    return res.status(500).json({ message: "An unknown error occurred" });
  };

  // === AUTH ROUTES ===
  
  // Register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      // Return user data (without password) and token
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Get user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({ message: "Your account has been deactivated" });
      }
      
      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      // Return user data (without password) and token
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get current user
  app.get("/api/auth/me", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // === USER ROUTES ===
  
  // Update user profile
  app.put("/api/users/profile", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { fullName, email, phoneNumber, bankAccount, bankName } = req.body;
      
      // Validate email if changed
      if (email) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail && existingEmail.id !== userId) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }
      
      // Update user
      const updatedUser = await storage.updateUser(userId, {
        fullName,
        email,
        phoneNumber,
        bankAccount,
        bankName
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Change password
  app.put("/api/users/password", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      
      // Update user
      await storage.updateUser(userId, { password: hashedPassword });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // === TRANSACTION ROUTES ===
  
  // Create deposit request
  app.post("/api/transactions/deposit", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId,
        type: "deposit"
      });
      
      const transaction = await storage.createTransaction(transactionData);
      
      res.status(201).json(transaction);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Create withdrawal request
  app.post("/api/transactions/withdraw", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { amount, method, bankAccount, bankName } = req.body;
      
      // Validate amount
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Check if user has enough balance
      if (user.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      const transactionData = insertTransactionSchema.parse({
        userId,
        type: "withdrawal",
        amount,
        method,
        bankAccount: bankAccount || user.bankAccount,
        bankName: bankName || user.bankName
      });
      
      const transaction = await storage.createTransaction(transactionData);
      
      res.status(201).json(transaction);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get user transactions
  app.get("/api/transactions", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const transactions = await storage.getUserTransactions(userId);
      
      res.json(transactions);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // === BETTING ROUTES ===
  
  // Create bet
  app.post("/api/bets", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Parse and validate bet data
      const betData = insertBetSchema.parse({
        ...req.body,
        userId
      });
      
      // Get betting rates from settings
      const settingObj = await storage.getSetting("betting_rates");
      const rates = settingObj?.value || {
        lo: 99.5,
        de: 99,
        "3cang": 700,
        lo_xien_2: 17,
        lo_xien_3: 70,
        lo_xien_4: 150
      };
      
      // Validate amount
      if (!betData.amount || betData.amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Get min/max bet amount from settings
      const minBetObj = await storage.getSetting("min_bet_amount");
      const maxBetObj = await storage.getSetting("max_bet_amount");
      const minBet = minBetObj?.value || 10000;
      const maxBet = maxBetObj?.value || 10000000;
      
      if (betData.amount < minBet) {
        return res.status(400).json({ message: `Minimum bet amount is ${minBet} VND` });
      }
      
      if (betData.amount > maxBet) {
        return res.status(400).json({ message: `Maximum bet amount is ${maxBet} VND` });
      }
      
      // Check if user has enough balance
      if (user.balance < betData.amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Check valid bet type and set multiplier
      if (!rates[betData.type]) {
        return res.status(400).json({ message: "Invalid bet type" });
      }
      
      // Create bet with multiplier
      const bet = await storage.createBet({
        ...betData,
        multiplier: rates[betData.type]
      });
      
      res.status(201).json(bet);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get user bets
  app.get("/api/bets", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const bets = await storage.getUserBets(userId);
      
      res.json(bets);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // === LOTTERY RESULTS ROUTES ===
  
  // Get latest lottery results
  app.get("/api/lottery/latest/:region", async (req: Request, res: Response) => {
    try {
      const { region } = req.params;
      
      if (!["mienbac", "mientrung", "miennam"].includes(region)) {
        return res.status(400).json({ message: "Invalid region" });
      }
      
      const result = await storage.getLatestLotteryResult(region);
      
      if (!result) {
        return res.status(404).json({ message: "No lottery results found" });
      }
      
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get lottery results by date
  app.get("/api/lottery/date/:date", async (req: Request, res: Response) => {
    try {
      const { date } = req.params;
      
      // Convert YYYY-MM-DD format to Date object
      const [year, month, day] = date.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day); // month is 0-indexed in JavaScript
      
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
      }
      
      const results = await storage.getLotteryResultsByDate(parsedDate);
      
      res.json(results);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get lottery history by region
  app.get("/api/lottery/history/:region", async (req: Request, res: Response) => {
    try {
      const { region } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!["mienbac", "mientrung", "miennam"].includes(region)) {
        return res.status(400).json({ message: "Invalid region" });
      }
      
      const results = await storage.getLotteryResultsByRegion(region, limit);
      
      res.json(results);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // === STATISTICS ROUTES ===
  
  // Get most frequent numbers
  app.get("/api/stats/frequent/:region", async (req: Request, res: Response) => {
    try {
      const { region } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!["mienbac", "mientrung", "miennam"].includes(region)) {
        return res.status(400).json({ message: "Invalid region" });
      }
      
      const numbers = await storage.getMostFrequentNumbers(region, limit);
      
      res.json(numbers);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get number absence (lô gan)
  app.get("/api/stats/absence/:region", async (req: Request, res: Response) => {
    try {
      const { region } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!["mienbac", "mientrung", "miennam"].includes(region)) {
        return res.status(400).json({ message: "Invalid region" });
      }
      
      const numbers = await storage.getNumberAbsence(region, limit);
      
      res.json(numbers);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // === ADMIN ROUTES ===
  
  // Get all users (admin only)
  app.get("/api/admin/users", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      
      // Don't send passwords
      const usersWithoutPasswords = users.map(user => {
        const { password, ...rest } = user;
        return rest;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Update user (admin only)
  app.put("/api/admin/users/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const { isActive, role, balance } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        isActive,
        role,
        balance
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get all transactions (admin only)
  app.get("/api/admin/transactions", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string;
      const type = req.query.type as string;
      
      const filter: {status?: string, type?: string} = {};
      if (status) filter.status = status;
      if (type) filter.type = type;
      
      const transactions = await storage.getAllTransactions(filter);
      
      res.json(transactions);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Update transaction (admin only)
  app.put("/api/admin/transactions/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const transactionId = parseInt(req.params.id);
      
      if (isNaN(transactionId)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }
      
      const { status, notes } = req.body;
      
      if (!["pending", "completed", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedTransaction = await storage.updateTransaction(transactionId, {
        status,
        notes,
        updatedAt: new Date()
      });
      
      if (!updatedTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(updatedTransaction);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get all settings (admin only)
  app.get("/api/admin/settings", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const settings = await storage.getAllSettings();
      
      res.json(settings);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Update setting (admin only)
  app.put("/api/admin/settings/:key", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const { value, description } = req.body;
      
      if (value === undefined) {
        return res.status(400).json({ message: "Value is required" });
      }
      
      const updatedSetting = await storage.updateSetting(key, value, description);
      
      res.json(updatedSetting);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // === CRAWLER ROUTES ===
  
  // Manually trigger lottery result crawler (admin only)
  app.post("/api/admin/crawler/lottery", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const date = req.body.date ? new Date(req.body.date) : new Date();
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const results = await crawlLotteryResults(date);
      
      // Save results to storage
      for (const result of results) {
        await storage.addLotteryResult(result);
      }
      
      res.json({ message: "Lottery results crawled successfully", results });
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get public settings
  app.get("/api/settings/public", async (req: Request, res: Response) => {
    try {
      const bettingRates = await storage.getSetting("betting_rates");
      const minBet = await storage.getSetting("min_bet_amount");
      const maxBet = await storage.getSetting("max_bet_amount");
      const lotterySchedule = await storage.getSetting("lottery_schedule");
      
      res.json({
        bettingRates: bettingRates?.value,
        minBetAmount: minBet?.value,
        maxBetAmount: maxBet?.value,
        lotterySchedule: lotterySchedule?.value
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  return httpServer;
}
