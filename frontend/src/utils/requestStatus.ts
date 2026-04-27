import type { ChipProps } from "@mui/material";

export type RequestStatus =
  | "PR_CREATED"
  | "PLAN_COMPLETED"
  | "PLAN_FAILED"
  | "APPLY_IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "DESTROY_IN_PROGRESS"
  | "DESTROYED"
  | "DESTROY_FAILED";

export function getRequestStatusLabel(status: string): string {
  switch (status) {
    case "PR_CREATED":
      return "PR Created";
    case "PLAN_COMPLETED":
      return "Plan Completed";
    case "PLAN_FAILED":
      return "Plan Failed";
    case "APPLY_IN_PROGRESS":
      return "Apply In Progress";
    case "COMPLETED":
      return "Completed";
    case "FAILED":
      return "Failed";
    case "DESTROY_IN_PROGRESS":
      return "Destroy In Progress";
    case "DESTROYED":
      return "Destroyed";
    case "DESTROY_FAILED":
      return "Destroy Failed";
    default:
      return status;//.replaceAll("_", " ");
  }
}

export function getRequestStatusColor(status: string): ChipProps["color"] {
  switch (status) {
    case "PR_CREATED":
      return "info";
    case "PLAN_COMPLETED":
      return "primary";
    case "PLAN_FAILED":
      return "warning";
    case "APPLY_IN_PROGRESS":
      return "secondary";
    case "COMPLETED":
      return "success";
    case "FAILED":
      return "error";
    case "DESTROY_IN_PROGRESS":
      return "warning";
    case "DESTROYED":
      return "default";
    case "DESTROY_FAILED":
      return "error";
    default:
      return "default";
  }
}

export function getRelativeTime(dateInput: string | Date): string {
  const now = new Date().getTime();
  const date = new Date(dateInput).getTime();
  const diffMs = now - date;

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"} ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export function getStatusTimeline(status: string) {
  if (status === "PLAN_FAILED") {
    return [
      { key: "PR_CREATED", label: "PR Created", state: "done" },
      { key: "PLAN_FAILED", label: "Plan Failed", state: "failed" },
    ];
  }

  if (status === "FAILED") {
    return [
      { key: "PR_CREATED", label: "PR Created", state: "done" },
      { key: "PLAN_COMPLETED", label: "Plan Completed", state: "done" },
      { key: "APPLY_IN_PROGRESS", label: "Apply In Progress", state: "done" },
      { key: "FAILED", label: "Failed", state: "failed" },
    ];
  }

  if (status === "COMPLETED") {
    return [
      { key: "PR_CREATED", label: "PR Created", state: "done" },
      { key: "PLAN_COMPLETED", label: "Plan Completed", state: "done" },
      { key: "APPLY_IN_PROGRESS", label: "Apply In Progress", state: "done" },
      { key: "COMPLETED", label: "Completed", state: "done" },
    ];
  }

  if (status === "DESTROY_FAILED") {
    return [
      { key: "DESTROY_IN_PROGRESS", label: "Destroy In Progress", state: "done" },
      { key: "DESTROY_FAILED", label: "Destroy Failed", state: "failed" },
    ];
  }

  if (status === "DESTROYED") {
    return [
      { key: "DESTROY_IN_PROGRESS", label: "Destroy In Progress", state: "done" },
      { key: "DESTROYED", label: "Destroyed", state: "done" },
    ];
  }

  if (status === "DESTROY_IN_PROGRESS") {
    return [
      { key: "DESTROY_IN_PROGRESS", label: "Destroy In Progress", state: "current" },
      { key: "DESTROYED", label: "Destroyed", state: "upcoming" },
    ];
  }

  const allSteps = [
    { key: "PR_CREATED", label: "PR Created" },
    { key: "PLAN_COMPLETED", label: "Plan Completed" },
    { key: "APPLY_IN_PROGRESS", label: "Apply In Progress" },
    { key: "COMPLETED", label: "Completed" },
  ];

  const currentIndex = allSteps.findIndex((step) => step.key === status);

  return allSteps.map((step, index) => ({
    ...step,
    state:
      currentIndex === -1
        ? "upcoming"
        : index < currentIndex
        ? "done"
        : index === currentIndex
        ? "current"
        : "upcoming",
  }));
}