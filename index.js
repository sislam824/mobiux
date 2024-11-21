const fs = require("fs");
const dataFilePath = "./data.csv";

let salesData = fs.readFileSync(dataFilePath, "utf-8");

// Split the data into lines and remove the header row
const dataRows = [];
let currentRow = "";
for (let charIndex = 0; charIndex < salesData.length; charIndex++) {
  if (salesData[charIndex] === "\n") {
    dataRows.push(currentRow);
    currentRow = "";
  } else {
    currentRow += salesData[charIndex];
  }
}
dataRows.shift();

// Extract year and month from a given date string
function extractYearAndMonth(dateStr) {
  const [year, month] = dateStr.split("-");
  return `${year}-${parseInt(month, 10)}`;
}

// Calculate the total sales amount from the data
function computeTotalSales(rows) {
  let overallSales = 0;
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const columns = parseCSVRow(rows[rowIndex]);
    if (columns.length < 5) continue;
    overallSales += parseFloat(columns[4]);
  }
  return overallSales;
}

// Calculate the total sales for each month
function computeMonthlySales(rows) {
  const salesByMonth = {};
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const columns = parseCSVRow(rows[rowIndex]);
    if (columns.length < 5) continue;

    const month = extractYearAndMonth(columns[0]);
    const salesValue = parseFloat(columns[4]);
    salesByMonth[month] = (salesByMonth[month] || 0) + salesValue;
  }
  return salesByMonth;
}

// Find the most sold item by quantity for each month
function getBestSellingItems(rows) {
  const monthlyItemCounts = {};
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const columns = parseCSVRow(rows[rowIndex]);
    if (columns.length < 5) continue;

    const month = extractYearAndMonth(columns[0]);
    const product = columns[1];
    const quantity = parseInt(columns[3]);

    if (!monthlyItemCounts[month]) {
      monthlyItemCounts[month] = {};
    }
    monthlyItemCounts[month][product] =
      (monthlyItemCounts[month][product] || 0) + quantity;
  }

  const topSellingItems = {};
  for (const month in monthlyItemCounts) {
    let maxQuantity = 0;
    let bestItem = "";
    for (const product in monthlyItemCounts[month]) {
      if (monthlyItemCounts[month][product] > maxQuantity) {
        maxQuantity = monthlyItemCounts[month][product];
        bestItem = product;
      }
    }
    topSellingItems[month] = bestItem;
  }
  return topSellingItems;
}

// Determine the highest revenue-generating item for each month
function getTopRevenueItems(rows) {
  const monthlyRevenues = {};
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const columns = parseCSVRow(rows[rowIndex]);
    if (columns.length < 5) continue;

    const month = extractYearAndMonth(columns[0]);
    const product = columns[1];
    const revenue = parseFloat(columns[4]);

    if (!monthlyRevenues[month]) {
      monthlyRevenues[month] = {};
    }
    monthlyRevenues[month][product] =
      (monthlyRevenues[month][product] || 0) + revenue;
  }

  const highestRevenueItems = {};
  for (const month in monthlyRevenues) {
    let maxRevenue = 0;
    let topItem = "";
    for (const product in monthlyRevenues[month]) {
      if (monthlyRevenues[month][product] > maxRevenue) {
        maxRevenue = monthlyRevenues[month][product];
        topItem = product;
      }
    }
    highestRevenueItems[month] = topItem;
  }
  return highestRevenueItems;
}

// Calculate order stats for the most sold items by month
function calculateTopItemOrderStats(rows) {
  const bestSellingItems = getBestSellingItems(rows);
  const statsByMonth = {};

  const monthlyOrders = {};
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const columns = parseCSVRow(rows[rowIndex]);
    if (columns.length < 5) continue;

    const month = extractYearAndMonth(columns[0]);
    const product = columns[1];
    const quantity = parseInt(columns[3]);

    if (bestSellingItems[month] === product) {
      if (!monthlyOrders[month]) {
        monthlyOrders[month] = [];
      }
      monthlyOrders[month].push(quantity);
    }
  }

  for (const month in monthlyOrders) {
    const orders = monthlyOrders[month];
    const minOrder = Math.min(...orders);
    const maxOrder = Math.max(...orders);
    const avgOrder = orders.reduce((sum, val) => sum + val, 0) / orders.length;

    statsByMonth[month] = { min: minOrder, max: maxOrder, avg: avgOrder };
  }
  return statsByMonth;
}

// Parse a CSV row into an array of columns
function parseCSVRow(row) {
  const columns = [];
  let columnValue = "";
  for (let charIndex = 0; charIndex < row.length; charIndex++) {
    if (row[charIndex] === ",") {
      columns.push(columnValue.trim());
      columnValue = "";
    } else {
      columnValue += row[charIndex];
    }
  }
  columns.push(columnValue.trim());
  return columns;
}

// Display computed results
function logResults() {
  console.log("Overall Sales:", computeTotalSales(dataRows));
  console.log("Sales by Month:", computeMonthlySales(dataRows));
  console.log("Top-Selling Items:", getBestSellingItems(dataRows));
  console.log("Highest Revenue Items:", getTopRevenueItems(dataRows));
  console.log(
    "Order Stats for Top Items:",
    calculateTopItemOrderStats(dataRows)
  );
}

logResults();
