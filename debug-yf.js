import yahooFinance from "yahoo-finance2";

console.log("Type of default export:", typeof yahooFinance);
console.log("Is it a class?", yahooFinance.toString().startsWith("class"));
console.log("Keys:", Object.keys(yahooFinance));
try {
  console.log("Trying to instantiate...");
  const instance = new yahooFinance();
  console.log("Instance created.");
} catch (e) {
  console.error("Instantiation failed:", e.message);
}

if (yahooFinance.setGlobalConfig) {
  console.log("setGlobalConfig exists on default export");
} else {
  console.log("setGlobalConfig does NOT exist on default export");
}
