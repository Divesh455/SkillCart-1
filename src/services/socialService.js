const BASE_URL = "https://skillcart-socials.onrender.com";

/*
 * Get JWT token.
 *
 * IMPORTANT:
 * Change "token" below if your AuthContext
 * stores the JWT under another localStorage key.
 */
const getToken = () => {
  return localStorage.getItem("token");
};

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || `API request failed: ${response.status}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const socialService = {
  // ==========================================
  // FEED
  // ==========================================

  getFeed: async (page = 0, size = 10) => {
    return request(
      `/api/social/feed?page=${page}&size=${size}`
    );
  },

  // ==========================================
  // POSTS
  // ==========================================

  createPost: async (data) => {
    return request("/api/social/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ==========================================
  // LIKE
  // ==========================================

  likePost: async (postId) => {
    return request(`/api/social/posts/${postId}/like`, {
      method: "POST",
    });
  },

  unlikePost: async (postId) => {
    return request(`/api/social/posts/${postId}/like`, {
      method: "DELETE",
    });
  },

  // ==========================================
  // COMMENTS
  // ==========================================

  getComments: async (postId, page = 0, size = 10) => {
    return request(
      `/api/social/comments/post/${postId}?page=${page}&size=${size}`
    );
  },

  addComment: async (postId, data) => {
    return request(
      `/api/social/comments/post/${postId}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  deleteComment: async (commentId) => {
    return request(
      `/api/social/comments/${commentId}`,
      {
        method: "DELETE",
      }
    );
  },

  // ==========================================
  // FOLLOW
  // ==========================================

  followUser: async (userId) => {
    return request(
      `/api/social/users/${userId}/follow`,
      {
        method: "POST",
      }
    );
  },

  unfollowUser: async (userId) => {
    return request(
      `/api/social/users/${userId}/follow`,
      {
        method: "DELETE",
      }
    );
  },

  // ==========================================
  // FOLLOW COUNTS
  // ==========================================

  getFollowersCount: async (userId) => {
    return request(
      `/api/social/users/${userId}/followers/count`
    );
  },

  getFollowingCount: async (userId) => {
    return request(
      `/api/social/users/${userId}/following/count`
    );
  },
};

export default socialService;