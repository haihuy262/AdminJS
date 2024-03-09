import express from 'express';
import AdminJS from 'adminjs';
import { buildAuthenticatedRouter } from '@adminjs/express';

import provider from './admin/auth-provider.js';
import options from './admin/options.js';
import initializeDb from './db/index.js';
import Product from './admin/product.entity.js';
import bodyParser from 'body-parser';

const port = process.env.PORT || 3000;

const start = async () => {
  const app = express();
  app.use(express.json());
  await initializeDb();

  const admin = new AdminJS(options);

  if (process.env.NODE_ENV === 'production') {
    await admin.initialize();
  } else {
    admin.watch();
  }

  const router = buildAuthenticatedRouter(
    admin,
    {
      cookiePassword: process.env.COOKIE_SECRET,
      cookieName: 'adminjs',
      provider,
    },
    null,
    {
      secret: process.env.COOKIE_SECRET,
      saveUninitialized: true,
      resave: true,
    }
  );
  app.use(admin.options.rootPath, router);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Tạo endpoint để xử lý yêu cầu POST từ AdminJS
  app.post('/api/resources/Product/actions/new', async (req, res) => {
    try {
      const { name, price, brand } = req.body;
      // Tạo một bản ghi mới sử dụng model Product
      const newProduct = await Product.create({ name, price, brand });
      // Trả về thông tin về bản ghi mới đã được tạo
      res.status(201).json({ message: 'Product created successfully', data: newProduct });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Error creating product', error: error.message });
    }
  });

  // Tạo endpoint để xử lý yêu cầu GET từ AdminJS
  app.get('/api/resources/:resourceId/actions/list', async (req, res) => {
    try {
      const resourceId = req.params.resourceId;

      // Truy vấn cơ sở dữ liệu để lấy danh sách các bản ghi của resource có ID là resourceId
      const productList = await Product.find({ _id: resourceId });

      // Trả về danh sách các bản ghi
      res.status(200).json({ message: 'Product list retrieved successfully', data: productList });
    } catch (error) {
      console.error('Error retrieving product list:', error);
      res.status(500).json({ message: 'Error retrieving product list', error: error.message });
    }
  });

  // Tạo endpoint để lấy danh sách sản phẩm
  app.get('/api/products', async (req, res) => {
    try {
      const productList = await Product.find();
      res.status(200).json({ message: 'Product list retrieved successfully', data: productList });
    } catch (error) {
      console.error('Error retrieving product list:', error);
      res.status(500).json({ message: 'Error retrieving product list', error: error.message });
    }
  });

  // Tạo endpoint để cập nhật bản ghi của tài nguyên
  app.put('/api/resources/Product/records/:recordId/edit', async (req, res) => {
    try {
      // const resourceId = req.params.resourceId;
      const recordId = req.params.recordId;
      const updateData = req.body; // Dữ liệu cập nhật được gửi từ client

      // Cập nhật bản ghi trong cơ sở dữ liệu
      const updatedRecord = await Product.findByIdAndUpdate(recordId, updateData, { new: true });

      // Trả về thông tin về bản ghi đã được cập nhật
      res.status(200).json({ message: 'Record updated successfully', data: updatedRecord });
    } catch (error) {
      console.error('Error updating record:', error);
      res.status(500).json({ message: 'Error updating record', error: error.message });
    }
  });

  // Tạo endpoint để xóa bản ghi của tài nguyên
  app.delete('/api/resources/Product/records/:recordId/delete', async (req, res) => {
    try {
      // const resourceId = req.params.resourceId;
      const recordId = req.params.recordId;

      // Xóa bản ghi từ cơ sở dữ liệu
      await Product.findByIdAndDelete(recordId);

      // Trả về thông báo xác nhận
      res.status(200).json({ message: 'Record deleted successfully' });
    } catch (error) {
      console.error('Error deleting record:', error);
      res.status(500).json({ message: 'Error deleting record', error: error.message });
    }
  });

  app.listen(port, () => {
    console.log(`AdminJS available at http://localhost:${port}${admin.options.rootPath}`);
  });
};

start();
