import { Box, Button, IconButton, useTheme, Badge, Tooltip, Avatar } from "@mui/material";
import { motion } from "framer-motion";
import { tokens } from "../../theme";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, database } from "../../firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";
import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";

const Topbar = ({ handleLogout }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [hasClickedBadge, setHasClickedBadge] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", profileImage: "" });

  const handleLogoutdb = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      handleLogout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/");
      return;
    }

    const fetchMessagesAndUserRole = async () => {
      const currentUser = auth.currentUser || storedUser;

      if (!currentUser) {
        navigate("/");
        return;
      }

      // Fetch user info
      const adminRef = ref(database, `admins/${currentUser.uid}`);
      const adminSnapshot = await get(adminRef);
      if (adminSnapshot.exists()) {
        const adminData = adminSnapshot.val();
        setUserInfo({
          name: adminData.name || "",
          profileImage: adminData.profileImage || ""
        });
      }

      const userRef = ref(database, `rolemail/${currentUser.uid}`);
      const userSnapshot = await get(userRef);
      let userData;
      if (userSnapshot.exists()) {
        userData = userSnapshot.val();
        setCurrentUserRole(userData.role);
      }

      if (userData && userData.role === "admin") {
        const messagesRef = ref(database, "chats");
        const snapshot = await get(messagesRef);
        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          const allMessages = Object.values(messagesData).flatMap(
            (userMessages) => Object.values(userMessages)
          );
          const superAdminMessages = allMessages.filter(
            (message) => message.sender === "superadmin"
          );
          if (!hasClickedBadge) {
            setUnreadMessagesCount(superAdminMessages.length);
          }
        } else {
          setUnreadMessagesCount(0);
        }
      }
    };

    fetchMessagesAndUserRole();
  }, [handleLogout, navigate, hasClickedBadge]);

  const handleIconClick = () => {
    setUnreadMessagesCount(0);
    setHasClickedBadge(true);
    navigate("/notifications");
  };

  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center"
      p={2}
      sx={{
        background: `linear-gradient(90deg, ${colors.primary[800]}00, ${colors.primary[700]}40)`,
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${colors.tealAccent[600]}20`
      }}
    >
      {/* User Info Section */}
      <Box display="flex" alignItems="center" gap={2}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Avatar
            src={userInfo.profileImage ? `data:image/png;base64,${userInfo.profileImage}` : undefined}
            sx={{
              width: 40,
              height: 40,
              border: `2px solid ${colors.tealAccent[500]}40`,
              background: userInfo.profileImage ? "none" : `linear-gradient(45deg, ${colors.tealAccent[600]}, ${colors.blueAccent[600]})`,
              fontSize: "1.2rem",
              fontWeight: "bold"
            }}
          >
            {!userInfo.profileImage && userInfo.name.charAt(0)}
          </Avatar>
        </motion.div>
      </Box>

      {/* Actions Section */}
      <Box display="flex" alignItems="center" gap={2}>
        {/* Notifications for Admin */}
        {currentUserRole === "admin" && location.pathname !== "/admins" && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Tooltip title="Messages" arrow>
              <IconButton 
                onClick={handleIconClick}
                sx={{
                  background: `${colors.primary[600]}60`,
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${colors.tealAccent[600]}40`,
                  color: colors.tealAccent[400],
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: `${colors.tealAccent[600]}20`,
                    border: `1px solid ${colors.tealAccent[600]}60`,
                    boxShadow: `0 4px 20px ${colors.tealAccent[600]}30`
                  }
                }}
              >
                <Badge
                  badgeContent={Math.max(unreadMessagesCount - 1, 0)}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      background: `linear-gradient(45deg, ${colors.redAccent[500]}, ${colors.redAccent[400]})`,
                      boxShadow: `0 2px 10px ${colors.redAccent[500]}40`
                    }
                  }}
                >
                  <ChatIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </motion.div>
        )}

        {/* Logout Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Tooltip title="Sign Out" arrow>
            <Button
              onClick={handleLogoutdb}
              variant="contained"
              startIcon={<LogoutIcon />}
              sx={{
                background: `linear-gradient(45deg, ${colors.redAccent[600]}, ${colors.redAccent[500]})`,
                backgroundSize: "200% 200%",
                animation: "gradientShift 3s ease infinite",
                border: `1px solid ${colors.redAccent[600]}40`,
                borderRadius: "12px",
                px: 3,
                py: 1,
                color: "white",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: `0 4px 20px ${colors.redAccent[600]}40`,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: `0 6px 30px ${colors.redAccent[600]}60`,
                  transform: "translateY(-2px)"
                },
                "@keyframes gradientShift": {
                  "0%": { backgroundPosition: "0% 50%" },
                  "50%": { backgroundPosition: "100% 50%" },
                  "100%": { backgroundPosition: "0% 50%" }
                }
              }}
            >
              Sign Out
            </Button>
          </Tooltip>
        </motion.div>
      </Box>
    </Box>
  );
};

export default Topbar;