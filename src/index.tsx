import React, { Component, createRef } from "react";
import { Platform, View } from "react-native";
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
type EdisonWebViewProps = WebProps &
  Omit<WebViewProps, WithoutProps> & {
    onSelectMonth?: (year: number, month: number) => void;
    onHeightChange?: (height: number, columnCount: number) => void;
  };

type EdisonWebViewState = {
  webviewUri: string;
  height: number;
  opacity: number;
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
      opacity: 1,
    };
  }

  private webViewRef = createRef<WebView>();

  componentDidMount() {
    this.setState({ webviewUri: calendarYearFilePath }, () => {
      this.updateProps();
    });
  }

  private diffKeys = [
    "year",
    "backgroundColor",
    "selectDay",
    "today",
    "fontFamily",
    "selectedTextColor",
    "activeTextColor",
    "inactiveTextColor",
    "monthTitleColor",
    "weekTitleColor",
  ] as const;

  componentDidUpdate(prevProps: EdisonWebViewProps) {
    let flag = false;
    for (const key of this.diffKeys) {
      if (prevProps[key] !== this.props[key]) {
        flag = true;
        break;
      }
    }
    if (flag) {
      this.updateProps();
    }
  }

  private updateProps = () => {
    const newJson: any = {};
    for (const key of this.diffKeys) {
      newJson[key] = this.props[key];
    }
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
      } else if (messageData.type === EventName.Render) {
        this.setState({ opacity: 0 });
      } else if (messageData.type === EventName.HeightChange) {
        const { height, columnCount } = messageData.data;
        this.setState({ height });
        this.props.onHeightChange &&
          this.props.onHeightChange(height, columnCount);
      } else if (messageData.type === EventName.SelectMonth) {
        this.props.onSelectMonth &&
          this.props.onSelectMonth(
            messageData.data.year,
            messageData.data.month
          );
      }
    } catch (err) {
      // pass
    }
  };

  render() {
    return (
      <View
        style={[
          {
            width: "100%",
            height: this.state.height,
            overflow: "hidden",
            backgroundColor: this.props.backgroundColor,
          },
        ]}
      >
        <WebView
          {...this.props}
          style={[
            this.props.style,
            {
              width: "100%",
              height: this.state.height,
              overflow: "hidden",
              backgroundColor: this.props.backgroundColor,
            },
          ]}
          containerStyle={{
            backgroundColor: this.props.backgroundColor,
          }}
          ref={this.webViewRef}
          originWhitelist={["*"]}
          source={{ uri: this.state.webviewUri }}
          allowFileAccess
          allowingReadAccessToURL={"file://"}
          onMessage={this.onMessage}
        />
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "110%",
            top: 0,
            left: 0,
            backgroundColor: this.props.backgroundColor,
            opacity: this.state.opacity,
          }}
          pointerEvents={"none"}
        />
      </View>
    );
  }
}
