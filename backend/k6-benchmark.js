import http from "k6/http";
import { check, sleep } from "k6";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
  stages: [
    { duration: "10s", target: 10 },  // ramp up to 10 users
    { duration: "20s", target: 10 },  // hold at 10
    { duration: "10s", target: 0 },   // ramp down
  ],
};

export default function () {
  const res = http.get("https://api.sparkmvmt.com/benchmark");
  check(res, {
    "status is 200": (r) => r.status === 200,
  });
  sleep(1);
}

export function handleSummary(data) {
  return {
    "benchmark-report.html": htmlReport(data),
  };
}
