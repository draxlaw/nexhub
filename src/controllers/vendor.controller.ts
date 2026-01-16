import { Request, Response, NextFunction } from 'express';
import Vendor from '../models/Vendor.model';
import User from '../models/User.model';
import { ApiError } from '../utils/ApiError';

export async function registerVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const { businessName, businessEmail, description, phone, address, city, state, zipCode, country } = req.body;

    // Check if vendor already exists for this user
    const existing = await Vendor.findOne({ user: user._id });
    if (existing) {
      return next(new ApiError(400, 'You already have a vendor account'));
    }

    const vendor = new Vendor({
      user: user._id,
      businessName,
      businessEmail,
      description,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
    });

    await vendor.save();

    // Add vendor role to user
    if (!user.roles.includes('vendor')) {
      await User.findByIdAndUpdate(user._id, { $push: { roles: 'vendor' } });
    }

    res.status(201).json({ success: true, vendor, message: 'Vendor application submitted. Awaiting admin approval.' });
  } catch (err) {
    next(err);
  }
}

export async function getVendorProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;

    const vendor = await Vendor.findOne({ user: user._id }).populate('user', 'name email');
    if (!vendor) {
      return next(new ApiError(404, 'Vendor profile not found'));
    }

    res.json({ success: true, vendor });
  } catch (err) {
    next(err);
  }
}

export async function updateVendorProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const { businessName, businessEmail, description, logo, bannerImage, phone, address, city, state, zipCode, country } = req.body;

    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return next(new ApiError(404, 'Vendor profile not found'));
    }

    if (businessName) vendor.businessName = businessName;
    if (businessEmail) vendor.businessEmail = businessEmail;
    if (description !== undefined) vendor.description = description;
    if (logo) vendor.logo = logo;
    if (bannerImage) vendor.bannerImage = bannerImage;
    if (phone) vendor.phone = phone;
    if (address) vendor.address = address;
    if (city) vendor.city = city;
    if (state) vendor.state = state;
    if (zipCode) vendor.zipCode = zipCode;
    if (country) vendor.country = country;

    await vendor.save();
    res.json({ success: true, vendor, message: 'Vendor profile updated' });
  } catch (err) {
    next(err);
  }
}

export async function getAllVendors(req: Request, res: Response, next: NextFunction) {
  try {
    const { isApproved, isActive, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [vendors, total] = await Promise.all([
      Vendor.find(query)
        .populate('user', 'name email')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Vendor.countDocuments(query),
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

export async function getVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId).populate('user', 'name email');
    if (!vendor) {
      return next(new ApiError(404, 'Vendor not found'));
    }

    res.json({ success: true, vendor });
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

    res.json({ success: true, vendor, message: 'Vendor approved successfully' });
  } catch (err) {
    next(err);
  }
}

export async function rejectVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(vendorId, { isActive: false }, { new: true }).populate('user', 'name email');

    if (!vendor) {
      return next(new ApiError(404, 'Vendor not found'));
    }

    // TODO: Send email to vendor with rejection reason

    res.json({ success: true, vendor, message: 'Vendor rejected' });
  } catch (err) {
    next(err);
  }
}

export async function deactivateVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findByIdAndUpdate(vendorId, { isActive: false }, { new: true });

    if (!vendor) {
      return next(new ApiError(404, 'Vendor not found'));
    }

    res.json({ success: true, vendor, message: 'Vendor deactivated' });
  } catch (err) {
    next(err);
  }
}
