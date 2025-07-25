import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { insertUserSchema, insertBusinessSchema, insertProductSchema, insertCustomerSchema, insertTransactionSchema } from "@shared/schema";

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      businessId: number;
      username: string;
      firstName: string;
      lastName: string;
      role: string;
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'znforge-pos-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Auth middleware
  function requireAuth(req: any, res: any, next: any) {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }

  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const businessData = insertBusinessSchema.parse(req.body.business);
      const userData = insertUserSchema.parse({
        ...req.body.user,
        businessId: 0, // Will be set after business creation
        role: 'admin'
      });

      // Create business first
      const business = await storage.createBusiness(businessData);
      
      // Create admin user
      const user = await storage.createUser({
        ...userData,
        businessId: business.id
      });

      // Set session
      req.session.user = {
        id: user.id,
        businessId: user.businessId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      res.json({ user: req.session.user, business });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, businessId } = req.body;
      
      const user = await storage.getUserByUsernameAndBusiness(username, businessId);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.user = {
        id: user.id,
        businessId: user.businessId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      const business = await storage.getBusiness(user.businessId);
      res.json({ user: req.session.user, business });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/me", requireAuth, async (req, res) => {
    const business = await storage.getBusiness(req.session.user!.businessId);
    res.json({ user: req.session.user, business });
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.session.user!.businessId);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/recent-transactions", requireAuth, async (req, res) => {
    try {
      const transactions = await storage.getTransactions(req.session.user!.businessId, 10);
      res.json(transactions);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/top-products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getTopProducts(req.session.user!.businessId, 5);
      res.json(products);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/low-stock", requireAuth, async (req, res) => {
    try {
      const products = await storage.getLowStockProducts(req.session.user!.businessId);
      res.json(products);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Products routes
  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getProducts(req.session.user!.businessId);
      res.json(products);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const productData = insertProductSchema.parse({
        ...req.body,
        businessId: req.session.user!.businessId
      });
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const updates = {
        ...req.body,
        businessId: req.session.user!.businessId
      };
      delete updates.id; // Remove id from updates
      
      const product = await storage.updateProduct(productId, req.session.user!.businessId, updates);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/products/:id/stock", requireAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { stock } = req.body;
      
      // Check if user has permission to adjust stock (admin or manager)
      if (req.session.user!.role !== 'admin' && req.session.user!.role !== 'manager') {
        return res.status(403).json({ message: "Insufficient permissions to adjust stock" });
      }
      
      const product = await storage.updateProduct(productId, req.session.user!.businessId, { stock });
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      // Check if user has permission to delete products (admin only)
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can delete products" });
      }
      
      await storage.deleteProduct(productId, req.session.user!.businessId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Categories routes
  app.get("/api/categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getCategories(req.session.user!.businessId);
      res.json(categories);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Customers routes
  app.get("/api/customers", requireAuth, async (req, res) => {
    try {
      const customers = await storage.getCustomers(req.session.user!.businessId);
      res.json(customers);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/customers", requireAuth, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse({
        ...req.body,
        businessId: req.session.user!.businessId
      });
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Transactions routes
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const transactions = await storage.getTransactions(req.session.user!.businessId);
      res.json(transactions);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      const { transaction, items } = req.body;
      
      // Generate transaction number
      const transactionNumber = `TXN-${Date.now()}`;
      
      const transactionData = insertTransactionSchema.parse({
        ...transaction,
        businessId: req.session.user!.businessId,
        userId: req.session.user!.id,
        transactionNumber
      });

      const createdTransaction = await storage.createTransaction(transactionData, items);
      res.json(createdTransaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
