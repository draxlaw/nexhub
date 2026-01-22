import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';
import Vendor from '../models/Vendor.model';
import { ApiError } from '../utils/ApiError';

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const isAdmin = user.roles.includes('admin');
    
    // Check if vendor exists for non-admin users
    let vendorId: string | undefined;
    if (!isAdmin) {
      const vendor = await Vendor.findOne({ user: user._id });
      if (!vendor || !vendor.isActive) {
        return next(new ApiError(403, 'You must be an approved vendor to create products'));
      }
      vendorId = vendor._id.toString();
    }

    const product = await productService.createProduct(req.body, user._id, isAdmin, vendorId);
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = req.params.productId as string;
    const user = (req as any).user;
    const isAdmin = user.roles.includes('admin');

    const product = await productService.updateProduct(productId, req.body, user._id, isAdmin);
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = req.params.productId as string;
    const product = await productService.getProductById(productId);
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, vendor, status, minPrice, maxPrice, search, page, limit } = req.query;

    const result = await productService.listProducts({
      category: category as string,
      vendor: vendor as string,
      status: status as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      search: search as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = req.params.productId as string;
    const user = (req as any).user;
    const isAdmin = user.roles.includes('admin');

    const result = await productService.deleteProduct(productId, user._id, isAdmin);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function publishProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = req.params.productId as string;
    const user = (req as any).user;
    const isAdmin = user.roles.includes('admin');

    const product = await productService.publishProduct(productId, user._id, isAdmin);
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function myProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const { page, limit } = req.query;

    // Get vendor for this user
    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return next(new ApiError(404, 'Vendor not found'));
    }

    const result = await productService.vendorProducts(
      vendor._id.toString(),
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const isAdmin = user.roles.includes('admin');

    let vendorId: string | undefined;
    if (!isAdmin) {
      const vendor = await Vendor.findOne({ user: user._id });
      vendorId = vendor?._id.toString();
    }

    const stats = await productService.getAdminStats(vendorId);
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
}

