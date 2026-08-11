import { NextResponse } from "next/server";
import os from "node:os";

export const dynamic = "force-dynamic";

export async function GET() {
  const cpus = os.cpus();
  const first = cpus.reduce(
    (sum, cpu) => ({
      idle: sum.idle + cpu.times.idle,
      total: sum.total + Object.values(cpu.times).reduce((a, b) => a + b, 0),
    }),
    { idle: 0, total: 0 },
  );

  await new Promise((resolve) => setTimeout(resolve, 300));

  const second = os.cpus().reduce(
    (sum, cpu) => ({
      idle: sum.idle + cpu.times.idle,
      total: sum.total + Object.values(cpu.times).reduce((a, b) => a + b, 0),
    }),
    { idle: 0, total: 0 },
  );
  const totalDelta = second.total - first.total;
  const usage = totalDelta ? ((totalDelta - (second.idle - first.idle)) / totalDelta) * 100 : 0;
  const totalMemory = os.totalmem() / 1024 / 1024;
  const availableMemory = os.freemem() / 1024 / 1024;

  return NextResponse.json({
    hostname: os.hostname(),
    os: `${os.type()} ${os.release()}`,
    kernel: os.release(),
    cpu_usage: usage,
    cpu_cores: cpus.length,
    total_memory: totalMemory,
    used_memory: totalMemory - availableMemory,
    available_memory: availableMemory,
    uptime: os.uptime(),
    status: usage < 60 ? "🟢 Healthy" : usage < 85 ? "🟡 Busy" : "🔴 High Load",
    active_users: 0,
  });
}
