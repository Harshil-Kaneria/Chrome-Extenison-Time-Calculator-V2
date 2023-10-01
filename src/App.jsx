import React, { useState, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { TimePicker, Progress, Input } from "antd";
import { Row, Col, Container, Card } from "react-bootstrap";
import moment from "moment";

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
              <div class="text-center mt-1">
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
              <div class="text-center mt-1">
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
              <div class="text-center mt-1">
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
              <div class="text-center mt-1">
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
          <Card bg="white" className="mt-1">
            <Card.Header className="bg-white pt-1 pb-1">
              <Progress
                className="m-0"
                percent={50}
                size="small"
                status="active"
              />
            </Card.Header>
            <Card.Body className="p-1">
              <Row>
                <Col>
                  <Input
                    readOnly={true}
                    prefix={<strong>Finish at</strong>}
                    suffix={<kbd>06:00 PM</kbd>}
                  />
                </Col>
                <Col>
                  <Input
                    readOnly={true}
                    prefix={<strong>Remaining time</strong>}
                    suffix={<kbd>06:00 PM</kbd>}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <hr className="mt-1 mb-1 hr_dashed" />
          <Card bg="white" className="mt-1">
            <Card.Header className="bg-white pt-1 pb-1">
              <Progress
                className="m-0"
                percent={100}
                size="small"
                status="active"
              />
            </Card.Header>
            <Card.Body className="p-1">
              <Row>
                <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
                  <Input
                    readOnly={true}
                    prefix={<strong>Remaining time</strong>}
                    suffix={<kbd>06:00 PM</kbd>}
                  />
                </Col>
                <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
                  <Input
                    readOnly={true}
                    prefix={<strong>Total work time</strong>}
                    suffix={<kbd>06:00 PM</kbd>}
                  />
                </Col>
                <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
                  <Input
                    className="mt-1"
                    readOnly={true}
                    prefix={<strong>Total access time</strong>}
                    suffix={<kbd>06:00 PM</kbd>}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <hr className="mt-1 mb-1 hr_dashed" />
        </Container>
      </div>
    </>
  );
};

export default App;
