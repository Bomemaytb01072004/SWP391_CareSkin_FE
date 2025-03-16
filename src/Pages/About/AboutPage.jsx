import React from 'react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import {
  faLeaf,
  faFlask,
  faHandHoldingHeart,
  faUsers,
  faSeedling,
} from '@fortawesome/free-solid-svg-icons';

function AboutPage() {
  // Team members data
  const teamMembers = [
    {
      name: 'Dr. Emily Chen',
      role: 'Founder & Chief Formulator',
      bio: 'With over 15 years of experience in cosmetic chemistry and dermatology, Dr. Chen founded our company with a mission to create effective, science-backed skincare accessible to everyone.',
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
    },
    {
      name: 'Michael Rodriguez',
      role: 'Chief Operations Officer',
      bio: 'Michael brings 10+ years of experience in sustainable supply chain management, ensuring our products are not only effective but ethically produced.',
      image: 'https://ss-images.saostar.vn/2018/09/05/3606624/ds-tien-2.jpg',
    },
    {
      name: 'Dr. Sarah Kim',
      role: 'Head of Research',
      bio: 'A respected dermatological researcher with publications in leading journals, Dr. Kim leads our R&D team in developing innovative formulations.',
      image:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80',
    },
    {
      name: 'David Patel',
      role: 'Sustainability Director',
      bio: 'David oversees our environmental initiatives, from sustainable sourcing to our zero-waste packaging program and carbon offset projects.',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80',
    },
  ];

  // Company timeline data
  const companyTimeline = [
    {
      year: '2018',
      title: 'The Beginning',
      description:
        "Founded in Dr. Chen's lab with a vision to create accessible, science-backed skincare.",
    },
    {
      year: '2019',
      title: 'First Product Line',
      description:
        'Launched our core collection focusing on hydration and barrier repair.',
    },
    {
      year: '2020',
      title: 'Sustainable Packaging',
      description:
        'Transitioned to fully recyclable and biodegradable packaging across all product lines.',
    },
    {
      year: '2021',
      title: 'International Expansion',
      description:
        'Expanded distribution to 12 countries while maintaining our commitment to sustainability.',
    },
    {
      year: '2023',
      title: 'Certified B Corporation',
      description:
        'Achieved B Corp certification, recognizing our commitment to social and environmental performance.',
    },
    {
      year: '2025',
      title: 'Innovation Center',
      description:
        'Opened our new research facility dedicated to next-generation sustainable skincare.',
    },
  ];

  // Values data
  const coreValues = [
    {
      icon: faLeaf,
      title: 'Sustainability',
      description:
        "We're committed to minimizing our environmental footprint at every step, from ingredient sourcing to packaging.",
    },
    {
      icon: faFlask,
      title: 'Science-Based',
      description:
        'Every formula is backed by research and clinically tested to ensure safety and efficacy.',
    },
    {
      icon: faHandHoldingHeart,
      title: 'Accessibility',
      description:
        'We believe everyone deserves access to effective skincare at reasonable prices.',
    },
    {
      icon: faUsers,
      title: 'Inclusivity',
      description:
        'Our products are formulated for all skin types, tones, and concerns.',
    },
  ];

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <motion.div
        className="bg-emerald-50 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex mt-16 flex-col md:flex-row gap-12 items-center">
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
                Our Story
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Founded in 2018 by Dr. Emily Chen, our journey began with a
                simple mission: to create effective, science-backed skincare
                that's accessible to everyone.
              </p>
              <p className="text-lg text-gray-600">
                We believe that skin health shouldn't be complicated or
                exclusive. With transparent formulations and sustainable
                practices, we're changing the skincare industry one product at a
                time.
              </p>
            </motion.div>
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
                alt="Our laboratory"
                className="rounded-lg shadow-lg w-full h-auto object-cover"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Our Mission */}
      <motion.div
        className="py-20 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Our Mission</h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            We believe that effective skincare should be accessible to everyone.
            Our mission is to demystify skincare by providing science-backed
            formulations, personalized recommendations, and honest education —
            all at prices that make sense.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon
                  icon={faHandHoldingHeart}
                  className="text-emerald-600 text-2xl"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">For People</h3>
              <p className="text-gray-600">
                Creating products that genuinely improve skin health and
                confidence
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon
                  icon={faLeaf}
                  className="text-emerald-600 text-2xl"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">For Planet</h3>
              <p className="text-gray-600">
                Minimizing our environmental impact through sustainable
                practices
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon
                  icon={faSeedling}
                  className="text-emerald-600 text-2xl"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">For Progress</h3>
              <p className="text-gray-600">
                Advancing skincare science through research and innovation
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Our Values */}
      <motion.div
        className="py-20 bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <FontAwesomeIcon
                    icon={value.icon}
                    className="text-emerald-600 text-2xl"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Our Journey */}
      <motion.div
        className="py-20 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">
            Our Journey
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-emerald-100"></div>

            {/* Timeline events */}
            <div className="relative z-10">
              {companyTimeline.map((event, index) => (
                <motion.div
                  key={index}
                  className={`mb-12 flex items-center justify-between ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <div
                    className={`w-5/12 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}
                  >
                    <h3 className="text-xl font-bold text-emerald-600">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 mt-2">{event.description}</p>
                  </div>
                  <div className="z-20">
                    <div className="bg-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                      <span className="font-bold">{event.year}</span>
                    </div>
                  </div>
                  <div className="w-5/12"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Meet Our Team */}
      <motion.div
        className="py-20 bg-emerald-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
            Meet Our Team
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            The passionate experts behind our products, committed to
            revolutionizing skincare through science and sustainability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-sm"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={member.image || `/api/placeholder/300/300`}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-emerald-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Our Commitment to Sustainability */}
      <motion.div
        className="py-20 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Our Commitment to Sustainability
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We believe that skincare shouldn't come at the expense of our
                planet. That's why sustainability is at the core of everything
                we do, from ingredient sourcing to packaging and shipping.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">✓</span>
                  <span className="text-gray-600">
                    100% recyclable or biodegradable packaging
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">✓</span>
                  <span className="text-gray-600">
                    Ethically sourced ingredients
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">✓</span>
                  <span className="text-gray-600">Carbon-neutral shipping</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">✓</span>
                  <span className="text-gray-600">
                    Zero-waste production facility
                  </span>
                </li>
              </ul>
            </motion.div>
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
                alt="Sustainability"
                className="rounded-lg shadow-lg w-full h-auto object-cover"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <Footer />
    </>
  );
}

export default AboutPage;
