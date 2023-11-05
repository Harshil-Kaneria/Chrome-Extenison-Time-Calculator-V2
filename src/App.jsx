import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  TimePicker,
  Progress,
  Input,
  Divider,
  Switch,
  Button,
  Select,
  Space,
  Tooltip,
} from "antd";
import { Row, Col, Container, Card } from "react-bootstrap";
import { CirclePicker } from "react-color";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

const App = () => {
  let getCurrentTime = () => dayjs().format("hh:mm:ss A | D MMM YYYY | dddd");

  const buttonCalc = useRef(null);
  const [displayTimeInterval, setDisplayTimeInterval] = useState(null);
  const [currenTime, setCurrentTime] = useState(getCurrentTime());
  const [allColors, setAllColors] = useState([
    "#f5f4ff",
    "#f8bcc0",
    "#f6a9cc",
    "#c2a1d7",
    "#999ad4",
    "#89bbf6",
    "#73c9f9",
    "#6bd5e3",
    "#61b5c7",
    "#89cc98",
    "#b0d9a1",
    "#ffec68",
    "#ffc59e",
    "#ff8a78",
  ]);

  let initUiModeData = {
    is_classic_mode: false,
    is_notification_on: false,
    select_color: "#f5f4ff",
    is_water_notification_on: false,
    water_notification_time: "30",
  };
  const [uiMode, setUiMode] = useState(initUiModeData);

  let initTimeData = {
    start_time: dayjs("09:00", "HH:mm"),
    working_time: dayjs("08:30", "HH:mm"),
    break_time: dayjs("00:30", "HH:mm"),
    leave_time: null,
    is_calculation_started: false,
  };
  const [timeData, setTimeData] = useState(initTimeData);

  let initDisplayTimeData = {
    finish_at: null,
    remaining_time: null,
    remaining_percentage: 0,
    leave_remaining_time: null,
    leave_total_work_time: null,
    leave_total_access_time: null,
    leave_remaining_percentage: 0,
  };
  const [displayTimeData, setDisplayTimeData] = useState(initDisplayTimeData);

  const handleChangeTimeData = (time, key) => {
    setTimeData({
      ...timeData,
      [key]: time,
    });
  };

  const stopCalculate = () => {
    if (displayTimeInterval != null) {
      clearInterval(displayTimeInterval);
    }
    setDisplayTimeInterval(null);
    setTimeData(initTimeData);
    setDisplayTimeData(initDisplayTimeData);
    chrome.storage.sync.set({ time_calc_data: null });
  };

  const startCalculate = (isInit) => {
    try {
      if (isInit != true) {
        let tempData = timeData;
        tempData.is_calculation_started = true;
        chrome.storage.sync.set({ time_calc_data: tempData });
      }

      const totalHours =
        timeData.break_time.get("hour") + timeData.working_time.get("hour");
      const totalBreaks =
        timeData.break_time.get("minute") + timeData.working_time.get("minute");
      let finalTime = timeData.start_time
        .add(totalHours, "hour")
        .add(totalBreaks, "minute");

      if (displayTimeInterval != null) {
        clearInterval(displayTimeInterval);
      }

      let displayTimeIntervalTemp = setInterval(() => {
        const currentTime = dayjs();
        const percentage = (
          ((currentTime - dayjs(timeData.start_time)) /
            (finalTime - dayjs(timeData.start_time))) *
          100
        ).toFixed(2);

        const updatedDisplayTimeData = {
          finish_at: finalTime.format("hh:mm A"),
          remaining_time: dayjs
            .duration(finalTime.diff(currentTime))
            .format("HH:mm:ss"),
          remaining_percentage: percentage,
          is_calculation_started: true,
        };

        if (timeData.leave_time != null) {
          const leaveTotalWorkDuration = dayjs
            .duration(
              dayjs(timeData.leave_time).diff(dayjs(timeData.start_time))
            )
            .subtract(timeData.break_time.get("hour"), "hour")
            .subtract(timeData.break_time.get("minute"), "minute");
          const leaveTotalWorkHours = leaveTotalWorkDuration.hours();
          const leaveTotalWorkMinutes = leaveTotalWorkDuration.minutes();
          updatedDisplayTimeData.leave_total_work_time = `${leaveTotalWorkHours}:${leaveTotalWorkMinutes}`;

          const accessTimeDuration = leaveTotalWorkDuration.subtract({
            hours: timeData.working_time.get("hour"),
            minutes: timeData.working_time.get("minute"),
          });
          const leaveTotalAccessHours = accessTimeDuration.hours();
          const leaveTotalAccessMinutes = accessTimeDuration.minutes();
          updatedDisplayTimeData.leave_total_access_time = `${leaveTotalAccessHours}:${leaveTotalAccessMinutes}`;

          const leaveRemainingTime = dayjs
            .duration(dayjs(timeData.leave_time).diff(currentTime))
            .format("HH:mm:ss");
          updatedDisplayTimeData.leave_remaining_time = leaveRemainingTime;

          const leaveRemainingPercentage = (
            ((currentTime - dayjs(timeData.start_time)) /
              (dayjs(timeData.leave_time) - dayjs(timeData.start_time))) *
            100
          ).toFixed(2);
          updatedDisplayTimeData.leave_remaining_percentage =
            leaveRemainingPercentage;
        } else {
          updatedDisplayTimeData.leave_remaining_time = null;
          updatedDisplayTimeData.leave_total_work_time = null;
          updatedDisplayTimeData.leave_total_access_time = null;
          updatedDisplayTimeData.leave_remaining_percentage = 0;
        }

        setDisplayTimeData((prevDisplayTimeData) => ({
          ...prevDisplayTimeData,
          ...updatedDisplayTimeData,
        }));
      }, 1000);
      setDisplayTimeInterval(displayTimeIntervalTemp);
    } catch (error) {
      stopCalculate();
    }
  };

  const getDataFromLocal = () => {
    chrome.storage.sync.get(["time_calc_data"]).then((result) => {
      if (
        result != undefined &&
        result != null &&
        result.time_calc_data != undefined &&
        result.time_calc_data != null &&
        result.time_calc_data.is_calculation_started == true
      ) {
        let tempData = result.time_calc_data;
        let saveTimeData = {
          start_time: dayjs(
            `${tempData.start_time.$H + ":" + tempData.start_time.$m}`,
            "HH:mm"
          ),
          working_time: dayjs(
            `${tempData.working_time.$H + ":" + tempData.working_time.$m}`,
            "HH:mm"
          ),
          break_time: dayjs(
            `${tempData.break_time.$H + ":" + tempData.break_time.$m}`,
            "HH:mm"
          ),
          leave_time:
            tempData.leave_time == null
              ? null
              : dayjs(
                  `${tempData.leave_time.$H + ":" + tempData.leave_time.$m}`,
                  "HH:mm"
                ),
          is_calculation_started: tempData.is_calculation_started,
        };
        setTimeData(saveTimeData);
        setTimeout(() => {
          buttonCalc.current.click();
        }, 1000);
      }
    });
  };

  const updateUiData = () => {
    chrome.storage.sync.set({ uiData: uiMode });
  };

  const getUiDataFromLocal = () => {
    chrome.storage.sync.get(["uiData"]).then((result) => {
      if (
        result != undefined &&
        result != null &&
        result.uiData != undefined &&
        result.uiData != null
      ) {
        let tempData = result.uiData;
        setUiMode(tempData);
      }
    });
  };

  const generateNotification = () => {
    let notification_time = dayjs(
      timeData.leave_time ? timeData.leave_time : displayTimeData.finish_at,
      "hh:mm A"
    ).valueOf();
    chrome.alarms.clear("time_is_over");
    if (notification_time >= Date.now()) {
      chrome.alarms.create("time_is_over", {
        when: notification_time,
      });
    }
  };

  const generateWaterNotification = () => {
    chrome.alarms.clear("water_reminder");
    if (uiMode.is_water_notification_on) {
      chrome.alarms.create("water_reminder", {
        delayInMinutes: Number(uiMode.water_notification_time),
        periodInMinutes: Number(uiMode.water_notification_time),
      });
    }
  };

  useEffect(() => {
    setInterval(() => setCurrentTime(getCurrentTime()), 1000);
    getDataFromLocal();
    getUiDataFromLocal();
  }, []);

  useEffect(() => {
    updateUiData();
  }, [uiMode]);

  useEffect(() => {
    if (
      uiMode.is_notification_on &&
      timeData.is_calculation_started &&
      displayTimeData.finish_at
    ) {
      generateNotification();
    } else {
      chrome.alarms.clear("time_is_over");
    }

    if (uiMode.is_water_notification_on) {
      generateWaterNotification();
    } else {
      chrome.alarms.clear("water_reminder");
    }
  }, [
    uiMode.is_notification_on,
    timeData.is_calculation_started,
    displayTimeData.finish_at,
    timeData.leave_time,
    uiMode.is_water_notification_on,
    uiMode.water_notification_time,
  ]);

  return (
    <>
      <div
        className="main_body p-3"
        style={{ backgroundColor: uiMode.select_color }}
      >
        <Container>
          <Row>
            <Col
              xxl={6}
              xl={6}
              lg={6}
              md={6}
              sm={6}
              xs={6}
              className="text-center"
            >
              <p className="mb-0">
                <>Start time *</>
              </p>
              <Tooltip title="This is the time when you start working.">
                <TimePicker
                  size="large"
                  use12Hours
                  format="h:mm a"
                  onChange={(time) => handleChangeTimeData(time, "start_time")}
                  changeOnBlur={true}
                  defaultValue={timeData.start_time}
                  value={timeData.start_time}
                />
              </Tooltip>
            </Col>
            <Col
              xxl={6}
              xl={6}
              lg={6}
              md={6}
              sm={6}
              xs={6}
              className="text-center"
            >
              <p className="mb-0">
                <>Working time *</>
              </p>
              <Tooltip title="This is the total amount of time you want to work.">
                <TimePicker
                  size="large"
                  format="HH:mm"
                  showNow={false}
                  onChange={(time) =>
                    handleChangeTimeData(time, "working_time")
                  }
                  changeOnBlur={true}
                  defaultValue={timeData.working_time}
                  value={timeData.working_time}
                />
              </Tooltip>
            </Col>
            <Col
              xxl={6}
              xl={6}
              lg={6}
              md={6}
              sm={6}
              xs={6}
              className="text-center mt-3"
            >
              <p className="mb-0">
                <>Break time *</>
              </p>
              <Tooltip title="This is break time that is not counted in working time.">
                <TimePicker
                  size="large"
                  format="HH:mm"
                  showNow={false}
                  onChange={(time) => handleChangeTimeData(time, "break_time")}
                  changeOnBlur={true}
                  defaultValue={timeData.break_time}
                  value={timeData.break_time}
                />
              </Tooltip>
            </Col>
            <Col
              xxl={6}
              xl={6}
              lg={6}
              md={6}
              sm={6}
              xs={6}
              className="text-center mt-3"
            >
              <p className="mb-0">
                <>Leave time</>
              </p>
              <Tooltip title="This is the time if you want to leave early or arrive late.">
                <TimePicker
                  size="large"
                  use12Hours
                  format="h:mm a"
                  onChange={(time) => handleChangeTimeData(time, "leave_time")}
                  changeOnBlur={true}
                  defaultValue={timeData.leave_time}
                  value={timeData.leave_time}
                />
              </Tooltip>
            </Col>
          </Row>

          {uiMode.is_classic_mode ? (
            <>
              <Card bg="white" className="mt-2 rounded">
                <Card.Body>
                  <Row>
                    <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
                      <strong>Finish at</strong>
                    </Col>
                    <Col
                      xxl={6}
                      xl={6}
                      lg={6}
                      md={6}
                      sm={6}
                      xs={6}
                      className="text-end"
                    >
                      {displayTimeData.finish_at != null ? (
                        <strong>{displayTimeData.finish_at}</strong>
                      ) : (
                        <strong>-</strong>
                      )}
                    </Col>
                    <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
                      <strong>Remaining time</strong>
                    </Col>
                    <Col
                      xxl={6}
                      xl={6}
                      lg={6}
                      md={6}
                      sm={6}
                      xs={6}
                      className="text-end"
                    >
                      {displayTimeData.remaining_time != null ? (
                        <strong>{displayTimeData.remaining_time}</strong>
                      ) : (
                        <strong>-</strong>
                      )}
                    </Col>
                    <Col xxl={12} xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Progress
                        className="m-0"
                        percent={displayTimeData.remaining_percentage}
                        size="small"
                        status="active"
                        strokeColor={
                          displayTimeData.remaining_percentage >= 75
                            ? "green"
                            : displayTimeData.remaining_percentage >= 36 &&
                              displayTimeData.remaining_percentage < 75
                            ? "orange"
                            : "red"
                        }
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              <Card bg="white" className="mt-2 mb-0 rounded">
                <Card.Body>
                  <Row>
                    <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
                      <strong>Working time</strong>
                    </Col>
                    <Col
                      xxl={6}
                      xl={6}
                      lg={6}
                      md={6}
                      sm={6}
                      xs={6}
                      className="text-end"
                    >
                      {displayTimeData.leave_total_work_time != null &&
                      displayTimeData.leave_total_access_time != null ? (
                        <strong>
                          {displayTimeData.leave_total_work_time +
                            " | " +
                            displayTimeData.leave_total_access_time}
                        </strong>
                      ) : (
                        <strong>-</strong>
                      )}
                    </Col>
                    <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
                      <strong>Remaining time</strong>
                    </Col>
                    <Col
                      xxl={6}
                      xl={6}
                      lg={6}
                      md={6}
                      sm={6}
                      xs={6}
                      className="text-end"
                    >
                      {displayTimeData.leave_remaining_time != null ? (
                        <strong>{displayTimeData.leave_remaining_time}</strong>
                      ) : (
                        <strong>-</strong>
                      )}
                    </Col>
                    <Col xxl={12} xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Progress
                        className="m-0"
                        percent={displayTimeData.leave_remaining_percentage}
                        size="small"
                        status="active"
                        strokeColor={
                          displayTimeData.leave_remaining_percentage >= 75
                            ? "green"
                            : displayTimeData.leave_remaining_percentage >=
                                36 &&
                              displayTimeData.leave_remaining_percentage < 75
                            ? "orange"
                            : "red"
                        }
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </>
          ) : (
            <>
              <Card bg="white" className="mt-3">
                <Card.Header className="bg-white pt-1 pb-1">
                  <Progress
                    className="m-0"
                    percent={displayTimeData.remaining_percentage}
                    size="small"
                    status="active"
                    strokeColor={
                      displayTimeData.remaining_percentage >= 75
                        ? "green"
                        : displayTimeData.remaining_percentage >= 36 &&
                          displayTimeData.remaining_percentage < 75
                        ? "orange"
                        : "red"
                    }
                  />
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col>
                      <Input
                        readOnly={true}
                        prefix={<strong>Finish at</strong>}
                        suffix={
                          displayTimeData.finish_at != null ? (
                            <strong>{displayTimeData.finish_at}</strong>
                          ) : (
                            <strong>-</strong>
                          )
                        }
                      />
                    </Col>
                    <Col>
                      <Input
                        readOnly={true}
                        prefix={<strong>Remaining time</strong>}
                        suffix={
                          displayTimeData.remaining_time != null ? (
                            <strong>{displayTimeData.remaining_time}</strong>
                          ) : (
                            <strong>-</strong>
                          )
                        }
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              <Card bg="white" className="mt-3">
                <Card.Header className="bg-white pt-1 pb-1">
                  <Progress
                    className="m-0"
                    percent={displayTimeData.leave_remaining_percentage}
                    size="small"
                    status="active"
                    strokeColor={
                      displayTimeData.leave_remaining_percentage >= 75
                        ? "green"
                        : displayTimeData.leave_remaining_percentage >= 36 &&
                          displayTimeData.leave_remaining_percentage < 75
                        ? "orange"
                        : "red"
                    }
                  />
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
                      <Input
                        readOnly={true}
                        prefix={<strong>Working time</strong>}
                        suffix={
                          displayTimeData.leave_total_work_time != null &&
                          displayTimeData.leave_total_access_time != null ? (
                            <strong>
                              {displayTimeData.leave_total_work_time +
                                " | " +
                                displayTimeData.leave_total_access_time}
                            </strong>
                          ) : (
                            <strong>-</strong>
                          )
                        }
                      />
                    </Col>
                    <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
                      <Input
                        readOnly={true}
                        prefix={<strong>Remaining time</strong>}
                        suffix={
                          displayTimeData.leave_remaining_time != null ? (
                            <strong>
                              {displayTimeData.leave_remaining_time}
                            </strong>
                          ) : (
                            <strong>-</strong>
                          )
                        }
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </>
          )}
          <Divider className="mt-3 mb-3" dashed={true}>
            {currenTime}
          </Divider>
          <Card className="mb-2">
          <Tooltip title="Change theme color">
            <Row className="p-1 d-flex justify-content-center">
              <CirclePicker
                width="auto"
                circleSize={20}
                circleSpacing={10}
                colors={allColors}
                color={uiMode.select_color}
                onChangeComplete={(color) => {
                  setUiMode({ ...uiMode, select_color: color.hex });
                }}
              />
            </Row>
            </Tooltip>
          </Card>
          <Row className="pb-2">
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={12}
              xs={12}
              className="d-flex  align-items-center justify-content-between"
            >
              
              <Tooltip title="Calculate">
                <Button
                  ref={buttonCalc}
                  type="primary"
                  icon={
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-play"
                        style={{ marginTop: "-2px" }}
                        viewBox="0 0 16 16"
                      >
                        <path d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z" />
                      </svg>
                    </>
                  }
                  onClick={startCalculate}
                />
              </Tooltip>

              <Tooltip title="Reset">
              <Button
                type="primary"
                danger
                ghost
                icon={
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-stop-circle-fill"
                      style={{ marginTop: "-2px" }}
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.5 5A1.5 1.5 0 0 0 5 6.5v3A1.5 1.5 0 0 0 6.5 11h3A1.5 1.5 0 0 0 11 9.5v-3A1.5 1.5 0 0 0 9.5 5h-3z" />
                    </svg>
                  </>
                }
                onClick={stopCalculate}
              />
              </Tooltip>

              <Tooltip title="For water notifications">
              <Space.Compact>
                <Button
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-droplet"
                      viewBox="0 0 16 16"
                      style={{ marginTop: "-3px" }}
                    >
                      <path
                        fill-rule="evenodd"
                        d="M7.21.8C7.69.295 8 0 8 0c.109.363.234.708.371 1.038.812 1.946 2.073 3.35 3.197 4.6C12.878 7.096 14 8.345 14 10a6 6 0 0 1-12 0C2 6.668 5.58 2.517 7.21.8zm.413 1.021A31.25 31.25 0 0 0 5.794 3.99c-.726.95-1.436 2.008-1.96 3.07C3.304 8.133 3 9.138 3 10a5 5 0 0 0 10 0c0-1.201-.796-2.157-2.181-3.7l-.03-.032C9.75 5.11 8.5 3.72 7.623 1.82z"
                      />
                      <path
                        fill-rule="evenodd"
                        d="M4.553 7.776c.82-1.641 1.717-2.753 2.093-3.13l.708.708c-.29.29-1.128 1.311-1.907 2.87l-.894-.448z"
                      />
                    </svg>
                  }
                />
                <Select
                  defaultValue={uiMode.is_water_notification_on}
                  value={uiMode.is_water_notification_on}
                  onChange={(value) => {
                    setUiMode({
                      ...uiMode,
                      is_water_notification_on: value,
                    });
                  }}
                >
                  <Option value={false}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-bell-slash"
                      viewBox="0 0 16 16"
                      style={{ marginTop: "-5px" }}
                    >
                      <path d="M5.164 14H15c-.299-.199-.557-.553-.78-1-.9-1.8-1.22-5.12-1.22-6 0-.264-.02-.523-.06-.776l-.938.938c.02.708.157 2.154.457 3.58.161.767.377 1.566.663 2.258H6.164l-1 1zm5.581-9.91a3.986 3.986 0 0 0-1.948-1.01L8 2.917l-.797.161A4.002 4.002 0 0 0 4 7c0 .628-.134 2.197-.459 3.742-.05.238-.105.479-.166.718l-1.653 1.653c.02-.037.04-.074.059-.113C2.679 11.2 3 7.88 3 7c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0c.942.19 1.788.645 2.457 1.284l-.707.707zM10 15a2 2 0 1 1-4 0h4zm-9.375.625a.53.53 0 0 0 .75.75l14.75-14.75a.53.53 0 0 0-.75-.75L.625 15.625z" />
                    </svg>
                  </Option>
                  <Option value={true}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-bell"
                      viewBox="0 0 16 16"
                      style={{ marginTop: "-3px" }}
                    >
                      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
                    </svg>
                  </Option>
                </Select>
                <Select
                  defaultValue={uiMode.water_notification_time}
                  value={uiMode.water_notification_time}
                  onChange={(value) => {
                    setUiMode({
                      ...uiMode,
                      water_notification_time: value,
                    });
                  }}
                  disabled={!uiMode.is_water_notification_on}
                >
                  <Option value="05">05 Min</Option>
                  <Option value="10">10 Min</Option>
                  <Option value="15">15 Min</Option>
                  <Option value="20">20 Min</Option>
                  <Option value="25">25 Min</Option>
                  <Option value="30">30 Min</Option>
                  <Option value="35">35 Min</Option>
                  <Option value="40">40 Min</Option>
                  <Option value="45">45 Min</Option>
                  <Option value="50">50 Min</Option>
                  <Option value="55">55 Min</Option>
                  <Option value="60">60 Min</Option>
                </Select>
              </Space.Compact>
              </Tooltip>

              <Tooltip title="For switch UI modes">
              <Switch
                checkedChildren="Fury"
                unCheckedChildren="Classic"
                checked={uiMode.is_classic_mode}
                onChange={() => {
                  setUiMode({
                    ...uiMode,
                    is_classic_mode: !uiMode.is_classic_mode,
                  });
                }}
              />
              </Tooltip>
              
              <Tooltip title="Show time is over notification">
              <Switch
                checkedChildren={
                  <>
                    {"\u00A0"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-bell"
                      viewBox="0 0 16 16"
                      style={{ marginTop: "-3px" }}
                    >
                      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
                    </svg>
                    {"\u00A0"}
                  </>
                }
                unCheckedChildren={
                  <>
                    {"\u00A0"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-bell-slash"
                      viewBox="0 0 16 16"
                      style={{ marginTop: "-5px" }}
                    >
                      <path d="M5.164 14H15c-.299-.199-.557-.553-.78-1-.9-1.8-1.22-5.12-1.22-6 0-.264-.02-.523-.06-.776l-.938.938c.02.708.157 2.154.457 3.58.161.767.377 1.566.663 2.258H6.164l-1 1zm5.581-9.91a3.986 3.986 0 0 0-1.948-1.01L8 2.917l-.797.161A4.002 4.002 0 0 0 4 7c0 .628-.134 2.197-.459 3.742-.05.238-.105.479-.166.718l-1.653 1.653c.02-.037.04-.074.059-.113C2.679 11.2 3 7.88 3 7c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0c.942.19 1.788.645 2.457 1.284l-.707.707zM10 15a2 2 0 1 1-4 0h4zm-9.375.625a.53.53 0 0 0 .75.75l14.75-14.75a.53.53 0 0 0-.75-.75L.625 15.625z" />
                    </svg>
                    {"\u00A0"}
                  </>
                }
                checked={uiMode.is_notification_on}
                onChange={() => {
                  setUiMode({
                    ...uiMode,
                    is_notification_on: !uiMode.is_notification_on,
                  });
                }}
              />
              </Tooltip>

            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default App;
