import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Tabs, Tab, Container } from "@mui/material";
import {
  Settings as SettingsIcon,
  Person,
  Lock,
  Image,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../../store/slices/authSlice";

// Settings Components
import ProfileSettings from "./components/ProfileSettings";
import PasswordSettings from "./components/PasswordSettings";
import AvatarSettings from "./components/AvatarSettings";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    }
  }, [dispatch, user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 400,
          }}
        >
          <Typography>Đang tải...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            fontWeight: 600,
          }}
        >
          <SettingsIcon fontSize="large" sx={{ color: "primary.main" }} />
          Cài đặt tài khoản
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mt: 1, maxWidth: 600, mx: "auto" }}
        >
          Quản lý thông tin cá nhân và cài đặt bảo mật của bạn
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Paper
          elevation={2}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "grey.50" }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="settings tabs"
              variant="fullWidth"
              sx={{
                "& .MuiTab-root": {
                  py: 2.5,
                  minHeight: 72,
                  fontSize: "0.95rem",
                  fontWeight: 500,
                },
                "& .Mui-selected": {
                  color: "primary.main",
                  fontWeight: 600,
                },
              }}
            >
              <Tab
                icon={<Person fontSize="medium" />}
                label="Thông tin cá nhân"
                id="settings-tab-0"
                aria-controls="settings-tabpanel-0"
                iconPosition="top"
              />
              <Tab
                icon={<Image fontSize="medium" />}
                label="Ảnh đại diện"
                id="settings-tab-1"
                aria-controls="settings-tabpanel-1"
                iconPosition="top"
              />
              <Tab
                icon={<Lock fontSize="medium" />}
                label="Đổi mật khẩu"
                id="settings-tab-2"
                aria-controls="settings-tabpanel-2"
                iconPosition="top"
              />
            </Tabs>
          </Box>

          <Box sx={{ bgcolor: "background.paper" }}>
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <ProfileSettings user={user} />
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <AvatarSettings user={user} />
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <PasswordSettings />
              </Box>
            </TabPanel>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings;
