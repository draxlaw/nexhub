import { CheckCircleIcon, UsersIcon, ShoppingBagIcon, TrophyIcon } from '@heroicons/react/24/outline';

const AboutPage = () => {
  const stats = [
    { label: 'Happy Customers', value: '50,000+', icon: UsersIcon },
    { label: 'Products Sold', value: '1M+', icon: ShoppingBagIcon },
    { label: 'Years of Service', value: '5+', icon: TrophyIcon },
    { label: 'Vendor Partners', value: '500+', icon: CheckCircleIcon },
  ];

  const values = [
    {
      title: 'Quality First',
      description: 'We ensure every product meets our high standards for quality and reliability.',
      icon: CheckCircleIcon,
    },
    {
      title: 'Customer Satisfaction',
      description: 'Your satisfaction is our top priority. We strive to exceed your expectations.',
      icon: UsersIcon,
    },
    {
      title: 'Innovation',
      description: 'We continuously innovate to bring you the latest and greatest products.',
      icon: TrophyIcon,
    },
    {
      title: 'Community',
      description: 'We support local vendors and contribute to the communities we serve.',
      icon: ShoppingBagIcon,
    },
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: '/placeholder-avatar.jpg',
      bio: 'Passionate about connecting customers with amazing products.',
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: '/placeholder-avatar.jpg',
      bio: 'Tech enthusiast focused on building scalable e-commerce solutions.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Customer Success',
      image: '/placeholder-avatar.jpg',
      bio: 'Dedicated to ensuring every customer has an exceptional experience.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Nexus Hub</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're on a mission to revolutionize e-commerce by connecting customers with exceptional products
          from trusted vendors worldwide.
        </p>
      </div>

      {/* Stats Section */}
      <div className="bg-white shadow rounded-lg p-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <stat.icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Founded in 2019, Nexus Hub began as a small marketplace connecting local artisans with
              customers who valued quality craftsmanship. What started as a passion project quickly
              grew into a thriving e-commerce platform.
            </p>
            <p>
              Today, we serve thousands of customers across the globe, offering a curated selection
              of products from hundreds of trusted vendors. Our commitment to quality, customer
              satisfaction, and innovation drives everything we do.
            </p>
            <p>
              We're not just a marketplace – we're a community. A place where vendors can grow their
              businesses and customers can discover products that enrich their lives.
            </p>
          </div>
        </div>
        <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-24 w-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p>Company Image</p>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <value.icon className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-6 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-blue-600 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Statement */}
      <div className="bg-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-xl text-gray-700 max-w-4xl mx-auto">
          To create a marketplace that empowers vendors, delights customers, and fosters meaningful
          connections between people and the products they love. We believe in commerce that serves
          both people and planet.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
