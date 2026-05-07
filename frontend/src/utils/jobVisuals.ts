/**
 * jobVisuals.ts
 * Derives icon + card color from the job's status and _id.
 *
 * Why _id hash?  Within the same status group there are multiple
 * icon choices — the hash makes the selection *stable* (same job
 * always gets the same icon even as the list grows or reorders).
 */

export type CardColor = "blue" | "teal" | "purple" | "orange";

interface Visual {
  icon: string;
  color: CardColor;
}

/** Status → pool of (icon, color) options */
const STATUS_VISUALS: Record<string, Visual[]> = {
  Open: [
    { icon: "📋", color: "blue" },
    { icon: "🔍", color: "blue" },
    { icon: "📝", color: "blue" },
    { icon: "💡", color: "blue" },
  ],
  Assigned: [
    { icon: "💼", color: "teal" },
    { icon: "🔨", color: "teal" },
    { icon: "⚙️", color: "teal" },
    { icon: "🛠️", color: "teal" },
  ],
  Completed: [
    { icon: "✅", color: "purple" },
    { icon: "🏆", color: "purple" },
    { icon: "🎯", color: "purple" },
    { icon: "🌟", color: "purple" },
  ],
  Closed: [
    { icon: "📁", color: "orange" },
    { icon: "🗂️", color: "orange" },
  ],
};

const DEFAULT_VISUALS: Visual[] = [
  { icon: "📁", color: "orange" },
  { icon: "⏳", color: "orange" },
  { icon: "🔔", color: "blue" },
];

/**
 * Simple, deterministic hash of a string → non-negative integer.
 * The same _id always produces the same number, regardless of
 * how many other jobs exist in the list.
 */
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(31, h) + id.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

/**
 * Returns a stable { icon, color } for a job card.
 * Colour is determined by status; icon is stable per _id.
 */
export function getJobVisual(job: {
  _id: string;
  status: string;
  category?: string;
}): Visual {
  const pool = STATUS_VISUALS[job.status] ?? DEFAULT_VISUALS;
  return pool[hashId(job._id) % pool.length];
}

/**
 * Returns the CSS class suffix for the job-status-pill element.
 */
export function getStatusPillClass(status: string): string {
  if (status === "Assigned") return "assigned";
  if (status === "Completed") return "completed";
  return "open";
}

/**
 * Returns the human-readable status label.
 */
export function getStatusLabel(job: {
  status: string;
  contract_status?: string;
}): string {
  if (job.status === "Assigned" && job.contract_status === "Pending") return "Pending Contract";
  if (job.status === "Assigned") return "In Progress";
  if (job.status === "Completed") return "Completed";
  return job.status;
}
