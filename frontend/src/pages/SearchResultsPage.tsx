import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchProducts } from '../store/slices/productSlice';
import { ProductFilters } from '../types';
import ProductCard from '../components/ui/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import Breadcrumbs from '../components/ui/Breadcrumbs';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error, pagination } = useSelector((state: RootState) => state.products);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (query) {
      dispatch(fetchProducts({
        search: query,
        category: category || undefined,
        sort: sort as ProductFilters['sort'],
        page: currentPage,
        limit: 12,
      }));
    }
  }, [dispatch, query, category, sort, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: `Search results for "${query}"` },
  ];

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No search query</h2>
          <p className="text-gray-600">Please enter a search term to find products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search Results
        </h1>
        <p className="text-gray-600">
          {pagination?.total || 0} results for "{query}"
          {category && ` in ${category}`}
        </p>
      </div>

      {/* Filters and Sorting */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => {
              const newSort = e.target.value;
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set('sort', newSort);
              window.location.search = newSearchParams.toString();
            }}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {products.length} of {pagination?.total || 0} results
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">
            We couldn't find any products matching "{query}".
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Try:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Checking your spelling</li>
              <li>• Using different keywords</li>
              <li>• Using more general terms</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;
