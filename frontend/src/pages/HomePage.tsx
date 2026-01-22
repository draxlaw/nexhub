import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/ui/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const banners = [
  {
    id: 1,
    title: 'Summer Sale',
    subtitle: 'Up to 50% off',
    description: 'Discover amazing deals on electronics, fashion, and more',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80',
    cta: 'Shop Now',
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 2,
    title: 'New Arrivals',
    subtitle: 'Check out the latest',
    description: 'Explore our newest collection of products',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80',
    cta: 'Explore',
    color: 'from-purple-600 to-purple-800',
  },
  {
    id: 3,
    title: 'Electronics Week',
    subtitle: 'Tech deals up to 40% off',
    description: 'Upgrade your gadgets with exclusive discounts',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1600&q=80',
    cta: 'View Deals',
    color: 'from-green-600 to-green-800',
  },
];

const categories = [
  { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80', slug: 'Electronics' },
  { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80', slug: 'Fashion' },
  { name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', slug: 'Home' },
  { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80', slug: 'Beauty' },
  { name: 'Sports', image: 'https://images.unsplash.com/photo-1461896836934- voices-of-the-deep?w=400&q=80', slug: 'Sports' },
  { name: 'Toys & Games', image: 'https://images.unsplash.com/photo-1515488042361-ee00651a6a51?w=400&q=80', slug: 'Toys' },
  { name: 'Books', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', slug: 'Books' },
  { name: 'Automotive', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80', slug: 'Automotive' },
];

const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector((state: RootState) => state.products);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 16, featured: true }));
  }, [dispatch]);

  // Auto-rotate banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Group products into sections
  const featuredProducts = products.slice(0, 8);
  const newArrivals = products.slice(8, 16);

  return (
    <div className="bg-amazon-light min-h-screen">
      {/* Hero Banner Carousel */}
      <div className="relative h-[500px] overflow-hidden">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentBanner ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background image with gradient overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${banner.color} opacity-90`}
            />
            <img
              src={banner.image}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
            />
            
            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-xl">
                  <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
                    {banner.title}
                  </h2>
                  <p className="text-2xl text-white mb-4">{banner.subtitle}</p>
                  <p className="text-white mb-6 text-lg">{banner.description}</p>
                  <Link
                    to="/products"
                    className="inline-block bg-amazon-yellow hover:bg-yellow-500 text-black px-8 py-3 rounded-md font-bold text-lg transition-colors"
                  >
                    {banner.cta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation arrows */}
        <button
          onClick={prevBanner}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors"
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-900" />
        </button>
        <button
          onClick={nextBanner}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors"
        >
          <ChevronRightIcon className="h-6 w-6 text-gray-900" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentBanner ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/products?category=${category.slug}`}
              className="bg-white rounded-lg overflow-hidden shadow-amazon hover:shadow-amazon-hover transition-shadow group"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products Section */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Deal of the Day */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-amazon p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-900">Deal of the Day</h2>
                  <div className="bg-amazon-red text-white px-3 py-1 rounded-full text-sm font-bold">
                    Ends soon
                  </div>
                </div>
                <Link to="/products?deal=true" className="text-amazon-blue hover:underline text-sm font-medium">
                  See all deals
                </Link>
              </div>
              
              {featuredProducts.length > 0 && (
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/2">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={featuredProducts[0].images[0] || '/placeholder-product.jpg'}
                        alt={featuredProducts[0].name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <div className="md:w-1/2 flex flex-col justify-center">
                    <Link to={`/products/${featuredProducts[0]._id}`}>
                      <h3 className="text-xl font-medium text-gray-900 mb-2 hover:text-amazon-blue">
                        {featuredProducts[0].name}
                      </h3>
                    </Link>
                    <div className="flex items-center mb-3">
                      <div className="flex text-amazon-yellow">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(featuredProducts[0].rating || 0)
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
                      <span className="ml-2 text-sm text-gray-500">
                        ({featuredProducts[0].reviewCount || 0})
                      </span>
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-amazon-red">
                        ${featuredProducts[0].price.toFixed(2)}
                      </span>
                      {featuredProducts[0].originalPrice && (
                        <span className="ml-3 text-lg text-gray-500 line-through">
                          ${featuredProducts[0].originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {featuredProducts[0].description}
                    </p>
                    <Link
                      to={`/products/${featuredProducts[0]._id}`}
                      className="btn-orange inline-block w-full md:w-auto text-center"
                    >
                      View Deal
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Featured Products Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Best Sellers</h2>
              <Link to="/products" className="text-amazon-blue hover:underline text-sm font-medium">
                See more
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>

          {/* New Arrivals */}
          {newArrivals.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
                <Link to="/products?sort=newest" className="text-amazon-blue hover:underline text-sm font-medium">
                  See more
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {newArrivals.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Features Section */}
      <div className="bg-amazon-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="font-bold mb-2">Free Delivery</h3>
              <p className="text-sm text-gray-300">On orders over ₦10,000</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="font-bold mb-2">Easy Returns</h3>
              <p className="text-sm text-gray-300">30-day return policy</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-bold mb-2">Secure Payment</h3>
              <p className="text-sm text-gray-300">100% secure checkout</p>
            </div>
            <div>
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-bold mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-300">Dedicated support team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Become a Seller CTA */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start Selling on Nexus Hub
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of vendors reaching millions of customers across Nigeria and beyond.
          </p>
          <Link
            to="/vendor/register"
            className="inline-block btn-orange px-8 py-3 rounded-md font-bold text-lg"
          >
            Become a Seller
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
