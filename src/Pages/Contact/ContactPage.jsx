import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { Editor } from '@tinymce/tinymce-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faEnvelope,
  faUser,
  faPaperPlane,
  faPhone,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';
import emailjs from '@emailjs/browser';

// Initialize EmailJS
emailjs.init('xS6G6RekD5IPaX0k3'); // Replace with your actual EmailJS public key

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '' });
  const [editorContent, setEditorContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [error, setError] = useState('');

  const editorRef = useRef(null);
  const formRef = useRef(null);

  // If user is logged in, pre-fill name and email
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    if (user.FullName) {
      setForm((prev) => ({ ...prev, name: user.FullName }));
    }
    if (user.Email) {
      setForm((prev) => ({ ...prev, email: user.Email }));
    }
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditorChange = (content) => {
    setEditorContent(content);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.subject.trim() ||
      !editorContent.trim()
    ) {
      setError('All fields are required');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Strip HTML tags for template params safety
      const stripHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
      };

      // Configure EmailJS parameters to match the template variables
      const templateParams = {
        // Match the template variables exactly
        name: form.name, // Template uses {{name}}
        title: form.subject, // Template uses {{title}}
        message: editorContent, // This will be available in template if added

        // These are for your records but aren't in the template
        from_email: form.email,
        message_text: stripHtml(editorContent),
        reply_to: form.email,
      };

      // Send email using EmailJS with the correct public key
      await emailjs.send(
        'service_4crjx8w',
        'template_af93etr',
        templateParams,
        'xS6G6RekD5IPaX0k3'
      );

      setSubmitStatus('success');
      setForm({ name: '', email: '', subject: '' });
      setEditorContent('');

      if (editorRef.current) {
        editorRef.current.setContent('');
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
      setError(
        'Failed to send email. Please try again or contact us directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (blobInfo, success, failure) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      success(base64);
    };
    reader.readAsDataURL(blobInfo.blob());
  };

  return (
    <>
      <Navbar />
      <div className="relative bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 z-0 opacity-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400 mix-blend-multiply filter blur-xl"></div>
          <div className="absolute top-1/3 -left-24 w-96 h-96 rounded-full bg-pink-300 mix-blend-multiply filter blur-xl"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full bg-yellow-300 mix-blend-multiply filter blur-xl"></div>
        </div>

        <div className="max-w-4xl mx-auto mt-24 mb-16 relative z-10">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Get in Touch
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions about our products or services? We're here to help
              you.
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="p-6 md:p-8">
              {/* Form title */}
              <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
                Send Us a Message
              </h2>

              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-6 flex items-start animate-fadeIn">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-500 mt-1 mr-3"
                  />
                  <div>
                    <p className="font-medium">Thank you for your message!</p>
                    <p>
                      We've received your email and will get back to you
                      shortly.
                    </p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6 flex items-start">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-red-500 mt-1 mr-3"
                  />
                  <div>
                    <p className="font-medium">Something went wrong</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 flex items-center">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="mr-2 text-blue-500"
                      />
                      <span>Name</span>
                    </label>
                    <div className="relative">
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                        placeholder="Your name"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-0">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="mr-2 text-gray-500"
                      />
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="What is your message about?"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Editor
                    apiKey="fschdso03fdgacyzv5vyn9dlmyqfjaaa1naw0n5p5uh60fm3"
                    onInit={(evt, editor) => (editorRef.current = editor)}
                    value={editorContent}
                    onEditorChange={handleEditorChange}
                    init={{
                      height: 300,
                      menubar: false,
                      plugins: [
                        'advlist',
                        'autolink',
                        'lists',
                        'link',
                        'image',
                        'charmap',
                        'preview',
                        'anchor',
                        'searchreplace',
                        'visualblocks',
                        'code',
                        'fullscreen',
                        'insertdatetime',
                        'media',
                        'table',
                        'code',
                        'help',
                        'wordcount',
                      ],
                      toolbar:
                        'undo redo | formatselect | ' +
                        'bold italic backcolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'image | removeformat | help',
                      images_upload_handler: handleImageUpload,
                      automatic_uploads: false,
                      paste_data_images: true,
                      resize: false, // Disable the resize handle entirely
                      statusbar: false, // Hide the status bar which contains the resize handle
                    }}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center space-x-2 disabled:opacity-70 disabled:transform-none disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="animate-spin"
                        />
                        <span className="ml-2">Sending...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPaperPlane} />
                        <span className="ml-2">Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ContactPage;
