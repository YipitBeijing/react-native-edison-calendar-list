import React from "react";
import { EventName, WebProps } from "../constants";
import YearCalendar from "./components/Year";
import "./styles";

type State = WebProps;

const darkModeStyle = `
  html, body.edo, #edo-container {
    background-color: #121212 !important;
  }
  body {
    color: #fff;
  }
`;

const lightModeStyle = `
  html, body.edo, #edo-container {
    background-color: #fffffe !important;
  }
`;

type EventType = typeof EventName[keyof typeof EventName];

class App extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      isDarkMode: false,
      year: 1900,
      selectDay: {
        year: 1900,
        month: 1,
        date: 20,
      },
      today: {
        year: 1900,
        month: 1,
        date: 2,
      },
    };
  }

  componentDidMount() {
    this.postMessage(EventName.IsMounted, true);
    window.updateProps = this.updateProps;

    window.addEventListener("resize", () => {
      this.updateSize("window-resize");
    });

    this.updateSize("window-mounted");
  }

  private updateSize = (info = "") => {
    if (info) {
      this.postMessage(EventName.Debugger, info);
    }
    const container = document.getElementById("edo-container");
    if (!container) {
      return;
    }

    this.postMessage(EventName.HeightChange, container.scrollHeight);
  };

  private postMessage = (type: EventType, data: any) => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: type,
          data: data,
        })
      );
    }
  };

  private updateProps = (jsonStr: string) => {
    try {
      const json = JSON.parse(jsonStr) as WebProps;
      this.postMessage(EventName.Debugger, jsonStr);
      this.setState(json);
    } catch (err: any) {
      this.postMessage(EventName.Error, err.message);
    }
  };

  private onSelectMonth = (year: number, month: number) => {
    this.postMessage(EventName.SelectMonth, { year, month });
  };

  render() {
    const { isDarkMode, year, ...otherState } = this.state;

    return (
      <>
        <style>{isDarkMode ? darkModeStyle : lightModeStyle}</style>
        <YearCalendar
          year={year}
          {...otherState}
          onSelectMonth={this.onSelectMonth}
        />
      </>
    );
  }
}

export default App;
