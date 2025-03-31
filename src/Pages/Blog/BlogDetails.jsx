import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faClock,
  faCalendarAlt,
  faShare,
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebookF,
  faTwitter,
  faLinkedinIn,
  faPinterestP,
} from '@fortawesome/free-brands-svg-icons';
import ReactMarkdown from 'react-markdown'; // We'll keep this for Markdown support
import styles from './Blog.module.css'; // Import the CSS module
import { extractBlogId, generateBlogSlug } from '../../utils/urlUtils'; // Add import for the extraction utility

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function BlogDetails() {
  const { blogSlug } = useParams();
  const blogId = extractBlogId(blogSlug); // Update how the blog ID is obtained from params
  const navigate = useNavigate();
  const [readingProgress, setReadingProgress] = useState(0);
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Reading progress tracking
  useEffect(() => {
    const scrollListener = () => {
      if (!document.body) return;

      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', scrollListener);
    return () => window.removeEventListener('scroll', scrollListener);
  }, []);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${backendUrl}/api/BlogNews/${blogId}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setBlog(data);

        // Scroll to top when blog loads
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error('Fetch error:', error);
        setErrorMessage('Failed to load blog details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedBlogs = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/BlogNews`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        // Filter out current blog and get up to 3 related blogs
        const filtered = data
          .filter((item) => item.BlogId !== parseInt(blogId) && item.IsActive)
          .slice(0, 3);
        setRelatedBlogs(filtered);
      } catch (error) {
        console.error('Fetch related blogs error:', error);
      }
    };

    fetchBlogDetails();
    fetchRelatedBlogs();
  }, [blogId]);

  // Format date function with better handling of UploadDate format
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'string') return '';

    try {
      // Handle the new format "MM/DD/YYYY hh:mm:ss AM/PM"
      if (dateString.includes('/')) {
        const datePart = dateString.split(' ')[0]; // MM/DD/YYYY
        const [month, day, year] = datePart.split('/');
        const date = new Date(`${year}-${month}-${day}`);

        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      // Handle ISO date format
      else {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    } catch (error) {
      console.error('Error parsing date:', error, dateString);
      return 'Invalid date';
    }
  };

  // Extract and format just the time part
  const formatTimeOnly = (dateString) => {
    if (!dateString || dateString === 'string') return '';

    try {
      // Handle the new format "MM/DD/YYYY hh:mm:ss AM/PM"
      if (dateString.includes('/')) {
        const parts = dateString.split(' ');
        if (parts.length >= 3) {
          const timePart = `${parts[1]} ${parts[2]}`; // hh:mm:ss AM/PM
          const [time, period] = timePart.split(' ');
          const [hours, minutes] = time.split(':');
          return `${hours}:${minutes} ${period}`;
        }
        return '';
      }
      // Handle ISO date format
      else {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        });
      }
    } catch (error) {
      console.error('Error parsing time:', error, dateString);
      return '';
    }
  };

  // Function to calculate reading time based on word count
  const calculateReadingTime = (content) => {
    if (!content || content === 'string') return '1 min read';
    const words = content.split(' ').length;
    const readingTime = Math.ceil(words / 200); // Assuming 200 words per minute
    return `${readingTime} min read`;
  };

  // Function to create HTML markup from blog content
  const createMarkup = (content) => {
    return { __html: content };
  };

  // Enhanced handleShare function with better feedback
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = blog?.Title || 'CareSkin Blog';

    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'pinterest':
        if (blog?.PictureUrl) {
          window.open(
            `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(blog.PictureUrl)}&description=${encodeURIComponent(title)}`,
            '_blank',
            'width=600,height=400'
          );
        } else {
          window.open(
            `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
            '_blank',
            'width=600,height=400'
          );
        }
        break;
      case 'copy':
        navigator.clipboard
          .writeText(url)
          .then(() => {
            // Show notification
            const notification = document.getElementById('copyNotification');
            if (notification) {
              notification.style.display = 'block';
              setTimeout(() => {
                notification.style.display = 'none';
              }, 2000);
            } else {
              // Fallback if element not found
              alert('Link copied to clipboard!');
            }
          })
          .catch((err) => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy link. Please try again.');
          });
        break;
      default:
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    }
  };

  // Function to detect content type
  const determineContentType = (content) => {
    if (!content || content === 'string') return 'empty';
    if (
      content.includes('<') &&
      (content.includes('</') || content.includes('/>'))
    )
      return 'html';
    if (
      content.includes('#') ||
      content.includes('**') ||
      content.includes('```')
    )
      return 'markdown';
    return 'plaintext';
  };

  // Enhanced preprocessPlainText function with comprehensive Markdown formatting
  const preprocessPlainText = (content) => {
    // First, normalize the content to handle inconsistent spacing
    let processed = content.trim();

    // STRUCTURE FORMATTING

    // Add spacing between sections if they run together (e.g., "section 1. section 2.")
    processed = processed.replace(
      /(\d+)\.\s+([A-Z][a-zA-Z\s]+)\s+(\d+)\./g,
      '$1. $2\n\n$3.'
    );

    // Format main numbered sections with proper Markdown heading (1., 2., 3.)
    processed = processed.replace(
      /(\d+)\.\s+([A-Z][a-zA-Z\s]+)/g,
      '\n\n## $1. $2\n\n'
    );

    // Format subsections with proper Markdown subheading (2.1, 3.2)
    processed = processed.replace(
      /(\d+\.\d+)\s+([A-Z][a-zA-Z\s]+)/g,
      '\n\n### $1 $2\n\n'
    );

    // LISTS FORMATTING

    // Convert dash/hyphen bullets to proper Markdown list items
    processed = processed.replace(/\s+-\s+([A-Z])/g, '\n- $1');

    // Format standalone product names as list items
    processed = processed.replace(
      /(^|\s)(Anessa|Eucerin|Bioderma|Skin1004)(\s|$)/g,
      '\n- $2'
    );

    // SPECIFIC SKINCARE PRODUCT FORMATTING

    // Process sunscreen recommendations into proper lists
    processed = processed.replace(
      /(include\:)(.*?)(Anessa|Eucerin|Bioderma|Skin1004)/g,
      '$1\n- $3'
    );
    processed = processed.replace(
      /(SPF\d+\+\/PA\+{4})\s+(Eucerin)/g,
      '$1\n- $2'
    );
    processed = processed.replace(/(SPF\s+\d+\+)\s+(Bioderma)/g, '$1\n- $2');
    processed = processed.replace(/(\(Invisible\))\s+(Skin1004)/g, '$1\n- $2');
    processed = processed.replace(/(\+{4}\s+)([A-Z])/g, '\n- $2');
    processed = processed.replace(/(SPF\d+\+\s+PA\+{4})/g, '$1\n\n');

    // PARAGRAPH BREAKS FORMATTING

    // Fix paragraph breaks for important transitions
    const transitions = [
      'Therefore',
      'However',
      'Additionally',
      'Furthermore',
      'Consequently',
      'In conclusion',
      'To summarize',
      'In this article',
      'Understanding',
      'If you have',
      'Below are',
      'For this reason',
    ];

    transitions.forEach((transition) => {
      const regex = new RegExp(`\\.\\s+(${transition})`, 'g');
      processed = processed.replace(regex, '.\n\n$1');
    });

    // Add paragraph breaks after sentences that complete a thought
    processed = processed.replace(
      /(\.\s+)([A-Z][a-zA-Z]+\s+(?:is|are|has|have|can|may|will|should)\s+)/g,
      '.\n\n$2'
    );

    // EMPHASIS AND HIGHLIGHTING

    // Add emphasis to important skincare terms
    const keyTerms = [
      'sensitive skin',
      'hydration',
      'SPF',
      'sunscreen',
      'UV protection',
      'moisturizer',
      'cleanser',
      'exfoliation',
    ];

    keyTerms.forEach((term) => {
      const regex = new RegExp(`\\b(${term})\\b`, 'gi');
      processed = processed.replace(regex, '**$1**');
    });

    // Highlight recommended products
    processed = processed.replace(/\b(recommended)\b/gi, '**$1**');

    // CLEANUP

    // Clean up any excessive newlines
    processed = processed.replace(/\n{3,}/g, '\n\n');

    // Ensure consistent paragraph spacing
    processed = processed.replace(/\.\s+(\n+)/g, '.\n\n');

    // Format numbered lists for better Markdown compatibility
    processed = processed.replace(/^\d+\.\s+/gm, '$&');

    return processed;
  };

  // Function to render content dynamically - Updated without DOMPurify and react-syntax-highlighter
  const renderContent = (content) => {
    if (!content || content === 'string') {
      return <p className="text-gray-600 italic">No content available.</p>;
    }

    const contentType = determineContentType(content);

    switch (contentType) {
      case 'html':
        // Instead of using dangerouslySetInnerHTML with DOMPurify,
        // we'll convert HTML to simple text with some basic formatting
        return (
          <div className="blog-content">
            {/* Use a simple approach to display HTML content as text */}
            {convertHtmlToText(content)}
          </div>
        );

      case 'markdown':
        return (
          <div className={styles['markdown-content']}>
            <ReactMarkdown
              components={{
                // Simple code block renderer without syntax highlighting
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="bg-gray-800 rounded-md p-4 my-4 overflow-auto">
                      <pre className="text-gray-100 text-sm">
                        <code
                          {...props}
                          className={`language-${match[1]} block`}
                        >
                          {String(children).replace(/\n$/, '')}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code
                      className={`bg-gray-100 px-1 py-0.5 rounded text-pink-600 ${className}`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        );

      case 'plaintext':
      default:
        // Your existing plaintext handling logic
        if (
          content.match(/\d+\.\s+/) ||
          content.match(/\s*-\s+/) ||
          content.includes('Sensitive skin') ||
          content.includes('SPF')
        ) {
          // Convert plain text to markdown format
          const processedContent = preprocessPlainText(content);

          return (
            <div className={styles['markdown-content']}>
              <ReactMarkdown
                components={{
                  // Your existing custom components
                  h2: ({ node, children }) => (
                    <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4 pb-2 border-b border-gray-100">
                      {children}
                    </h2>
                  ),
                  // ... other component overrides remain the same
                }}
              >
                {processedContent}
              </ReactMarkdown>
            </div>
          );
        }

        // For simple plain text without structure
        return content.split('\n\n').map((paragraph, i) => (
          <p key={i} className="mb-4 leading-relaxed text-gray-700">
            {paragraph.split('\n').map((line, j) => (
              <React.Fragment key={j}>
                {line}
                {j < paragraph.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        ));
    }
  };

  // New helper function to handle HTML content without DOMPurify
  const convertHtmlToText = (html) => {
    // Create a very simple HTML-like renderer that extracts text from common tags
    const paragraphs = html.split(/<\/?p>/).filter((p) => p.trim().length > 0);

    return (
      <>
        {paragraphs.map((p, i) => {
          // Extract heading text (h1-h6)
          const headingMatch = p.match(/<h([1-6])>(.*?)<\/h\1>/);
          if (headingMatch) {
            const level = parseInt(headingMatch[1]);
            const text = headingMatch[2].replace(/<[^>]*>/g, '');
            const className = `text-${5 - level}xl font-bold text-gray-800 mt-8 mb-4`;
            return (
              <div key={i} className={className}>
                {text}
              </div>
            );
          }

          // Extract lists
          if (p.includes('<ul>') || p.includes('<ol>')) {
            const items = p.match(/<li>(.*?)<\/li>/g) || [];
            const listItems = items.map((item, j) => {
              const text = item
                .replace(/<li>(.*?)<\/li>/, '$1')
                .replace(/<[^>]*>/g, '');
              return (
                <li key={j} className="ml-5 mb-2">
                  {text}
                </li>
              );
            });

            return p.includes('<ul>') ? (
              <ul key={i} className="list-disc mb-4">
                {listItems}
              </ul>
            ) : (
              <ol key={i} className="list-decimal mb-4">
                {listItems}
              </ol>
            );
          }

          // Handle basic formatting
          let content = p
            .replace(
              /<strong>(.*?)<\/strong>/g,
              '<span class="font-bold">$1</span>'
            )
            .replace(/<em>(.*?)<\/em>/g, '<span class="italic">$1</span>')
            .replace(
              /<a href="(.*?)">(.*?)<\/a>/g,
              '<span class="text-emerald-600 underline">$2</span>'
            )
            .replace(/<[^>]*>/g, '');

          // Parse the pseudo-HTML we created
          if (content.includes('<span')) {
            const parts = [];
            let lastIndex = 0;

            // Very simple parser for span elements
            const regex = /<span class="([^"]*)">(.*?)<\/span>/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
              if (match.index > lastIndex) {
                parts.push(
                  <span key={`text-${lastIndex}`}>
                    {content.substring(lastIndex, match.index)}
                  </span>
                );
              }

              parts.push(
                <span key={`formatted-${match.index}`} className={match[1]}>
                  {match[2]}
                </span>
              );

              lastIndex = match.index + match[0].length;
            }

            if (lastIndex < content.length) {
              parts.push(
                <span key={`text-end`}>{content.substring(lastIndex)}</span>
              );
            }

            return (
              <p key={i} className="mb-4 leading-relaxed text-gray-700">
                {parts}
              </p>
            );
          }

          return (
            <p key={i} className="mb-4 leading-relaxed text-gray-700">
              {content}
            </p>
          );
        })}
      </>
    );
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-emerald-50 to-white py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-emerald-700">Loading blog details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (errorMessage) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-emerald-50 to-white py-20 px-4">
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-red-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => navigate('/blogs')}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Blogs
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // If blog doesn't exist
  if (!blog) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-emerald-50 to-white py-20 px-4">
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-amber-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M20 18v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6c0 1.1.9 2 2 2h12a2 2 0 002-2z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Blog Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The blog post you're looking for doesn't exist or has been
              removed.
            </p>
            <button
              onClick={() => navigate('/blogs')}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Blogs
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className={styles.readingProgressContainer}>
        <div
          className={styles.readingProgress}
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Enhanced reading progress bar with animation */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-100 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
          initial={{ width: '0%' }}
          animate={{ width: `${readingProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Hero section with blog cover image - ENHANCED */}
      <motion.div
        className="relative w-full bg-gradient-to-r from-emerald-50 to-teal-50 pt-20 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background pattern for hero section */}
        <div className="absolute inset-0 z-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern
              id="pattern-circles"
              x="0"
              y="0"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
              patternContentUnits="userSpaceOnUse"
            >
              <circle
                id="pattern-circle"
                cx="10"
                cy="10"
                r="1.6257413380501518"
                fill="#047857"
              ></circle>
            </pattern>
            <rect
              id="rect"
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#pattern-circles)"
            ></rect>
          </svg>
        </div>

        <div className="container mx-auto px-4 py-8 mt-10 relative z-10">
          {/* Breadcrumb & back button - ENHANCED */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/blogs')}
              className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors border border-emerald-200 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full px-4 py-2 shadow-sm hover:shadow transition-all"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              <span>Back to Blogs</span>
            </button>
          </div>

          {/* Blog Header Section - ENHANCED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            {/* Category - ENHANCED */}
            <div className="mb-3">
              <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                Skincare
              </span>
            </div>

            {/* Blog Title - ENHANCED */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight">
              {blog.Title !== 'string' ? blog.Title : 'Untitled Blog'}
            </h1>

            {/* Meta info - ENHANCED with separate date and time */}
            <div className="flex flex-wrap items-center text-gray-600 mb-6 bg-white bg-opacity-70 rounded-lg p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center mr-6 mb-2">
                <div className="bg-emerald-100 p-2 rounded-full mr-3">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="text-emerald-600"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Published on</div>
                  <div className="font-medium">
                    {formatDate(blog.UploadDate || blog.CreateDate) ||
                      'No date available'}
                  </div>
                </div>
              </div>

              <div className="flex items-center mr-6 mb-2">
                <div className="bg-emerald-100 p-2 rounded-full mr-3">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="text-emerald-600"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-500">At time</div>
                  <div className="font-medium">
                    {formatTimeOnly(blog.UploadDate || blog.CreateDate) ||
                      'Unknown time'}
                  </div>
                </div>
              </div>

              <div className="flex items-center mb-2">
                <div className="bg-emerald-100 p-2 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Reading time</div>
                  <div className="font-medium">
                    {calculateReadingTime(blog.Content)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main blog content - ENHANCED */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image - ENHANCED */}
          {blog.PictureUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-8 rounded-xl overflow-hidden shadow-lg relative"
            >
              <img
                src={blog.PictureUrl}
                alt={blog.Title}
                className="w-full h-auto object-cover"
              />
              {/* Image overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30"></div>
            </motion.div>
          )}

          {/* Blog Content - ENHANCED with better spacing and typography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="prose prose-emerald lg:prose-lg max-w-none bg-white rounded-xl shadow-md p-6 md:p-10"
          >
            <div className="blog-content-wrapper">
              {renderContent(blog.Content)}
            </div>

            {/* Author info and publish time - NEW */}
            <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-700">CareSkin Team</div>
                  <div className="text-emerald-600">Skincare Specialist</div>
                </div>
              </div>
              <div className="bg-gray-50 px-3 py-1.5 rounded-full">
                <span className="text-xs">Published at: </span>
                <span className="font-medium text-emerald-700">
                  {formatTimeOnly(blog.UploadDate || blog.CreateDate) ||
                    'Unknown time'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Social Share - ENHANCED with animated tooltips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-6 rounded-xl">
              <p className="font-medium text-gray-700 mb-4 sm:mb-0 flex items-center">
                <FontAwesomeIcon
                  icon={faShare}
                  className="mr-2 text-emerald-600"
                />
                Share this article:
              </p>
              <div className="flex space-x-3">
                {/* Facebook - ENHANCED */}
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all transform hover:scale-110 shadow-md"
                  aria-label="Share on Facebook"
                  title="Share on Facebook"
                >
                  <FontAwesomeIcon icon={faFacebookF} />
                </button>

                {/* Twitter - ENHANCED */}
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-all transform hover:scale-110 shadow-md"
                  aria-label="Share on Twitter"
                  title="Share on Twitter"
                >
                  <FontAwesomeIcon icon={faTwitter} />
                </button>

                {/* LinkedIn - ENHANCED */}
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-all transform hover:scale-110 shadow-md"
                  aria-label="Share on LinkedIn"
                  title="Share on LinkedIn"
                >
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </button>

                {/* Pinterest - ENHANCED */}
                <button
                  onClick={() => handleShare('pinterest')}
                  className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all transform hover:scale-110 shadow-md"
                  aria-label="Share on Pinterest"
                  title="Share on Pinterest"
                >
                  <FontAwesomeIcon icon={faPinterestP} />
                </button>

                {/* Copy Link - ENHANCED */}
                <button
                  onClick={() => handleShare('copy')}
                  className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700 transition-all transform hover:scale-110 relative group shadow-md"
                  aria-label="Copy link"
                  title="Copy link to clipboard"
                >
                  <FontAwesomeIcon icon={faShare} />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                    Copy URL
                  </span>
                </button>
              </div>
            </div>

            {/* Success Notification - ENHANCED with animation */}
            <div
              className="mt-4 text-center"
              id="copyNotification"
              style={{ display: 'none' }}
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-emerald-600 bg-emerald-50 py-2 px-4 rounded-full inline-flex items-center shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Link copied to clipboard!
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Related Articles - ENHANCED with card effects */}
        {relatedBlogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 py-12 border-t border-gray-200"
          >
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 flex items-center">
                <span className="w-8 h-1 bg-emerald-500 mr-3 rounded-full"></span>
                Related Articles
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedBlogs.map((relatedBlog) => (
                  <motion.div
                    key={relatedBlog.BlogId}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 h-full flex flex-col hover:shadow-xl transition-shadow duration-300"
                    whileHover={{ y: -5 }}
                  >
                    {/* Blog Image - ENHANCED with gradient overlay */}
                    <div className="relative h-48 overflow-hidden">
                      {relatedBlog.PictureUrl ? (
                        <>
                          <img
                            src={relatedBlog.PictureUrl}
                            alt={relatedBlog.Title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30"></div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-emerald-50 to-emerald-100 flex items-center justify-center text-emerald-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m7-7H3"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Blog Content - ENHANCED */}
                    <div className="p-5 flex-grow flex flex-col">
                      {/* Date with icon */}
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-gray-500 flex items-center">
                          <FontAwesomeIcon
                            icon={faCalendarAlt}
                            className="mr-1.5 text-emerald-500"
                            size="xs"
                          />
                          {formatDate(
                            relatedBlog.UploadDate || relatedBlog.CreateDate
                          ) || 'No date available'}
                        </p>

                        {/* Time badge - NEW */}
                        {relatedBlog.UploadDate && (
                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                            {formatTimeOnly(relatedBlog.UploadDate)}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold mb-3 line-clamp-2 text-gray-800 hover:text-emerald-600 transition-colors">
                        {relatedBlog.Title !== 'string'
                          ? relatedBlog.Title
                          : 'Untitled Blog'}
                      </h3>

                      {/* Truncated content preview - NEW */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {relatedBlog.Content && relatedBlog.Content !== 'string'
                          ? relatedBlog.Content.substring(0, 100) + '...'
                          : 'No content available'}
                      </p>

                      <Link
                        to={`/blog/${generateBlogSlug(relatedBlog)}`}
                        className="mt-auto group inline-flex items-center justify-center text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                        aria-label={`Read full article about ${relatedBlog.Title}`}
                      >
                        Read article
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Back to Blog Button - ENHANCED */}
        <div className="text-center mt-12 mb-8">
          <Link
            to="/blogs"
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to All Articles
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default BlogDetails;
