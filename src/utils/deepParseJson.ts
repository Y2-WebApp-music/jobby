const isNumString = (str: string) => !isNaN(Number(str));

function deepParseJson(jsonString: string): any {
  if (typeof jsonString === "string") {
    if (isNumString(jsonString)) {
      return jsonString;
    }
    try {
      return deepParseJson(JSON.parse(jsonString));
    } catch (err) {
      return jsonString;
    }
  } else if (Array.isArray(jsonString)) {
    return (jsonString as any).map((val: any) => deepParseJson(val));
  } else if (typeof jsonString === "object" && jsonString !== null) {
    return Object.keys(jsonString).reduce((obj: any, key) => {
      const val = jsonString[key];
      obj[key as keyof typeof obj] = isNumString(val)
        ? val
        : deepParseJson(val);
      return obj;
    }, {});
  } else {
    return jsonString;
  }
}

export default deepParseJson;
