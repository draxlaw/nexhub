import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category.model';
import { ApiError } from '../utils/ApiError';
import { generateSlug } from '../utils/slugGenerator';

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description, image } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return next(new ApiError(400, 'Category already exists'));
    }

    const slug = generateSlug(name);

    const category = new Category({
      name,
      slug,
      description,
      image,
    });

    await category.save();
    res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoryId } = req.params;
    const { name, description, image, isActive } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    // Check if name is being changed and already exists
    if (name && name !== category.name) {
      const existing = await Category.findOne({ name });
      if (existing) {
        return next(new ApiError(400, 'Category name already exists'));
      }
      category.slug = generateSlug(name);
      category.name = name;
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const { isActive } = req.query;

    const query: any = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const categories = await Category.find(query).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
}

export async function getCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoryId } = req.params;

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
}
