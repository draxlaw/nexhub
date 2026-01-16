import Product, { IProduct } from '../models/Product.model';
import Category from '../models/Category.model';
import Vendor from '../models/Vendor.model';
import { ApiError } from '../utils/ApiError';
import { generateSlug } from '../utils/slugGenerator';

interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sku: string;
  costPrice?: number;
  discount?: number;
  discountType?: 'fixed' | 'percentage';
  images?: string[];
  thumbnail?: string;
  vendor?: string;
}

export async function createProduct(dto: CreateProductDto, userId: string, isAdmin: boolean, vendorId?: string) {
  // Validate category exists
  const category = await Category.findById(dto.category);
  if (!category) throw new ApiError(404, 'Category not found');

  // Check SKU is unique
  const existingSku = await Product.findOne({ sku: dto.sku.toUpperCase() });
  if (existingSku) throw new ApiError(400, 'SKU already exists');

  // Determine vendor
  let vendorToUse: string | undefined = undefined;
  
  if (!isAdmin) {
    // Vendor creating their own product
    if (!vendorId) throw new ApiError(403, 'Vendor ID is required for vendor product creation');
    vendorToUse = vendorId;
  } else if (dto.vendor) {
    // Admin assigning to a vendor
    const vendor = await Vendor.findById(dto.vendor);
    if (!vendor) throw new ApiError(404, 'Vendor not found');
    vendorToUse = dto.vendor;
  }

  const slug = generateSlug(dto.name);
  
  const product = new Product({
    ...dto,
    slug,
    vendor: vendorToUse,
    createdBy: userId,
    status: isAdmin ? 'published' : 'draft', // Admin products are published by default, vendor products are draft
  });

  await product.save();

  // Update vendor product count if product is assigned to a vendor
  if (vendorToUse) {
    await Vendor.findByIdAndUpdate(vendorToUse, { $inc: { totalProducts: 1 } });
  }

  return product.populate('category vendor');
}

export async function updateProduct(productId: string, updates: Partial<CreateProductDto>, userId: string, isAdmin: boolean) {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  // Authorization: only creator (admin/vendor) can update
  if (!isAdmin && product.createdBy.toString() !== userId) {
    throw new ApiError(403, 'Not authorized to update this product');
  }

  // Validate category if updating
  if (updates.category) {
    const category = await Category.findById(updates.category);
    if (!category) throw new ApiError(404, 'Category not found');
  }

  // Check SKU uniqueness if updating
  if (updates.sku) {
    const existingProduct = await Product.findOne({
      sku: updates.sku.toUpperCase(),
      _id: { $ne: productId },
    });
    if (existingProduct) throw new ApiError(400, 'SKU already exists');
  }

  // Update slug if name changes
  if (updates.name && updates.name !== product.name) {
    updates as any;
    (product as any).slug = generateSlug(updates.name);
  }

  Object.assign(product, updates);
  await product.save();

  return product.populate('category vendor');
}

export async function getProductById(productId: string) {
  const product = await Product.findById(productId)
    .populate('category')
    .populate('vendor')
    .populate('createdBy', 'name email');

  if (!product) throw new ApiError(404, 'Product not found');
  return product;
}

interface FilterOptions {
  category?: string;
  vendor?: string;
  status?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listProducts(filters: FilterOptions = {}) {
  const {
    category,
    vendor,
    status = 'published',
    isActive = true,
    minPrice,
    maxPrice,
    search,
    page = 1,
    limit = 10,
  } = filters;

  const query: any = {};

  if (category) query.category = category;
  if (vendor) query.vendor = vendor;
  if (status) query.status = status;
  if (isActive !== undefined) query.isActive = isActive;

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.finalPrice = {};
    if (minPrice !== undefined) query.finalPrice.$gte = minPrice;
    if (maxPrice !== undefined) query.finalPrice.$lte = maxPrice;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name')
      .populate('vendor', 'businessName')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Product.countDocuments(query),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function deleteProduct(productId: string, userId: string, isAdmin: boolean) {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  // Authorization: only creator or admin can delete
  if (!isAdmin && product.createdBy.toString() !== userId) {
    throw new ApiError(403, 'Not authorized to delete this product');
  }

  // Decrement vendor product count
  if (product.vendor) {
    await Vendor.findByIdAndUpdate(product.vendor, { $inc: { totalProducts: -1 } });
  }

  await Product.findByIdAndDelete(productId);
  return { message: 'Product deleted successfully' };
}

export async function publishProduct(productId: string, userId: string, isAdmin: boolean) {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  // Only admin can publish, or vendor can publish their own draft products
  if (!isAdmin && product.createdBy.toString() !== userId) {
    throw new ApiError(403, 'Not authorized to publish this product');
  }

  product.status = 'published';
  await product.save();

  return product;
}

export async function vendorProducts(vendorId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find({ vendor: vendorId, isActive: true })
      .populate('category', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Product.countDocuments({ vendor: vendorId, isActive: true }),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getAdminStats(vendorId?: string) {
  const query = vendorId ? { vendor: vendorId } : {};

  const stats = await Product.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: { $sum: { $cond: ['$isActive', 1, 0] } },
        draftProducts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
        publishedProducts: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
        totalStock: { $sum: '$stock' },
        avgPrice: { $avg: '$finalPrice' },
        minPrice: { $min: '$finalPrice' },
        maxPrice: { $max: '$finalPrice' },
      },
    },
  ]);

  return stats[0] || {
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    publishedProducts: 0,
    totalStock: 0,
    avgPrice: 0,
    minPrice: 0,
    maxPrice: 0,
  };
}
