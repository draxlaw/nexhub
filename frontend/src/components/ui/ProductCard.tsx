import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { addToCart } from '../../store/slices/cartSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { Product } from '../../types';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface ProductCardProps {
  product: Product;
  onAddToWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

const ProductCard = ({ product, onAddToWishlist, isInWishlist }: ProductCardProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleAddToCart = () => {
    dispatch(addToCart({
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
      },
      quantity: 1,
    }));

    dispatch(addNotification({
      type: 'success',
      message: `${product.name} added to cart`,
      duration: 3000,
    }));
  };

  const handleAddToWishlist = () => {
    if (onAddToWishlist) {
      onAddToWishlist(product._id);
    }
  };

  // Calculate discount percentage
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  return (
    <div className="amazon-card group cursor-pointer">
      <div className="relative p-4">
        <Link to={`/products/${product._id}`} className="block">
          <img
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-64 object-contain group-hover:scale-105 transition-transform duration-200"
          />
        </Link>
        
        {/* Wishlist button */}
        <button
          onClick={handleAddToWishlist}
          className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors duration-200 z-10"
        >
          {isInWishlist ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {/* Discount badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-amazon-red text-white px-2 py-1 rounded-md text-sm font-bold">
            -{discountPercent}%
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="mb-2">
          <Link to={`/products/${product._id}`} className="block">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-amazon-blue transition-colors duration-200 group-hover:text-amazon-blue">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-amazon-yellow text-sm">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating || 0)
                    ? 'text-amazon-yellow'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <Link 
            to={`/products/${product._id}#reviews`}
            className="ml-2 text-xs text-amazon-blue hover:underline"
          >
            {product.reviewCount || 0}
          </Link>
        </div>

        {/* Price */}
        <div className="mb-3">
          {product.originalPrice && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amazon-red">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            </div>
          )}
          {!product.originalPrice && (
            <span className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          )}
          {product.discount && (
            <div className="text-sm text-amazon-red font-bold mt-1">
              Save {product.discount}%
            </div>
          )}
        </div>

        {/* Delivery info */}
        <div className="text-xs text-gray-600 mb-3">
          <span className="text-amazon-green font-bold">FREE delivery</span>
          <span className="ml-1">Nigeria</span>
        </div>

        {/* Stock status */}
        <div className="mb-3">
          {product.stock > 0 ? (
            <span className="text-sm font-medium text-amazon-green">
              In Stock
            </span>
          ) : (
            <span className="text-sm font-medium text-amazon-red">
              Out of Stock
            </span>
          )}
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full py-2 rounded-md text-sm font-bold transition-colors duration-200 ${
            product.stock > 0
              ? 'bg-amazon-yellow hover:bg-yellow-500 text-black border border-yellow-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>

        {/* Prime badge (optional - for featured products) */}
        {'featured' in product && product.featured && (
          <div className="mt-2">
            <span className="text-xs font-bold text-amazon-blue uppercase">Prime</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
