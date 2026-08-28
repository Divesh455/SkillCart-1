import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bot,
  Send,
  X,
  Sparkles,
  User,
  Loader2,
  RotateCcw,
} from "lucide-react";

import copilotService from "../../services/copilotService";


// ============================================================
// RESPONSE TEXT EXTRACTOR
// ============================================================

function extractAssistantMessage(response) {

  if (!response) {
    return "";
  }

  if (typeof response === "string") {
    return response;
  }

  return (
    response.response ||
    response.answer ||
    response.data ||
    response.reply ||
    response.content ||
    response.data?.response ||
    response.data?.answer ||
    response.data?.message ||
    response.data?.reply ||
    response.data?.content ||
    ""
  );
}


// ============================================================
// SIMPLE MARKDOWN-LIKE FORMATTER
// ============================================================

function formatAssistantText(text) {

  if (!text) {
    return null;
  }

  const lines =
    String(text).split("\n");

  return lines.map(
    (line, index) => {

      const trimmed =
        line.trim();

      // Empty line
      if (!trimmed) {
        return (
          <div
            key={index}
            className="h-2"
          />
        );
      }

      // Heading
      if (
        trimmed.startsWith("### ")
      ) {
        return (
          <h4
            key={index}
            className="
              text-sm
              font-bold
              text-[#123c2c]
              mt-3
              mb-1
            "
          >
            {trimmed.replace(
              /^### /,
              ""
            )}
          </h4>
        );
      }

      if (
        trimmed.startsWith("## ")
      ) {
        return (
          <h3
            key={index}
            className="
              text-base
              font-bold
              text-[#123c2c]
              mt-3
              mb-1
            "
          >
            {trimmed.replace(
              /^## /,
              ""
            )}
          </h3>
        );
      }

      // Bullet
      if (
        trimmed.startsWith("- ") ||
        trimmed.startsWith("* ")
      ) {
        return (
          <div
            key={index}
            className="
              flex
              gap-2
              text-sm
              leading-6
              text-[#30443c]
              mb-1
            "
          >
            <span
              className="
                mt-2
                w-1.5
                h-1.5
                rounded-full
                bg-[#19714e]
                shrink-0
              "
            />

            <span>
              {trimmed.substring(2)}
            </span>
          </div>
        );
      }

      // Numbered list
      const numberedMatch =
        trimmed.match(
          /^(\d+)\.\s+(.*)$/
        );

      if (numberedMatch) {
        return (
          <div
            key={index}
            className="
              flex
              gap-2
              text-sm
              leading-6
              text-[#30443c]
              mb-1
            "
          >
            <span
              className="
                font-bold
                text-[#19714e]
                shrink-0
              "
            >
              {numberedMatch[1]}.
            </span>

            <span>
              {numberedMatch[2]}
            </span>
          </div>
        );
      }

      // Normal paragraph
      return (
        <p
          key={index}
          className="
            text-sm
            leading-6
            text-[#30443c]
          "
        >
          {trimmed}
        </p>
      );
    }
  );
}


// ============================================================
// COPILOT COMPONENT
// ============================================================

export default function Copilot({
  isOpen,
  onClose,
}) {

  const [messages, setMessages] =
    useState([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi! I'm SkillCart Copilot 👋\n\nI can help you with your resume, skills, career direction, job preparation, and other career questions.",
      },
    ]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const messagesEndRef =
    useRef(null);

  const textareaRef =
    useRef(null);


  // ============================================================
  // AUTO SCROLL
  // ============================================================

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages, loading]);


  // ============================================================
  // CLOSE WITH ESCAPE
  // ============================================================

  useEffect(() => {

    if (!isOpen) {
      return;
    }

    const handleKeyDown =
      (event) => {

        if (
          event.key === "Escape"
        ) {
          onClose();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [isOpen, onClose]);


  // ============================================================
  // RESET CHAT
  // ============================================================

  const resetChat = () => {

    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content:
          "Chat restarted. 👋\n\nWhat would you like to know about your career?",
      },
    ]);

    setInput("");
    setError("");
  };


  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const sendMessage =
    async () => {

      const query =
        input.trim();

      if (
        !query ||
        loading
      ) {
        return;
      }

      setError("");

      // --------------------------------------------------------
      // ADD USER MESSAGE
      // --------------------------------------------------------

      const userMessage = {
        id:
          `user-${Date.now()}`,
        role: "user",
        content: query,
      };

      setMessages(
        (previous) => [
          ...previous,
          userMessage,
        ]
      );

      setInput("");
      setLoading(true);

      try {

        // ------------------------------------------------------
        // CALL COPILOT API
        // ------------------------------------------------------

        const response =
          await copilotService.chat(
            query
          );

        console.log(
          "COPILOT RESPONSE:",
          response
        );

        const assistantText =
          extractAssistantMessage(
            response
          );

        if (!assistantText) {
          throw new Error(
            "Copilot returned an empty response."
          );
        }

        // ------------------------------------------------------
        // ADD AI MESSAGE
        // ------------------------------------------------------

        setMessages(
          (previous) => [
            ...previous,
            {
              id:
                `assistant-${Date.now()}`,
              role: "assistant",
              content:
                assistantText,
            },
          ]
        );

      } catch (err) {

        console.error(
          "COPILOT CHAT ERROR:",
          err
        );

        setError(
          err?.message ||
            "Unable to get a response from Copilot."
        );

      } finally {

        setLoading(false);

        setTimeout(() => {

          textareaRef.current?.focus();

        }, 50);
      }
    };


  // ============================================================
  // ENTER TO SEND
  // ============================================================

  const handleKeyDown =
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendMessage();
      }
    };


  // ============================================================
  // IF CLOSED
  // ============================================================

  if (!isOpen) {
    return null;
  }


  // ============================================================
  // UI
  // ============================================================

  return (
    <div
      className="
        fixed
        inset-0
        z-[200]
        bg-[#10231b]/35
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-4
      "
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }

      }}
    >

      <div
        className="
          w-full
          max-w-4xl
          h-[82vh]
          max-h-[760px]
          min-h-[560px]
          bg-white
          rounded-[28px]
          border
          border-[#dfe7e2]
          shadow-2xl
          overflow-hidden
          flex
          flex-col
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            px-6
            py-4
            border-b
            border-[#dfe7e2]
            bg-white
            flex
            items-center
            justify-between
            shrink-0
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-11
                h-11
                rounded-2xl
                bg-gradient-to-br
                from-[#123c2c]
                to-[#19714e]
                flex
                items-center
                justify-center
                text-[#b9ef84]
                shadow-sm
              "
            >

              <Sparkles
                size={21}
              />

            </div>

            <div>

              <h2
                className="
                  text-base
                  font-bold
                  text-[#10231b]
                "
              >
                SkillCart Copilot
              </h2>

              <p
                className="
                  text-xs
                  text-[#68756f]
                  mt-0.5
                "
              >
                Your AI career assistant
              </p>

            </div>

          </div>


          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <button
              type="button"
              onClick={
                resetChat
              }
              title="New chat"
              className="
                w-9
                h-9
                rounded-xl
                border
                border-[#dfe7e2]
                text-[#68756f]
                flex
                items-center
                justify-center
                hover:bg-[#f7faf8]
                hover:text-[#19714e]
                transition
              "
            >

              <RotateCcw
                size={16}
              />

            </button>

            <button
              type="button"
              onClick={onClose}
              title="Close Copilot"
              className="
                w-9
                h-9
                rounded-xl
                border
                border-[#dfe7e2]
                text-[#68756f]
                flex
                items-center
                justify-center
                hover:bg-red-50
                hover:text-red-500
                transition
              "
            >

              <X
                size={18}
              />

            </button>

          </div>

        </div>


        {/* ====================================================
            CHAT AREA
        ==================================================== */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-5
            sm:px-8
            py-6
            bg-[#f8fbf9]
          "
        >

          <div
            className="
              max-w-3xl
              mx-auto
              space-y-5
            "
          >

            {messages.map(
              (message) => {

                const isUser =
                  message.role ===
                  "user";

                return (
                  <div
                    key={message.id}
                    className={`
                      flex
                      gap-3
                      ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }
                    `}
                  >

                    {/* AI ICON */}

                    {!isUser && (

                      <div
                        className="
                          w-9
                          h-9
                          rounded-xl
                          bg-[#dff8eb]
                          text-[#19714e]
                          flex
                          items-center
                          justify-center
                          shrink-0
                          mt-1
                        "
                      >

                        <Bot
                          size={18}
                        />

                      </div>

                    )}


                    {/* MESSAGE */}

                    <div
                      className={`
                        max-w-[80%]
                        rounded-2xl
                        px-4
                        py-3
                        shadow-xs

                        ${
                          isUser
                            ? `
                              bg-[#123c2c]
                              text-white
                              rounded-br-md
                            `
                            : `
                              bg-white
                              border
                              border-[#dfe7e2]
                              rounded-bl-md
                            `
                        }
                      `}
                    >

                      {isUser ? (

                        <p
                          className="
                            text-sm
                            leading-6
                            whitespace-pre-wrap
                          "
                        >
                          {message.content}
                        </p>

                      ) : (

                        <div>
                          {formatAssistantText(
                            message.content
                          )}
                        </div>

                      )}

                    </div>


                    {/* USER ICON */}

                    {isUser && (

                      <div
                        className="
                          w-9
                          h-9
                          rounded-xl
                          bg-[#123c2c]
                          text-[#b9ef84]
                          flex
                          items-center
                          justify-center
                          shrink-0
                          mt-1
                        "
                      >

                        <User
                          size={17}
                        />

                      </div>

                    )}

                  </div>
                );
              }
            )}


            {/* =================================================
                TYPING INDICATOR
            ================================================= */}

            {loading && (

              <div
                className="
                  flex
                  gap-3
                  items-start
                "
              >

                <div
                  className="
                    w-9
                    h-9
                    rounded-xl
                    bg-[#dff8eb]
                    text-[#19714e]
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >

                  <Bot
                    size={18}
                  />

                </div>

                <div
                  className="
                    bg-white
                    border
                    border-[#dfe7e2]
                    rounded-2xl
                    rounded-bl-md
                    px-4
                    py-3
                    flex
                    items-center
                    gap-1.5
                  "
                >

                  <span
                    className="
                      w-1.5
                      h-1.5
                      rounded-full
                      bg-[#19714e]
                      animate-bounce
                    "
                  />

                  <span
                    className="
                      w-1.5
                      h-1.5
                      rounded-full
                      bg-[#19714e]
                      animate-bounce
                      [animation-delay:150ms]
                    "
                  />

                  <span
                    className="
                      w-1.5
                      h-1.5
                      rounded-full
                      bg-[#19714e]
                      animate-bounce
                      [animation-delay:300ms]
                    "
                  />

                </div>

              </div>
            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                  px-4
                  py-3
                  rounded-2xl
                  bg-red-50
                  border
                  border-red-200
                  text-red-600
                  text-xs
                  font-semibold
                "
              >

                <span>
                  {error}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="
                    shrink-0
                    text-red-500
                  "
                >
                  <X
                    size={15}
                  />
                </button>

              </div>
            )}

            <div
              ref={
                messagesEndRef
              }
            />

          </div>

        </div>


        {/* ====================================================
            INPUT AREA
        ==================================================== */}

        <div
          className="
            shrink-0
            border-t
            border-[#dfe7e2]
            bg-white
            px-5
            sm:px-8
            py-4
          "
        >

          <div
            className="
              max-w-3xl
              mx-auto
            "
          >

            <div
              className="
                flex
                items-end
                gap-2
                bg-[#f7faf8]
                border
                border-[#dfe7e2]
                rounded-2xl
                p-2
                focus-within:border-[#19714e]
                focus-within:ring-2
                focus-within:ring-[#19714e]/10
                transition
              "
            >

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                disabled={loading}
                rows={1}
                maxLength={3000}
                placeholder="
                  Ask Copilot about your career, resume, skills or jobs...
                "
                className="
                  flex-1
                  resize-none
                  bg-transparent
                  outline-none
                  border-none
                  px-3
                  py-2.5
                  text-sm
                  text-[#10231b]
                  placeholder:text-[#9aa8a2]
                  max-h-32
                  overflow-y-auto
                "
              />

              <button
                type="button"
                onClick={
                  sendMessage
                }
                disabled={
                  loading ||
                  !input.trim()
                }
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-[#123c2c]
                  hover:bg-[#19714e]
                  text-white
                  flex
                  items-center
                  justify-center
                  shrink-0
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  transition
                "
              >

                {loading ? (

                  <Loader2
                    size={18}
                    className="
                      animate-spin
                    "
                  />

                ) : (

                  <Send
                    size={18}
                  />

                )}

              </button>

            </div>

            <div
              className="
                flex
                items-center
                justify-between
                mt-2
                px-1
              "
            >

              <p
                className="
                  text-[10px]
                  text-[#8a9892]
                "
              >
                Enter to send • Shift + Enter for new line
              </p>

              <p
                className="
                  text-[10px]
                  text-[#8a9892]
                "
              >
                {input.length}/3000
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}