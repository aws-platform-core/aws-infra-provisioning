import {
    Box,
    Typography,
    Stepper,
    Step,
    StepLabel,
    StepIconProps,
  } from "@mui/material";
  import CheckCircleIcon from "@mui/icons-material/CheckCircle";
  import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
  import ErrorIcon from "@mui/icons-material/Error";
  import HourglassTopIcon from "@mui/icons-material/HourglassTop";
  import { alpha, useTheme } from "@mui/material/styles";
  import { getStatusTimeline } from "../utils/requestStatus";
  
  function TimelineStepIcon(
    props: StepIconProps & { state?: string }
  ) {
    const { active, completed, className, state } = props;
    const theme = useTheme();
  
    if (state === "failed") {
      return <ErrorIcon className={className} color="error" />;
    }
  
    if (completed || state === "done") {
      return <CheckCircleIcon className={className} color="success" />;
    }
  
    if (active || state === "current") {
      return <HourglassTopIcon className={className} color="primary" />;
    }
  
    return (
      <RadioButtonUncheckedIcon
        className={className}
        sx={{ color: alpha(theme.palette.text.secondary, 0.6) }}
      />
    );
  }
  
  export default function RequestStatusTimeline({ status }: { status: string }) {
    const timeline = getStatusTimeline(status);
    const activeIndex = timeline.findIndex((step) => step.state === "current");
  
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Status Timeline
        </Typography>
  
        <Stepper
          activeStep={activeIndex === -1 ? timeline.length - 1 : activeIndex}
          alternativeLabel
          sx={{ pt: 1 }}
        >
          {timeline.map((step) => (
            <Step
              key={step.key}
              completed={step.state === "done"}
            >
              <StepLabel
                StepIconComponent={(iconProps) => (
                  <TimelineStepIcon {...iconProps} state={step.state} />
                )}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    );
  }