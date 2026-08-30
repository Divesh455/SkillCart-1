import { useMemo } from "react";

export default function UserHeader({
  user,
  createdAt,
  showFollow = false,
  isFollowing = false,
  followLoading = false,
  onFollow,
  isMyPost = false,
}) {
  const displayUsername = useMemo(() => {
    if (isMyPost) {
      return "You";
    }

    return (
      user?.username ||
      user?.name ||
      user?.authorName ||
      user?.fullName ||
      (user?.email ? user.email.split("@")[0] : null) ||
      "SkillCart User"
    );
  }, [user, isMyPost]);

  // Get first letter from username
  const initial = useMemo(() => {
    if (isMyPost) {
      return "Y";
    }

    if (!displayUsername || displayUsername === "SkillCart User") {
      return "U";
    }

    return displayUsername
      .trim()
      .charAt(0)
      .toUpperCase();
  }, [displayUsername, isMyPost]);

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString()
    : "";

  return (
    <div className="flex items-center gap-3 w-full">

      {/* =====================================================
          USER AVATAR
      ===================================================== */}

      <div
        className="
          w-11
          h-11
          rounded-2xl
          bg-gradient-to-br
          from-[#123c2c]
          to-[#19714e]
          text-[#b9ef84]
          flex
          items-center
          justify-center
          font-bold
          shrink-0
        "
      >
        {initial}
      </div>

      {/* =====================================================
          USER INFORMATION
      ===================================================== */}

      <div className="flex-1 min-w-0">

        <p
          className="
            text-sm
            font-bold
            text-[#10231b]
            truncate
          "
        >
          {displayUsername}
        </p>

        {formattedDate && (
          <p
            className="
              text-[11px]
              text-[#68756f]
            "
          >
            {formattedDate}
          </p>
        )}

      </div>

      {/* =====================================================
          FOLLOW BUTTON
      ===================================================== */}

      {showFollow && (
        <button
          type="button"
          onClick={onFollow}
          disabled={followLoading}
          className={`
            px-4
            py-2
            rounded-xl
            text-xs
            font-bold
            transition-all
            shrink-0

            ${
              isFollowing
                ? `
                  border
                  border-[#19714e]
                  text-[#19714e]
                  bg-[#f0f8f4]
                `
                : `
                  bg-[#123c2c]
                  text-white
                  hover:bg-[#19714e]
                `
            }

            ${
              followLoading
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
          `}
        >
          {followLoading
            ? "..."
            : isFollowing
              ? "Following"
              : "Follow"}
        </button>
      )}

    </div>
  );
}