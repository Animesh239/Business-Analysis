import { useEffect, useState } from "react";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  useTheme, 
  Card,
  CardContent,
  Fade,
  Slide,
  IconButton,
  InputAdornment,
  Alert,
  Chip,
  Stack
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { tokens } from "../../theme";
import { auth, database } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

const Login = ({ handleLoginSuccess }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Predefined credentials for easy access
  const credentials = [
    {
      role: "Super Admin",
      email: "testing@gmail.com",
      password: "12345678",
      icon: <SupervisorAccountIcon />,
      color: colors.redAccent[500],
      description: "Full system access"
    },
    {
      role: "Admin",
      email: "kohli@gmail.com",
      password: "12345678",
      icon: <AdminPanelSettingsIcon />,
      color: colors.blueAccent[500],
      description: "Business management"
    }
    // {
    //   role: "Admin",
    //   email: "subha@gmail.com",
    //   password: "12345678",
    //   icon: <AdminPanelSettingsIcon />,
    //   color: colors.blueAccent[500],
    //   description: "Business management"
    // }
  ];

  const handleCredentialSelect = (credential) => {
    setEmail(credential.email);
    setPassword(credential.password);
    setSelectedRole(credential.role);
    setError("");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const roleMailRef = ref(database, "rolemail");
      const roleMailSnapshot = await get(roleMailRef);

      if (roleMailSnapshot.exists()) {
        const roleMailData = roleMailSnapshot.val();
        const userEntry = Object.entries(roleMailData).find(
          ([key, value]) => value.email === email
        );

        if (userEntry) {
          const [userId, userInfo] = userEntry;
          const { role } = userInfo;

          if (role === "superadmin") {
            const userRef = ref(database, "users/" + userId);
            const userSnapshot = await get(userRef);
            if (userSnapshot.exists()) {
              const userData = userSnapshot.val();
              if (userData.password === password) {
                handleLoginSuccess(role);
                localStorage.setItem("user", JSON.stringify({ uid: userId, role }));
                return;
              } else {
                setError("Invalid credentials");
                return;
              }
            } else {
              setError("User not found");
              return;
            }
          } else if (role === "admin") {
            const adminRef = ref(database, "admins/" + userId);
            const adminSnapshot = await get(adminRef);
            if (adminSnapshot.exists()) {
              const adminData = adminSnapshot.val();
              if (adminData.password === password) {
                handleLoginSuccess(role);
                localStorage.setItem("user", JSON.stringify({ uid: userId, role }));
                return;
              } else {
                setError("Invalid credentials");
                return;
              }
            } else {
              setError("Admin not found");
              return;
            }
          } else if (role === "user") {
            const useridSplit = userId.split("_")[0];
            const useRef = ref(database, "userList/" + useridSplit + "/" + userId);
            const useSnapshot = await get(useRef);
            if (useSnapshot.exists()) {
              const useData = useSnapshot.val();
              if (useData.blocked) {
                await auth.signOut();
                setError("Your account has been blocked. Please contact support.");
                return;
              }
              if (useData.password === password) {
                handleLoginSuccess(role);
                localStorage.setItem("user", JSON.stringify({ uid: userId, role }));
                const hour = new Date().getHours();
                const minute = new Date().getMinutes();
                const signInTime = `${hour}:${minute}`;
                const DateMonth = new Date().getMonth();
                const DateDay = new Date().getDate();
                const loginTime = `${signInTime} - ${DateMonth}/${DateDay}`;
                const signInTimeRef = ref(database, "userList/" + useridSplit + "/" + userId + "/signInTime");
                await set(signInTimeRef, loginTime);
                return;
              } else {
                setError("Invalid credentials");
                return;
              }
            } else {
              setError("User not found");
              return;
            }
          } else {
            setError("Invalid account type");
            return;
          }
        } else {
          setError("Email not found");
          return;
        }
      } else {
        setError("No user data found");
        return;
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${colors.primary[900]} 0%, ${colors.primary[800]} 25%, ${colors.blueAccent[900]} 50%, ${colors.tealAccent[900]} 75%, ${colors.primary[900]} 100%)`,
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        "@keyframes gradientShift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Card
          sx={{
            maxWidth: 500,
            width: "100%",
            background: `linear-gradient(145deg, ${colors.primary[400]}dd, ${colors.primary[500]}dd)`,
            backdropFilter: "blur(20px)",
            border: `1px solid ${colors.tealAccent[600]}40`,
            borderRadius: "24px",
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.3),
              0 0 0 1px ${colors.tealAccent[600]}20,
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            overflow: "hidden",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: `linear-gradient(90deg, ${colors.tealAccent[500]}, ${colors.blueAccent[500]}, ${colors.purpleAccent[500]})`,
              backgroundSize: "200% 100%",
              animation: "shimmer 3s linear infinite",
            },
            "@keyframes shimmer": {
              "0%": { backgroundPosition: "-200% 0" },
              "100%": { backgroundPosition: "200% 0" }
            }
          }}
        >
          <CardContent sx={{ padding: "40px" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Box textAlign="center" mb={4}>
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <LoginIcon 
                    sx={{ 
                      fontSize: 60, 
                      color: colors.tealAccent[500],
                      mb: 2,
                      filter: `drop-shadow(0 0 20px ${colors.tealAccent[500]}40)`
                    }} 
                  />
                </motion.div>
                <Typography 
                  variant="h3" 
                  sx={{
                    background: `linear-gradient(45deg, ${colors.tealAccent[400]}, ${colors.blueAccent[400]})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: "bold",
                    mb: 1
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography 
                  variant="body1" 
                  color={colors.grey[300]}
                  sx={{ opacity: 0.8 }}
                >
                  Sign in to access your dashboard
                </Typography>
              </Box>
            </motion.div>

            {/* Quick Access Credentials */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Typography 
                variant="h6" 
                color={colors.grey[200]} 
                mb={2}
                sx={{ fontWeight: 600 }}
              >
                Quick Access
              </Typography>
              <Stack spacing={1} mb={3}>
                {credentials.map((cred, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Chip
                      icon={cred.icon}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {cred.role}: {cred.email}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {cred.description}
                          </Typography>
                        </Box>
                      }
                      onClick={() => handleCredentialSelect(cred)}
                      sx={{
                        width: "100%",
                        height: "auto",
                        padding: "12px 16px",
                        justifyContent: "flex-start",
                        background: selectedRole === cred.role && email === cred.email
                          ? `linear-gradient(45deg, ${cred.color}20, ${cred.color}10)`
                          : `${colors.primary[600]}40`,
                        border: selectedRole === cred.role && email === cred.email
                          ? `1px solid ${cred.color}`
                          : `1px solid ${colors.grey[600]}40`,
                        color: colors.grey[100],
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: `linear-gradient(45deg, ${cred.color}30, ${cred.color}15)`,
                          border: `1px solid ${cred.color}60`,
                          transform: "translateY(-2px)",
                          boxShadow: `0 4px 20px ${cred.color}20`
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </Stack>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your email or use quick access above"
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    background: `${colors.primary[600]}60`,
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: `${colors.primary[600]}80`,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.tealAccent[500],
                        boxShadow: `0 0 20px ${colors.tealAccent[500]}20`
                      }
                    },
                    "&.Mui-focused": {
                      background: `${colors.primary[600]}90`,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.tealAccent[400],
                        borderWidth: "2px",
                        boxShadow: `0 0 30px ${colors.tealAccent[500]}30`
                      }
                    }
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.grey[300],
                    "&.Mui-focused": {
                      color: colors.tealAccent[400]
                    }
                  },
                  "& .MuiOutlinedInput-input": {
                    color: colors.grey[100]
                  }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password or use quick access above"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: colors.grey[300] }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    background: `${colors.primary[600]}60`,
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: `${colors.primary[600]}80`,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.tealAccent[500],
                        boxShadow: `0 0 20px ${colors.tealAccent[500]}20`
                      }
                    },
                    "&.Mui-focused": {
                      background: `${colors.primary[600]}90`,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.tealAccent[400],
                        borderWidth: "2px",
                        boxShadow: `0 0 30px ${colors.tealAccent[500]}30`
                      }
                    }
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.grey[300],
                    "&.Mui-focused": {
                      color: colors.tealAccent[400]
                    }
                  },
                  "& .MuiOutlinedInput-input": {
                    color: colors.grey[100]
                  }
                }}
              />

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3,
                        background: `${colors.redAccent[900]}80`,
                        color: colors.redAccent[200],
                        border: `1px solid ${colors.redAccent[600]}40`,
                        borderRadius: "12px",
                        "& .MuiAlert-icon": {
                          color: colors.redAccent[400]
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleLogin}
                  disabled={loading}
                  sx={{
                    height: "56px",
                    borderRadius: "16px",
                    background: `linear-gradient(45deg, ${colors.tealAccent[600]}, ${colors.blueAccent[600]})`,
                    backgroundSize: "200% 200%",
                    animation: loading ? "none" : "gradientPulse 3s ease infinite",
                    boxShadow: `0 8px 30px ${colors.tealAccent[600]}40`,
                    border: "none",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    textTransform: "none",
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: `0 12px 40px ${colors.tealAccent[600]}60`,
                      transform: "translateY(-2px)"
                    },
                    "&:disabled": {
                      background: colors.grey[600],
                      color: colors.grey[400]
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                      transition: "left 0.5s",
                    },
                    "&:hover::before": {
                      left: "100%"
                    },
                    "@keyframes gradientPulse": {
                      "0%": { backgroundPosition: "0% 50%" },
                      "50%": { backgroundPosition: "100% 50%" },
                      "100%": { backgroundPosition: "0% 50%" }
                    }
                  }}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <LoginIcon />
                    </motion.div>
                  ) : (
                    <>
                      <LoginIcon sx={{ mr: 1 }} />
                      Sign In
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Login;
