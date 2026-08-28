import {
  useRef,
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  X,
  Image as ImageIcon,
  Send,
  Trash2,
  Loader2,
} from "lucide-react";

import socialService from "../../services/socialService";

import { useAuth } from "../../context/AuthContext";

export default function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
}) {
  const { user } = useAuth();
  const getUsername = () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return "User";
    }

    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    return (
      user?.username ||
      payload?.username ||
      payload?.sub ||
      "User"
    );
  } catch (error) {
    console.error(
      "Could not get username:",
      error
    );

    return user?.username || "User";
  }
};

const username = getUsername();

const avatarText = username
  .trim()
  .substring(0,1)
  .toUpperCase();

  // ============================================================
  // FORM STATE
  // ============================================================

  const [content, setContent] =
    useState("");


  // This is ONLY for displaying preview
  const [imagePreview, setImagePreview] =
    useState(null);

  // IMPORTANT:
  // This is the REAL File that will be
  // sent to the backend.
  const [selectedImage, setSelectedImage] =
    useState(null);

  const [isPublishing, setIsPublishing] =
    useState(false);

  const [error, setError] =
    useState("");

  const fileInputRef =
    useRef(null);

  // ============================================================
  // CLOSE / RESET
  // ============================================================

  const resetForm = () => {
    setContent("");

    setImagePreview(null);

    setSelectedImage(null);

    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (isPublishing) {
      return;
    }

    resetForm();

    onClose();
  };

  // ============================================================
  // IMAGE SELECT
  // ============================================================

  const handleImageSelect = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    // ----------------------------------------------------------
    // Validate image type
    // ----------------------------------------------------------

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image."
      );

      event.target.value = "";

      return;
    }

    // ----------------------------------------------------------
    // Validate image size
    // ----------------------------------------------------------

    // 10 MB frontend limit
    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Image size must be less than 10 MB."
      );

      event.target.value = "";

      return;
    }

    setError("");

    // IMPORTANT
    // Save actual File object
    setSelectedImage(file);

    // Create preview
    const reader =
      new FileReader();

    reader.onloadend = () => {
      setImagePreview(
        reader.result
      );
    };

    reader.readAsDataURL(file);
  };

  // ============================================================
  // REMOVE IMAGE
  // ============================================================

  const handleRemoveImage = () => {
    setImagePreview(null);

    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  // ============================================================
  // SUBMIT POST
  // ============================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const trimmedContent =
      content.trim();

    // ----------------------------------------------------------
    // Must have either text OR image
    // ----------------------------------------------------------

    if (
      !trimmedContent &&
      !selectedImage
    ) {
      setError(
        "Write something or add an image."
      );

      return;
    }

    try {
      setIsPublishing(true);

      setError("");

      console.log(
        "CREATING POST..."
      );

      console.log(
        "CONTENT:",
        trimmedContent
      );

      console.log(
        "IMAGE:",
        selectedImage
      );

      // ========================================================
      // ACTUAL BACKEND REQUEST
      // ========================================================

      const createdPost =
        await socialService.createPost({
          content:
            trimmedContent,
          image:
            selectedImage,
        });

      console.log(
        "POST CREATED SUCCESSFULLY:",
        createdPost
      );

      // ========================================================
      // UPDATE FEED
      // ========================================================

      if (
        onPostCreated &&
        createdPost
      ) {
        onPostCreated(
          createdPost
        );
      }

      // ========================================================
      // RESET
      // ========================================================

      resetForm();

      onClose();

    } catch (error) {
      console.error(
        "CREATE POST ERROR:",
        error
      );

      console.error(
        "STATUS:",
        error?.status
      );

      console.error(
        "MESSAGE:",
        error?.message
      );

      setError(
        error?.message ||
        "Failed to create post."
      );

    } finally {
      setIsPublishing(
        false
      );
    }
  };

  // ============================================================
  // DON'T RENDER WHEN CLOSED
  // ============================================================

  if (!isOpen) {
    return null;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <AnimatePresence>
      <div
        className="
          fixed
          inset-0
          z-50
          bg-[#0e1d18]/85
          backdrop-blur-md
          flex
          items-center
          justify-center
          p-3
          sm:p-4
          overflow-y-auto
          font-sans
        "
      >

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
            y: 15,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: 15,
          }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
          className="
            w-full
            max-w-lg
            bg-white
            rounded-2xl
            sm:rounded-3xl
            border
            border-[#dfe7e2]
            shadow-2xl
            overflow-hidden
            relative
            flex
            flex-col
            my-auto
            max-h-[90vh]
          "
        >

          {/* ==================================================
              TOP ACCENT
          ================================================== */}

          <div
            className="
              h-1.5
              bg-gradient-to-r
              from-[#123c2c]
              via-[#19714e]
              to-[#b9ef84]
              w-full
              shrink-0
            "
          />

          {/* ==================================================
              HEADER
          ================================================== */}

          <div
            className="
              p-3.5
              sm:p-5
              border-b
              border-[#dfe7e2]
              flex
              items-center
              justify-between
              bg-[#f7faf8]
              shrink-0
            "
          >

            <div
              className="
                flex
                items-center
                gap-2.5
                sm:gap-3
              "
            >

              {/* USER AVATAR */}

              <div
                className="
                  w-8
                  h-8
                  sm:w-10
                  sm:h-10
                  rounded-xl
                  sm:rounded-2xl
                  bg-gradient-to-br
                  from-[#123c2c]
                  to-[#19714e]
                  text-[#b9ef84]
                  font-bold
                  text-xs
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                {avatarText}
              </div>

              <div>

                <h3
                  className="
                    font-bold
                    text-xs
                    sm:text-sm
                    text-[#12221d]
                  "
                >
                  Create Community Post
                </h3>

                <p
                  className="
                    text-[10px]
                    sm:text-[11px]
                    text-[#68756f]
                  "
                >
                  Share updates, photos, or
                  job referrals
                </p>

              </div>

            </div>

            {/* CLOSE */}

            <motion.button
              whileHover={{
                scale: 1.1,
                rotate: 90,
              }}
              whileTap={{
                scale: 0.9,
              }}
              type="button"
              onClick={
                handleClose
              }
              disabled={
                isPublishing
              }
              className="
                w-7
                h-7
                sm:w-8
                sm:h-8
                rounded-full
                bg-white
                border
                border-[#dfe7e2]
                text-[#68756f]
                hover:text-[#12221d]
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <X size={15} />
            </motion.button>

          </div>

          {/* ==================================================
              FORM
          ================================================== */}

          <form
            onSubmit={
              handleSubmit
            }
            className="
              p-3.5
              sm:p-6
              space-y-3
              sm:space-y-4
              overflow-y-auto
              flex-1
            "
          >

            {/* ==================================================
                CONTENT
            ================================================== */}

            <textarea
              rows={4}
              placeholder="
                What's on your mind? Share a job opening,
                career update, or ask a question...
              "
              value={content}
              onChange={(event) =>
                setContent(
                  event.target.value
                )
              }
              disabled={
                isPublishing
              }
              maxLength={5000}
              className="
                w-full
                text-xs
                sm:text-sm
                text-[#12221d]
                placeholder-[#68756f]/60
                bg-[#f7faf8]
                border
                border-[#dfe7e2]
                rounded-xl
                sm:rounded-2xl
                p-3
                sm:p-4
                outline-none
                resize-none
                focus:border-[#19714e]
                focus:bg-white
                focus:ring-2
                focus:ring-[#19714e]/20
                transition-all
                leading-relaxed
              "
            />

            {/* ==================================================
                IMAGE PREVIEW
            ================================================== */}

            {imagePreview && (
              <div
                className="
                  relative
                  rounded-xl
                  sm:rounded-2xl
                  overflow-hidden
                  border
                  border-[#dfe7e2]
                  bg-[#f7faf8]
                  max-h-64
                  shadow-inner
                "
              >

                <img
                  src={
                    imagePreview
                  }
                  alt="Post attachment preview"
                  className="
                    w-full
                    h-full
                    object-cover
                    max-h-64
                  "
                />

                {/* REMOVE IMAGE */}

                <button
                  type="button"
                  onClick={
                    handleRemoveImage
                  }
                  disabled={
                    isPublishing
                  }
                  className="
                    absolute
                    top-2
                    right-2
                    p-1.5
                    rounded-full
                    bg-[#12221d]/80
                    text-white
                    hover:bg-red-600
                    transition-colors
                    shadow-md
                  "
                  title="Remove Image"
                >
                  <Trash2
                    size={14}
                  />
                </button>

              </div>
            )}

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div
                className="
                  px-3
                  sm:px-4
                  py-2.5
                  rounded-xl
                  bg-red-50
                  border
                  border-red-200
                  text-red-600
                  text-xs
                  font-semibold
                "
              >
                {error}
              </div>
            )}

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div
              className="
                pt-3
                border-t
                border-[#dfe7e2]
                flex
                items-center
                justify-between
                gap-2
                shrink-0
              "
            >

              {/* HIDDEN INPUT */}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={
                  handleImageSelect
                }
                className="hidden"
              />

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  sm:gap-2
                "
              >

                {/* ADD PHOTO */}

                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={
                    isPublishing
                  }
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    px-2.5
                    sm:px-3.5
                    py-1.5
                    sm:py-2
                    rounded-xl
                    bg-[#f7faf8]
                    border
                    border-[#dfe7e2]
                    text-xs
                    font-bold
                    text-[#19714e]
                    hover:bg-[#dff8eb]
                    transition-colors
                    disabled:opacity-50
                  "
                >

                  <ImageIcon
                    size={15}
                  />

                  <span
                    className="
                      text-[11px]
                      sm:text-xs
                    "
                  >
                    {selectedImage
                      ? "Change Photo"
                      : "Add Photo"}
                  </span>

                </motion.button>

                {/* REFERRAL */}


              </div>

              {/* ==================================================
                  PUBLISH
              ================================================== */}

              <motion.button
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                type="submit"
                disabled={
                  isPublishing ||
                  (!content.trim() &&
                    !selectedImage)
                }
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  px-4
                  sm:px-6
                  py-2
                  sm:py-2.5
                  bg-[#123c2c]
                  hover:bg-[#19714e]
                  text-white
                  font-bold
                  rounded-xl
                  text-xs
                  shadow-md
                  transition-all
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >

                {isPublishing ? (
                  <>
                    <Loader2
                      size={13}
                      className="animate-spin"
                    />

                    <span>
                      Publishing...
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      Publish Post
                    </span>

                    <Send
                      size={13}
                    />
                  </>
                )}

              </motion.button>

            </div>

          </form>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}