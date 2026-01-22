import yahooFinance from "yahoo-finance2";

console.log("Checking instance...");
try {
  const instance = new yahooFinance();
  console.log("Instance keys:", Object.keys(instance));
  console.log(
    "Instance prototype keys:",
    Object.getOwnPropertyNames(Object.getPrototypeOf(instance)),
  );

  if (instance.setGlobalConfig) {
    console.log("setGlobalConfig exists on INSTANCE");
  } else {
    console.log("setGlobalConfig does NOT exist on INSTANCE");
  }

  if (yahooFinance.setGlobalConfig) {
    console.log("setGlobalConfig exists on CLASS/EXPORT");
  } else {
    console.log("setGlobalConfig does NOT exist on CLASS/EXPORT");
  }
} catch (e) {
  console.error("Instantiation failed:", e.message);
}
