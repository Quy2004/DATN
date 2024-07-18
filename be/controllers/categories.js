import Category from "../models/CategoryModel.js";

class CategoryController {
  // Get/category
  async getAllCategory(req, res) {
    try {
      const categories = await Category.find({});
      res.status(200).json({
        message: "Get Category Done",
        data: categories,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
  // Get Category Detail
  async getCategoryDetails(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({
          message: "Category Not Found",
        });
      }
      res.status(200).json({
        message: "Get Category Details Done",
        data: category,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  // Create Category
  async createCategory(req, res) {
    try {
      const category = await Category.create(req.body);
      res.status(201).json({
        message: "Create Category Successfully!!!",
        data: category,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  // Update Category
  async updateCategory(req, res) {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );
      if (!category) {
        return res.status(404).json({
          message: "Category Not Found",
        });
      }
      res.status(200).json({
        message: "Update Category DOne",
        data: category,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  // Delete Category
  async deleteCategory(req, res) {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      if (!category) {
        return res.status(404).json({
          message: "Category Not Found",
        });
      }
      res.status(200).json({
        message: "Delete Categogy Successfully!!!",
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
}

export default CategoryController;
