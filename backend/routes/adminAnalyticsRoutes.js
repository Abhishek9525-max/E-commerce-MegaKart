const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 3660;
const ORDER_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

const parseDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date;
};

const isPaidOrder = (order) =>
  order.isPaid === true || String(order.paymentStatus).toLowerCase() === "paid";

const isCountableOrder = (order) =>
  isPaidOrder(order) && order.status !== "Cancelled";

const getComparison = (current, previous) => ({
  current,
  previous,
  growthPercent:
    previous === 0 ? null : ((current - previous) / previous) * 100,
});

router.get("/", protect, admin, async (req, res) => {
  const startDate = parseDate(req.query.startDate);
  const endDate = parseDate(req.query.endDate);

  if (!startDate || !endDate || startDate > endDate) {
    return res.status(400).json({
      message: "Provide a valid startDate and endDate in YYYY-MM-DD format.",
    });
  }

  const periodDays = Math.floor((endDate - startDate) / DAY_IN_MS) + 1;
  if (periodDays > MAX_RANGE_DAYS) {
    return res.status(400).json({
      message: "The selected date range cannot exceed 10 years.",
    });
  }

  const endExclusive = new Date(endDate.getTime() + DAY_IN_MS);
  const previousStart = new Date(startDate.getTime() - periodDays * DAY_IN_MS);
  const rangeQuery = (start, end) => ({
    createdAt: { $gte: start, $lt: end },
  });

  try {
    const [periodOrders, previousOrders] = await Promise.all([
      Order.find(rangeQuery(startDate, endExclusive))
        .select("createdAt totalPrice status isPaid paymentStatus orderItems")
        .lean(),
      Order.find(rangeQuery(previousStart, startDate))
        .select("totalPrice status isPaid paymentStatus orderItems")
        .lean(),
    ]);

    const includedOrders = periodOrders.filter(isCountableOrder);
    const includedPreviousOrders = previousOrders.filter(isCountableOrder);
    const getUnits = (orders) =>
      orders.reduce(
        (sum, order) =>
          sum +
          (order.orderItems ?? []).reduce(
            (itemSum, item) => itemSum + (Number(item.quantity) || 0),
            0
          ),
        0
      );
    const getRevenue = (orders) =>
      orders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);

    const revenue = getRevenue(includedOrders);
    const previousRevenue = getRevenue(includedPreviousOrders);
    const unitsSold = getUnits(includedOrders);
    const previousUnitsSold = getUnits(includedPreviousOrders);
    const paidOrders = includedOrders.length;
    const previousPaidOrders = includedPreviousOrders.length;
    const averageOrderValue = paidOrders ? revenue / paidOrders : 0;
    const previousAverageOrderValue = previousPaidOrders
      ? previousRevenue / previousPaidOrders
      : 0;

    const dailyTotals = new Map();
    includedOrders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().slice(0, 10);
      const totals = dailyTotals.get(date) ?? { revenue: 0, orders: 0 };
      totals.revenue += Number(order.totalPrice) || 0;
      totals.orders += 1;
      dailyTotals.set(date, totals);
    });

    const dailyRevenue = [];
    for (let timestamp = startDate.getTime(); timestamp < endExclusive.getTime(); timestamp += DAY_IN_MS) {
      const date = new Date(timestamp).toISOString().slice(0, 10);
      const totals = dailyTotals.get(date) ?? { revenue: 0, orders: 0 };
      dailyRevenue.push({ date, ...totals });
    }

    const orderDistribution = ORDER_STATUSES.map((status) => ({
      status,
      count: periodOrders.filter((order) => order.status === status).length,
    }));

    const productIds = [
      ...new Set(
        includedOrders.flatMap((order) =>
          (order.orderItems ?? [])
            .map((item) => item.productId?.toString())
            .filter(Boolean)
        )
      ),
    ];
    const products = productIds.length
      ? await Product.find({ _id: { $in: productIds } })
          .select("category countInStock")
          .lean()
      : [];
    const productsById = new Map(
      products.map((product) => [product._id.toString(), product])
    );
    const categoryTotals = new Map();
    const productTotals = new Map();

    includedOrders.forEach((order) => {
      (order.orderItems ?? []).forEach((item) => {
        const quantity = Number(item.quantity) || 0;
        const itemRevenue = (Number(item.price) || 0) * quantity;
        const productId = item.productId?.toString();
        const product = productId ? productsById.get(productId) : null;
        const category = product?.category || "Uncategorized";
        const categoryTotal = categoryTotals.get(category) ?? {
          category,
          revenue: 0,
          unitsSold: 0,
        };
        categoryTotal.revenue += itemRevenue;
        categoryTotal.unitsSold += quantity;
        categoryTotals.set(category, categoryTotal);

        const key = productId || item.name;
        const productTotal = productTotals.get(key) ?? {
          productId: productId ?? null,
          name: item.name || "Unnamed product",
          unitsSold: 0,
          revenue: 0,
          stockRemaining: product?.countInStock ?? null,
        };
        productTotal.unitsSold += quantity;
        productTotal.revenue += itemRevenue;
        productTotals.set(key, productTotal);
      });
    });

    res.json({
      period: {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        previousStartDate: previousStart.toISOString().slice(0, 10),
        previousEndDate: new Date(startDate.getTime() - DAY_IN_MS)
          .toISOString()
          .slice(0, 10),
      },
      summary: {
        revenue: getComparison(revenue, previousRevenue),
        averageOrderValue: getComparison(
          averageOrderValue,
          previousAverageOrderValue
        ),
        unitsSold: getComparison(unitsSold, previousUnitsSold),
        orders: getComparison(paidOrders, previousPaidOrders),
      },
      dailyRevenue,
      salesByCategory: [...categoryTotals.values()].sort(
        (a, b) => b.revenue - a.revenue
      ),
      orderDistribution,
      productPerformance: [...productTotals.values()]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 20),
    });
  } catch (error) {
    console.error("Failed to load admin analytics:", error);
    res.status(500).json({ message: "Unable to load analytics." });
  }
});

module.exports = router;
