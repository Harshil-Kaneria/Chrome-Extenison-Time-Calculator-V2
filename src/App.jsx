import React, { useState, useEffect } from "react";
import "./App.css";
import { Card, TimePicker, Divider } from "antd";

const App = () => {
  const gridStyle = {
    width: "25%",
    textAlign: "center",
  };

  return (
    <>
      <div className="main_body">
        <Divider dashed={true}>Time Calculator V2</Divider>
        <Card bordered={true}>
          <Card.Grid style={gridStyle}>
            <TimePicker
              size="large"
              placeholder="Select Time"
              use12Hours
              format="h:mm a"
              onChange={(time) => {}}
            />
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <TimePicker
              size="large"
              placeholder="Select Time"
              use12Hours
              format="h:mm a"
              onChange={(time) => {}}
            />
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <TimePicker
              size="large"
              placeholder="Select Time"
              use12Hours
              format="h:mm a"
              onChange={(time) => {}}
            />
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <TimePicker
              size="large"
              placeholder="Select Time"
              use12Hours
              format="h:mm a"
              onChange={(time) => {}}
            />
          </Card.Grid>
        </Card>
      </div>
    </>
  );
};

export default App;
