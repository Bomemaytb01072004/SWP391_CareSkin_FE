import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Image, MessageCircle } from 'lucide-react';

const FacebookPosts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // This is where the error is happening - we need to change the field aliases
        // Note: You should move this token to an environment variable or backend
        const accessToken = import.meta.env.VITE_FACEBOOK2_APP_ID;
        const pageId = '616836648173383';

        // Changed field aliases to avoid naming conflicts with Graph API
        const response = await fetch(
          `https://graph.facebook.com/v15.0/${pageId}/posts?access_token=${accessToken}&fields=message,permalink_url,full_picture,created_time,attachments{media_type,subattachments},reactions.summary(total_count),comments.summary(true),reactions.type(LIKE).summary(total_count).limit(0).as(like_reactions),reactions.type(LOVE).summary(total_count).limit(0).as(love_reactions),reactions.type(HAHA).summary(total_count).limit(0).as(haha_reactions),reactions.type(WOW).summary(total_count).limit(0).as(wow_reactions),reactions.type(SAD).summary(total_count).limit(0).as(sad_reactions)&limit=6`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to fetch posts');
        }

        const data = await response.json();

        if (data && data.data) {
          setPosts(data.data);
        } else {
          console.warn('Unexpected API response format:', data);
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching Facebook posts:', error);
        setError(error.message || 'Failed to load Facebook posts');
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Function to truncate text
  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  // Function to count images in a post
  const getImageCount = (post) => {
    if (!post.attachments || !post.attachments.data) return 0;

    let count = 0;
    post.attachments.data.forEach((attachment) => {
      if (attachment.media_type === 'photo') {
        count += 1;
      } else if (attachment.subattachments && attachment.subattachments.data) {
        attachment.subattachments.data.forEach((subattachment) => {
          if (subattachment.media_type === 'photo') {
            count += 1;
          }
        });
      }
    });

    return count;
  };

  // Custom container animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-16 bg-white max-w-7xl mx-auto px-5">
      <div className="mb-10 text-center">
        <motion.h2
          className="text-3xl font-bold mb-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Our Facebook Feed
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-gray-600 mb-2">Follow us @careskinbeauty</p>
          <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full"></div>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-700"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 px-4">
          <div className="bg-red-50 p-6 rounded-lg max-w-md mx-auto">
            <p className="text-red-600 mb-2">⚠️ {error}</p>
            <p className="text-gray-600 text-sm">
              This could be due to an expired API token or network issue.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-left font-mono text-gray-700 whitespace-pre-wrap break-all">
                {/* Show a helpful message about token expiration */}
                Try refreshing your Facebook access token using the Graph API
                Explorer. Facebook tokens typically expire after 60 days. Your
                token may have expired.
              </p>
            </div>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts available at the moment.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {posts.map((post, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <a
                href={post.permalink_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative aspect-square overflow-hidden">
                  {post.full_picture ? (
                    <>
                      <img
                        src={post.full_picture}
                        alt={
                          post.message
                            ? truncateText(post.message, 20)
                            : 'Facebook post'
                        }
                        className="w-full h-full object-cover transition duration-300 hover:scale-105"
                      />
                      {getImageCount(post) > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full px-2 py-1 flex items-center text-xs">
                          <Image size={12} className="mr-1" />
                          <span>{getImageCount(post)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-emerald-100 to-purple-100 p-6">
                      <p className="text-gray-700 text-center font-medium">
                        {truncateText(post.message, 100)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {post.message && (
                    <p className="text-gray-700 text-sm mb-3">
                      {truncateText(post.message)}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-700">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      <span>{formatDate(post.created_time)}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Updated Reactions with dropdown to use new field names */}
                      <div className="group relative">
                        <div className="flex items-center cursor-pointer">
                          <div className="flex -space-x-1 mr-1.5">
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center border border-white shadow-sm">
                              <span className="text-[10px]">👍</span>
                            </div>
                            {post.love_reactions?.summary?.total_count > 0 && (
                              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center border border-white shadow-sm">
                                <span className="text-[10px]">❤️</span>
                              </div>
                            )}
                            {(post.haha_reactions?.summary?.total_count > 0 ||
                              post.wow_reactions?.summary?.total_count > 0) && (
                              <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center border border-white shadow-sm">
                                <span className="text-[10px]">
                                  {post.haha_reactions?.summary?.total_count >
                                  post.wow_reactions?.summary?.total_count
                                    ? '😄'
                                    : '😮'}
                                </span>
                              </div>
                            )}
                          </div>
                          <span>
                            {post.reactions?.summary?.total_count || 0}
                          </span>
                        </div>

                        {/* Updated Tooltip to use new field names */}
                        <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-white shadow-lg rounded-lg p-2 text-xs w-28 z-10 border border-gray-100">
                          <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-100"></div>
                          <div className="flex justify-between items-center py-1">
                            <span className="flex items-center">
                              <span className="mr-1">👍</span>Like
                            </span>
                            <span className="font-medium">
                              {post.like_reactions?.summary?.total_count || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="flex items-center">
                              <span className="mr-1">❤️</span>Love
                            </span>
                            <span className="font-medium">
                              {post.love_reactions?.summary?.total_count || 0}
                            </span>
                          </div>
                          {post.haha_reactions?.summary?.total_count > 0 && (
                            <div className="flex justify-between items-center py-1">
                              <span className="flex items-center">
                                <span className="mr-1">😄</span>Haha
                              </span>
                              <span className="font-medium">
                                {post.haha_reactions?.summary?.total_count || 0}
                              </span>
                            </div>
                          )}
                          {post.wow_reactions?.summary?.total_count > 0 && (
                            <div className="flex justify-between items-center py-1">
                              <span className="flex items-center">
                                <span className="mr-1">😮</span>Wow
                              </span>
                              <span className="font-medium">
                                {post.wow_reactions?.summary?.total_count || 0}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Comments */}
                      <div className="flex items-center">
                        <MessageCircle size={14} className="mr-1" />
                        <span>{post.comments?.summary?.total_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        className="text-center mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <a
          href="https://www.facebook.com/profile.php?id=61573863226824"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-emerald-700 text-white rounded-lg font-medium hover:bg-emerald-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="View more posts on our Facebook page (opens in new tab)"
        >
          View More
          <span className="sr-only">(opens in new tab)</span>
        </a>
      </motion.div>
    </section>
  );
};

export default FacebookPosts;

// oauth/access_token?
// grant_type=fb_exchange_token&
// client_id=656336647047380&
// client_secret=73171c1116c7a6c894e90fe52170a713&
// fb_exchange_token=EAAJU70izSNQBOzASwS8XbvbgdZCnnhmE4z4y88cK3yLBvXk8Ff5cHv6KuR1JhvsjcelVtcZCp4Mf7uQ6kG7WcuxVPIs6ypzc9UfrrvCZChK7vetZAzlEDicLitS5rQA2s3qmDgiWw9CdPGdZCpG93kQVFSeBe8E5pV215kJCsbzamFHlty3v9ZCPY8sOjzQk0VeiqZCW40P5Jn8PehDmuGALZB25

// oauth/client_code?
//     client_id={656336647047380}&
//     client_secret={73171c1116c7a6c894e90fe52170a713}&
//     redirect_uri={app-redirect-uri}&
//     access_token={long-lived-user-access-token}

//
// me/accounts?access_token=EAAJU70izSNQBO6ZCvGfNdIZCGD5lkQhwZCJNIlDuCsR7aaCmrbFB0cYeh5GnpZBd1pz4DhXZCogbhVpgcuc8zwutSE9mvG4hPwIQbx7hkdLYueSQsQrb3f8Ud7QyR3molOP6aSgeUPgc6OuVheF9lBwwjelInqBY6Dq0iJRiflekNp8pAGTkXkSZCy
// //   {long-lived-user-access-token}
