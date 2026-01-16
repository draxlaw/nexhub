import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model';
import Product from '../models/Product.model';
import Vendor from '../models/Vendor.model';
import Category from '../models/Category.model';
import { ApiError } from '../utils/ApiError';

// ============ USER MANAGEMENT ============

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { role, isEmailVerified, page = 1, limit = 10, search } = req.query;

    const query: any = {};
    if (role) query.roles = { $in: [role] };
    if (isEmailVerified !== undefined) query.isEmailVerified = isEmailVerified === 'true';
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -emailVerificationTokenHash -passwordResetTokenHash')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -emailVerificationTokenHash -passwordResetTokenHash');
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const { roles } = req.body;

    if (!Array.isArray(roles) || roles.length === 0) {
      return next(new ApiError(400, 'Roles must be a non-empty array'));
    }

    const user = await User.findByIdAndUpdate(userId, { roles }, { new: true }).select('-password');
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.json({ success: true, user, message: 'User roles updated' });
  } catch (err) {
    next(err);
  }
}

export async function deactivateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;

    // TODO: Implement deactivation logic (soft delete or status flag)
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    next(err);
  }
}

export async function verifyUserEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationTokenHash: undefined,
        emailVerificationExpires: undefined,
      },
      { new: true },
    ).select('-password');

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.json({ success: true, user, message: 'Email verified' });
  } catch (err) {
    next(err);
  }
}

// ============ PRODUCT MANAGEMENT ============

export async function getAllProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, vendor, category, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (vendor) query.vendor = vendor;
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .populate('vendor', 'businessName')
        .populate('createdBy', 'name email')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function approveProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndUpdate(
      productId,
      { status: 'published', isActive: true },
      { new: true },
    ).populate('category vendor');

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    res.json({ success: true, product, message: 'Product approved and published' });
  } catch (err) {
    next(err);
  }
}

export async function rejectProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;
    const { reason } = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { status: 'archived', isActive: false },
      { new: true },
    ).populate('category vendor');

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // TODO: Send email to vendor with rejection reason

    res.json({ success: true, product, message: 'Product rejected' });
  } catch (err) {
    next(err);
  }
}

export async function toggleProductStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;
    const { isActive } = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { isActive },
      { new: true },
    ).populate('category vendor');

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    res.json({ success: true, product, message: `Product ${isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    next(err);
  }
}

// ============ VENDOR MANAGEMENT ============

export async function getPendingVendors(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [vendors, total] = await Promise.all([
      Vendor.find({ isApproved: false })
        .populate('user', 'name email')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Vendor.countDocuments({ isApproved: false }),
    ]);

    res.json({
      success: true,
      vendors,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function approveVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        isApproved: true,
        approvedAt: new Date(),
      },
      { new: true },
    ).populate('user', 'name email');

    if (!vendor) {
      return next(new ApiError(404, 'Vendor not found'));
    }

    // TODO: Send approval email to vendor

    res.json({ success: true, vendor, message: 'Vendor approved' });
  } catch (err) {
    next(err);
  }
}

export async function rejectVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { isActive: false },
      { new: true },
    ).populate('user', 'name email');

    if (!vendor) {
      return next(new ApiError(404, 'Vendor not found'));
    }

    // TODO: Send rejection email to vendor with reason

    res.json({ success: true, vendor, message: 'Vendor rejected' });
  } catch (err) {
    next(err);
  }
}

export async function activateVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return next(new ApiError(404, 'Vendor not found'));
    }

    if (vendor.isActive) {
      return next(new ApiError(400, 'Vendor is already active'));
    }

    vendor.isActive = true;
    await vendor.save();

    const populatedVendor = await Vendor.findById(vendorId).populate('user', 'name email');

    // TODO: Send activation email to vendor

    res.json({ success: true, vendor: populatedVendor, message: 'Vendor activated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function reactivateVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return next(new ApiError(404, 'Vendor not found'));
    }

    if (vendor.isActive) {
      return next(new ApiError(400, 'Vendor is already active'));
    }

    // Reactivate the vendor
    vendor.isActive = true;
    await vendor.save();

    const populatedVendor = await Vendor.findById(vendorId).populate('user', 'name email');

    // TODO: Send reactivation email to vendor

    res.json({ 
      success: true, 
      vendor: populatedVendor, 
      message: 'Vendor reactivated successfully' 
    });
  } catch (err) {
    next(err);
  }
}

export async function deactivateVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return next(new ApiError(404, 'Vendor not found'));
    }

    if (!vendor.isActive) {
      return next(new ApiError(400, 'Vendor is already deactivated'));
    }

    vendor.isActive = false;
    await vendor.save();

    const populatedVendor = await Vendor.findById(vendorId).populate('user', 'name email');

    // TODO: Send deactivation email to vendor with reason

    res.json({ 
      success: true, 
      vendor: populatedVendor, 
      message: 'Vendor deactivated successfully',
      reason: reason || 'No reason provided'
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleVendorStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { vendorId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return next(new ApiError(400, 'isActive must be a boolean value'));
    }

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { isActive },
      { new: true },
    ).populate('user', 'name email');

    if (!vendor) {
      return next(new ApiError(404, 'Vendor not found'));
    }

    res.json({ 
      success: true, 
      vendor, 
      message: `Vendor ${isActive ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (err) {
    next(err);
  }
}

// ============ DASHBOARD STATISTICS ============

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const [totalUsers, totalVendors, totalProducts, totalCategories, totalActiveVendors] = await Promise.all([
      User.countDocuments({}),
      Vendor.countDocuments({}),
      Product.countDocuments({}),
      Category.countDocuments({}),
      Vendor.countDocuments({ isApproved: true, isActive: true }),
    ]);

    const [draftProducts, publishedProducts, archivedProducts] = await Promise.all([
      Product.countDocuments({ status: 'draft' }),
      Product.countDocuments({ status: 'published' }),
      Product.countDocuments({ status: 'archived' }),
    ]);

    const [approvedVendors, pendingVendors] = await Promise.all([
      Vendor.countDocuments({ isApproved: true }),
      Vendor.countDocuments({ isApproved: false }),
    ]);

    const stats = {
      users: {
        total: totalUsers,
        verified: await User.countDocuments({ isEmailVerified: true }),
        unverified: await User.countDocuments({ isEmailVerified: false }),
      },
      vendors: {
        total: totalVendors,
        active: totalActiveVendors,
        approved: approvedVendors,
        pending: pendingVendors,
      },
      products: {
        total: totalProducts,
        draft: draftProducts,
        published: publishedProducts,
        archived: archivedProducts,
      },
      categories: {
        total: totalCategories,
      },
    };

    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
}

// ============ CATEGORY MANAGEMENT ============

export async function getAllCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
}

export async function toggleCategoryStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoryId } = req.params;
    const { isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { isActive },
      { new: true },
    );

    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    res.json({ success: true, category, message: `Category ${isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    next(err);
  }
}

// ============ REPORTS & ANALYTICS ============

export async function getVendorPerformance(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, limit = 10, sortBy = 'totalProducts' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [vendors, total] = await Promise.all([
      Vendor.find({ isApproved: true })
        .populate('user', 'name email')
        .skip(skip)
        .limit(Number(limit))
        .sort({ [String(sortBy)]: -1 }),
      Vendor.countDocuments({ isApproved: true }),
    ]);

    res.json({
      success: true,
      vendors,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTopProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.find({ status: 'published' })
      .populate('category', 'name')
      .populate('vendor', 'businessName')
      .sort({ totalReviews: -1, rating: -1 })
      .limit(Number(limit));

    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
}
