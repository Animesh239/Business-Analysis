import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { tokens } from "../../theme";
import { mockTransactions } from "../../data/mockData";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import GeographyChart from "../../components/GeographyChart";
import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";
import { auth, database } from "../../firebase";
import { useEffect, useState } from "react";
import { getDatabase, get, ref } from "firebase/database";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const StatCard = ({ title, subtitle, icon, progress, increase, delay = 0 }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <Box
        gridColumn="span 3"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          background: `linear-gradient(135deg, ${colors.primary[400]}dd, ${colors.primary[500]}dd)`,
          backdropFilter: "blur(20px)",
          border: `1px solid ${colors.tealAccent[600]}40`,
          borderRadius: "20px",
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.2),
            0 0 0 1px ${colors.tealAccent[600]}20,
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, ${colors.tealAccent[500]}, ${colors.blueAccent[500]})`,
            backgroundSize: "200% 100%",
            animation: "shimmer 3s linear infinite",
          },
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "-200% 0" },
            "100%": { backgroundPosition: "200% 0" }
          }
        }}
      >
        <StatBox
          title={title}
          subtitle={subtitle}
          progress={progress}
          increase={increase}
          icon={icon}
        />
      </Box>
    </motion.div>
  );
};

const ChartCard = ({ children, title, gridColumn, gridRow, delay = 0 }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
    >
      <Box
        gridColumn={gridColumn}
        gridRow={gridRow}
        sx={{
          background: `linear-gradient(135deg, ${colors.primary[400]}dd, ${colors.primary[500]}dd)`,
          backdropFilter: "blur(20px)",
          border: `1px solid ${colors.tealAccent[600]}40`,
          borderRadius: "20px",
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.2),
            0 0 0 1px ${colors.tealAccent[600]}20,
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, ${colors.tealAccent[500]}, ${colors.blueAccent[500]})`,
            backgroundSize: "200% 100%",
            animation: "shimmer 3s linear infinite",
          },
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "-200% 0" },
            "100%": { backgroundPosition: "200% 0" }
          }
        }}
      >
        {children}
      </Box>
    </motion.div>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [location, setLocations] = useState([]);
  const [userActivityCount, setUserActivityCount] = useState(0);
  const [totalSalesPerUnit, setTotalSalesPerUnit] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  useEffect(() => {
    const fetchTotalRevenue = async () => {
      if (!auth.currentUser) {
        console.error("User is not authenticated");
        return;
      }
      const db = getDatabase();
      const dataRef = ref(
        db,
        `admins/${auth.currentUser.uid}/formData/salesPerMonth`
      );
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        const firebaseData = snapshot.val();
        const total = Object.values(firebaseData).reduce(
          (acc, item) => acc + item.amount,
          0
        );
        setTotalRevenue(total);
      } else {
        console.log("No data available");
      }
    };

    const fetchLocations = async () => {
      try {
        if (!auth.currentUser) {
          console.error("User is not authenticated");
          return;
        }
        // Fetch locations data from Firebase Realtime Database for current user
        const db = database;
        const dataRef = ref(
          db,

          `admins/${auth.currentUser.uid}/formData/salesPerUnit`
        );
        const snapshot = await get(dataRef);

        if (snapshot.exists()) {
          const firebaseData = snapshot.val();
          console.log("fetched from firebase", firebaseData);
          setLocations(firebaseData);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };
    const fetchUserActivityCount = async () => {
      if (!auth.currentUser) {
        console.error("User is not authenticated");
        return;
      }
      const db = getDatabase();

      const dataRef = ref(db, `userList/${auth.currentUser.uid}`);

      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        const firebaseData = snapshot.val();
        const validEntriesCount = Object.keys(firebaseData).length;
        setUserActivityCount(validEntriesCount);
      } else {
        console.log("No user activity data available");
      }
    };
    const fetchTotalSalesPerUnit = async () => {
      try {
        const db = getDatabase();
        const salesPerUnitRef = ref(
          db,

          `admins/${auth.currentUser.uid}/formData/salesPerUnit`
        );
        console.log(
          "Fetching data from path:",
          `admins/${auth.currentUser.uid}/formData/salesPerUnit`
        );

        const snapshot = await get(salesPerUnitRef);
        console.log("Snapshot:", snapshot);

        // Handle the fetched data
        if (snapshot.exists()) {
          const salesData = snapshot.val();
          console.log("Fetched data from Firebase:", salesData); // Log the fetched data

          // Check if the fetched data is an array or an object
          if (Array.isArray(salesData)) {
            const totalSales = salesData.reduce(
              (sum, item) => sum + (item.unitSales || 0),
              0
            );
            console.log("Total Sales Calculated (Array):", totalSales);
            setTotalSalesPerUnit(totalSales);
          } else if (typeof salesData === "object") {
            const totalSales = Object.values(salesData).reduce(
              (sum, item) => sum + (item.unitSales || 0),
              0
            );
            console.log("Total Sales Calculated (Object):", totalSales);
            setTotalSalesPerUnit(totalSales);
          } else {
            console.log(
              "Sales data format is neither an array nor an object:",
              salesData
            );
          }
        } else {
          console.log("No sales per unit data available");
        }

        setDataLoaded(true); // Set data loaded state
      } catch (error) {
        console.error("Error fetching sales per unit data:", error);
        setDataLoaded(true);
      }
    };

    fetchTotalRevenue();
    fetchLocations();
    fetchUserActivityCount();
    fetchTotalSalesPerUnit();
  }, []);

  const handleDownload = async () => {
    const doc = new jsPDF("p", "pt", "a4");

    // Capture the chart elements
    const lineChartElement = document.getElementById("line-chart");
    const barChartElement = document.getElementById("bar-chart");
    const geoChartElement = document.getElementById("geo-chart");

    const lineChartCanvas = await html2canvas(lineChartElement);
    const barChartCanvas = await html2canvas(barChartElement);
    const geoChartCanvas = await html2canvas(geoChartElement);

    const lineChartImg = lineChartCanvas.toDataURL("image/png");
    const barChartImg = barChartCanvas.toDataURL("image/png");
    const geoChartImg = geoChartCanvas.toDataURL("image/png");

    // Add content to PDF
    doc.setFontSize(18);
    doc.text("Dashboard Report", 20, 30);

    doc.setFontSize(14);
    doc.text("Revenue Generated", 20, 60);
    doc.addImage(lineChartImg, "PNG", 20, 70, 555.28, 150);

    doc.text("Sales Quantity", 20, 240);
    doc.addImage(barChartImg, "PNG", 20, 250, 555.28, 150);

    doc.text("Geography Based Traffic", 20, 420);
    doc.addImage(geoChartImg, "PNG", 20, 430, 555.28, 150);

    // Add stats
    doc.text("Statistics", 20, 600);
    doc.setFontSize(12);
    doc.text(`Total Revenue: $${totalRevenue}`, 20, 620);
    doc.text(`Total Locations: ${Object.keys(location).length}`, 20, 640);

    // Save the PDF
    doc.save("dashboard-report.pdf");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Box m="20px" id="dashboard-content">
      {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />

            <Box>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleDownload}
                  sx={{
                    background: `linear-gradient(45deg, ${colors.blueAccent[600]}, ${colors.tealAccent[600]})`,
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    textTransform: "none",
                    boxShadow: `0 4px 20px ${colors.blueAccent[600]}40`,
                    border: `1px solid ${colors.blueAccent[600]}40`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: `0 6px 30px ${colors.blueAccent[600]}60`,
                      transform: "translateY(-2px)"
                    }
                  }}
                >
                  <DownloadOutlinedIcon sx={{ mr: "10px" }} />
                  Download Reports
                </Button>
              </motion.div>
            </Box>
          </Box>
        </motion.div>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <StatCard
          title={userActivityCount}
          subtitle="Team Members"
          progress="0.75"
          increase="+14%"
          delay={0.1}
          icon={
            <EmailIcon
              sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
            />
          }
        />
        <StatCard
          title={totalSalesPerUnit}
          subtitle="Sales Obtained"
          progress="0.50"
          increase="+21%"
          delay={0.2}
          icon={
            <PointOfSaleIcon
              sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
            />
          }
        />
        <StatCard
          title="32,441"
          subtitle="New Clients"
          progress="0.30"
          increase="+5%"
          delay={0.3}
          icon={
            <PersonAddIcon
              sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
            />
          }
        />
        <StatCard
          title="1,325,134"
          subtitle="Traffic Received"
          progress="0.80"
          increase="+43%"
          delay={0.4}
          icon={
            <TrafficIcon
              sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
            />
          }
        />
        {/* ROW 2 */}
        <ChartCard 
          gridColumn="span 8" 
          gridRow="span 2" 
          delay={0.5}
        >
          <Box id="line-chart">
            <Box
              mt="25px"
              p="0 30px"
              display="flex "
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography
                  variant="h5"
                  fontWeight="600"
                  color={colors.grey[100]}
                >
                  Revenue Generated
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  color={colors.greenAccent[500]}
                >
                  ${totalRevenue}
                </Typography>
              </Box>
              <Box>
                <IconButton>
                  <DownloadOutlinedIcon
                    sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                  />
                </IconButton>
              </Box>
            </Box>
            <Box height="250px" m="-20px 0 0 0">
              <LineChart isDashboard={true} />
            </Box>
          </Box>
        </ChartCard>
        
        <ChartCard 
          gridColumn="span 4" 
          gridRow="span 2" 
          delay={0.6}
        >
          <Box
            overflow="auto"
          >
            <Box>
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              colors={colors.grey[100]}
              p="15px"
            >
              <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
                Recent Transactions
              </Typography>
            </Box>
            {mockTransactions.map((transaction, i) => (
              <motion.div
                key={`${transaction.txId}-${i}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  borderBottom={`4px solid ${colors.primary[500]}`}
                  p="15px"
                  sx={{
                    border: `1px solid ${colors.grey[600]}40`,
                    borderRadius: "8px",
                    mb: 1,
                    background: `${colors.primary[600]}20`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: `${colors.primary[600]}40`,
                      transform: "translateX(5px)"
                    }
                  }}
                >
                  <Box>
                    <Typography
                      color={colors.greenAccent[500]}
                      variant="h5"
                      fontWeight="600"
                    >
                      {transaction.user}
                    </Typography>
                    <Typography color={colors.grey[100]}>
                      {transaction.txId}
                    </Typography>
                  </Box>
                  <Box color={colors.grey[100]}>{transaction.date}</Box>
                  <Box
                    sx={{
                      background: `linear-gradient(45deg, ${colors.greenAccent[500]}, ${colors.tealAccent[500]})`,
                      p: "5px 10px",
                      borderRadius: "8px",
                      fontWeight: "bold"
                    }}
                  >
                    ${transaction.cost}
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </ChartCard>

        {/* ROW 3 */}
        <ChartCard 
          gridColumn="span 4" 
          gridRow="span 2" 
          delay={0.7}
        >
          <Box p="30px">
            <Typography variant="h5" fontWeight="600">
              Campaign
            </Typography>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mt="25px"
            >
              <ProgressCircle size="125" />
              <Typography
                variant="h5"
                color={colors.greenAccent[500]}
                sx={{ mt: "15px" }}
              >
                $48,352 revenue generated
              </Typography>
              <Typography>Includes extra misc expenditures and costs</Typography>
            </Box>
          </Box>
        </ChartCard>
        
        <ChartCard 
          gridColumn="span 4" 
          gridRow="span 2" 
          delay={0.8}
        >
          <Box id="bar-chart">
            <Typography
              variant="h5"
              fontWeight="600"
              sx={{ padding: "30px 30px 0 30px" }}
            >
              Sales Quantity
            </Typography>
            <Box height="250px" mt="-20px">
              <BarChart isDashboard={true} />
            </Box>
          </Box>
        </ChartCard>
        
        <ChartCard 
          gridColumn="span 4" 
          gridRow="span 2" 
          delay={0.9}
        >
          <Box padding="30px" id="geo-chart">
            <Typography
              variant="h5"
              fontWeight="600"
              sx={{ marginBottom: "15px" }}
            >
              Geography Based Traffic
            </Typography>
            <Box height="200px">
              <GeographyChart isDashboard={true} locationData={location} />
            </Box>
          </Box>
        </ChartCard>
      </Box>
      </Box>
    </motion.div>
  );
};

export default Dashboard;

          >
            <ProgressCircle size="125" />
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
              $48,352 revenue generated
            </Typography>
            <Typography>Includes extra misc expenditures and costs</Typography>
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          id="bar-chart"
          sx={{
            border: `2px solid ${colors.tealAccent[600]}`,
            boxShadow: `0 0 5px ${colors.tealAccent[600]}`,
            "@media (prefers-color-scheme: dark)": {
              bgcolor: "#18181b", // Equivalent to dark:bg-zinc-900
            },
          }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Sales Quantity
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
          id="geo-chart"
          sx={{
            border: `2px solid ${colors.tealAccent[600]}`,
            boxShadow: `0 0 5px ${colors.tealAccent[600]}`,
            "@media (prefers-color-scheme: dark)": {
              bgcolor: "#18181b", // Equivalent to dark:bg-zinc-900
            },
          }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Geography Based Traffic
          </Typography>
          <Box height="200px">
            <GeographyChart isDashboard={true} locationData={location} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
