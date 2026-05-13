const isNumString = (str: string) => !isNaN(Number(str));

function deepParseJson(jsonString: unknown): unknown {
  if (typeof jsonString === "string") {
    if (isNumString(jsonString)) {
      return jsonString;
    }
    try {
      return deepParseJson(JSON.parse(jsonString));
    } catch {
      return jsonString;
    }
  } else if (Array.isArray(jsonString)) {
    return jsonString.map((val) => deepParseJson(val));
  } else if (typeof jsonString === "object" && jsonString !== null) {
    return Object.keys(jsonString as Record<string, unknown>).reduce<
      Record<string, unknown>
    >((obj, key) => {
      const val = (jsonString as Record<string, unknown>)[key];
      obj[key] =
        typeof val === "string" && isNumString(val) ? val : deepParseJson(val);
      return obj;
    }, {});
  } else {
    return jsonString;
  }
}

export default deepParseJson;
