import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import "./App.css";
import {
  TimePicker,
  Progress,
  Button,
  Select,
  Space,
  Tooltip,
  ConfigProvider,
  Typography,
  Segmented,
  Collapse,
  Tag,
} from "antd";
import { CirclePicker } from "react-color";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import {
  PlayCircleOutlined,
  StopOutlined,
  BellOutlined,
  BellFilled,
  SettingOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

dayjs.extend(duration);

const { Text, Title } = Typography;

const PRESETS = [
  {
    key: "nineToFive",
    label: "9–5 + lunch",
    start: [9, 0],
    work: [8, 0],
    breakH: 1,
    breakM: 0,
  },
  {
    key: "standard",
    label: "8h + 30m break",
    start: [9, 0],
    work: [8, 0],
    breakH: 0,
    breakM: 30,
  },
  {
    key: "halfDay",
    label: "4h + 15m break",
    start: [9, 0],
    work: [4, 0],
    breakH: 0,
    breakM: 15,
  },
];

const SWATCHES = [
  "#f5f4ff",
  "#e8f4fc",
  "#f0fdf4",
  "#fff7ed",
  "#fce7f3",
  "#ddd6fe",
  "#bae6fd",
  "#a7f3d0",
  "#fed7aa",
  "#fecaca",
];

function buildDayjsTime(h, m, isDuration = false) {
  if (isDuration) {
    return dayjs().startOf("day").hour(0).minute(0).second(0).add(h, "hour").add(m, "minute");
  }
  return dayjs().hour(h).minute(m).second(0).millisecond(0);
}

const initUiMode = {
  compactPanels: true,
  is_notification_on: false,
  select_color: "#e8f4fc",
  is_water_notification_on: false,
  water_notification_time: "30",
};

const initTimeData = {
  start_time: dayjs("09:00", "HH:mm"),
  working_time: buildDayjsTime(8, 30, true),
  break_time: buildDayjsTime(0, 30, true),
  leave_time: null,
  is_calculation_started: false,
};

const initDisplayTimeData = {
  finish_at: null,
  remaining_time: null,
  elapsed_percent: 0,
  leave_remaining_time: null,
  leave_total_work_time: null,
  leave_total_access_time: null,
  leave_elapsed_percent: 0,
};

export default function App() {
  const [clock, setClock] = useState(() => dayjs().format("h:mm:ss A · ddd, MMM D"));
  const [timeData, setTimeData] = useState(initTimeData);
  const timeDataRef = useRef(timeData);
  const [uiMode, setUiMode] = useState(initUiMode);
  const [displayTimeData, setDisplayTimeData] = useState(initDisplayTimeData);
  const [displayTimeInterval, setDisplayTimeInterval] = useState(null);

  useEffect(() => {
    timeDataRef.current = timeData;
  }, [timeData]);

  const previewFinish = useMemo(() => {
    const t = timeData;
    if (!t.start_time || !t.working_time || !t.break_time) return null;
    const wh = t.working_time.hour();
    const wm = t.working_time.minute();
    const bh = t.break_time.hour();
    const bm = t.break_time.minute();
    return t.start_time.clone().add(wh + bh, "hour").add(wm + bm, "minute");
  }, [timeData.start_time, timeData.working_time, timeData.break_time]);

  const handleChangeTimeData = useCallback((time, key) => {
    if (!time && key === "leave_time") {
      setTimeData((prev) => ({ ...prev, leave_time: null }));
      return;
    }
    if (time) {
      setTimeData((prev) => ({ ...prev, [key]: time }));
    }
  }, []);

  const stopCalculate = useCallback(() => {
    if (displayTimeInterval != null) {
      clearInterval(displayTimeInterval);
    }
    setDisplayTimeInterval(null);
    const reset = {
      start_time: initTimeData.start_time.clone(),
      working_time: initTimeData.working_time.clone(),
      break_time: initTimeData.break_time.clone(),
      leave_time: null,
      is_calculation_started: false,
    };
    timeDataRef.current = reset;
    setTimeData(reset);
    setDisplayTimeData(initDisplayTimeData);
    chrome.storage.sync.set({ time_calc_data: null });
  }, [displayTimeInterval]);

  const tick = useCallback(() => {
    const td = timeDataRef.current;
    const wh = td.working_time.hour();
    const wm = td.working_time.minute();
    const bh = td.break_time.hour();
    const bm = td.break_time.minute();
    const finalTime = td.start_time.clone().add(wh + bh, "hour").add(wm + bm, "minute");
    const startMs = td.start_time.valueOf();
    const endMs = finalTime.valueOf();
    const currentTime = dayjs();
    const span = endMs - startMs;
    const elapsed = currentTime.valueOf() - startMs;
    const elapsedPercent = span > 0 ? Math.min(100, Math.max(0, (elapsed / span) * 100)) : 0;

    const updated = {
      finish_at: finalTime.format("h:mm A"),
      remaining_time: dayjs.duration(Math.max(0, finalTime.diff(currentTime))).format("HH:mm:ss"),
      elapsed_percent: Number(elapsedPercent.toFixed(1)),
      is_calculation_started: true,
    };

    if (td.leave_time != null) {
      const leaveStart = td.start_time;
      const leaveEnd = dayjs(td.leave_time);
      const leaveTotalWorkDuration = dayjs
        .duration(leaveEnd.diff(leaveStart))
        .subtract(bh, "hour")
        .subtract(bm, "minute");
      const lwh = leaveTotalWorkDuration.hours();
      const lwm = leaveTotalWorkDuration.minutes();
      updated.leave_total_work_time = `${lwh}h ${lwm}m`;

      const accessTimeDuration = leaveTotalWorkDuration.subtract(wh, "hour").subtract(wm, "minute");
      const lah = Math.max(0, accessTimeDuration.hours());
      const lam = Math.max(0, accessTimeDuration.minutes());
      updated.leave_total_access_time = `${lah}h ${lam}m`;

      updated.leave_remaining_time = dayjs
        .duration(Math.max(0, leaveEnd.diff(currentTime)))
        .format("HH:mm:ss");

      const leaveSpan = leaveEnd.valueOf() - leaveStart.valueOf();
      const leaveElapsed =
        leaveSpan > 0
          ? Math.min(100, Math.max(0, ((currentTime.valueOf() - leaveStart.valueOf()) / leaveSpan) * 100))
          : 0;
      updated.leave_elapsed_percent = Number(leaveElapsed.toFixed(1));
    } else {
      updated.leave_remaining_time = null;
      updated.leave_total_work_time = null;
      updated.leave_total_access_time = null;
      updated.leave_elapsed_percent = 0;
    }

    setDisplayTimeData((prev) => ({ ...prev, ...updated }));
  }, []);

  const startCalculate = useCallback(
    (isInit) => {
      try {
        if (isInit !== true) {
          const next = { ...timeDataRef.current, is_calculation_started: true };
          timeDataRef.current = next;
          setTimeData(next);
          chrome.storage.sync.set({ time_calc_data: next });
        }

        if (displayTimeInterval != null) {
          clearInterval(displayTimeInterval);
        }

        tick();
        const id = setInterval(tick, 1000);
        setDisplayTimeInterval(id);
      } catch {
        stopCalculate();
      }
    },
    [displayTimeInterval, tick, stopCalculate]
  );

  const startCalculateRef = useRef(startCalculate);
  startCalculateRef.current = startCalculate;

  const restoreFromStorage = useCallback(() => {
    chrome.storage.sync.get(["time_calc_data"]).then((result) => {
      const raw = result?.time_calc_data;
      if (!raw || raw.is_calculation_started !== true) return;

      const parseSavedTime = (obj) => {
        if (!obj || obj.$H === undefined) return null;
        return dayjs(`${String(obj.$H).padStart(2, "0")}:${String(obj.$m).padStart(2, "0")}`, "HH:mm");
      };

      const saved = {
        start_time: parseSavedTime(raw.start_time) || initTimeData.start_time,
        working_time: parseSavedTime(raw.working_time) || initTimeData.working_time,
        break_time: parseSavedTime(raw.break_time) || initTimeData.break_time,
        leave_time: raw.leave_time == null ? null : parseSavedTime(raw.leave_time),
        is_calculation_started: raw.is_calculation_started,
      };
      timeDataRef.current = saved;
      setTimeData(saved);
      setTimeout(() => startCalculateRef.current?.(true), 150);
    });
  }, []);

  const restoreUi = useCallback(() => {
    chrome.storage.sync.get(["uiData"]).then((result) => {
      if (!result?.uiData) return;
      const u = result.uiData;
      setUiMode((prev) => {
        const { is_classic_mode, ...rest } = u;
        return {
          ...prev,
          ...rest,
          compactPanels:
            u.compactPanels !== undefined
              ? u.compactPanels
              : typeof is_classic_mode === "boolean"
                ? is_classic_mode
                : prev.compactPanels,
        };
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      if (displayTimeInterval != null) {
        clearInterval(displayTimeInterval);
      }
    };
  }, [displayTimeInterval]);

  useEffect(() => {
    const c = setInterval(() => setClock(dayjs().format("h:mm:ss A · ddd, MMM D")), 1000);
    restoreFromStorage();
    restoreUi();
    return () => clearInterval(c);
  }, [restoreFromStorage, restoreUi]);

  useEffect(() => {
    chrome.storage.sync.set({ uiData: uiMode });
  }, [uiMode]);

  const scheduleEndNotification = useCallback(() => {
    chrome.alarms.clear("time_is_over");
    const td = timeDataRef.current;
    const finishStr = displayTimeData.finish_at;
    if (!uiMode.is_notification_on || !td.is_calculation_started || !finishStr) return;

    let whenMs;
    if (td.leave_time != null) {
      whenMs = dayjs(td.leave_time).valueOf();
    } else {
      whenMs = dayjs(finishStr, "h:mm A").valueOf();
    }
    if (whenMs > Date.now()) {
      chrome.alarms.create("time_is_over", { when: whenMs });
    }
  }, [uiMode.is_notification_on, displayTimeData.finish_at]);

  const scheduleWater = useCallback(() => {
    chrome.alarms.clear("water_reminder");
    if (!uiMode.is_water_notification_on) return;
    const mins = Number(uiMode.water_notification_time) || 30;
    chrome.alarms.create("water_reminder", {
      delayInMinutes: mins,
      periodInMinutes: mins,
    });
  }, [uiMode.is_water_notification_on, uiMode.water_notification_time]);

  useEffect(() => {
    if (uiMode.is_notification_on && timeData.is_calculation_started && displayTimeData.finish_at) {
      scheduleEndNotification();
    } else {
      chrome.alarms.clear("time_is_over");
    }
  }, [
    uiMode.is_notification_on,
    timeData.is_calculation_started,
    displayTimeData.finish_at,
    timeData.leave_time,
    scheduleEndNotification,
  ]);

  useEffect(() => {
    if (uiMode.is_water_notification_on) {
      scheduleWater();
    } else {
      chrome.alarms.clear("water_reminder");
    }
  }, [uiMode.is_water_notification_on, uiMode.water_notification_time, scheduleWater]);

  const applyPreset = (key) => {
    const p = PRESETS.find((x) => x.key === key);
    if (!p) return;
    setTimeData((prev) => ({
      ...prev,
      start_time: buildDayjsTime(p.start[0], p.start[1]),
      working_time: buildDayjsTime(p.work[0], p.work[1], true),
      break_time: dayjs().startOf("day").add(p.breakH, "hour").add(p.breakM, "minute"),
    }));
  };

  const setStartNow = () => {
    const now = dayjs();
    setTimeData((prev) => ({
      ...prev,
      start_time: now.second(0).millisecond(0),
    }));
  };

  const progressStroke = (pct) => {
    if (pct >= 66) return { from: "#22c55e", to: "#16a34a" };
    if (pct >= 33) return { from: "#f59e0b", to: "#ea580c" };
    return { from: "#ef4444", to: "#dc2626" };
  };

  const sessionStroke = progressStroke(displayTimeData.elapsed_percent || 0);
  const leaveStroke = progressStroke(displayTimeData.leave_elapsed_percent || 0);

  const isTracking = timeData.is_calculation_started;
  const tint = uiMode.select_color;
  const gradientBg = `linear-gradient(165deg, ${tint} 0%, #ffffff 38%, #f8fafc 58%, ${tint}2e 82%, ${tint}55 100%)`;

  const scheduleEditor = (
    <>
      <section className="app-section">
        <div className="section-label">
          <ThunderboltOutlined /> Quick setup
        </div>
        <Segmented
          block
          options={PRESETS.map((p) => ({ label: p.label, value: p.key }))}
          onChange={applyPreset}
          className="preset-segmented"
        />
        <Button block type="default" icon={<ClockCircleOutlined />} onClick={setStartNow} className="btn-start-now">
          Start work at now
        </Button>
      </section>

      <section className="app-section app-form">
        <div className="section-label">Schedule</div>
        <div className="field-grid">
          <label className="field">
            <span className="field-label">Work starts</span>
            <Tooltip title="Pick any minute (e.g. 9:27). Use the panel or type in the field.">
              <TimePicker
                className="field-control"
                size="middle"
                use12Hours
                format="h:mm a"
                minuteStep={1}
                value={timeData.start_time}
                onChange={(t) => handleChangeTimeData(t, "start_time")}
              />
            </Tooltip>
          </label>
          <label className="field">
            <span className="field-label">Paid work duration</span>
            <Tooltip title="Hours and minutes you need to work (billable or core hours).">
              <TimePicker
                className="field-control"
                format="HH:mm"
                showNow={false}
                minuteStep={1}
                value={timeData.working_time}
                onChange={(t) => handleChangeTimeData(t, "working_time")}
              />
            </Tooltip>
          </label>
          <label className="field">
            <span className="field-label">Breaks (not counted)</span>
            <Tooltip title="Lunch and other breaks added on top of work time.">
              <TimePicker
                className="field-control"
                format="HH:mm"
                showNow={false}
                minuteStep={1}
                value={timeData.break_time}
                onChange={(t) => handleChangeTimeData(t, "break_time")}
              />
            </Tooltip>
          </label>
          <label className="field">
            <span className="field-label">Leave by (optional)</span>
            <Tooltip title="If you must leave at a specific time, set it to see a second progress track.">
              <TimePicker
                className="field-control"
                use12Hours
                format="h:mm a"
                allowClear
                minuteStep={1}
                value={timeData.leave_time}
                onChange={(t) => handleChangeTimeData(t, "leave_time")}
              />
            </Tooltip>
          </label>
        </div>
        {previewFinish && !isTracking && (
          <div className="preview-banner">
            <Text type="secondary">Planned finish:</Text> <Text strong>{previewFinish.format("h:mm A")}</Text>
          </div>
        )}
      </section>

      <section className="app-actions">
        <Button
          type="primary"
          size="large"
          icon={<PlayCircleOutlined />}
          onClick={() => startCalculate(false)}
          block
          className="btn-primary-action"
        >
          {isTracking ? "Recalculate & continue" : "Start tracking"}
        </Button>
        <Button danger size="large" icon={<StopOutlined />} onClick={stopCalculate} block>
          Reset session
        </Button>
      </section>
    </>
  );

  const liveSectionInner =
    uiMode.compactPanels ? (
      <div className="result-cards compact">
        <div className="result-group">
          <div className="result-group-label">Session</div>
          <div className={`result-card primary-metric ${isTracking ? "live-hero" : ""}`}>
            {isTracking && (
              <div className="hero-percent" aria-live="polite">
                {displayTimeData.elapsed_percent ?? 0}
                <span className="hero-percent-suffix">%</span>
              </div>
            )}
            <Text type="secondary" className="metric-label">
              Finish time
            </Text>
            <div className="metric-value">{displayTimeData.finish_at ?? "—"}</div>
            <Progress
              percent={displayTimeData.elapsed_percent}
              size={isTracking ? "default" : "small"}
              showInfo={false}
              strokeLinecap="round"
              strokeColor={{ from: sessionStroke.from, to: sessionStroke.to }}
            />
            <Text type="secondary" className="metric-hint">
              Session progress · {displayTimeData.elapsed_percent ?? 0}%
            </Text>
          </div>
          <div className="result-card result-card--stat">
            <Text type="secondary" className="metric-label">
              Time left
            </Text>
            <div className="metric-value secondary metric-value--tabular">{displayTimeData.remaining_time ?? "—"}</div>
          </div>
        </div>
        {timeData.leave_time != null && (
          <div className="result-group result-group--leave">
            <div className="result-group-label">Leave</div>
            <div className="result-card result-card--leave">
              <Text type="secondary" className="metric-label">
                Work window & buffer
              </Text>
              <div className="metric-pair">
                <div className="metric-pair-item">
                  <span className="metric-pair-k">Window</span>
                  <span className="metric-pair-v">{displayTimeData.leave_total_work_time ?? "—"}</span>
                </div>
                {displayTimeData.leave_total_access_time != null && (
                  <div className="metric-pair-item">
                    <span className="metric-pair-k">Buffer</span>
                    <span className="metric-pair-v">{displayTimeData.leave_total_access_time}</span>
                  </div>
                )}
              </div>
              <Progress
                percent={displayTimeData.leave_elapsed_percent}
                size="small"
                showInfo={false}
                strokeLinecap="round"
                strokeColor={{ from: leaveStroke.from, to: leaveStroke.to }}
              />
              <Text type="secondary" className="metric-hint">
                Until leave · {displayTimeData.leave_elapsed_percent ?? 0}%
              </Text>
            </div>
            <div className="result-card result-card--stat">
              <Text type="secondary" className="metric-label">
                Until you leave
              </Text>
              <div className="metric-value secondary metric-value--tabular">{displayTimeData.leave_remaining_time ?? "—"}</div>
            </div>
          </div>
        )}
      </div>
    ) : (
      <div className="result-cards detailed">
        <div className="result-panel result-panel--session">
          <div className="result-panel-badge">Session</div>
          {isTracking && (
            <div className="hero-percent detailed-hero" aria-live="polite">
              {displayTimeData.elapsed_percent ?? 0}
              <span className="hero-percent-suffix">%</span>
            </div>
          )}
          <Title level={5} className="result-panel-title">
            Work session
          </Title>
          <div className="panel-row">
            <span>Finish at</span>
            <strong>{displayTimeData.finish_at ?? "—"}</strong>
          </div>
          <div className="panel-row">
            <span>Remaining</span>
            <strong className="tabular-nums">{displayTimeData.remaining_time ?? "—"}</strong>
          </div>
          <Progress
            percent={displayTimeData.elapsed_percent}
            strokeLinecap="round"
            strokeColor={{ from: sessionStroke.from, to: sessionStroke.to }}
          />
        </div>
        {timeData.leave_time != null && (
          <div className="result-panel result-panel--leave">
            <div className="result-panel-badge result-panel-badge--leave">Leave</div>
            <Title level={5} className="result-panel-title">
              Leave target
            </Title>
            <div className="panel-row">
              <span>Work window</span>
              <strong>{displayTimeData.leave_total_work_time ?? "—"}</strong>
            </div>
            <div className="panel-row">
              <span>Buffer</span>
              <strong>{displayTimeData.leave_total_access_time ?? "—"}</strong>
            </div>
            <div className="panel-row">
              <span>Until leave</span>
              <strong className="tabular-nums">{displayTimeData.leave_remaining_time ?? "—"}</strong>
            </div>
            <Progress
              percent={displayTimeData.leave_elapsed_percent}
              strokeLinecap="round"
              strokeColor={{ from: leaveStroke.from, to: leaveStroke.to }}
            />
          </div>
        )}
      </div>
    );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#2563eb",
          colorSuccess: "#16a34a",
          colorWarning: "#ea580c",
          colorError: "#dc2626",
          borderRadius: 12,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Segmented: {
            trackBg: "rgba(255, 255, 255, 0.55)",
          },
          Collapse: {
            headerBg: "transparent",
          },
        },
      }}
    >
      <div
        className="app-root"
        style={{
          "--surface-tint": tint,
          background: gradientBg,
        }}
      >
        <header className="app-header">
          <div>
            <Title level={5} className="app-title" style={{ margin: 0 }}>
              Time Calculator
            </Title>
            <Text type="secondary" className="app-subclock">
              {clock}
            </Text>
          </div>
          <Space size={8}>
            {isTracking ? (
              <Tag icon={<ClockCircleOutlined />} color="processing">
                Tracking
              </Tag>
            ) : (
              <Tag>Ready</Tag>
            )}
          </Space>
        </header>

        {isTracking && (
          <section className="app-section results live-first">
            <div className="section-label">Live</div>
            {liveSectionInner}
          </section>
        )}

        {!isTracking && scheduleEditor}

        {isTracking && (
          <Collapse
            bordered={false}
            className="schedule-collapse"
            items={[
              {
                key: "schedule",
                label: "Adjust schedule & presets",
                children: scheduleEditor,
              },
            ]}
          />
        )}

        {!isTracking && (
          <section className="app-section results">
            <div className="section-label">Live</div>
            {liveSectionInner}
          </section>
        )}

        <Collapse
          bordered={false}
          className="settings-collapse"
          expandIcon={({ isActive }) => (
            <SettingOutlined rotate={isActive ? 90 : 0} style={{ transition: "transform 0.2s" }} />
          )}
          items={[
            {
              key: "settings",
              label: "Appearance & reminders",
              children: (
                <div className="settings-body">
                  <div className="settings-row">
                    <Text>Panel layout</Text>
                    <Select
                      value={uiMode.compactPanels}
                      onChange={(v) => setUiMode((u) => ({ ...u, compactPanels: v }))}
                      options={[
                        { value: true, label: "Compact" },
                        { value: false, label: "Detailed" },
                      ]}
                      style={{ width: 140 }}
                    />
                  </div>
                  <div className="settings-row">
                    <Text>Notify when session ends</Text>
                    <Button
                      type={uiMode.is_notification_on ? "primary" : "default"}
                      icon={uiMode.is_notification_on ? <BellFilled /> : <BellOutlined />}
                      onClick={() => setUiMode((u) => ({ ...u, is_notification_on: !u.is_notification_on }))}
                    >
                      {uiMode.is_notification_on ? "On" : "Off"}
                    </Button>
                  </div>
                  <div className="settings-row">
                    <Text>Water reminder</Text>
                    <Space.Compact>
                      <Select
                        value={uiMode.is_water_notification_on}
                        onChange={(v) => setUiMode((u) => ({ ...u, is_water_notification_on: v }))}
                        style={{ width: 88 }}
                      >
                        <Select.Option value={false}>Off</Select.Option>
                        <Select.Option value={true}>On</Select.Option>
                      </Select>
                      <Select
                        value={uiMode.water_notification_time}
                        disabled={!uiMode.is_water_notification_on}
                        onChange={(v) => setUiMode((u) => ({ ...u, water_notification_time: v }))}
                        style={{ width: 100 }}
                      >
                        {["05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55", "60"].map((m) => (
                          <Select.Option key={m} value={m}>
                            {m} min
                          </Select.Option>
                        ))}
                      </Select>
                    </Space.Compact>
                  </div>
                  <div className="theme-row">
                    <Text type="secondary">Background</Text>
                    <CirclePicker
                      width="100%"
                      circleSize={22}
                      circleSpacing={10}
                      colors={SWATCHES}
                      color={uiMode.select_color}
                      onChangeComplete={(c) => setUiMode((u) => ({ ...u, select_color: c.hex }))}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </ConfigProvider>
  );
}
