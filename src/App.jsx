import React, { useState, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { TimePicker, Progress, Input, Divider,Checkbox } from "antd";
import { Row, Col, Container, Card } from "react-bootstrap";
import moment from "moment";

const App = () => {

  let getCurrentTime = () => moment().format('hh:mm:ss A | D MMM GGGG | dddd')

  const [startTime, setStartTime] = useState("09:00 AM");
  const [workingTime, setWorkingTime] = useState("08:30");
  const [breakTime, setBreakTime] = useState("00:30");
  const [leaveTime, setLeaveTime] = useState("");
  const [currenTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(()=> setInterval(()=>setCurrentTime(getCurrentTime()),1000),[])

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

  let percent=76;

  return (
    <>
      <div className="main_body bg-light">
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
          <Divider className="mt-1 mb-1" dashed={true}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hourglass-top" viewBox="0 0 16 16"><path d="M2 14.5a.5.5 0 0 0 .5.5h11a.5.5 0 1 0 0-1h-1v-1a4.5 4.5 0 0 0-2.557-4.06c-.29-.139-.443-.377-.443-.59v-.7c0-.213.154-.451.443-.59A4.5 4.5 0 0 0 12.5 3V2h1a.5.5 0 0 0 0-1h-11a.5.5 0 0 0 0 1h1v1a4.5 4.5 0 0 0 2.557 4.06c.29.139.443.377.443.59v.7c0 .213-.154.451-.443.59A4.5 4.5 0 0 0 3.5 13v1h-1a.5.5 0 0 0-.5.5zm2.5-.5v-1a3.5 3.5 0 0 1 1.989-3.158c.533-.256 1.011-.79 1.011-1.491v-.702s.18.101.5.101.5-.1.5-.1v.7c0 .701.478 1.236 1.011 1.492A3.5 3.5 0 0 1 11.5 13v1h-7z"/></svg></Divider>
          <Card bg="white" className="mt-1">
            <Card.Header className="bg-white pt-1 pb-1">
              <Progress
                className='m-0'
                percent={percent}
                size="small"
                status="active"
                strokeColor={percent>=75?'green':(percent>=36 && percent<75)?'orange':'red'}
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
          <Divider className="mt-1 mb-1" dashed={true}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hourglass-bottom" viewBox="0 0 16 16"><path d="M2 1.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1h-11a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1-.5-.5zm2.5.5v1a3.5 3.5 0 0 0 1.989 3.158c.533.256 1.011.791 1.011 1.491v.702s.18.149.5.149.5-.15.5-.15v-.7c0-.701.478-1.236 1.011-1.492A3.5 3.5 0 0 0 11.5 3V2h-7z"/></svg></Divider>
          <Card bg="white" className="mt-1">
            <Card.Header className="bg-white pt-1 pb-1">
              <Progress
                className='m-0'
                percent={percent}
                size="small"
                status="active"
                strokeColor={percent>=75?'green':(percent>=36 && percent<75)?'orange':'red'}
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
          <Divider className="mt-1 mb-1" dashed={true}>{currenTime}</Divider>
          <Row className="pb-2">
            <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
              <button type="button" class="btn btn-sm btn-outline-dark">Calculate</button>{'\u00A0'}{'\u00A0'}{'\u00A0'}
              <button type="button" class="btn btn-sm btn-outline-danger">Reset</button>
            </Col>
            <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6} className="d-flex align-items-center justify-content-end">
              <Checkbox>Notified me</Checkbox>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default App;
