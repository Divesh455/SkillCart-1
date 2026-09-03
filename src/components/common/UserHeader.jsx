import { useMemo } from "react";
import { motion } from "framer-motion";
import { UserCheck, UserPlus } from "lucide-react";

export default function UserHeader({
  user,
  createdAt,
  showFollow = false,
  isFollowing = false,
  followLoading = false,
  onFollow,
  isMyPost = false,
  onOpenProfile = null,
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

  const handleProfileClick = () => {
    if (typeof onOpenProfile === "function") {
      onOpenProfile(user);
    }
  };

  return (
    <div className="flex items-center gap-3 w-full">

      {/* =====================================================
          USER AVATAR
      ===================================================== */}

      <div
        onClick={handleProfileClick}
        title={onOpenProfile ? `View ${displayUsername}'s profile` : undefined}
        className={`
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
          transition-transform
          select-none
          ${
            onOpenProfile
              ? "cursor-pointer hover:scale-105 hover:shadow-md active:scale-95"
              : ""
          }
        `}
      >
        {initial}
      </div>

      {/* =====================================================
          USER INFORMATION
      ===================================================== */}

      <div
        onClick={handleProfileClick}
        className={`
          flex-1 min-w-0
          ${onOpenProfile ? "cursor-pointer group" : ""}
        `}
        title={onOpenProfile ? `View ${displayUsername}'s profile` : undefined}
      >

        <p
          className={`
            text-sm
            font-bold
            text-[#10231b]
            truncate
            transition-colors
            ${onOpenProfile ? "group-hover:text-[#19714e]" : ""}
          `}
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
        <motion.button
          type="button"
          onClick={onFollow}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.03 }}
          className={`
            px-3.5
            py-1.5
            rounded-xl
            text-xs
            font-bold
            transition-all
            shrink-0
            cursor-pointer
            flex
            items-center
            gap-1.5
            select-none

            ${
              isFollowing
                ? `
                  border
                  border-[#19714e]
                  text-[#19714e]
                  bg-[#f0f8f4]
                  hover:bg-red-50
                  hover:text-red-600
                  hover:border-red-200
                `
                : `
                  bg-[#123c2c]
                  text-white
                  hover:bg-[#19714e]
                  hover:shadow-xs
                `
            }
          `}
        >
          <motion.span
            key={isFollowing ? "following" : "follow"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1.5"
          >
            {isFollowing ? (
              <>
                <UserCheck size={14} />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus size={14} />
                <span>Follow</span>
              </>
            )}
          </motion.span>
        </motion.button>
      )}

    </div>
  );
}