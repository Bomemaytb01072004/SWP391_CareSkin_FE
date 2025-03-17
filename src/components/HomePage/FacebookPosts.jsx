import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Image, Heart, MessageCircle } from 'lucide-react';

const FacebookPosts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const accessToken =
          'EAAJU70izSNQBOz06caEGVVVTldNDZBhEGXS5x0X8B4ScX7rvuPZAN4pjGvdq6bifjZAE1Rg9o0aqH1bKOBzBesjfVRQbBgZAELS6q6Iq2n5ERVebsDmnwTojU6L0lxvQunBnPe5cKDbSir4LWGQ2tpuk929LbHoZBEdTJrxbeaqKHTY2p5Me8dZA8TZAAqdGozV';
        const pageId = '616836648173383';
        const response = await fetch(
          `https://graph.facebook.com/v15.0/${pageId}/posts?access_token=${accessToken}&fields=message,permalink_url,full_picture,created_time,attachments{media_type,subattachments},likes.summary(true),comments.summary(true)&limit=6`
        );
        const data = await response.json();
        setPosts(data.data);
      } catch (error) {
        console.error('Error fetching Facebook posts:', error);
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
                      <div className="flex items-center">
                        <Heart size={14} className="mr-1" />
                        <span>{post.likes?.summary?.total_count || 0}</span>
                      </div>
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
          className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-300"
        >
          View More on Facebook
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
