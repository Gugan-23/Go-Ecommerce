const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(
  'mongodb+srv://vgugan16:gugan2004@cluster0.qyh1fuo.mongodb.net/authdb?retryWrites=true&w=majority&appName=Cluster0',
  { useNewUrlParser: true, useUnifiedTopology: true }
)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Root Test Route
app.get('/', (req, res) => {
  res.send('✅ Payment API is live!');
});

// Order Schema
// Updated Order Schema
const orderSchema = new mongoose.Schema({
  userID: String,  // Case-sensitive match to your "userID" field
  name: String,
  description: String,
  price: Number,
  imageurl: String,
  status: { type: String, default: "Pending" }, // Match case "Pending"
  paymentmethod: { type: String, default: "" }
}, { timestamps: true }); // Adds createdAt and updatedAt

const Order = mongoose.model('Order', orderSchema);

// Updated Payment Endpoint
app.post('/api/store-payment', async (req, res) => {
  try {
    const { orderId } = req.body; // This should be the _id from MongoDB

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "Invalid Order ID format" });
    }

    // Find and update using _id
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(orderId) },
      { $set: { status: "Paid" } }, // Update to "Paid" with capital P
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order status updated to Paid",
      order: updatedOrder
    });

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API: Fetch Orders (For Frontend)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// API: Fetch User Profile (Dummy for this example)
app.get('/api/user/profile', (req, res) => {
  // Dummy profile data
  res.json({
    _id: '12345',
    username: 'pranaesh',
    role: 'customer'
  });
});
app.get('/bill/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findOne({ id: orderId });

  if (!order || order.status.toLowerCase() !== 'paid') {
    return res.status(404).send("<h3>No paid bill found for this order.</h3>");
  }

  res.send(`
    <h2>🧾 Bill for Order ID: ${orderId}</h2>
    <p><strong>Name:</strong> ${order.name}</p>
    <p><strong>Description:</strong> ${order.description}</p>
    <p><strong>Amount Paid:</strong> ₹${order.price.toFixed(2)}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
  `);
});
const { ObjectId } = require('mongodb');

app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ _id: new ObjectId(req.params.orderId) });
    console.log(order)
    if (!order) return res.status(404).json({ error: "Order not found" });

    res.setHeader('Content-Type', 'application/json');
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
