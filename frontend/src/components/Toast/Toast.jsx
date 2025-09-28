import React from "react";
import { Snackbar, Alert, Slide } from "@mui/material";

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

const Toast = ({
  open,
  onClose,
  message,
  severity = "success",
  duration = 4000,
  position = { vertical: "bottom", horizontal: "left" },
}) => {
  return (
    <Snackbar
      anchorOrigin={position}
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
