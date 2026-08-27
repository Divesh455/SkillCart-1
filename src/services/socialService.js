import socialApi from "./socialApi";

const socialService = {
  // Get Home feed
  getFeed: (page = 0, size = 10) =>
    socialApi.get(
      `/api/social/feed?page=${page}&size=${size}`
    ),

  // Create a new post
  createPost: ({ content, image }) => {
    const formData = new FormData();

    if (content && content.trim()) {
      formData.append(
        "content",
        content.trim()
      );
    }

    if (image) {
      formData.append(
        "image",
        image
      );
    }

    return socialApi.post(
      "/api/social/posts",
      formData
    );
  },
};

export default socialService;