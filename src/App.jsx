import React, { useState, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { TimePicker,Progress,Input } from "antd";
import { Row, Col, Container } from "react-bootstrap";
import moment from "moment";

const { Search } = Input;

const gridStyle = {
  width: "25%",
  textAlign: "center",
};

const App = () => {
  const [startTime, setStartTime] = useState("09:00 AM");
  const [workingTime, setWorkingTime] = useState("08:30");
  const [breakTime, setBreakTime] = useState("00:30");
  const [leaveTime, setLeaveTime] = useState("");

  const handleStartTimeChange = (time, timeString) => {
    setStartTime(timeString);
  };

  const handleWorkingTimeChange = (time, timeString) => {
    setWorkingTime(timeString);
  };

  const handleBreakTimeChange = (time, timeString) => {
    setBreakTime(timeString);
  };

  const handleLeaveTimeChange = (time, timeString) => {
    setLeaveTime(timeString);
  };

  return (
    <>
      <div className="main_body">
        <Container>
          <Row>
            <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
              <div class="text-center mt-3">
                <kbd>Start time</kbd>
              </div>
              <TimePicker
                className="w-100"
                size="large"
                use12Hours
                format="h:mm a"
                defaultValue={moment(startTime, "h:mm a")}
                onChange={handleStartTimeChange}
                value={moment(startTime, "h:mm a")}
              />
            </Col>
            <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
              <div class="text-center mt-3">
                <kbd>Working time</kbd>
              </div>
              <TimePicker
                className="w-100"
                size="large"
                format="HH:mm"
                showNow={false}
                defaultValue={moment(workingTime, "HH:mm")}
                onChange={handleWorkingTimeChange}
                value={moment(workingTime, "HH:mm")}
              />
            </Col>
            <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
              <div class="text-center mt-3">
                <kbd>Break time</kbd>
              </div>
              <TimePicker
                className="w-100"
                size="large"
                format="HH:mm"
                showNow={false}
                defaultValue={moment(breakTime, "HH:mm")}
                onChange={handleBreakTimeChange}
                value={moment(breakTime, "HH:mm")}
              />
            </Col>
            <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
              <div class="text-center mt-3">
                <kbd>Leave time (optional)</kbd>
              </div>
              <TimePicker
                className="w-100"
                size="large"
                use12Hours
                format="h:mm a"
                onChange={handleLeaveTimeChange}
                // value={moment(leaveTime, 'h:mm a')}
              />
            </Col>
          </Row>
          <hr className="mt-1 mb-1 hr_dashed" />
          <Row>
            <Col className="mt-1" xxl={12} xl={12} lg={12} md={12} sm={12} xs={12}><Input prefix="Finish at" suffix="06:00 PM" disabled /></Col>
            <Col className="mt-1" xxl={12} xl={12} lg={12} md={12} sm={12} xs={12}><Input prefix="Remaining time" suffix="06:00 PM" disabled /></Col>
            <Progress className="m-0" percent={50} size="small" status="active" />
            <Col className="mt-1" xxl={12} xl={12} lg={12} md={12} sm={12} xs={12}><Input prefix="Remaining leave time" suffix="06:00 PM" disabled /></Col>
            <Col className="mt-1" xxl={12} xl={12} lg={12} md={12} sm={12} xs={12}><Input prefix="Total working time" suffix="06:00 PM" disabled /></Col>
            <Col className="mt-1" xxl={12} xl={12} lg={12} md={12} sm={12} xs={12}><Input prefix="Total access time" suffix="06:00 PM" disabled /></Col>
            <Progress className="m-0" percent={100} size="small" status="active" />
          </Row>
          <hr className="mt-1 mb-1 hr_dashed" />
        </Container>
      </div>
    </>
  );
};

export default App;
