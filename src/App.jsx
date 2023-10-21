import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { TimePicker, Progress, Input, Divider, Checkbox, Switch } from "antd";
import { Row, Col, Container, Card, Alert } from "react-bootstrap";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

const App = () => {
  let getCurrentTime = () => dayjs().format("hh:mm:ss A | D MMM YYYY | dddd");

  const buttonCalc = useRef(null);
  const [displayTimeInterval, setDisplayTimeInterval] = useState(null);

  let initUiModeData = {
    is_classic_mode: false,
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

  const [currenTime, setCurrentTime] = useState(getCurrentTime());
  useEffect(() => {
    setInterval(() => setCurrentTime(getCurrentTime()), 1000);
  }, []);

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

  useEffect(() => {
    getDataFromLocal();
    getUiDataFromLocal();
  }, []);

  useEffect(() => {
    console.log("🚀 ~ file: App.jsx:215 ~ App ~ uiMode:", uiMode)
    updateUiData();
  }, [uiMode]);

  return (
    <>
      <div className="main_body p-3">
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
              <TimePicker
                size="large"
                use12Hours
                format="h:mm a"
                onChange={(time) => handleChangeTimeData(time, "start_time")}
                changeOnBlur={true}
                defaultValue={timeData.start_time}
                value={timeData.start_time}
              />
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
              <TimePicker
                size="large"
                format="HH:mm"
                showNow={false}
                onChange={(time) => handleChangeTimeData(time, "working_time")}
                changeOnBlur={true}
                defaultValue={timeData.working_time}
                value={timeData.working_time}
              />
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
              <TimePicker
                size="large"
                format="HH:mm"
                showNow={false}
                onChange={(time) => handleChangeTimeData(time, "break_time")}
                changeOnBlur={true}
                defaultValue={timeData.break_time}
                value={timeData.break_time}
              />
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
              <TimePicker
                size="large"
                use12Hours
                format="h:mm a"
                onChange={(time) => handleChangeTimeData(time, "leave_time")}
                changeOnBlur={true}
                defaultValue={timeData.leave_time}
                value={timeData.leave_time}
              />
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
          <Row className="pb-2">
            <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
              <button
                type="button"
                class="btn btn-sm btn-outline-dark"
                onClick={startCalculate}
                ref={buttonCalc}
              >
                Calculate
              </button>
              {"\u00A0"}
              {"\u00A0"}
              {"\u00A0"}
              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                onClick={stopCalculate}
              >
                Reset
              </button>
            </Col>
            <Col
              xxl={6}
              xl={6}
              lg={6}
              md={6}
              sm={6}
              xs={6}
              className="d-flex align-items-center"
            >
              {/* <Checkbox>Notified me</Checkbox> */}
              <Switch
                checkedChildren="Fury mode"
                unCheckedChildren="Classic mode"
                checked={uiMode.is_classic_mode}
                onChange={() => {
                  setUiMode({
                    ...uiMode,
                    is_classic_mode: !uiMode.is_classic_mode,
                  });
                }}
              />
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default App;
