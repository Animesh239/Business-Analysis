import React, { useEffect, useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, Avatar, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { auth } from "../../firebase";
import { get, getDatabase, ref, update } from "firebase/database";

const Item = ({ title, to, icon, selected, setSelected, isCollapsed }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isActive = selected === title;
  
  return (
    <motion.div
      whileHover={{ x: isCollapsed ? 0 : 5 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <MenuItem
        active={isActive}
        style={{
          color: colors.grey[100],
          margin: "8px 0",
          borderRadius: isCollapsed ? "0" : "0 25px 25px 0",
          background: isActive 
            ? `linear-gradient(45deg, ${colors.tealAccent[600]}20, ${colors.blueAccent[600]}20)`
            : "transparent",
          border: isActive 
            ? `1px solid ${colors.tealAccent[600]}40`
            : "1px solid transparent",
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden"
        }}
        onClick={() => setSelected(title)}
        icon={
          <Box
            sx={{
              color: isActive ? colors.tealAccent[400] : colors.grey[300],
              transition: "all 0.3s ease",
              filter: isActive ? `drop-shadow(0 0 8px ${colors.tealAccent[400]}60)` : "none"
            }}
          >
            {icon}
          </Box>
        }
      >
        <Typography 
          sx={{
            fontWeight: isActive ? 600 : 400,
            color: isActive ? colors.tealAccent[300] : colors.grey[100]
          }}
        >
          {title}
        </Typography>
        <Link to={to} />
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "4px",
              background: `linear-gradient(180deg, ${colors.tealAccent[400]}, ${colors.blueAccent[400]})`,
              borderRadius: "2px 0 0 2px"
            }}
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </MenuItem>
    </motion.div>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const user = auth.currentUser;
  const db = getDatabase();

  useEffect(() => {
    if (user) {
      const fetchUserInfo = async () => {
        const userRef = ref(db, `admins/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setRole(userData.role);
          setName(userData.name);
          setProfileImage(userData.profileImage || "");
        }
      };
      fetchUserInfo();
    }
  }, [user, db]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(",")[1];
      if (user) {
        const userRef = ref(db, `admins/${user.uid}`);
        await update(userRef, { profileImage: base64String });
        setProfileImage(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const menuItems = [
    { title: "Dashboard", to: "/dashboard", icon: <HomeOutlinedIcon />, category: "main" },
    { title: "Manage Team", to: "/team", icon: <PeopleOutlinedIcon />, category: "data" },
    { title: "Team Information", to: "/contacts", icon: <ContactsOutlinedIcon />, category: "data" },
    { title: "Feedback", to: "/feedback", icon: <ReceiptOutlinedIcon />, category: "data" },
    { title: "Business Form", to: "/form", icon: <PersonOutlinedIcon />, category: "pages" },
    { title: "Calendar", to: "/calendar", icon: <CalendarTodayOutlinedIcon />, category: "pages" },
    { title: "Bar Chart", to: "/bar", icon: <BarChartOutlinedIcon />, category: "charts" },
    { title: "Pie Chart", to: "/pie", icon: <PieChartOutlineOutlinedIcon />, category: "charts" },
    { title: "Line Chart", to: "/line", icon: <TimelineOutlinedIcon />, category: "charts" },
    { title: "Geography Chart", to: "/geography", icon: <MapOutlinedIcon />, category: "charts" },
  ];

  const categories = {
    main: { title: "", items: menuItems.filter(item => item.category === "main") },
    data: { title: "Data Management", items: menuItems.filter(item => item.category === "data") },
    pages: { title: "Pages", items: menuItems.filter(item => item.category === "pages") },
    charts: { title: "Analytics", items: menuItems.filter(item => item.category === "charts") }
  };

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `linear-gradient(180deg, ${colors.primary[900]} 0%, ${colors.primary[800]} 50%, ${colors.primary[900]} 100%)`,
          backdropFilter: "blur(20px)",
          borderRight: `1px solid ${colors.tealAccent[600]}20`,
          boxShadow: `4px 0 20px ${colors.primary[900]}60`
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "8px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: `${colors.tealAccent[300]} !important`,
          background: `${colors.tealAccent[600]}10 !important`
        },
        "& .pro-menu-item.active": {
          color: `${colors.tealAccent[300]} !important`,
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Typography 
                    variant="h3" 
                    sx={{
                      background: `linear-gradient(45deg, ${colors.tealAccent[400]}, ${colors.blueAccent[400]})`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: "bold"
                    }}
                  >
                    Dashboard
                  </Typography>
                </motion.div>
                <Tooltip title={isCollapsed ? "Expand" : "Collapse"}>
                  <IconButton 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    sx={{
                      color: colors.tealAccent[400],
                      "&:hover": {
                        background: `${colors.tealAccent[600]}20`,
                        transform: "rotate(180deg)"
                      },
                      transition: "all 0.3s ease"
                    }}
                  >
                    <MenuOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </MenuItem>

          {/* USER PROFILE */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Box mb="25px" px="20px">
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    position="relative"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Avatar
                        src={profileImage ? `data:image/png;base64,${profileImage}` : undefined}
                        sx={{
                          width: 80,
                          height: 80,
                          border: `3px solid ${colors.tealAccent[500]}`,
                          boxShadow: `0 0 20px ${colors.tealAccent[500]}40`,
                          background: profileImage ? "none" : `linear-gradient(45deg, ${colors.tealAccent[600]}, ${colors.blueAccent[600]})`,
                          fontSize: "2rem",
                          fontWeight: "bold"
                        }}
                      >
                        {!profileImage && name.charAt(0)}
                      </Avatar>
                    </motion.div>
                    
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      id="upload-button"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="upload-button">
                      <Tooltip title="Change Profile Picture">
                        <IconButton
                          component="span"
                          sx={{
                            position: "absolute",
                            bottom: -5,
                            right: 5,
                            background: `linear-gradient(45deg, ${colors.tealAccent[600]}, ${colors.blueAccent[600]})`,
                            color: "white",
                            width: 32,
                            height: 32,
                            boxShadow: `0 4px 15px ${colors.tealAccent[600]}40`,
                            "&:hover": {
                              transform: "scale(1.1)",
                              boxShadow: `0 6px 20px ${colors.tealAccent[600]}60`
                            },
                            transition: "all 0.3s ease"
                          }}
                        >
                          <AddAPhotoIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </label>
                  </Box>
                  
                  <Box textAlign="center" mt={2}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          color: colors.grey[100],
                          fontWeight: "bold",
                          mb: 0.5
                        }}
                      >
                        {name}
                      </Typography>
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 2,
                          py: 0.5,
                          borderRadius: "20px",
                          background: `linear-gradient(45deg, ${colors.tealAccent[600]}20, ${colors.blueAccent[600]}20)`,
                          border: `1px solid ${colors.tealAccent[600]}40`
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{
                            color: colors.tealAccent[300],
                            fontWeight: 600,
                            textTransform: "capitalize"
                          }}
                        >
                          {role}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MENU ITEMS */}
          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            {Object.entries(categories).map(([key, category]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {category.title && !isCollapsed && (
                  <Typography
                    variant="h6"
                    sx={{
                      color: colors.grey[400],
                      m: "20px 0 10px 20px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      opacity: 0.8
                    }}
                  >
                    {category.title}
                  </Typography>
                )}
                
                {category.items.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Item
                      title={item.title}
                      to={item.to}
                      icon={item.icon}
                      selected={selected}
                      setSelected={setSelected}
                      isCollapsed={isCollapsed}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;