import { Buffer } from "buffer";
import React, { Component, createRef } from "react";
import { Platform } from "react-native";
import RNFS from "react-native-fs";
import WebView, {
  WebViewMessageEvent,
  WebViewProps,
} from "react-native-webview";
import { EventName, WebProps } from "./constants";
import "./index.html";

const packageName = "react-native-edison-calendar-list";

const InjectScriptName = {
  UpdateProps: "updateProps",
} as const;

const calendarYearFileTargetPath = `file://${RNFS.CachesDirectoryPath}/calendarYear.html`;
let calendarYearFilePath = calendarYearFileTargetPath;

async function copyFileForIos() {
  const htmlPath = `file://${RNFS.MainBundlePath}/assets/node_modules/${packageName}/lib/index.html`;
  try {
    const fileHasExists = await RNFS.exists(calendarYearFileTargetPath);
    if (fileHasExists) {
      await RNFS.unlink(calendarYearFileTargetPath);
    }
    await RNFS.copyFile(htmlPath, calendarYearFileTargetPath);
    return calendarYearFileTargetPath;
  } catch (err) {
    // badcase remedy
    return htmlPath;
  }
}

async function copyFileForAndroid() {
  const htmlResPath = `raw/node_modules_${packageName.replace(
    /-/g,
    ""
  )}_lib_index.html`;
  try {
    const fileHasExists = await RNFS.exists(calendarYearFileTargetPath);
    if (fileHasExists) {
      await RNFS.unlink(calendarYearFileTargetPath);
    }
    await RNFS.copyFileRes(htmlResPath, calendarYearFileTargetPath);
    return calendarYearFileTargetPath;
  } catch (err) {
    // badcase remedy
    return `file:///android_res/${htmlResPath}`;
  }
}

async function copyFile() {
  if (Platform.OS === "ios") {
    const filePath = await copyFileForIos();
    calendarYearFilePath = filePath;
  } else if (Platform.OS === "android") {
    const filePath = await copyFileForAndroid();
    calendarYearFilePath = filePath;
  }
}

copyFile();

type WithoutProps =
  | "ref"
  | "originWhitelist"
  | "source"
  | "allowingReadAccessToURL"
  | "onMessage";
type EdisonWebViewProps = WebProps & Omit<WebViewProps, WithoutProps>;

type EdisonWebViewState = {
  webviewUri: string;
  height: number;
};
export default class RNWebView extends Component<
  EdisonWebViewProps,
  EdisonWebViewState
> {
  timeoutMap: Map<string, NodeJS.Timeout> = new Map();
  webviewMounted: boolean = false;
  constructor(props: any) {
    super(props);
    this.state = {
      webviewUri: "",
      height: 500,
    };
  }

  private webViewRef = createRef<WebView>();

  componentDidMount() {
    this.setState({ webviewUri: calendarYearFilePath });
  }

  componentDidUpdate(prevProps: EdisonWebViewProps) {
    if (
      prevProps.isDarkMode !== this.props.isDarkMode ||
      prevProps.year !== this.props.year ||
      prevProps.selectDay !== this.props.selectDay ||
      prevProps.monthDaysColor !== this.props.monthDaysColor ||
      prevProps.otherMonthDaysColor !== this.props.otherMonthDaysColor ||
      prevProps.monthTitleColor !== this.props.monthTitleColor ||
      prevProps.weekTitleColor !== this.props.weekTitleColor ||
      prevProps.selectedWeekTitleColor !== this.props.selectedWeekTitleColor
    ) {
      this.updateProps();
    }
  }

  private updateProps = () => {
    const newJson: WebProps = {
      year: this.props.year,
      isDarkMode: this.props.isDarkMode,
      selectDay: this.props.selectDay,
      monthDaysColor: this.props.monthDaysColor,
      otherMonthDaysColor: this.props.otherMonthDaysColor,
      monthTitleColor: this.props.monthTitleColor,
      weekTitleColor: this.props.weekTitleColor,
      selectedWeekTitleColor: this.props.selectedWeekTitleColor,
    };
    this.executeScript(InjectScriptName.UpdateProps, JSON.stringify(newJson));
  };

  private executeScript = (
    functionName: typeof InjectScriptName[keyof typeof InjectScriptName],
    parameter?: string
  ) => {
    if (!this.webViewRef.current) {
      return;
    }
    const timeout = this.timeoutMap.get(functionName);
    if (timeout) {
      clearTimeout(timeout);
    }
    if (!this.webviewMounted) {
      this.timeoutMap.set(
        functionName,
        setTimeout(() => {
          this.executeScript(functionName, parameter);
        }, 100)
      );
      return;
    }
    this.webViewRef.current.injectJavaScript(
      `window.${functionName} && window.${functionName}(${
        parameter ? `'${parameter}'` : ""
      });true;`
    );
  };

  private onMessage = (event: WebViewMessageEvent) => {
    try {
      const messageData: {
        type: typeof EventName[keyof typeof EventName];
        data: any;
      } = JSON.parse(event.nativeEvent.data);
      if (messageData.type === EventName.IsMounted) {
        this.webviewMounted = true;
      } else if (messageData.type === EventName.HeightChange) {
        this.setState({ height: messageData.data });
      }
    } catch (err) {
      // pass
    }
  };

  render() {
    return (
      <WebView
        {...this.props}
        style={[
          this.props.style,
          {
            width: "100%",
            height: this.state.height,
            overflow: "hidden",
          },
        ]}
        ref={this.webViewRef}
        originWhitelist={["*"]}
        source={{ uri: this.state.webviewUri }}
        allowFileAccess
        forceDarkOn={this.props.isDarkMode}
        allowingReadAccessToURL={"file://"}
        onMessage={this.onMessage}
      />
    );
  }
}
