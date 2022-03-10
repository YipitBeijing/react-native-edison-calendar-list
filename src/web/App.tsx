import React from "react";
import { EventName, WebProps } from "../constants";
import YearCalendar from "./components/Year";
import { SvgWidth, SvgHeight } from "./utils/MonthSvg";
import "./styles";

const monthPaddingHorizontal = 10;

type State = WebProps & {
  scale: number;
  columnCount: number;
};

type EventType = typeof EventName[keyof typeof EventName];

class App extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      scale: 1,
      columnCount: 2,
      year: 1900,
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
    this.updateLayout(container.scrollWidth, container.scrollHeight);
  };

  private updateLayout = (width: number, height: number) => {
    let columnCount = 2;
    if (width < 300) {
      columnCount = 1;
    } else if (width >= 300 && width < 700) {
      columnCount = 2;
    } else if (width >= 700 && width < 1000) {
      columnCount = 3;
    } else {
      columnCount = 4;
    }
    const monthCalcWidth = width / columnCount;
    const scale =
      Math.floor(
        (monthCalcWidth / (SvgWidth + monthPaddingHorizontal * 2)) * 100
      ) / 100;
    this.setState({ scale, columnCount });
    this.postMessage(EventName.HeightChange, { height, columnCount });
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
      this.setState(json, () => {
        this.postMessage(EventName.Render, true);
      });
    } catch (err: any) {
      this.postMessage(EventName.Error, err.message);
    }
  };

  private onSelectMonth = (year: number, month: number) => {
    this.postMessage(EventName.SelectMonth, { year, month });
  };

  private generateStyle = () => {
    const { backgroundColor = "#fffffe", scale, columnCount } = this.state;
    return `
      html, body.edo, #edo-container {
        background-color: ${backgroundColor} !important;
      }
      #edo-container .monthBox {
        width: ${SvgWidth * scale}px;
        height: ${SvgHeight * scale}px;
      }
      #edo-container .monthBox svg {
        transform: scale(${scale});
      }
    `;
  };

  render() {
    const { year, ...otherState } = this.state;

    return (
      <>
        <style>{this.generateStyle()}</style>
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
